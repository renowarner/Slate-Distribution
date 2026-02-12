import fitz
import os

pdfs = [
    'Customer-Catalog-2025-part1.pdf',
    'Customer-Catalog-2025-part2.pdf',
    'Customer-Catalog-2025-compressed.pdf'
]

base_path = r'.'

for pdf_name in pdfs:
    path = os.path.join(base_path, pdf_name)
    if not os.path.exists(path): 
        print(f"Skipping {pdf_name}, not found.")
        continue
    
    doc = fitz.open(path)
    print(f"\n--- {pdf_name} ({len(doc)} pages) ---")
    
    for i in range(min(15, len(doc))):
        img_list = doc[i].get_images()
        print(f"Page {i+1}: {len(img_list)} embedded images")
