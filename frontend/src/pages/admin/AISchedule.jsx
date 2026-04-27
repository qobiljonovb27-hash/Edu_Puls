import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Plus, Trash2, Users, Clock, Save, X, Edit2, Calendar } from 'lucide-react';
import api from '../../api/axios';

const DAYS = [
  { key: 'Mon', label: 'Dushanba' },
  { key: 'Tue', label: 'Seshanba' },
  { key: 'Wed', label: 'Chorshanba' },
  { key: 'Thu', label: 'Payshanba' },
  { key: 'Fri', label: 'Juma' },
  { key: 'Sat', label: 'Shanba' },
];

export default function AISchedule() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [bellSchedule, setBellSchedule] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null); // { day, lessonNumber }
  const [formData, setFormData] = useState({ subject: '', teacherId: '' });

  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  const fetchData = async () => {
    try {
      const [classesRes, bellRes, teachersRes] = await Promise.all([
        api.get('/schools/my/classes'),
        api.get('/schools/my/schedule'),
        api.get('/teachers')
      ]);
      setClasses(classesRes.data);
      setBellSchedule(bellRes.data.schedule || []);
      setTeachers(teachersRes.data);
      if (classesRes.data.length > 0 && !selectedClass) {
        setSelectedClass(classesRes.data[0].name);
      }
    } catch (error) {
      console.error('Fetch basic data failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassSchedule = async (className) => {
    if (!className) return;
    try {
      const { data } = await api.get(`/schedules/class/${className}`);
      setWeeklyData(data);
    } catch (error) {
      console.error('Fetch class schedule failed:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchClassSchedule(selectedClass);
  }, [selectedClass]);

  const handleAddClass = async () => {
    if (!newClassName) return;
    try {
      const { data } = await api.post('/schools/my/classes', { name: newClassName });
      setClasses(data);
      setNewClassName('');
      setIsAddClassModalOpen(false);
      if (!selectedClass) setSelectedClass(newClassName);
    } catch (error) {
       alert(error.response?.data?.message || 'Xato!');
    }
  };

  const handleOpenModal = (day, lessonNumber, existing = null) => {
    setActiveSlot({ day, lessonNumber });
    if (existing) {
      setFormData({ subject: existing.subject, teacherId: existing.teacherId?._id || '' });
    } else {
      setFormData({ subject: '', teacherId: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveSlot = async () => {
    if (!formData.subject || !formData.teacherId) {
      alert('Iltimos, fanni va o\'qituvchini tanlang!');
      return;
    }

    try {
      await api.post('/schedules', {
        className: selectedClass,
        dayOfWeek: activeSlot.day,
        lessonNumber: activeSlot.lessonNumber,
        ...formData
      });
      setIsModalOpen(false);
      fetchClassSchedule(selectedClass);
    } catch (error) {
      alert('Saqlashda xatolik!');
    }
  };

  const handleDeleteSlot = async (id) => {
    if (window.confirm('Ushbu darsni jadvaldan o\'chirmoqchimisiz?')) {
      try {
        await api.delete(`/schedules/${id}`);
        fetchClassSchedule(selectedClass);
      } catch (error) {
        alert('O\'chirishda xatolik!');
      }
    }
  };

  const getSlotData = (day, num) => {
    return weeklyData.find(d => d.dayOfWeek === day && d.lessonNumber === num);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)]">
      {/* Sidebar - Sinflar ro'yxati */}
      <div className="w-full lg:w-64 flex flex-col gap-4">
        <div className="flex justify-between items-center px-2">
           <h2 className="text-xl font-display font-black text-slate-900 flex items-center gap-2">
              <Users size={24} className="text-primary-600" /> Sinflar
           </h2>
           <button 
             onClick={() => setIsAddClassModalOpen(true)}
             className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all shadow-sm"
             title="Yangi sinf qo'shish"
           >
              <Plus size={18} />
           </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {classes.map((cls) => (
            <button
              key={cls._id}
              onClick={() => setSelectedClass(cls.name)}
              className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all border-2 ${
                selectedClass === cls.name 
                  ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-900/20 scale-[1.02]' 
                  : 'bg-white text-slate-600 border-slate-100 hover:border-primary-200'
              }`}
            >
              {cls.name} Sinf
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Haftalik Jadval */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <header className="flex justify-between items-center bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-display font-black text-slate-900 uppercase">
              {selectedClass} - Haftalik Dars Jadvali
            </h1>
            <p className="text-slate-400 font-bold text-sm">Haftalik darslarni rejalashtirish va tahrirlash</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-slate-500 font-bold text-sm">
             <Calendar size={18} /> Bugun: {new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}
          </div>
        </header>

        <div className="flex-1 overflow-auto rounded-[32px] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 custom-scrollbar">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-900 text-white">
                <th className="p-4 text-xs font-black uppercase text-slate-400 border-r border-slate-800 w-20">No.</th>
                {DAYS.map(day => (
                  <th key={day.key} className="p-4 text-sm font-black uppercase tracking-widest border-r border-slate-800">{day.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bellSchedule.sort((a,b) => a.lessonNumber - b.lessonNumber).map((bell) => (
                <tr key={bell._id} className="border-b border-slate-50 group">
                  <td className="p-4 bg-slate-50 border-r border-slate-100 text-center sticky left-0 z-10">
                    <div className="flex flex-col items-center">
                       <span className="text-lg font-black text-slate-900 leading-none">{bell.lessonNumber}</span>
                       <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{bell.startTime}</span>
                    </div>
                  </td>
                  {DAYS.map(day => {
                    const slot = getSlotData(day.key, bell.lessonNumber);
                    return (
                      <td 
                        key={day.key} 
                        className="p-2 border-r border-slate-50 min-w-[180px] h-32 align-top"
                      >
                        {slot ? (
                          <div className="bg-primary-50 border-2 border-primary-200 rounded-2xl p-3 h-full flex flex-col justify-between group/slot relative overflow-hidden">
                             <div>
                                <h4 className="font-extrabold text-primary-900 text-sm leading-tight mb-1">{slot.subject}</h4>
                                <p className="text-[11px] font-bold text-primary-600 line-clamp-1">{slot.teacherId?.fullName}</p>
                             </div>
                             
                             <div className="flex gap-1 absolute top-2 right-2 opacity-0 group-hover/slot:opacity-100 transition-all scale-75 origin-top-right">
                                <button onClick={() => handleOpenModal(day.key, bell.lessonNumber, slot)} className="p-2 bg-white text-primary-600 rounded-lg shadow-md hover:bg-primary-600 hover:text-white transition">
                                   <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDeleteSlot(slot._id)} className="p-2 bg-white text-rose-500 rounded-lg shadow-md hover:bg-rose-500 hover:text-white transition">
                                   <Trash2 size={14} />
                                </button>
                             </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleOpenModal(day.key, bell.lessonNumber)}
                            className="w-full h-full border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-200 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-300 transition-all"
                          >
                             <Plus size={24} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Dars biriktirish</span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Dars biriktirish */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white p-8 rounded-[40px] max-w-md w-full shadow-2xl relative"
            >
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase">Dars Biriktirish</h2>
                    <p className="text-slate-400 font-bold text-sm">Sinf: {selectedClass} | {activeSlot && DAYS.find(d => d.key === activeSlot.day)?.label} | {activeSlot?.lessonNumber}-dars</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition"><X /></button>
              </div>

              <div className="space-y-5">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">Fan nomi</label>
                    <input 
                      type="text" 
                      placeholder="Masalan: Matematika" 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 font-bold text-slate-900 transition" 
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1 block">O'qituvchini tanlang</label>
                    <select 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 font-bold text-slate-900 transition appearance-none" 
                      value={formData.teacherId}
                      onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    >
                      <option value="">O'qituvchini tanlang</option>
                      {teachers.map(t => (
                        <option key={t._id} value={t._id}>{t.fullName} ({t.subject})</option>
                      ))}
                    </select>
                 </div>
              </div>

              <div className="flex gap-4 mt-10">
                 <Button variant="ghost" className="flex-1 rounded-2xl" onClick={() => setIsModalOpen(false)}>Bekor qilish</Button>
                 <Button className="flex-1 shadow-lg shadow-primary-200 rounded-2xl" onClick={handleSaveSlot}>Jadvalga qo'shish</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Add Class Modal */}
      <AnimatePresence>
        {isAddClassModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white p-8 rounded-[40px] max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full -z-0 opacity-50" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 text-primary-600">
                  <Users size={32} />
                </div>
                <h2 className="text-2xl font-black font-display text-slate-900 mb-2">Yangi Sinf</h2>
                <p className="text-slate-500 text-sm font-medium mb-6">Sinf nomini kiriting (masalan: 10-A, 9-B)</p>
                
                <div className="space-y-4">
                   <input 
                     type="text" 
                     placeholder="10-A" 
                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 font-bold text-lg text-slate-900 placeholder:text-slate-300 transition" 
                     value={newClassName}
                     onChange={(e) => setNewClassName(e.target.value)}
                     autoFocus
                     onKeyDown={(e) => e.key === 'Enter' && handleAddClass()}
                   />
                </div>

                <div className="flex gap-3 mt-8">
                   <Button variant="ghost" className="flex-1 rounded-2xl" onClick={() => setIsAddClassModalOpen(false)}>Bekor qilish</Button>
                   <Button className="flex-1 shadow-lg shadow-primary-200 rounded-2xl" onClick={handleAddClass}>Qo'shish</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
