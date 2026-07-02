import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { Sprout, Phone, Lock, User, MapPin, Maximize, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [availableCrops, setAvailableCrops] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Form, Step 2: OTP
  const [otpCode, setOtpCode] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '', phone_number: '+254', subcounty: 'MWATATE', acreage: '', password: '', confirm_password: '', crops: []
  });

  const SUBCOUNTY_CHOICES = ['Voi', 'Mwatate', 'Wundanyi', 'Taveta'];

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/crops/`)
      .then(res => res.json())
      .then(data => setAvailableCrops(data))
      .catch(() => setError('Could not load crops from the server.'));
  }, []);

  const handleCheckboxChange = (cropId) => {
    setFormData(prev => {
      const isSelected = prev.crops.includes(cropId);
      if (isSelected) return { ...prev, crops: prev.crops.filter(id => id !== cropId) };
      return { ...prev, crops: [...prev.crops, cropId] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirm_password) return setError('Passwords do not match.');
    setLoading(true);

    try {
      const submitData = { ...formData };
      delete submitData.confirm_password;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/farmers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.phone_number) throw new Error('This phone number is already registered.');
        throw new Error('Failed to create account. Please check your details.');
      }
      
      // Success! Move to the OTP verification screen
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // MOVED INSIDE THE COMPONENT
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/verify-otp/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                phone_number: formData.phone_number, 
                otp_code: otpCode 
            })
        });

        if (response.ok) {
            alert("Verification successful! You can now log in to the portal.");
            navigate('/login');
        } else {
            setError("Invalid verification code. Please check your SMS and try again.");
        }
    } catch (err) {
        setError("Error connecting to the verification server.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-sans relative overflow-hidden">
      
      {/* Background abstract shape */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        
        <div className="flex justify-end mb-4 px-4">
          <ThemeToggle />
        </div>

        <div className="text-center mb-10">
          <Link to="/" className="inline-flex w-16 h-16 rounded-2xl bg-[#104330] items-center justify-center shadow-lg hover:scale-105 transition-transform mb-6">
            <Sprout className="w-10 h-10 text-green-400" />
          </Link>
          <h2 className="text-3xl md:text-4xl font-black text-[#0B2C20] dark:text-white tracking-tight">
            {step === 1 ? 'Register Your Farm' : 'Verify Your Phone'}
          </h2>
          <p className="mt-3 text-sm md:text-base font-medium text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            {step === 1 
              ? 'Join the official Taita-Taveta agricultural network to access market analytics, log activities, and receive local advisories.'
              : `We just sent a secure 6-digit code via SMS to ${formData.phone_number}.`}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 py-8 px-6 md:px-10 shadow-xl border border-gray-200 dark:border-gray-800 rounded-3xl transition-colors duration-300">
          
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {step === 1 ? (
            /* --- STEP 1: MAIN REGISTRATION FORM --- */
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1: Personal Details */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Full Legal Name</label>
                    <div className="relative">
                      <User className="absolute inset-y-0 left-0 pl-3 h-full w-8 text-gray-400 pointer-events-none" />
                      <input required type="text" placeholder="Jane Doe" className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-[#F8FAF9] dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#104330] focus:border-transparent text-sm transition-colors" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Phone Number (+254)</label>
                    <div className="relative">
                      <Phone className="absolute inset-y-0 left-0 pl-3 h-full w-8 text-gray-400 pointer-events-none" />
                      <input required type="tel" placeholder="+254700000000" className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-[#F8FAF9] dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#104330] focus:border-transparent text-sm transition-colors" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Create Password</label>
                    <div className="relative">
                      <Lock className="absolute inset-y-0 left-0 pl-3 h-full w-8 text-gray-400 pointer-events-none" />
                      <input required type="password" placeholder="••••••••" className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-[#F8FAF9] dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#104330] focus:border-transparent text-sm transition-colors" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Column 2: Farm Details */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Location (Subcounty)</label>
                    <div className="relative">
                      <MapPin className="absolute inset-y-0 left-0 pl-3 h-full w-8 text-gray-400 pointer-events-none" />
                      <select required className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-[#F8FAF9] dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#104330] focus:border-transparent text-sm transition-colors" value={formData.subcounty} onChange={e => setFormData({...formData, subcounty: e.target.value.toUpperCase()})}>
                        <option value="">Select Subcounty...</option>
                        {SUBCOUNTY_CHOICES.map(loc => <option key={loc} value={loc.toUpperCase()}>{loc}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Farm Size</label>
                    <div className="relative flex items-center">
                      <Maximize className="absolute inset-y-0 left-0 pl-3 h-full w-8 text-gray-400 pointer-events-none z-10" />
                      <input required type="number" step="0.1" min="0.1" placeholder="e.g. 2.5" className="block w-full pl-10 pr-16 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-[#F8FAF9] dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#104330] focus:border-transparent text-sm transition-colors" value={formData.acreage} onChange={e => setFormData({...formData, acreage: e.target.value})} />
                      <span className="absolute right-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none">Acres</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute inset-y-0 left-0 pl-3 h-full w-8 text-gray-400 pointer-events-none" />
                      <input required type="password" placeholder="••••••••" className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-[#F8FAF9] dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#104330] focus:border-transparent text-sm transition-colors" value={formData.confirm_password} onChange={e => setFormData({...formData, confirm_password: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Width: Crop Selection */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Active Crop Catalog (Select all that apply)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-[#F8FAF9] dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  {availableCrops.length === 0 ? (
                    <p className="col-span-full text-xs text-gray-500 italic">Loading catalog...</p>
                  ) : (
                    availableCrops.map(crop => (
                      <label key={crop.id} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-[#104330] rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-[#104330] transition-colors cursor-pointer"
                          checked={formData.crops.includes(crop.id)} 
                          onChange={() => handleCheckboxChange(crop.id)} 
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                          {crop.name.replace('_', ' ')}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-md text-sm font-black text-white bg-[#0B2C20] hover:bg-[#104330] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#104330] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none">
                {loading ? 'Creating Secure Account...' : 'Register & Verify Phone'}
              </button>
            </form>

          ) : (
            
            /* --- STEP 2: OTP VERIFICATION FORM --- */
            <form onSubmit={handleVerifyOTP} className="space-y-6 text-center py-8">
              <ShieldCheck className="w-16 h-16 text-[#104330] dark:text-green-500 mx-auto mb-6" />
              
              <div className="max-w-xs mx-auto">
                <input
                  required
                  type="text"
                  maxLength="6"
                  placeholder="000000"
                  className="block w-full text-center tracking-[0.5em] text-3xl font-bold py-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-[#F8FAF9] dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#104330] focus:border-transparent transition-colors"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))} // Strips out letters
                />
              </div>

              <button type="submit" disabled={loading} className="w-full max-w-xs mx-auto flex justify-center items-center py-4 px-4 rounded-xl shadow-md text-sm font-black text-white bg-[#0B2C20] hover:bg-[#104330] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#104330] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none">
                {loading ? 'Verifying...' : 'Verify & Activate'}
              </button>

              <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-4 underline">
                Go back and edit details
              </button>
            </form>
          )}

          {step === 1 && (
            <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-[#104330] dark:text-green-400 hover:underline">
                  Sign in to your portal
                </Link>
              </p>
            </div>
          )}

        </div>

        <div className="mt-8 text-center pb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Cancel & Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}