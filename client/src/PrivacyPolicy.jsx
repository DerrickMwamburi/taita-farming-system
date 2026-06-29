import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300 text-gray-800 dark:text-gray-300">
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="text-green-600 dark:text-green-500 font-bold flex items-center gap-2 hover:opacity-80">
          ← Back to Home
        </Link>
        <ThemeToggle />
      </nav>

      <main className="max-w-3xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
        <p className="mb-6 text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Data Collection</h2>
            <p>AgriNet collects personal and agricultural data essential for providing localized farming insights in Taita-Taveta County. This includes your registered phone number, subcounty location, acreage, specific crop choices, and self-reported financial logging.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Use of Information</h2>
            <p>Your data is strictly used to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700 dark:text-gray-400">
              <li>Deliver targeted KALRO and weather advisories to your portal.</li>
              <li>Calculate projected seasonal revenue based on live regional market prices.</li>
              <li>Provide aggregated, anonymized analytics to county administrators to improve local agricultural policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Data Protection</h2>
            <p>We implement robust security measures, including JSON Web Token (JWT) authentication, to protect your farm's financial and personal data. We comply strictly with the Data Protection Act of Kenya. AgriNet will never sell your individual farm data to third-party marketing agencies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Your Rights</h2>
            <p>You reserve the right to access, modify, or permanently delete your farm's profile from the AgriNet database at any time by contacting our support team or using the Admin portal.</p>
          </section>
        </div>
      </main>
    </div>
  );
}