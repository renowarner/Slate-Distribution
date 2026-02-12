import React, { useState, useMemo } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import catalogData from './data/catalog.json';
import { Search, Package, LayoutGrid, List, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SimpleCatalog from './SimpleCatalog';

interface Product {
  Page: string;
  Item: string;
  Description: string;
  CaseCount: string;
  Retail: string;
  UPC: string;
}

const CatalogView: React.FC<{ searchTerm: string }> = ({ searchTerm }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const products = catalogData.products as Product[];
  const images = catalogData.images as string[];

  const getProductImage = (item: string) => {
    const found = images.find(img => img.includes(`_${item}_`));
    return found ? `${import.meta.env.BASE_URL}images/${found}` : null;
  };

  const filteredProducts = useMemo(() => {
    const excludedItems = ['21600', '82704', '8006'];
    
    return products.filter(p => {
      const isExcluded = excludedItems.some(id => p.Item === id || (id === '8006' && p.Item.startsWith('8006')));
      if (isExcluded) return false;

      const matchesSearch = 
        p.Description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.Item.includes(searchTerm) ||
        p.UPC.includes(searchTerm);
      
      return matchesSearch;
    });
  }, [products, searchTerm]);

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-slate-500 text-sm">
          Showing <span className="font-semibold text-slate-900">{filteredProducts.length}</span> products
        </p>
        <div className="flex items-center gap-2 bg-slate-200 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1 rounded ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div 
          layout
          className={viewMode === 'grid' 
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
            : "flex flex-col gap-2"
          }
        >
          {filteredProducts.map((product, idx) => {
            const imgUrl = getProductImage(product.Item);
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.01, 0.3) }}
                key={`${product.Item}-${idx}`}
                className={`bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group ${viewMode === 'list' ? 'flex items-center p-2' : ''}`}
              >
                <div className={viewMode === 'grid' ? "product-image-container p-4" : "w-20 h-20 flex-shrink-0 p-2"}>
                  {imgUrl ? (
                    <img src={imgUrl} alt={product.Description} loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                      <Package size={viewMode === 'grid' ? 48 : 24} />
                    </div>
                  )}
                </div>
                
                <div className={viewMode === 'grid' ? "p-4 border-t border-slate-50" : "flex-1 px-4 flex items-center justify-between"}>
                  <div className={viewMode === 'grid' ? "" : "flex-1"}>
                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors h-10">
                      {product.Description}
                    </h3>
                  </div>

                  <div className={viewMode === 'grid' ? "flex items-center justify-between pt-2" : "text-right ml-4 flex items-center gap-6"}>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Case Count</p>
                      <p className="text-sm font-medium text-slate-700">{product.CaseCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Item #</p>
                      <p className="text-sm font-bold text-blue-600">#{product.Item}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </main>
  );
};

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const isSimple = location.pathname === '/simple';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Package className="text-blue-400" size={28} />
              <h1 className="text-xl font-bold tracking-tight text-white">Slate Distribution</h1>
            </Link>
            <div className="md:hidden flex items-center gap-2">
               <Link to={isSimple ? "/" : "/simple"} className="p-2 rounded-lg bg-slate-800 text-blue-400">
                  <Zap size={20} />
               </Link>
            </div>
          </div>
          
          {!isSimple && (
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search catalog..."
                className="w-full bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <div className="hidden md:flex items-center gap-4">
            <Link 
              to={isSimple ? "/" : "/simple"} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${isSimple ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400 hover:bg-slate-700'}`}
            >
              <Zap size={18} />
              {isSimple ? 'Full Catalog' : 'Simple View'}
            </Link>
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<CatalogView searchTerm={searchTerm} />} />
        <Route path="/simple" element={<SimpleCatalog />} />
      </Routes>
    </div>
  );
};

export default App;
