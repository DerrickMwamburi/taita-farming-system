import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Register() {
  const navigate = useNavigate();
  const [availableCrops, setAvailableCrops] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '', phone_number: '+254', subcounty: 'MWATATE', acreage: '', password: '', confirm_password: '', crops: []
  });

  useEffect(() => {
    fetch('`${import.meta.env.VITE_API_BASE_URL}/api/crops/')
      .then(res => res.json())
      .then(data => setAvailableCrops(data))
      .catch(() => setError('Could not load crops from the server.'));
  }, []);

  const handleCheckboxChange = (cropId) => {
    setFormData(prev => {
      const isSelected = prev.crops.includes(cropId);
      if (isSelected) return { ...prev, crops: prev.crops.filter(id => id !== cropId) };
      return { ...prev, crops: [...prev.crops, cropId] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirm_password) return setError('Passwords do not match.');
    setLoading(true);

    try {
      const submitData = { ...formData };
      delete submitData.confirm_password;

      const response = await fetch('`${import.meta.env.VITE_API_BASE_URL}/api/farmers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.phone_number) throw new Error('This phone number is already registered.');
        throw new Error('Failed to create account. Please check your details.');
      }
      navigate('/login?registered=true');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-end mb-4 px-4">
          <ThemeToggle />
        </div>
        <Link to="/" className="flex justify-center items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">AgriNet<span className="text-green-600">.</span></span>
        </Link>
        <h2 className="text-center text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Join the Taita-Taveta Network</h2>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-green-600 dark:text-green-500 hover:text-green-500 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white dark:bg-gray-900 py-8 px-4 shadow-xl shadow-gray-200/50 dark:shadow-none sm:rounded-2xl sm:px-10 border border-gray-100 dark:border-gray-800 transition-colors duration-300">
          
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">
              
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Legal Name</label>
                <input required type="text" 
                  className="mt-1 block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 dark:text-white transition-colors" 
                  value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number (E.164)</label>
                <input required type="text" placeholder="+254700000000"
                  className="mt-1 block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 dark:text-white transition-colors" 
                  value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subcounty</label>
                <select 
                  className="mt-1 block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 dark:text-white transition-colors"
                  value={formData.subcounty} onChange={e => setFormData({...formData, subcounty: e.target.value})}>
                  <option value="MWATATE">Mwatate</option>
                  <option value="VOI">Voi</option>
                  <option value="WUNDANYI">Wundanyi</option>
                  <option value="TAVETA">Taveta</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Farm Size (Acres)</label>
                <input required type="number" step="0.1" min="0.1" placeholder="e.g. 2.5"
                  className="mt-1 block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 dark:text-white transition-colors" 
                  value={formData.acreage} onChange={e => setFormData({...formData, acreage: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input required type="password" 
                  className="mt-1 block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 dark:text-white transition-colors" 
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                <input required type="password" 
                  className="mt-1 block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 dark:text-white transition-colors" 
                  value={formData.confirm_password} onChange={e => setFormData({...formData, confirm_password: e.target.value})} 
                />
              </div>

              {/* Crops Section */}
              <div className="col-span-1 md:col-span-2 pt-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3 border-t border-gray-200 dark:border-gray-700 pt-4">Select Active Crops</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border border-gray-100 dark:border-gray-800 p-5 rounded-xl bg-gray-50/80 dark:bg-gray-800/50">
                  {availableCrops.map(crop => (
                    <label key={crop.id} className="relative flex items-center cursor-pointer group">
                      <div className="flex items-center h-5">
                        <input type="checkbox" 
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded transition-colors"
                          checked={formData.crops.includes(crop.id)}
                          onChange={() => handleCheckboxChange(crop.id)}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300 capitalize group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                          {crop.name.replace('_', ' ')}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-4">
              <button type="submit" disabled={loading} 
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-900 disabled:opacity-50 transition-all hover:shadow-lg">
                {loading ? 'Registering Farm...' : 'Complete Secure Registration'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}