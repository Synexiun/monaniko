#!/usr/bin/env bash
# Reads .env and pushes all real (non-placeholder) values to Vercel production.
# Usage: bash scripts/push-env-to-vercel.sh

set -e

ENV_FILE=".env"
ENVIRONMENT="production"
SKIPPED=()
PUSHED=()

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: .env file not found"
  exit 1
fi

echo "Reading $ENV_FILE and pushing to Vercel ($ENVIRONMENT)..."
echo ""

while IFS= read -r line || [ -n "$line" ]; do
  # Skip blank lines and comments
  [[ "$line" =~ ^[[:space:]]*$ ]] && continue
  [[ "$line" =~ ^[[:space:]]*# ]] && continue

  # Parse KEY=VALUE
  if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
    key="${BASH_REMATCH[1]}"
    value="${BASH_REMATCH[2]}"

    # Strip surrounding quotes
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"

    # Skip placeholders
    if [[ "$value" == *"REPLACE_WITH"* ]] || [[ -z "$value" ]]; then
      SKIPPED+=("$key")
      continue
    fi

    # Push to Vercel
    printf "%s" "$value" | vercel env add "$key" "$ENVIRONMENT" --force 2>&1 | grep -E "(Added|Updated|Error)" || true
    PUSHED+=("$key")
  fi
done < "$ENV_FILE"

echo ""
echo "✅ Pushed ${#PUSHED[@]} variables: ${PUSHED[*]}"

if [ ${#SKIPPED[@]} -gt 0 ]; then
  echo "⚠️  Skipped ${#SKIPPED[@]} placeholders: ${SKIPPED[*]}"
  echo "   Fill these in .env then re-run this script."
fi
