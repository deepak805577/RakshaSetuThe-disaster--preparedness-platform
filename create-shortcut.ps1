# Create Desktop Shortcut for Disaster Preparedness PWA

$projectPath = "C:\Users\Omkar\OneDrive\Desktop\sih-disaster-app"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = "$desktopPath\Disaster Preparedness PWA.lnk"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "$projectPath\RUN-PROJECT.bat"
$shortcut.WorkingDirectory = $projectPath
$shortcut.Description = "Run Disaster Preparedness PWA for Punjab Schools"
$shortcut.IconLocation = "shell32.dll,21"  # School/Education icon
$shortcut.Save()

Write-Host "Desktop shortcut created successfully!" -ForegroundColor Green
Write-Host "Location: $shortcutPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now double-click the desktop shortcut to run the project!" -ForegroundColor Yellow
