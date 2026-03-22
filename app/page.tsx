import Link from "next/link";

export default function FyntraLanding() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      {/* 1. Header Navigation - Ganti bagian nav kamu dengan ini */}
      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100 z-50">
        {/* max-w-7xl ini kuncinya, supaya konten nggak nempel ke pinggir layar */}
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">
              F
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">
              Fyntra
            </span>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
              <a href="#features" className="hover:text-blue-600 transition">
                Fitur
              </a>
              <a href="#pricing" className="hover:text-blue-600 transition">
                Harga
              </a>
            </div>
            {/* Tombol Mulai Sekarang jadi ukuran manusiawi */}
            <Link href="/register" className="bg-blue-600 text-white ...">
              Mulai Sekarang
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-black tracking-[0.2em] text-blue-600 bg-blue-50 rounded-md uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Next Gen Wealth Management
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.95] mb-8">
            Manage your wealth <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              without the stress.
            </span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium">
            Fyntra helps you track every penny, optimize your investments, and
            reach your financial goals with AI-driven insights.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-2xl shadow-blue-200">
              Start for Free
            </button>
            <button className="px-10 py-5 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-bold text-lg hover:border-blue-200 transition">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                📊
              </div>
              <h3 className="text-2xl font-black mb-4">Smart Tracking</h3>
              <p className="text-slate-500 leading-relaxed">
                Automatic categorization of your expenses using advanced machine
                learning.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                🛡️
              </div>
              <h3 className="text-2xl font-black mb-4">Bank-Grade Security</h3>
              <p className="text-slate-500 leading-relaxed">
                Your data is encrypted with AES-256 bit encryption. Your privacy
                is our priority.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                🚀
              </div>
              <h3 className="text-2xl font-black mb-4">Future Projections</h3>
              <p className="text-slate-500 leading-relaxed">
                See where your money will be in 5 years based on your current
                spending habits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Simple Footer */}
      <footer className="py-20 border-t border-slate-100 text-center">
        <div className="flex items-center justify-center gap-2 mb-8 opacity-50">
          <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-[10px] text-white font-black">
            F
          </div>
          <span className="text-sm font-black tracking-tighter uppercase">
            Fyntra
          </span>
        </div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
          A Product of Faizax Ecosystem • © 2026
        </p>
      </footer>
    </div>
  );
}
