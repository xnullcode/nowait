import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Users, Settings, LogOut, X, Eye, EyeOff } from 'lucide-react';

export default function HubPage() {
  const navigate = useNavigate();
  const cafeName = localStorage.getItem('cafe_name');
  const token = localStorage.getItem('cafe_token');

  const [modal, setModal] = useState(null); // 'admin' | 'order' | null
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('cafe_token');
    localStorage.removeItem('cafe_name');
    localStorage.removeItem('cafe_admin_passcode');
    localStorage.removeItem('cafe_order_passcode');
    navigate('/login');
  };

  const openModal = (type) => {
    setModal(type);
    setPasscodeInput('');
    setPasscodeError('');
    setShowPasscode(false);
  };

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    const stored =
      modal === 'admin'
        ? localStorage.getItem('cafe_admin_passcode')
        : localStorage.getItem('cafe_order_passcode');

    if (passcodeInput === stored) {
      setModal(null);
      navigate(modal === 'admin' ? '/admin' : '/staff');
    } else {
      setPasscodeError('Incorrect passcode. Try again.');
      setPasscodeInput('');
    }
  };

  const panels = [
    {
      key: 'kiosk',
      tag: '[CUSTOMER KIOSK]',
      title: 'Customer Kiosk',
      desc: 'Launch the self-ordering touchscreen for your cafe tables. Keep this open on counter tablets.',
      icon: <Monitor className="w-8 h-8" />,
      action: () => navigate('/welcome'),
      accent: '#f8fc52',
      accentText: 'black',
    },
    {
      key: 'order',
      tag: '[STAFF DASHBOARD]',
      title: 'Order Dashboard',
      desc: 'Real-time incoming orders for your staff. Mark items as completed as they are fulfilled.',
      icon: <Users className="w-8 h-8" />,
      action: () => openModal('order'),
      accent: '#0f7986',
      accentText: 'white',
    },
    {
      key: 'admin',
      tag: '[ADMIN PANEL]',
      title: 'Admin Panel',
      desc: 'Manage your product catalog, view order history, and configure cafe settings.',
      icon: <Settings className="w-8 h-8" />,
      action: () => openModal('admin'),
      accent: '#0054c6',
      accentText: 'white',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">


      {/* Main */}
      <main className="flex-grow px-6 sm:px-12 lg:px-20 py-16">
        {/* Hero text */}
        <div className="max-w-2xl mb-16">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight tracking-tight">
            Where do you want<br />to go today?
          </h1>
          <p className="text-gray-500 mt-4 text-lg">
            Select a panel below. Protected panels require your passcode.
          </p>
        </div>

        {/* Panel cards — reference-image style */}
        <div className="grid grid-cols-1 sm:grid-cols-3 bg-white border-t border-b border-gray-200">
          {panels.map((panel, idx) => (
            <div
              key={panel.key}
              className={`bg-white text-left p-10 flex flex-col min-h-[380px] ${idx !== 2 ? 'border-r border-gray-200' : ''}`}
            >
              <div>

                <div
                  className="w-16 h-16 flex items-center justify-center mb-6 rounded-md"
                  style={{ backgroundColor: panel.accent, color: panel.accentText }}
                >
                  {panel.icon}
                </div>
                <h2 className="text-2xl font-black text-[#1a1f2e] mb-4 tracking-tight">{panel.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed pr-4">{panel.desc}</p>
              </div>
              <div className="mt-auto pt-8">
                <button
                  onClick={panel.action}
                  className="inline-flex items-center justify-center border text-xs font-mono font-bold uppercase px-6 py-3 tracking-wider transition-colors bg-white focus:outline-none"
                  style={{
                    borderColor: panel.accent,
                    color: panel.accent === '#f8fc52' ? 'black' : panel.accent,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = panel.accent;
                    e.currentTarget.style.color = panel.accentText;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = panel.accent === '#f8fc52' ? 'black' : panel.accent;
                  }}
                >
                  Launch &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Passcode Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm mx-4 border border-gray-200 shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div>

                <h2 className="text-xl font-black text-gray-900">Enter Passcode</h2>
              </div>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasscodeSubmit} className="px-6 py-6 space-y-4">
              <div className="relative">
                <input
                  autoFocus
                  type={showPasscode ? 'text' : 'password'}
                  value={passcodeInput}
                  onChange={e => { setPasscodeInput(e.target.value); setPasscodeError(''); }}
                  placeholder="Enter passcode"
                  className="w-full px-4 py-3 border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-gray-900 font-mono text-lg tracking-widest pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(v => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-700"
                >
                  {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {passcodeError && (
                <p className="text-sm text-red-600 font-medium">{passcodeError}</p>
              )}

              <button
                type="submit"
                className="w-full bg-gray-900 hover:bg-[#0f7986] text-white font-bold py-3 transition-colors font-mono uppercase tracking-wider text-sm"
              >
                Unlock →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
