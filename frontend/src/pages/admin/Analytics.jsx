import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Trash2, AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';
import api from '../../api/axios';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);
  const [stats, setStats] = useState({ weeklyStats: [], kpiData: [] });

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/schools/my/analytics');
      setStats(data);
    } catch (error) {
      console.error('Fetch analytics failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleResetData = async () => {
    const confirmed = window.confirm(
      "DIQQAT! Barcha dars isbotlari, videolar va davomat statistikasi butunlay o'chirib tashlanadi. Faqat xodimlar ro'yxati qoladi. Rozimisiz?"
    );

    if (!confirmed) return;

    setResetLoading(true);
    try {
      await api.post('/schools/my/reset');
      alert("Maktab statistikasi muvaffaqiyatli tozalandi!");
      fetchAnalytics(); // Ma'lumotlarni qayta yuklash (hammasi 0 bo'ladi)
    } catch (error) {
      alert("Xatolik yuz berdi: " + (error.response?.data?.message || error.message));
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) {
    return <div className="p-20 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest">Analitika yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 border-b-4 border-indigo-500 inline-block pb-2">Analitika va Hisobotlar</h1>
          <p className="text-slate-500 font-medium mt-3">Grafiklar haqiqiy o'qituvchilar faoliyati asosida shakllanadi</p>
        </div>
        <button onClick={fetchAnalytics} className="p-3 bg-white text-slate-400 hover:text-primary-600 rounded-2xl shadow-sm border border-slate-100 transition-all">
           <RefreshCw size={20} />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Chart 1: Weekly Punctuality */}
         <Card className="p-6 h-[450px] border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 opacity-40" />
            <h2 className="text-xl font-bold font-display text-slate-800 mb-6 relative z-10">Kelish statistikasi (Haftalik)</h2>
            
            {stats.weeklyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={stats.weeklyStats}>
                  <defs>
                    <linearGradient id="colorO" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorK" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="O'z vaqtida" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorO)" />
                  <Area type="monotone" dataKey="Kechikkan" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorK)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 font-bold italic">Hozircha ma'lumot yo'q</div>
            )}
         </Card>

         {/* Chart 2: Teacher KPIs */}
         <Card className="p-6 h-[450px] border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 opacity-40" />
            <h2 className="text-xl font-bold font-display text-slate-800 mb-6 relative z-10">O'qituvchilar KPI ko'rsatkichlari</h2>
            
            {stats.kpiData.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={stats.kpiData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke="#64748b" fontSize={13} fontWeight={800} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '10px 10px 20px rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="kpi" fill="#6366f1" radius={[0, 12, 12, 0]} maxBarSize={30}>
                     <Legend />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 font-bold italic">Ma'lumotlar mavjud emas</div>
            )}
         </Card>
      </div>

      {/* Danger Zone */}
      <div className="mt-16">
         <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-rose-200 flex-1"></div>
            <h3 className="text-rose-500 font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
               <AlertTriangle size={14} /> O'ta Xavfli Zona
            </h3>
            <div className="h-px bg-rose-200 flex-1"></div>
         </div>
         
         <Card className="p-8 border-rose-100 bg-rose-50/20 border-2 border-dashed flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-rose-100/50 rounded-full blur-2xl" />
            <div className="max-w-2xl relative z-10">
               <h4 className="text-xl font-black text-slate-900 mb-2 uppercase italic tracking-tight">Tizimni To'liq Nollash</h4>
               <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Bu amal barcha o'tgan haftalik darslar, davomat qaydlari va statistikani o'chirib tashlaydi. 
                  Bu amaldan so'ng grafiklar bo'sh bo'ladi va yangidan hisoblanadi. 
                  TIZIM TESTDAN O'TGANDAN KEYIN HAQIQIY ISH REJIMIGA O'TISHUCHUN FOYDALANING.
               </p>
            </div>
            <Button 
               variant="danger" 
               className="gap-3 shrink-0 py-5 px-10 shadow-2xl shadow-rose-200 rounded-[28px] text-lg font-black"
               onClick={handleResetData}
               disabled={resetLoading}
            >
               {resetLoading ? <RefreshCw size={24} className="animate-spin" /> : <Trash2 size={24} />}
               {resetLoading ? "TIZIM TOZALANMOQDA..." : "HAMMASINI O'CHIRISH"}
            </Button>
         </Card>
      </div>
    </div>
  );
}
