import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { Sprout, Phone, Mail, MapPin, MessageSquare, ArrowRight, LifeBuoy } from 'lucide-react';

export default function Support() {
  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-gray-950 flex flex-col font-sans transition-colors duration-300">
      
      {/* ENTERPRISE NAVIGATION BAR */}
      <nav className="sticky top-0 w-full border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl z-50 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded bg-[#104330] flex items-center justify-center shadow-md">
                <Sprout className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">AgriNet<span className="text-green-600">.</span></span>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none mt-0.5">County Government</p>
              </div>
            </Link>
            <div className="flex gap-5 items-center">
              <ThemeToggle />
              <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-[#104330] dark:hover:text-green-400 font-bold px-2 py-2 text-sm transition-colors hidden sm:block">
                Portal Login
              </Link>
              <Link to="/register" className="bg-[#0B2C20] hover:bg-[#104330] text-white px-6 py-2.5 rounded-lg font-bold transition-all text-sm shadow-md flex items-center gap-2">
                Register <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 mb-6">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-[#0B2C20] dark:text-white tracking-tight mb-4">How can we help?</h1>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Whether you need help registering your farm, understanding the market forecasts, or navigating the platform, the AgriNet support team is here for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Cards */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Call Us</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Mon-Fri from 8am to 5pm.</p>
                <p className="font-bold text-[#104330] dark:text-green-400">+254 (0) 700 111 222</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Email Support</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Drop us a line anytime.</p>
                <p className="font-bold text-[#104330] dark:text-green-400">support@agrinet.go.ke</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Visit Headquarters</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">County Dept. of Agriculture.</p>
                <p className="font-bold text-[#104330] dark:text-green-400">Mwatate, Taita-Taveta</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#104330] dark:text-green-400" />
              Send us a message
            </h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Your Name</label>
                  <input type="text" className="w-full bg-[#F8FAF9] dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#104330] transition-colors dark:text-white" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Phone Number</label>
                  <input type="text" className="w-full bg-[#F8FAF9] dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#104330] transition-colors dark:text-white" placeholder="07XX XXX XXX" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Message</label>
                <textarea rows="5" className="w-full bg-[#F8FAF9] dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#104330] transition-colors dark:text-white" placeholder="How can we help you today?"></textarea>
              </div>
              <button type="button" className="bg-[#0B2C20] hover:bg-[#104330] text-white px-8 py-3 rounded-lg font-bold transition-all shadow-md">
                Send Message
              </button>
            </form>
          </div>

        </div>
      </main>

      {/* ENTERPRISE FOOTER */}
      <footer className="bg-[#0B2C20] text-gray-400 py-12 border-t border-[#104330] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">AgriNet<span className="text-green-500">.</span></span>
          </div>
          <p className="text-xs font-medium text-gray-400">© {new Date().getFullYear()} County Government of Taita-Taveta.</p>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-wider">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/support" className="text-white transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}