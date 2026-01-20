// Preeti to English Key Mapping (The logic: To type 'क' you press 's', etc.)
export const preetiMap = {
  "क": "s", "ख": "v", "ग": "u", "घ": "U", "ङ": "k",
  "च": "R", "छ": "H", "ज": "p", "झ": "P", "ञ": "y",
  "ट": "q", "ठ": "w", "ड": "a", "ढ": "s", "ण": "r",
  "त": "t", "थ": "y", "द": "u", "ध": "i", "न": "o",
  "प": "h", "फ": "j", "ब": "v", "भ": "b", "म": "m",
  "य": "?", "र": "/", "ल": "n", "व": "b", "श": "M",
  "ष": "<", "स": "k", "ह": "u", "क्ष": "6", "त्र": "=", "ज्ञ": "5",
  "ा": "k", "ि": "l", "ी": "L", "ु": "'", "ू": "\"", 
  "े": "g", "ै": "G", "ो": "k", "ौ": "K", "ं": "M", "ँ": "X",
  "्": "\\", "।": "."
};

export const textData = {
  short: [
    "The quick brown fox jumps over the lazy dog.",
    "Pack my box with five dozen liquor jugs.",
    "Sphinx of black quartz, judge my vow."
  ],
  medium: [
    "To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex.",
    "It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind."
  ],
  long: [
    "The concept of artificial intelligence has evolved significantly over the past decade. Neural networks, specifically transformers, have revolutionized natural language processing. By leveraging massive datasets, these models can predict the next token in a sequence with remarkable accuracy, though they lack true sentience or understanding of the physical world. The implications of this technology on the workforce and creative industries remain a subject of intense debate, raising ethical questions about authorship and agency."
  ],
  nepali_preeti: [
    "mero desh nepal ho", // This is just a placeholder. In a real app, you'd paste actual Preeti font text here (e.g., 'd]/f] b]z g]kfn xf]')
    "nepali typing practice"
  ]
};

export const fingerMap = {
  q: "L-Pinky", a: "L-Pinky", z: "L-Pinky", 1: "L-Pinky",
  w: "L-Ring", s: "L-Ring", x: "L-Ring", 2: "L-Ring",
  e: "L-Middle", d: "L-Middle", c: "L-Middle", 3: "L-Middle",
  r: "L-Index", f: "L-Index", v: "L-Index", 4: "L-Index", 5: "L-Index", t: "L-Index", g: "L-Index", b: "L-Index",
  y: "R-Index", h: "R-Index", n: "R-Index", 6: "R-Index", 7: "R-Index", u: "R-Index", j: "R-Index", m: "R-Index",
  i: "R-Middle", k: "R-Middle", ",": "R-Middle", 8: "R-Middle",
  o: "R-Ring", l: "R-Ring", ".": "R-Ring", 9: "R-Ring",
  p: "R-Pinky", ";": "R-Pinky", "/": "R-Pinky", 0: "R-Pinky", "-": "R-Pinky", "=": "R-Pinky", "'": "R-Pinky", "[": "R-Pinky", "]": "R-Pinky", "\\": "R-Pinky",
  " ": "Thumb"
};