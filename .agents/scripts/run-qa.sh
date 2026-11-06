#!/usr/bin/env bash
set -euo pipefail
# Run from repository root. Adjust package manager/scripts to the actual project.
if [ -f frontend/package.json ]; then
  cd frontend
  if node -e "process.exit(require('./package.json').scripts?.['test:e2e'] ? 0 : 1)"; then
    npm run test:e2e
  else
    echo "No test:e2e script found in frontend/package.json; configure Playwright first." >&2
    exit 2
  fi
else
  echo "frontend/package.json not found." >&2
  exit 2
fi
