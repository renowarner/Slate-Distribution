import cv2
import numpy as np
import os
import pandas as pd
import fitz

# Setup paths
pdf_path = r"Active Projects\Slate Distribution\Customer-Catalog-2025-compressed.pdf"
csv_path = r"Active Projects\Slate Distribution\product_catalog_data.csv"
output_dir = r"Active Projects\Slate Distribution\Extracted Product Images"
log_path = r"Active Projects\Slate Distribution\Extraction_Log.txt"

os.makedirs(output_dir, exist_ok=True)

# Load CSV
df = pd.read_csv(csv_path)
df.columns = [c.strip() for c in df.columns]

# Clean Page column
def clean_page(p):
    p = str(p).strip()
    if p == '6g': return 6
    if p.isdigit(): return int(p)
    return None

df['CleanPage'] = df['Page'].apply(clean_page)
products_by_page = df.groupby('CleanPage')

doc = fitz.open(pdf_path)
log_lines = []

print(f"Total pages in PDF: {len(doc)}")
print(f"Pages with products in CSV: {len(products_by_page)}")

for page_num, group in products_by_page:
    if page_num is None: continue
    pdf_index = int(page_num) - 1
    if pdf_index < 0 or pdf_index >= len(doc): continue

    page = doc[pdf_index]
    
    # 1. Find the Table Header to determine the Image Area boundary
    # We look for "Item" or "Description" or "UPC"
    text_words = page.get_text("words")
    table_top_y = page.rect.height # Default to bottom of page
    for w in text_words:
        if w[4] in ["Item", "Description", "UPC", "Retail"]:
            table_top_y = min(table_top_y, w[1])
    
    # Render page
    zoom = 2
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat)
    img_data = pix.tobytes("png")
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None: continue

    # 2. Image Area is from top (or header) to table_top_y
    # Header is usually top ~150 pts. Let's say 100 pts.
    header_bottom_y_px = 100 * zoom
    table_top_y_px = table_top_y * zoom
    
    # If table is very high up, maybe there's no space for images.
    if table_top_y_px <= header_bottom_y_px:
        # Fallback: if no table header found, use a default middle split
        if table_top_y == page.rect.height:
            table_top_y_px = 550 * zoom 
        else:
            header_bottom_y_px = 0 # No header, table is at top?

    roi = img[int(header_bottom_y_px):int(table_top_y_px), :]

    # 3. Dynamic Contour Detection
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 245, 255, cv2.THRESH_BINARY_INV)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # We'll try different area thresholds to find the "best" set of blocks
    num_wanted = len(group)
    best_contours = []
    
    # Try areas from 20000 down to 2000
    for area_thresh in [20000, 15000, 10000, 5000, 2000]:
        current_valid = []
        for c in contours:
            area = cv2.contourArea(c)
            if area > area_thresh:
                x, y, w, h = cv2.boundingRect(c)
                current_valid.append((x, y + int(header_bottom_y_px), w, h, area))
        
        # Sort by rows
        current_valid.sort(key=lambda b: (int(b[1]/50), b[0]))
        
        if len(current_valid) >= num_wanted:
            best_contours = current_valid
            break
        if len(current_valid) > len(best_contours):
            best_contours = current_valid

    # 4. Save and Log
    num_products = len(group)
    num_found = len(best_contours)
    log_msg = f"Page {page_num}: Found {num_found}/{num_products} images (TableY={table_top_y:.1f})"
    print(log_msg)
    log_lines.append(log_msg)

    for i, row in enumerate(group.itertuples()):
        if i < num_found:
            x, y, w, h, area = best_contours[i]
            crop = img[y:y+h, x:x+w]
            desc = "".join([c if c.isalnum() else "_" for c in str(row.Description)])[:50]
            filename = f"Page{page_num}_{row.Item}_{desc}.png"
            cv2.imwrite(os.path.join(output_dir, filename), crop)
        else:
            log_lines.append(f"  - Missing Item {row.Item} on Page {page_num}")

# Final Log
with open(log_path, "w") as f:
    f.write("\n".join(log_lines))

print(f"Finished. Total images in {output_dir}")