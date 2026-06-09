import { NextRequest, NextResponse } from 'next/server';
import { products, getProductBySlug, getProductsByCategory } from '@/data/products';
import { categories, getCategoryBySlug } from '@/data/categories';

export const runtime = 'edge';

interface GearFinderRequest {
  category: string;
  useCase: string;
  priority: string;
  brandPreference?: string;
}

interface GearFinderRecommendation {
  productSlug: string;
  matchScore: number;
  explanation: string;
  label: string;
}

// Priority keyword map for matching
const priorityKeywordMap: Record<string, string[]> = {
  performance: ['performance', 'power', 'speed', 'fast', 'high-end', 'premium', 'pro', 'flagship'],
  portability: ['portable', 'lightweight', 'compact', 'travel', 'mini', 'slim', 'carry-on'],
  durability: ['durable', 'rugged', 'water-resistant', 'military', 'tough', 'weather', 'robust'],
  value: ['value', 'affordable', 'budget', 'reliable', 'essential', 'practical'],
  design: ['design', 'premium', 'elegant', 'sleek', 'aesthetic', 'beautiful', 'refined'],
};

function calculateMatchScore(
  product: (typeof products)[0],
  answers: GearFinderRequest
): number {
  let score = 0;
  let maxScore = 0;

  // Category match (40 points)
  maxScore += 40;
  if (product.categorySlug === answers.category) {
    score += 40;
  }

  // Use case match via bestFor (25 points)
  maxScore += 25;
  const useCaseLower = answers.useCase.toLowerCase();
  const bestForMatch = product.bestFor.some(
    (bf) =>
      bf.toLowerCase().includes(useCaseLower) ||
      useCaseLower.includes(bf.toLowerCase())
  );
  if (bestForMatch) {
    score += 25;
  } else {
    const tagsMatch = product.tags.some(
      (t) =>
        t.toLowerCase().includes(useCaseLower) ||
        useCaseLower.includes(t.toLowerCase())
    );
    if (tagsMatch) {
      score += 15;
    }
  }

  // Priority alignment (20 points)
  maxScore += 20;
  const priorityKeywords = priorityKeywordMap[answers.priority] || [];
  const productText =
    `${product.title} ${product.excerpt} ${product.tags.join(' ')} ${product.bestFor.join(' ')}`.toLowerCase();
  const priorityHits = priorityKeywords.filter((kw) =>
    productText.includes(kw)
  ).length;
  score += Math.min(20, priorityHits * 7);

  // Brand preference (15 points)
  maxScore += 15;
  if (answers.brandPreference && answers.brandPreference !== 'any') {
    if (product.brandSlug === answers.brandPreference) {
      score += 15;
    }
  } else {
    score += 15; // No preference = neutral
  }

  // Rating bonus (up to 10 points)
  maxScore += 10;
  score += (product.rating / 5) * 10;

  return Math.round((score / maxScore) * 100);
}

function generateLocalExplanation(
  product: (typeof products)[0],
  answers: GearFinderRequest,
  _score: number
): string {
  const parts: string[] = [];

  // Category match
  if (product.categorySlug === answers.category) {
    const cat = getCategoryBySlug(answers.category);
    parts.push(
      `Perfect category match — this product is in ${cat?.name || answers.category}`
    );
  }

  // Use case
  const useCaseMatch = product.bestFor.some(
    (bf) =>
      bf.toLowerCase().includes(answers.useCase.toLowerCase()) ||
      answers.useCase.toLowerCase().includes(bf.toLowerCase())
  );
  if (useCaseMatch) {
    parts.push(
      `Great for ${answers.useCase.toLowerCase()} — it's specifically recommended for this use case`
    );
  }

  // Priority
  const priorityLabels: Record<string, string> = {
    performance: 'high performance',
    portability: 'portability',
    durability: 'durability',
    value: 'value for money',
    design: 'design and aesthetics',
  };
  parts.push(
    `Aligns with your priority of ${priorityLabels[answers.priority] || answers.priority}`
  );

  // Brand
  if (
    answers.brandPreference &&
    answers.brandPreference !== 'any' &&
    product.brandSlug === answers.brandPreference
  ) {
    parts.push(`Made by your preferred brand, ${product.brand}`);
  }

  // Rating
  if (product.rating >= 4.5) {
    parts.push(`Highly rated at ${product.rating}/5 by our expert reviewers`);
  }

  return parts.join('. ') + '.';
}

