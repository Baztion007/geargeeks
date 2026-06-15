# GearGeekz Project Worklog

## Project Status: Active & Working
- Next.js 16 app with Turso database (libsql)
- Hash-based SPA routing (Zustand router)
- Admin panel with products, categories, brands, blog management
- Cloudflare Workers deployment via opennextjs-cloudflare

---

## Session: 2026-06-13 (Current)

### Task 1: Fix Preview Not Working
- Dev server was dying repeatedly in the sandbox environment
- Root cause: Process management issue - background processes being killed
- Fix: Used `setsid` + double-fork approach for persistent process
- Agent-browser can only connect via Caddy gateway on port 81 (not directly to localhost:3000)

### Task 2: Fix Brand Creation Bug
**Problem**: Brands created via admin don't appear on website

**Root Causes Identified**:
1. No `Cache-Control` headers on API responses - CDN/browser caching stale data
2. `invalidateBrands()` only reset timestamp but kept stale data in store
3. Loading state guard could prevent re-fetches

**Fixes Applied**:
- Added `Cache-Control: no-store, max-age=0` to all API GET responses (brands, products, categories, blog, health)
- Updated all 4 invalidators in data-store.ts to also clear data array and reset loading state:
  - `invalidateProducts: () => set({ productsFetchedAt: 0, products: [], productsLoading: false })`
  - Same pattern for categories, brands, blogPosts

**Verification**: Created "Razer" brand via admin → navigated to homepage → brand appeared in Featured Brands section immediately

### Task 3: Blog Creation from Admin
- Blog admin already fully implemented with CRUD operations
- BlogContent component supports: create, edit, delete posts
- Form fields: title, slug, category, author, image, excerpt, content, tags
- Auto-slug generation from title
- Verified blog post creation works via API
- Verified new posts appear on public blog page

### Files Modified
- `/src/app/api/brands/route.ts` - Added Cache-Control headers
- `/src/app/api/products/route.ts` - Added Cache-Control headers
- `/src/app/api/categories/route.ts` - Added Cache-Control headers
- `/src/app/api/blog/route.ts` - Added Cache-Control headers
- `/src/app/api/health/route.ts` - Added Cache-Control headers
- `/src/lib/data-store.ts` - Improved invalidation (clear data + reset loading)

### Browser Test Results
- ✅ Homepage loads correctly with all sections
- ✅ Featured Brands shows 12 brands
- ✅ Admin login works (password: geargeekz2026)
- ✅ Admin dashboard shows correct stats (26 products, 8 categories, 12 brands)
- ✅ Brand creation from admin works and reflects on homepage
- ✅ Blog admin shows 5 posts with CRUD
- ✅ Blog page shows posts correctly
- ✅ Lint passes cleanly

### Unresolved Issues
- Dev server process keeps dying in sandbox (process management issue)
- Agent-browser can only reach app via Caddy gateway (port 81), not directly to localhost:3000
- Blog form submission via agent-browser click doesn't always trigger (works via JS eval)
- Cloudflare Workers deployment needs separate testing (brand creation was reported as not reflecting on deployed site)

### Next Steps
- Push changes to Git to trigger Cloudflare Workers deployment
- Verify brand creation reflects on production deployment
- Consider adding a "test brand" flow to the deployed site
- Security: Revoke exposed GitHub token

---

## Session: 2026-06-14 (Current)

### Task: Add Affiliate Link Fields to Admin + Admin Panel Improvements

**User Request**: "On the admin panel where to add the affiliate links for items on the buttons 'View Latest Deal on Amazon' and 'Check Price on Amazon' also what else needs to be improved on the admin panel?"

#### What Was Done

**1. Added Custom Affiliate URL Fields to Product Model**
- Added `affiliateUrl` (String, default "") and `priceUrl` (String, default "") columns to Product table
- Updated Prisma schema with new fields
- Added columns directly to SQLite via ALTER TABLE (Prisma push had issues with SQLite constraints)
- Updated TypeScript `Product` type in `/src/lib/types.ts`
- Updated `ProductItem` interface in AdminSubPages.tsx and AdminPage.tsx
- Updated `parseProduct()` in `/src/lib/data-store.ts` to include new fields
- Updated Products API route (POST/PATCH) to accept and save `affiliateUrl` and `priceUrl`
- Updated allowed fields list in PATCH handler

