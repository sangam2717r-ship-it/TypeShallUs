import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { jsPDF } from "jspdf";
import { Keyboard, ScrollText, Users, RefreshCcw, Download, User, Loader2, AlertCircle } from 'lucide-react';

// --- 1. CONFIGURATION ---

// SUPABASE CONFIG
const supabaseUrl = 'https://ihkwbtlwmqxesuutphob.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imloa3didGx3bXF4ZXN1dXRwaG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4ODEyMjcsImV4cCI6MjA4MjQ1NzIyN30.D5d0_23LSuw7Zgle5eP8iRGqWRRS30JOm9bySkX9ieU';
const supabase = createClient(supabaseUrl, supabaseKey);

const CONSTANTS = {
  TIME_LIMIT_MS: 60000, 
  SCROLL_THROTTLE_MS: 50,
  WPM_FACTOR: 5,
  VIEWS: { ENGLISH: 'english', NEPALI: 'nepali', LEADERBOARD: 'leaderboard' },
  STATUS: { IDLE: 'idle', RUNNING: 'running', FINISHED: 'finished' },
  KEYS: { SPACE: 'SPACE' },
  STYLES: {
    KEY_BASE: "flex items-center justify-center rounded-lg border-b-4 text-xs font-bold transition-all select-none",
    KEY_ACTIVE: "bg-blue-500 border-blue-700 text-white -translate-y-1 shadow-lg shadow-blue-500/30",
    KEY_PRESSED: "bg-slate-800 border-slate-900 text-white scale-95",
    KEY_INACTIVE: "bg-white border-slate-200 text-slate-600 shadow-sm",
  }
};

const PDF_TEXTS = {
  TITLE: "CERTIFICATE OF MASTERY",
  SUBTITLE: "This is to certify that",
  BODY_PREFIX: "Has passed the",
  BODY_SUFFIX: "Typing Test",
  FOOTER: "Powered by New Chitwan Driving Center"
};

// --- GLOBAL STYLES (PREETI FONT) ---
const GlobalStyles = () => (
  <style>{`
    @font-face {
      font-family: 'Preeti';
      src: url('/PREETI.TTF') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    /* Preeti needs a larger size to match English legibility */
    .font-preeti { 
        font-family: 'Preeti', sans-serif; 
        font-size: 2.2rem; 
        line-height: 1.6; 
    }
    .font-sans { font-family: 'Inter', sans-serif; }
    .no-select { -webkit-user-select: none; user-select: none; }
  `}</style>
);

// --- VISUAL MAPPING (Keycaps Only) ---
const PREETI_KEYCAP_MAP = {
  '`': 'ञ', '~': 'ञ्', '1': '१', '!': 'ज्ञ', '2': '२', '@': 'ई', '3': '३', '#': 'घ',
  '4': '४', '$': 'द्ध', '5': '५', '%': 'छ', '6': '६', '^': 'ट', '7': '७', '&': 'ठ',
  '8': '८', '*': 'ड', '9': '९', '(': 'ढ', '0': '०', ')': 'ण', '-': '(', '_': ')',
  '=': '.', '+': 'ं', 'q': 'त्र', 'Q': 'त्त', 'w': 'ध', 'W': 'द्ध', 'e': 'भ', 'E': 'ै',
  'r': 'च', 'R': 'च्', 't': 'त', 'T': 'त्', 'y': 'थ', 'Y': 'थ्', 'u': 'ग', 'U': 'ग्',
  'i': 'ष', 'I': 'क्ष', 'o': 'य', 'O': 'इ', 'p': 'उ', 'P': 'ए', '[': 'ऋ', '{': 'र्',
  ']': 'े', '}': 'ँ', '\\': '?', '|': '?', 'a': 'ब', 'A': 'ब्', 's': 'क', 'S': 'क्',
  'd': 'म', 'D': 'म्', 'f': 'ा', 'F': 'ँ', 'g': 'न', 'G': 'न्', 'h': 'ज', 'H': 'ज्',
  'j': 'व', 'J': 'व्', 'k': 'प', 'K': 'प्', 'l': 'ि', 'L': 'ी', ';': 'स', ':': 'स्',
  "'": 'ु', '"': 'ू', 'z': 'श', 'Z': 'श्', 'x': 'ह', 'X': 'ह्', 'c': 'अ', 'C': 'आ',
  'v': 'ख', 'V': 'ख्', 'b': 'द', 'B': 'द्', 'n': 'ल', 'N': 'ल्', 'm': "'", 'M': 'ः',
  ',': ',', '<': '?', '.': '।', '>': 'श्र', '/': 'र', '?': 'रु', 'SPACE': ' '
};

