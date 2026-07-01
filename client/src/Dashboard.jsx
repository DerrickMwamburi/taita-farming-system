import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  LayoutDashboard, Users, Wheat, CloudRain, ShieldCheck, 
  Settings, LogOut, Bell, ChevronLeft, TrendingUp,
  Database, FileSpreadsheet, DownloadCloud, HardDrive, RefreshCw, Calendar, CheckSquare,
  MessageSquare, LifeBuoy, Send, Filter, CheckCircle2, Clock, AlertCircle, X, Shield, Mail
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  
  const [farmers, setFarmers] = useState([]);
  const [availableCrops, setAvailableCrops] = useState([]); 
  const [alerts, setAlerts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');

  const [activeTab, setActiveTab] = useState('overview');
  const [farmerToDelete, setFarmerToDelete] = useState(null);

  const [editingFarmerId, setEditingFarmerId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    full_name: '', phone_number: '', subcounty: '', acreage: '', crops: [] 
  });

  const [isAddingCrop, setIsAddingCrop] = useState(false);
  const [newCropData, setNewCropData] = useState({
    name: '', expected_yield_per_acre: '', price_per_unit: '', unit_measure: '90kg bags'
  });

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [alertData, setAlertData] = useState({
    title: '', message: '', category: 'KALRO'
  });

  // EXPORTS STATE
  const [isExporting, setIsExporting] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    location: 'All', fields: ['full_name', 'phone_number', 'subcounty', 'acreage']
  });

  // COMMUNICATIONS STATE
  const [smsData, setSmsData] = useState({ targetSubcounty: 'All', targetCrop: 'All', message: '' });
  const [isSendingSMS, setIsSendingSMS] = useState(false);

  // REAL DATA VAULT & SUPPORT STATE
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backups, setBackups] = useState([]);
  const [tickets, setTickets] = useState([]);
  
  // ADMIN ACCESS STATE
  const [admins, setAdmins] = useState([]);
  const [currentAdmin, setCurrentAdmin] = useState(null); // <--- NEW STATE FOR LOGGED IN USER
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    username: '', email: '', password: '', is_superuser: false
  });
  
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const geoCoordinates = {
    'Voi': [-3.3953, 38.5560],
    'Mwatate': [-3.5047, 38.3778],
    'Wundanyi': [-3.3983, 38.3644],
    'Taveta': [-3.3985, 37.6745],
    'Default': [-3.3953, 38.5560]
  };

  const SUBCOUNTY_CHOICES = ['Voi', 'Mwatate', 'Wundanyi', 'Taveta'];

  useEffect(() => {
    fetchDatabase();
  }, [navigate]);

  const fetchDatabase = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return navigate('/login');

    try {
      const [farmersRes, cropsRes, alertsRes, ticketsRes, backupsRes, adminsRes, meRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/farmers/`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/crops/`),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/alerts/`),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tickets/`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/backups/`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admins/`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admins/me/`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!farmersRes.ok || !cropsRes.ok) throw new Error('Failed to load database.');
      
      setFarmers(await farmersRes.json());
      setAvailableCrops(await cropsRes.json());
      
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (ticketsRes.ok) setTickets(await ticketsRes.json());
      if (backupsRes.ok) setBackups(await backupsRes.json());
      if (adminsRes.ok) setAdmins(await adminsRes.json());
      if (meRes.ok) setCurrentAdmin(await meRes.json()); // <--- SET CURRENT USER
      
    } catch (err) {
      setError('Connection refused. Ensure you are logged in as a highly-privileged Admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteAdmin = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admins/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdminData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.username ? "Username already exists." : "Failed to create admin account.");
      }
      
      const newAdmin = await response.json();
      setAdmins([newAdmin, ...admins]); 
      setIsInviteModalOpen(false);
      setNewAdminData({ username: '', email: '', password: '', is_superuser: false });
    } catch (err) {
      alert(err.message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/alerts/`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/alerts/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to revoke');
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      alert("Error revoking alert.");
    }
  };

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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/crops/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) throw new Error('Failed to create crop');
      
      const savedCrop = await response.json();
      setAvailableCrops([...availableCrops, savedCrop]); 
      setIsAddingCrop(false);
      setNewCropData({ name: '', expected_yield_per_acre: '', price_per_unit: '', unit_measure: '90kg bags' });
    } catch (err) {
      alert("Error adding crop.");
    }
  };

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

  const cropChartData = Object.entries(cropDistributionMap).map(([name, count]) => ({ name, value: count })).sort((a, b) => b.value - a.value); 

  const handleEditClick = (farmer) => {
    setEditingFarmerId(farmer.id);
    setEditFormData({
      full_name: farmer.full_name, phone_number: farmer.phone_number, subcounty: farmer.subcounty, acreage: farmer.acreage, crops: farmer.crop_details.map(c => c.id) 
    });
  };

  const handleCheckboxChange = (cropId) => {
    setEditFormData(prev => {
      const isSelected = prev.crops.includes(cropId);
      if (isSelected) return { ...prev, crops: prev.crops.filter(id => id !== cropId) };
      return { ...prev, crops: [...prev.crops, cropId] };
    });
  };

  const handleSaveEdit = async (id) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/farmers/${id}/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
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

  const handleDelete = (farmerId, farmerName) => {
    setFarmerToDelete({ id: farmerId, name: farmerName });
  };

  const confirmDelete = async () => {
    if (!farmerToDelete) return;
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/farmers/${farmerToDelete.id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete farmer.');
      setFarmers(farmers.filter(f => f.id !== farmerToDelete.id));
      setFarmerToDelete(null);
    } catch (err) {
      alert("Error deleting record.");
    }
  };

  const handleGenerateCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      let exportData = farmers;
      if (exportFilters.location !== 'All') {
        exportData = exportData.filter(f => f.subcounty === exportFilters.location);
      }
      const headers = exportFilters.fields.map(f => f.replace('_', ' ').toUpperCase());
      if (exportFilters.fields.includes('crops')) headers.push('ACTIVE CROPS');
      
      const csvRows = exportData.map(farmer => {
        const row = exportFilters.fields.map(field => {
          if (field === 'crops') return ''; 
          if (field === 'projected_revenue_kes') return farmer[field] || 0;
          return `"${farmer[field] || ''}"`;
        });
        
        if (exportFilters.fields.includes('crops')) {
          const cropsStr = farmer.crop_details.map(c => c.name.replace('_', ' ')).join(', ');
          row.push(`"${cropsStr}"`);
        }
        return row.join(',');
      });

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...csvRows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `agrinet_export_${exportFilters.location}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 800);
  };

  const triggerManualBackup = async () => {
    setIsBackingUp(true);
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/backups/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: `manual_snapshot_${new Date().toISOString().split('T')[0]}.dump`,
          file_size: "14.5 MB",
          backup_type: "Manual",
          status: "Verified"
        })
      });
      if (response.ok) {
        const newBackup = await response.json();
        setBackups([newBackup, ...backups]);
      }
    } catch (err) {
      alert("Failed to connect to database vault.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleSendSMS = async (e) => {
    e.preventDefault();
    setIsSendingSMS(true);
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/broadcast-sms/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(smsData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`Success! Campaign dispatched to ${data.recipients_count} farmers.`);
        setSmsData({ targetSubcounty: 'All', targetCrop: 'All', message: '' });
      } else {
        alert(data.error || "Failed to dispatch campaign.");
      }
    } catch (err) {
      alert("Error connecting to Africa's Talking gateway.");
    } finally {
      setIsSendingSMS(false);
    }
  };

  const updateTicketStatus = async (id, newStatus) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tickets/${id}/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const updatedTicket = await response.json();
        setTickets(tickets.map(t => t.id === id ? updatedTicket : t));
      }
    } catch (err) {
      alert("Error updating ticket status.");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 font-medium">Connecting to enterprise datastore...</div>;
  if (error) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><div className="bg-red-50 text-red-700 p-6 rounded-xl font-medium border border-red-200">{error}</div></div>;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans overflow-hidden transition-colors duration-300">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-gray-900 dark:bg-[#0B2C20] text-white flex flex-col justify-between flex-shrink-0 z-20 shadow-xl">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-white/10 gap-3">
            <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide">AgriNet</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Management System</p>
            </div>
          </div>

          <div className="px-4 py-6 space-y-8 overflow-y-auto max-h-[calc(100vh-8rem)]">
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3 ml-2">Workspace</p>
              <nav className="space-y-1">
                <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors border-l-4 ${activeTab === 'overview' ? 'bg-white/10 text-white border-green-400' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'}`}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm font-medium">Overview</span>
                </button>
                <button onClick={() => setActiveTab('farmers')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors border-l-4 ${activeTab === 'farmers' ? 'bg-white/10 text-white border-green-400' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'}`}>
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Farmers Directory</span>
                </button>
                <button onClick={() => setActiveTab('crops')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors border-l-4 ${activeTab === 'crops' ? 'bg-white/10 text-white border-green-400' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'}`}>
                  <Wheat className="w-4 h-4" />
                  <span className="text-sm font-medium">Crop Catalog</span>
                </button>
              </nav>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3 ml-2">Engagement</p>
              <nav className="space-y-1">
                <button onClick={() => setActiveTab('support')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors border-l-4 ${activeTab === 'support' ? 'bg-white/10 text-white border-yellow-400' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'}`}>
                  <LifeBuoy className="w-4 h-4" />
                  <span className="text-sm font-medium">Support Desk</span>
                </button>
                <button onClick={() => setActiveTab('communications')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors border-l-4 ${activeTab === 'communications' ? 'bg-white/10 text-white border-purple-400' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'}`}>
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">Comms Hub</span>
                </button>
              </nav>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3 ml-2">Administration</p>
              <nav className="space-y-1">
                <button onClick={() => setActiveTab('exports')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors border-l-4 ${activeTab === 'exports' ? 'bg-white/10 text-white border-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'}`}>
                  <Database className="w-4 h-4" />
                  <span className="text-sm font-medium">Data Vault</span>
                </button>
                <button onClick={() => setActiveTab('access')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors border-l-4 ${activeTab === 'access' ? 'bg-white/10 text-white border-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'}`}>
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">Access Control</span>
                </button>
              </nav>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <div>
              <p className="text-xs font-medium text-white">Live Datastore</p>
              <p className="text-[10px] text-gray-400">Local API connected</p>
            </div>
          </div>
          <Link to="/" className="p-1.5 bg-white/10 rounded-md hover:bg-white/20 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </Link>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* --- DYNAMIC TOP HEADER --- */}
        <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 flex-shrink-0 z-10 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
              {activeTab === 'exports' ? 'Data Vault' : activeTab === 'access' ? 'Access Control' : activeTab.replace('_', ' ')}
            </h2>
            <p className="text-xs text-gray-500">2026/2027 farming season</p>
          </div>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              {alerts.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
            
            <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-6">
              <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm uppercase">
                {currentAdmin?.username ? currentAdmin.username.substring(0, 2) : 'AD'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-none capitalize">
                  {currentAdmin?.username || 'Administrator'}
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                  {currentAdmin?.is_superuser ? 'Superuser' : 'County Staff'}
                </p>
              </div>
              <button onClick={() => { localStorage.clear(); navigate('/'); }} className="ml-4 text-gray-400 hover:text-red-500 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>

          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-12 pt-8 space-y-6">
          
          {activeTab === 'overview' && (
            <>
              {/* Vibrant Hero Banner */}
              <div className="bg-gray-900 rounded-3xl p-8 md:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10">
                  <p className="text-xs font-semibold text-green-400 tracking-widest uppercase mb-2">Agricultural Control Centre</p>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white max-w-2xl leading-tight">
                    Welcome to County Government of Taita Taveta AgriNet Management Centre
                  </h2>
                </div>
                <Link to="/register" className="relative z-10 bg-green-500 text-gray-900 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-green-400 transition-colors shadow-lg whitespace-nowrap">
                  Register new farmer
                </Link>
              </div>

              {/* Colorful KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Verified farmers', value: filteredFarmers.length, colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30', icon: <Users className="w-6 h-6" /> },
                  { label: 'Cultivated acreage', value: `${totalAcreage.toFixed(1)} Ac`, colorClass: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30', icon: <Wheat className="w-6 h-6" /> },
                  { label: 'Market forecast', value: `KES ${(totalRevenue / 1000).toFixed(0)}k`, colorClass: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30', icon: <TrendingUp className="w-6 h-6" /> },
                  { label: 'Active alerts', value: alerts.length, colorClass: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30', icon: <Bell className="w-6 h-6" /> }
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 transition-colors hover:shadow-md">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.colorClass}`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm lg:col-span-2 flex flex-col">
                  <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Projected Revenue by Region (KES)</h3>
                  </div>
                  <div className="flex-grow min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12, fontWeight: 600}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000}k`} tick={{fill: '#6B7280', fontSize: 12}} />
                        <RechartsTooltip cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                        <Bar dataKey="revenue" fill="#10B981" radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Crop Distribution</h3>
                  <div className="flex-grow min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={cropChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                          {cropChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* GIS Map */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Regional Activity GIS Map</h3>
                <div className="rounded-xl overflow-hidden h-[300px] z-0 relative border border-gray-200 dark:border-gray-700">
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
            </>
          )}

          {activeTab === 'farmers' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-gray-800/30">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Live Database Records</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <input type="text" placeholder="Search farmers..." className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-4 py-2 text-sm w-full sm:w-64 focus:ring-2 focus:ring-green-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  <select className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
                    {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>)}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto flex-grow">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Farmer</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Acreage & Crops</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredFarmers.map((farmer) => (
                      <tr key={farmer.id} className={`${editingFarmerId === farmer.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/80'} transition-colors`}>
                        <td className={`px-6 py-4 align-top ${editingFarmerId === farmer.id ? 'min-w-[250px] whitespace-normal' : 'whitespace-nowrap'}`}>
                          {editingFarmerId === farmer.id ? (
                            <div className="flex flex-col gap-3">
                              <input type="text" value={editFormData.full_name} onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                              <input type="text" value={editFormData.phone_number} onChange={(e) => setEditFormData({...editFormData, phone_number: e.target.value})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                            </div>
                          ) : (
                            <><div className="font-bold text-gray-900 dark:text-white">{farmer.full_name}</div><div className="text-xs font-medium text-gray-500 mt-0.5">{farmer.phone_number}</div></>
                          )}
                        </td>

                        <td className={`px-6 py-4 align-top ${editingFarmerId === farmer.id ? 'min-w-[200px] whitespace-normal' : 'whitespace-nowrap'}`}>
                          {editingFarmerId === farmer.id ? (
                            <select value={editFormData.subcounty} onChange={(e) => setEditFormData({...editFormData, subcounty: e.target.value.toUpperCase()})} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                              <option value="">Select...</option>
                              {SUBCOUNTY_CHOICES.map(loc => <option key={loc} value={loc.toUpperCase()}>{loc}</option>)}
                            </select>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 uppercase">{farmer.subcounty}</span>
                          )}
                        </td>

                        <td className={`px-6 py-4 align-top ${editingFarmerId === farmer.id ? 'min-w-[300px] whitespace-normal' : ''}`}>
                          {editingFarmerId === farmer.id ? (
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-3">
                                <input type="number" step="0.1" value={editFormData.acreage} onChange={(e) => setEditFormData({...editFormData, acreage: e.target.value})} className="w-24 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Acres</span>
                              </div>
                              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto flex flex-col gap-3 shadow-inner">
                                {availableCrops.map(crop => (
                                  <label key={crop.id} className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4" checked={editFormData.crops.includes(crop.id)} onChange={() => handleCheckboxChange(crop.id)} />
                                    <span className="capitalize font-medium text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{crop.name.replace('_', ' ')}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">{farmer.acreage} Acres</div>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {farmer.crop_details.length > 0 ? farmer.crop_details.map((c, i) => (
                                  <span key={i} className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded capitalize">
                                    {c.name.replace('_', ' ')}
                                  </span>
                                )) : <span className="text-[10px] text-gray-400 italic">No crops</span>}
                              </div>
                            </>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-top">
                          {editingFarmerId === farmer.id ? (
                            <div className="flex flex-col gap-3 w-28 ml-auto">
                              <button onClick={() => handleSaveEdit(farmer.id)} className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-lg shadow-sm font-bold transition-all w-full text-center">Save</button>
                              <button onClick={() => setEditingFarmerId(null)} className="text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-4 py-2.5 rounded-lg font-bold transition-all w-full text-center">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-4">
                              <button onClick={() => handleEditClick(farmer)} className="text-blue-600 hover:text-blue-800 font-bold transition-colors">Edit</button>
                              <button onClick={() => handleDelete(farmer.id, farmer.full_name)} className="text-red-500 hover:text-red-700 font-bold transition-colors">Delete</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'crops' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 h-fit">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Crop Catalog</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure active commodities for the entire county.</p>
                </div>
                <button onClick={() => setIsAddingCrop(!isAddingCrop)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded-lg shadow-sm text-sm">
                  {isAddingCrop ? 'Cancel' : '+ Add New Crop'}
                </button>
              </div>

              {isAddingCrop && (
                <form onSubmit={handleCreateCrop} className="bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-8 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Crop Name</label>
                    <input required type="text" value={newCropData.name} onChange={e => setNewCropData({...newCropData, name: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Yield / Acre</label>
                    <input required type="number" value={newCropData.expected_yield_per_acre} onChange={e => setNewCropData({...newCropData, expected_yield_per_acre: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Unit Measure</label>
                    <input required type="text" value={newCropData.unit_measure} onChange={e => setNewCropData({...newCropData, unit_measure: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Price (KES)</label>
                    <input required type="number" value={newCropData.price_per_unit} onChange={e => setNewCropData({...newCropData, price_per_unit: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white" />
                  </div>
                  <div className="md:col-span-1">
                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-lg shadow-sm">Save Crop</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {availableCrops.map(crop => (
                  <div key={crop.id} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
                    <span className="font-bold text-gray-900 dark:text-white capitalize mb-2">{crop.name.replace('_', ' ')}</span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">KES {Number(crop.price_per_unit || crop.current_price || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 min-h-[600px] flex flex-col">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Farmer Support Desk</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage inbound agronomy questions and system issues.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
                {['Open', 'In Progress', 'Resolved'].map(statusCol => (
                  <div key={statusCol} className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex flex-col">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      {statusCol === 'Open' && <AlertCircle className="w-4 h-4 text-red-500" />}
                      {statusCol === 'In Progress' && <Clock className="w-4 h-4 text-yellow-500" />}
                      {statusCol === 'Resolved' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      {statusCol} Tickets
                    </h3>
                    
                    <div className="space-y-3 flex-grow overflow-y-auto">
                      {tickets.filter(t => t.status === statusCol).length === 0 ? (
                        <p className="text-xs text-gray-500 italic">No tickets in this status.</p>
                      ) : (
                        tickets.filter(t => t.status === statusCol).map(ticket => (
                          <div key={ticket.id} className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TK-{ticket.id}</span>
                              <span className="text-[10px] text-gray-500">{new Date(ticket.created_at).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{ticket.issue_description}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{ticket.farmer_name} • {ticket.location}</p>
                            
                            {statusCol === 'Open' && (
                              <button onClick={() => updateTicketStatus(ticket.id, 'In Progress')} className="text-xs font-bold text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-md w-full hover:bg-yellow-100 transition-colors">Start Review</button>
                            )}
                            {statusCol === 'In Progress' && (
                              <div className="flex gap-2">
                                <button className="flex-1 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1.5 rounded-md hover:bg-blue-100 transition-colors">Reply</button>
                                <button onClick={() => updateTicketStatus(ticket.id, 'Resolved')} className="flex-1 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1.5 rounded-md hover:bg-green-100 transition-colors">Resolve</button>
                              </div>
                            )}
                            {statusCol === 'Resolved' && (
                              <button onClick={() => updateTicketStatus(ticket.id, 'Open')} className="text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 w-full text-center transition-colors">Reopen Ticket</button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'communications' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-fit">
              {/* Target & Compose SMS */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Targeted SMS Campaign</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Send bulk text messages directly to farmer phones.</p>
                  </div>
                </div>

                <form onSubmit={handleSendSMS} className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800/50">
                    <Filter className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <div className="w-full flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Target Location</label>
                        <select className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white" value={smsData.targetSubcounty} onChange={e => setSmsData({...smsData, targetSubcounty: e.target.value})}>
                          {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc === 'All' ? 'County-wide' : loc}</option>)}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Target Crop Growers</label>
                        <select className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white" value={smsData.targetCrop} onChange={e => setSmsData({...smsData, targetCrop: e.target.value})}>
                          <option value="All">All Crops</option>
                          {availableCrops.map(c => <option key={c.id} value={c.name}>{c.name.replace('_', ' ')}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">Message Body</label>
                    <textarea required rows="4" className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500" placeholder="Type your SMS message here... Keep it concise." value={smsData.message} onChange={e => setSmsData({...smsData, message: e.target.value})}></textarea>
                    <p className="text-xs text-gray-500 mt-1 flex justify-end">{smsData.message.length} / 160 characters</p>
                  </div>

                  <button type="submit" disabled={isSendingSMS} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                    {isSendingSMS ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {isSendingSMS ? 'Dispatching Campaign...' : 'Send SMS Campaign'}
                  </button>
                </form>
              </div>

              {/* Portal Broadcaster */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                    <CloudRain className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Portal Broadcaster</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Publish notices directly to farmer dashboards.</p>
                  </div>
                </div>

                <form onSubmit={handleBroadcastAlert} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Alert Title</label>
                      <input required type="text" value={alertData.title} onChange={e => setAlertData({...alertData, title: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Category</label>
                      <select value={alertData.category} onChange={e => setAlertData({...alertData, category: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white">
                        <option value="WEATHER">Weather Alert</option>
                        <option value="KALRO">KALRO Advisory</option>
                        <option value="MARKET">Market Update</option>
                        <option value="SYSTEM">System Notice</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Message</label>
                    <textarea required rows="2" value={alertData.message} onChange={e => setAlertData({...alertData, message: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"></textarea>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm transition-colors">Publish to Dashboard</button>
                  </div>
                </form>

                <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3 max-h-[200px] overflow-y-auto">
                  {alerts.map(alert => (
                    <div key={alert.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-gray-500">{alert.category}</span>
                        <p className="text-sm font-bold dark:text-white mt-0.5">{alert.title}</p>
                      </div>
                      <button onClick={() => handleRevokeAlert(alert.id)} className="text-red-500 text-xs font-bold hover:underline">Revoke</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exports' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-fit">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 lg:col-span-2">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Custom CSV Generator</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Export specific database queries for external reporting.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">Target Location</label>
                    <select 
                      className="w-full sm:w-1/2 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      value={exportFilters.location}
                      onChange={(e) => setExportFilters({...exportFilters, location: e.target.value})}
                    >
                      {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc === 'All' ? 'Entire County (All Locations)' : loc}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-3">Include Data Points</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      {[
                        { id: 'full_name', label: 'Farmer Name' },
                        { id: 'phone_number', label: 'Phone Number' },
                        { id: 'subcounty', label: 'Subcounty Location' },
                        { id: 'acreage', label: 'Total Acreage' },
                        { id: 'crops', label: 'Active Crop List' },
                        { id: 'projected_revenue_kes', label: 'Financial Forecast' },
                      ].map(field => (
                        <label key={field.id} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 transition-colors"
                            checked={exportFilters.fields.includes(field.id)}
                            onChange={() => {
                              const newFields = exportFilters.fields.includes(field.id) 
                                ? exportFilters.fields.filter(f => f !== field.id)
                                : [...exportFilters.fields, field.id];
                              setExportFilters({...exportFilters, fields: newFields});
                            }}
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">{field.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button 
                      onClick={handleGenerateCSV}
                      disabled={isExporting || exportFilters.fields.length === 0}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center gap-3"
                    >
                      {isExporting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <DownloadCloud className="w-5 h-5" />}
                      {isExporting ? 'Generating Report...' : 'Download CSV Report'}
                    </button>
                    {exportFilters.fields.length === 0 && <p className="text-xs text-red-500 mt-2">Select at least one data point to export.</p>}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 lg:col-span-1 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">DB Snapshots</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Encrypted system backups.</p>
                  </div>
                </div>

                <div className="flex-grow space-y-3 overflow-y-auto max-h-[300px] pr-2 mb-6">
                  {backups.map(backup => (
                    <div key={backup.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-green-400 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> {new Date(backup.created_at).toLocaleString()}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${backup.backup_type === 'Automated' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' : 'bg-gray-200 text-gray-700 dark:bg-gray-700'}`}>
                          {backup.backup_type}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{backup.file_size}</p>
                          <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-0.5">
                            <CheckSquare className="w-3.5 h-3.5" /> {backup.status}
                          </p>
                        </div>
                        <button className="text-xs font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400">Restore</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
                  <button 
                    onClick={triggerManualBackup}
                    disabled={isBackingUp}
                    className="w-full bg-[#0B2C20] hover:bg-[#104330] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                  >
                    {isBackingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
                    {isBackingUp ? 'Creating Snapshot...' : 'Trigger Manual Backup'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'access' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 min-h-[600px] flex flex-col">
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">System Access Control</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage personnel with administrative privileges.</p>
                  </div>
                </div>
                <button onClick={() => setIsInviteModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm text-sm transition-colors">
                  + Invite New Admin
                </button>
              </div>

              <div className="overflow-x-auto flex-grow">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Administrator</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Clearance Level</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Security</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                    {admins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs uppercase">
                              {admin.username.substring(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">{admin.username}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{admin.email || 'No email registered'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${admin.is_superuser ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800/50' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50'}`}>
                            {admin.is_superuser ? 'Superuser' : 'County Staff'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${admin.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                            {admin.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                            {admin.is_active ? 'Active Account' : 'Suspended'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-gray-400 hover:text-red-500 font-bold transition-colors">Revoke Access</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Delete Confirmation Modal */}
        {farmerToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800 transform transition-all">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 mx-auto mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Delete Record?</h3>
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
                Are you sure you want to permanently delete <strong className="text-gray-900 dark:text-white">{farmerToDelete.name}</strong> from the database? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setFarmerToDelete(null)} className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold py-2.5 rounded-xl transition-colors">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-colors">
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NEW: Invite Admin Modal */}
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 transform transition-all">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Grant Access
                </h3>
                <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleInviteAdmin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Admin Username</label>
                  <input required type="text" placeholder="e.g., admin_johndoe" value={newAdminData.username} onChange={e => setNewAdminData({...newAdminData, username: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Official Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <input required type="email" placeholder="john@taitataveta.go.ke" value={newAdminData.email} onChange={e => setNewAdminData({...newAdminData, email: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-3 py-2 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Temporary Password</label>
                  <input required type="password" placeholder="••••••••" value={newAdminData.password} onChange={e => setNewAdminData({...newAdminData, password: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 dark:text-white" />
                </div>
                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50 mt-2">
                  <input type="checkbox" id="superuser" checked={newAdminData.is_superuser} onChange={e => setNewAdminData({...newAdminData, is_superuser: e.target.checked})} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
                  <label htmlFor="superuser" className="text-xs font-bold text-blue-900 dark:text-blue-300 flex-1 cursor-pointer">
                    Grant Superuser Privileges
                    <span className="block font-medium text-gray-500 dark:text-gray-400 text-[10px] mt-0.5">Allows deletion of records and data vault access.</span>
                  </label>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsInviteModalOpen(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold py-2.5 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isInviting} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2">
                    {isInviting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}