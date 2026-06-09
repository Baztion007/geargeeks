#!/bin/bash
# ─── Remove `export const runtime = 'edge'` from all API route files ────────
# This reverts the effect of add-edge-runtime.sh, restoring routes to
# Node.js runtime for local development with file: SQLite URLs.
#
# Usage: bash scripts/remove-edge-runtime.sh
# ──────────────────────────────────────────────────────────────────────────────

set -e

ROUTES=$(find src/app/api -name "route.ts" -o -name "route.tsx")

for file in $ROUTES; do
  # Check if the file has the runtime export
  if grep -q "export const runtime = 'edge'" "$file"; then
    # Remove the line
    sed -i "/export const runtime = 'edge';/d" "$file"
    # Clean up any double blank lines left behind
    sed -i '/^$/N;/^\n$/d' "$file"
    echo "✅ Removed edge runtime: $file"
  else
    echo "⏭️  No edge runtime found: $file"
  fi
done

echo ""
echo "🎉 Done! All API routes now use Node.js runtime (for local dev)."
