import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function MyFarm() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [availableCrops, setAvailableCrops] = useState([]);
  const [editForm, setEditForm] = useState({ acreage: '', crops: [] });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMyProfile();
    fetch('http://127.0.0.1:8000/api/crops/')
      .then(res => res.json())
      .then(data => setAvailableCrops(data))
      .catch(() => console.error('Could not load available crops.'));
  }, [navigate]);

  const fetchMyProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return navigate('/login');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/farmers/me/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to load profile');
      
      const data = await response.json();
      setProfile(data);
      setEditForm({ acreage: data.acreage, crops: data.crop_details.map(c => c.id) });
    } catch (err) {
      setError('Could not securely load your farm data.');
      localStorage.clear();
    }
  };

  const handleCheckboxChange = (cropId) => {
    setEditForm(prev => {
      const isSelected = prev.crops.includes(cropId);
      if (isSelected) return { ...prev, crops: prev.crops.filter(id => id !== cropId) };
      return { ...prev, crops: [...prev.crops, cropId] };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/farmers/me/', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ acreage: editForm.acreage, crops: editForm.crops })
      });
      if (!response.ok) throw new Error('Failed to update profile');
      
      const updatedData = await response.json();
      setProfile(updatedData);
      setIsEditing(false);     
    } catch (err) {
      alert("Error saving your updates.");
    } finally {
      setIsSaving(false);
    }
  };

  if (error) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-10 text-red-600 font-medium text-center">{error}</div>;
  if (!profile) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-10 text-center text-gray-500 font-medium">Connecting to secure database...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans transition-colors duration-300">
      
      {/* --- SHARED TOP NAVIGATION --- */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">AgriNet<span className="text-green-600">.</span></span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:block">Logged in as {profile.full_name}</span>
              <button 
                onClick={() => { localStorage.clear(); navigate('/'); }}
                className="text-sm font-bold text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome back, {profile.full_name}</h1>
          <p className="text-green-600 dark:text-green-500 font-medium mt-1">Manage your acreage and track your seasonal forecasts.</p>
        </div>

        {/* Financial Forecast Card */}
        <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-2xl shadow-lg overflow-hidden text-white border border-green-800 mb-8">
          <div className="px-6 py-5 border-b border-green-600/50 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Smart Market Forecast
              </h3>
              <p className="text-green-200 text-sm mt-1">Based on regional market averages and your active acreage.</p>
            </div>
          </div>
          <div className="px-6 py-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <p className="text-green-200 font-semibold uppercase tracking-wider text-sm mb-1">Estimated Seasonal Revenue</p>
              <p className="text-5xl font-black tracking-tight text-white">
                KES {Number(profile.projected_revenue_kes).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 px-5 py-4 rounded-xl backdrop-blur-md border border-white/10">
              <p className="text-xs font-semibold text-green-200 uppercase tracking-wider">Yield Assumption</p>
              <p className="text-xl font-bold mt-1 text-white">15 Bags / Acre</p>
            </div>
          </div>
        </div>

        {/* Farm Details Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-8 transition-colors duration-300">
          
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Farm Profile</h3>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${isEditing ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50'}`}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Registered Phone</p>
              <p className="mt-1 text-lg font-medium text-gray-900 dark:text-gray-100">{profile.phone_number}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Subcounty Location</p>
              <p className="mt-1 text-lg font-medium text-gray-900 dark:text-gray-100">{profile.subcounty}</p>
            </div>

            {/* Editable Acreage */}
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Cultivated Area (Acres)</p>
              {isEditing ? (
                <input 
                  type="number" step="0.1"
                  className="mt-2 block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm py-2.5 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 dark:text-white transition-colors"
                  value={editForm.acreage}
                  onChange={e => setEditForm({...editForm, acreage: e.target.value})}
                />
              ) : (
                <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-500">{profile.acreage}</p>
              )}
            </div>

            {/* Editable Crops */}
            <div className="col-span-1 sm:col-span-2">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Active Crops</p>
              {isEditing ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  {availableCrops.map(crop => (
                    <label key={crop.id} className="relative flex items-center cursor-pointer group">
                      <div className="flex items-center h-5">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded transition-colors"
                          checked={editForm.crops.includes(crop.id)}
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
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.crop_details.map(crop => (
                    <span key={crop.id} className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200/60 dark:border-green-800/50 capitalize shadow-sm">
                      {crop.name.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="px-6 py-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}