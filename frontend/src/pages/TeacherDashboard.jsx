import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../App';
import Button from '../components/Button';
import Card from '../components/Card';
import { 
  ScanLine, Camera, LogOut, CheckCircle2, 
  Clock, Plus, Video, Image as ImageIcon, X, Sparkles, Timer,
  Maximize
} from 'lucide-react';
import api from '../api/axios';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

// Timer Component for each lesson
const LessonCountdown = ({ startTime, durationSeconds, onEnd }) => {
  const [timeLeft, setTimeLeft] = React.useState(durationSeconds);

  React.useEffect(() => {
    if (timeLeft <= 0) {
      onEnd();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onEnd]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-xs ${timeLeft < 5 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-amber-100 text-amber-700'}`}>
      <Timer size={14} />
      {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  
  const [activeLessons, setActiveLessons] = useState([]);
  const [lessonHistory, setLessonHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [newClass, setNewClass] = useState('');
  const [newSubject, setNewSubject] = useState('');

  const fetchActiveStatus = async () => {
    try {
      // Get teacher's today attendance
      const { data: attendance } = await api.get(`/attendance/teacher/${user.id}`);
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = attendance.find(a => a.date === today);
      if (todayRecord) {
        setIsCheckedIn(true);
        setCheckInTime(todayRecord.checkInTime);
      }

      // Get active lessons
      const { data: lessons } = await api.get('/lessons/active');
      const safeLessons = Array.isArray(lessons) ? lessons : [];
      setActiveLessons(safeLessons.filter(l => 
        (l.teacherId?._id === user.id) || (l.teacherId === user.id)
      ));

      // Get history
      const { data: history } = await api.get('/lessons/history');
      setLessonHistory(history);
    } catch (error) {
      console.error('Fetch status failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchActiveStatus();
  }, [user]);
  
  const [activeMediaTask, setActiveMediaTask] = useState(null);
  const fileInputRef = useRef(null);
  const [captureType, setCaptureType] = useState('image/*');

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner('reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] // Faqat kamera
      });

      scanner.render((decodedText) => {
        handleQRSuccess(decodedText);
        scanner.clear();
      }, (error) => {
        // scan error
      });

      return () => {
        scanner.clear();
      };
    }
  }, [showScanner]);

  const handleQRSuccess = async (qrCode) => {
    try {
      const { data } = await api.post('/attendance/qr-checkin', { qrCode });
      setIsCheckedIn(true);
      setCheckInTime(data.checkInTime);
      setShowScanner(false);
      alert('Davomat muvaffaqiyatli qayd etildi!');
    } catch (error) {
       console.error('Check-in failed:', error);
       alert(error?.response?.data?.message || 'Skanerlashda xatolik yuz berdi');
       setShowScanner(false);
    }
  };

  const handleQRScan = () => {
    setShowScanner(true);
  };

  const handleStartLesson = async (e) => {
    e.preventDefault();
    if (!newClass.trim() || !newSubject.trim()) return;

    try {
      const { data } = await api.post('/lessons/start', {
        className: newClass,
        subject: newSubject
      });

      setActiveLessons([data, ...activeLessons]);
      setNewClass('');
      setNewSubject('');
    } catch (error) {
      console.error('Start lesson failed:', error);
      alert(error?.response?.data?.message || 'Darsni boshlab bo\'lmadi');
    }
  };

  const handleEndLesson = async (lessonId) => {
    try {
      await api.put(`/lessons/${lessonId}/end`);
      setActiveLessons(activeLessons.filter(l => l._id !== lessonId));
      // Refresh history
      const { data: history } = await api.get('/lessons/history');
      setLessonHistory(history);
    } catch (error) {
      console.error('End lesson failed:', error);
      alert(error?.response?.data?.message || 'Darsni tugatib bo\'lmadi');
    }
  };

  const triggerFileInput = (lessonId, type) => {
    setActiveMediaTask(lessonId);
    setCaptureType(type === 'video' ? 'video/*' : 'image/*');
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && activeMediaTask) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const { data } = await api.post(`/lessons/${activeMediaTask}/proof`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Success: Update state with the backend-saved path
        setActiveLessons(activeLessons.map(l => 
          l._id === activeMediaTask ? { ...l, videoUrl: data.videoUrl } : l
        ));
        
        alert('Isbot muvaffaqiyatli yuklandi!');
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Fayl yuklashda xatolik: ' + (error?.response?.data?.message || 'Server xatosi'));
      } finally {
        setActiveMediaTask(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-20 overflow-x-hidden">
      
      <input 
        type="file"
        accept={captureType}
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Mobile Top Header */}
      <header className="bg-primary-600 text-white rounded-b-[2.5rem] shadow-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="flex justify-between items-center relative z-10 mb-8 mt-2">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-display font-bold text-2xl border border-white/20">
               {user?.name?.charAt(0) || 'U'}
             </div>
             <div>
               <h1 className="font-bold text-lg leading-tight">{user?.name}</h1>
               <p className="text-primary-100 text-sm font-medium">{user?.subject || "O'qituvchi"}</p>
             </div>
          </div>
          <button onClick={logout} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white backdrop-blur">
            <LogOut size={20} />
          </button>
        </div>

        {/* QR Check-in Status Card */}
        <div className="relative z-10">
          {!isCheckedIn ? (
             <motion.button 
               whileTap={{ scale: 0.96 }}
               onClick={handleQRScan}
               className="w-full bg-white text-primary-600 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 shadow-2xl shadow-primary-900/40 relative overflow-hidden group"
             >
               <div className="absolute inset-0 bg-primary-50 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-[2rem]" />
               
               <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center relative shadow-inner z-10">
                 <div className="absolute top-0 w-full h-[3px] bg-primary-500 animate-[scan_2.5s_ease-in-out_infinite]" />
                 <ScanLine size={40} className="text-primary-600" />
               </div>
               <div className="text-center z-10">
                 <h2 className="font-display font-bold text-2xl text-slate-900">Maktabga kirish</h2>
                 <p className="text-slate-500 text-sm mt-1 font-medium">QR kodni skanerlang</p>
               </div>
             </motion.button>
          ) : (
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="w-full bg-emerald-500 text-white rounded-[2rem] p-6 flex flex-col items-center shadow-xl border border-emerald-400 relative overflow-hidden"
             >
                 <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                 <CheckCircle2 size={48} className="mb-2 text-white drop-shadow-md" />
                 <h2 className="font-display font-bold text-2xl">Ajoyib, Maktabdasiz!</h2>
                 <p className="text-emerald-100 text-sm mt-1 flex items-center gap-1.5 font-bold bg-emerald-600/50 px-4 py-1.5 rounded-full">
                   <Clock size={16}/> Kirgan vaqt: {checkInTime}
                 </p>
             </motion.div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-5 -mt-2 relative z-10 pt-6 flex-1 max-w-lg mx-auto w-full space-y-6">
        
        {isCheckedIn ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col mb-3 px-1 ml-1">
              <h2 className="text-lg font-display font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-6 bg-primary-500 rounded-full inline-block"></span>
                Yangi Dars Boshlash
              </h2>
              <p className="text-xs text-emerald-600 mt-1 font-bold flex items-center gap-1 bg-emerald-50 w-max px-2 py-1 rounded-md">
                <Sparkles size={14} className="text-emerald-500"/> AI tizim ma'lumotlarni o'rganmoqda
              </p>
            </div>
            
            <Card hover={false} className="p-6 shadow-xl shadow-slate-200/50 border-none bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 -mt-4 -mr-4 opacity-10">
                <Sparkles size={100} />
              </div>
              <form onSubmit={handleStartLesson} className="flex flex-col gap-5 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Sinf</label>
                    <input 
                      type="text" 
                      value={newClass}
                      onChange={e => setNewClass(e.target.value)}
                      placeholder="9-A" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 placeholder:text-slate-400 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-inner"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Fan</label>
                    <input 
                      type="text" 
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                      placeholder="Matematika" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 placeholder:text-slate-400 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-inner"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full py-4 text-lg shadow-xl shadow-primary-200 gap-3">
                  <CheckCircle2 size={24} />
                  Darsga Kirdim
                </Button>
              </form>
            </Card>
          </motion.div>
        ) : (
          <div className="text-center mt-10 p-6">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-600 text-lg">Darslarni boshlash uchun <br/> avval maktabga kiring</h3>
          </div>
        )}

        {/* Active Lessons List */}
        {activeLessons.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-display font-bold text-slate-800 mb-3 px-1 ml-1 flex items-center gap-2">
              <span className="w-2 h-6 bg-amber-500 rounded-full inline-block"></span>
              Faol Darslar Tarixi
            </h2>
            <AnimatePresence>
              {activeLessons.map((lesson) => (
                 <motion.div 
                    key={lesson._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                 >
                   <Card hover={false} className="p-5 shadow-md border-slate-100 overflow-hidden relative">
                     <button 
                        onClick={() => handleEndLesson(lesson._id)}
                        className="absolute top-4 right-4 p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                        title="Darsni tugatish"
                     >
                        <X size={20} />
                     </button>
                     <div className="flex justify-between items-start mb-5">
                       <div className="flex items-center gap-4 pr-8">
                         <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-700 font-black text-xl shadow-inner uppercase">
                           {(lesson.className || lesson.class || '').replace(/[^0-9]/g, '')}
                           <span className="text-[10px] uppercase font-bold text-indigo-400 -mt-1 leading-none">{(lesson.className || lesson.class || '').replace(/[0-9]/g, '').replace(/[^a-zA-Z]/g, '')}</span>
                         </div>
                         <div>
                           <div className="flex items-center gap-2 mt-2">
                             <p className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 w-max">
                               <CheckCircle2 size={12} /> {new Date(lesson.startTime || lesson.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </p>
                             {/* 10 second timer for testing */}
                             <LessonCountdown 
                                durationSeconds={10} 
                                onEnd={() => handleEndLesson(lesson._id)} 
                             />
                           </div>
                         </div>
                       </div>
                     </div>

                      <div className="pt-0">
                        {!lesson.videoUrl ? (
                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => triggerFileInput(lesson._id, 'image')}
                              className="flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold transition-all text-sm hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 active:scale-95 shadow-sm"
                            >
                              <Camera size={18} className="text-primary-500" />
                              Rasm 
                            </button>
                            <button 
                              onClick={() => triggerFileInput(lesson._id, 'video')}
                              className="flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold transition-all text-sm hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 active:scale-95 shadow-sm"
                            >
                              <Video size={18} className="text-emerald-500" />
                              Video 
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between bg-slate-900 text-white p-3.5 rounded-xl shadow-lg relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent pointer-events-none" />
                            <div className="flex items-center gap-3 relative z-10">
                              {lesson.videoUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                 <div className="w-12 h-12 rounded-lg overflow-hidden relative border-2 border-white/20 shadow-md">
                                   <img src={`http://localhost:5000${lesson.videoUrl}`} alt="Isbot" className="w-full h-full object-cover" />
                                 </div>
                              ) : (
                                 <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center relative overflow-hidden border-2 border-white/20 shadow-md">
                                    <video src={`http://localhost:5000${lesson.videoUrl}`} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                    <Video size={18} className="text-white relative z-10 drop-shadow-md" />
                                 </div>
                              )}
                              <div>
                                 <p className="text-sm font-bold leading-tight">Yuborildi</p>
                                 <p className="text-xs font-semibold text-slate-400 mt-0.5 capitalize">
                                   {lesson.videoUrl.match(/\.(mp4|mov|avi|wmv)$/i) ? 'Video isbot' : 'Rasm isbot'}
                                 </p>
                              </div>
                            </div>
                            <CheckCircle2 size={24} className="text-emerald-400 relative z-10 mr-2" />
                          </div>
                        )}
                      </div>
                   </Card>
                 </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        {/* History Section */}
        {lessonHistory.length > 0 && (
          <div className="space-y-4 pt-6">
            <h2 className="text-lg font-display font-bold text-slate-800 mb-3 px-1 ml-1 flex items-center gap-2">
              <span className="w-2 h-6 bg-slate-300 rounded-full inline-block"></span>
              O'tilgan Darslar Tarixi
            </h2>
            <div className="space-y-3">
              {lessonHistory.map((lesson) => (
                <Card key={lesson._id} hover={false} className="p-4 shadow-sm border-slate-100 bg-white/50 backdrop-blur-sm grayscale-[0.5] opacity-80">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-500 font-bold text-sm uppercase">
                         {(lesson.className || '').replace(/[^0-9]/g, '')}
                         <span className="text-[8px] -mt-1">{(lesson.className || '').replace(/[0-9]/g, '')}</span>
                       </div>
                       <div>
                         <h4 className="font-bold text-slate-900 text-sm">{lesson.subject}</h4>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                           {new Date(lesson.startTime).toLocaleDateString()} • {new Date(lesson.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-black uppercase">Tugagan</span>
                       {lesson.videoUrl && (
                         <div className="mt-1 flex justify-end">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                         </div>
                       )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-10px); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(70px); opacity: 0; }
        }
        #reader canvas { display: none; }
        #reader video { 
          width: 100% !important; 
          border-radius: 1.5rem;
          object-fit: cover;
        }
      `}</style>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowScanner(false)}
               className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 relative z-10 shadow-2xl overflow-hidden"
             >
                                <div className="text-center mb-6">
                   <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600 shadow-inner">
                      <ScanLine size={32} />
                   </div>
                   <h3 className="text-2xl font-display font-black text-slate-900">QR Skaner</h3>
                   <p className="text-slate-500 font-medium text-sm mt-1">Maktabdagi rasmiy QR kodni jonli kamera orqali ko'rsating</p>
                </div>

                <div className="relative group">
                   <div id="reader" className="w-full aspect-square bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl relative border-4 border-white" />
                   
                   {/* Decorative Corners */}
                   <div className="absolute top-[-8px] left-[-8px] w-12 h-12 border-t-4 border-l-4 border-primary-500 rounded-tl-3xl z-20" />
                   <div className="absolute top-[-8px] right-[-8px] w-12 h-12 border-t-4 border-r-4 border-primary-500 rounded-tr-3xl z-20" />
                   <div className="absolute bottom-[-8px] left-[-8px] w-12 h-12 border-b-4 border-l-4 border-primary-500 rounded-bl-3xl z-20" />
                   <div className="absolute bottom-[-8px] right-[-8px] w-12 h-12 border-b-4 border-r-4 border-primary-500 rounded-br-3xl z-20" />
                   
                   {/* Scanning Line Animation */}
                   <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-center items-center overflow-hidden rounded-[2rem]">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent shadow-[0_0_15px_rgba(37,99,235,0.8)] animate-[qr_2s_ease-in-out_infinite]" />
                   </div>
                </div>

                <style>{`
                  @keyframes qr {
                    0% { transform: translateY(-120px); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(120px); opacity: 0; }
                  }
                  #reader__dashboard_section_csr button {
                    background: #2563eb !important;
                    color: white !important;
                    border: none !important;
                    padding: 10px 20px !important;
                    border-radius: 12px !important;
                    font-weight: 800 !important;
                    font-size: 14px !important;
                    margin-top: 20px !important;
                    box-shadow: 0 10px 15px -3px rgba(37,99,235,0.4) !important;
                  }
                  #reader__dashboard_section_csr span {
                    display: none !important;
                  }
                  #reader__status_span {
                    display: none !important;
                  }
                  #reader__header_message {
                    background: transparent !important;
                    border: none !important;
                    color: #64748b !important;
                    font-weight: bold !important;
                    font-size: 12px !important;
                  }
                `}</style>
                
                <Button 
                   variant="ghost" 
                   onClick={() => setShowScanner(false)} 
                   className="w-full mt-8 py-4 font-bold border-slate-100 text-slate-400 hover:text-slate-600"
                >
                   Skanerni to'xtatish
                </Button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
