import { Routes, Route } from 'react-router-dom';
import Landing from './Landing';
import Register from './Register';
import Login from './Login'; // 1. Import it here
import Dashboard from './Dashboard'; // Make sure your dashboard is imported too!
import MyFarm from './MyFarm'; // If you have a MyFarm component for the farmer's profile page
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} /> {/* 2. Add the route here */}
      <Route path="/dashboard" element={<Dashboard />} /> {/* 3. Add the dashboard route */}
      <Route path="/my-farm" element={<MyFarm />} /> {/* 4. Add the MyFarm route */}
    </Routes>
  );
}