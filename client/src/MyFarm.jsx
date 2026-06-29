import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import ThemeToggle from './ThemeToggle';

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

  // --- NEW: ALERTS STATE ---
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchMyProfile();
    fetchActivities();
    fetchAlerts(); // Trigger the new fetch
    fetch('http://127.0.0.1:8000/api/crops/')
      .then(res => res.json())
      .then(data => setAvailableCrops(data))
      .catch(() => console.error('Could not load crops.'));
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

  // --- NEW: FETCH LIVE BROADCASTS ---
  const fetchAlerts = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/alerts/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setAlerts(await response.json());
      }
    } catch (err) {
      console.error("Error fetching alerts", err);
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

  // --- ACTIVITY LOG API CALLS ---
  const fetchActivities = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/activities/', {
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
      const response = await fetch('http://127.0.0.1:8000/api/activities/', {
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
      await fetch(`http://127.0.0.1:8000/api/activities/${id}/`, {
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
      const response = await fetch(`http://127.0.0.1:8000/api/activities/${id}/`, {
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
      const response = await fetch(`http://127.0.0.1:8000/api/activities/${id}/`, {
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

  if (error) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-10 text-red-600 font-medium text-center">{error}</div>;
  if (!profile) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-10 text-center text-gray-500 font-medium">Connecting to secure database...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans transition-colors duration-300">
      
      {/* NAV */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="text-xl font-bold text-gray-900 dark:text-white">AgriNet<span className="text-green-600">.</span></span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:block">Logged in as {profile.full_name}</span>
              <button onClick={() => { localStorage.clear(); navigate('/'); }} className="text-sm font-bold text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 px-4 py-2 rounded-lg">Sign Out</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome back, {profile.full_name}</h1>
          <p className="text-green-600 dark:text-green-500 font-medium mt-1">Manage your acreage, log tasks, and track seasonal forecasts.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* FARM PROFILE CARD */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Farm Profile</h3>
                <button onClick={() => setIsEditing(!isEditing)} className={`text-sm font-bold px-4 py-2 rounded-lg ${isEditing ? 'bg-gray-100 dark:bg-gray-800 text-gray-600' : 'bg-green-50 dark:bg-green-900/30 text-green-700'}`}>
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Registered Phone</p>
                  <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">{profile.phone_number}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Location</p>
                  <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">{profile.subcounty}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Cultivated Area (Acres)</p>
                  {isEditing ? (
                    <input type="number" step="0.1" className="mt-2 block w-full bg-gray-50 dark:bg-gray-800 border-gray-300 rounded-lg py-2.5 px-3 focus:ring-green-500 dark:text-white" value={editForm.acreage} onChange={e => setEditForm({...editForm, acreage: e.target.value})} />
                  ) : <p className="mt-1 text-2xl font-bold text-green-600">{profile.acreage}</p>}
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">Active Crops</p>
                  {isEditing ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      {availableCrops.map(crop => (
                        <label key={crop.id} className="flex items-center cursor-pointer">
                          <input type="checkbox" className="h-4 w-4 text-green-600 rounded" checked={editForm.crops.includes(crop.id)} onChange={() => handleCheckboxChange(crop.id)} />
                          <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{crop.name.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.crop_details.map(crop => (
                        <span key={crop.id} className="px-4 py-1.5 rounded-full text-sm font-bold bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50 capitalize">
                          {crop.name.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {isEditing && (
                <div className="px-6 py-5 bg-gray-50 dark:bg-gray-800/50 border-t flex justify-end">
                  <button onClick={handleSaveProfile} disabled={isSaving} className="bg-green-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-green-700">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                </div>
              )}
            </div>

            {/* FULL CRUD ACTIVITY LOG + CSV EXPORT */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Activity & Expense Log</h3>
                  <p className="text-sm text-gray-500 mt-1">Track your labor, inputs, and costs.</p>
                </div>
                <button 
                  onClick={exportToCSV}
                  className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Export CSV
                </button>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleAddActivity} className="flex flex-col sm:flex-row gap-3 mb-6">
                  <input type="text" placeholder="E.g., Bought Seeds..." className="flex-grow bg-gray-50 dark:bg-gray-800 border-gray-300 rounded-lg px-4 py-2.5 text-sm dark:text-white" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
                  <div className="relative w-full sm:w-32">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">KES</span>
                    <input type="number" placeholder="Cost" className="w-full bg-gray-50 dark:bg-gray-800 border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-sm dark:text-white" value={newCost} onChange={(e) => setNewCost(e.target.value)} />
                  </div>
                  <button type="submit" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-lg text-sm font-bold">Add Task</button>
                </form>

                <div className="space-y-3">
                  {activities.length === 0 && <p className="text-gray-500 text-sm italic text-center py-4">No activities logged yet.</p>}
                  
                  {activities.map(activity => (
                    <div key={activity.id} className={`flex items-center justify-between p-4 rounded-xl border ${activity.completed ? 'bg-gray-50 dark:bg-gray-800/50 opacity-60' : 'bg-white dark:bg-gray-800 shadow-sm'}`}>
                      {editingId === activity.id ? (
                        <div className="flex items-center gap-3 w-full">
                          <input type="text" className="flex-grow bg-white dark:bg-gray-700 border border-gray-300 rounded px-2 py-1 text-sm dark:text-white" value={editTaskText} onChange={(e) => setEditTaskText(e.target.value)} />
                          <input type="number" className="w-24 bg-white dark:bg-gray-700 border border-gray-300 rounded px-2 py-1 text-sm dark:text-white" value={editTaskCost} onChange={(e) => setEditTaskCost(e.target.value)} />
                          <button onClick={() => saveEdit(activity.id)} className="text-green-600 font-bold text-sm">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500 font-bold text-sm">Cancel</button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-4">
                            <input type="checkbox" checked={activity.completed} onChange={() => toggleActivity(activity.id, activity.completed)} className="w-5 h-5 text-green-600 rounded cursor-pointer" />
                            <div>
                              <p className={`font-bold text-sm ${activity.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>{activity.task}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {activity.cost > 0 && (
                              <span className={`text-sm font-bold ${activity.completed ? 'text-gray-400' : 'text-red-500'}`}>- KES {activity.cost.toLocaleString()}</span>
                            )}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 lg:opacity-100">
                              <button onClick={() => startEditing(activity)} className="text-gray-400 hover:text-blue-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                              </button>
                              <button onClick={() => deleteActivity(activity.id)} className="text-gray-400 hover:text-red-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
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
            <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-2xl shadow-lg overflow-hidden border border-green-800 text-white">
              <div className="px-5 py-4 border-b border-green-600/50">
                <h3 className="font-bold flex items-center gap-2 mb-2"><svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Market Forecast</h3>
                <p className="text-green-200 text-xs font-semibold uppercase">Est. Seasonal Revenue</p>
                <p className="text-4xl font-black mb-4">KES {Number(profile.projected_revenue_kes).toLocaleString()}</p>
                <div className="bg-white/10 px-4 py-3 rounded-lg mb-2"><p className="text-xs text-green-200">Based on active acreage</p><p className="text-sm font-bold text-white">Assuming 15 Bags / Acre</p></div>
              </div>
              
              <div className="p-5 bg-white dark:bg-gray-900 border-t border-green-800/30">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Profit Margin Visualizer</h4>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(value) => `${value / 1000}k`} />
                      <Tooltip formatter={(value) => `KES ${value.toLocaleString()}`} cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      <Bar dataKey="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* --- NEW: DYNAMIC LIVE ALERTS --- */}
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                Network Broadcasts
              </h3>
              
              {alerts.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 text-center">
                  <p className="text-sm text-gray-500 italic">No active network broadcasts at this time.</p>
                </div>
              ) : (
                alerts.map(alert => {
                  let bgClass = "bg-purple-50 dark:bg-purple-900/20"; 
                  let borderClass = "border-purple-200 dark:border-purple-800/50"; 
                  let textClass = "text-purple-800 dark:text-purple-400";
                  
                  if (alert.category === 'WEATHER') {
                    bgClass = "bg-blue-50 dark:bg-blue-900/20"; borderClass = "border-blue-200 dark:border-blue-800/50"; textClass = "text-blue-800 dark:text-blue-400";
                  } else if (alert.category === 'KALRO') {
                    bgClass = "bg-green-50 dark:bg-green-900/20"; borderClass = "border-green-200 dark:border-green-800/50"; textClass = "text-green-800 dark:text-green-400";
                  } else if (alert.category === 'MARKET') {
                    bgClass = "bg-yellow-50 dark:bg-yellow-900/20"; borderClass = "border-yellow-200 dark:border-yellow-800/50"; textClass = "text-yellow-800 dark:text-yellow-500";
                  }

                  return (
                    <div key={alert.id} className={`${bgClass} rounded-2xl border ${borderClass} p-5 shadow-sm`}>
                      <div className="flex gap-3">
                        <div>
                          <h4 className={`font-bold ${textClass} text-sm mb-1 flex items-center gap-2`}>
                            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                            {alert.title}
                          </h4>
                          <p className={`text-sm opacity-90 leading-relaxed ${textClass}`}>{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center"><h3 className="font-bold dark:text-white">Local Weather</h3><span className="text-xs text-gray-500">{profile.subcounty}</span></div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zM6 10a4 4 0 118 0 4 4 0 01-8 0z" clipRule="evenodd"></path></svg>
                  <div><p className="font-bold text-lg dark:text-white">28°C</p><p className="text-xs text-gray-500">Sunny • Today</p></div>
                </div>
                <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
                  <div><p className="text-sm font-bold dark:text-gray-300">Tomorrow</p><p className="text-xs text-gray-500">26°C • Cloudy</p></div>
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999A5.002 5.002 0 103 15z"></path></svg>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}