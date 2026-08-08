# Load environment variables from .env file
if (Test-Path .env) {
    Get-Content .env | Where-Object { $_ -match '=' -and $_ -notmatch '^#' } | ForEach-Object {
        $parts = $_ -split '=', 2
        $key = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"').Trim("'")
        [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
    Write-Host "✅ Environment variables loaded from .env"
} else {
    Write-Warning "⚠️ .env file not found!"
}

# Run the Next.js dev server
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
npm.cmd run dev -- -p 8080
