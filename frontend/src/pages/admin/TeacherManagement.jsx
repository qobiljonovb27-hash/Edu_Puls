import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { UserPlus, Clock, Search, MoreHorizontal, Trash2 } from 'lucide-react';
import api from '../../api/axios';

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/teachers');
      setTeachers(data);
    } catch (error) {
      console.error('Fetch teachers failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDeleteTeacher = async (id) => {
    if (window.confirm('Haqiqatan ham ushbu o\'qituvchini o\'chirib tashlamoqchimisiz?')) {
      try {
        await api.delete(`/teachers/${id}`);
        setTeachers(teachers.filter(teacher => teacher._id !== id));
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTeacherMenu, setActiveTeacherMenu] = useState(null);
  const [newTeacher, setNewTeacher] = useState({ name: '', subject: '', login: '', password: '' });

  const handleAddTeacher = async () => {
    if (!newTeacher.name || !newTeacher.subject || !newTeacher.login || !newTeacher.password) {
      alert('Iltimos, hamma maydonlarni to\'ldiring!');
      return;
    }

    try {
      const { data } = await api.post('/teachers', {
        fullName: newTeacher.name,
        username: newTeacher.login,
        password: newTeacher.password,
        subject: newTeacher.subject
      });

      setTeachers([...teachers, data]);
      setNewTeacher({ name: '', subject: '', login: '', password: '' });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Add failed:', error?.response?.data?.message || 'Xato!');
      alert('Xatolik: ' + (error?.response?.data?.message || 'O\'qituvchi qo\'shilmadi'));
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900">Ustozlar Boshqaruvi</h1>
          <p className="text-slate-500 font-medium">Barcha o'qituvchilar va ularning ma'lumotlari</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-xl shadow-primary-200">
          <UserPlus size={20} />
          Yangi Ustoz Qo'shish
        </Button>
      </header>

      <Card className="p-0 border-none overflow-hidden shadow-lg shadow-slate-200/50">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Ism yoki fan bo'yicha qidirish..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium transition-all" />
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Ustoz</th>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Fan & Sinf</th>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Telefon</th>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">Holat</th>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider">KPI</th>
              <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-right">Harakat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-10 text-slate-400 font-bold">O'qituvchilar yuklanmoqda...</td></tr>
            ) : (
              teachers.map((teacher, idx) => (
                <motion.tr key={teacher._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">{teacher.fullName.charAt(0)}</div>
                      <span className="font-bold text-slate-900">{teacher.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="font-bold text-slate-800">{teacher.subject || 'Aniqlanmagan'}</span><br/>
                    <span className="text-xs text-slate-400">{teacher.class || 'Sinf biriktirilmagan'}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{teacher.phone || 'Nomalum'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold leading-none ${
                    teacher.status === 'Maktabda' || teacher.status === 'Darsda' ? 'bg-emerald-100 text-emerald-700' :
                    teacher.status === 'Kechikkan' ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {teacher.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500" style={{ width: `${teacher.KPI}%` }}></div>
                    </div>
                    <span className="font-bold text-slate-700">{teacher.KPI}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="relative inline-block text-left">
                    <button 
                      onClick={() => setActiveTeacherMenu(activeTeacherMenu === teacher._id ? null : teacher._id)}
                      className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    <AnimatePresence>
                      {activeTeacherMenu === teacher._id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setActiveTeacherMenu(null)} 
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden text-left"
                          >
                            <button
                              onClick={() => {
                                handleDeleteTeacher(teacher._id);
                                setActiveTeacherMenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-bold"
                            >
                              <Trash2 size={16} />
                              O'qituvchini o'chirish
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </td>
              </motion.tr>
            )))}
          </tbody>
        </table>
      </Card>

      {/* Add Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-3xl max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-bold font-display text-slate-900 mb-6 border-b-2 border-primary-500 inline-block pb-1">Yangi Ustoz Akkaunti</h2>
                        <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">F.I.SH</label>
                  <input 
                    type="text" 
                    placeholder="Masalan: Jamshid Anvarov" 
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition" 
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Fan nomi / Mutaxassislik</label>
                  <input 
                    type="text" 
                    placeholder="Matematika" 
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition" 
                    value={newTeacher.subject}
                    onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                  />
               </div>
               <div className="pt-3 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-500 uppercase">Login</label>
                  <input 
                    type="text" 
                    placeholder="Yangi login kiriting" 
                    className="w-full mt-1 p-3 bg-indigo-50 border border-indigo-100 rounded-xl outline-none text-indigo-900 focus:ring-2 focus:ring-indigo-500 transition" 
                    value={newTeacher.login}
                    onChange={(e) => setNewTeacher({ ...newTeacher, login: e.target.value })}
                  />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Parol</label>
                  <input 
                    type="text" 
                    placeholder="Maxfiy parolni yarating" 
                    className="w-full mt-1 p-3 bg-indigo-50 border border-indigo-100 rounded-xl outline-none text-indigo-900 focus:ring-2 focus:ring-indigo-500 transition" 
                    value={newTeacher.password}
                    onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                  />
               </div>
            </div>

            <div className="flex gap-4 mt-8">
               <Button variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Bekor qilish</Button>
               <Button className="flex-1 shadow-lg shadow-primary-200" onClick={handleAddTeacher}>Saqlash</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
