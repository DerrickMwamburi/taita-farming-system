import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');

  // Chart Colors
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Geographic Coordinates for Taita-Taveta Subcounties
  const geoCoordinates = {
    'Voi': [-3.3953, 38.5560],
    'Mwatate': [-3.5047, 38.3778],
    'Wundanyi': [-3.3983, 38.3644],
    'Taveta': [-3.3985, 37.6745],
    'Default': [-3.3953, 38.5560]
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    fetchDatabase();
  }, [navigate]);

  const fetchDatabase = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return navigate('/login');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/farmers/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to load database.');
      
      const data = await response.json();
      setFarmers(data);
    } catch (err) {
      setError('Connection refused. Ensure you are logged in as a highly-privileged Admin.');
    } finally {
      setLoading(false);
    }
  };

  // --- DATA PROCESSING & FILTERING ---
  const uniqueLocations = ['All', ...new Set(farmers.map(f => f.subcounty))];

  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = 
      farmer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.phone_number.includes(searchTerm) ||
      farmer.subcounty.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesLocation = filterLocation === 'All' || farmer.subcounty === filterLocation;
    
    return matchesSearch && matchesLocation;
  });

  const totalAcreage = filteredFarmers.reduce((sum, f) => sum + parseFloat(f.acreage || 0), 0);
  const totalRevenue = filteredFarmers.reduce((sum, f) => sum + parseFloat(f.projected_revenue_kes || 0), 0);

  // 1. Existing Subcounty Aggregation
  const subcountyDataMap = filteredFarmers.reduce((acc, farmer) => {
    const loc = farmer.subcounty;
    if (!acc[loc]) {
      acc[loc] = { name: loc, farmers: 0, acreage: 0, revenue: 0, coords: geoCoordinates[loc] || geoCoordinates['Default'] };
    }
    acc[loc].farmers += 1;
    acc[loc].acreage += parseFloat(farmer.acreage || 0);
    acc[loc].revenue += parseFloat(farmer.projected_revenue_kes || 0);
    return acc;
  }, {});

  const chartData = Object.values(subcountyDataMap);

  // 2. NEW: Crop Frequency Aggregation
  const cropDistributionMap = filteredFarmers.reduce((acc, farmer) => {
    farmer.crop_details.forEach(crop => {
      const cropName = crop.name.replace('_', ' ');
      if (!acc[cropName]) acc[cropName] = 0;
      acc[cropName] += 1; // Count how many farmers grow this crop
    });
    return acc;
  }, {});

  const cropChartData = Object.entries(cropDistributionMap)
    .map(([name, count]) => ({ name, value: count }))
    .sort((a, b) => b.value - a.value); // Sort highest to lowest

  // --- ACTION HANDLERS ---
  const handleDelete = async (farmerId, farmerName) => {
    const isConfirmed = window.confirm(`SECURITY ALERT: Are you sure you want to permanently delete ${farmerName}'s profile?`);
    if (!isConfirmed) return;

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/farmers/${farmerId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete record.');
      setFarmers(farmers.filter(f => f.id !== farmerId));
    } catch (err) {
      alert("Error deleting record from the database.");
    }
  };

  const exportToCSV = () => {
    const headers = ['Farmer Name', 'Phone Number', 'Location', 'Acreage', 'Active Crops', 'Forecast (KES)', 'Join Date'];
    const csvRows = filteredFarmers.map(f => [
        `"${f.full_name}"`, `"${f.phone_number}"`, `"${f.subcounty}"`,
        f.acreage, f.crop_details.length, f.projected_revenue_kes,
        `"${new Date(f.onboarded_at).toLocaleDateString()}"`
    ].join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `AgriNet_Taita_Taveta_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- RENDER UI ---
  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-500 font-medium transition-colors">Connecting to secure administrative database...</div>;
  if (error) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-10 transition-colors"><div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-6 rounded-xl border border-red-200 dark:border-red-800 font-medium">{error}</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans flex flex-col transition-colors duration-300">
      
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">AgriNet<span className="text-green-600">.</span></span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <span className="text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full hidden sm:block border border-gray-200 dark:border-gray-700">Admin Privileges</span>
              <button 
                onClick={() => { localStorage.clear(); navigate('/'); }}
                className="text-sm font-bold text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 px-4 py-2 rounded-lg transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Header Banner */}
        <div className="bg-gray-900 rounded-3xl shadow-xl p-8 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Command Center</h1>
            <p className="text-gray-400 mt-2 text-lg">System-wide database management and regional analytics.</p>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Filtered Farmers', value: filteredFarmers.length, bg: 'blue', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { label: 'Cultivated Area', value: `${totalAcreage.toFixed(1)} Acres`, bg: 'green', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Regional Forecast', value: `KES ${totalRevenue.toLocaleString()}`, bg: 'yellow', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 transition-colors">
              <div className={`w-12 h-12 rounded-full bg-${stat.bg}-50 dark:bg-${stat.bg}-900/30 flex items-center justify-center text-${stat.bg}-600 dark:text-${stat.bg}-400`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredFarmers.length > 0 && (
          <>
            {/* ROW 1: Existing Revenue and Farmer Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Projected Revenue by Region (KES)</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#4B5563" opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000}k`} tick={{fill: '#9CA3AF', fontSize: 12}} />
                    <RechartsTooltip cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="revenue" fill="#10B981" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Farmer Distribution</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="farmers" stroke="none">
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ROW 2: NEW GIS Map and Crop Distribution Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              
              {/* GIS Interactive Map */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors flex flex-col">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Regional Activity GIS Map</h2>
                <div className="flex-grow rounded-xl overflow-hidden min-h-[300px] z-0 relative border border-gray-200 dark:border-gray-700">
                  <MapContainer 
                    center={[-3.4, 38.3]} // Center roughly on Taita-Taveta
                    zoom={9} 
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://carto.com/">Carto</a>'
                    />
                    {chartData.map((region, idx) => (
                      <CircleMarker 
                        key={idx}
                        center={region.coords}
                        radius={15 + (region.farmers * 2)} // Bubbles scale with farmer count!
                        fillColor="#10B981"
                        color="#047857"
                        weight={2}
                        opacity={0.8}
                        fillOpacity={0.5}
                      >
                        <Popup>
                          <div className="text-center">
                            <strong className="block text-gray-900">{region.name}</strong>
                            <span className="text-sm text-gray-600">{region.farmers} Farmers</span><br/>
                            <span className="text-sm text-gray-600">{region.acreage.toFixed(1)} Acres Active</span>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                </div>
              </div>

              {/* Crop Frequency Donut Chart */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors flex flex-col">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Most Planted Crops (Frequency)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={cropChartData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={4} dataKey="value" stroke="none">
                      {cropChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

            </div>
          </>
        )}

        {/* Live Database Table (Retained entirely, including Export CSV) */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Live Database Records</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input type="text" placeholder="Search..." className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 w-full sm:w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <select className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 text-sm cursor-pointer" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
                {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>)}
              </select>
              <button onClick={exportToCSV} className="bg-gray-900 dark:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2">Export CSV</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Farmer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acreage & Crops</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Forecast (KES)</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800 transition-colors">
                {filteredFarmers.map((farmer) => (
                  <tr key={farmer.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900 dark:text-white">{farmer.full_name}</div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">Joined: {new Date(farmer.onboarded_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-300">{farmer.phone_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 uppercase">{farmer.subcounty}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{farmer.acreage} Acres</div>
                      <div 
  className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 capitalize truncate max-w-[200px]" 
  title={farmer.crop_details.map(c => c.name.replace('_', ' ')).join(', ')}
>
  {farmer.crop_details.length > 0 
    ? farmer.crop_details.map(c => c.name.replace('_', ' ')).join(', ') 
    : 'No active crops'}
</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-green-600 dark:text-green-500">
                      {Number(farmer.projected_revenue_kes).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleDelete(farmer.id, farmer.full_name)} className="text-red-600 dark:text-red-500 hover:text-red-800 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}