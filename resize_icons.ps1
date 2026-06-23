Add-Type -AssemblyName System.Drawing

$src = "C:\Users\c1370\.gemini\antigravity-ide\brain\fb66bf37-b65b-46b6-8a8f-889a5a0f7bd5\app_icon_512_1782178929994.png"
$destDir = "c:\Users\c1370\OneDrive - Nikon\デスクトップ\業務外\フラッシュカード\assets\icons"
$dest512 = "$destDir\icon-512x512.png"
$dest192 = "$destDir\icon-192x192.png"

# Ensure the destination directory exists
if (!(Test-Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir
}

# Load the source image
$img = [System.Drawing.Image]::FromFile($src)

# Resize to 512x512
$bmp512 = New-Object System.Drawing.Bitmap(512, 512)
$g512 = [System.Drawing.Graphics]::FromImage($bmp512)
$g512.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g512.DrawImage($img, 0, 0, 512, 512)
$bmp512.Save($dest512, [System.Drawing.Imaging.ImageFormat]::Png)
$g512.Dispose()
$bmp512.Dispose()

# Resize to 192x192
$bmp192 = New-Object System.Drawing.Bitmap(192, 192)
$g192 = [System.Drawing.Graphics]::FromImage($bmp192)
$g192.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g192.DrawImage($img, 0, 0, 192, 192)
$bmp192.Save($dest192, [System.Drawing.Imaging.ImageFormat]::Png)
$g192.Dispose()
$bmp192.Dispose()

# Clean up image handles
$img.Dispose()
