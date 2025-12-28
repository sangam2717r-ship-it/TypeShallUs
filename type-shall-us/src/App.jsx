import React, { useState } from 'react';
import { motion } from 'framer-motion'; // Smooth animations
import { Trophy, Keyboard, ScrollText, Users, Award } from 'lucide-react';
import { useEngine } from './hooks/useEngine';

function App() {
  const [view, setView] = useState('english'); // english, nepali, battle, leaderboard
  const { targetText, typed, wpm, handleInput } = useEngine(view === 'battle' ? 'english' : view);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 to-slate-400 font-sans text-slate-800">
      
      {/* --- 1. METALLIC NAVBAR --- */}
      <nav className="sticky top-0 z-50 flex items-center justify-between bg-white/80 px-6 py-4 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500 to-red-700 shadow-lg flex items-center justify-center text-white font-bold text-xl">
            T
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-700">TypeShallUs <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-500">PRO</span></span>
        </div>

        {/* Navigation Pills */}
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-full shadow-inner">
          <NavButton active={view === 'english'} onClick={() => setView('english')} icon={<Keyboard size={16} />} label="English" />
          <NavButton active={view === 'nepali'} onClick={() => setView('nepali')} icon={<ScrollText size={16} />} label="Lok Sewa" />
          <NavButton active={view === 'battle'} onClick={() => setView('battle')} icon={<Trophy size={16} />} label="Battle" />
          <NavButton active={view === 'leaderboard'} onClick={() => setView('leaderboard')} icon={<Users size={16} />} label="Rank" />
        </div>

        <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2">
          <Award size={18} /> Certify
        </button>
      </nav>

      {/* --- 2. MAIN STAGE --- */}
      <main className="max-w-5xl mx-auto mt-12 px-4">
        
        {/* Battle Mode Overlay */}
        {view === 'battle' && <BattleHUD wpm={wpm} />}

        {/* The Glass Typing Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mt-8 overflow-hidden rounded-3xl bg-white/60 p-12 shadow-2xl backdrop-blur-xl border border-white/40"
        >
          {/* Stats Header */}
          <div className="flex justify-between border-b border-slate-300/50 pb-8 mb-8">
            <StatBox label="SPEED" value={wpm} unit="WPM" />
            <StatBox label="ACCURACY" value={100} unit="%" />
            <StatBox label="NEXT FINGER" value="Index" highlight />
          </div>

          {/* Typing Area */}
          <div className="relative min-h-[120px] text-3xl leading-relaxed font-medium text-slate-400" style={{ fontFamily: view === 'nepali' ? 'Mukta' : 'Inter' }}>
            {/* Render Characters */}
            {targetText.split('').map((char, i) => {
              let color = 'text-slate-300';
              if (i < typed.length) {
                color = typed[i] === char ? 'text-slate-800' : 'text-red-500 bg-red-100 rounded';
              }
              const isCurrent = i === typed.length;
              return (
                <span key={i} className={`${color} ${isCurrent ? 'border-b-4 border-blue-500 text-blue-600 animate-pulse' : ''}`}>
                  {char}
                </span>
              );
            })}

            {/* THE MAGIC INPUT: Invisible but active */}
            <input 
              autoFocus
              className="absolute inset-0 h-full w-full opacity-0 cursor-default"
              value={typed}
              onChange={handleInput}
            />
          </div>

          {/* Virtual Keyboard (Visual Only) */}
          <div className="mt-12 flex justify-center opacity-50 hover:opacity-100 transition-opacity">
            <div className="grid gap-2">
              <div className="flex gap-2 justify-center"><Key>Q</Key><Key>W</Key><Key>E</Key><Key>R</Key><Key>T</Key><Key>Y</Key><Key>U</Key><Key>I</Key><Key>O</Key><Key>P</Key></div>
              <div className="flex gap-2 justify-center"><Key>A</Key><Key>S</Key><Key>D</Key><Key>F</Key><Key>G</Key><Key>H</Key><Key>J</Key><Key>K</Key><Key>L</Key></div>
              <div className="flex gap-2 justify-center"><Key>Z</Key><Key>X</Key><Key>C</Key><Key>V</Key><Key>B</Key><Key>N</Key><Key>M</Key></div>
            </div>
          </div>

        </motion.div>

        {/* Ad Space */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-slate-200/50 px-4 py-2 rounded text-xs font-bold text-slate-400 tracking-widest uppercase">
            Sponsored by New Chitwan Driving Center
          </div>
        </div>

      </main>
    </div>
  );
}

// --- SUB COMPONENTS (Modular & Clean) ---

const NavButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
      active 
        ? 'bg-white text-slate-800 shadow-md ring-1 ring-black/5' 
        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
    }`}
  >
    {icon} {label}
  </button>
);

const StatBox = ({ label, value, unit, highlight }) => (
  <div className="text-center">
    <div className="text-xs font-bold tracking-widest text-slate-400 mb-1">{label}</div>
    <div className={`text-4xl font-black ${highlight ? 'text-blue-500' : 'text-slate-700'}`}>
      {value}<span className="text-lg text-slate-400 ml-1 font-bold">{unit}</span>
    </div>
  </div>
);

const Key = ({ children }) => (
  <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-white border-b-4 border-slate-200 shadow-sm text-slate-400 font-bold text-sm">
    {children}
  </div>
);

const BattleHUD = ({ wpm }) => (
  <motion.div 
    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
    className="mb-6 grid grid-cols-1 gap-4"
  >
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <div className="flex justify-between text-xs font-bold text-slate-400 mb-2"><span>YOU</span><span>{wpm} WPM</span></div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
          animate={{ width: `${Math.min(wpm, 100)}%` }}
        />
      </div>
    </div>
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 opacity-70">
      <div className="flex justify-between text-xs font-bold text-slate-400 mb-2"><span>OPPONENT (GHOST)</span><span>45 WPM</span></div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-red-400"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 20, ease: "linear" }}
        />
      </div>
    </div>
  </motion.div>
);

export default App;