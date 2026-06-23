import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { User, Lock, Store, Shield, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cafeName, setCafeName] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [orderPasscode, setOrderPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('cafe_token')) {
      navigate('/hub');
    }
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        username, password, cafeName, adminPasscode, orderPasscode
      });
      const { token, cafeName: returnedCafeName, adminPasscode: ap, orderPasscode: op } = response.data;
      localStorage.setItem('cafe_token', token);
      localStorage.setItem('cafe_name', returnedCafeName);
      localStorage.setItem('cafe_admin_passcode', ap || '');
      localStorage.setItem('cafe_order_passcode', op || '');
      navigate('/hub');
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = 'Registration failed';
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData && errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="min-h-screen flex items-center justify-center bg-[#0f7986] px-4 py-16 relative">
      <Link to="/" className="absolute top-8 left-8 text-white/80 hover:text-white flex items-center transition-colors font-medium">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </Link>
      
      <div className="bg-white w-full max-w-md p-10 rounded-2xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-3xl font-black text-gray-900 tracking-tight mb-2">
            Nowait
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Create your account</h1>
          <p className="text-gray-500 mt-2 font-light">Set up your multi-tenant cafe platform</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Cafe Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Store className="w-5 h-5" />
              </div>
              <input 
                type="text" value={cafeName} onChange={(e) => setCafeName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0054c6] focus:border-[#0054c6] focus:bg-white outline-none transition-all text-gray-800"
                placeholder="e.g. The Daily Grind" required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <User className="w-5 h-5" />
              </div>
              <input 
                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0054c6] focus:border-[#0054c6] focus:bg-white outline-none transition-all text-gray-800"
                placeholder="Enter username" required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <input 
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0054c6] focus:border-[#0054c6] focus:bg-white outline-none transition-all text-gray-800"
                placeholder="Enter password" required
              />
            </div>
          </div>

          <div className="pt-2 pb-1">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-4 h-4 text-[#0f7986]" />
              <p className="text-sm font-bold text-gray-700">Panel Passcodes</p>
            </div>
            <p className="text-xs text-gray-500 mb-3">Set numeric or text passcodes to lock your admin and order panels from customers and staff.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Admin Passcode</label>
                <input 
                  type="password" value={adminPasscode} onChange={(e) => setAdminPasscode(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0054c6] focus:border-[#0054c6] focus:bg-white outline-none transition-all text-gray-800 text-sm"
                  placeholder="Admin PIN" required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Staff Passcode</label>
                <input 
                  type="password" value={orderPasscode} onChange={(e) => setOrderPasscode(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0054c6] focus:border-[#0054c6] focus:bg-white outline-none transition-all text-gray-800 text-sm"
                  placeholder="Staff PIN" required
                />
              </div>
            </div>
          </div>
          
          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#0054c6] hover:bg-blue-800 text-white font-bold text-lg py-3 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:hover:bg-[#0054c6] mt-2"
          >
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>

          <div className="text-center mt-4 pt-4 border-t border-gray-100">
            <span className="text-gray-500">Already have an account? </span>
            <Link to="/login" className="text-[#0054c6] hover:text-blue-800 font-bold ml-1 transition-colors">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