export async function POST(request: NextRequest) {
  try {
    const body: GearFinderRequest = await request.json();

    if (!body.category || !body.useCase || !body.priority) {
      return NextResponse.json(
        { error: 'Missing required fields: category, useCase, priority' },
        { status: 400 }
      );
    }

    // Get products in the selected category
    const categoryProducts = getProductsByCategory(body.category);

    if (categoryProducts.length === 0) {
      // Fall back to all products if category has none
      const allProducts = products;
      const scored = allProducts
        .map((p) => ({
          product: p,
          score: calculateMatchScore(p, body),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      const recommendations: GearFinderRecommendation[] = scored.map((item, idx) => ({
        productSlug: item.product.slug,
        matchScore: Math.min(99, Math.max(60, item.score)),
        explanation: generateLocalExplanation(item.product, body, item.score),
        label: ['Best Match', 'Runner Up', 'Also Consider'][idx],
      }));

      return NextResponse.json({ recommendations });
    }

    // Score and rank products
    const scored = categoryProducts
      .map((p) => ({
        product: p,
        score: calculateMatchScore(p, body),
      }))
      .sort((a, b) => b.score - a.score);

    const top3 = scored.slice(0, 3);

    // Try LLM for personalized explanations
    let recommendations: GearFinderRecommendation[];
    try {
      const ZAISDK = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAISDK.create();
      const productSummaries = top3.map(
        (item) =>
          `Product: ${item.product.title} | Brand: ${item.product.brand} | Rating: ${item.product.rating}/5 | Best For: ${item.product.bestFor.join(', ')} | Key Features: ${Object.entries(item.product.features)
            .slice(0, 3)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ')} | Match Score: ${item.score}%`
      );

      const prompt = `You are a gear recommendation expert for GearGeekz, a premium product review publication. Based on the user's quiz answers and the top matching products, write a brief, personalized explanation (1-2 sentences max) for WHY each product matches their needs. Be specific and helpful, not generic.

User's preferences:
- Category: ${body.category}
- Primary use case: ${body.useCase}
- Top priority: ${body.priority}
${body.brandPreference && body.brandPreference !== 'any' ? `- Brand preference: ${body.brandPreference}` : '- No brand preference'}

Top matching products:
${productSummaries.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Respond ONLY with a JSON array of objects with this format:
[{"productSlug": "slug-here", "explanation": "Your personalized explanation here", "label": "Best Match" | "Runner Up" | "Also Consider"}]

Keep explanations concise (1-2 sentences), conversational, and specific to the user's preferences. Do not mention prices.`;

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content:
              'You are a helpful product recommendation assistant. Always respond with valid JSON only, no markdown formatting.',
          },
          { role: 'user', content: prompt },
        ],
        thinking: { type: 'disabled' },
      });

      const content = completion.choices?.[0]?.message?.content?.trim() || '';

      // Parse LLM response
      let llmRecs: GearFinderRecommendation[] = [];
      try {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          llmRecs = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // LLM response not valid JSON, fall through to local explanations
      }

      if (llmRecs.length === top3.length) {
        recommendations = top3.map((item, idx) => ({
          productSlug: item.product.slug,
          matchScore: Math.min(99, Math.max(60, item.score)),
          explanation: llmRecs[idx]?.explanation || generateLocalExplanation(item.product, body, item.score),
          label: llmRecs[idx]?.label || ['Best Match', 'Runner Up', 'Also Consider'][idx],
        }));
      } else {
        recommendations = top3.map((item, idx) => ({
          productSlug: item.product.slug,
          matchScore: Math.min(99, Math.max(60, item.score)),
          explanation: generateLocalExplanation(item.product, body, item.score),
          label: ['Best Match', 'Runner Up', 'Also Consider'][idx],
        }));
      }
    } catch {
      // LLM failed, use local explanations
      recommendations = top3.map((item, idx) => ({
        productSlug: item.product.slug,
        matchScore: Math.min(99, Math.max(60, item.score)),
        explanation: generateLocalExplanation(item.product, body, item.score),
        label: ['Best Match', 'Runner Up', 'Also Consider'][idx],
      }));
    }

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Gear finder API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
