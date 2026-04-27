import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Clock, Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

export default function BellSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [checkInDeadline, setCheckInDeadline] = useState('07:45');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const { data } = await api.get('/schools/my/schedule');
      setSchedule(data.schedule || []);
      setCheckInDeadline(data.checkInDeadline || '07:45');
    } catch (error) {
       console.error('Fetch schedule failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTime = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/schools/my/schedule', { schedule, checkInDeadline });
      alert('Jadval va kirish vaqti muvaffaqiyatli saqlandi!');
    } catch (error) {
      alert('Xatolik yuz berdi!');
    } finally {
      setSaving(false);
    }
  };

  const addLesson = () => {
    const nextNum = schedule.length > 0 ? schedule[schedule.length - 1].lessonNumber + 1 : 1;
    setSchedule([...schedule, { lessonNumber: nextNum, startTime: '08:00', endTime: '08:45' }]);
  };

  const deleteLesson = (index) => {
    const newSchedule = schedule.filter((_, i) => i !== index);
    setSchedule(newSchedule);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 border-b-4 border-primary-500 inline-block pb-1">Qo'ng'iroqlar Jadvali</h1>
          <p className="text-slate-500 font-medium mt-2">Darslar va maktabga kelish vaqtlarini sozlang</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={addLesson} className="gap-2 border-slate-200">
            <Plus size={20} /> Dars qo'shish
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2 shadow-xl shadow-primary-200">
            <Save size={20} /> {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="p-20 text-center animate-pulse text-slate-400 font-bold">Yuklanmoqda...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* General Entry Time Card */}
          <Card className="p-6 bg-primary-600 text-white border-none shadow-xl shadow-primary-900/20">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <Clock size={28} className="text-white" />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold font-display uppercase tracking-tight">Maktabga umumiy kelish vaqti</h3>
                      <p className="text-primary-100 text-sm font-medium">Barcha o'qituvchilar shu vaqtgacha QR skaner qilishi shart</p>
                   </div>
                </div>
                <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20">
                   <input 
                     type="time" 
                     value={checkInDeadline}
                     onChange={(e) => setCheckInDeadline(e.target.value)}
                     className="bg-transparent text-white text-3xl font-black font-display focus:outline-none p-2 cursor-pointer [color-scheme:dark]"
                   />
                </div>
             </div>
          </Card>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-800 text-sm mb-4">
            <AlertCircle size={20} className="shrink-0" />
            <p className="font-medium text-xs leading-relaxed">
              <b>Eslatma:</b> Tizim dars boshlanish vaqtidan kechikan o'qituvchilarni avtomatik aniqlaydi. 
              Iltimos, dars vaqtlarini aniq belgilang.
            </p>
          </div>

          {schedule.sort((a,b) => a.lessonNumber - b.lessonNumber).map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="flex items-center justify-between p-4 bg-white border-slate-100 hover:shadow-lg transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-slate-100">
                    {item.lessonNumber}
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Dars</span>
                    <h3 className="text-lg font-bold text-slate-900 leading-none mt-0.5">{item.lessonNumber}-Dars</h3>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Boshlanishi</span>
                      <input 
                        type="time" 
                        value={item.startTime}
                        onChange={(e) => handleUpdateTime(index, 'startTime', e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition"
                      />
                    </div>
                    <div className="h-6 w-px bg-slate-200 mt-4 mx-2"></div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Tugashi</span>
                       <input 
                         type="time" 
                         value={item.endTime}
                         onChange={(e) => handleUpdateTime(index, 'endTime', e.target.value)}
                         className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition"
                       />
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => deleteLesson(index)}
                    className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