const SHIFT_SYMBOL_MAP = {
  '~': '`', '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0', '_': '-', '+': '=',
  '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/'
};

// --- DATA: PERFECTED PREETI ASCII ---
const NEPALI_LESSONS = [
  { 
    id: 1, 
    label: "Constitution", 
    // Visual: नेपालको संविधान २०७२ ले नेपाललाई सङ्घीय लोकतान्त्रिक गणतन्त्र घोषणा गरेको छ ।
    keystrokes: [
        // ne-pa-la-ko (नेपालको) -> g ] k f n s f ]
        "g", "]", "k", "f", "n", "s", "f", "]", CONSTANTS.KEYS.SPACE, 
        
        // sam-vi-dha-na (संविधान) -> ; + l j w f g  (Note: l=i-kaar comes BEFORE j=wa)
        ";", "+", "l", "j", "w", "f", "g", CONSTANTS.KEYS.SPACE, 
        
        // 2072
        "2", "0", "7", "2", CONSTANTS.KEYS.SPACE, 
        
        // le (ले) -> n ]
        "n", "]", CONSTANTS.KEYS.SPACE, 
        
        // ne-pa-la-lai (नेपाललाई) -> g ] k f n n f O
        "g", "]", "k", "f", "n", "n", "f", "O", CONSTANTS.KEYS.SPACE, 
        
        // san-ghi-ya (सङ्घीय) -> ; + # L o
        ";", "+", "#", "L", "o", CONSTANTS.KEYS.SPACE, 
        
        // lo-ka-ta-ntri-ka (लोकतान्त्रिक) -> n f ] s t f G l q s (Note: l=i-kaar before q=tra)
        "n", "f", "]", "s", "t", "f", "G", "l", "q", "s", CONSTANTS.KEYS.SPACE, 
        
        // ga-na-ta-ntra (गणतन्त्र) -> u ( t G q
        "u", "(", "t", "G", "q", CONSTANTS.KEYS.SPACE, 
        
        // gho-sha-na (घोषणा) -> # f ] i ( f
        "#", "f", "]", "i", "(", "f", CONSTANTS.KEYS.SPACE, 
        
        // ga-re-ko (गरेको) -> u / ] s f ]
        "u", "/", "]", "s", "f", "]", CONSTANTS.KEYS.SPACE, 
        
        // chha (छ) -> % (Shift+5)
        "%", CONSTANTS.KEYS.SPACE, "."
    ] 
  }
];

const ENGLISH_TEXTS = [
  "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet and is often used to test typewriters and computer keyboards. Mastery of typing requires muscle memory and consistent practice."
];

// --- MAIN COMPONENT ---

