param(
    [switch]$SkipInstall,
    [switch]$SkipCheck
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
    & git -C $repoRoot @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "git $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
    }
}

$currentBranch = (& git -C $repoRoot branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or $currentBranch -ne 'custom') {
    throw "Run this script from the custom branch; current branch is '$currentBranch'."
}

$worktreeStatus = & git -C $repoRoot status --porcelain
if ($LASTEXITCODE -ne 0) {
    throw 'Could not inspect the Git worktree.'
}
if ($worktreeStatus) {
    throw 'The worktree is not clean. Commit or stash changes before syncing upstream.'
}

$upstreamUrl = (& git -C $repoRoot remote get-url upstream).Trim()
if ($LASTEXITCODE -ne 0 -or $upstreamUrl -ne 'https://github.com/xmanrui/dsh-im.git') {
    throw "The upstream remote is missing or unexpected: '$upstreamUrl'."
}

Invoke-Git fetch --prune upstream
Invoke-Git switch main
Invoke-Git merge --ff-only upstream/main
Invoke-Git switch custom
Invoke-Git merge --no-edit upstream/main

Push-Location $repoRoot
try {
    if (-not $SkipInstall) {
        & npm ci
        if ($LASTEXITCODE -ne 0) { throw "npm ci failed with exit code $LASTEXITCODE" }
    }
    if (-not $SkipCheck) {
        & npm run check
        if ($LASTEXITCODE -ne 0) { throw "npm run check failed with exit code $LASTEXITCODE" }
    }
}
finally {
    Pop-Location
}

$mainCommit = (& git -C $repoRoot rev-parse main).Trim()
$customCommit = (& git -C $repoRoot rev-parse custom).Trim()
[PSCustomObject]@{
    Main = $mainCommit
    Custom = $customCommit
    Next = 'Review, then push main and custom; reinstall github:SeanHarry03/dsh-im-voice#custom in DSH.'
} | Format-List
