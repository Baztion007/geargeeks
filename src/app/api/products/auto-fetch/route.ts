import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/products/auto-fetch
 *
 * Takes a list of Amazon URLs or ASINs and extracts FULL structured product data
 * using a HYBRID strategy:
 *
 *   1. Try page_reader on multiple Amazon URL formats (desktop /dp/, /gp/product/,
 *      mobile /gp/aw/d/) — usually at least one returns the full product page.
 *   2. REGEX extraction for structured fields (title, brand, image, price, rating,
 *      ratingCount, features) — reliable, fast, and works on the raw HTML.
 *   3. Run multiple web_search queries with different angles (specs, review,
 *      alternatives) for additional context.
 *   4. Feed regex-extracted data + search snippets + alt page content to the Z.AI
 *      LLM which REASONS about editorial fields (overview/whoIsItFor/
 *      whoShouldSkip/bestFor/pros/cons) using product knowledge.
 *
 * Returns a "preview" payload (does NOT persist to DB).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inputs } = body;

    if (!Array.isArray(inputs) || inputs.length === 0) {
      return NextResponse.json({ error: 'No inputs provided. Send { inputs: ["url1", "asin2", ...] }' }, { status: 400 });
    }

    if (inputs.length > 20) {
      return NextResponse.json({ error: 'Maximum 20 products per auto-fetch batch (to keep response times reasonable).' }, { status: 400 });
    }

    const ZAIModule = await import('z-ai-web-dev-sdk');
    const ZAI = (ZAIModule as { default: { create: () => Promise<ZaiClient> } }).default;
    const zai = await ZAI.create();

    const results: AutoFetchResult[] = [];

    for (const rawInput of inputs) {
      const input = String(rawInput).trim();
      if (!input) continue;

      const asin = extractAsin(input);
      if (!asin) {
        results.push({ input, success: false, error: 'Could not extract ASIN. Provide an Amazon /dp/ URL, /gp/product/ URL, or a 10-char ASIN.' });
        continue;
      }

      try {
        // ── Step 1: Try fetching Amazon via multiple URL formats ──────────────
        const amazonUrls = [
          input.startsWith('http') ? input.split('?')[0] : `https://www.amazon.com/dp/${asin}`,
          `https://www.amazon.com/gp/product/${asin}`,
          `https://www.amazon.com/gp/aw/d/${asin}`, // mobile
        ];

        let amazonHtml = '';
        let amazonTitle = '';
        let amazonBlocked = true;
        for (const url of amazonUrls) {
          try {
            const pageResult = await zai.functions.invoke('page_reader', { url });
            const pageData = (pageResult as { data?: PageData })?.data;
            const html = pageData?.html || '';
            const title = pageData?.title || '';
            if (html.length > 10000 && !isBlockedPage(html, title)) {
              amazonHtml = html;
              amazonTitle = title;
              amazonBlocked = false;
              break;
            }
            // Save the first non-empty result even if blocked-looking, as fallback
            if (!amazonHtml && html.length > 500) {
              amazonHtml = html;
              amazonTitle = title;
            }
          } catch {
            // try next URL
          }
        }

        // ── Step 2: REGEX extraction from Amazon HTML ────────────────────────
        const regexFields = amazonHtml ? extractWithRegex(amazonHtml, amazonTitle, asin) : null;

        // ── Step 3: Run multiple web searches with different angles ──────────
        const searchQueries = [
          `${asin} specs features`,
          `"${asin}" review pros cons`,
          `${asin} ${regexFields?.title || ''} best for who should buy`,
        ].filter(q => !q.includes('undefined'));

        let searchSnippets = '';
        const allSearchResults: SearchResult[] = [];
        for (const q of searchQueries) {
          try {
            const searchRes = await zai.functions.invoke('web_search', { query: q, num: 5 });
            const arr = (searchRes as SearchResult[]) || [];
            allSearchResults.push(...arr);
          } catch {
            // continue
          }
        }

        // Dedupe by URL and build snippets text
        const seenUrls = new Set<string>();
        const deduped = allSearchResults.filter(r => {
          if (seenUrls.has(r.url)) return false;
          seenUrls.add(r.url);
          return true;
        });
        searchSnippets = deduped
          .map(r => `- ${r.name} (${r.host_name}): ${r.snippet}`)
          .join('\n')
          .slice(0, 5000);

        // ── Step 4: If Amazon blocked, page_reader on best non-Amazon result ─
        let altPageHtml = '';
        let altPageTitle = '';
        let altSource = '';
        if (amazonBlocked) {
          const altResult = deduped.find(r =>
            !r.host_name.includes('amazon.com') &&
            !r.host_name.includes('youtube.com') &&
            !r.host_name.includes('apify') &&
            !r.host_name.includes('canopy') &&
            !r.host_name.includes('pinterest.') &&
            r.url.startsWith('http')
          );
          if (altResult) {
            altSource = altResult.host_name;
            try {
              const altPageResult = await zai.functions.invoke('page_reader', { url: altResult.url });
              const altPageData = (altPageResult as { data?: PageData })?.data;
              altPageHtml = altPageData?.html || '';
              altPageTitle = altPageData?.title || '';
            } catch {
              // continue without alt page
            }
          }
        }

        // ── Step 5: Verify we have SOME content ─────────────────────────────
        const hasContent = amazonHtml.length > 100 || altPageHtml.length > 100 || searchSnippets.length > 50;
        if (!hasContent) {
          results.push({
            input,
            asin,
            success: false,
            error: 'Could not fetch any content for this ASIN. Amazon blocked the request and no alternative sources were found.',
          });
          continue;
        }

        // ── Step 6: LLM extraction for editorial fields (uses regex data) ────
        const editorial = await extractEditorialWithLLM(zai, {
          asin,
          title: regexFields?.title || amazonTitle || '',
          brand: regexFields?.brand || '',
          features: regexFields?.features || [],
          price: regexFields?.price || '',
          rating: regexFields?.rating || 0,
          ratingCount: regexFields?.ratingCount || 0,
          searchSnippets,
          altPageTitle,
          altPageHtml: altPageHtml.slice(0, 8000),
          altSource,
        });

        // Merge: regex fields (authoritative for structured data) + LLM editorial fields
        const title = regexFields?.title || amazonTitle || editorial.title || `${asin} Product`;
        const image = regexFields?.image || editorial.image || `https://images-na.ssl-images-amazon.com/images/P/${asin}`;
        const sourceLabel = amazonBlocked
          ? (altSource ? `AI-extracted from ${altSource} + search` : 'AI-extracted from search')
          : 'Amazon page (regex + AI)';

        results.push({
          input,
          asin,
          success: true,
          blocked: amazonBlocked,
          source: sourceLabel,
          title,
          brand: regexFields?.brand || editorial.brand || '',
          image,
          price: regexFields?.price || editorial.price || '',
          rating: regexFields?.rating || editorial.rating || 0,
          ratingCount: regexFields?.ratingCount || editorial.ratingCount || 0,
          features: regexFields?.features || editorial.features || [],
          description: editorial.description || '',
          overview: editorial.overview || editorial.description || '',
          whoIsItFor: editorial.whoIsItFor || '',
          whoShouldSkip: editorial.whoShouldSkip || '',
          bestFor: editorial.bestFor || [],
          pros: editorial.pros || [],
          cons: editorial.cons || [],
          categoryGuess: editorial.categoryGuess || '',
          warning: amazonBlocked
            ? `Amazon blocked direct access. Product data was AI-reconstructed from web search${altSource ? ` and ${altSource}` : ''} — verify details before publishing.`
            : undefined,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({ input, asin, success: false, error: `Fetch failed: ${msg}` });
      }
    }

    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      message: `Auto-fetched ${succeeded} of ${inputs.length} products${failed > 0 ? ` (${failed} failed)` : ''}`,
      results,
      summary: { total: inputs.length, succeeded, failed },
    }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    console.error('Auto-fetch error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Auto-fetch failed: ${msg}` }, { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } });
  }
}

