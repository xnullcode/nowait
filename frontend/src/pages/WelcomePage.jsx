import { useNavigate } from 'react-router-dom';

export default function WelcomePage() {
  const navigate = useNavigate();
  const cafeName = localStorage.getItem('cafe_name') || 'Harvest';

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ backgroundColor: '#fcfcfc' }}>
      {/* Top Section */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex flex-col">
        {/* Header */}
        <div className="mb-16">
	       <h1 
	  className="text-4xl font-bold italic tracking-wider" 
	  style={{ 
	    fontFamily: 'Arial, sans-serif',
	    color: '#f5f862', 
	    WebkitTextStroke: '1.5px black'
	  }}
	>
            {cafeName.toUpperCase()}
          </h1>
        </div>

        {/* Hero Content */}
        <div className="flex flex-col md:flex-row items-center justify-between flex-1 gap-12">
          {/* Left: Text & Button */}
          <div className="w-full md:w-1/2 space-y-10">
            <h2 className="text-5xl md:text-7xl font-loubag font-bold text-black leading-tight tracking-tight">
              Your cozy corner for fresh, flavorful, and 100% plant-based goodness
            </h2>
            <button 
              onClick={() => navigate('/menu')}
              className="px-8 py-3 rounded-full bg-white border-2 border-[#f5f862] text-black font-medium hover:bg-[#f5f862] hover:border-black transition-colors text-lg"
            >
              Explore our menu
            </button>
          </div>

          {/* Right: Illustration */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <img 
              src="/assets/cafe_items_sketch.png" 
              alt="Hand-drawn cafe items" 
              className="max-w-full h-auto object-contain"
              style={{ maxHeight: '450px' }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-[#f5f862] border-t-8 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Left: Text */}
            <div className="w-full md:w-1/2 space-y-6">
              <h2 className="text-4xl md:text-5xl font-loubag font-bold text-black leading-tight tracking-tight">
                A place to savor<br />and slow down
              </h2>
              <p className="text-black text-lg md:text-xl font-medium max-w-md leading-relaxed">
                At {cafeName}, every dish tells a story of freshness, flavor, and care. Our all-vegan menu celebrates the best of plant-based cooking: colorful bowls, hearty wraps, baked treats, and smooth dairy-free lattes - all made with locally sourced ingredients.
              </p>
            </div>

            {/* Right: Illustration */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-end">
		<img
		  src="/assets/people_cafe_sketch.png"
		  alt="Hand-drawn cafe items"
		  className="max-w-full h-auto object-contain"
		/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
