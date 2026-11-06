$ErrorActionPreference = 'Stop'
if (Test-Path 'frontend/package.json') {
  Push-Location frontend
  try {
    $scripts = (Get-Content package.json -Raw | ConvertFrom-Json).scripts
    if ($scripts.'test:e2e') { npm run test:e2e } else { throw 'No test:e2e script found; configure Playwright first.' }
  } finally { Pop-Location }
} else { throw 'frontend/package.json not found.' }
