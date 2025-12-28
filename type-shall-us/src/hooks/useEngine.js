import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ihkwbtlwmqxesuutphob.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imloa3didGx3bXF4ZXN1dXRwaG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4ODEyMjcsImV4cCI6MjA4MjQ1NzIyN30.D5d0_23LSuw7Zgle5eP8iRGqWRRS30JOm9bySkX9ieU'
);

const LOK_SEWA_TEXTS = [
  "नेपालको संविधान २०७२ अनुसार सार्वभौमसत्ता र राजकीयसत्ता नेपाली जनतामा निहित रहेको छ ।",
  "लोक सेवा आयोगको परीक्षा मर्यादित र निष्पक्ष हुनुपर्दछ ।",
  "सूचनाको हक सम्बन्धी ऐन, २०६४ ले प्रत्येक नेपाली नागरिकलाई अधिकार दिएको छ ।"
];

const ENGLISH_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "Technology is best when it brings people together.",
  "Consistency is the key to mastering any skill."
];

export const useEngine = (mode) => {
  const [targetText, setTargetText] = useState("");
  const [typed, setTyped] = useState("");
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [startTime, setStartTime] = useState(null);

  // Load Text based on Mode
  useEffect(() => {
    const texts = mode === 'nepali' ? LOK_SEWA_TEXTS : ENGLISH_TEXTS;
    setTargetText(texts[Math.floor(Math.random() * texts.length)]);
    setTyped("");
    setStartTime(null);
    setWpm(0);
  }, [mode]);

  // THE KEY FIX: We handle the keypress, map it (if needed), and update state.
  // The user NEVER sees the raw input value.
  const handleInput = useCallback((e) => {
    const val = e.target.value;
    
    // Reset start time on first key
    if (!startTime) setStartTime(Date.now());

    // In a real app, you would add the Preeti mapping logic here
    // For now, we assume direct input but we control the render
    setTyped(val);

    // Calculate Stats
    if (startTime) {
      const timeMin = (Date.now() - startTime) / 60000;
      const calculatedWpm = Math.round((val.length / 5) / (timeMin || 0.001));
      setWpm(calculatedWpm);
    }
  }, [startTime]);

  // Check completion
  useEffect(() => {
    if (targetText && typed.length === targetText.length) {
      // Save to Supabase
      const saveScore = async () => {
        const id = localStorage.getItem('tsu_id') || crypto.randomUUID();
        localStorage.setItem('tsu_id', id);
        await supabase.from('student_progress').insert([{ id, wpm, accuracy: 100 }]);
        alert(`Mastery Complete! ${wpm} WPM`);
        setTyped(""); // Reset
      };
      saveScore();
    }
  }, [typed, targetText]);

  return { targetText, typed, wpm, accuracy, handleInput };
};