import os
import shutil

src = r"C:\Users\c1370\.gemini\antigravity-ide\brain\fb66bf37-b65b-46b6-8a8f-889a5a0f7bd5\app_icon_512_1782178929994.png"
dest_dir = r"c:\Users\c1370\OneDrive - Nikon\デスクトップ\業務外\フラッシュカード\assets\icons"
dest512 = os.path.join(dest_dir, "icon-512x512.png")
dest192 = os.path.join(dest_dir, "icon-192x192.png")

# Ensure the destination directory exists
os.makedirs(dest_dir, exist_ok=True)

# Copy the generated icon to both locations
shutil.copy(src, dest512)
shutil.copy(src, dest192)
print("Icons copied successfully!")
