import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  LayoutDashboard, Users, Scan, 
  Video, ShieldCheck, BarChart3, 
  LogOut, Globe, Clock
} from 'lucide-react';
import { clsx } from 'clsx';

const Sidebar = () => {
  const { user, logout } = useAuth();
  
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
    { icon: <Users size={20} />, label: 'Ustozlar', path: '/admin/teachers' },
    { icon: <Clock size={20} />, label: 'Qo\'ng\'iroqlar Jadvali', path: '/admin/schedule-bell' },
    { icon: <ShieldCheck size={20} />, label: 'AI Dars Jadvali', path: '/admin/schedule' },
    { icon: <Scan size={20} />, label: 'Maktabga kirish (QR)', path: '/admin/qr' },
    { icon: <Video size={20} />, label: 'Dars isbotlari', path: '/admin/video' },
    { icon: <BarChart3 size={20} />, label: 'Analitika', path: '/admin/analytics' },
  ];

  return (
    <aside className="w-72 h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-40 text-slate-300">
      <div className="p-8 flex flex-col gap-1 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">E</div>
          <span className="text-2xl font-display font-bold text-white tracking-tight">EduPuls</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-primary-400 mt-2 bg-primary-900/40 p-2 rounded-lg">
          <Globe size={14} />
          {user?.schoolName || 'Maktab'}
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium',
              isActive 
                ? 'bg-primary-600 text-white font-semibold shadow-lg shadow-primary-900/50' 
                : 'hover:bg-slate-800 hover:text-white'
            )}
          >
            <span className={clsx('transition-colors')}>
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <div className="mb-4 px-4">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Direktor</p>
          <p className="text-sm font-bold text-white">{user?.name}</p>
        </div>
        <button onClick={logout} className="flex items-center justify-center font-bold gap-3 px-4 py-3 rounded-xl text-rose-400 border border-rose-900/50 hover:bg-rose-950/50 w-full transition-colors">
          <LogOut size={20} />
          <span>Tizimdan chiqish</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
