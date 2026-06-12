#!/bin/bash
# ─── Build a static export for GitHub Pages ──────────────────────────────────
# This script:
# 1. Temporarily moves API routes and sitemap out of src/app
#    (they are incompatible with `output: 'export'`)
# 2. Builds the static site with `STATIC_EXPORT=true`
# 3. Restores the moved files
# 4. Creates a 404.html redirect for SPA hash-based routing
#
# Usage: bash scripts/build-static.sh [base-path]
# Example: bash scripts/build-static.sh /geargeekz
#
# The output will be in the `out/` directory, ready for GitHub Pages.
# ──────────────────────────────────────────────────────────────────────────────

set -e

BASE_PATH="${1:-}"
BACKUP_DIR=".static-build-backup"

echo "🔨 Building GearGeekz static site for GitHub Pages..."

# Set base path if provided
if [ -n "$BASE_PATH" ]; then
  export NEXT_PUBLIC_BASE_PATH="$BASE_PATH"
  echo "📍 Base path: $BASE_PATH"
else
  # Also check env var
  if [ -n "$NEXT_PUBLIC_BASE_PATH" ]; then
    BASE_PATH="$NEXT_PUBLIC_BASE_PATH"
    echo "📍 Base path: $BASE_PATH (from env)"
  else
    echo "📍 Base path: / (root)"
  fi
fi

# Step 1: Move incompatible files to a temp location
echo ""
echo "📦 Temporarily moving server-side routes (incompatible with static export)..."
if [ -d "$BACKUP_DIR" ]; then
  echo "⚠️  Backup directory already exists. Cleaning up..."
  rm -rf "$BACKUP_DIR"
fi
mkdir -p "$BACKUP_DIR"

# Move API routes
if [ -d "src/app/api" ]; then
  mv src/app/api "$BACKUP_DIR/api"
  echo "  ✅ Moved src/app/api/"
fi

# Move sitemap.ts (uses route handler, incompatible with static export)
if [ -f "src/app/sitemap.ts" ]; then
  mv src/app/sitemap.ts "$BACKUP_DIR/sitemap.ts"
  echo "  ✅ Moved src/app/sitemap.ts"
fi

# Move robots.ts (uses route handler, incompatible with static export)
if [ -f "src/app/robots.ts" ]; then
  mv src/app/robots.ts "$BACKUP_DIR/robots.ts"
  echo "  ✅ Moved src/app/robots.ts"
fi

# Step 2: Build static site
echo ""
echo "🏗️  Building static site..."
STATIC_EXPORT=true npx next build

# Step 3: Restore moved files (even if build fails, we restore)
echo ""
echo "♻️  Restoring moved files..."
RESTORE_STATUS=0
if [ -d "$BACKUP_DIR/api" ]; then
  mv "$BACKUP_DIR/api" src/app/api && echo "  ✅ Restored src/app/api/" || RESTORE_STATUS=1
fi
if [ -f "$BACKUP_DIR/sitemap.ts" ]; then
  mv "$BACKUP_DIR/sitemap.ts" src/app/sitemap.ts && echo "  ✅ Restored src/app/sitemap.ts" || RESTORE_STATUS=1
fi
if [ -f "$BACKUP_DIR/robots.ts" ]; then
  mv "$BACKUP_DIR/robots.ts" src/app/robots.ts && echo "  ✅ Restored src/app/robots.ts" || RESTORE_STATUS=1
fi
if [ -d "$BACKUP_DIR" ]; then
  rmdir "$BACKUP_DIR" 2>/dev/null || true
fi

if [ $RESTORE_STATUS -ne 0 ]; then
  echo "⚠️  Some files could not be restored. Check $BACKUP_DIR/"
fi

# Step 4: Post-build fixes for GitHub Pages
echo ""
echo "🔧 Applying GitHub Pages fixes..."

# Fix hardcoded absolute paths in HTML output when using a base path.
# Next.js basePath handles /_next/... paths, but hardcoded /images/... etc
# in data files won't be rewritten. This step patches all HTML files.
# Uses # as sed delimiter since BASE_PATH contains / characters.
if [ -n "$BASE_PATH" ]; then
  echo "  🔁 Rewriting hardcoded absolute paths in HTML (prefix: $BASE_PATH)..."
  # Fix patterns like href="/images/..." and src="/images/..." etc.
  # But DON'T double-rewrite paths that already have the base path.
  find out/ -name "*.html" -exec sed -i \
    -E "s#(href|src)=\"/(images|favicon|logo|og-image|icons)/#\1=\"$BASE_PATH/\2/#g" {} \;
  # Also fix any url(/...) in inline styles
  find out/ -name "*.html" -exec sed -i \
    -E "s#url\\(/(images|favicon|logo|og-image|icons)/#url($BASE_PATH/\2/#g" {} \;
  echo "  ✅ Rewrote absolute asset paths"
fi

# Create 404.html that mirrors index.html for SPA routing
# When GitHub Pages can't find a file, it serves 404.html.
# By making 404.html identical to index.html, the SPA's hash-based
# router can handle any URL path.
if [ -f "out/index.html" ]; then
  cp out/index.html out/404.html
  echo "  ✅ Created 404.html (SPA fallback)"
else
  echo "  ❌ ERROR: index.html not found in out/ — build may have failed"
  exit 1
fi

# Ensure .nojekyll exists (prevents GitHub from processing with Jekyll)
if [ ! -f "out/.nojekyll" ]; then
  touch out/.nojekyll
  echo "  ✅ Created .nojekyll"
else
  echo "  ✅ .nojekyll already exists"
fi

# Step 5: Verify output
echo ""
echo "📋 Verifying output..."
echo "  index.html: $([ -f out/index.html ] && echo '✅' || echo '❌')"
echo "  404.html:   $([ -f out/404.html ] && echo '✅' || echo '❌')"
echo "  .nojekyll:  $([ -f out/.nojekyll ] && echo '✅' || echo '❌')"
echo "  Total size: $(du -sh out/ | cut -f1)"
if [ -n "$BASE_PATH" ]; then
  echo ""
  echo "  Checking asset path prefixes in index.html..."
  BAD_PATHS=$(grep -oE '(href|src)="/[^"]*' out/index.html | grep -v "http" | grep -v "$BASE_PATH" | grep -v '/_next' | head -5 || true)
  if [ -n "$BAD_PATHS" ]; then
    echo "  ⚠️  Found paths missing base path prefix:"
    echo "$BAD_PATHS"
  else
    echo "  ✅ All local asset paths include base path prefix"
  fi
fi

echo ""
echo "✅ Static build complete!"
echo "📂 Output directory: out/"
echo ""
echo "To preview locally:     npx serve out"
echo "To deploy to GitHub Pages: push the 'out/' directory to your gh-pages branch"
echo ""
echo "💡 Tip: For a custom GitHub repo path, run: bash scripts/build-static.sh /your-repo-name"
echo "💡 Tip: Or set NEXT_PUBLIC_BASE_PATH env var before running this script"
