import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import ThemeToggle from './ThemeToggle';
import { 
  LogOut, Edit3, Download, Plus, MapPin, Phone, Sprout, 
  Wallet, CloudSun, AlertTriangle, CheckCircle2, Circle, Trash2, Edit2,
  LifeBuoy, Send, Clock
} from 'lucide-react';

export default function MyFarm() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  
  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [availableCrops, setAvailableCrops] = useState([]);
  const [editForm, setEditForm] = useState({ acreage: '', crops: [] });
  const [isSaving, setIsSaving] = useState(false);

  // Activity Log State
  const [activities, setActivities] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newCost, setNewCost] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editTaskText, setEditTaskText] = useState('');
  const [editTaskCost, setEditTaskCost] = useState('');

  // Alerts State
  const [alerts, setAlerts] = useState([]);

  // --- NEW: Weather & Support State ---
  const [weather, setWeather] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  useEffect(() => {
    fetchMyProfile();
    fetchActivities();
    fetchAlerts(); // Trigger the new fetch
    fetchWeather(); // Trigger the new fetch
    fetchTickets(); // Trigger the new fetch
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/crops/`)
      .then(res => res.json())
      .then(data => setAvailableCrops(data))
      .catch(() => console.error('Could not load crops.'));
  }, [navigate]);

  const fetchMyProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return navigate('/login');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/farmers/me/`, {
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

  const fetchAlerts = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/alerts/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setAlerts(await response.json());
      }
    } catch (err) {
      console.error("Error fetching alerts", err);
    }
  };

  // --- NEW: Weather Fetch ---
  const fetchWeather = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/weather/local/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setWeather(await response.json());
      }
    } catch (err) {
      console.error("Error fetching weather", err);
    }
  };

  // --- NEW: Support Tickets Fetch & Submit ---
  const fetchTickets = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tickets/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setTickets(await response.json());
      }
    } catch (err) {
      console.error("Error fetching tickets", err);
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.trim()) return;
    setIsSubmittingTicket(true);
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tickets/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_description: newTicket })
      });
      if (response.ok) {
        const addedTicket = await response.json();
        setTickets([addedTicket, ...tickets]);
        setNewTicket('');
      }
    } catch (err) {
      alert("Failed to submit ticket.");
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleCheckboxChange = (cropId) => {
    setEditForm(prev => {
      const isSelected = prev.crops.includes(cropId);
      if (isSelected) return { ...prev, crops: prev.crops.filter(id => id !== cropId) };
      return { ...prev, crops: [...prev.crops, cropId] };
    });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/farmers/me/`, {
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

  // --- ACTIVITY LOG API CALLS ---
  const fetchActivities = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/activities/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (err) { console.error("Error fetching activities", err); }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/activities/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: newTask, cost: Number(newCost) || 0 })
      });
      if (response.ok) {
        const newActivity = await response.json();
        setActivities([newActivity, ...activities]);
        setNewTask('');
        setNewCost('');
      }
    } catch (err) { console.error("Error creating activity", err); }
  };

  const toggleActivity = async (id, currentStatus) => {
    const token = localStorage.getItem('access_token');
    setActivities(activities.map(a => a.id === id ? { ...a, completed: !currentStatus } : a));
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/activities/${id}/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
      });
    } catch (err) { console.error("Error updating status", err); }
  };

  const startEditing = (activity) => {
    setEditingId(activity.id);
    setEditTaskText(activity.task);
    setEditTaskCost(activity.cost);
  };

  const saveEdit = async (id) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/activities/${id}/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: editTaskText, cost: Number(editTaskCost) })
      });
      if (response.ok) {
        const updatedActivity = await response.json();
        setActivities(activities.map(a => a.id === id ? updatedActivity : a));
        setEditingId(null);
      }
    } catch (err) { console.error("Error saving edit", err); }
  };

  const deleteActivity = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/activities/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setActivities(activities.filter(a => a.id !== id));
      }
    } catch (err) { console.error("Error deleting activity", err); }
  };

  const exportToCSV = () => {
    const headers = ["Task Description", "Cost (KES)", "Completed Status"];
    const csvRows = activities.map(act => {
      const safeTask = `"${act.task.replace(/"/g, '""')}"`;
      return `${safeTask},${act.cost},${act.completed ? 'Yes' : 'No'}`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agrinet_expense_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- CHART DATA CALCULATIONS ---
  const totalExpenses = activities.reduce((sum, act) => sum + Number(act.cost), 0);
  const projectedRevenue = profile ? Number(profile.projected_revenue_kes) : 0;
  const netProfit = projectedRevenue - totalExpenses;

  const chartData = [
    {
      name: 'Season Financials',
      Revenue: projectedRevenue,
      Expenses: totalExpenses,
      Profit: netProfit > 0 ? netProfit : 0 
    }
  ];

  if (error) return <div className="min-h-screen bg-[#F8FAF9] dark:bg-gray-950 p-10 text-red-600 font-medium text-center">{error}</div>;
  if (!profile) return <div className="min-h-screen bg-[#F8FAF9] dark:bg-gray-950 p-10 flex items-center justify-center text-gray-500 font-medium">Connecting to secure farmer portal...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-gray-950 flex flex-col font-sans transition-colors duration-300">
      
      {/* ENTERPRISE NAV */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded bg-[#104330] flex items-center justify-center">
                <Sprout className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">AgriNet<span className="text-green-600">.</span></span>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none">Farmer Portal</p>
              </div>
            </Link>
            <div className="flex items-center gap-4 border-l border-gray-200 dark:border-gray-700 pl-6">
              <ThemeToggle />
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{profile.full_name}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Verified Partner</p>
              </div>
              <button onClick={() => { localStorage.clear(); navigate('/'); }} className="ml-2 text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        
        {/* HERO BANNER */}
        <div className="bg-[#104330] rounded-2xl p-8 mb-8 relative overflow-hidden shadow-lg">
          <div className="absolute right-0 top-0 w-64 h-64 bg-green-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
            <p className="text-xs font-semibold text-green-300 tracking-widest uppercase mb-2">My Workspace</p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Welcome back, {profile.full_name}</h1>
            <p className="text-green-100/80 mt-2 text-sm md:text-base max-w-xl">Manage your acreage, log tasks, and track seasonal forecasts for your active plots.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* FARM PROFILE CARD */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-[#104330] dark:text-green-400 tracking-widest uppercase mb-1">Configuration</p>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Farm Profile</h3>
                </div>
                <button onClick={() => setIsEditing(!isEditing)} className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-colors ${isEditing ? 'bg-gray-100 dark:bg-gray-800 text-gray-600' : 'bg-[#F8FAF9] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'}`}>
                  <Edit3 className="w-3.5 h-3.5" />
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5 mb-1"><Phone className="w-3 h-3" /> Registered Phone</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{profile.phone_number}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5 mb-1"><MapPin className="w-3 h-3" /> Location</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white uppercase tracking-wide">{profile.subcounty}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5 mb-1"><Sprout className="w-3 h-3" /> Cultivated Area</p>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input type="number" step="0.1" className="w-24 bg-[#F8FAF9] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-1.5 px-3 focus:ring-1 focus:ring-[#104330] text-sm dark:text-white" value={editForm.acreage} onChange={e => setEditForm({...editForm, acreage: e.target.value})} />
                      <span className="text-sm text-gray-500 font-medium">Acres</span>
                    </div>
                  ) : <p className="text-2xl font-bold text-[#104330] dark:text-green-400">{profile.acreage} <span className="text-sm font-medium text-gray-500">Ac</span></p>}
                </div>
                <div className="col-span-1 sm:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Active Crop Catalog</p>
                  {isEditing ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#F8FAF9] dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      {availableCrops.map(crop => (
                        <label key={crop.id} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-[#104330] rounded border-gray-300 focus:ring-[#104330]" checked={editForm.crops.includes(crop.id)} onChange={() => handleCheckboxChange(crop.id)} />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">{crop.name.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.crop_details.length === 0 ? <p className="text-xs text-gray-500 italic">No crops actively registered.</p> : profile.crop_details.map(crop => (
                        <span key={crop.id} className="px-3 py-1.5 rounded text-xs font-bold bg-[#F8FAF9] dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 capitalize">
                          {crop.name.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {isEditing && (
                <div className="px-6 py-4 bg-[#F8FAF9] dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                  <button onClick={handleSaveProfile} disabled={isSaving} className="bg-[#104330] hover:bg-[#0B2C20] text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors">{isSaving ? 'Saving...' : 'Save Configuration'}</button>
                </div>
              )}
            </div>

            {/* FULL CRUD ACTIVITY LOG + CSV EXPORT */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-[#104330] dark:text-green-400 tracking-widest uppercase mb-1">Operations</p>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Activity & Expense Log</h3>
                </div>
                <button 
                  onClick={exportToCSV}
                  className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 bg-[#F8FAF9] dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleAddActivity} className="flex flex-col sm:flex-row gap-3 mb-6 bg-[#F8FAF9] dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <input type="text" placeholder="E.g., Bought 5kg Maize Seeds..." className="flex-grow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 text-sm focus:ring-1 focus:ring-[#104330] dark:text-white" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
                  <div className="relative w-full sm:w-32">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-xs font-bold">KES</span>
                    <input type="number" placeholder="Cost" className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-1 focus:ring-[#104330] dark:text-white" value={newCost} onChange={(e) => setNewCost(e.target.value)} />
                  </div>
                  <button type="submit" className="bg-[#104330] hover:bg-[#0B2C20] text-white px-5 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </form>

                <div className="space-y-2">
                  {activities.length === 0 && <p className="text-gray-500 text-xs italic text-center py-6">No operations logged for this season.</p>}
                  
                  {activities.map(activity => (
                    <div key={activity.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${activity.completed ? 'bg-[#F8FAF9] dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 opacity-75' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                      {editingId === activity.id ? (
                        <div className="flex items-center gap-3 w-full">
                          <input type="text" className="flex-grow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded px-3 py-1.5 text-sm dark:text-white focus:ring-1 focus:ring-[#104330]" value={editTaskText} onChange={(e) => setEditTaskText(e.target.value)} />
                          <input type="number" className="w-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded px-3 py-1.5 text-sm dark:text-white focus:ring-1 focus:ring-[#104330]" value={editTaskCost} onChange={(e) => setEditTaskCost(e.target.value)} />
                          <button onClick={() => saveEdit(activity.id)} className="text-white bg-[#104330] px-3 py-1.5 rounded text-xs font-bold">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500 text-xs font-bold px-2 hover:text-gray-700">Cancel</button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <button onClick={() => toggleActivity(activity.id, activity.completed)} className="focus:outline-none">
                              {activity.completed ? <CheckCircle2 className="w-5 h-5 text-gray-400" /> : <Circle className="w-5 h-5 text-gray-300 hover:text-[#104330]" />}
                            </button>
                            <p className={`text-sm ${activity.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white font-medium'}`}>{activity.task}</p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {activity.cost > 0 && (
                              <span className={`text-xs font-bold ${activity.completed ? 'text-gray-400' : 'text-red-500'}`}>KES {activity.cost.toLocaleString()}</span>
                            )}
                            <div className="flex gap-1.5">
                              <button onClick={() => startEditing(activity)} className="p-1.5 text-gray-400 hover:text-[#104330] hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteActivity(activity.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            
            {/* VIBRANT MARKET FORECAST CARD */}
            <div className="bg-[#0B2C20] rounded-xl shadow-lg overflow-hidden border border-[#104330] text-white">
              <div className="px-6 py-5 border-b border-white/10">
                <p className="text-[10px] font-bold text-green-400 tracking-widest uppercase mb-1">Financial Overview</p>
                <h3 className="font-bold flex items-center gap-2 mb-4 text-lg"><Wallet className="w-5 h-5 text-green-400" /> Market Forecast</h3>
                <p className="text-3xl font-black mb-1">KES {Number(profile.projected_revenue_kes).toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-4">Estimated Seasonal Revenue</p>
                <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-lg flex justify-between items-center">
                  <span className="text-xs text-gray-300">Yield Assumption</span>
                  <span className="text-xs font-bold text-green-400">15 Bags / Acre</span>
                </div>
              </div>
              
              <div className="p-5 bg-white dark:bg-gray-900 border-t border-[#104330]">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Profit Margin Visualizer</h4>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600 }} stroke="#9ca3af" axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                      <RechartsTooltip formatter={(value) => `KES ${value.toLocaleString()}`} cursor={{fill: 'rgba(243, 244, 246, 0.5)'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '12px' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px', fontWeight: 600 }} />
                      <Bar dataKey="Revenue" fill="#10B981" radius={[4, 4, 0, 0]} barSize={24} />
                      <Bar dataKey="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={24} />
                      <Bar dataKey="Profit" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* DYNAMIC LIVE ALERTS */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="mb-5">
                <p className="text-[10px] font-bold text-[#104330] dark:text-green-400 tracking-widest uppercase mb-1">Communications</p>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Network Broadcasts
                </h3>
              </div>
              
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="bg-[#F8FAF9] dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-xs text-gray-500 italic">No active network broadcasts at this time.</p>
                  </div>
                ) : (
                  alerts.map(alert => {
                    let style = { bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-800/50", text: "text-purple-800 dark:text-purple-400" };
                    if (alert.category === 'WEATHER') style = { bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800/50", text: "text-blue-800 dark:text-blue-400" };
                    if (alert.category === 'KALRO') style = { bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800/50", text: "text-green-800 dark:text-green-400" };
                    if (alert.category === 'MARKET') style = { bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-800/50", text: "text-yellow-800 dark:text-yellow-500" };

                    return (
                      <div key={alert.id} className={`${style.bg} rounded-lg border ${style.border} p-4 shadow-sm`}>
                        <h4 className={`font-bold ${style.text} text-xs uppercase tracking-wide mb-1.5 flex items-center gap-2`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                          {alert.category}
                        </h4>
                        <h5 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{alert.title}</h5>
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{alert.message}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* LIVE OPENWEATHERMAP CARD */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Local Weather Forecast</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{profile.subcounty}</span>
              </div>
              <div className="p-5 space-y-4">
                {weather ? (
                  <>
                    <div className="flex items-center gap-4">
                      {weather.icon ? (
                        <img src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt="weather icon" className="w-12 h-12 drop-shadow-sm" />
                      ) : (
                        <CloudSun className="w-10 h-10 text-amber-500" />
                      )}
                      <div>
                        <p className="font-black text-3xl text-gray-900 dark:text-white leading-none">{weather.temperature}°C</p>
                        <p className="text-xs font-medium text-gray-500 mt-1">{weather.description}</p>
                      </div>
                    </div>
                    {weather.notice && <p className="text-[10px] text-red-500 italic mt-2">{weather.notice}</p>}
                    <div className="grid grid-cols-2 gap-2 border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Humidity</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-300">{weather.humidity}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Wind Speed</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-300">{weather.wind_speed} m/s</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 animate-pulse py-4">Syncing satellite data...</p>
                )}
              </div>
            </div>

            {/* NEW: FARMER SUPPORT DESK */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-yellow-50/50 dark:bg-yellow-900/10">
                <div className="flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-yellow-600" />
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Agronomy Support</h3>
                </div>
              </div>
              <div className="p-5">
                <form onSubmit={handleSubmitTicket} className="mb-6">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Request Expert Help</label>
                  <textarea 
                    rows="3" 
                    required
                    placeholder="Describe your crop issue, disease symptoms, or system problem..." 
                    className="w-full bg-[#F8FAF9] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-yellow-500 dark:text-white mb-3"
                    value={newTicket}
                    onChange={(e) => setNewTicket(e.target.value)}
                  ></textarea>
                  <button type="submit" disabled={isSubmittingTicket} className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                    {isSubmittingTicket ? 'Submitting...' : <><Send className="w-4 h-4" /> Open Support Ticket</>}
                  </button>
                </form>

                {tickets.length > 0 && (
                  <div className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Your Open Inquiries</p>
                    {tickets.map(ticket => (
                      <div key={ticket.id} className="bg-[#F8FAF9] dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="text-[10px] text-gray-500">{new Date(ticket.created_at).toLocaleDateString()}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 ${ticket.status === 'Resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                            {ticket.status === 'Open' ? <Clock className="w-3 h-3" /> : ticket.status === 'Resolved' ? <CheckCircle2 className="w-3 h-3" /> : null}
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-800 dark:text-gray-200 font-medium">{ticket.issue_description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}