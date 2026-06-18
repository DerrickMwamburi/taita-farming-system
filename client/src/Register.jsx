import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [availableCrops, setAvailableCrops] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '+254',
    subcounty: 'MWATATE',
    acreage: '',
    password: '',
    confirm_password: '',
    crops: []
  });

  // Fetch available crops from Django when the page loads
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/crops/')
      .then(res => res.json())
      .then(data => setAvailableCrops(data))
      .catch(() => setError('Could not load crops from the server.'));
  }, []);

  const handleCheckboxChange = (cropId) => {
    setFormData(prev => {
      const isSelected = prev.crops.includes(cropId);
      if (isSelected) {
        return { ...prev, crops: prev.crops.filter(id => id !== cropId) };
      } else {
        return { ...prev, crops: [...prev.crops, cropId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Validate Passwords Match
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // 2. Prepare data for Django (excluding confirm_password)
      const submitData = {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        subcounty: formData.subcounty,
        acreage: formData.acreage,
        password: formData.password,
        crops: formData.crops
      };

      const response = await fetch('http://127.0.0.1:8000/api/farmers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Check if Django rejected the unique phone number constraint
        if (errorData.phone_number) {
          throw new Error('This phone number is already registered.');
        }
        throw new Error('Failed to create account. Please check your details.');
      }

      // 3. Success! Send them to the login page
      navigate('/login?registered=true');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="font-bold text-2xl text-gray-900">Taita-Taveta AgriNet</span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Register your farm</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
                  value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number (E.164)</label>
                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
                  placeholder="+254700000000" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
              </div>

              {/* Subcounty */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Subcounty</label>
                <select className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  value={formData.subcounty} onChange={e => setFormData({...formData, subcounty: e.target.value})}>
                  <option value="MWATATE">Mwatate</option>
                  <option value="VOI">Voi</option>
                  <option value="WUNDANYI">Wundanyi</option>
                  <option value="TAVETA">Taveta</option>
                </select>
              </div>

              {/* Acreage */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Farm Size (Acres)</label>
                <input required type="number" step="0.1" min="0.1" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
                  placeholder="e.g. 2.5" value={formData.acreage} onChange={e => setFormData({...formData, acreage: e.target.value})} />
              </div>

              {/* Passwords */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input required type="password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input required type="password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
                  value={formData.confirm_password} onChange={e => setFormData({...formData, confirm_password: e.target.value})} />
              </div>

              {/* Crops Grid */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Active Crops</label>
                <div className="grid grid-cols-2 gap-4 border border-gray-200 p-4 rounded-md bg-gray-50">
                  {availableCrops.map(crop => (
                    <label key={crop.id} className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={formData.crops.includes(crop.id)}
                        onChange={() => handleCheckboxChange(crop.id)}
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{crop.name.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">
              {loading ? 'Registering...' : 'Complete Secure Registration'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}