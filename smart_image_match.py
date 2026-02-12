import fitz
import json
import os
import shutil

# Paths (Relative to Active Projects/Slate Distribution)
direct_images_dir = "Extracted_All_Direct"
target_dir = os.path.join("Website", "public", "images")
catalog_json = os.path.join("Website", "src", "data", "catalog.json")

if not os.path.exists(catalog_json):
    print(f"Error: {catalog_json} not found.")
    exit(1)

with open(catalog_json, 'r', encoding='utf-8') as f:
    catalog = json.load(f)

products = catalog['products']
existing_images = catalog['images']

# Identify items currently missing images
missing_items = []
for p in products:
    item_id = p['Item']
    if not item_id: continue
    has_image = any(f"_{item_id}_" in img or img.startswith(f"{item_id}_") for img in existing_images)
    if not has_image:
        missing_items.append(p)

print(f"Items currently missing: {len(missing_items)}")

# Helper to clean description for filename
def clean_desc(d):
    return "".join([c if c.isalnum() else "_" for c in d])[:30]

docs = {
    "part1": fitz.open("Customer-Catalog-2025-part1.pdf"),
    "part2": fitz.open("Customer-Catalog-2025-part2.pdf")
}

matches_found = 0

for product in missing_items:
    item_id = product['Item']
    found_in_pdf = False
    
    for part_name, doc in docs.items():
        if found_in_pdf: break
        
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            if item_id in page.get_text():
                prefix = f"Customer-Catalog-2025-{part_name}.pdf_P{page_idx+1}_I"
                page_images = [f for f in os.listdir(direct_images_dir) if f.startswith(prefix)]
                
                if page_images:
                    src_image = page_images[0] 
                    ext = src_image.split('.')[-1]
                    new_name = f"Page{product['Page']}_{item_id}_{clean_desc(product['Description'])}.{ext}"
                    
                    shutil.copy(os.path.join(direct_images_dir, src_image), os.path.join(target_dir, new_name))
                    matches_found += 1
                    found_in_pdf = True
                    break

print(f"Successfully matched and moved {matches_found} new images.")
