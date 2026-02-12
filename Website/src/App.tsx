import React, { useState, useMemo } from 'react';
import catalogData from './data/catalog.json';
import { Search, Package, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  Page: string;
  Item: string;
  Description: string;
  CaseCount: string;
  Retail: string;
  UPC: string;
}

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const products = catalogData.products as Product[];
  const images = catalogData.images as string[];

  // Unique pages for the sidebar/filter
  const pages = useMemo(() => {
    const uniquePages = Array.from(new Set(products.map(p => p.Page))).sort((a, b) => parseInt(a) - parseInt(b));
    return uniquePages;
  }, [products]);

  // Image mapping helper
  const getProductImage = (item: string) => {
    // Try to find image that contains the item number
    const found = images.find(img => img.includes(`_${item}_`));
    return found ? `/images/${found}` : null;
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.Description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.Item.includes(searchTerm) ||
        p.UPC.includes(searchTerm);
      
      const matchesPage = selectedPage ? p.Page === selectedPage : true;
      
      return matchesSearch && matchesPage;
    });
  }, [products, searchTerm, selectedPage]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Package className="text-blue-400" size={28} />
            <h1 className="text-xl font-bold tracking-tight">Slate Distribution <span className="text-slate-400 font-normal">Catalog</span></h1>
          </div>
          
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, item #, or UPC..."
              className="w-full bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg self-end md:self-auto">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Hidden on mobile, scrollable on desktop */}
        <aside className="hidden md:block w-64 bg-white border-r border-slate-200 overflow-y-auto p-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Categories (Pages)</h2>
          <nav className="space-y-1">
            <button
              onClick={() => setSelectedPage(null)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${!selectedPage ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              All Products
            </button>
            {pages.map(page => (
              <button
                key={page}
                onClick={() => setSelectedPage(page)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${selectedPage === page ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span>Page {page}</span>
                <ChevronRight size={14} className={selectedPage === page ? 'opacity-100' : 'opacity-0'} />
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Mobile Category Chips */}
          <div className="md:hidden flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedPage(null)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium ${!selectedPage ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
            >
              All
            </button>
            {pages.map(page => (
              <button
                key={page}
                onClick={() => setSelectedPage(page)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium ${selectedPage === page ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
              >
                Page {page}
              </button>
            ))}
          </div>

          <div className="mb-4 flex items-center justify-between">
            <p className="text-slate-500 text-sm">
              Showing <span className="font-semibold text-slate-900">{filteredProducts.length}</span> products
              {selectedPage && <span> in Page {selectedPage}</span>}
            </p>
          </div>

          {/* Product Grid */}
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
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.5) }}
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
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded">
                            #{product.Item}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Page {product.Page}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors h-10">
                          {product.Description}
                        </h3>
                      </div>

                      <div className={viewMode === 'grid' ? "flex items-center justify-between pt-2" : "text-right ml-4"}>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Case Count</p>
                          <p className="text-sm font-medium text-slate-700">{product.CaseCount}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">SRP</p>
                          <p className="text-sm font-bold text-emerald-600">{product.Retail}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {filteredProducts.length === 0 && (
            <div className="py-20 text-center">
              <Package size={64} className="mx-auto text-slate-200 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No products found</h3>
              <p className="text-slate-500">Try adjusting your search or category filter.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
