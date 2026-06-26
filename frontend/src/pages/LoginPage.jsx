import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { User, Lock, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('cafe_token')) {
      navigate('/hub');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { username, password });
      const { token, cafeName, adminPasscode, orderPasscode } = response.data;
      localStorage.setItem('cafe_token', token);
      localStorage.setItem('cafe_name', cafeName);
      localStorage.setItem('cafe_admin_passcode', adminPasscode || '');
      localStorage.setItem('cafe_order_passcode', orderPasscode || '');
      navigate('/hub');
    } catch (err) {
      setError('Invalid credentials');
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
      
      <div className="bg-white w-full max-w-md p-6 sm:p-10 rounded-2xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        <div className="text-center mb-10">
          <Link to="/" className="inline-block text-3xl font-black text-gray-900 tracking-tight mb-2">
            Nowait
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Welcome back</h1>
          <p className="text-gray-500 mt-2 font-light">Enter your details to access your dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <User className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0054c6] focus:border-[#0054c6] focus:bg-white outline-none transition-all text-gray-800"
                placeholder="Enter username"
                required
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
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0054c6] focus:border-[#0054c6] focus:bg-white outline-none transition-all text-gray-800"
                placeholder="Enter password"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0054c6] hover:bg-blue-800 text-white font-bold text-lg py-3.5 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:hover:bg-[#0054c6] mt-4"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <span className="text-gray-500">Don't have an account? </span>
            <Link to="/register" className="text-[#0054c6] hover:text-blue-800 font-bold ml-1 transition-colors">
              Register now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