**2. Added Affiliate Links Section to Admin Product Form**
- New "AFFILIATE LINKS" section in ProductFormModal with:
  - "Custom Affiliate URL" field (overrides "View Latest Deal" button)
  - "Custom Price Check URL" field (overrides "Check Price" button)
  - Green "✓ Custom affiliate URL active" indicator when custom URL is set
  - Auto-generated URL preview when no custom URL is set
  - Helpful description text explaining the override behavior

**3. Updated Affiliate Link Components to Support Custom URLs**
- `CheckPriceButton` now accepts optional `customUrl` prop
- `ViewLatestDealButton` now accepts optional `customUrl` prop
- When `customUrl` is provided, it overrides the auto-generated URL from ASIN + Merchant
- Updated all 7 components that use these buttons:
  - ProductDetailPage.tsx (3 buttons)
  - ProductCard.tsx
  - QuickViewModal.tsx
  - ComparisonTable.tsx
  - ComparePage.tsx (2 instances)
  - BestSellersPage.tsx (2 instances)
  - BlogPostPage.tsx
  - GearFinderQuiz.tsx

**4. Admin Panel Improvements**
- **Duplicate Product** feature: New copy button in product actions row creates a duplicate with "(Copy)" suffix
- **Enhanced Dashboard Stats**: Added secondary stats row showing:
  - Blog Posts count
  - Custom Affiliate Links count
  - Verified Reviews percentage
  - Missing ASIN indicator on Products card
- **Custom Link Badge**: Product table shows "Custom Link" badge when product has custom affiliate URLs
- **Copy icon** added to lucide-react imports

**5. Bug Fix: RatingBreakdownBar null safety**
- Fixed `TypeError: Cannot read properties of undefined (reading 'toFixed')` in RatingBar.tsx
- Added null safety with `(value ?? 0).toFixed(1)`

### Files Modified
- `prisma/schema.prisma` - Added affiliateUrl, priceUrl to Product model
- `src/lib/types.ts` - Added affiliateUrl, priceUrl to Product interface
- `src/lib/data-store.ts` - Added fields to parseProduct()
- `src/app/api/products/route.ts` - Added fields to POST/PATCH handlers
- `src/components/views/AdminSubPages.tsx` - Affiliate links form section, duplicate product, custom link badge
- `src/components/views/AdminPage.tsx` - Enhanced dashboard stats
- `src/components/affiliate/AffiliateLink.tsx` - Added customUrl props to CheckPriceButton & ViewLatestDealButton
- `src/components/affiliate/ProductCard.tsx` - Pass customUrl to CheckPriceButton
- `src/components/affiliate/QuickViewModal.tsx` - Pass customUrl
- `src/components/affiliate/ComparisonTable.tsx` - Pass customUrl
- `src/components/affiliate/GearFinderQuiz.tsx` - Pass customUrl
- `src/components/affiliate/RatingBar.tsx` - Null safety fix
- `src/components/views/ProductDetailPage.tsx` - Pass customUrl to buttons
- `src/components/views/ComparePage.tsx` - Pass customUrl
- `src/components/views/BestSellersPage.tsx` - Pass customUrl
- `src/components/views/BlogPostPage.tsx` - Pass customUrl

### Verification Results
- ✅ Admin product form shows new "AFFILIATE LINKS" section with two URL fields
- ✅ Custom URLs save correctly via API (PATCH /api/products)
- ✅ "View Latest Deal on Amazon" button uses custom affiliateUrl when set
- ✅ "Check Price on Amazon" button uses custom priceUrl when set
- ✅ When custom URLs are empty, auto-generated URLs from ASIN+Merchant are used
- ✅ Duplicate product feature creates copy with "(Copy)" suffix
- ✅ Dashboard shows enhanced stats (Blog Posts, Custom Affiliate Links, Verified %)
- ✅ Product table shows "Custom Link" badge for products with custom URLs
- ✅ Homepage renders correctly
- ✅ Lint passes cleanly

### Architecture Notes
- The affiliate URL system has two layers:
  1. **Auto-generated**: `asin` + `merchant` + affiliate config → URL via template
  2. **Custom override**: `affiliateUrl` / `priceUrl` fields on Product → used directly