export default function App() {
  const [view, setView] = useState(CONSTANTS.VIEWS.ENGLISH);
  const [targetKeys, setTargetKeys] = useState([]); 
  const [typedHistory, setTypedHistory] = useState([]); 
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [status, setStatus] = useState(CONSTANTS.STATUS.IDLE); 
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [pressedKey, setPressedKey] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [saveStatus, setSaveStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);

  const scrollContainerRef = useRef(null);
  const startTimeRef = useRef(null);
  const hiddenInputRef = useRef(null);
  const completionRef = useRef(null);

  // --- SECURITY LOCKS ---
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('copy', preventDefault);
    document.addEventListener('cut', preventDefault);
    document.addEventListener('paste', preventDefault);
    return () => {
        document.removeEventListener('contextmenu', preventDefault);
        document.removeEventListener('copy', preventDefault);
        document.removeEventListener('cut', preventDefault);
        document.removeEventListener('paste', preventDefault);
    };
  }, []);

  // --- DERIVED HINTS ---
  const { activeKeyHint, activePhysicalKey } = useMemo(() => {
    if (status === CONSTANTS.STATUS.FINISHED || !targetKeys[currentIndex]) {
      return { activeKeyHint: '', activePhysicalKey: '' };
    }
    const nextKey = targetKeys[currentIndex];
    
    if (nextKey === CONSTANTS.KEYS.SPACE) return { activeKeyHint: 'SPACE', activePhysicalKey: 'SPACE' };

    if (SHIFT_SYMBOL_MAP[nextKey]) {
        return { 
            activeKeyHint: `SHIFT + ${SHIFT_SYMBOL_MAP[nextKey]}`, 
            activePhysicalKey: SHIFT_SYMBOL_MAP[nextKey].toUpperCase() 
        };
    }
    const isUpper = nextKey.length === 1 && nextKey !== nextKey.toLowerCase() && !'0123456789'.includes(nextKey);
    return { 
      activeKeyHint: isUpper ? `SHIFT + ${nextKey}` : nextKey.toUpperCase(),
      activePhysicalKey: nextKey.toUpperCase()
    };
  }, [currentIndex, targetKeys, status]);

  // --- INIT ---
  const resetEngine = useCallback(() => {
    setStatus(CONSTANTS.STATUS.IDLE);
    setTypedHistory([]);
    setCurrentIndex(0);
    startTimeRef.current = null;
    setWpm(0);
    setAccuracy(100);
    setSaveStatus('idle');
    setErrorMessage(null);
    setPlayerName("");
    setPressedKey(null);

    setTimeout(() => hiddenInputRef.current?.focus(), 50);

    if (view === CONSTANTS.VIEWS.NEPALI) {
      setTargetKeys(NEPALI_LESSONS[0].keystrokes);
    } else if (view === CONSTANTS.VIEWS.ENGLISH) {
      const text = ENGLISH_TEXTS[Math.floor(Math.random() * ENGLISH_TEXTS.length)];
      setTargetKeys(text.split('').map(c => c === ' ' ? CONSTANTS.KEYS.SPACE : c));
    } else {
      setTargetKeys([]);
    }
  }, [view]);

  useEffect(() => { resetEngine(); }, [resetEngine]);

  // --- SCROLL ---
  useEffect(() => {
    if (status === CONSTANTS.STATUS.RUNNING && currentIndex > 0) {
      const activeSpan = scrollContainerRef.current?.querySelector('.active-char');
      if (activeSpan) activeSpan.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentIndex, status]);

  // --- KEY HANDLER ---
  const handleKeyDown = useCallback((e) => {
    // FIX: Allow typing in name input
    if (e.target.tagName === 'INPUT' && e.target.id === 'name-input') return;
    // FIX: Block browser shortcuts/black box
    if (e.target === hiddenInputRef.current || e.key === " ") e.preventDefault();

    if (status === CONSTANTS.STATUS.FINISHED || view === CONSTANTS.VIEWS.LEADERBOARD) return;
    
    const IGNORED = ["Shift", "Control", "Alt", "CapsLock", "Tab", "Meta", "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    if (IGNORED.includes(e.key)) return;

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
      setStatus(CONSTANTS.STATUS.RUNNING);
    }

    const inputKey = e.key === " " ? CONSTANTS.KEYS.SPACE : e.key;
    setPressedKey(inputKey === CONSTANTS.KEYS.SPACE ? CONSTANTS.KEYS.SPACE : inputKey.toUpperCase());
    setTimeout(() => setPressedKey(null), 150);

    const requiredKey = targetKeys[currentIndex];
    if (!requiredKey) return;

    const isCorrect = inputKey === requiredKey;
    const nextHistory = [...typedHistory, isCorrect];
    setTypedHistory(nextHistory);

    if (isCorrect) setCurrentIndex(prev => prev + 1);

    const totalTyped = nextHistory.length;
    const errors = nextHistory.filter(c => !c).length;
    setAccuracy(totalTyped > 0 ? Math.max(0, Math.round(((totalTyped - errors) / totalTyped) * 100)) : 100);

    const timeMin = (Date.now() - startTimeRef.current) / 60000;
    if (timeMin > 0.001) {
        const rate = view === CONSTANTS.VIEWS.NEPALI 
            ? Math.round((currentIndex + (isCorrect ? 1 : 0)) / timeMin)
            : Math.round(((currentIndex + (isCorrect ? 1 : 0)) / 5) / timeMin);
        setWpm(rate);
    }

    if (isCorrect && currentIndex + 1 >= targetKeys.length) {
        setStatus(CONSTANTS.STATUS.FINISHED);
        setTimeout(() => completionRef.current?.focus(), 100);
    }
  }, [currentIndex, targetKeys, typedHistory, status, view]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const saveScore = async () => {
    if(!playerName.trim() || playerName.length < 3) return setErrorMessage("Name must be 3+ chars");
    setSaveStatus('saving');
    const { error } = await supabase.from('student_progress').insert([{ id: crypto.randomUUID(), name: playerName, wpm, accuracy }]);
    if (error) { setErrorMessage("Save failed"); setSaveStatus('error'); } 
    else { setSaveStatus('success'); }
  };

  const generatePDF = () => {
    if(!playerName.trim()) return setErrorMessage("Enter name first");
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFont("helvetica", "bold"); doc.setFontSize(40); doc.text(PDF_TEXTS.TITLE, 148.5, 50, { align: "center" });
    doc.setFontSize(16); doc.setFont("helvetica", "normal"); doc.text(`${PDF_TEXTS.SUBTITLE} ${playerName}`, 148.5, 70, { align: "center" });
    doc.text(`Passed the ${view} test with ${wpm} ${view === 'nepali' ? 'KPM' : 'WPM'}`, 148.5, 90, { align: "center" });
    doc.setFontSize(10); doc.text(PDF_TEXTS.FOOTER, 148.5, 180, { align: "center" });
    doc.save(`${playerName}_Certificate.pdf`);
  };

  const handleContainerClick = (e) => {
    if (e.target.closest('input, button')) return;
    hiddenInputRef.current?.focus();
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-200 to-slate-400 font-sans text-slate-800 flex flex-col items-center py-2 no-select" onClick={handleContainerClick}>
      <GlobalStyles />
      <input ref={hiddenInputRef} type="text" className="opacity-0 absolute top-0 left-0 h-0 w-0" autoComplete="off" value=""/>

      {/* NAV */}
      <nav className="sticky top-2 z-50 w-full max-w-5xl rounded-2xl bg-white/80 px-4 py-2 backdrop-blur-md shadow-xl flex items-center justify-between mb-2">
        <div className="flex items-center gap-3"><span className="text-xl font-bold text-slate-700">TypeShallUs</span></div>
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-full">
          {[CONSTANTS.VIEWS.ENGLISH, CONSTANTS.VIEWS.NEPALI, CONSTANTS.VIEWS.LEADERBOARD].map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize ${view === v ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>{v}</button>
          ))}
        </div>
        <div className="w-8"></div>
      </nav>

      {/* MAIN */}
      <main className="w-full max-w-5xl px-4 relative flex-1 flex flex-col justify-center">
        {view === CONSTANTS.VIEWS.LEADERBOARD ? <LeaderboardView /> : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative overflow-hidden rounded-3xl bg-white/60 p-6 shadow-2xl backdrop-blur-xl border border-white/40">
            
            <AnimatePresence>
                {status === CONSTANTS.STATUS.FINISHED && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center text-center px-4">
                    <h2 className="text-3xl font-bold mb-4 text-slate-800">Mastery Complete!</h2>
                    <div className="text-5xl font-black mb-6 text-blue-600">{wpm} {view === 'nepali' ? 'KPM' : 'WPM'}</div>
                    {errorMessage && <div className="text-red-500 mb-2 flex items-center gap-2"><AlertCircle size={16}/> {errorMessage}</div>}
                    <div className="flex gap-2 mb-4">
                        <input id="name-input" ref={completionRef} type="text" placeholder="Full Name" className="p-3 border rounded-lg w-64" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
                        <button onClick={saveScore} disabled={saveStatus === 'success'} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold">
                            {saveStatus === 'success' ? 'Saved' : 'Save'}
                        </button>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={resetEngine} className="px-4 py-2 bg-slate-200 rounded-lg font-bold">Retry</button>
                        <button onClick={generatePDF} className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-bold">Certificate</button>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-between border-b border-slate-300/50 pb-2 mb-2">
              <StatBox label="SPEED" value={wpm} unit={view === 'nepali' ? "KPM" : "WPM"} />
              <div className="text-center">
                <div className="text-xs font-bold text-slate-400 mb-1">PRESS</div>
                <div className="text-4xl font-black text-blue-600 h-12 flex items-center justify-center font-sans">{activeKeyHint === 'SPACE' ? '␣' : activeKeyHint}</div>
              </div>
              <StatBox label="ACCURACY" value={accuracy} unit="%" />
            </div>

            {/* TEXT DISPLAY: Uses 'font-preeti' for Nepali, 'font-sans' for English */}
            <div className="relative no-select">
                <div ref={scrollContainerRef} 
                     className={`relative h-48 overflow-y-auto text-3xl leading-relaxed p-4 bg-white/40 rounded-xl ${view === 'nepali' ? 'font-preeti' : 'font-sans'}`}>
                  {targetKeys.map((key, i) => {
                    // For Preeti, just render the key as-is. The font does the mapping.
                    let displayChar = key === 'SPACE' ? ' ' : key;
                    let color = i < currentIndex ? 'text-slate-800' : 'text-slate-300';
                    let decoration = i === currentIndex ? 'active-char border-b-4 border-blue-500 text-blue-600' : '';
                    return <span key={i} className={`${color} ${decoration}`}>{displayChar}</span>;
                  })}
                </div>
            </div>

            {/* KEYBOARD */}
            <VirtualKeyboard activePhysicalKey={activePhysicalKey} pressedKey={pressedKey} view={view} />

          </motion.div>
        )}
        <div className="mt-2 text-center relative group">
          <a href="https://newchitwandriving.com" target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-20 cursor-pointer"></a>
          <div className="inline-block bg-slate-200/50 px-6 py-2 rounded-full text-[10px] font-bold text-slate-400 tracking-widest uppercase transition-colors group-hover:bg-slate-300 group-hover:text-slate-600">
            Powered by New Chitwan Driving Center
          </div>
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---
const StatBox = ({ label, value, unit }) => (
  <div className="text-center">
    <div className="text-xs font-bold text-slate-400 mb-1">{label}</div>
    <div className="text-4xl font-black text-slate-700">{value}<span className="text-lg text-slate-400 ml-1">{unit}</span></div>
  </div>
);

const VirtualKeyboard = React.memo(({ activePhysicalKey, pressedKey, view }) => {
    const renderKey = (k) => {
        const isActive = activePhysicalKey === k;
        const isPressed = pressedKey === k;
        const width = k === 'SPACE' ? 'w-80' : k === 'SHIFT' || k === 'ENTER' || k === 'CAPS' ? 'w-20' : k === 'TAB' || k === 'BACK' ? 'w-14' : 'w-10';
        
        let label = k;
        let subLabel = '';
        if (view === CONSTANTS.VIEWS.NEPALI && k.length === 1) {
            label = PREETI_KEYCAP_MAP[k.toLowerCase()] || k;
            subLabel = PREETI_KEYCAP_MAP[k.toUpperCase()] || '';
        }

        return (
            <div key={k} className={`h-10 ${width} flex flex-col justify-center items-center rounded-lg border-b-4 text-xs font-bold transition-all relative
                ${isActive ? 'bg-blue-500 border-blue-700 text-white -translate-y-1' : isPressed ? 'bg-slate-800 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600'}`}>
                {view === CONSTANTS.VIEWS.NEPALI && k.length === 1 ? (
                    <>
                        <span className="text-base leading-none mt-auto font-sans">{label}</span> 
                        {subLabel && <span className="absolute top-0.5 left-1 text-[8px] text-red-400 font-sans">{subLabel}</span>}
                    </>
                ) : ( k )}
            </div>
        );
    };

    const rows = [
        ['`','1','2','3','4','5','6','7','8','9','0','-','=', 'BACK'],
        ['TAB','Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],
        ['CAPS','A','S','D','F','G','H','J','K','L',';','\'', 'ENTER'],
        ['SHIFT','Z','X','C','V','B','N','M',',','.','/', 'SHIFT']
    ];

    return (
        <div className="mt-4 flex flex-col items-center gap-1 select-none">
            {rows.map((row, i) => <div key={i} className="flex gap-1">{row.map(renderKey)}</div>)}
            <div className="flex justify-center mt-1">{renderKey('SPACE')}</div>
        </div>
    );
});

const LeaderboardView = () => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        supabase.from('student_progress').select('id, wpm, name, created_at').order('wpm', { ascending: false }).limit(10)
            .then(({ data }) => { setScores(data || []); setLoading(false); });
    }, []);
    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin inline"/> Loading...</div>;
    return (
        <div className="bg-white/90 rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-slate-700">Rankings</h2>
            <table className="w-full text-left">
                <thead><tr className="border-b text-slate-400 text-sm"><th>Name</th><th>Speed</th><th>Date</th></tr></thead>
                <tbody>{scores.map(s => <tr key={s.id} className="border-b text-slate-600"><td className="py-3 font-bold">{s.name}</td><td className="font-black text-blue-600">{s.wpm}</td><td className="text-xs">{new Date(s.created_at).toLocaleDateString()}</td></tr>)}</tbody>
            </table>
        </div>
    );
};