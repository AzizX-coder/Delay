import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, FileSpreadsheet, Presentation, 
  LayoutDashboard, ChevronRight, Settings2, Sparkles,
  Command, Search, Bell, User
} from "lucide-react";
import { DocsPage } from "../docs/DocsPage";
import { SheetsPage } from "../sheets/SheetsPage";
import { SlidesPage } from "../slides/SlidesPage";

type StudioTab = "dashboard" | "docs" | "sheets" | "slides";

export function StudioPage() {
  const [activeTab, setActiveTab] = useState<StudioTab>("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Studio Hub", icon: LayoutDashboard, color: "text-accent" },
    { id: "docs", label: "Document Editor", icon: FileText, color: "text-blue-500" },
    { id: "sheets", label: "Grid Sheets", icon: FileSpreadsheet, color: "text-emerald-500" },
    { id: "slides", label: "Visual Slides", icon: Presentation, color: "text-orange-500" },
  ];

  return (
    <div className="flex h-full bg-bg-primary overflow-hidden">
      {/* Mini Studio Sidebar */}
      <div className="w-16 md:w-64 h-full border-r border-border/40 bg-bg-secondary/20 flex flex-col transition-all">
        <div className="p-4 md:p-6 mb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center shadow-lg shadow-accent/20">
               <Sparkles size={20} className="text-white" />
             </div>
             <div className="hidden md:block">
               <h2 className="text-[14px] font-black text-text-primary uppercase tracking-tighter">Studio Pro</h2>
               <p className="text-[10px] text-text-tertiary font-bold">Creative Suite</p>
             </div>
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as StudioTab)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer group
                ${activeTab === item.id 
                  ? "bg-accent/10 border border-accent/20 text-accent font-bold shadow-sm shadow-accent/5" 
                  : "text-text-tertiary hover:bg-bg-hover hover:text-text-secondary"}`}
            >
              <item.icon size={18} className={activeTab === item.id ? item.color : "group-hover:text-text-secondary"} />
              <span className="hidden md:block text-[13px]">{item.label}</span>
              {activeTab === item.id && <ChevronRight size={14} className="hidden md:block ml-auto text-accent" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border/10 hidden md:block">
           <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-hover/50 border border-border/20">
             <div className="w-8 h-8 rounded-full bg-bg-active flex items-center justify-center text-text-tertiary">
               <User size={16} />
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-[11px] font-bold text-text-primary truncate">Delay User</p>
               <p className="text-[9px] text-text-tertiary">Pro Plan Active</p>
             </div>
             <Settings2 size={14} className="text-text-tertiary hover:text-text-primary cursor-pointer" />
           </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dash"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-10 h-full overflow-y-auto"
            >
              <header className="mb-12">
                <h1 className="text-[40px] font-black text-text-primary tracking-tight leading-none mb-4">
                  Welcome to <span className="text-accent">Studio Pro</span>
                </h1>
                <p className="text-[16px] text-text-tertiary max-w-2xl">
                  A professional suite of creative tools for high-performance documentaries, 
                  presentations, and data analysis. Everything you need, unified in one space.
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {menuItems.slice(1).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as StudioTab)}
                    className="p-6 rounded-3xl bg-bg-secondary/40 border border-border/40 text-left hover:border-accent/40 hover:bg-accent/5 transition-all group cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-bg-hover flex items-center justify-center mb-6 border border-border/20 group-hover:scale-110 transition-transform ${item.color}`}>
                       <item.icon size={24} />
                    </div>
                    <h3 className="text-[18px] font-bold text-text-primary mb-2">{item.label}</h3>
                    <p className="text-[13px] text-text-tertiary leading-relaxed mb-4">
                      Create, edit and manage your {item.id} with professional grade tools and AI assistance.
                    </p>
                    <div className="flex items-center gap-2 text-accent text-[12px] font-bold">
                      Open Tool <ChevronRight size={14} />
                    </div>
                  </button>
                ))}
              </div>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[20px] font-bold text-text-primary">Recent Creative Work</h2>
                  <button className="text-[12px] font-bold text-accent hover:underline">View All Files</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-[4/3] rounded-2xl bg-bg-secondary/20 border border-border/20 border-dashed flex flex-col items-center justify-center gap-3 group hover:bg-bg-hover/30 transition-all cursor-pointer">
                       <FileText size={24} className="text-text-tertiary/20 group-hover:text-accent/40 transition-colors" />
                       <span className="text-[11px] font-bold text-text-tertiary">Empty Slot</span>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === "docs" && (
            <motion.div key="docs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <DocsPage />
            </motion.div>
          )}

          {activeTab === "sheets" && (
            <motion.div key="sheets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <SheetsPage />
            </motion.div>
          )}

          {activeTab === "slides" && (
            <motion.div key="slides" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <SlidesPage />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
