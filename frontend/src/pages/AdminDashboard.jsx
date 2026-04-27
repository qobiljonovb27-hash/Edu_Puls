import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// Sub-pages
import AdminOverview from './admin/AdminOverview';
import TeacherManagement from './admin/TeacherManagement';
import AISchedule from './admin/AISchedule';
import QRCheckin from './admin/QRCheckin';
import VideoVerification from './admin/VideoVerification';
import Analytics from './admin/Analytics';
import BellSchedule from './admin/BellSchedule';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar is fixed on the left */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="pl-72 flex-1 p-8 h-screen overflow-y-auto w-full custom-scrollbar">
         <div className="max-w-7xl mx-auto">
           <Routes>
              {/* Default redirect if they hit /admin/ */}
              <Route path="/" element={<AdminOverview />} />
              <Route path="/teachers" element={<TeacherManagement />} />
              <Route path="/schedule-bell" element={<BellSchedule />} />
              <Route path="/schedule" element={<AISchedule />} />
              <Route path="/qr" element={<QRCheckin />} />
              <Route path="/video" element={<VideoVerification />} />
              <Route path="/monitoring" element={<AdminOverview />} /> {/* Alias mapping */}
              <Route path="/analytics" element={<Analytics />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
           </Routes>
         </div>
      </main>
    </div>
  );
}