// ── Types ───────────────────────────────────────────────────────────────────

interface ZaiClient {
  functions: {
    invoke: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  };
  chat: {
    completions: {
      create: (opts: {
        messages: { role: string; content: string }[];
        thinking?: { type: string };
      }) => Promise<{ choices: { message: { content: string } }[] }>;
    };
  };
}

interface PageData {
  title?: string;
  html?: string;
  url?: string;
}

interface SearchResult {
  url: string;
  name: string;
  snippet: string;
  host_name: string;
}

interface RegexFields {
  title: string;
  brand: string;
  image: string;
  price: string;
  rating: number;
  ratingCount: number;
  features: string[];
  description: string;
}

interface EditorialFields {
  title?: string;
  brand?: string;
  image?: string;
  price?: string;
  rating?: number;
  ratingCount?: number;
  features?: string[];
  description?: string;
  overview?: string;
  whoIsItFor?: string;
  whoShouldSkip?: string;
  bestFor?: string[];
  pros?: string[];
  cons?: string[];
  categoryGuess?: string;
}

interface AutoFetchResult {
  input: string;
  asin?: string;
  success: boolean;
  blocked?: boolean;
  source?: string;
  title?: string;
  brand?: string;
  image?: string;
  price?: string;
  rating?: number;
  ratingCount?: number;
  features?: string[];
  description?: string;
  overview?: string;
  whoIsItFor?: string;
  whoShouldSkip?: string;
  bestFor?: string[];
  pros?: string[];
  cons?: string[];
  categoryGuess?: string;
  warning?: string;
  error?: string;
}

