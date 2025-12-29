# Smoke Test for Ingles Genius Pro API
$ErrorActionPreference = "Stop"
$BaseUrl = "http://127.0.0.1:8000"

Write-Host "1. Testing /ping..." -ForegroundColor Cyan
try {
    $ping = Invoke-RestMethod -Uri "$BaseUrl/ping"
    Write-Host "   Success: $($ping.pong)" -ForegroundColor Green
} catch {
    Write-Host "   Failed to reach API. Is uvicorn running?" -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Registering Test User..." -ForegroundColor Cyan
$UserEmail = "test_$(Get-Random)@example.com"
$UserPayload = @{
    email = $UserEmail
    password = "password123"
    name = "Test Cadet"
    age = 25
} | ConvertTo-Json

try {
    $reg = Invoke-RestMethod -Method Post -Uri "$BaseUrl/register" -ContentType "application/json" -Body $UserPayload
    Write-Host "   Registered ID: $($reg.user_id)" -ForegroundColor Green
} catch {
    Write-Host "   Registration Failed: $_" -ForegroundColor Red
}

Write-Host "`n3. Logging In..." -ForegroundColor Cyan
$LoginPayload = @{
    email = $UserEmail
    password = "password123"
} | ConvertTo-Json

$token = $null
try {
    $login = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/login" -ContentType "application/json" -Body $LoginPayload
    $token = $login.access_token
    Write-Host "   Token Acquired" -ForegroundColor Green
} catch {
    Write-Host "   Login Failed: $_" -ForegroundColor Red
    exit 1
}

$Headers = @{ Authorization = "Bearer $token" }

Write-Host "`n4. Fetching Courses..." -ForegroundColor Cyan
try {
    $courses = Invoke-RestMethod -Uri "$BaseUrl/courses" -Headers $Headers
    Write-Host "   Found $($courses.courses.Count) active courses." -ForegroundColor Green
    $CourseId = $courses.courses[0].id
} catch {
    Write-Host "   Fetch Courses Failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n5. Fetching Solar System for Course $CourseId..." -ForegroundColor Cyan
try {
    $solar = Invoke-RestMethod -Uri "$BaseUrl/courses/$CourseId/solar" -Headers $Headers
    Write-Host "   Course: $($solar.course.title)" -ForegroundColor Green
    Write-Host "   Tracks: $($solar.solar_system.Count)" -ForegroundColor Green
    
    $FirstMission = $solar.solar_system[0].missions[0]
    Write-Host "   First Mission: $($FirstMission.title) [$($FirstMission.status)]" -ForegroundColor Yellow
} catch {
    Write-Host "   Fetch Solar System Failed: $_" -ForegroundColor Red
}

Write-Host "`nSmoke Test Complete." -ForegroundColor Magenta
