#!/usr/bin/env bash
set -euo pipefail

echo "WARNING: This will DELETE all data and re-apply migrations."
echo "Target database: ${DATABASE_URL:-<not set>}"
echo "Press Ctrl+C to cancel, or wait 5 seconds..."
sleep 5

npx --yes prisma@6.4.0 migrate reset --force
