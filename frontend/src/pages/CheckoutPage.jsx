import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { CheckCircle2, Loader2, ArrowLeft, CreditCard, Banknote } from 'lucide-react';

// Load Razorpay script dynamically
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const navigate = useNavigate();

  const handleExit = () => {
    clearCart();
    navigate('/welcome');
  };

  // Cash payment — place order immediately, no payment gateway
  const handleCashPayment = async () => {
    if (!customerName.trim()) {
      alert('Please enter your name for the order.');
      return;
    }
    setIsProcessing(true);
    try {
      const response = await api.post('/api/checkout', {
        customerName: customerName.trim(),
        paymentMode: 'CASH',
        items: cart.map(item => ({ menuItemId: item.id, quantity: item.quantity })),
      });
      setSuccessOrder(response.data.orderId);
      clearCart();
    } catch (error) {
      console.error('Cash checkout failed', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !successOrder) {
    navigate('/cart');
    return null;
  }

  const handlePayment = async () => {
    if (!customerName.trim()) {
      alert('Please enter your name for the order.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Load Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load Razorpay. Please check your internet connection.');
        setIsProcessing(false);
        return;
      }

      // 2. Create Razorpay order on backend
      const orderRes = await api.post('/api/payment/create-order', {
        amount: subtotal,
      });
      const { razorpayOrderId, amount, currency, keyId } = orderRes.data;

      // 3. Open Razorpay checkout modal
      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Nowait Cafe',
        description: `Order for ${customerName.trim()}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          // 4. Verify signature and place order on backend
          try {
            const verifyRes = await api.post('/api/payment/verify-and-place', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              customerName: customerName.trim(),
              items: cart.map((item) => ({
                menuItemId: item.id,
                quantity: item.quantity,
              })),
            });

            setPaymentId(response.razorpay_payment_id);
            setSuccessOrder(verifyRes.data.orderId);
            clearCart();
          } catch (err) {
            console.error('Verification failed', err);
            alert('Payment received but order verification failed. Please contact support.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: customerName.trim(),
        },
        theme: {
          color: '#0f7986',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        alert(`Payment failed: ${resp.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error) {
      console.error('Checkout error', error);
      alert('Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let timeoutId;
    if (successOrder) {
      timeoutId = setTimeout(() => {
        navigate('/welcome');
      }, 5000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [successOrder, navigate]);

  if (successOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center bg-white px-4 animate-in zoom-in duration-500">
        <div className="w-28 h-28 bg-[#f8fc52] border-4 border-black rounded-full flex items-center justify-center mb-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <CheckCircle2 className="w-14 h-14 text-black" strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl md:text-6xl font-loubag font-bold text-black mb-4 tracking-tight">Payment Done!</h1>
        <p className="text-black text-xl font-medium mb-2 max-w-md">
          Order ID: <span className="font-black bg-[#f8fc52] px-3 py-1 border-2 border-black rounded-lg ml-2">#{successOrder}</span>
        </p>
        {paymentId && (
          <p className="text-gray-500 text-sm mb-8 font-mono">Payment ref: {paymentId}</p>
        )}
        <p className="text-gray-400 text-sm mb-6">Returning to home in 5 seconds…</p>
        <button
          onClick={() => navigate('/welcome')}
          className="bg-black hover:bg-white text-[#f8fc52] hover:text-black border-2 border-black font-bold text-lg py-4 px-12 rounded-full transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/cart')} className="p-3 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#f8fc52] transition-colors">
            <ArrowLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
          </button>
          <h1 className="text-4xl md:text-5xl font-loubag font-bold text-black tracking-tight">Checkout</h1>
        </div>
        <button onClick={handleExit} className="text-gray-400 hover:text-black text-sm font-medium underline underline-offset-4 transition-colors">
          Cancel &amp; exit
        </button>
      </div>

      <div className="bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
        <div className="p-8 border-b-4 border-black bg-[#f8fc52]">
          <h2 className="text-2xl font-loubag font-bold text-black">Order Summary</h2>
        </div>
        <div className="p-8">
          <div className="mb-8">
            <label className="block text-xl font-bold text-black mb-3">Your Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-6 py-4 bg-white border-4 border-black rounded-2xl text-xl font-medium focus:outline-none focus:ring-0 focus:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
              required
            />
          </div>
          <ul className="space-y-4 mb-8">
            {cart.map((item) => (
              <li key={item.id} className="flex justify-between items-center text-black">
                <span className="text-lg font-medium">
                  <span className="font-black mr-2 bg-[#f8fc52] border border-black px-2 py-0.5 rounded">{item.quantity}x</span> {item.name}
                </span>
                <span className="text-lg font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between items-center pt-6 border-t-2 border-dashed border-gray-400">
            <span className="text-2xl font-black text-black">Total</span>
            <span className="text-3xl font-black text-black">₹{subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Cash */}
        <button
          onClick={handleCashPayment}
          disabled={isProcessing}
          className="bg-white hover:bg-[#f8fc52] disabled:opacity-50 text-black border-4 border-black font-black text-xl py-5 rounded-full flex items-center justify-center space-x-3 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none"
        >
          {isProcessing ? (
            <Loader2 className="w-7 h-7 animate-spin" strokeWidth={3} />
          ) : (
            <>
              <Banknote className="w-7 h-7" strokeWidth={2} />
              <span>Pay with Cash</span>
            </>
          )}
        </button>

        {/* Online / Razorpay */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="bg-[#f8fc52] hover:bg-black disabled:opacity-50 text-black hover:text-[#f8fc52] border-4 border-black font-black text-xl py-5 rounded-full flex items-center justify-center space-x-3 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none"
        >
          {isProcessing ? (
            <Loader2 className="w-7 h-7 animate-spin" strokeWidth={3} />
          ) : (
            <>
              <CreditCard className="w-7 h-7" strokeWidth={2.5} />
              <span>Pay ₹{subtotal.toFixed(2)}</span>
            </>
          )}
        </button>
      </div>

      <p className="text-center text-gray-400 text-sm mt-4 flex items-center justify-center space-x-2">
        <span>🔒</span>
        <span>Secured by Razorpay</span>
      </p>
    </div>
  );
}
