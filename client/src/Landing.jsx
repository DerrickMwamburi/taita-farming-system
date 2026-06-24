import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle'; // <-- Import the new toggle!

export default function Landing() {
  const marketPrices = [
    { crop: 'Maize (90kg)', price: 'KES 3,200', trend: 'up' },
    { crop: 'Beans (90kg)', price: 'KES 8,500', trend: 'down' },
    { crop: 'Tomatoes (Crate)', price: 'KES 2,800', trend: 'up' },
    { crop: 'Cabbage (Net)', price: 'KES 1,200', trend: 'stable' }
  ];

  const newsArticles = [
    { title: 'New Irrigation Subsidies Announced for Taita-Taveta Farmers', date: 'June 15, 2026', readTime: '5 min read' },
    { title: 'How to Prepare Your Soil for the Upcoming Short Rains', date: 'June 12, 2026', readTime: '8 min read' },
    { title: 'Market Alert: High Demand for Drought-Resistant Sorghum', date: 'June 10, 2026', readTime: '3 min read' }
  ];

  return (
    // Added dark:bg-gray-900 to the main wrapper
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans transition-colors duration-300">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">AgriNet<span className="text-green-600">.</span></span>
            </div>
            <div className="flex gap-4 items-center">
              {/* Drop in the toggle button here! */}
              <ThemeToggle />
              
              <Link to="/login" className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-500 font-medium px-3 py-2 text-sm transition-colors">
                Admin Portal
              </Link>
              <Link to="/register" className="bg-green-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-green-700 transition-colors text-sm shadow-sm">
                Register Your Farm 
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION (Already dark, so it needs minimal changes) --- */}
      <main className="flex-grow">
        <div className="relative bg-gray-900 text-white overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-green-900 to-gray-900 opacity-90 mix-blend-multiply"></div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col items-center text-center">
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30 mb-6 uppercase tracking-wider">
              Taita-Taveta County
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              Empowering the Next Generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Farmers</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed">
              Join our centralized agricultural network. Register your farm, track regional analytics, and access exclusive resources to maximize your seasonal yield.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
              <Link to="/register" className="bg-green-500 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-green-400 transition-all shadow-lg hover:shadow-green-500/25">
                Register Your Farm Now
              </Link>
              <Link to="/login" className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-sm">
                Farmer Login
              </Link>
            </div>
          </div>
        </div>

        {/* --- LIVE MARKET ANALYTICS --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-10">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 transition-colors duration-300">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                Live Regional Market Prices
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">Updated Today</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {marketPrices.map((item, index) => (
                <div key={index} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-500/50 transition-colors">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{item.crop}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{item.price}</p>
                    {item.trend === 'up' && <svg className="w-4 h-4 text-green-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>}
                    {item.trend === 'down' && <svg className="w-4 h-4 text-red-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>}
                    {item.trend === 'stable' && <svg className="w-4 h-4 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- CONTENT HUB: NEWS & PARTNERS --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* News Section */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 transition-colors">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"></path></svg>
                Agricultural Insights
              </h2>
              <div className="space-y-4">
                {newsArticles.map((article, index) => (
                  <div key={index} className="group bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all cursor-pointer">
                    <p className="text-xs text-green-600 dark:text-green-500 font-semibold mb-2">{article.date} • {article.readTime}</p>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{article.title}</h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">Learn about the latest techniques, government initiatives, and market shifts affecting the agricultural sector in our region this month.</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Partners Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 transition-colors">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                Supported By
              </h2>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Working together with leading organizations to support our farming community.</p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700">
                      <span className="font-bold text-gray-400 dark:text-gray-500">FAO</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">UN FAO Kenya</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Technical Advisory</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700">
                      <span className="font-bold text-gray-400 dark:text-gray-500">KALRO</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">KALRO</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Seed Research</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700">
                      <span className="font-bold text-gray-400 dark:text-gray-500">TTC</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Taita-Taveta Gov</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">County Administration</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">© {new Date().getFullYear()} AgriNet Taita-Taveta. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
}