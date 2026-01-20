import React from 'react';

const rows = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
  ['Space']
];

export default function VirtualKeyboard({ activeChar, finger }) {
  // Helper to check if a key matches the active character
  const isActive = (keyLabel) => {
    if (!activeChar) return false;
    if (keyLabel === 'Space' && activeChar === ' ') return true;
    return keyLabel.toLowerCase() === activeChar.toLowerCase();
  };

  return (
    <div className="flex flex-col gap-1 select-none opacity-80 scale-90 md:scale-100">
      {/* Finger Hint */}
      <div className="text-center mb-2 font-mono font-bold text-lg animate-pulse" style={{ color: 'var(--accent-color)' }}>
        {finger ? `Use Finger: ${finger}` : "READY"}
      </div>

      {rows.map((row, rIdx) => (
        <div key={rIdx} className="flex justify-center gap-1">
          {row.map((key, kIdx) => {
            let width = "w-10";
            if (key === "Space") width = "w-64";
            else if (key.length > 1) width = "w-20";

            const active = isActive(key);
            
            return (
              <div 
                key={kIdx} 
                className={`${width} h-10 flex items-center justify-center rounded border transition-all duration-100 font-mono text-sm
                  ${active 
                    ? "bg-[var(--accent-color)] text-black border-[var(--accent-color)] scale-110 shadow-[0_0_15px_var(--accent-color)]" 
                    : "bg-[var(--key-bg)] border-[var(--key-border)] text-[var(--text-color)]"
                  }`}
              >
                {key === "Space" ? "␣" : key}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}