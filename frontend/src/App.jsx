import React, { createContext, useContext, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Sidebar from './components/Sidebar';
import api from './api/axios';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // credentials: { username, password }
      const { data } = await api.post('/auth/login', {
        username: credentials.username,
        password: credentials.password
      });

      if (data) {
        const userData = {
          id: data._id,
          role: data.role,
          name: data.fullName,
          username: data.username
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);

        if (userData.role === 'superadmin') navigate('/superadmin');
        else if (userData.role === 'admin') navigate('/admin');
        else navigate('/teacher');
        return true;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-display font-bold text-primary-600 animate-pulse">Yuklanmoqda...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <div className="min-h-screen bg-slate-50 font-sans">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Super Admin Routes */}
          <Route path="/superadmin/*" element={
            user?.role === 'superadmin' ? <SuperAdminDashboard /> : <Navigate to="/login" />
          } />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />
          } />

          {/* Teacher Routes */}
          <Route path="/teacher/*" element={
            user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/login" />
          } />

          <Route path="/" element={<Navigate to={user ? (user.role === 'superadmin' ? '/superadmin' : user.role === 'admin' ? '/admin' : '/teacher') : '/login'} />} />
        </Routes>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
