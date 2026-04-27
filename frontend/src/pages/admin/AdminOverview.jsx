import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/Card';
import { CheckCircle, AlertTriangle, ShieldAlert, Image as ImageIcon, PlayCircle } from 'lucide-react';
import api from '../../api/axios';

export default function AdminOverview() {
  const [lessons, setLessons] = useState([]);
  const [stats, setStats] = useState({ totalTeachers: 0, presentToday: 0, activeLessons: 0, attendanceRate: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [lessonsRes, statsRes] = await Promise.all([
        api.get('/lessons/active'),
        api.get('/schools/stats')
      ]);
      setLessons(lessonsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Fetch monitoring data failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds for live monitoring
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-display font-extrabold text-slate-900">Asosiy Kuzatuv Paneli</h1>
        <p className="text-slate-500 font-medium">Barcha ko'rsatkichlar va jonli darslar nazorati</p>
      </header>

      {/* Realtime Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-primary-600 text-white border-none shadow-xl shadow-primary-900/20">
          <div className="text-primary-100 text-sm font-bold mb-1">Maktabdagi ustozlar</div>
          <div className="text-4xl font-display font-black">{stats.presentToday} / {stats.totalTeachers}</div>
        </Card>
        <Card>
          <div className="text-slate-500 text-sm font-bold mb-1 line-clamp-1">Hozirgi faol darslar</div>
          <div className="text-4xl font-display font-black text-slate-900">{stats.activeLessons}</div>
        </Card>
        <Card>
          <div className="text-slate-500 text-sm font-bold mb-1">Kechikkanlar (Bugun)</div>
          <div className="text-4xl font-display font-black text-amber-500">
            {lessons.filter(l => l.isLate).length}
          </div>
        </Card>
        <Card>
          <div className="text-slate-500 text-sm font-bold mb-1">Davomat Reytingi</div>
          <div className="text-4xl font-display font-black text-emerald-500">{stats.attendanceRate}%</div>
        </Card>
      </div>

      {/* Live Lesson Monitoring */}
      <div>
        <h2 className="text-xl font-display font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ShieldAlert className="text-primary-500" />
          Jonli Dars Nazorati
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full py-10 text-center text-slate-400 font-bold animate-pulse">Ma'lumotlar yuklanmoqda...</div>
          ) : lessons.length === 0 ? (
             <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold">
               Hozirda hech qanday faol dars mavjud emas
             </div>
          ) : (
            lessons.map((lesson, idx) => (
              <motion.div key={lesson._id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card className="p-5 flex flex-col gap-4 relative overflow-hidden shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg leading-tight uppercase font-display">{lesson.className || 'Sinf?'} - {lesson.subject || 'Fan?'}</h4>
                      <p className="text-slate-500 text-sm font-bold mt-1 text-primary-600">{(lesson.teacherId?.fullName || 'Noma\'lum o\'qituvchi')}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide mb-1">Boshlangan</span>
                      <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded-md font-black text-sm border border-primary-100">
                        {lesson.startTime ? new Date(lesson.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 flex flex-col gap-2 border border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-600">Dars Holati:</span>
                      {lesson.status === 'active' ? (
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Darsda
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Tugagan</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm border-t border-slate-200 pt-2">
                       <span className="font-bold text-slate-600 text-xs">Isbot:</span>
                       {lesson.videoUrl ? (
                         <a 
                           href={`http://localhost:5000${lesson.videoUrl}`} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md hover:bg-emerald-100 transition text-[11px]"
                         >
                           <PlayCircle size={14}/>
                           Faylni ko'rish
                         </a>
                       ) : (
                         <span className="text-rose-500 font-bold text-[10px] uppercase">Yuklanmagan</span>
                       )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
