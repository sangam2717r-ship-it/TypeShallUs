import React, { useState, useEffect, useRef } from "react";
import { Terminal, Trophy, Zap, Clock, Settings, User, RotateCcw, Save, Moon, Sun, Monitor, Link as LinkIcon } from "lucide-react";
import { supabase } from "./supabaseClient";
import { textData, fingerMap, preetiMap } from "./textData";
import VirtualKeyboard from "./VirtualKeyboard";

function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem(key)) || defaultValue; } catch { return defaultValue; }
  });
  useEffect(() => { window.localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}

export default function App() {
  const [theme, setTheme] = useStickyState("cyberpunk", "ts_theme");
  const [playerName, setPlayerName] = useStickyState("Player 1", "ts_player_name");
  
  // 'short', 'medium', 'long', 'nepali_preeti'
  const [gameMode, setGameMode] = useState("short"); 
  const [text, setText] = useState(textData["short"][0]);
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const [scores, setScores] = useState([]);
  const [view, setView] = useState("game");
  
  const inputRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "cyberpunk") {
      root.style.setProperty("--bg-color", "#020617");
      root.style.setProperty("--text-color", "#22c55e");
      root.style.setProperty("--accent-color", "#d946ef");
      root.style.setProperty("--key-bg", "#1e293b");
      root.style.setProperty("--key-border", "#334155");
    } else if (theme === "dark") {
      root.style.setProperty("--bg-color", "#121212");
      root.style.setProperty("--text-color", "#e0e0e0");
      root.style.setProperty("--accent-color", "#60a5fa");
      root.style.setProperty("--key-bg", "#27272a");
      root.style.setProperty("--key-border", "#52525b");
    } else {
      root.style.setProperty("--bg-color", "#f8fafc");
      root.style.setProperty("--text-color", "#0f172a");
      root.style.setProperty("--accent-color", "#f97316");
      root.style.setProperty("--key-bg", "#ffffff");
      root.style.setProperty("--key-border", "#cbd5e1");
    }
  }, [theme]);

  useEffect(() => {
    if (view === "leaderboard") fetchScores();
  }, [view]);

  const fetchScores = async () => {
    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .order('wpm', { ascending: false })
      .limit(20);
    if (!error) setScores(data || []);
  };

  const handleInput = (e) => {
    const val = e.target.value;
    if (!startTime) setStartTime(Date.now());
    setInput(val);

    const correctChars = val.split("").filter((char, i) => char === text[i]).length;
    setAccuracy(val.length > 0 ? Math.round((correctChars / val.length) * 100) : 100);
    
    const timeElapsedMin = (Date.now() - startTime) / 60000;
    if (timeElapsedMin > 0) setWpm(Math.round((val.length / 5) / timeElapsedMin));

    if (val === text) finishGame();
  };

  const finishGame = async () => {
    setIsFinished(true);
    if (wpm > 5) await supabase.from('student_progress').insert([{ name: playerName, wpm, accuracy }]);
  };

  const resetGame = (newMode = gameMode) => {
    setGameMode(newMode);
    const pool = textData[newMode] || textData["short"];
    setText(pool[Math.floor(Math.random() * pool.length)]);
    setInput("");
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setIsFinished(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Keyboard Logic for Preeti vs English
  const nextChar = text[input.length] || "";
  const isPreetiMode = gameMode === 'nepali_preeti';
  // If preeti mode, find the English key that produces the Nepali char
  const requiredKey = isPreetiMode ? preetiMap[nextChar] || nextChar : nextChar;
  const fingerHint = fingerMap[requiredKey.toLowerCase()] || "";

  const getCharClass = (char, index) => {
    if (index >= input.length) return "opacity-50"; 
    return char === input[index] ? "text-[var(--accent-color)]" : "text-red-500 bg-red-500/20";
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      
      {/* HEADER */}
      <header className="h-20 border-b border-[var(--key-border)] px-8 flex justify-between items-center shrink-0 shadow-lg relative z-50">
        
        {/* LOGO & LINK AREA */}
        <div className="flex items-center gap-4">
            <div className="bg-[var(--key-bg)] p-2 rounded-lg border border-[var(--key-border)]">
                 <Terminal className="w-8 h-8" style={{ color: 'var(--accent-color)' }} />
            </div>
            <div>
                <h1 className="text-2xl font-black tracking-widest leading-none">TypeShallUs</h1>
                <a href="https://sangam2717r-ship-it.github.io" target="_blank" className="text-xs opacity-60 hover:opacity-100 flex items-center gap-1 mt-1 transition-opacity">
                    <LinkIcon className="w-3 h-3" /> sangam.dev
                </a>
            </div>
        </div>

        {/* Identity & Nav */}
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 border border-[var(--key-border)] rounded-full px-4 py-2 bg-[var(--key-bg)]">
                <User className="w-4 h-4 opacity-50" />
                <input 
                className="bg-transparent outline-none w-32 text-sm font-bold text-center" 
                value={playerName} 
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="YOUR NAME"
                />
            </div>
            
            <div className="flex gap-2">
                <button onClick={() => setView("game")} className={`px-4 py-2 rounded font-bold ${view === 'game' ? 'bg-[var(--accent-color)] text-black' : 'hover:bg-[var(--key-bg)]'}`}>PLAY</button>
                <button onClick={() => setView("leaderboard")} className={`px-4 py-2 rounded font-bold ${view === 'leaderboard' ? 'bg-[var(--accent-color)] text-black' : 'hover:bg-[var(--key-bg)]'}`}>RANKINGS</button>
                <button onClick={() => setView("settings")} className={`p-2 rounded hover:bg-[var(--key-bg)]`}><Settings className="w-5 h-5"/></button>
            </div>
        </div>
      </header>

      {/* MAIN GAME AREA */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 gap-6 overflow-hidden relative">
        
        {view === "game" && (
          <>
            {/* LENGTH SELECTORS */}
            <div className="flex gap-2 mb-4">
                {['short', 'medium', 'long'].map(m => (
                    <button 
                        key={m}
                        onClick={() => resetGame(m)}
                        className={`px-6 py-2 text-sm font-bold uppercase rounded-full border transition-all
                        ${gameMode === m ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-color)]/10' : 'border-[var(--key-border)] opacity-50 hover:opacity-100'}`}
                    >
                        {m}
                    </button>
                ))}
                 <button 
                        onClick={() => resetGame('nepali_preeti')}
                        className={`px-6 py-2 text-sm font-bold uppercase rounded-full border transition-all
                        ${gameMode === 'nepali_preeti' ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-color)]/10' : 'border-[var(--key-border)] opacity-50 hover:opacity-100'}`}
                    >
                        Nepali (Preeti)
                    </button>
            </div>

            {/* TEXT BOX */}
            <div className="relative w-full max-w-6xl h-48 md:h-64 border-2 border-[var(--key-border)] rounded-2xl bg-[var(--key-bg)] p-8 md:p-12 text-3xl leading-relaxed overflow-hidden cursor-text shadow-inner flex items-center" onClick={() => inputRef.current?.focus()}>
                {isFinished ? (
                     <div className="w-full text-center animate-fade-in">
                        <h2 className="text-4xl font-bold mb-2">Run Complete</h2>
                        <div className="text-2xl opacity-70 mb-6">{wpm} WPM / {accuracy}% Accuracy</div>
                        <button onClick={() => resetGame()} className="px-8 py-3 rounded font-bold text-black" style={{ backgroundColor: 'var(--accent-color)' }}>AGAIN</button>
                     </div>
                ) : (
                    <div className="break-words w-full">
                    {text.split("").map((char, i) => (
                        <span key={i} className={getCharClass(char, i)}>{char}</span>
                    ))}
                    <span className="inline-block w-[3px] h-8 align-middle bg-[var(--accent-color)] animate-pulse ml-1"></span>
                    </div>
                )}
                <input ref={inputRef} type="text" value={input} onChange={handleInput} className="absolute opacity-0 top-0 left-0 h-full w-full" autoFocus />
            </div>

            {/* KEYBOARD */}
            {!isFinished && (
              <div className="w-full mt-4 transform scale-90 md:scale-100 origin-top">
                 <VirtualKeyboard activeChar={requiredKey} finger={fingerHint} isPreeti={isPreetiMode} preetiKey={requiredKey} />
              </div>
            )}
          </>
        )}

        {view === "leaderboard" && (
          <div className="w-full max-w-4xl h-full overflow-auto no-scrollbar p-4">
            <h2 className="text-3xl font-bold mb-6 border-b border-[var(--key-border)] pb-4">Top Operatives</h2>
            <table className="w-full text-left border-collapse">
              <thead className="bg-[var(--key-bg)] text-xs uppercase sticky top-0">
                <tr><th className="p-4">Name</th><th className="p-4">WPM</th><th className="p-4">Date</th></tr>
              </thead>
              <tbody>
                {scores.map((s, i) => (
                  <tr key={i} className="border-b border-[var(--key-border)] hover:bg-[var(--key-bg)]">
                    <td className="p-4 font-bold" style={{ color: i < 3 ? 'var(--accent-color)' : 'inherit' }}>{s.name || "Anonymous"}</td>
                    <td className="p-4">{s.wpm}</td>
                    <td className="p-4 opacity-50 text-sm">{new Date(s.created_at || Date.now()).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === "settings" && (
          <div className="w-full max-w-lg bg-[var(--key-bg)] p-8 rounded-xl border border-[var(--key-border)] shadow-2xl z-20">
            <h2 className="text-2xl font-bold mb-6 flex gap-2 items-center"><Settings /> Visual System</h2>
            
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => setTheme("cyberpunk")} className={`p-4 border rounded flex items-center gap-3 ${theme==='cyberpunk' ? 'border-[var(--accent-color)]' : 'border-[var(--key-border)]'}`}>
                <Terminal className="text-green-500" /> Cyberpunk (Hacker)
              </button>
              <button onClick={() => setTheme("dark")} className={`p-4 border rounded flex items-center gap-3 ${theme==='dark' ? 'border-[var(--accent-color)]' : 'border-[var(--key-border)]'}`}>
                <Moon className="text-blue-500" /> Standard Dark (Clean)
              </button>
              <button onClick={() => setTheme("light")} className={`p-4 border rounded flex items-center gap-3 ${theme==='light' ? 'border-[var(--accent-color)]' : 'border-[var(--key-border)]'}`}>
                <Sun className="text-orange-500" /> Light Mode (Day)
              </button>
            </div>
            <button onClick={() => setView("game")} className="mt-8 w-full py-3 font-bold rounded bg-[var(--accent-color)] text-black">Close Config</button>
          </div>
        )}

      </main>

      {/* FOOTER - AD SPACE */}
      <footer className="h-16 border-t border-[var(--key-border)] flex items-center justify-center text-xs uppercase opacity-40 shrink-0 tracking-widest">
        [ AD_SPACE_RESERVED_FOR_MONETIZATION ]
      </footer>
    </div>
  );
}