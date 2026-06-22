import shutil
import os

src = r"C:\Users\c1370\.gemini\antigravity-ide\brain\fb66bf37-b65b-46b6-8a8f-889a5a0f7bd5\app_icon_512_1782114823579.png"
dst1 = r"c:\Users\c1370\OneDrive - Nikon\デスクトップ\業務外\フラッシュカード\assets\icons\icon-512x512.png"
dst2 = r"c:\Users\c1370\OneDrive - Nikon\デスクトップ\業務外\フラッシュカード\assets\icons\icon-192x192.png"

try:
    shutil.copy(src, dst1)
    print(f"Copied to {dst1}")
    shutil.copy(src, dst2)
    print(f"Copied to {dst2}")
except Exception as e:
    print(f"Error: {e}")
