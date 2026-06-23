import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Plus, Pencil, Trash2, Image as ImageIcon, Loader2, Package, History, Settings as SettingsIcon, Clock, Banknote, CreditCard, ShieldCheck } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Assets in /public load directly; uploads come from backend
const getImageSrc = (path) => {
    if (!path) return null;
    if (path.startsWith('/assets/')) return path;      
    if (path.startsWith('http')) return path;          
    return `${backendUrl}${path}`;  
};

const PREDEFINED_CATEGORIES = ['Bowls & salads', 'Wraps & sandwiches', 'Baked goods', 'Beverages'];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('products');

  // Products State
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', category: PREDEFINED_CATEGORIES[0], description: '', stock: '0' });
  const [customCategoryMode, setCustomCategoryMode] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);

  // History State
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Settings State
  const [settingsData, setSettingsData] = useState({
    username: '',
    password: '',
    cafeName: localStorage.getItem('cafe_name') || '',
    adminPasscode: '',
    orderPasscode: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState({ type: '', text: '' });

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/menu');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/api/orders');
      setHistoryOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'history') fetchHistory();
  }, [activeTab]);

  // Product Methods
  const openModal = (product = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description || '',
        stock: product.stock,
      });
      setCustomCategoryMode(!PREDEFINED_CATEGORIES.includes(product.category));
    } else {
      setEditingId(null);
      setFormData({ name: '', price: '', category: PREDEFINED_CATEGORIES[0], description: '', stock: '0' });
      setCustomCategoryMode(false);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSavingProduct(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('description', formData.description);
    data.append('stock', formData.stock);
    if (imageFile) data.append('image', imageFile);

    try {
      if (editingId) {
        await api.put(`/api/products/${editingId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/api/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert('Error saving product');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Error deleting product');
    }
  };

  // Settings Method
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMessage({ type: '', text: '' });

    try {
      const res = await api.put('/api/user/settings', settingsData);
      const { token, cafeName, adminPasscode, orderPasscode } = res.data;

      if (token) {
        localStorage.setItem('cafe_token', token);
        localStorage.setItem('cafe_name', cafeName);
      }
      if (adminPasscode !== undefined) localStorage.setItem('cafe_admin_passcode', adminPasscode);
      if (orderPasscode !== undefined) localStorage.setItem('cafe_order_passcode', orderPasscode);

      setSettingsData(prev => ({ ...prev, password: '', username: '', adminPasscode: '', orderPasscode: '' }));
      setSettingsMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch (err) {
      setSettingsMessage({ type: 'error', text: err.response?.data || 'Failed to update settings' });
    } finally {
      setSavingSettings(false);
    }
  };

  const navItems = [
    { key: 'products', label: 'Products', icon: <Package className="w-5 h-5" /> },
    { key: 'history', label: 'Order History', icon: <History className="w-5 h-5" /> },
    { key: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-56 flex-shrink-0">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-24">
          <nav>
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-semibold transition-colors border-l-2 ${
                  activeTab === item.key
                    ? 'border-[#0f7986] bg-[#0f7986]/5 text-[#0f7986]'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-black text-gray-900">Product Management</h1>
              </div>
              <button
                onClick={() => openModal()}
                className="bg-[#0f7986] hover:bg-[#0d6b77] text-white font-bold py-2 px-4 rounded flex items-center transition-colors text-sm"
              >
                <Plus className="w-4 h-4 mr-1" /> New
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-mono text-gray-400 uppercase tracking-wider">
                      <th className="p-4">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loadingProducts ? (
                      <tr><td colSpan="5" className="p-8 text-center text-gray-400 text-sm">Loading products...</td></tr>
                    ) : products.length === 0 ? (
                      <tr><td colSpan="5" className="p-8 text-center text-gray-400 text-sm">No products yet. Add one above.</td></tr>
                    ) : products.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                              {p.imageFileName ? (
                                <img
                                  src={getImageSrc(p.imageFileName)}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-gray-300" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                              <p className="text-xs text-gray-400 truncate max-w-[180px]">{p.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-500 capitalize">{p.category}</td>
                        <td className="p-4 text-sm font-semibold text-gray-900">₹{Number(p.price).toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded ${p.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                            {p.stock > 0 ? `${p.stock}` : 'Out'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1">
                          <button onClick={() => openModal(p)} className="p-2 text-gray-400 hover:text-[#0054c6] hover:bg-blue-50 rounded transition-colors inline-flex">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors inline-flex">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-black text-gray-900">All Orders</h1>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-mono text-gray-400 uppercase tracking-wider">
                      <th className="p-4">Order</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loadingHistory ? (
                      <tr><td colSpan="6" className="p-8 text-center text-gray-400 text-sm">Loading...</td></tr>
                    ) : historyOrders.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-gray-400 text-sm">No orders yet.</td></tr>
                    ) : historyOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-bold text-gray-900 text-sm">#{order.id}</td>
                        <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-300" />
                            {new Date(order.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-medium text-gray-800">{order.customerName || '—'}</td>
                        <td className="p-4 text-xs text-gray-400 max-w-[200px] truncate">
                          {order.items.map(i => `${i.quantity}× ${i.menuItem.name}`).join(', ')}
                        </td>
                        <td className="p-4 text-sm font-bold text-[#0f7986]">₹{Number(order.totalPrice).toFixed(2)}</td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded w-fit ${
                              (order.paymentMode || 'CASH') === 'ONLINE' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {(order.paymentMode || 'CASH') === 'ONLINE'
                                ? <><CreditCard className="w-3 h-3" /> Online</>
                                : <><Banknote className="w-3 h-3" /> Cash</>}
                            </span>
                            {order.paymentVerified
                              ? <span className="inline-flex items-center gap-1 text-xs text-green-600 font-bold"><ShieldCheck className="w-3 h-3" /> Paid</span>
                              : <span className="text-xs text-yellow-600 font-bold">Unpaid</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded ${
                            order.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-[#0054c6]'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-lg">
            <div className="mb-6">
              <h1 className="text-2xl font-black text-gray-900">Account Settings</h1>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
              {settingsMessage.text && (
                <div className={`px-6 py-4 text-sm font-medium ${settingsMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {settingsMessage.text}
                </div>
              )}

              <div className="px-6 py-5 space-y-4">
                <p className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-widest">Enter New Details</p>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Cafe Name</label>
                  <input
                    type="text" value={settingsData.cafeName}
                    onChange={e => setSettingsData({ ...settingsData, cafeName: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded focus:ring-2 focus:ring-[#0f7986] focus:border-[#0f7986] outline-none text-sm transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">New Username</label>
                  <input
                    type="text" value={settingsData.username}
                    onChange={e => setSettingsData({ ...settingsData, username: e.target.value })}
                    placeholder="Leave blank to keep current"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded focus:ring-2 focus:ring-[#0f7986] focus:border-[#0f7986] outline-none text-sm transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">New Password</label>
                  <input
                    type="password" value={settingsData.password}
                    onChange={e => setSettingsData({ ...settingsData, password: e.target.value })}
                    placeholder="Leave blank to keep current"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded focus:ring-2 focus:ring-[#0f7986] focus:border-[#0f7986] outline-none text-sm transition-shadow"
                  />
                </div>
              </div>

              <div className="px-6 py-5 space-y-4">
                <p className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-widest">Panel Passcodes</p>
                <p className="text-xs text-gray-400">Leave blank to keep existing passcode.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Admin Passcode</label>
                    <input
                      type="password" value={settingsData.adminPasscode}
                      onChange={e => setSettingsData({ ...settingsData, adminPasscode: e.target.value })}
                      placeholder="New admin PIN"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded focus:ring-2 focus:ring-[#0f7986] focus:border-[#0f7986] outline-none text-sm font-mono transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Staff Passcode</label>
                    <input
                      type="password" value={settingsData.orderPasscode}
                      onChange={e => setSettingsData({ ...settingsData, orderPasscode: e.target.value })}
                      placeholder="New staff PIN"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded focus:ring-2 focus:ring-[#0f7986] focus:border-[#0f7986] outline-none text-sm font-mono transition-shadow"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <button
                  type="submit" disabled={savingSettings}
                  className="w-full bg-[#0f7986] hover:bg-[#0d6b77] disabled:bg-gray-200 text-white disabled:text-gray-400 font-bold py-3 rounded text-sm transition-colors flex justify-center items-center"
                >
                  {savingSettings ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg border border-gray-200 shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>

                <h2 className="text-lg font-black text-gray-900">{editingId ? 'Edit Product' : 'Add Product'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 text-2xl leading-none">&times;</button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              <form id="productForm" onSubmit={handleSaveProduct} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Name</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-[#0f7986] outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Price (₹)</label>
                    <input type="number" step="0.01" min="0" required value={formData.price} 
                      onKeyDown={e => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-[#0f7986] outline-none text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Category</label>
                    {!customCategoryMode ? (
                      <select 
                        required 
                        value={formData.category} 
                        onChange={e => {
                          if (e.target.value === 'Other') {
                            setCustomCategoryMode(true);
                            setFormData({ ...formData, category: '' });
                          } else {
                            setFormData({ ...formData, category: e.target.value });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-[#0f7986] outline-none text-sm bg-white"
                      >
                        {PREDEFINED_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="Other">Other (Type manually...)</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          required 
                          placeholder="Type category..."
                          value={formData.category} 
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-[#0f7986] outline-none text-sm" 
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            setCustomCategoryMode(false);
                            setFormData({ ...formData, category: PREDEFINED_CATEGORIES[0] });
                          }}
                          className="px-3 py-2 bg-gray-100 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Stock</label>
                    <input type="number" min="0" required value={formData.stock} 
                      onKeyDown={e => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); }}
                      onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-[#0f7986] outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Description</label>
                  <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-[#0f7986] outline-none text-sm resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Image</label>
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
              <button onClick={() => setIsModalOpen(false)} type="button" className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded font-bold transition-colors">Cancel</button>
              <button form="productForm" type="submit" disabled={savingProduct}
                className="px-4 py-2 bg-[#0f7986] hover:bg-[#0d6b77] disabled:bg-gray-200 text-white disabled:text-gray-400 rounded font-bold text-sm transition-colors flex items-center">
                {savingProduct ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
