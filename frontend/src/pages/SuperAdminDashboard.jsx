import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import Button from '../components/Button';
import Card from '../components/Card';
import { Building2, UserPlus, LogOut, MoreHorizontal, Database, Globe, Trash2, QrCode, RefreshCw, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../api/axios';

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSchoolMenu, setActiveSchoolMenu] = useState(null);
  const [newSchool, setNewSchool] = useState({ name: '', director: '', login: '', password: '' });
  
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [qrCode, setQrCode] = useState('');

  const fetchSchools = async () => {
    try {
      const { data } = await api.get('/schools');
      setSchools(data);
    } catch (error) {
      console.error('Schools fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleDeleteSchool = async (id) => {
    if (window.confirm('Haqiqatan ham ushbu maktabni o\'chirib tashlamoqchimisiz?')) {
      try {
        await api.delete(`/schools/${id}`);
        setSchools(schools.filter(school => school._id !== id));
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleShowQR = (school) => {
    setSelectedSchool(school);
    setQrCode(school.qrSecret);
    setShowQRModal(true);
  };

  const downloadQR = () => {
    const canvas = document.getElementById("school-qr-canvas");
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${selectedSchool.name}_QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleAddSchool = async () => {
    if (!newSchool.name || !newSchool.director || !newSchool.login || !newSchool.password) {
      alert('Iltimos, barcha maydonlarni to\'ldiring!');
      return;
    }
    
    try {
      const { data } = await api.post('/schools', {
        name: newSchool.name,
        director: newSchool.director,
        login: newSchool.login,
        password: newSchool.password
      });
      
      setSchools([...schools, data]);
      setNewSchool({ name: '', director: '', login: '', password: '' });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Add failed:', error?.response?.data?.message || error.message);
      alert('Xatolik yuz berdi: ' + (error?.response?.data?.message || 'Akkaunt yaratilmadi'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-72 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-40">
        <div className="p-8 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">S</div>
          <span className="text-2xl font-display font-bold tracking-tight">SuperAdmin</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-600 text-white font-medium w-full text-left">
            <Building2 size={20} />
            Maktablar
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition w-full text-left">
            <Database size={20} />
            Tizim Holati
          </button>
        </nav>
        <div className="p-4 mt-auto border-t border-slate-800">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-rose-400 w-full transition-colors">
            <LogOut size={20} />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      <main className="pl-72 flex-1 p-8">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-extrabold text-slate-900">Maktablar boshqaruvi</h1>
            <p className="text-slate-500">Tizimga ulangan barcha maktablar reyestri</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-slate-900 hover:bg-slate-800">
            <UserPlus size={20} />
            Yangi maktab qo'shish
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-slate-500 text-sm font-bold mb-1">Jami maktablar</div>
            <div className="text-4xl font-display font-black text-slate-900">{schools.length}</div>
          </Card>
          <Card>
             <div className="text-slate-500 text-sm font-bold mb-1">Jami o'qituvchilar</div>
             <div className="text-4xl font-display font-black text-primary-600">
               {schools.reduce((acc, curr) => acc + (curr.teachersCount || 0), 0)}
             </div>
          </Card>
          <Card>
             <div className="text-slate-500 text-sm font-bold mb-1">Status</div>
             <div className="text-4xl font-display font-black text-emerald-500">Normal</div>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden border-none text-center">
          {loading ? (
            <div className="p-12 text-slate-400 font-bold animate-pulse">Maktablar yuklanmoqda...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Maktab</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Direktor (Admin)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">O'qituvchilar</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">O'quvchilar</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools.map((school, i) => (
                  <motion.tr 
                    key={school._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                      <Globe className="text-primary-400" size={18} />
                      {school.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{school.director}</td>
                    <td className="px-6 py-4 text-slate-600">{school.teachersCount || 0}</td>
                    <td className="px-6 py-4 text-slate-600">{school.studentsCount || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${school.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {school.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleShowQR(school)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition">
                          <QrCode size={18} />
                        </button>
                        <button onClick={() => handleDeleteSchool(school._id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 font-display text-slate-900">Yangi maktab ulash</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Maktab nomi</label>
                  <input type="text" className="w-full border-slate-200 rounded-xl p-3 bg-slate-50" placeholder="Masalan: 10-Maktab" value={newSchool.name} onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Direktor F.I.SH (Admin)</label>
                  <input type="text" className="w-full border-slate-200 rounded-xl p-3 bg-slate-50" placeholder="Direktor ismi" value={newSchool.director} onChange={(e) => setNewSchool({ ...newSchool, director: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Admin Login</label>
                  <input type="text" className="w-full border-indigo-100 rounded-xl p-3 bg-indigo-50" placeholder="Yangi login kiriting..." value={newSchool.login} onChange={(e) => setNewSchool({ ...newSchool, login: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">Parol</label>
                  <input type="text" className="w-full border-indigo-100 rounded-xl p-3 bg-indigo-50" placeholder="Yangi parol kiriting..." value={newSchool.password} onChange={(e) => setNewSchool({ ...newSchool, password: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <Button variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Bekor qilish</Button>
                <Button className="flex-1" onClick={handleAddSchool}>Qo'shish</Button>
              </div>
            </motion.div>
          </div>
        )}

        {showQRModal && selectedSchool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowQRModal(false)} />
            <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 relative shadow-2xl overflow-hidden">
               <div className="text-center mb-6">
                 <h3 className="text-2xl font-black text-slate-900">{selectedSchool.name}</h3>
                 <p className="text-slate-500 font-medium mt-1">Davomat uchun QR kod</p>
               </div>
               <div className="bg-slate-50 p-6 rounded-[2rem] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 mb-6">
                  <div className="bg-white p-4 rounded-3xl shadow-xl">
                    <QRCodeCanvas id="school-qr-canvas" value={qrCode} size={200} level="H" includeMargin={false} />
                  </div>
                  <div className="mt-4 text-center">
                     <code className="bg-slate-200 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 uppercase tracking-widest">{qrCode}</code>
                  </div>
               </div>
               <div className="flex flex-col gap-3">
                  <button 
                    onClick={downloadQR}
                    className="flex items-center justify-center gap-3 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 w-full"
                  >
                    <Download size={18} /> QR Kodni yuklash (.PNG)
                  </button>
               </div>
               <button onClick={() => setShowQRModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-all">
                  <X size={20} />
               </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
