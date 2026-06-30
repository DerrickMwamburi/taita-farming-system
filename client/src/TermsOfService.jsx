import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { Sprout, ArrowRight, Scale } from 'lucide-react';

export default function Terms() {
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
              </div>
            </Link>
            <div className="flex gap-5 items-center">
              <ThemeToggle />
              <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-[#104330] font-bold px-2 py-2 text-sm transition-colors hidden sm:block">
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
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="mb-10 border-b border-gray-200 dark:border-gray-800 pb-8 text-center">
          <Scale className="w-12 h-12 text-[#104330] dark:text-green-400 mx-auto mb-4" />
          <h1 className="text-4xl font-black text-[#0B2C20] dark:text-white tracking-tight mb-2">Terms of Service</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest text-xs">Last Updated: June 2026</p>
        </div>

        <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the AgriNet platform, operated by the County Government of Taita-Taveta, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Description of Service</h2>
            <p>
              AgriNet provides an online management portal for farmers residing and operating within Taita-Taveta County (Mwatate, Voi, Wundanyi, and Taveta). The service includes farm profile management, localized market forecasts, and official network broadcasts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Data Accuracy and Market Prices</h2>
            <p>
              While we strive to provide the most accurate and up-to-date market prices and weather alerts, all data provided through the AgriNet portal is for informational purposes only. The County Government does not guarantee the exact financial returns projected by the market visualizer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Account Security</h2>
            <p>
              You are responsible for safeguarding the password that you use to access your farmer portal and for any activities or actions under your password. You agree to notify our support team in Mwatate immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
          </section>
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
            <Link to="/terms" className="text-white transition-colors">Terms</Link>
            <Link to="/support" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}