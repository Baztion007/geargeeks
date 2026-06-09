#!/bin/bash
# ─── Add `export const runtime = 'edge'` to all API route files ───────────────
# This script is run before building for Cloudflare Pages.
# During local development, we omit `runtime = 'edge'` so that API routes
# run in Node.js runtime (which supports file: SQLite URLs via Prisma).
# On Cloudflare, the edge runtime is required for Workers compatibility.
#
# Usage: bash scripts/add-edge-runtime.sh
# ──────────────────────────────────────────────────────────────────────────────

set -e

ROUTES=$(find src/app/api -name "route.ts" -o -name "route.tsx")

for file in $ROUTES; do
  # Skip if already has runtime export
  if grep -q "export const runtime = 'edge'" "$file"; then
    echo "⏭️  Already has edge runtime: $file"
    continue
  fi

  # Add runtime export after the first import line
  # Find the last import line and insert after it
  LAST_IMPORT=$(grep -n "^import " "$file" | tail -1 | cut -d: -f1)

  if [ -n "$LAST_IMPORT" ]; then
    sed -i "${LAST_IMPORT}a\\
\\
export const runtime = 'edge';" "$file"
    echo "✅ Added edge runtime: $file (after line $LAST_IMPORT)"
  else
    # No imports found, add at the top
    sed -i "1i\\
export const runtime = 'edge';\\
" "$file"
    echo "✅ Added edge runtime: $file (at top)"
  fi
done

echo ""
echo "🎉 Done! All API routes now use edge runtime."
