param([ValidateSet('dev','build','check','preview','test')][string]$Task = 'dev')
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$runtime = Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot '.tools') -Directory -Filter 'node-*-win-x64' -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
if ($runtime) { $env:PATH = "$($runtime.FullName);$env:PATH" }
if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) { throw 'Install Node.js 22.12+ (Node 24 LTS recommended), then run npm install and npm run dev.' }
& npm.cmd run $Task
exit $LASTEXITCODE
