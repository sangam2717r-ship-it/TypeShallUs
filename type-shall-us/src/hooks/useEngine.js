import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ihkwbtlwmqxesuutphob.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imloa3didGx3bXF4ZXN1dXRwaG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4ODEyMjcsImV4cCI6MjA4MjQ1NzIyN30.D5d0_23LSuw7Zgle5eP8iRGqWRRS30JOm9bySkX9ieU'
);

// --- THE FULL PREETI MAP ---
const PREETI_MAP = {
  // Lowercase (Normal keys)
  'a': 'ब', 'b': 'द', 'c': 'अ', 'd': 'म', 'e': 'भ', 'f': 'ा', 'g': 'न', 'h': 'ज',
  'i': 'ष', 'j': 'व', 'k': 'प', 'l': 'ि', 'm': 'श', 'n': 'ल', 'o': 'य', 'p': 'उ',
  'q': 'त्र', 'r': 'च', 's': 'क', 't': 'त', 'u': 'ग', 'v': 'ख', 'w': 'ध', 'x': 'ह',
  'y': 'थ', 'z': 'श', 
  '`': 'ञ', '1': '१', '2': '२', '3': '३', '4': '४', '5': '५', '6': '६', '7': '७', '8': '८', '9': '९', '0': '०',
  '-': '(', '=': '.', '[': 'ऋ', ']': '्', '\\': '?', ';': 'स', "'": 'ु', ',': ',', '.': '।', '/': 'र',

  // Uppercase (Shift keys)
  'A': 'ब्', 'B': 'द्', 'C': 'आ', 'D': 'म्', 'E': 'ै', 'F': 'ँ', 'G': 'न्', 'H': 'ज्',
  'I': 'क्ष', 'J': 'व्', 'K': 'प्', 'L': 'ी', 'M': 'श्', 'N': 'ल्', 'O': 'इ', 'P': 'ए',
  'Q': 'त्त', 'R': 'च्', 'S': 'क्', 'T': 'त्', 'U': 'ग्', 'V': 'ख्', 'W': 'द्ध', 'X': 'ह्',
  'Y': 'थ्', 'Z': 'श्',
  '~': '़', '!': 'ज्ञ', '@': 'ई', '#': 'घ', '$': 'द्ध', '%': 'छ', '^': 'ट', '&': 'ठ', '*': 'ड', '(': 'ढ', ')': 'ण',
  '_': ')', '+': '़', '{': 'र्', '}': 'ञ', '|': '्र', ':': 'स्', '"': 'ू', '<': '?', '>': 'श्र', '?': 'रु'
};

const LOK_SEWA_TEXTS = [
  "नेपालको संविधान २०७२ अनुसार सार्वभौमसत्ता र राजकीयसत्ता नेपाली जनतामा निहित रहेको छ ।",
  "लोक सेवा आयोगको परीक्षा मर्यादित र निष्पक्ष हुनुपर्दछ ।",
  "सूचनाको हक सम्बन्धी ऐन, २०६४ ले प्रत्येक नेपाली नागरिकलाई अधिकार दिएको छ ।",
  "नेपाल एक स्वतन्त्र, अविभाज्य, सार्वभौमसत्तासम्पन्न, धर्मनिरपेक्ष, समावेशी, लोकतान्त्रिक राज्य हो ।"
];

const ENGLISH_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "Technology is best when it brings people together.",
  "Consistency is the key to mastering any skill.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts."
];

export const useEngine = (mode) => {
  const [targetText, setTargetText] = useState("");
  const [typed, setTyped] = useState("");
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [startTime, setStartTime] = useState(null);
  const [status, setStatus] = useState('idle');
  const [mistakes, setMistakes] = useState(0);

  // Initialize Lesson
  useEffect(() => {
    const texts = mode === 'nepali' ? LOK_SEWA_TEXTS : ENGLISH_TEXTS;
    setTargetText(texts[Math.floor(Math.random() * texts.length)]);
    reset();
  }, [mode]);

  const reset = () => {
    setTyped("");
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setMistakes(0);
    setStatus('idle');
  };

  const handleInput = useCallback((e) => {
    if (status === 'finished') return;

    const val = e.target.value; // The raw input (e.g., "a")
    
    // Start Timer on first key
    if (!startTime) {
      setStartTime(Date.now());
      setStatus('running');
    }

    // --- TRANSLATION LOGIC ---
    let newTyped = val;
    
    // Only map if we are adding a character (not deleting) AND we are in Nepali mode
    if (mode === 'nepali' && val.length > typed.length) {
      const lastChar = val.slice(-1); // Get the English key pressed
      const mappedChar = PREETI_MAP[lastChar] || lastChar; // Map to Nepali
      
      // Reconstruct the string: Old typed + New Nepali Char
      newTyped = typed + mappedChar;
    } else if (val.length < typed.length) {
      // Handle Backspace (just slice the state)
      newTyped = typed.slice(0, val.length);
    } else if (mode !== 'nepali') {
      // English Mode: Just take the value as is
      newTyped = val;
    }

    // --- ACCURACY LOGIC ---
    // Only verify the *newly added* character
    if (newTyped.length > typed.length) {
      const idx = newTyped.length - 1;
      if (newTyped[idx] !== targetText[idx]) {
        setMistakes(prev => prev + 1);
      }
    }

    // Update State
    setTyped(newTyped);

    // --- STATS CALCULATION ---
    const totalChars = newTyped.length;
    const correctChars = totalChars - mistakes; // Simplified for real-time
    const acc = totalChars > 0 ? Math.max(0, Math.round((correctChars / totalChars) * 100)) : 100;
    setAccuracy(acc);

    i// ... inside handleInput ...
    
    if (startTime) {
      const timeInMinutes = (Date.now() - startTime) / 60000;
      
      // FIX: Ensure we don't divide by zero, but allow WPM to show immediately
      if (timeInMinutes > 0) {
          // Standard Math: (Chars / 5) / Minutes
          const rawWpm = (newTyped.length / 5) / timeInMinutes;
          
          // Cap it at 250 so it doesn't look broken, but don't force it to 0
          setWpm(Math.round(Math.min(rawWpm, 250))); 
      }

    // --- COMPLETION CHECK ---
    if (newTyped.length >= targetText.length) {
      setStatus('finished');
      saveScore(wpm, acc);
    }
  }, [typed, targetText, mode, startTime, mistakes, wpm, status]);

  const saveScore = async (finalWpm, finalAcc) => {
    const id = localStorage.getItem('tsu_id') || crypto.randomUUID();
    localStorage.setItem('tsu_id', id);
    await supabase.from('student_progress').insert([{ id, wpm: finalWpm, accuracy: finalAcc }]);
  };

  return { targetText, typed, wpm, accuracy, status, handleInput, reset };
};