import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyFarm() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/farmers/me/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load profile');
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError('Could not securely load your farm data. Please log in again.');
        localStorage.clear();
      }
    };

    fetchMyProfile();
  }, [navigate]);

  if (error) return <div className="p-10 text-red-600 text-center">{error}</div>;
  if (!profile) return <div className="p-10 text-center text-gray-500">Loading your secure data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex justify-between items-center border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile.full_name}</h1>
            <p className="text-green-600 font-medium">Taita-Taveta AgriNet Portal</p>
          </div>
          <button 
            onClick={() => { localStorage.clear(); navigate('/'); }}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 bg-gray-100 px-4 py-2 rounded-md"
          >
            Sign Out
          </button>
        </div>

        {/* Farm Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Farm Profile</h3>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Registered Phone</p>
              <p className="mt-1 text-lg text-gray-900">{profile.phone_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Subcounty Location</p>
              <p className="mt-1 text-lg text-gray-900">{profile.subcounty}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Cultivated Area</p>
              <p className="mt-1 text-2xl font-semibold text-green-600">{profile.acreage} Acres</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Active Crops</p>
              <div className="flex flex-wrap gap-2">
                {profile.crop_details.map(crop => (
                  <span key={crop.id} className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 capitalize">
                    {crop.name.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}