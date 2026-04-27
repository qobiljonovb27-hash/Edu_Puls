import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/Card';
import { PlayCircle, CheckCircle, XCircle } from 'lucide-react';

export default function VideoVerification() {
  const [proofs, setProofs] = useState([
    { id: 1, teacher: 'Anvarov Jamshid', class: '9-A', subject: 'Matematika', time: '08:05', type: 'video', status: 'pending', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 2, teacher: 'Qosimov Sardor', class: '11-V', subject: 'Ingliz tili', time: '08:40', type: 'photo', status: 'approved', url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&q=80' },
    { id: 3, teacher: 'Rahmatulloyeva Odina', class: '10-B', subject: 'Ona tili', time: '09:15', type: 'photo', status: 'rejected', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80' },
  ]);

  const handleAction = (id, action) => {
    setProofs(proofs.map(p => p.id === id ? { ...p, status: action } : p));
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-extrabold text-slate-900">Dars Isbotlari (Video/Rasm)</h1>
        <p className="text-slate-500 font-medium">Ustozlar tasdiqlagan dars isbotlarini tekshirish va qabul qilish</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proofs.map((proof, idx) => (
          <motion.div key={proof.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
            <Card className="p-0 overflow-hidden shadow-lg border-slate-100 flex flex-col h-full">
              <div className="relative h-48 bg-slate-900 group">
                {proof.type === 'video' ? (
                  <>
                    <video src={proof.url} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition">
                      <PlayCircle size={48} className="text-white drop-shadow-md" />
                    </div>
                  </>
                ) : (
                  <img src={proof.url} className="w-full h-full object-cover opacity-90" alt="Isbot" />
                )}
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                    proof.status === 'approved' ? 'bg-emerald-500 text-white' :
                    proof.status === 'rejected' ? 'bg-rose-500 text-white' :
                    'bg-amber-500 text-white animate-pulse'
                  }`}>
                    {proof.status === 'approved' ? 'Qabul qilingan' : proof.status === 'rejected' ? 'Rad etilgan' : 'Kutilmoqda...'}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4 flex-1">
                  <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{proof.subject} <span className="text-slate-400 font-medium text-sm">({proof.class})</span></h3>
                  <p className="text-slate-600 font-medium">{proof.teacher}</p>
                  <p className="text-slate-400 text-xs font-bold mt-2">Yuborilgan vaqt: {proof.time}</p>
                </div>
                
                {proof.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button onClick={() => handleAction(proof.id, 'rejected')} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold transition">
                      <XCircle size={18} /> Rad etish
                    </button>
                    <button onClick={() => handleAction(proof.id, 'approved')} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 font-bold transition">
                      <CheckCircle size={18} /> Qabul qilish
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
