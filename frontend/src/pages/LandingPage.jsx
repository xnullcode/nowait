import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cafeName, setCafeName] = useState('');

  useEffect(() => {
    if (localStorage.getItem('cafe_token')) {
      setIsLoggedIn(true);
      setCafeName(localStorage.getItem('cafe_name') || 'Cafe');
    }

    const handleScroll = () => {
      const sections = ['benefits', 'features', 'opensource'];
      let current = '';

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Highlight section if it's in the top third of the viewport
          if (rect.top <= window.innerHeight / 3) {
            current = section;
          }
        }
      }
      
      // If we're at the very top, clear active or set to first
      if (window.scrollY < 100) {
        current = '';
      }

      if (current !== activeSection) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger once on load
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  const navLinks = [
    { id: 'benefits', label: 'Benefits' },
    { id: 'features', label: 'Features' },
    { id: 'opensource', label: 'Open Source' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-12">
          <Link to="/" className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
            Nowait
          </Link>
          <div className="hidden lg:flex space-x-8 text-base font-medium text-gray-600">
            {navLinks.map(link => (
              <a 
                key={link.id}
                href={`#${link.id}`} 
                className={`transition-colors ${
                  activeSection === link.id 
                    ? 'text-[#0054c6] border-b-2 border-[#0054c6] pb-5 -mb-[21px]' 
                    : 'hover:text-[#0054c6]'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4 md:space-x-6">
          {isLoggedIn ? (
            <Link to="/hub" className="flex items-center bg-[#0054c6] hover:bg-blue-800 text-white text-base font-bold py-2 px-5 rounded transition-colors space-x-2">
              <span>{cafeName}</span>
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-base font-bold text-gray-800 hover:text-[#0054c6] transition-colors">Login</Link>
              <Link to="/register" className="bg-[#0054c6] hover:bg-blue-800 text-white text-base font-bold py-2.5 px-6 rounded transition-colors">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-[#0f7986] text-white pt-24 pb-0 md:pb-24 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 z-10 lg:pr-12 mb-16 lg:mb-0">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">Nowait</h1>
            <p className="text-xl md:text-2xl mb-10 text-teal-50 max-w-xl leading-relaxed font-light">
              A modern, full-stack café ordering system that eliminates queues. Streamline your operations with a digital kiosk today.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {isLoggedIn ? (
                <Link to="/hub" className="inline-block bg-white text-[#0054c6] font-bold text-lg py-4 px-10 rounded shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all text-center">
                  Go to Hub
                </Link>
              ) : (
                <Link to="/register" className="inline-block bg-white text-[#0054c6] font-bold text-lg py-4 px-10 rounded shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all text-center">
                  Get Started
                </Link>
              )}
              <a href="https://github.com/xnullcode/nowait" className="inline-block bg-transparent border-2 border-white text-white font-bold text-lg py-4 px-10 rounded hover:bg-white/10 transition-all text-center">
                Contribute
              </a>
            </div>
          </div>
          <div className="lg:w-1/2 relative flex justify-center lg:justify-end">
            <img 
              src="/assets/pos_mockup_hero.png" 
              alt="Nowait Dashboard Interface" 
              className="w-full lg:w-[120%] max-w-none rounded-t-xl lg:rounded-tl-xl lg:rounded-tr-none shadow-2xl border-t-8 border-l-8 lg:border-r-0 border-gray-200/20 translate-y-8 lg:translate-y-0 lg:translate-x-12"
            />
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="pt-24 pb-12 px-6 md:px-12 max-w-[1400px] mx-auto scroll-mt-24">
        <h2 className="text-4xl font-bold text-gray-900 mb-8">What is Nowait?</h2>
        <p className="text-xl text-gray-600 max-w-5xl leading-relaxed">
          Nowait is an open-source, multi-tenant SaaS platform built to eliminate the friction of ordering. It provides a beautifully designed digital kiosk for your customers, while giving cafe owners powerful real-time tools to manage operations.
        </p>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-12 px-6 md:px-12 max-w-[1400px] mx-auto scroll-mt-24">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="lg:w-3/5">
             <img src="/assets/pos_mockup_tablet.png" alt="Nowait on Tablet" className="w-full rounded-3xl shadow-2xl border border-gray-200 object-cover" />
          </div>
          <div className="lg:w-2/5">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
              A comprehensive solution designed for both cafe owners and their customers:
            </h3>
            <ul className="space-y-6 text-gray-600 text-lg">
              <li className="flex items-start">
                <span className="mr-4 text-3xl leading-none text-[#0054c6]">&bull;</span> 
                <span><strong>For café owners:</strong> Streamline operations with a digital kiosk. Manage products, track orders in real-time, and coordinate staff effortlessly.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-4 text-3xl leading-none text-[#0054c6]">&bull;</span> 
                <span><strong>For customers:</strong> No waiting in line. Order from a beautifully designed touchscreen kiosk. Quick, frictionless ordering experience.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-4 text-3xl leading-none text-[#0054c6]">&bull;</span> 
                <span><strong>Multi-tenant SaaS:</strong> One platform, multiple cafés. Each café's data is fully isolated and secure.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-4 text-3xl leading-none text-[#0054c6]">&bull;</span> 
                <span><strong>Open Source:</strong> Available for everyone. Deploy it on any table tablet, and contribute to adding exciting new features!</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 md:px-12 bg-gray-50 border-t border-gray-200 scroll-mt-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-20">
            {/* Feature 1 */}
            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-6">Digital Kiosk Experience</h4>
              <ul className="space-y-4 text-gray-600 text-base">
                <li className="flex items-start"><span className="mr-2">&bull;</span> Beautifully designed, modern touchscreen interface.</li>
                <li className="flex items-start"><span className="mr-2">&bull;</span> Quick, frictionless ordering experience.</li>
                <li className="flex items-start"><span className="mr-2">&bull;</span> Completely eliminates the need for customers to wait in line.</li>
              </ul>
            </div>
            {/* Feature 2 */}
            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-6">Real-time Operations</h4>
              <ul className="space-y-4 text-gray-600 text-base">
                <li className="flex items-start"><span className="mr-2">&bull;</span> Track incoming orders in real-time from the dashboard.</li>
                <li className="flex items-start"><span className="mr-2">&bull;</span> Streamline staff coordination and order fulfillment.</li>
                <li className="flex items-start"><span className="mr-2">&bull;</span> Manage your products, stock, and pricing instantly.</li>
              </ul>
            </div>
            {/* Feature 3 */}
            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-6">Multi-tenant Architecture</h4>
              <ul className="space-y-4 text-gray-600 text-base">
                <li className="flex items-start"><span className="mr-2">&bull;</span> One scalable platform serving multiple independent cafés.</li>
                <li className="flex items-start"><span className="mr-2">&bull;</span> Each tenant's data and configuration is fully isolated.</li>
                <li className="flex items-start"><span className="mr-2">&bull;</span> Reliable, secure, and built for robust multi-cafe scaling.</li>
              </ul>
            </div>
            {/* Feature 4 */}
            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-6">Table-ready Hardware</h4>
              <ul className="space-y-4 text-gray-600 text-base">
                <li className="flex items-start"><span className="mr-2">&bull;</span> Deploy easily on iPads or Android tablets.</li>
                <li className="flex items-start"><span className="mr-2">&bull;</span> Can be used as a central kiosk or stationed at individual tables.</li>
                <li className="flex items-start"><span className="mr-2">&bull;</span> Empower self-service everywhere in your shop.</li>
              </ul>
            </div>
            {/* Feature 5 */}
            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-6">Open Source Community</h4>
              <ul className="space-y-4 text-gray-600 text-base">
                <li className="flex items-start"><span className="mr-2">&bull;</span> Completely open source and available for everyone to use.</li>
                <li className="flex items-start"><span className="mr-2">&bull;</span> Anyone can contribute code and suggest new features.</li>
                <li className="flex items-start"><span className="mr-2">&bull;</span> Driven by a community passionate about cafe technology.</li>
              </ul>
            </div>
            {/* Feature 6 */}
            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-6">Frictionless Onboarding</h4>
              <ul className="space-y-4 text-gray-600 text-base">
                <li className="flex items-start"><span className="mr-2">&bull;</span> Register your cafe in seconds and log in instantly.</li>
                <li className="flex items-start"><span className="mr-2">&bull;</span> Customize your menu and branding effortlessly.</li>
                <li className="flex items-start"><span className="mr-2">&bull;</span> Start taking digital orders on day one.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source Dedicated Section */}
      <section id="opensource" className="py-24 px-6 md:px-12 bg-[#0f7986] text-white scroll-mt-24">
        <div className="max-w-[1400px] mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Built for the Community</h2>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto mb-12 leading-relaxed text-teal-50 font-light">
            Nowait is 100% open-source and free for anyone to deploy. We believe that modern, frictionless cafe experiences shouldn't be locked behind expensive enterprise contracts.
          </p>
          <a href="https://github.com/xnullcode/nowait" className="inline-block bg-white text-[#0054c6] font-bold text-xl py-5 px-12 rounded shadow-xl hover:bg-gray-50 hover:-translate-y-1 transition-all">
            View on GitHub
          </a>
        </div>
      </section>

        {/* Floating Contact Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <a 
          href="https://www.linkedin.com/in/xnullcode/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-[#0054c6] hover:bg-blue-800 text-white font-bold py-4 px-6 rounded shadow-2xl flex items-center"
        >
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          Contact
        </a>
      </div>
    </div>
  );
}