- Priority: Custom URL > Auto-generated URL
- "View Latest Deal" button checks `product.affiliateUrl` first
- "Check Price" button checks `product.priceUrl` first, then falls back to `product.affiliateUrl`, then auto-generated

---

## Session: 2026-06-15 (Current)

### Task: Fix Cloudflare Deployment - "Failed to seed database" & empty trending/deals pages

**Problem**: On Cloudflare deployment:
1. Admin panel shows no products on trending and best deals
2. Clicking "Seed Database" in admin shows "Error: Failed to seed database"

**Root Causes Identified**:
1. **Dynamic imports fail on Cloudflare Workers**: Seed route used `await import('@/data/products')` which is unreliable on Workers
2. **Missing database columns**: Turso database created before `affiliateUrl`/`priceUrl` columns were added — `CREATE TABLE IF NOT EXISTS` silently skips, leaving old schema without new columns
3. **No migration logic**: No ALTER TABLE statements to add missing columns to existing tables
4. **Poor error diagnostics**: Error response didn't include enough info to debug Cloudflare-specific issues

**Fixes Applied**:

1. **Changed dynamic imports to static imports** in `/src/app/api/seed/route.ts`
   - `await import('@/data/products')` → `import { products } from '@/data/products'`
   - Same for categories, brands, blog-posts
   - Static imports are bundled at build time, more reliable on Workers

2. **Added migration SQL** — 22 ALTER TABLE statements to add missing columns
   - Product table: affiliateUrl, priceUrl, subcategory, bestFor, summary, fullReview, whoIsItFor, whoShouldSkip, specifications, relatedProducts, authorSlug, reviewStatus, gallery, features, pros, cons, ratingBreakdown, tags, asin, merchant, publishedAt, updatedAt
   - BrandDB table: founded, headquarters, website, categories, productCount
   - BlogPost table: authorSlug, tags, readingTime
   - contact_messages table: ip_address
   - Each migration silently skips if column already exists ("duplicate column name")

3. **Added `?reset=true` option** — Drops and recreates all tables before seeding
   - Use for completely corrupted databases
   - Admin panel now has a "Full Reset" button with confirmation dialog

4. **Added GET /api/seed endpoint** — Diagnostics showing:
   - Database URL (first 40 chars)
   - Auth token status
   - Product/category/brand/blog counts
   - Column presence check (affiliateUrl, priceUrl, etc.)

5. **Improved error reporting** in seed response:
   - Migration results (which columns were actually added)
   - Error counts per entity type
   - Auth token status on failure

6. **Fixed React warning** — AdminAuthGuard was calling `navigate()` during render, causing "Cannot update a component while rendering a different component" warning. Moved to useEffect.

7. **Added "Full Reset" button** to admin dashboard with red styling and confirmation dialog

### Files Modified
- `/src/app/api/seed/route.ts` — Static imports, migration SQL, reset option, GET diagnostics
- `/src/components/views/AdminPage.tsx` — Full Reset button, improved seed error handling
- `/src/components/views/AdminSubPages.tsx` — Fixed AdminAuthGuard React warning

### Verification Results (Local)
- ✅ GET /api/seed returns diagnostics correctly (26 products, 12 brands, 8 categories, 4 blog posts)
- ✅ Trending page shows 26 products with proper filtering
- ✅ Deals page shows products with Amazon links
- ✅ Admin dashboard has both "Seed Database" and "Full Reset" buttons
- ✅ Lint passes cleanly
- ✅ No React warnings in dev log

### Deployment Instructions for Cloudflare
1. Push changes to Git (triggers CI/CD)
2. After deployment, go to admin panel
3. Click "Seed Database" button — this will:
   - Create any missing tables
   - Run ALTER TABLE migrations to add missing columns
   - Seed all data from TypeScript data files
4. If seed still fails, try "Full Reset" button (drops and recreates all tables)
5. Verify trending/deals pages show products

### Unresolved Issues
- Local SQLite database is read-only when accessed concurrently (SQLITE_READONLY) — this is a local-only issue, not relevant on Cloudflare with Turso
- Need to verify after Cloudflare deployment that the seed works with Turso HTTP client
