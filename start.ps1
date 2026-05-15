[CmdletBinding()]
param(
    [switch]$Setup
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot

function Write-Step {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✓ $Message" -ForegroundColor Green
}

function Write-Fail {
    param([string]$Message)
    Write-Host "  ✗ $Message" -ForegroundColor Red
}

function Write-Warn {
    param([string]$Message)
    Write-Host "  ! $Message" -ForegroundColor Yellow
}

$Script:HardhatProcess = $null
$Script:FrontendProcess = $null
$Script:HardhatJob = $null

function Stop-ManagedProcesses {
    if ($Script:FrontendProcess -and -not $Script:FrontendProcess.HasExited) {
        Write-Step "Stopping frontend dev server (PID $($Script:FrontendProcess.Id))..."
        Stop-Process -Id $Script:FrontendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($Script:HardhatProcess -and -not $Script:HardhatProcess.HasExited) {
        Write-Step "Stopping Hardhat node (PID $($Script:HardhatProcess.Id))..."
        Stop-Process -Id $Script:HardhatProcess.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Success "Cleanup complete."
}

function Test-Prerequisites {
    Write-Step "[1/10] Checking prerequisites..."
    $nodeVersion = $null
    try { $nodeVersion = (node -v) -replace '^v','' } catch { }
    if (-not $nodeVersion -or [version]$nodeVersion -lt [version]"20.0.0") {
        Write-Fail "Node.js v20+ is required. Found: $(if ($nodeVersion) { "v$nodeVersion" } else { 'not installed' })"
        exit 1
    }
    Write-Success "Node.js v$nodeVersion found"

    $npmVersion = $null
    try { $npmVersion = (npm -v) } catch { }
    if (-not $npmVersion -or [version]$npmVersion -lt [version]"10.0.0") {
        Write-Fail "npm v10+ is required. Found: $(if ($npmVersion) { "v$npmVersion" } else { 'not installed' })"
        exit 1
    }
    Write-Success "npm v$npmVersion found"
}

function Install-Dependencies {
    Write-Step "[2/10] Installing contract dependencies..."
    Push-Location "$ProjectRoot\contracts"
    npm install 2>&1 | ForEach-Object { $_.ToString() }
    if ($LASTEXITCODE -ne 0) { Write-Fail "Failed to install contract dependencies"; Pop-Location; exit 1 }
    Write-Success "Contract dependencies installed"
    Pop-Location

    Write-Step "[3/10] Installing frontend dependencies..."
    Push-Location "$ProjectRoot\frontend"
    npm install 2>&1 | ForEach-Object { $_.ToString() }
    if ($LASTEXITCODE -ne 0) { Write-Fail "Failed to install frontend dependencies"; Pop-Location; exit 1 }
    Write-Success "Frontend dependencies installed"
    Pop-Location
}

function Set-Environment {
    Write-Step "[4/10] Configuring environment..."
    $envFile = "$ProjectRoot\frontend\.env"
    $envExample = "$ProjectRoot\frontend\.env.example"
    if (Test-Path $envFile) {
        Write-Warn ".env already exists, skipping copy"
    } else {
        Copy-Item $envExample $envFile
        Write-Success ".env created from .env.example"
    }
}

function Initialize-Database {
    Write-Step "[5/10] Running database migrations..."
    Push-Location "$ProjectRoot\frontend"
    npx prisma migrate dev 2>&1 | ForEach-Object { $_.ToString() }
    if ($LASTEXITCODE -ne 0) { Write-Fail "Prisma migrate failed"; Pop-Location; exit 1 }
    Write-Success "Database migrated"
    Pop-Location

    Write-Step "[6/10] Seeding database..."
    Push-Location "$ProjectRoot\frontend"
    npx prisma db seed 2>&1 | ForEach-Object { $_.ToString() }
    if ($LASTEXITCODE -ne 0) { Write-Fail "Prisma seed failed"; Pop-Location; exit 1 }
    Write-Success "Database seeded"
    Pop-Location
}

function Start-HardhatNode {
    Write-Step "[7/10] Starting Hardhat node..."
    $portInUse = Get-NetTCPConnection -LocalPort 8545 -ErrorAction SilentlyContinue
    if ($portInUse) {
        Write-Warn "Port 8545 already in use (PID $($portInUse[0].OwningProcess)). Skipping Hardhat start."
        return
    }

    $Script:HardhatProcess = Start-Process -FilePath "node" `
        -ArgumentList "$ProjectRoot\contracts\node_modules\.bin\hardhat", "node" `
        -WorkingDirectory "$ProjectRoot\contracts" `
        -PassThru `
        -NoNewWindow `
        -RedirectStandardOutput "$ProjectRoot\hardhat-node.log" `
        -RedirectStandardError "$ProjectRoot\hardhat-node-error.log"

    Write-Host "  Waiting for Hardhat node on port 8545..." -ForegroundColor DarkGray
    $timeout = 30
    $elapsed = 0
    while ($elapsed -lt $timeout) {
        Start-Sleep -Seconds 1
        $elapsed++
        try {
            $tcp = Get-NetTCPConnection -LocalPort 8545 -ErrorAction SilentlyContinue
            if ($tcp) {
                Write-Success "Hardhat node ready (PID $($Script:HardhatProcess.Id))"
                return
            }
        } catch { }
        if ($Script:HardhatProcess.HasExited) {
            Write-Fail "Hardhat node exited unexpectedly. Check hardhat-node-error.log"
            exit 1
        }
    }
    Write-Fail "Hardhat node did not start within ${timeout}s"
    Stop-ManagedProcesses
    exit 1
}

function Deploy-Contracts {
    Write-Step "[8/10] Deploying contracts..."
    Push-Location "$ProjectRoot\contracts"
    $output = npx hardhat run scripts/deploy.ts --network localhost 2>&1 | ForEach-Object { $_.ToString() }
    Write-Host $output
    if ($LASTEXITCODE -ne 0) { Write-Fail "Contract deployment failed"; Pop-Location; Stop-ManagedProcesses; exit 1 }

    Write-Step "[9/10] Deployed contract addresses:"
    $outputStr = $output -join "`n"
    $tokenAddr = if ($outputStr -match "EkokyToken deployed to:\s+(0x[a-fA-F0-9]+)") { $Matches[1] } else { "NOT FOUND" }
    $registryAddr = if ($outputStr -match "OfferRegistry deployed to:\s+(0x[a-fA-F0-9]+)") { $Matches[1] } else { "NOT FOUND" }
    $stakingAddr = if ($outputStr -match "Staking deployed to:\s+(0x[a-fA-F0-9]+)") { $Matches[1] } else { "NOT FOUND" }
    Write-Host "  EkokyToken:    $tokenAddr"
    Write-Host "  OfferRegistry: $registryAddr"
    Write-Host "  Staking:       $stakingAddr"
    Write-Warn "If these differ from frontend/src/lib/contracts.ts, update them manually."
    Pop-Location
}

function Start-Frontend {
    Write-Step "[10/10] Starting frontend dev server..."
    $portInUse = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($portInUse) {
        Write-Warn "Port 3000 already in use (PID $($portInUse[0].OwningProcess)). Frontend may fail to start."
    }

    $Script:FrontendProcess = Start-Process -FilePath "npm" `
        -ArgumentList "run", "dev" `
        -WorkingDirectory "$ProjectRoot\frontend" `
        -PassThru `
        -NoNewWindow

    Write-Success "Frontend dev server starting (PID $($Script:FrontendProcess.Id))"
    Write-Host ""
    Write-Host "  Ekoky v2 is running!" -ForegroundColor Green
    Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "  Hardhat:  http://127.0.0.1:8545" -ForegroundColor White
    Write-Host ""
    Write-Host "  Press Ctrl+C to stop all services." -ForegroundColor DarkGray
}

try {
    if ($Setup) {
        Test-Prerequisites
        Install-Dependencies
        Set-Environment
        Initialize-Database
        Start-HardhatNode
        Deploy-Contracts
        Start-Frontend
    } else {
        Start-HardhatNode
        Start-Frontend
    }

    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    Stop-ManagedProcesses
}

