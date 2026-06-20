import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Clock, Check, ChefHat, CheckCircle2, Banknote, CreditCard, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders');
      setOrders(response.data.filter(o => o.status !== 'COMPLETED').slice(0, 50));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('cafe_token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.patch(`/api/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const verifyPayment = async (id) => {
    try {
      await api.patch(`/api/orders/${id}/verify-payment`);
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('cafe_token')) {
      navigate('/login');
      return;
    }

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5s

    return () => clearInterval(interval);
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0054c6]"></div>
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const preparingOrders = orders.filter(o => o.status === 'PREPARING');
  const finishedOrders = orders.filter(o => o.status === 'FINISHED');

  const OrderCard = ({ order, nextStatus, nextLabel, icon: Icon, colorClass, buttonClass }) => (
    <div className={`bg-white border border-black ${colorClass}`}>
      <div className="p-4 border-b border-black flex justify-between items-start">
        <div>
          <span className="font-bold text-lg text-gray-900 block">#{order.id}</span>
          <span className="text-xs text-gray-500 flex items-center mt-1">
            <Clock className="w-3 h-3 mr-1" />
            {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-gray-600 block">{order.customerName}</span>
          <span className="font-bold text-[#0054c6]">₹{order.totalPrice.toFixed(2)}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-2 mb-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-gray-800 font-medium">
                <span className="font-bold text-gray-500 mr-2">{item.quantity}x</span> 
                {item.menuItem.name}
              </span>
            </div>
          ))}
        </div>

        {/* Payment status badge + verify button */}
        <div className="flex items-center justify-between mb-3">
          <span className={`flex items-center text-xs font-bold px-2 py-1 rounded gap-1 ${
            (order.paymentMode || 'CASH') === 'ONLINE'
              ? 'bg-blue-50 text-blue-600'
              : order.paymentVerified
              ? 'bg-green-50 text-green-700'
              : 'bg-yellow-50 text-yellow-700'
          }`}>
            {(order.paymentMode || 'CASH') === 'ONLINE'
              ? <><CreditCard className="w-3 h-3" /> Online</>  
              : <><Banknote className="w-3 h-3" /> Cash</>}
          </span>
          {(order.paymentMode || 'CASH') === 'CASH' && !order.paymentVerified && (
            <button
              onClick={() => verifyPayment(order.id)}
              className="flex items-center text-xs font-bold px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-black rounded transition-colors gap-1"
            >
              <ShieldCheck className="w-3 h-3" />
              Mark as Paid
            </button>
          )}
          {order.paymentVerified && (
            <span className="flex items-center text-xs font-bold text-green-600 gap-1">
              <ShieldCheck className="w-3 h-3" /> Paid
            </span>
          )}
        </div>

        <button 
          onClick={() => updateOrderStatus(order.id, nextStatus)}
          className={`w-full font-bold py-2.5 transition-colors flex items-center justify-center text-sm ${buttonClass}`}
        >
          <Icon className="w-4 h-4 mr-2" />
          {nextLabel}
        </button>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f7986]">Order Dashboard</h1>
          <p className="text-gray-400 mt-1 text-sm">Auto-refreshing every 5s</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Pending Column */}
        <div className="bg-white p-4 border border-black">
          <div className="flex justify-between items-center mb-5 px-1 border-b border-black pb-3">
            <h2 className="text-xl font-bold text-gray-800">Pending</h2>
            <span className="bg-gray-100 text-gray-600 text-sm font-bold px-3 py-1 rounded-full">{pendingOrders.length}</span>
          </div>
          <div className="space-y-4 min-h-[200px]">
            {pendingOrders.length === 0 && <p className="text-center text-gray-300 py-8 text-sm">No pending orders</p>}
            {pendingOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                nextStatus="PREPARING" 
                nextLabel="Start Preparing" 
                icon={ChefHat}
                colorClass="border-l-gray-400"
                buttonClass="bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200"
              />
            ))}
          </div>
        </div>

        {/* Preparing Column */}
        <div className="bg-white p-4 border border-black">
          <div className="flex justify-between items-center mb-5 px-1 border-b border-black pb-3">
            <h2 className="text-xl font-bold text-gray-800">Preparing</h2>
            <span className="bg-gray-100 text-gray-600 text-sm font-bold px-3 py-1 rounded-full">{preparingOrders.length}</span>
          </div>
          <div className="space-y-4 min-h-[200px]">
            {preparingOrders.length === 0 && <p className="text-center text-gray-300 py-8 text-sm">No orders in preparation</p>}
            {preparingOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                nextStatus="FINISHED" 
                nextLabel="Mark as Finished" 
                icon={Check}
                colorClass="border-l-gray-400"
                buttonClass="bg-[#0054c6] hover:bg-[#003d91] text-white"
              />
            ))}
          </div>
        </div>

        {/* Finished Column */}
        <div className="bg-white p-4 border border-black">
          <div className="flex justify-between items-center mb-5 px-1 border-b border-black pb-3">
            <h2 className="text-xl font-bold text-gray-800">Finished</h2>
            <span className="bg-gray-100 text-gray-600 text-sm font-bold px-3 py-1 rounded-full">{finishedOrders.length}</span>
          </div>
          <div className="space-y-4 min-h-[200px]">
            {finishedOrders.length === 0 && <p className="text-center text-gray-300 py-8 text-sm">No finished orders</p>}
            {finishedOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                nextStatus="COMPLETED" 
                nextLabel="Handed Over (Clear)" 
                icon={CheckCircle2}
                colorClass="border-l-gray-400"
                buttonClass="bg-[#0f7986] hover:bg-[#0a5f6b] text-white"
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
