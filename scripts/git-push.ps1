# git-push.ps1
Set-Location 'C:\Users\karni\Documents\Proyectos\StylerNow'
$git = "C:\Program Files\Git\cmd\git.exe"

# Add remote if not already exists (try/catch to ignore if already exists)
try {
    & $git remote add origin 'https://github.com/WilderKart/Apps-stylernow.git'
} catch {
    # Already exists
}

# Create and switch to main
& $git checkout -b main

# Push to origin main
& $git push -u origin main
