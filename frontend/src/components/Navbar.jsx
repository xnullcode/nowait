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
    <nav className="sticky top-0 z-50 bg-white border-b border-black">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/hub" className="flex items-center hover:opacity-80 transition-opacity">
            <div className="bg-[#f8fc52] text-black w-8 h-8 flex items-center justify-center font-black text-xl mr-3 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              N
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight uppercase">Nowait</span>
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <span className="text-xl text-gray-800 tracking-wide" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
            {cafeName}
          </span>
        </div>
        
        <button 
          onClick={handleLogout} 
          className="flex items-center px-5 py-2 border border-black text-xs font-mono font-bold uppercase tracking-wider text-black bg-white hover:bg-[#0f7986] hover:text-white transition-colors focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]" 
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    </nav>
  );
}
