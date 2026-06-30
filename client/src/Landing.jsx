import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { 
  Sprout, TrendingUp, TrendingDown, Minus, Newspaper, 
  ShieldCheck, ArrowRight, Activity, Globe, Leaf,
  ChevronRight, LineChart, Clock
} from 'lucide-react';

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
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/market-prices/`, {
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
        setPriceError('Showing cached market data.');
        
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
          url: article.url,
          imageUrl: article.image 
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
            url: '#',
            imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=800&auto=format&fit=crop'
          },
          { 
            title: 'Short Rains Preparation & Soil Health', 
            category: 'Farming Guide',
            tagColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            date: 'June 12, 2026', 
            snippet: 'Agronomists from KALRO share the best practices for preparing your soil before the upcoming October rains.',
            url: '#',
            imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800&auto=format&fit=crop'
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
            url: '#',
            imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop'
          }
      ]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-gray-950 flex flex-col font-sans transition-colors duration-300">
      
      {/* --- ENTERPRISE NAVIGATION BAR --- */}
      <nav className="fixed w-full border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl z-50 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B2C20] to-[#1a6649] flex items-center justify-center shadow-lg group-hover:shadow-green-500/30 transition-all duration-300 transform group-hover:scale-105">
                <Sprout className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">AgriNet<span className="text-green-600">.</span></span>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none mt-0.5 font-bold">County Government</p>
              </div>
            </div>
            <div className="flex gap-4 sm:gap-6 items-center">
              <ThemeToggle />
              <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-[#104330] dark:hover:text-green-400 font-bold px-2 py-2 text-sm transition-colors hidden sm:block">
                Portal Login
              </Link>
              <Link to="/register" className="bg-[#0B2C20] hover:bg-[#1a6649] text-white px-5 sm:px-6 py-2.5 rounded-xl font-bold transition-all text-sm shadow-lg shadow-green-900/20 flex items-center gap-2 transform hover:-translate-y-0.5">
                Register Farm <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- CINEMATIC ENTERPRISE HERO SECTION --- */}
      <main className="flex-grow">
        <div className="relative pt-20 pb-32 flex items-center min-h-[90vh] overflow-hidden">
          {/* Background Image with Deep County Green Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad839?q=80&w=2500&auto=format&fit=crop" 
              alt="Agricultural landscape" 
              className="w-full h-full object-cover object-center scale-105 animate-[pulse_25s_ease-in-out_infinite]"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B2C20] via-[#0B2C20]/95 to-transparent mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAF9] dark:from-gray-950 to-transparent opacity-100 h-32 bottom-0 top-auto"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Hero Text */}
            <div className="text-center lg:text-left flex-1">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-green-300 border border-white/20 mb-6 uppercase tracking-widest shadow-xl">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Taita-Taveta Agricultural Hub
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-6 leading-[1.1]">
                Empowering the <br className="hidden md:block" /> Next Generation <br className="hidden lg:block"/> of <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200">Farmers.</span>
              </h1>
              <p className="text-lg md:text-xl text-green-50 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed font-medium opacity-90">
                Join the official county network. Manage your acreage, track real-time analytics, and access exclusive agricultural resources to maximize your seasonal yield.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
                <Link to="/register" className="bg-green-500 text-[#0B2C20] px-8 py-4 rounded-xl font-black text-lg hover:bg-green-400 transition-all shadow-2xl shadow-green-900/50 transform hover:-translate-y-1 flex items-center justify-center gap-2">
                  Get Started Free
                </Link>
                <Link to="/login" className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-md flex items-center justify-center gap-2">
                  Access Portal <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Floating Glassmorphism Dashboard Preview */}
            <div className="hidden lg:block flex-1 relative w-full h-[400px]">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[110%] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-700">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <LineChart className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold">Network Analytics</p>
                      <p className="text-green-200/70 text-xs">Live Database Sync</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="h-14 w-full bg-white/5 rounded-xl border border-white/10 flex items-center px-4 gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/10"></div>
                      <div className="flex-1 space-y-2.5">
                        <div className="h-2.5 bg-white/20 rounded w-3/4"></div>
                        <div className="h-2 bg-white/10 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- LIVE MARKET ANALYTICS --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 transition-colors duration-300 backdrop-blur-xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-800 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <Activity className="w-6 h-6 text-green-600 dark:text-green-500" />
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Live Regional Market Prices</h2>
                {!priceError && !pricesLoading && (
                  <span className="flex h-3 w-3 relative ml-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {priceError && <span className="text-[10px] uppercase tracking-wider text-red-600 font-bold bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg">{priceError}</span>}
                <span className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg shadow-sm">
                  Updated Today
                </span>
              </div>
            </div>
            
            {pricesLoading ? (
              <div className="flex justify-center items-center py-12">
                <svg className="animate-spin h-8 w-8 text-[#104330]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span className="ml-3 text-sm font-bold text-gray-500">Syncing with Datastore...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {marketPrices.map((item, index) => (
                  <div key={index} className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1 cursor-default">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">{item.crop}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-black text-[#0B2C20] dark:text-white">{item.price}</p>
                      <div className="p-2 rounded-lg bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-700">
                        {item.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
                        {item.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
                        {item.trend === 'stable' && <Minus className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- HOW IT WORKS SECTION (Visual Bento Grid) --- */}
        <div className="py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-[#0B2C20] dark:text-white mb-4 tracking-tight">The Modern Agricultural Stack</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-16 text-lg">Everything you need to digitize your farm, track your finances, and connect with county agronomists in one place.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[
                { title: 'Register Securely', desc: 'Add your farm and crop details into the official encrypted county database.', img: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=800&auto=format&fit=crop', icon: <ShieldCheck className="w-6 h-6" /> },
                { title: 'Track & Forecast', desc: 'Monitor your acreage, project revenue, and log seasonal expenses seamlessly.', img: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop', icon: <Globe className="w-6 h-6" /> },
                { title: 'Grow Yields', desc: 'Access real-time market data, weather APIs, and expert KALRO advisory.', img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad839?q=80&w=800&auto=format&fit=crop', icon: <Leaf className="w-6 h-6" /> }
              ].map((item, i) => (
                <div key={i} className="group relative h-96 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-gray-800 transform hover:-translate-y-2">
                  <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B2C20] via-[#0B2C20]/80 to-transparent opacity-90 group-hover:opacity-95 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <div className="w-14 h-14 bg-green-500 text-[#0B2C20] rounded-2xl flex items-center justify-center font-black mb-6 shadow-xl transform group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                    <h3 className="font-black text-3xl text-white mb-3 tracking-tight">{item.title}</h3>
                    <p className="text-green-50 text-base font-medium leading-relaxed opacity-90">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- CONTENT HUB: NEWS & PARTNERS --- */}
        <div className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* News Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/50">
                      <Newspaper className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    Agricultural Insights
                  </h2>
                  {newsLoading && <span className="text-xs uppercase font-bold text-gray-500 animate-pulse bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">Fetching updates...</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {newsArticles.map((article, index) => (
                    <a key={index} href={article.url} target="_blank" rel="noopener noreferrer" className="block group bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-green-500/50 transition-all cursor-pointer overflow-hidden flex flex-col transform hover:-translate-y-1">
                      <div className="h-52 overflow-hidden relative bg-gray-200 dark:bg-gray-700">
                        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute top-4 left-4">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg ${article.tagColor}`}>
                            {article.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6 flex flex-col flex-grow bg-white dark:bg-transparent">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold mb-3 uppercase tracking-widest flex items-center gap-2">
                          <Clock className="w-3 h-3" /> {article.date}
                        </p>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors mb-3 leading-snug">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-6 flex-grow">
                          {article.snippet}
                        </p>
                        <div className="flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-500 uppercase tracking-wider">
                          Read Article 
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Partners Section */}
              <div>
                <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                      <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    Backed By
                  </h2>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/40 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 transition-colors h-[calc(100%-6rem)] flex flex-col">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">Strategic partners driving agricultural growth and technological adoption across the Taita-Taveta region.</p>
                  <div className="space-y-4 flex-grow">
                    {[
                      { name: 'UN FAO Kenya', role: 'Technical Advisory', url: 'https://www.fao.org/kenya/en/' },
                      { name: 'KALRO', role: 'Seed & Soil Research', url: 'https://www.kalro.org/' },
                      { name: 'Taita-Taveta Gov', role: 'County Administration', url: 'https://taitataveta.go.ke/' }
                    ].map((p, i) => (
                      <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 group p-4 bg-white dark:bg-gray-900 rounded-2xl transition-all border border-gray-100 dark:border-gray-800 hover:border-blue-500/50 hover:shadow-lg transform hover:-translate-y-1">
                        <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-700 font-black text-gray-400 dark:text-gray-500 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-all text-sm tracking-widest shadow-inner">
                          {p.name.substring(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-base">{p.name}</p>
                          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wider">{p.role}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* --- FINAL CALL TO ACTION --- */}
        <div className="relative py-24 bg-[#0B2C20] overflow-hidden border-t border-green-900/50">
          <div className="absolute inset-0 z-0 opacity-10">
             <div className="absolute right-0 top-0 w-96 h-96 bg-green-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
             <div className="absolute left-0 bottom-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">Ready to digitize your farm?</h2>
            <p className="text-xl text-green-100/80 mb-10 max-w-2xl mx-auto font-medium">Join hundreds of other farmers in the county leveraging real-time data to increase their seasonal yields.</p>
            <Link to="/register" className="inline-flex items-center gap-3 bg-green-500 text-[#0B2C20] px-10 py-5 rounded-2xl font-black text-xl hover:bg-green-400 transition-all shadow-2xl shadow-green-900/50 transform hover:-translate-y-1">
              Create Your Free Account <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </main>

      {/* --- ENTERPRISE FOOTER --- */}
      <footer className="bg-gray-950 text-gray-400 py-16 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Sprout className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">AgriNet<span className="text-green-500">.</span></span>
              </div>
              <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-sm">The official agricultural management network for the County Government of Taita-Taveta, built to empower farmers with data-driven insights.</p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-widest uppercase text-xs">Platform</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="/login" className="hover:text-green-400 transition-colors">Portal Login</Link></li>
                <li><Link to="/register" className="hover:text-green-400 transition-colors">Register Farm</Link></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Market Analysis</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-widest uppercase text-xs">Legal & Help</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><Link to="/support" className="hover:text-green-400 transition-colors">Help Center</Link></li>
                <li><Link to="/privacy" className="hover:text-green-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-green-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-medium text-gray-600">© {new Date().getFullYear()} County Government of Taita-Taveta. All rights reserved.</p>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
              <ShieldCheck className="w-4 h-4" /> Secure Infrastructure
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}