import React, { useMemo } from 'react';
import catalogData from './data/catalog.json';

interface Product {
  Item: string;
  Description: string;
}

const SimpleCatalog: React.FC = () => {
  const products = catalogData.products as Product[];
  const images = catalogData.images as string[];

  const productsWithImages = useMemo(() => {
    return products.filter(p => {
      return images.some(img => img.includes(`_${p.Item}_`));
    }).map(p => {
      const found = images.find(img => img.includes(`_${p.Item}_`));
      return {
        ...p,
        imageUrl: `${import.meta.env.BASE_URL}images/${found}`
      };
    });
  }, [products, images]);

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {productsWithImages.map((product, idx) => (
          <div key={`${product.Item}-${idx}`} className="aspect-square flex items-center justify-center p-2 border border-slate-100 rounded-lg hover:shadow-sm transition-shadow">
            <img 
              src={product.imageUrl} 
              alt={product.Description} 
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
