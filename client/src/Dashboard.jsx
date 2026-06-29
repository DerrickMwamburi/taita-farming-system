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
  const [availableCrops, setAvailableCrops] = useState([]); 
  const [alerts, setAlerts] = useState([]); // NEW: Holds system alerts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');

  // --- INLINE EDITING STATE ---
  const [editingFarmerId, setEditingFarmerId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    phone_number: '',
    subcounty: '',
    acreage: '',
    crops: [] 
  });

  // --- CROP CATALOG STATE ---
  const [isAddingCrop, setIsAddingCrop] = useState(false);
  const [newCropData, setNewCropData] = useState({
    name: '',
    expected_yield_per_acre: '',
    price_per_unit: '',
    unit_measure: '90kg bags'
  });

  // --- ALERTS BROADCASTER STATE ---
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [alertData, setAlertData] = useState({
    title: '', message: '', category: 'KALRO'
  });

  // Chart Colors
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const geoCoordinates = {
    'Voi': [-3.3953, 38.5560],
    'Mwatate': [-3.5047, 38.3778],
    'Wundanyi': [-3.3983, 38.3644],
    'Taveta': [-3.3985, 37.6745],
    'Default': [-3.3953, 38.5560]
  };

  const SUBCOUNTY_CHOICES = ['Voi', 'Mwatate', 'Wundanyi', 'Taveta'];

  // --- DATA FETCHING ---
  useEffect(() => {
    fetchDatabase();
  }, [navigate]);

  const fetchDatabase = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return navigate('/login');

    try {
      const [farmersRes, cropsRes, alertsRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/farmers/', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://127.0.0.1:8000/api/crops/'),
        fetch('http://127.0.0.1:8000/api/alerts/')
      ]);

      if (!farmersRes.ok || !cropsRes.ok) throw new Error('Failed to load database.');
      
      const farmersData = await farmersRes.json();
      const cropsData = await cropsRes.json();
      
      setFarmers(farmersData);
      setAvailableCrops(cropsData);
      
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData);
      }
    } catch (err) {
      setError('Connection refused. Ensure you are logged in as a highly-privileged Admin.');
    } finally {
      setLoading(false);
    }
  };

  // --- ACTION HANDLERS: ALERTS ---
  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/alerts/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
      });

      if (!response.ok) throw new Error('Failed to broadcast');
      
      const newAlert = await response.json();
      setAlerts([newAlert, ...alerts]); 
      setIsBroadcasting(false);
      setAlertData({ title: '', message: '', category: 'KALRO' });
    } catch (err) {
      alert("Error broadcasting alert.");
    }
  };

  const handleRevokeAlert = async (id) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/alerts/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to revoke');
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      alert("Error revoking alert.");
    }
  };

  // --- ACTION HANDLERS: CROP CATALOG ---
  const handleCreateCrop = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');

    const formattedData = {
      name: newCropData.name.toUpperCase().replace(/\s+/g, '_'),
      unit_measure: newCropData.unit_measure,
      price_per_unit: Number(newCropData.price_per_unit),
      expected_yield_per_acre: Number(newCropData.expected_yield_per_acre || 15) 
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/crops/', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Django Error:", errorData); 
        throw new Error('Failed to create crop');
      }
      
      const savedCrop = await response.json();
      setAvailableCrops([...availableCrops, savedCrop]); 
      setIsAddingCrop(false);
      setNewCropData({ name: '', expected_yield_per_acre: '', price_per_unit: '', unit_measure: '90kg bags' });
    } catch (err) {
      alert("Error adding crop. Press F12 to check the console for the exact Django error.");
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

  const cropDistributionMap = filteredFarmers.reduce((acc, farmer) => {
    farmer.crop_details.forEach(crop => {
      const cropName = crop.name.replace('_', ' ');
      if (!acc[cropName]) acc[cropName] = 0;
      acc[cropName] += 1; 
    });
    return acc;
  }, {});

  const cropChartData = Object.entries(cropDistributionMap)
    .map(([name, count]) => ({ name, value: count }))
    .sort((a, b) => b.value - a.value); 

  // --- ACTION HANDLERS: INLINE EDITING ---
  const handleEditClick = (farmer) => {
    setEditingFarmerId(farmer.id);
    setEditFormData({
      full_name: farmer.full_name,
      phone_number: farmer.phone_number,
      subcounty: farmer.subcounty,
      acreage: farmer.acreage,
      crops: farmer.crop_details.map(c => c.id) 
    });
  };

  const handleCheckboxChange = (cropId) => {
    setEditFormData(prev => {
      const isSelected = prev.crops.includes(cropId);
      if (isSelected) {
        return { ...prev, crops: prev.crops.filter(id => id !== cropId) };
      }
      return { ...prev, crops: [...prev.crops, cropId] };
    });
  };

  const handleSaveEdit = async (id) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/farmers/${id}/`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) throw new Error('Failed to update farmer record.');
      
      const updatedFarmer = await response.json();
      
      setFarmers(farmers.map(f => f.id === id ? updatedFarmer : f));
      setEditingFarmerId(null);
    } catch (err) {
      alert("Error saving record to the database.");
    }
  };

  const handleDelete = async (farmerId, farmerName) => { /* retained */ };
  const exportToCSV = () => { /* retained */ };

  // --- RENDER UI ---
  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-500 font-medium">Connecting to secure database...</div>;
  if (error) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-10"><div className="bg-red-50 dark:bg-red-900/30 text-red-700 p-6 rounded-xl font-medium">{error}</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans flex flex-col transition-colors duration-300">
      
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">AgriNet<span className="text-green-600">.</span></span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <span className="text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full hidden sm:block border border-gray-200 dark:border-gray-700">Admin Privileges</span>
              <button onClick={() => { localStorage.clear(); navigate('/'); }} className="text-sm font-bold text-red-600 dark:text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg">End Session</button>
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
            {/* ROW 1: Revenue and Farmer Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
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

              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
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

            {/* ROW 2: GIS Map and Crop Distribution Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Regional Activity GIS Map</h2>
                <div className="flex-grow rounded-xl overflow-hidden min-h-[300px] z-0 relative border border-gray-200 dark:border-gray-700">
                  <MapContainer center={[-3.4, 38.3]} zoom={9} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                    {chartData.map((region, idx) => (
                      <CircleMarker key={idx} center={region.coords} radius={15 + (region.farmers * 2)} fillColor="#10B981" color="#047857" weight={2} opacity={0.8} fillOpacity={0.5}>
                        <Popup><div className="text-center"><strong className="block text-gray-900">{region.name}</strong><span className="text-sm text-gray-600">{region.farmers} Farmers</span><br/><span className="text-sm text-gray-600">{region.acreage.toFixed(1)} Acres Active</span></div></Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
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

        {/* --- ALERTS & INSIGHTS BROADCASTER --- */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8 p-6 transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                Network Broadcaster
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Publish live updates, weather warnings, and market notices directly to all farmer portals.</p>
            </div>
            <button 
              onClick={() => setIsBroadcasting(!isBroadcasting)}
              className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              {isBroadcasting ? 'Cancel' : '+ New Broadcast'}
            </button>
          </div>

          {isBroadcasting && (
            <form onSubmit={handleBroadcastAlert} className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-6 animate-fade-in space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Alert Title</label>
                  <input required type="text" placeholder="e.g., Heavy Rainfall Expected" value={alertData.title} onChange={e => setAlertData({...alertData, title: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Category</label>
                  <select value={alertData.category} onChange={e => setAlertData({...alertData, category: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                    <option value="WEATHER">Weather Alert</option>
                    <option value="KALRO">KALRO Advisory</option>
                    <option value="MARKET">Market Update</option>
                    <option value="SYSTEM">System Notice</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Message</label>
                <textarea required rows="3" placeholder="Type the full advisory message here..." value={alertData.message} onChange={e => setAlertData({...alertData, message: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm transition-colors">Publish Live Broadcast</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.length === 0 ? (
              <div className="col-span-full text-center text-sm text-gray-500 dark:text-gray-400 py-4 italic">No active broadcasts.</div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 relative">
                  <button onClick={() => handleRevokeAlert(alert.id)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/30 p-1.5 rounded-md transition-colors" title="Revoke Broadcast">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    alert.category === 'WEATHER' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                    alert.category === 'KALRO' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}>{alert.category}</span>
                  <h3 className="font-bold text-gray-900 dark:text-white mt-2 text-sm">{alert.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{alert.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- CROP CATALOG MANAGER --- */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8 p-6 transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Crop Catalog Manager</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure active agricultural commodities available in the county.</p>
            </div>
            <button 
              onClick={() => setIsAddingCrop(!isAddingCrop)}
              className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              {isAddingCrop ? 'Cancel' : '+ Add New Crop'}
            </button>
          </div>

          {isAddingCrop && (
            <form onSubmit={handleCreateCrop} className="bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-5 mb-6 animate-fade-in grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Crop Name</label>
                <input required type="text" placeholder="e.g. Tomatoes" value={newCropData.name} onChange={e => setNewCropData({...newCropData, name: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Yield / Acre</label>
                <input required type="number" placeholder="e.g. 15" value={newCropData.expected_yield_per_acre} onChange={e => setNewCropData({...newCropData, expected_yield_per_acre: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Unit Measure</label>
                <input required type="text" placeholder="e.g. 50kg Crates" value={newCropData.unit_measure} onChange={e => setNewCropData({...newCropData, unit_measure: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Price (KES)</label>
                <input required type="number" placeholder="e.g. 2500" value={newCropData.price_per_unit} onChange={e => setNewCropData({...newCropData, price_per_unit: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg shadow-sm transition-colors">Save Crop</button>
              </div>
            </form>
          )}

          <div className="flex flex-wrap gap-3">
            {availableCrops.map(crop => (
              <div key={crop.id} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 flex flex-col min-w-[150px]">
                <span className="font-bold text-gray-900 dark:text-white capitalize">{crop.name.replace('_', ' ')}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">KES {Number(crop.price_per_unit || crop.current_price || 0).toLocaleString()} / {crop.unit_measure || 'Unit'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- FULL INLINE-EDITING DATABASE TABLE --- */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Live Database Records</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input type="text" placeholder="Search..." className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 text-sm w-full sm:w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <select className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 text-sm" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
                {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>)}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Farmer Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Contact Info</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Acreage & Crops</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Forecast (KES)</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {filteredFarmers.map((farmer) => (
                  <tr key={farmer.id} className={`${editingFarmerId === farmer.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/80'} transition-colors`}>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingFarmerId === farmer.id ? (
                        <input type="text" value={editFormData.full_name} onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                      ) : (
                        <><div className="font-bold text-gray-900 dark:text-white">{farmer.full_name}</div><div className="text-xs font-medium text-gray-500 mt-0.5">Joined: {new Date(farmer.onboarded_at).toLocaleDateString()}</div></>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-300">
                      {editingFarmerId === farmer.id ? (
                        <input type="text" value={editFormData.phone_number} onChange={(e) => setEditFormData({...editFormData, phone_number: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                      ) : farmer.phone_number}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingFarmerId === farmer.id ? (
                        <select 
  value={editFormData.subcounty} 
  // ADDED .toUpperCase() to ensure Django accepts the string format perfectly
  onChange={(e) => setEditFormData({...editFormData, subcounty: e.target.value.toUpperCase()})} 
  className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
>
  <option value="">Select Subcounty...</option>
  {SUBCOUNTY_CHOICES.map(loc => <option key={loc} value={loc.toUpperCase()}>{loc}</option>)}
</select>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 uppercase">{farmer.subcounty}</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {editingFarmerId === farmer.id ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <input type="number" step="0.1" value={editFormData.acreage} onChange={(e) => setEditFormData({...editFormData, acreage: e.target.value})} className="w-20 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                            <span className="text-xs text-gray-500 font-bold">Acres</span>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-800/80 p-2 rounded border border-gray-200 dark:border-gray-700 max-h-24 overflow-y-auto space-y-1.5">
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Active Crops</p>
                            {availableCrops.map(crop => (
                              <label key={crop.id} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                                  checked={editFormData.crops.includes(crop.id)} 
                                  onChange={() => handleCheckboxChange(crop.id)} 
                                />
                                <span className="capitalize font-medium">{crop.name.replace('_', ' ')}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{farmer.acreage} Acres</div>
                          <div className="text-xs font-medium text-gray-500 mt-0.5 capitalize truncate max-w-[200px]" title={farmer.crop_details.map(c => c.name.replace('_', ' ')).join(', ')}>
                            {farmer.crop_details.length > 0 ? farmer.crop_details.map(c => c.name.replace('_', ' ')).join(', ') : 'No crops'}
                          </div>
                        </>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-green-600 dark:text-green-500">
                      {editingFarmerId === farmer.id ? (
                        <span className="text-gray-400 text-xs italic">Auto-calculated</span>
                      ) : (
                        Number(farmer.projected_revenue_kes).toLocaleString()
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingFarmerId === farmer.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleSaveEdit(farmer.id)} className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-sm">Save</button>
                          <button onClick={() => setEditingFarmerId(null)} className="text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEditClick(farmer)} className="text-blue-600 hover:text-blue-800 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1.5 rounded-lg">Edit</button>
                          <button onClick={() => handleDelete(farmer.id, farmer.full_name)} className="text-red-600 hover:text-red-800 bg-red-50 dark:bg-red-900/30 dark:text-red-500 px-3 py-1.5 rounded-lg">Delete</button>
                        </div>
                      )}
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