// ── ASIN extraction ─────────────────────────────────────────────────────────

function extractAsin(input: string): string | null {
  const trimmed = input.trim();
  if (/^B[A-Z0-9]{9}$/.test(trimmed)) return trimmed;

  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /\/ASIN\/([A-Z0-9]{10})/i,
    /[?&]asin=([A-Z0-9]{10})/i,
  ];
  for (const p of patterns) {
    const m = trimmed.match(p);
    if (m) return m[1].toUpperCase();
  }
  const m = trimmed.match(/\b(B[A-Z0-9]{9})\b/i);
  return m ? m[1].toUpperCase() : null;
}

function isBlockedPage(html: string, title: string): boolean {
  return (
    /captcha|robot check|automated access|api-unauthorized|Type the characters/i.test(html) ||
    /503|service unavailable|server error/i.test(title) ||
    /^(amazon\.com|robot check|are you human)/i.test(title.trim()) ||
    (html.length < 4000 && /api-services-support@amazon\.com|Marketplace APIs/i.test(html))
  );
}

// ── REGEX extraction (reliable structured fields from Amazon HTML) ──────────

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .trim();
}

function extractWithRegex(html: string, pageTitle: string, asin: string): RegexFields | null {
  if (!html) return null;

  // ── Title: prefer <title> tag, clean it up ────────────────────────────────
  let title = pageTitle || '';
  if (!title) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    title = titleMatch ? decodeEntities(titleMatch[1]) : '';
  }
  // Strip "Amazon.com: " prefix and " : Kindle Store" suffix
  title = title
    .replace(/^Amazon\.com\s*[:\-]\s*/i, '')
    .replace(/\s*[:|]\s*(Amazon\.com|Kindle Store|Online Shopping).*$/i, '')
    .trim();

  // ── Brand: bylineInfo link ────────────────────────────────────────────────
  let brand = '';
  const bylineMatch = html.match(/<a[^>]*id="bylineInfo"[^>]*>(?:Visit the\s+)?([^<]+?)(?:\s+Store)?<\/a>/i);
  if (bylineMatch) {
    brand = decodeEntities(bylineMatch[1]).trim();
    // "Brand: Amazon" → "Amazon"
    brand = brand.replace(/^Brand:\s*/i, '');
  }
  // Fallback: "Visit the X Store" pattern
  if (!brand) {
    const visitStoreMatch = html.match(/Visit the\s+<a[^>]*>([^<]+)<\/a>\s+Store/i);
    if (visitStoreMatch) brand = decodeEntities(visitStoreMatch[1]).trim();
  }
  // Fallback: JSON-LD brand
  if (!brand) {
    const brandJsonMatch = html.match(/"brand"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"/i);
    if (brandJsonMatch) brand = brandJsonMatch[1];
  }

  // ── Image: landingImage, data-old-hires, or colorImages initial ───────────
  let image = '';
  const landingImage = html.match(/<img[^>]*id="landingImage"[^>]*src="([^"]+)"/i);
  if (landingImage) image = landingImage[1];
  if (!image || image.includes('transparent-pixel') || image.includes('no-img')) {
    const oldHires = html.match(/<img[^>]*data-old-hires="([^"]+)"/i);
    if (oldHires) image = oldHires[1];
  }
  if (!image || image.includes('transparent-pixel')) {
    const colorImages = html.match(/'colorImages'[^}]*'initial'[^}]*'hiRes'\s*:\s*'([^']+)'/i);
    if (colorImages) image = colorImages[1];
  }
  if (!image) {
    const ogImage = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
    if (ogImage) image = ogImage[1];
  }

  // ── Price: a-price > a-offscreen ──────────────────────────────────────────
  let price = '';
  const priceMatch = html.match(/<span[^>]*class="a-price[^"]*"[^>]*>[\s\S]*?<span[^>]*class="a-offscreen"[^>]*>([^<]+)<\/span>/i);
  if (priceMatch) {
    price = decodeEntities(priceMatch[1]).replace(/[^0-9.]/g, '');
  }
  if (!price) {
    const priceMatch2 = html.match(/<span[^>]*id="priceblock_ourprice"[^>]*>([^<]+)<\/span>/i)
      || html.match(/<span[^>]*id="priceblock_saleprice"[^>]*>([^<]+)<\/span>/i)
      || html.match(/<span[^>]*id="priceblock_dealprice"[^>]*>([^<]+)<\/span>/i);
    if (priceMatch2) price = decodeEntities(priceMatch2[1]).replace(/[^0-9.]/g, '');
  }

  // ── Rating: look for the MAIN product rating (not "compare similar items") ─
  // The main rating appears in:
  //   1. data-hook="rating-out-of-text" span (most reliable)
  //   2. <i class="a-icon a-icon-star a-star-X-Y"> (note: NOT a-icon-star-mini)
  //   3. average rating JSON-LD / data attribute
  let rating = 0;
  // (1) data-hook rating-out-of-text — the canonical main rating span
  const ratingHookMatch = html.match(/<span[^>]*data-hook="rating-out-of-text"[^>]*>\s*(\d+\.\d+)\s*out of\s*5/i);
  if (ratingHookMatch) rating = Number(ratingHookMatch[1]);
  // (2) Full-size star icon (not mini — mini is from "compare similar items")
  if (!rating) {
    const fullStarMatch = html.match(/<i[^>]*class="a-icon\s+a-icon-star(?:\s+a-star-[\d-]+)?"[^>]*>\s*<span[^>]*class="a-icon-alt"[^>]*>\s*(\d+\.\d+)\s*out of\s*5\s*stars/i);
    if (fullStarMatch) rating = Number(fullStarMatch[1]);
  }
  // (3) Look for the rating near the reviews section (id="averageCustomerReviews")
  if (!rating) {
    const reviewsSection = html.match(/<div[^>]*id="averageCustomerReviews"[^>]*>([\s\S]{0,3000})/i);
    if (reviewsSection) {
      const sectionRating = reviewsSection[1].match(/(\d+\.\d+)\s*out of\s*5/i);
      if (sectionRating) rating = Number(sectionRating[1]);
    }
  }
  // (4) Fallback: "average rating" JSON-LD pattern
  if (!rating) {
    const avgMatch = html.match(/"ratingValue"\s*:\s*(\d+\.?\d*)/i)
      || html.match(/average[^a-zA-Z]{0,50}(\d+\.\d+)/i);
    if (avgMatch) {
      const r = Number(avgMatch[1]);
      if (r >= 1 && r <= 5) rating = r;
    }
  }
  // Sanity check: ratings should be 1.0-5.0
  if (rating < 1 || rating > 5) rating = 0;

  // ── Rating count: acrCustomerReviewText (may have parens) ─────────────────
  let ratingCount = 0;
  // Pattern: <span id="acrCustomerReviewText"...>(16,926)</span> OR "16,926 ratings"
  const ratingCountMatch = html.match(/<span[^>]*id="acrCustomerReviewText"[^>]*>\s*\(?([\d,]+)\)?\s*(?:ratings?|reviews?)?\s*<\/span>/i);
  if (ratingCountMatch) ratingCount = Number(ratingCountMatch[1].replace(/,/g, ''));
  if (!ratingCount) {
    const ratingCountMatch2 = html.match(/<span[^>]*id="acrCustomerReviewText"[^>]*aria-label="([\d,]+)/i);
    if (ratingCountMatch2) ratingCount = Number(ratingCountMatch2[1].replace(/,/g, ''));
  }
  if (!ratingCount) {
    // Fallback: look for "X ratings" near the reviews section
    const reviewsSection = html.match(/<div[^>]*id="averageCustomerReviews"[^>]*>([\s\S]{0,3000})/i);
    if (reviewsSection) {
      const sectionCount = reviewsSection[1].match(/([\d,]+)\s*(?:global\s*)?ratings?/i);
      if (sectionCount) {
        const n = Number(sectionCount[1].replace(/,/g, ''));
        if (n >= 10 && n <= 10_000_000) ratingCount = n;
      }
    }
  }
  if (!ratingCount) {
    // Last-resort fallback: look for JSON-LD reviewCount
    const jsonLdCount = html.match(/"reviewCount"\s*:\s*(\d+)/i)
      || html.match(/"ratingCount"\s*:\s*(\d+)/i);
    if (jsonLdCount) {
      const n = Number(jsonLdCount[1]);
      if (n >= 10 && n <= 10_000_000) ratingCount = n;
    }
  }

  // ── Features: #feature-bullets .a-list-item ───────────────────────────────
  const features: string[] = [];
  const featureSection = html.match(/<div[^>]*id="feature-bullets"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i)
    || html.match(/<div[^>]*id="feature-bullets"[^>]*>([\s\S]*?)<\/div>/i);
  if (featureSection) {
    const bulletMatches = featureSection[1].match(/<span[^>]*class="a-list-item"[^>]*>([\s\S]*?)<\/span>/gi) || [];
    for (const bullet of bulletMatches) {
      const text = decodeEntities(bullet.replace(/<[^>]+>/g, '')).trim();
      // Skip empty, "Make sure this fits", and very short
      if (text && text.length > 10 && !/make sure this fits/i.test(text) && !text.startsWith('»')) {
        features.push(text.slice(0, 300));
      }
      if (features.length >= 8) break;
    }
  }

  // ── Description: #productDescription ──────────────────────────────────────
  let description = '';
  const descMatch = html.match(/<div[^>]*id="productDescription"[^>]*>([\s\S]*?)<\/div>/i);
  if (descMatch) {
    description = decodeEntities(descMatch[1].replace(/<[^>]+>/g, '')).trim().slice(0, 500);
  }
  // Fallback: meta description
  if (!description) {
    const metaDesc = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)
      || html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i);
    if (metaDesc) description = decodeEntities(metaDesc[1]).slice(0, 500);
  }

  return {
    title: title || `${asin} Product`,
    brand,
    image,
    price,
    rating,
    ratingCount,
    features,
    description,
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Use the Z.AI LLM to REASON about editorial fields (overview, whoIsItFor,
 * whoShouldSkip, bestFor, pros, cons, categoryGuess) using the structured
 * data we already extracted via regex + any web search snippets.
 *
 * The LLM does NOT re-extract title/price/rating (those come from regex).
 * It only fills in editorial/reasoned fields based on product knowledge.
 */
async function extractEditorialWithLLM(zai: ZaiClient, content: {
  asin: string;
  title: string;
  brand: string;
  features: string[];
  price: string;
  rating: number;
  ratingCount: number;
  searchSnippets: string;
  altPageTitle: string;
  altPageHtml: string;
  altSource: string;
}): Promise<EditorialFields> {
  const altText = content.altPageHtml ? stripHtml(content.altPageHtml).slice(0, 3000) : '';

  const systemPrompt = `You are a senior product reviewer for GearGeekz, an e-commerce affiliate gear-review site.
You are given a product's structured data (already extracted from Amazon) plus optional web search snippets and review-page content.
Your job is to REASON about editorial fields that aren't directly on Amazon — write them in GearGeekz's expert, honest, helpful voice.

Return ONLY a valid JSON object with these fields (use empty string "" or [] ONLY if you truly cannot determine a value — for most products you should be able to write all fields):

{
  "description": "2-4 sentences (max 500 chars) summarizing what the product is and does — based on title/features/category",
  "overview": "A 3-5 sentence editorial overview paragraph (max 700 chars) introducing the product, its category, target user, and key value proposition. Be informative, not salesy.",
  "whoIsItFor": "2-3 sentences (max 300 chars) describing the ideal user/buyer. Be specific about use cases and user types.",
  "whoShouldSkip": "2-3 sentences (max 300 chars) describing who should NOT buy this — pain points, deal-breakers, or alternative needs.",
  "bestFor": ["3-6 short tags (max 40 chars each) describing ideal use cases — e.g. 'Commuters', 'Travelers', 'Budget readers', 'Heavy readers'"],
  "pros": ["3-6 short, punchy pros (max 80 chars each) — extract from features/reviews or reason from product category"],
  "cons": ["2-4 honest cons (max 80 chars each) — reason from category, price, known limitations, or what's missing"],
  "categoryGuess": "A broad product category — pick the closest from: 'Audio', 'Computers', 'Kitchen', 'Outdoor', 'Fitness', 'Photography', 'Wearables', 'Power', 'Bags', 'Gaming', 'Home Theater', 'Tools', 'Mobile', 'Travel Gear', 'Travel Gadgets', 'Home & Office', 'Electronics', 'Luggage', 'E-readers', 'Smart Home'"
}

Rules:
- Output ONLY the JSON object. No markdown fences, no explanation, no text before or after.
- CRITICAL: All string values must be valid JSON strings — escape all double quotes as \\", backslashes as \\\\, and newlines as \\\\n. Do NOT use any unescaped quotes inside string values.
- Keep string values on a SINGLE LINE — do not include literal newlines inside any string value.
- For description: use Amazon's product description if it's in the snippets; otherwise summarize from features.
- For editorial fields (overview, whoIsItFor, whoShouldSkip, bestFor, pros, cons): WRITE them yourself based on the product's title, features, brand, and category. Be specific and useful, not generic. These are what GearGeekz readers actually read.
- For pros/cons, be honest and balanced — every product has cons. Reason from category knowledge if review data isn't available.
- For categoryGuess: pick the SINGLE best match from the listed categories.`;

  const contentParts: string[] = [];
  contentParts.push(`Product data (already extracted from Amazon):`);
  contentParts.push(`  ASIN: ${content.asin}`);
  if (content.title) contentParts.push(`  Title: ${content.title}`);
  if (content.brand) contentParts.push(`  Brand: ${content.brand}`);
  if (content.price) contentParts.push(`  Price: $${content.price}`);
  if (content.rating) contentParts.push(`  Rating: ${content.rating} / 5 (${content.ratingCount} ratings)`);
  if (content.features.length > 0) {
    contentParts.push(`  Features:`);
    content.features.forEach((f, i) => contentParts.push(`    ${i + 1}. ${f}`));
  }
  if (content.searchSnippets) {
    contentParts.push('');
    contentParts.push(`Web search results (additional context):`);
    contentParts.push(content.searchSnippets);
  }
  if (content.altSource) {
    contentParts.push('');
    contentParts.push(`Review/retail page from ${content.altSource}:`);
    if (content.altPageTitle) contentParts.push(`  Title: ${content.altPageTitle}`);
    if (altText) contentParts.push(`  Content: ${altText.slice(0, 2500)}`);
  }

  const userPrompt = `Reason about the editorial fields for this product. Return the JSON object.\n\n${contentParts.join('\n')}`;

  try {
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      thinking: { type: 'disabled' },
    });

    const responseContent = completion.choices[0]?.message?.content || '';
    const parsed = parseLenientJson(responseContent) as EditorialFields;

    const toString = (v: unknown, max: number): string | undefined => {
      if (typeof v !== 'string') return undefined;
      const s = v.trim();
      return s ? s.slice(0, max) : undefined;
    };
    const toStringArr = (v: unknown, max: number, limit: number): string[] => {
      if (!Array.isArray(v)) return [];
      return v
        .filter(f => typeof f === 'string' && f.trim())
        .map(f => String(f).trim().slice(0, max))
        .slice(0, limit);
    };

    return {
      description: toString(parsed.description, 600),
      overview: toString(parsed.overview, 800),
      whoIsItFor: toString(parsed.whoIsItFor, 400),
      whoShouldSkip: toString(parsed.whoShouldSkip, 400),
      bestFor: toStringArr(parsed.bestFor, 60, 6),
      pros: toStringArr(parsed.pros, 120, 6),
      cons: toStringArr(parsed.cons, 120, 6),
      categoryGuess: toString(parsed.categoryGuess, 60),
    };
  } catch (err) {
    console.error('LLM editorial extraction failed for ASIN', content.asin, err instanceof Error ? err.message : String(err));
    return {};
  }
}

