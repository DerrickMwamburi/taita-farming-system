import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { Sprout, Phone, Shield, Lock, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // --- LOGIN TYPE STATE ---
  const [loginType, setLoginType] = useState('farmer'); // 'farmer' | 'admin'

  const [formData, setFormData] = useState({
    username: '+254',
    password: ''
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('registered') === 'true') {
      setShowSuccess(true);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      if (!response.ok) {
        throw new Error(`Invalid ${loginType === 'farmer' ? 'phone number' : 'username'} or password.`);
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      // Route based on access level
      const profileResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/farmers/me/`, {
        headers: { 'Authorization': `Bearer ${data.access}` }
      });

      if (profileResponse.ok) {
        // It's a verified farmer
        localStorage.setItem('user_role', 'farmer');
        navigate('/my-farm');
      } else {
        // The farmer endpoint rejected them, so they must be an Admin
        localStorage.setItem('user_role', 'admin');
        navigate('/dashboard');
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabSwitch = (type) => {
    setLoginType(type);
    setFormData({ ...formData, username: '' });
    setError('');
    setShowSuccess(false); // Clear success message if they switch tabs
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans transition-colors duration-300 relative overflow-hidden">
      
      {/* Background abstract shape */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-end mb-4 px-4">
          <ThemeToggle />
        </div>
        
        <div className="flex justify-center mb-6">
          <Link to="/" className="w-14 h-14 rounded-xl bg-[#104330] flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
            <Sprout className="w-8 h-8 text-green-400" />
          </Link>
        </div>
        <h2 className="text-center text-3xl font-black text-[#0B2C20] dark:text-white tracking-tight">
          Portal Access
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
          County Government of Taita-Taveta
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-gray-900 py-8 px-4 shadow-xl border border-gray-200 dark:border-gray-800 sm:rounded-2xl sm:px-10 transition-colors duration-300">
          
          {/* --- TAB SWITCHER --- */}
          <div className="flex p-1.5 mb-8 bg-[#F8FAF9] dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleTabSwitch('farmer')}
              className={`flex-1 py-2.5 text-xs uppercase tracking-widest font-bold rounded-lg transition-all duration-200 ${
                loginType === 'farmer' 
                  ? 'bg-white dark:bg-gray-700 text-[#104330] dark:text-green-400 shadow-sm border border-gray-100 dark:border-gray-600' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-transparent'
              }`}
            >
              Farmer
            </button>
            <button
              onClick={() => handleTabSwitch('admin')}
              className={`flex-1 py-2.5 text-xs uppercase tracking-widest font-bold rounded-lg transition-all duration-200 ${
                loginType === 'admin' 
                  ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-gray-600' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-transparent'
              }`}
            >
              System Admin
            </button>
          </div>

          {showSuccess && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 p-4 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-green-800 dark:text-green-300">Registration successful! Please sign in below.</p>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* DYNAMIC IDENTIFIER FIELD */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                {loginType === 'farmer' ? 'Registered Phone Number' : 'Official Admin Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {loginType === 'farmer' ? (
                    <Phone className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Shield className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <input 
                  required 
                  type={loginType === 'farmer' ? 'text' : 'text'}
                  placeholder={loginType === 'farmer' ? '+254XXXXXXXXX' : 'admin@example.com'}
                  className={`block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-[#F8FAF9] dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent text-sm transition-colors ${loginType === 'admin' ? 'focus:ring-blue-600' : 'focus:ring-[#104330]'}`}
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                  required 
                  type="password" 
                  placeholder="••••••••"
                  className={`block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-[#F8FAF9] dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent text-sm transition-colors ${loginType === 'admin' ? 'focus:ring-blue-600' : 'focus:ring-[#104330]'}`}
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className={`h-4 w-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:ring-2 ${loginType === 'admin' ? 'text-blue-700 focus:ring-blue-600' : 'text-[#104330] focus:ring-[#104330]'}`} />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Remember me</label>
              </div>
              <div className="text-sm">
                <a href="#" className={`font-bold transition-colors hover:underline ${loginType === 'admin' ? 'text-blue-700 dark:text-blue-400' : 'text-[#104330] dark:text-green-400'}`}>Forgot password?</a>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading} 
                className={`w-full flex justify-center py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none ${
                  loginType === 'admin' 
                    ? 'bg-blue-800 hover:bg-blue-900' 
                    : 'bg-[#0B2C20] hover:bg-[#104330]'
                }`}
              >
                {loading ? 'Authenticating...' : `Sign in as ${loginType === 'farmer' ? 'Farmer' : 'Admin'}`}
              </button>
            </div>
          </form>

          {loginType === 'farmer' && (
            <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Not registered yet?{' '}
                <Link to="/register" className="font-bold text-[#104330] dark:text-green-400 hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center pb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}