import json
import os

with open('src/data/catalog.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

products = data['products']
images = data['images']

missing = []
for p in products:
    item_id = p['Item']
    if not item_id: continue
    
    # Check if any image contains the item ID
    has_image = any(f"_{item_id}_" in img or img.startswith(f"Page") and f"_{item_id}_" in img for img in images)
    
    if not has_image:
        missing.append(f"{item_id} | {p['Description']}")

missing = sorted(list(set(missing)))

with open('missing_photos.txt', 'w', encoding='utf-8') as f:
    for line in missing:
        f.write(line + "\n")

print(f"Found {len(missing)} items missing photos. List saved to missing_photos.txt")
