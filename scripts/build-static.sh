#!/bin/bash
# ─── Build a static export for GitHub Pages ──────────────────────────────────
# This script:
# 1. Temporarily moves API routes and sitemap out of src/app
#    (they are incompatible with `output: 'export'`)
# 2. Builds the static site with `STATIC_EXPORT=true`
# 3. Restores the moved files
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
  echo "📍 Base path: / (root)"
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

# Step 3: Restore moved files
echo ""
echo "♻️  Restoring moved files..."
if [ -d "$BACKUP_DIR/api" ]; then
  mv "$BACKUP_DIR/api" src/app/api
  echo "  ✅ Restored src/app/api/"
fi
if [ -f "$BACKUP_DIR/sitemap.ts" ]; then
  mv "$BACKUP_DIR/sitemap.ts" src/app/sitemap.ts
  echo "  ✅ Restored src/app/sitemap.ts"
fi
if [ -f "$BACKUP_DIR/robots.ts" ]; then
  mv "$BACKUP_DIR/robots.ts" src/app/robots.ts
  echo "  ✅ Restored src/app/robots.ts"
fi
rmdir "$BACKUP_DIR"

echo ""
echo "✅ Static build complete!"
echo "📂 Output directory: out/"
echo ""
echo "To preview locally:     npx serve out"
echo "To deploy to GitHub Pages: push the 'out/' directory to your gh-pages branch"
echo ""
echo "💡 Tip: For a custom GitHub repo path, run: bash scripts/build-static.sh /your-repo-name"
