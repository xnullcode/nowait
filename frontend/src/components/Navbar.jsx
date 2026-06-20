import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const [cafeName, setCafeName] = useState('');

  useEffect(() => {
    setCafeName(localStorage.getItem('cafe_name') || 'cafe');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cafe_token');
    localStorage.removeItem('cafe_name');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#E8F4F8] border-b border-gray-200">
      <div className="container mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/hub" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <span className="text-2xl font-black text-gray-900 tracking-tight">Nowait</span>
          <span className="text-gray-300 text-sm">|</span>
          <span className="text-sm font-medium text-slate-500">{cafeName}</span>
        </Link>
        
        <button 
          onClick={handleLogout} 
          className="flex items-center px-3 py-1.5 border border-gray-200 rounded text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-white hover:border-gray-300 transition-all focus:outline-none" 
        >
          <LogOut className="w-3.5 h-3.5 mr-2" />
          Logout
        </button>
      </div>
    </nav>
  );
}
