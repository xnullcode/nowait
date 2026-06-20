import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ShoppingCart } from 'lucide-react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const navigate = useNavigate();

  const handleExit = () => {
    clearCart();
    navigate('/welcome');
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center bg-white">
        <div className="w-24 h-24 bg-[#f8fc52] border-4 border-black rounded-full flex items-center justify-center mb-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <ShoppingCart className="w-12 h-12 text-black" strokeWidth={2} />
        </div>
        <h2 className="text-4xl font-loubag font-bold text-black mb-4 tracking-tight">Your cart is empty</h2>
        <p className="text-black text-lg font-medium mb-8">Looks like you haven't made your choice yet.</p>
        <Link to="/menu" className="bg-[#f8fc52] hover:bg-black text-black hover:text-[#f8fc52] border-2 border-black font-bold text-lg py-4 px-10 rounded-full transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1">
          Browse Menu
        </Link>
        <button onClick={handleExit} className="mt-4 text-gray-400 hover:text-black text-sm font-medium underline underline-offset-4 transition-colors">
          Cancel & exit
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl md:text-5xl font-loubag font-bold text-black tracking-tight">Your Cart</h1>
        <div className="flex flex-col items-end space-y-1">
          <Link to="/menu" className="text-black font-bold underline hover:text-gray-600">Back to Menu</Link>
          <button onClick={handleExit} className="text-gray-400 hover:text-black text-sm font-medium underline underline-offset-4 transition-colors">Cancel & exit</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-12">
        {cart.map((item) => (
          <div key={item.id} className="bg-white border-2 border-black rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
            <div className="flex-grow">
              <h3 className="text-xl md:text-2xl font-bold text-black mb-2 leading-tight">{item.name}</h3>
              <p className="text-black font-bold text-lg">₹{item.price.toFixed(2)}</p>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
              
              {/* Quantity Controls */}
              <div className="flex items-center border-2 border-black rounded-full overflow-hidden bg-[#f8fc52] shadow-inner">
                <button onClick={() => updateQuantity(item.id, -1)} className="p-3 text-black hover:bg-black hover:text-[#f8fc52] transition-colors">
                  <Minus className="w-5 h-5" strokeWidth={3} />
                </button>
                <span className="w-12 text-center font-bold text-black text-lg">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, 1)} 
                  disabled={item.quantity >= item.stock}
                  className="p-3 text-black hover:bg-black hover:text-[#f8fc52] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black cursor-pointer disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" strokeWidth={3} />
                </button>
              </div>
              
              <p className="w-20 text-right font-black text-xl text-black">
                ₹{(item.price * item.quantity).toFixed(2)}
              </p>
              
              <button onClick={() => removeFromCart(item.id)} className="p-3 bg-white border-2 border-black hover:bg-red-500 hover:text-white text-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none">
                <Trash2 className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#f8fc52] border-4 border-black rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div>
          <p className="text-black text-lg font-medium mb-1">Subtotal</p>
          <p className="text-4xl font-black text-black">₹{subtotal.toFixed(2)}</p>
        </div>
        <button 
          onClick={() => navigate('/checkout')}
          className="w-full md:w-auto bg-black text-[#f8fc52] hover:bg-white hover:text-black border-4 border-black hover:border-black font-bold text-xl py-4 px-10 rounded-full flex items-center justify-center space-x-3 transition-all"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-6 h-6" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
