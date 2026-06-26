import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import { Search, ShoppingCart, ImageOff } from 'lucide-react';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [toastMessage, setToastMessage] = useState('');
  const toastTimeout = useRef(null);

  const { cart, addToCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleExit = () => {
    clearCart();
    navigate('/welcome');
  };

  useEffect(() => {
    api.get('/api/menu')
      .then(res => {
        setMenuItems(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch menu", err);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (item) => {
    addToCart(item);
    setToastMessage(`Added ${item.name}`);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToastMessage(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-black"></div>
      </div>
    );
  }

  const categoryData = [
    { name: 'Bowls & salads', image: '/assets/cat_bowls.png', filterName: 'Bowls & salads' },
    { name: 'Wraps & sandwiches', image: '/assets/cat_wraps.png', filterName: 'Wraps & sandwiches' },
    { name: 'Baked goods', image: '/assets/cat_baked.png', filterName: 'Baked goods' },
    { name: 'Beverages', image: '/assets/cat_beverages.png', filterName: 'Beverages' },
  ];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const itemCat = item.category ? item.category.toLowerCase() : '';
    const selectedCat = selectedCategory.toLowerCase();
    
    // Loosely match categories just in case the DB has slight variations like 'bowls' or 'salads'
    const matchesCategory = selectedCategory === 'All' || 
                            itemCat === selectedCat || 
                            selectedCat.includes(itemCat) ||
                            itemCat.includes(selectedCat.split(' ')[0]);
    
    return matchesSearch && matchesCategory;
  });

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Assets bundled in /public load directly; uploaded files come from backend
  const getImageSrc = (path) => {
    if (!path) return null;
    if (path.startsWith('/assets/')) return path; // served by Vite from /public
    return `${backendUrl}${path}`;               // uploaded file on backend
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-28 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-black text-[#f8fc52] px-6 py-3 rounded-xl font-medium shadow-2xl flex items-center animate-in slide-in-from-right-10 fade-in duration-300">
          <ShoppingCart className="w-5 h-5 mr-3" />
          {toastMessage}
        </div>
      )}

      {/* Cancel & Exit — fixed bottom center */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-5 pointer-events-none">
        <button
          onClick={handleExit}
          className="pointer-events-auto bg-white border border-gray-300 text-gray-400 hover:text-black hover:border-black text-sm font-medium px-6 py-2 rounded-full transition-all shadow-sm hover:shadow-md"
        >
          Cancel &amp; exit
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6 relative">
          <div className="flex-1 flex justify-center">
             <h1 className="text-4xl md:text-6xl font-loubag font-bold tracking-tight text-black text-center">
               Fresh flavors for every mood
             </h1>
          </div>
          <button 
            onClick={() => navigate('/cart')} 
            className="absolute right-0 p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
          >
            <ShoppingCart className="w-7 h-7 text-black" strokeWidth={2} />
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 bg-[#f8fc52] text-black font-bold text-xs w-5 h-5 flex items-center justify-center rounded-full border border-black translate-x-1 -translate-y-1">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Section */}
        <div className="flex justify-center mb-12">
          <div className="relative w-full max-w-[280px]">
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-black rounded-full py-1.5 pl-6 pr-10 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#f8fc52] transition-shadow placeholder-gray-700 font-medium"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black" strokeWidth={3} />
          </div>
        </div>

        {/* Category Graphic Buttons */}
        {searchQuery.trim() === '' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-16">
            {categoryData.map(cat => (
              <div key={cat.name} className="flex flex-col items-center">
                 <h3 className="text-xl md:text-2xl font-loubag mb-3 text-center">{cat.name}</h3>
                 <button 
                    onClick={() => setSelectedCategory(selectedCategory === cat.filterName ? 'All' : cat.filterName)}
                    className={`w-full aspect-[3/4] rounded-2xl overflow-hidden transition-transform duration-300 ${
                      selectedCategory === cat.filterName 
                        ? 'scale-95 shadow-inner ring-4 ring-black ring-inset' 
                        : 'hover:-translate-y-2'
                    }`}
                 >
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                 </button>
              </div>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500 font-medium">no food</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-6 px-8 py-3 bg-[#f8fc52] text-black border-2 border-black font-bold rounded-full hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {filteredItems.map(item => {
              const cartItem = cart.find(c => c.id === item.id);
              const isMaxedOut = cartItem && cartItem.quantity >= item.stock;
              const isOutOfStock = item.stock === 0;

              return (
              <div 
                key={item.id} 
                className={`bg-[#f8fc52] rounded-2xl p-4 flex flex-col h-full hover:scale-[1.02] transition-transform duration-300 ${isOutOfStock ? 'opacity-75 grayscale' : 'hover:shadow-lg'}`}
              >
                {/* Image Container */}
                <div className="w-full aspect-[4/3] bg-white rounded-xl overflow-hidden mb-3 relative">
                  {item.imageFileName ? (
                    <img 
                      src={getImageSrc(item.imageFileName)} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.style.display='none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <ImageOff className="w-10 h-10 text-gray-300" />
                    </div>
                  )}
                  
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                      <span className="bg-white text-black font-bold px-4 py-2 rounded-full text-sm uppercase tracking-wider">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="flex-grow flex flex-col px-1">
                  <h3 className="text-sm md:text-base font-medium text-black mb-1 leading-tight">{item.name}</h3>
                  <p className="text-xs text-black/70 mb-2 line-clamp-2 leading-snug">{item.description}</p>
                  <p className="text-black font-bold text-sm md:text-base mt-auto mb-3">₹{item.price.toFixed(2)}</p>
                  
                  <button 
                    onClick={() => handleAddToCart(item)}
                    disabled={isOutOfStock || isMaxedOut}
                    className="w-full bg-white border border-black hover:bg-black hover:text-[#f8fc52] text-black font-bold py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                  >
                    {isOutOfStock ? 'Sold Out' : (isMaxedOut ? 'Max Limit' : (cartItem ? `Added (${cartItem.quantity})` : 'Add to Cart'))}
                  </button>
                </div>
              </div>
            )})}
          </div>
        )}

      </div>
    </div>
  );
}
