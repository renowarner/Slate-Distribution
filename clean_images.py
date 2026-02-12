import os
import hashlib
from PIL import Image
import json

image_dir = r"Website/public/images"
catalog_json = r"Website/src/data/catalog.json"

def get_image_hash(path):
    with open(path, "rb") as f:
        return hashlib.md5(f.read()).hexdigest()

hashes = {}
duplicates = []
junk = []

files = [f for f in os.listdir(image_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

for filename in files:
    path = os.path.join(image_dir, filename)
    try:
        with Image.open(path) as img:
            w, h = img.size
            if w < 45 or h < 45:
                junk.append(filename)
                continue
            if (w / h > 4) or (h / w > 4):
                junk.append(filename)
                continue
    except:
        continue

    hsh = get_image_hash(path)
    if hsh in hashes:
        duplicates.append(filename)
    else:
        hashes[hsh] = filename

print(f"Found {len(junk)} junk images and {len(duplicates)} duplicate images.")

if os.path.exists(catalog_json):
    with open(catalog_json, 'r', encoding='utf-8') as f:
        data = json.load(f)

    original_count = len(data['images'])
    data['images'] = [img for img in data['images'] if img not in junk and img not in duplicates]
    
    with open(catalog_json, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print(f"Cleaned catalog.json: {original_count} -> {len(data['images'])} images.")
