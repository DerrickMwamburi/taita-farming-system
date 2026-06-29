import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300 text-gray-800 dark:text-gray-300">
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="text-green-600 dark:text-green-500 font-bold flex items-center gap-2 hover:opacity-80">
          ← Back to Home
        </Link>
        <ThemeToggle />
      </nav>

      <main className="max-w-3xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-8">Terms of Service</h1>
        <p className="mb-6 text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and registering an account on AgriNet, you agree to be bound by these Terms of Service. This platform is provided in partnership with the Taita-Taveta Agricultural Cooperative.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Accuracy of Information</h2>
            <p>Users are responsible for maintaining the accuracy of their acreage, crop types, and contact information. Falsifying agricultural data disrupts county-wide market analytics and may result in the suspension of your account.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Advisory Disclaimer</h2>
            <p>While AgriNet provides market price tracking, KALRO advisories, and revenue forecasting, these are highly dynamic estimates. AgriNet and its partners are not legally or financially liable for crop failure, weather anomalies, or market price fluctuations that differ from platform forecasts.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Platform Access</h2>
            <p>System Administrators reserve the right to revoke access, modify accounts, or issue system-wide overrides to maintain network integrity.</p>
          </section>
        </div>
      </main>
    </div>
  );
}