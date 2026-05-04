# build-android.ps1
Write-Host "Setting environment variables..." -ForegroundColor Cyan

# Set paths to the local Android Studio installations
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_SDK_ROOT = "C:\Users\Asus TUF\AppData\Local\Android\Sdk"

Write-Host "Building web assets..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Web build failed."
    exit $LASTEXITCODE
}

Write-Host "Syncing to Capacitor Android project..." -ForegroundColor Cyan
npx cap sync

if ($LASTEXITCODE -ne 0) {
    Write-Error "Capacitor sync failed."
    exit $LASTEXITCODE
}

Write-Host "Building Android APK..." -ForegroundColor Cyan
Push-Location android
.\gradlew assembleDebug

if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Error "Gradle build failed."
    exit $LASTEXITCODE
}
Pop-Location

Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "Your APK is ready at: android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Green
