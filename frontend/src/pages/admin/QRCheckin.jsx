import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/Card';
import { Scan, User, Clock, Search } from 'lucide-react';
import api from '../../api/axios';

export default function QRCheckin() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/attendance/school');
      setLogs(data);
    } catch (error) {
      console.error('Fetch logs failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 20000); // 20 saniyada yangilab turish
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 border-b-4 border-primary-500 inline-block pb-2">Maktabga kirish nazorati</h1>
          <p className="text-slate-500 font-medium mt-3">QR kod orqali maktabga kirgan o'qituvchilar hisoboti</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow border border-slate-100 font-bold text-primary-600 flex items-center gap-2">
          <Scan size={20}/> Jami: {logs.length} kishi
        </div>
      </header>

      <Card className="p-0 border-none overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Ism orqali qidirish..." className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium shadow-sm transition-all" />
          </div>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-white border-b border-slate-200">
            <tr>
              <th className="px-6 py-5 font-bold text-slate-400 uppercase tracking-wider text-xs">F.I.SH</th>
              <th className="px-6 py-5 font-bold text-slate-400 uppercase tracking-wider text-xs">Sana</th>
              <th className="px-6 py-5 font-bold text-slate-400 uppercase tracking-wider text-xs">Kelgan vaqti</th>
              <th className="px-6 py-5 font-bold text-slate-400 uppercase tracking-wider text-xs">Holat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-20 text-slate-400 font-bold">Yuklanmoqda...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-20 text-slate-400 font-bold">Bugun hech kim kelmadi</td></tr>
            ) : (
              logs.map((log, idx) => (
                <motion.tr key={log._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="hover:bg-slate-50 transition cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                        {log.teacherId?.fullName?.charAt(0) || '?'}
                      </div>
                      <span className="font-bold text-slate-900 text-base">{log.teacherId?.fullName || "O'chirilgan foydalanuvchi"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-500">
                    {new Date(log.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-900 font-display font-bold text-lg">
                      <Clock size={16} className="text-primary-500"/> {log.checkInTime}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${log.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {log.status === 'present' ? "Vaqtida" : "Kechikkan"}
                    </span>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
