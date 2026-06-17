// client/src/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        // Redirect to the dashboard upon successful login
        navigate('/dashboard'); 
      } else {
        setError('Invalid admin credentials');
      }
    } catch (err) {
      setError('Cannot connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          System Administration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">Secure access for authorized personnel only</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300">Admin Username</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-green-500 focus:border-green-500"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-green-500 focus:border-green-500"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              {isLoading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}