import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, CheckCircle, BarChart3, Scan, Video, 
  Bell, LayoutDashboard, Users, Calendar, ShieldCheck 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">E</div>
              <span className="text-2xl font-display font-bold text-slate-900">EduPuls</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Xususiyatlar</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Qanday ishlaydi?</a>
              <Link to="/admin">
                <Button variant="ghost">Kirish</Button>
              </Link>
              <Link to="/admin">
                <Button>Demo ko‘rish</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-primary-100 rounded-full blur-3xl -z-10" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-10 left-[-5%] w-[400px] h-[400px] bg-emerald-50 rounded-full blur-3xl -z-10" 
        />

        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Yangi avlod maktab boshqaruvi
            </div>
            <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-slate-900 mb-6 leading-tight">
              Har bir dars <span className="text-primary-600">nazoratda.</span><br />
              Har bir ustoz <span className="text-emerald-500">statistikada.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
              EduPuls platformasi orqali maktabingizdagi o‘quv jarayonini to‘liq nazoratga oling. 
              Davomat, QR-kirish, dars monitoringi va video-hisobotlar bir joyda.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/admin">
                <Button size="lg" className="w-full sm:w-auto gap-3">
                  Admin panelga kirish <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/teacher">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Ustoz bo‘limi
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Dashboard Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-20 relative mx-auto max-w-5xl"
          >
            <div className="p-2 bg-gradient-to-tr from-primary-200 to-emerald-200 rounded-[2.5rem] shadow-2xl">
              <div className="bg-slate-900 rounded-[2rem] overflow-hidden aspect-[16/10] flex items-center justify-center text-white/20 border-8 border-slate-900">
                <LayoutDashboard className="w-24 h-24 opacity-10" />
                <div className="absolute inset-x-8 bottom-8 flex flex-col gap-4">
                  <div className="h-4 w-32 bg-white/10 rounded-full animate-pulse" />
                  <div className="h-4 w-48 bg-white/10 rounded-full animate-pulse delay-75" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-slate-900 mb-4">Platforma Imkoniyatlari</h2>
            <div className="w-20 h-1.5 bg-primary-500 mx-auto rounded-full"></div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { icon: <Scan className="w-8 h-8 text-primary-600" />, title: "QR Check-in", desc: "Ustozlar kelgan vaqtini QR-kod orqali tasdiqlashadi. Kechikishlar avtomatik yoziladi." },
              { icon: <Video className="w-8 h-8 text-emerald-500" />, title: "Video Isbotlar", desc: "Har bir darsdan 1-2 daqiqalik video isbot yuklanadi va admin tomonidan tekshiriladi." },
              { icon: <BarChart3 className="w-8 h-8 text-amber-500" />, title: "KPI Analitika", desc: "Ustozlarning faolligi, davomati va dars sifati bo‘yicha shaxsiy KPI reytingi." },
              { icon: <ShieldCheck className="w-8 h-8 text-indigo-500" />, title: "Real-vaqt Monitoringi", desc: "Qaysi dars boshlandi, qaysi biri kechikyapti – barchasi onlayn ko‘rinib turadi." },
              { icon: <Users className="w-8 h-8 text-rose-500" />, title: "Ustozlar Boshqaruvi", desc: "Profil yaratish, fanlarni biriktirish va dars soatlarini taqsimlash uchun qulay interfeys." },
              { icon: <Bell className="w-8 h-8 text-cyan-500" />, title: "Aqlli Bildirishnomalar", desc: "Dars boshlanmaganida yoki video yuklanmaganida mas'ullarga xabar yuboriladi." }
            ].map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="h-full border-none shadow-sm hover:shadow-xl group transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Admin Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-4xl font-display font-bold text-slate-900 mb-6">Administratorlar uchun to‘liq quvvat</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">Haftalik va oylik hisobotlar</h4>
                  <p className="text-slate-600">Maktabdagi umumiy o‘quv jarayoni statistikasi avtomatik shakllanadi.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">Video tekshirish tizimi</h4>
                  <p className="text-slate-600">Dars sifatini masofadan turib 1-2 daqiqalik videolar orqali tasdiqlash.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900">Aqlli dars jadvali</h4>
                  <p className="text-slate-600">Xonalarni va dars soatlarini konfliktlarsiz rejalashtirish imkoniyati.</p>
                </div>
              </div>
            </div>
            <Link to="/admin" className="inline-block mt-10">
              <Button size="lg">Panelni o‘rganish</Button>
            </Link>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="absolute -inset-4 bg-primary-100 rounded-[2.5rem] blur-2xl opacity-50"></div>
            <Card className="relative z-10 p-0 overflow-hidden border-4 border-white shadow-2xl">
              <div className="bg-slate-50 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-6 w-32 bg-slate-200 rounded-full" />
                  <div className="h-6 w-8 bg-slate-200 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="h-2 w-16 bg-emerald-100 rounded-full mb-2" />
                    <div className="h-6 w-10 bg-emerald-500 rounded-lg" />
                  </div>
                  <div className="h-32 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="h-2 w-16 bg-rose-100 rounded-full mb-2" />
                    <div className="h-6 w-10 bg-rose-500 rounded-lg" />
                  </div>
                </div>
                <div className="h-48 bg-white rounded-2xl border border-slate-100 shadow-sm" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-primary-600 relative overflow-hidden">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -top-64 -right-64 w-[500px] h-[500px] border-[50px] border-white/5 rounded-full" 
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-8">
            Maktabingizni raqamli kelajakka olib chiqing
          </h2>
          <p className="text-primary-100 text-xl mb-12">
            EduPuls bilan har bir dars sifatli va har bir ustoz motivatsiyali bo‘ladi. 
            Bugunoq demo versiyani sinab ko‘ring.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" size="lg">Bog‘lanish</Button>
            <Link to="/admin">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-slate-100">Hoziroq boshlash</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 text-slate-400 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
            <span className="text-xl font-bold text-white">EduPuls</span>
          </div>
          <p>&copy; 2026 EduPuls. Barcha huquqlar himoyalangan.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Telegram</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
