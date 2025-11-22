# PowerShell script to help update .env file with MongoDB Atlas connection string
# Run this after you get your MongoDB Atlas connection string

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MongoDB Atlas Connection String Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envFile = "D:\STARK\server\.env"

if (-not (Test-Path $envFile)) {
    Write-Host "Error: .env file not found at $envFile" -ForegroundColor Red
    exit 1
}

Write-Host "Current .env file content:" -ForegroundColor Yellow
Write-Host ""
Get-Content $envFile
Write-Host ""

Write-Host "Please enter your MongoDB Atlas connection string:" -ForegroundColor Green
Write-Host "Format: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/..." -ForegroundColor Gray
Write-Host ""

$connectionString = Read-Host "Connection String"

if ([string]::IsNullOrWhiteSpace($connectionString)) {
    Write-Host "Error: Connection string cannot be empty" -ForegroundColor Red
    exit 1
}

# Check if connection string already has /pakuniconnect
if ($connectionString -notmatch "/pakuniconnect") {
    # Add /pakuniconnect before the ?
    if ($connectionString -match "\?") {
        $connectionString = $connectionString -replace "\?", "/pakuniconnect?"
    } else {
        $connectionString = $connectionString + "/pakuniconnect"
    }
    Write-Host "Added /pakuniconnect to connection string" -ForegroundColor Green
}

# Read current .env content
$envContent = Get-Content $envFile

# Replace MONGODB_URI line
$newContent = $envContent | ForEach-Object {
    if ($_ -match "^MONGODB_URI=") {
        "MONGODB_URI=$connectionString"
    } else {
        $_
    }
}

# Write back to file
$newContent | Set-Content $envFile -Encoding UTF8

Write-Host ""
Write-Host "✅ Updated .env file successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "New MONGODB_URI:" -ForegroundColor Yellow
$newContent | Where-Object { $_ -match "^MONGODB_URI=" }
Write-Host ""
Write-Host "Next step: Restart your server!" -ForegroundColor Cyan
Write-Host "Run: cd D:\STARK && npm run dev" -ForegroundColor Gray

