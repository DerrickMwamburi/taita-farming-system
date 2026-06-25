import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Landing() {
  // --- MARKET PRICES STATE ---
  const [marketPrices, setMarketPrices] = useState([]);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [priceError, setPriceError] = useState('');

  // --- NEWS FEED STATE ---
  const [newsArticles, setNewsArticles] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState('');

  // --- FETCH LOCAL MOCK MARKET DATA ---
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/market-prices/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) throw new Error('Failed to fetch live market data');
        
        const data = await response.json();
        
        const formattedPrices = data.prices.map(item => ({
          crop: item.crop_name,
          price: `KES ${item.current_price.toLocaleString()}`, 
          trend: item.price_trend 
        }));

        setMarketPrices(formattedPrices);
      } catch (err) {
        console.error("API Error:", err);
        setPriceError('Could not connect to the local market database. Showing cached data.');
        
        setMarketPrices([
          { crop: 'Maize (90kg)', price: 'KES 3,200', trend: 'up' },
          { crop: 'Groundnuts (90kg)', price: 'KES 8,500', trend: 'down' },
          { crop: 'Green Gram (Crate)', price: 'KES 2,800', trend: 'up' },
          { crop: 'Macadamia (Net)', price: 'KES 1,200', trend: 'stable' }
        ]);
      } finally {
        setPricesLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  // --- FETCH LIVE NEWS DATA ---
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        const apiKey = import.meta.env.VITE_NEWS_API_KEY;
        const response = await fetch(`https://gnews.io/api/v4/search?q=agriculture+kenya&lang=en&max=3&apikey=${apiKey}`);

        if (!response.ok) throw new Error('Failed to fetch live news');
        const data = await response.json();

        const formattedNews = data.articles.map(article => ({
          title: article.title,
          category: 'Industry News',
          tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
          date: new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          snippet: article.description,
          url: article.url
        }));

        setNewsArticles(formattedNews);
      } catch (err) {
        console.error("News API Error:", err);
        setNewsError('Live feed unavailable.');
        setNewsArticles([
          { 
            title: 'New Irrigation Subsidies Announced', 
            category: 'Policy',
            tagColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            date: 'June 15, 2026', 
            snippet: 'The County Government has released a new subsidy framework for drip irrigation systems in the region.',
            url: '#'
          },
          { 
            title: 'Short Rains Preparation & Soil Health', 
            category: 'Farming Guide',
            tagColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            date: 'June 12, 2026', 
            snippet: 'Agronomists from KALRO share the best practices for preparing your soil before the upcoming October rains.',
            url: '#'
          }
        ]);
      } finally {
        setNewsLoading(false);
      }
    };

    if (import.meta.env.VITE_NEWS_API_KEY) {
      fetchNewsData();
    } else {
      setNewsLoading(false);
      setNewsArticles([
          { 
            title: 'Waiting for API Key...', 
            category: 'System',
            tagColor: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
            date: 'Today', 
            snippet: 'Please add your VITE_NEWS_API_KEY to the .env file to see live agricultural news.',
            url: '#'
          }
      ]);
    }
  }, []);

  return (
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

      {/* --- HERO SECTION --- */}
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

         {/* --- HOW IT WORKS SECTION (New Section) --- */}
<div className="bg-white dark:bg-gray-900 py-16 transition-colors duration-300">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-12">How AgriNet Empowers You</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        { title: 'Register', desc: 'Securely register your farm and crop details into the county database.' },
        { title: 'Track', desc: 'Monitor your acreage, projected revenue, and seasonal crop cycles.' },
        { title: 'Grow', desc: 'Access real-time market data and expert advisory to increase your yield.' }
      ].map((item, i) => (
        <div key={i} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">{i + 1}</div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
</div>

        {/* --- LIVE MARKET ANALYTICS --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-10">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 transition-colors duration-300">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4 gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                  Live Regional Market Prices
                </h2>
                {!priceError && !pricesLoading && (
                  <span className="flex h-3 w-3 relative ml-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {priceError && <span className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">{priceError}</span>}
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-md flex items-center gap-1.5">
                  Powered by Local API Mock
                </span>
              </div>
            </div>
            
            {pricesLoading ? (
              <div className="flex justify-center items-center py-10">
                <svg className="animate-spin h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span className="ml-3 text-sm font-medium text-gray-500 dark:text-gray-400">Connecting to Market API...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {marketPrices.map((item, index) => (
                  <div key={index} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-500/50 transition-colors group">
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">{item.crop}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-xl font-black text-gray-900 dark:text-white">{item.price}</p>
                      {item.trend === 'up' && <svg className="w-5 h-5 text-green-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>}
                      {item.trend === 'down' && <svg className="w-5 h-5 text-red-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"></path></svg>}
                      {item.trend === 'stable' && <svg className="w-5 h-5 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- CONTENT HUB: NEWS & PARTNERS --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* News Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"></path></svg>
                  Agricultural Insights
                </h2>
                {newsLoading && <span className="text-sm text-gray-500 animate-pulse">Fetching latest news...</span>}
                {newsError && <span className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">{newsError}</span>}
              </div>

              <div className="space-y-4">
                {newsArticles.map((article, index) => (
                  <a key={index} href={article.url} target="_blank" rel="noopener noreferrer" className="block group bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-green-300 dark:hover:border-green-700 transition-all cursor-pointer">
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${article.tagColor} transition-colors`}>
                        {article.category}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{article.date}</p>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors mb-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {article.snippet}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-bold text-green-600 dark:text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Read Full Article 
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* --- UPDATED PARTNERS SECTION --- */}
<div>
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 transition-colors">
    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
    Supported By
  </h2>
  <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Strategic partners supporting Taita-Taveta agricultural growth.</p>
    <div className="space-y-6">
      {[
        { name: 'UN FAO Kenya', role: 'Technical Advisory', url: 'https://www.fao.org/kenya/en/' },
        { name: 'KALRO', role: 'Seed Research', url: 'https://www.kalro.org/' },
        { name: 'Taita-Taveta Gov', role: 'County Administration', url: 'https://taitataveta.go.ke/' }
      ].map((p, i) => (
        <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 font-bold text-gray-400 dark:text-gray-500 group-hover:text-green-600 transition-colors">
            {p.name.substring(0, 3).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">{p.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{p.role}</p>
          </div>
        </a>
      ))}
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