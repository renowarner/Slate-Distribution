import React, { useMemo } from 'react';
import catalogData from './data/catalog.json';

interface Product {
  Item: string;
  Description: string;
}

const SimpleCatalog: React.FC = () => {
  const products = catalogData.products as Product[];
  const images = catalogData.images as string[];

  const uniqueProductPhotos = useMemo(() => {
    const seenHashes = new Set<string>();
    const uniqueDisplay: string[] = [];
    const excludedFromSimple = [
      'Page18_90301_Volt_Fast_Charge_10FT_Cable___.png',
      'Page20_90011_BIC_Favorites__LCWT1FS_.png',
      'Page35_84106_Apple_Turnover_Danish_5_oz.png',
      'Page37_04003_Old_Fash_Slab_Jerky_Bulk_IW_Re.png'
    ];

    // Filter images to only those that match items and are unique
    images.forEach(img => {
      if (excludedFromSimple.includes(img)) return;

      // Find if this image belongs to any item
      const belongsToItem = products.some(p => img.includes(`_${p.Item}_`));
      
      if (belongsToItem && !seenHashes.has(img)) {
        uniqueDisplay.push(`${import.meta.env.BASE_URL}images/${img}`);
        seenHashes.add(img);
      }
    });

    return uniqueDisplay;
  }, [products, images]);

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {uniqueProductPhotos.map((url, idx) => (
          <div key={idx} className="aspect-square flex items-center justify-center p-2 border border-slate-100 rounded-lg hover:shadow-sm transition-shadow">
            <img 
              src={url} 
              alt="Catalog Product" 
              className="max-w-full max-h-full object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleCatalog;
