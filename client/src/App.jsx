import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

// This is the exact frictionless form we just built, wrapped into its own component!
function PublicForm() {
  const [formData, setFormData] = useState({ full_name: '', phone_number: '', subcounty: 'MWATATE', crops: [] });
  const [submitStatus, setSubmitStatus] = useState(null);

 // 1. THIS MUST BE AN EMPTY ARRAY (No hardcoded crops!)
  const [availableCrops, setAvailableCrops] = useState([]);

  // 2. THIS FETCHES THE TRUE IDs FROM DJANGO
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/crops/')
      .then(response => response.json())
      .then(data => setAvailableCrops(data))
      .catch(error => console.error("Error fetching crops:", error));
  }, []);

  const handleCropToggle = (cropId) => {
    setFormData(prev => ({
      ...prev,
      crops: prev.crops.includes(cropId) 
        ? prev.crops.filter(id => id !== cropId) 
        : [...prev.crops, cropId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/farmers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ full_name: '', phone_number: '', subcounty: 'MWATATE', crops: [] });
      } else {// --- ADD THESE TWO LINES ---
        const errorData = await response.json();
        alert("DJANGO ERROR: " + JSON.stringify(errorData));
        // ---------------------------
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center border border-green-100">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete</h2>
          <button onClick={() => setSubmitStatus(null)} className="text-green-700 font-medium">Register another farm</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
        <h2 className="text-3xl font-extrabold text-green-900 text-center mb-8">Farm Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input required type="text" placeholder="Full Name" className="w-full px-4 py-2 border rounded-md" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
          <input required type="tel" placeholder="Phone Number" className="w-full px-4 py-2 border rounded-md" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} />
          <select className="w-full px-4 py-2 border rounded-md bg-white" value={formData.subcounty} onChange={(e) => setFormData({ ...formData, subcounty: e.target.value })}>
            <option value="MWATATE">Mwatate</option>
            <option value="VOI">Voi</option>
            <option value="WUNDANYI">Wundanyi</option>
            <option value="TAVETA">Taveta</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            
            {/* 3. Map over the dynamically fetched crops! */}
            {availableCrops.map(c => (
              <button 
                type="button" 
                key={c.id} 
                onClick={() => handleCropToggle(c.id)} 
                className={`py-2 px-3 border rounded-md text-sm font-medium transition-colors ${
                  formData.crops.includes(c.id) 
                    ? 'bg-green-600 text-white border-green-600 shadow-sm' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {/* safely format the name, with a fallback */}
                {c.name ? c.name.replace('_', ' ') : 'Loading...'}
              </button>
            ))}

          </div>
          <button type="submit" className="w-full py-3 bg-green-700 text-white rounded-md font-bold">{submitStatus === 'submitting' ? 'Processing...' : 'Complete Registration'}</button>
        </form>
      </div>
    </div>
  );
}

// The Router Configuration
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The public-facing intake form */}
        <Route path="/" element={<PublicForm />} />
        
        {/* The admin login page */}
        <Route path="/login" element={<Login />} />
        
        {/* The secure investor dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}