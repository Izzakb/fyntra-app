"use client";

const MENU_ITEMS = [
  { id: "home", label: "Dashboard", icon: "🏠" },
  { id: "transactions", label: "Transactions", icon: "📑" },
  { id: "goals", label: "Future Goals", icon: "🎯" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (id: string) => void;
}) {
  return (
    <aside className="w-72 bg-white border-r border-slate-100 h-screen sticky top-0 flex flex-col p-8 transition-all">
      {/* LOGO */}
      <div className="mb-12 px-4">
        <h1 className="text-2xl font-black italic tracking-tighter text-slate-900">
          FYNTRA<span className="text-blue-600">.</span>
        </h1>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">
          Faizax Ecosystem
        </p>
      </div>

      {/* NAV LINKS */}
      <nav className="flex-1 space-y-2">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
              activeTab === item.id
                ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* FOOTER SIDEBAR */}
      <div className="pt-8 border-t border-slate-50">
        <div className="bg-slate-50 p-6 rounded-[2rem]">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
            System Status
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-[9px] font-bold text-slate-900 uppercase">
              Secure & Active
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
