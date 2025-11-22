# MongoDB Connection Setup Script
# This script will update your .env file with the MongoDB Atlas connection string

$envFile = "server\.env"
$connectionString = "mongodb+srv://pakuni:PakUni123@cluster0.wla81vp.mongodb.net/?appName=Cluster0"

# Check if .env file exists
if (Test-Path $envFile) {
    # Read current content
    $content = Get-Content $envFile
    
    # Update or add MONGODB_URI
    if ($content -match "MONGODB_URI=") {
        $content = $content -replace "MONGODB_URI=.*", "MONGODB_URI=$connectionString"
    } else {
        $content += "`nMONGODB_URI=$connectionString"
    }
    
    # Write back to file
    $content | Set-Content $envFile
    Write-Host "✅ MongoDB connection string updated in $envFile" -ForegroundColor Green
} else {
    # Create new .env file
    @"
MONGODB_URI=$connectionString
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
"@ | Set-Content $envFile
    Write-Host "✅ Created new $envFile with MongoDB connection string" -ForegroundColor Green
}

Write-Host "`n🔗 Connection string: $connectionString" -ForegroundColor Cyan
Write-Host "`n🚀 You can now start your server with: npm run dev" -ForegroundColor Yellow