/**
 * Parse LLM output that may contain markdown fences, prose around JSON, or
 * malformed JSON (unescaped quotes/newlines). Strategy:
 *   1. Strip markdown code fences
 *   2. Find the first { to the last } — that's our JSON object
 *   3. Try JSON.parse
 *   4. If that fails, fall back to per-field regex extraction
 */
function parseLenientJson(raw: string): Record<string, unknown> {
  if (!raw) return {};
  // Step 1: strip markdown fences
  let s = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  // Step 2: extract first { to last }
  const firstBrace = s.indexOf('{');
  const lastBrace = s.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return {};
  s = s.slice(firstBrace, lastBrace + 1);

  // Step 3: try strict parse
  try {
    return JSON.parse(s);
  } catch {
    // continue to fallback
  }

  // Step 4: per-field regex extraction (handles malformed JSON)
  const result: Record<string, unknown> = {};

  // String fields: "field": "value"
  const stringFields = ['description', 'overview', 'whoIsItFor', 'whoShouldSkip', 'categoryGuess'];
  for (const field of stringFields) {
    // Match "field": "..." — handle escaped quotes inside value
    const re = new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*?)"`, 'i');
    const m = s.match(re);
    if (m) {
      // Unescape
      result[field] = m[1]
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\\\/g, '\\')
        .replace(/\\'/g, "'");
    }
  }

  // Array fields: "field": ["a", "b", "c"]
  const arrayFields = ['bestFor', 'pros', 'cons', 'features'];
  for (const field of arrayFields) {
    const arrRe = new RegExp(`"${field}"\\s*:\\s*\\[([\\s\\S]*?)\\]`, 'i');
    const arrMatch = s.match(arrRe);
    if (arrMatch) {
      const inner = arrMatch[1];
      // Extract all "..." strings from the array
      const items: string[] = [];
      const itemRe = /"(?:[^"\\]|\\.)*?"/g;
      const itemMatches = inner.match(itemRe) || [];
      for (const item of itemMatches) {
        // Strip surrounding quotes and unescape
        const unquoted = item.slice(1, -1)
          .replace(/\\"/g, '"')
          .replace(/\\n/g, '\n')
          .replace(/\\\\/g, '\\')
          .replace(/\\'/g, "'");
        if (unquoted.trim()) items.push(unquoted);
      }
      if (items.length > 0) result[field] = items;
    }
  }

  return result;
}
