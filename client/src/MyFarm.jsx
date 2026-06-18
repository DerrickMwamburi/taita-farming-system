import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyFarm() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  
  // New States for Editing Mode
  const [isEditing, setIsEditing] = useState(false);
  const [availableCrops, setAvailableCrops] = useState([]);
  const [editForm, setEditForm] = useState({ acreage: '', crops: [] });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMyProfile();
    // Fetch the list of crops in case they want to add new ones
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
      // Pre-fill the edit form with their existing data
      setEditForm({
        acreage: data.acreage,
        crops: data.crop_details.map(c => c.id) // Extract just the IDs for the checkboxes
      });
    } catch (err) {
      setError('Could not securely load your farm data.');
      localStorage.clear();
    }
  };

  const handleCheckboxChange = (cropId) => {
    setEditForm(prev => {
      const isSelected = prev.crops.includes(cropId);
      if (isSelected) {
        return { ...prev, crops: prev.crops.filter(id => id !== cropId) };
      } else {
        return { ...prev, crops: [...prev.crops, cropId] };
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/farmers/me/', {
        method: 'PATCH', // Notice we use PATCH to update existing data
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          acreage: editForm.acreage,
          crops: editForm.crops
        })
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      const updatedData = await response.json();
      setProfile(updatedData); // Update the UI with the fresh data
      setIsEditing(false);     // Close the edit mode
      
    } catch (err) {
      alert("Error saving your updates.");
    } finally {
      setIsSaving(false);
    }
  };

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

        {/* Farm Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Farm Profile</h3>
            
            {/* The Edit/Cancel Button */}
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="text-sm font-medium text-green-600 hover:text-green-800"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
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

            {/* Editable Acreage */}
            <div>
              <p className="text-sm font-medium text-gray-500">Total Cultivated Area (Acres)</p>
              {isEditing ? (
                <input 
                  type="number" step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  value={editForm.acreage}
                  onChange={e => setEditForm({...editForm, acreage: e.target.value})}
                />
              ) : (
                <p className="mt-1 text-2xl font-semibold text-green-600">{profile.acreage}</p>
              )}
            </div>

            {/* Editable Crops */}
            <div className="col-span-1 sm:col-span-2">
              <p className="text-sm font-medium text-gray-500 mb-2">Active Crops</p>
              {isEditing ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                  {availableCrops.map(crop => (
                    <label key={crop.id} className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={editForm.crops.includes(crop.id)}
                        onChange={() => handleCheckboxChange(crop.id)}
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{crop.name.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.crop_details.map(crop => (
                    <span key={crop.id} className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 capitalize">
                      {crop.name.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Save Button (Only visible when editing) */}
          {isEditing && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
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