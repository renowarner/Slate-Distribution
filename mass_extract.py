import fitz
import io
from PIL import Image
import os

pdfs = [
    'Customer-Catalog-2025-part1.pdf',
    'Customer-Catalog-2025-part2.pdf'
]

output_dir = "Extracted_All_Direct"
os.makedirs(output_dir, exist_ok=True)

for pdf_name in pdfs:
    print(f"Processing {pdf_name}...")
    doc = fitz.open(pdf_name)
    
    for page_index in range(len(doc)):
        page = doc[page_index]
        image_list = page.get_images()
        
        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            
            # Save all images with page and index
            # Part1 Page 5 might correspond to catalog page 5
            image_name = f"{pdf_name}_P{page_index+1}_I{img_index}.{image_ext}"
            with open(os.path.join(output_dir, image_name), "wb") as f:
                f.write(image_bytes)

print("Mass extraction complete.")
