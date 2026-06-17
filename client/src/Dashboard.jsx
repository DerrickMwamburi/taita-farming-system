import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDownloadCSV = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/export/farmers/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      // Convert the response into a downloadable file blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a hidden link, click it automatically, then delete it
      const a = document.createElement('a');
      a.href = url;
      a.download = 'taita_taveta_farmers.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to download CSV report.");
    }
  };

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

  if (error) return <div className="p-8 text-red-600 font-bold">{error}</div>;
  if (!data) return <div className="p-8 text-gray-600 font-bold">Loading analytical data...</div>;

  // Formatting backend subcounty data for the Bar Chart
  const barChartData = data.subcounty_distribution.map(item => ({
    name: item.subcounty.charAt(0) + item.subcounty.slice(1).toLowerCase(),
    'Registered Farmers': item.count,
    'Total Acres': parseFloat(item.total_acres || 0)
  }));

  // Formatting backend crop data for the Pie Chart
  const pieChartData = data.crop_popularity.map(item => ({
    name: item.name.replace('_', ' '),
    value: item.farmer_count
  }));

  // Clean layout colors for the pie slices
  const COLORS = ['#16a34a', '#d97706', '#2563eb', '#7c3aed'];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Taita-Taveta Regional Analytics</h1>
            <p className="text-gray-500">Real-time agricultural business intelligence</p>
          </div>
          
          {/* New Buttons Container */}
          <div className="flex gap-3">
            <button 
              onClick={handleDownloadCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors text-sm shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Export CSV
            </button>

            <button 
              onClick={() => {
                localStorage.clear();
                navigate('/login');
              }}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-50 transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Top Metric Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Registered Farmers</h3>
            <p className="text-4xl font-black text-green-600 mt-2">{data.total_farmers}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Cultivated Footprint</h3>
            <p className="text-4xl font-black text-amber-600 mt-2">{data.total_acreage} <span className="text-xl font-normal text-gray-500">Acres</span></p>
          </div>
        </div>

        {/* Charts Presentation Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Subcounty Acreage & Enrollment Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Zonal Production Footprint</h3>
            <p className="text-sm text-gray-400 mb-6">Comparative view of total land and registration density per subcounty</p>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} />
                  <Legend />
                  <Bar dataKey="Registered Farmers" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Total Acres" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Crop Index Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Crop Diversity Index</h3>
            <p className="text-sm text-gray-400 mb-6">Distribution share across active farms</p>
            <div className="w-full h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}