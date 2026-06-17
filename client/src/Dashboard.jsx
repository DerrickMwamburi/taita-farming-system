import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/analytics/regional/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('access_token');
          navigate('/login');
          return;
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('Failed to load regional data.');
      }
    };

    fetchAnalytics();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  if (error) return <div className="p-8 text-red-600 font-bold">{error}</div>;
  if (!data) return <div className="p-8 text-gray-600 font-bold">Loading regional analytics...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Taita-Taveta Operations Overview</h1>
            <p className="text-gray-500">Real-time agricultural data aggregation</p>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-md font-medium hover:bg-red-200 transition-colors"
          >
            Secure Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Top Level Metrics */}
          <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700">Total Network Size</h3>
              <p className="text-5xl font-black text-green-600 mt-2">{data.total_farmers}</p>
              <p className="text-sm text-gray-500 mt-1">Active verified farmers</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700">Total Land Under Cultivation</h3>
              <p className="text-5xl font-black text-amber-600 mt-2">{data.total_acreage} <span className="text-2xl">Acres</span></p>
              <p className="text-sm text-gray-500 mt-1">Aggregated regional footprint</p>
            </div>

          </div>

          {/* Subcounty Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-1">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Regional Distribution</h3>
            <div className="space-y-4">
              {data.subcounty_distribution.map((sc) => (
                <div key={sc.subcounty} className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-gray-600 font-medium">{sc.subcounty}</span>
                  <span className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-sm font-bold">
                    {sc.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Crop Popularity */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Active Crop Index</h3>
            <div className="grid grid-cols-2 gap-4">
              {data.crop_popularity.map((crop) => (
                <div key={crop.name} className="bg-gray-50 p-4 rounded-md border border-gray-100">
                  <p className="text-sm text-gray-500">{crop.name.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold text-gray-800">{crop.farmer_count} farms</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}