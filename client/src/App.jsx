import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './Landing';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import MyFarm from './MyFarm';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import ContactSupport from './ContactSupport';

/**
 * Traffic Controller Component
 * Intercepts users before they load a page and verifies their identity/role.
 */
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('user_role');

  // 1. If they have no token, kick them to the login screen
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. If they are logged in but trying to access the WRONG portal, redirect them
  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === 'admin' ? '/dashboard' : '/my-farm'} replace />;
  }

  // 3. If everything matches, let them into the page
  return children;
};

export default function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES - Open to everyone */}
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/support" element={<ContactSupport />} />

      {/* PROTECTED ADMIN ROUTE - Strictly for County Admins */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRole="admin">
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* PROTECTED FARMER ROUTE - Strictly for Verified Farmers */}
      <Route 
        path="/my-farm" 
        element={
          <ProtectedRoute allowedRole="farmer">
            <MyFarm />
          </ProtectedRoute>
        } 
      />

      {/* CATCH-ALL: Send unknown URLs back to the landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}