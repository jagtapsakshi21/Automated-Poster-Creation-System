/* =====================================================================
   PosterCraft PRO – app.js  (Multi-Person Update)
   ===================================================================== */
'use strict';

/* ── Multi-person default factories ── */
const defaultTopperPerson  = (i) => ({ rank:['1st','2nd','3rd','4th','5th'][i]||`${i+1}th`, name:'', score:'', subject:'', photo:null });
const defaultBdayPerson    = ()  => ({ name:'', age:'', msg:'', photo:null });
const defaultSportsPerson  = (i) => ({ player:'', achievement:['🥇 Gold','🥈 Silver','🥉 Bronze','4th Place','5th Place','6th Place'][i]||'', sport:'', score:'', photo:null });
const MULTI_TYPES = ['topper','birthday','sports'];
const MAX_PERSONS = { topper:5, birthday:6, sports:6 };
const RANK_MEDALS = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣'];


/* ═══════════════════════════════════════════════════════
   A P P   S T A T E
═══════════════════════════════════════════════════════ */
const state = {
  posterType: 'topper',
  theme: null,
  size: 'a4',
  layout: 'centered',
  fontFamily: 'Outfit',
  headingColor: '#ffffff',
  bodyColor: '#ffffff',
  headingSize: 36,
  bodySize: 16,
  textAlign: 'center',
  textShadow: true,
  bgOpacity: 85,
  bgOverlayColor: '#000000',
  bgPattern: 'none',
  bgImageURL: null,
  decoStars: true,
  decoBorder: false,
  decoConfetti: false,
  decoRibbon: false,
  decoSparkles: false,
  decoCornerDeco: false,
  uploadedImage: null,
  uploadedImageURL: null,
  imageSize: 100,
  imagePosition: 'top-center',
  imageShape: 'circle',
  imageFilter: 'none',
  imageBorder: true,
  watermarkEnabled: false,
  watermarkText: '',
  qrEnabled: false,
  qrText: '',
  zoom: 0.7,
  fields: {},
  gallery: JSON.parse(localStorage.getItem('autoposter_gallery') || '[]'),
  templates: JSON.parse(localStorage.getItem('autoposter_templates') || '[]'),
  galleryFilter: 'all',
  history: [],
  historyIndex: -1,
  _skipHistory: false,
  /* ── multi-person arrays ── */
  multiPersons: {
    topper:   [defaultTopperPerson(0), defaultTopperPerson(1), defaultTopperPerson(2)],
    birthday: [defaultBdayPerson()],
    sports:   [defaultSportsPerson(0), defaultSportsPerson(1), defaultSportsPerson(2)],
  },
};

/* ═══════════════════════════════════════════════════════
   T H E M E S  (10 per existing + 8 per new type)
═══════════════════════════════════════════════════════ */
const THEMES = {
  topper: [
    { id:'royal-gold', label:'Royal Gold', bg:'linear-gradient(135deg,#1a1a2e 0%,#16213e 40%,#0f3460 100%)', accent:'#FFD700', accent2:'#FFA500' },
    { id:'prestige', label:'Prestige', bg:'linear-gradient(135deg,#2d1b69 0%,#11998e 100%)', accent:'#fff', accent2:'#AEFFD8' },
    { id:'crimson', label:'Crimson', bg:'linear-gradient(135deg,#1f0024 0%,#700000 100%)', accent:'#FFD700', accent2:'#FF8C00' },
    { id:'cosmic', label:'Cosmic', bg:'linear-gradient(135deg,#0c0c2b 0%,#1a0050 50%,#4a0080 100%)', accent:'#00eaff', accent2:'#7b2fff' },
    { id:'emerald', label:'Emerald', bg:'linear-gradient(135deg,#003d00 0%,#005c00 50%,#1a7a1a 100%)', accent:'#FFD700', accent2:'#00FF7F' },
    { id:'midnight', label:'Midnight', bg:'linear-gradient(135deg,#0a0a0a 0%,#1c1c2e 100%)', accent:'#c0c0c0', accent2:'#888888' },
    { id:'sapphire', label:'Sapphire', bg:'linear-gradient(135deg,#0f2c7d 0%,#1e40af 60%,#1d4ed8 100%)', accent:'#fbbf24', accent2:'#e0f2fe' },
    { id:'obsidian', label:'Obsidian', bg:'linear-gradient(135deg,#0a0a0a 0%,#18181b 40%,#27272a 100%)', accent:'#d97706', accent2:'#f59e0b' },
    { id:'aurora', label:'Aurora', bg:'linear-gradient(135deg,#0d1117 0%,#0d1b2a 50%,#1a2744 100%)', accent:'#38bdf8', accent2:'#818cf8' },
    { id:'platinum', label:'Platinum', bg:'linear-gradient(135deg,#1f2937 0%,#374151 100%)', accent:'#e5e7eb', accent2:'#9ca3af' },
  ],
  event: [
    { id:'electric-blue', label:'Electric', bg:'linear-gradient(135deg,#001c55 0%,#0038b8 50%,#005eff 100%)', accent:'#ffffff', accent2:'#00f0ff' },
    { id:'sunset', label:'Sunset', bg:'linear-gradient(135deg,#ff4e00 0%,#ec9f05 100%)', accent:'#fff', accent2:'#ffe4b5' },
    { id:'neo-purple', label:'Neo Purple', bg:'linear-gradient(135deg,#1a0050 0%,#6a0080 50%,#d400ff 100%)', accent:'#fff', accent2:'#FF69B4' },
    { id:'corporate', label:'Corporate', bg:'linear-gradient(135deg,#003049 0%,#d62828 100%)', accent:'#f4a261', accent2:'#fff' },
    { id:'mint-fresh', label:'Mint', bg:'linear-gradient(135deg,#004643 0%,#abd1c6 100%)', accent:'#e8e4e6', accent2:'#00ff99' },
    { id:'aurora-event', label:'Aurora', bg:'linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)', accent:'#00eaff', accent2:'#ff6fd8' },
    { id:'neon-night', label:'Neon Night', bg:'linear-gradient(135deg,#0d001a 0%,#1a0030 50%,#2d004a 100%)', accent:'#ff00ff', accent2:'#00ffee' },
    { id:'techfest', label:'TechFest', bg:'linear-gradient(135deg,#000d1a 0%,#001a33 50%,#00264d 100%)', accent:'#00f0ff', accent2:'#7fff00' },
    { id:'crimson-event', label:'Crimson', bg:'linear-gradient(135deg,#2d0000 0%,#8b0000 100%)', accent:'#ffd700', accent2:'#ff8c00' },
    { id:'forest-event', label:'Forest', bg:'linear-gradient(135deg,#052e16 0%,#14532d 100%)', accent:'#86efac', accent2:'#bbf7d0' },
  ],
  birthday: [
    { id:'party-pop', label:'Party Pop', bg:'linear-gradient(135deg,#FF61D2 0%,#FE9090 50%,#FFD700 100%)', accent:'#fff', accent2:'#fff' },
    { id:'candy', label:'Candy', bg:'linear-gradient(135deg,#ff9a9e 0%,#fad0c4 100%)', accent:'#c0392b', accent2:'#fff' },
    { id:'midnight-bday', label:'Midnight', bg:'linear-gradient(135deg,#2c003e 0%,#7b2ff7 100%)', accent:'#FFD700', accent2:'#FF69B4' },
    { id:'tropical', label:'Tropical', bg:'linear-gradient(135deg,#00b09b 0%,#96c93d 100%)', accent:'#fff', accent2:'#FFD700' },
    { id:'rose-gold', label:'Rose Gold', bg:'linear-gradient(135deg,#36012f 0%,#cc5200 100%)', accent:'#FFD700', accent2:'#f5cba7' },
    { id:'galaxy-bday', label:'Galaxy', bg:'linear-gradient(135deg,#000428 0%,#004e92 100%)', accent:'#FF69B4', accent2:'#FFD700' },
    { id:'cotton-candy', label:'Cotton Candy', bg:'linear-gradient(135deg,#f8b4d9 0%,#c4b5fd 100%)', accent:'#7c3aed', accent2:'#db2777' },
    { id:'golden-hour', label:'Golden Hour', bg:'linear-gradient(135deg,#92400e 0%,#b45309 50%,#d97706 100%)', accent:'#fef3c7', accent2:'#fff' },
    { id:'neon-party', label:'Neon', bg:'linear-gradient(135deg,#0a001a 0%,#1a002e 100%)', accent:'#ff00ff', accent2:'#00ffcc' },
    { id:'pastel', label:'Pastel', bg:'linear-gradient(135deg,#fce4ec 0%,#e1f5fe 100%)', accent:'#f06292', accent2:'#4fc3f7' },
  ],
  wedding: [
    { id:'ivory-gold', label:'Ivory Gold', bg:'linear-gradient(135deg,#fffff0 0%,#fffde7 50%,#fff9c4 100%)', accent:'#b8860b', accent2:'#8b6914' },
    { id:'romantic-rose', label:'Romance', bg:'linear-gradient(135deg,#3d0010 0%,#7b0026 50%,#a3003a 100%)', accent:'#ffc0cb', accent2:'#ffe4e8' },
    { id:'dusty-rose', label:'Dusty Rose', bg:'linear-gradient(135deg,#5c3d4a 0%,#9c6b7a 100%)', accent:'#f8d7da', accent2:'#fce4ec' },
    { id:'garden', label:'Garden', bg:'linear-gradient(135deg,#1b4332 0%,#2d6a4f 50%,#40916c 100%)', accent:'#fff', accent2:'#d8f3dc' },
    { id:'midnight-wed', label:'Midnight Blue', bg:'linear-gradient(135deg,#03045e 0%,#023e8a 50%,#0077b6 100%)', accent:'#fff', accent2:'#caf0f8' },
    { id:'blush-gold', label:'Blush Gold', bg:'linear-gradient(135deg,#2c1e1e 0%,#5a2a2a 100%)', accent:'#f4c2c2', accent2:'#ffd700' },
    { id:'lavender', label:'Lavender', bg:'linear-gradient(135deg,#2e1760 0%,#5e35b1 100%)', accent:'#e8d5f5', accent2:'#fff' },
    { id:'pearl', label:'Pearl', bg:'linear-gradient(135deg,#e8e8e8 0%,#f8f8f8 100%)', accent:'#9c8b5e', accent2:'#555' },
  ],
  sports: [
    { id:'champion', label:'Champion', bg:'linear-gradient(135deg,#1a1a00 0%,#3d3d00 50%,#666600 100%)', accent:'#FFD700', accent2:'#FFF' },
    { id:'stadium', label:'Stadium', bg:'linear-gradient(135deg,#003300 0%,#006600 100%)', accent:'#fff', accent2:'#FFFF00' },
    { id:'fire', label:'Fire', bg:'linear-gradient(135deg,#1c0000 0%,#7f0000 50%,#ff4500 100%)', accent:'#FFD700', accent2:'#ff8c00' },
    { id:'ice', label:'Ice Blue', bg:'linear-gradient(135deg,#00001a 0%,#001a40 50%,#003377 100%)', accent:'#00f5ff', accent2:'#e0f7ff' },
    { id:'gold-black', label:'Gold Black', bg:'linear-gradient(135deg,#0a0a00 0%,#1a1a00 100%)', accent:'#FFD700', accent2:'#FFA500' },
    { id:'olympus', label:'Olympus', bg:'linear-gradient(135deg,#0a0020 0%,#200050 100%)', accent:'#FFD700', accent2:'#fff' },
    { id:'energy', label:'Energy', bg:'linear-gradient(135deg,#001a33 0%,#003366 100%)', accent:'#00ff99', accent2:'#fff' },
    { id:'power', label:'Power', bg:'linear-gradient(135deg,#1a0000 0%,#4d0000 100%)', accent:'#ff4444', accent2:'#fff' },
  ],
  quote: [
    { id:'ink', label:'Ink Black', bg:'linear-gradient(135deg,#000000 0%,#111 100%)', accent:'#ffffff', accent2:'#aaaaaa' },
    { id:'gold-dark', label:'Gold Dark', bg:'linear-gradient(135deg,#0d0900 0%,#1a1200 100%)', accent:'#FFD700', accent2:'#FFA500' },
    { id:'minimal-white', label:'Minimal', bg:'linear-gradient(135deg,#f5f5f5 0%,#ffffff 100%)', accent:'#111', accent2:'#444' },
    { id:'deep-teal', label:'Deep Teal', bg:'linear-gradient(135deg,#001a1a 0%,#003333 100%)', accent:'#00ffcc', accent2:'#fff' },
    { id:'purple-haze', label:'Purple', bg:'linear-gradient(135deg,#1a0033 0%,#3d0066 100%)', accent:'#cc99ff', accent2:'#fff' },
    { id:'sunset-q', label:'Sunset', bg:'linear-gradient(135deg,#1a0800 0%,#8b2200 100%)', accent:'#ffbb66', accent2:'#fff' },
    { id:'slate-q', label:'Slate', bg:'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', accent:'#e2e8f0', accent2:'#94a3b8' },
    { id:'forest-q', label:'Forest', bg:'linear-gradient(135deg,#071a0f 0%,#0f3320 100%)', accent:'#86efac', accent2:'#d1fae5' },
  ],
  corporate: [
    { id:'exec-blue', label:'Executive', bg:'linear-gradient(135deg,#00102a 0%,#002a66 50%,#003d99 100%)', accent:'#ffffff', accent2:'#a0c4ff' },
    { id:'dark-pro', label:'Dark Pro', bg:'linear-gradient(135deg,#0a0a0a 0%,#1a1a1a 100%)', accent:'#3b82f6', accent2:'#93c5fd' },
    { id:'navy-gold', label:'Navy Gold', bg:'linear-gradient(135deg,#000d1a 0%,#001a33 100%)', accent:'#fbbf24', accent2:'#fde68a' },
    { id:'steel', label:'Steel Gray', bg:'linear-gradient(135deg,#1f2937 0%,#374151 100%)', accent:'#d1d5db', accent2:'#9ca3af' },
    { id:'teal-corp', label:'Teal Pro', bg:'linear-gradient(135deg,#042f2e 0%,#065f46 100%)', accent:'#6ee7b7', accent2:'#d1fae5' },
    { id:'prestige-corp', label:'Prestige', bg:'linear-gradient(135deg,#1e003d 0%,#4b0082 100%)', accent:'#e9d5ff', accent2:'#fff' },
    { id:'classic-red', label:'Bold Red', bg:'linear-gradient(135deg,#1c0000 0%,#7f1d1d 100%)', accent:'#fecaca', accent2:'#fff' },
    { id:'off-white', label:'Off White', bg:'linear-gradient(135deg,#fafaf9 0%,#f5f5f4 100%)', accent:'#1c1917', accent2:'#44403c' },
  ],
  custom: [
    { id:'slate', label:'Slate', bg:'linear-gradient(135deg,#1e293b 0%,#334155 100%)', accent:'#ffffff', accent2:'#94a3b8' },
    { id:'charcoal', label:'Charcoal', bg:'linear-gradient(135deg,#111 0%,#333 100%)', accent:'#FFD700', accent2:'#fff' },
    { id:'ocean', label:'Ocean', bg:'linear-gradient(135deg,#001f3f 0%,#0074D9 100%)', accent:'#7FDBFF', accent2:'#fff' },
    { id:'forest', label:'Forest', bg:'linear-gradient(135deg,#0a3d0a 0%,#145a32 100%)', accent:'#ABEBC6', accent2:'#fff' },
    { id:'lava', label:'Lava', bg:'linear-gradient(135deg,#1a0000 0%,#8b0000 50%,#ff4500 100%)', accent:'#FFD700', accent2:'#fff' },
    { id:'pure-white', label:'White', bg:'linear-gradient(135deg,#f8f9fa 0%,#e9ecef 100%)', accent:'#333', accent2:'#555' },
    { id:'neon-custom', label:'Neon', bg:'linear-gradient(135deg,#050010 0%,#0d0026 100%)', accent:'#ff00ff', accent2:'#00ffee' },
    { id:'sand', label:'Sand', bg:'linear-gradient(135deg,#3d2b1f 0%,#8b6914 100%)', accent:'#fef3c7', accent2:'#fff' },
    { id:'rose', label:'Rose', bg:'linear-gradient(135deg,#3b0f2f 0%,#831843 100%)', accent:'#fce7f3', accent2:'#fbcfe8' },
    { id:'space', label:'Space', bg:'linear-gradient(135deg,#000010 0%,#00001a 100%)', accent:'#818cf8', accent2:'#c7d2fe' },
  ],
};

/* ═══════════════════════════════════════════════════════
   F I E L D   D E F I N I T I O N S
═══════════════════════════════════════════════════════ */
const POSTER_FIELDS = {
  topper: [
    { id:'org',   label:'Organization / School Name', type:'text',     ph:"e.g. St. Xavier's School", default:"St. Xavier's High School" },
    { id:'title', label:'Poster Title',               type:'text',     ph:'e.g. Top Achievers 2025',  default:'Academic Excellence Award 2025' },
    { id:'class', label:'Class / Batch',              type:'text',     ph:'e.g. Class XII, 2024-25',  default:'Class XII – 2024-25' },
    { id:'date',  label:'Exam / Award Date',          type:'date',     ph:'', default:'' },
    { id:'msg',   label:'Congratulation Message',     type:'textarea', ph:'Enter a message…',         default:'We are incredibly proud of every achiever.\nYour hard work and dedication inspire us all.' },
  ],
  event: [
    { id:'org', label:'Organization / Club Name', type:'text', ph:'e.g. Tech Club', default:'Department of Computer Science' },
    { id:'title', label:'Event Name', type:'text', ph:'e.g. Hackathon 2025', default:'TechFest 2025 – Annual Hackathon' },
    { id:'subtitle', label:'Sub-title / Theme', type:'text', ph:'e.g. Code for Change', default:'"Code for Change"' },
    { id:'date', label:'Event Date', type:'date', ph:'', default:'' },
    { id:'time', label:'Time', type:'time', ph:'', default:'' },
    { id:'venue', label:'Venue / Location', type:'text', ph:'e.g. Main Auditorium', default:'Main Auditorium, Block B' },
    { id:'desc', label:'Event Description', type:'textarea', ph:'Describe the event…', default:'Join us for an exciting 24-hour coding competition\nopen to all undergraduate students. Win exciting prizes!' },
    { id:'contact', label:'Contact / Registration', type:'text', ph:'Phone / Email / Link', default:'Register at: techfest2025.example.com' },
  ],
  birthday: [
    { id:'from',       label:'From (Sender Name)',      type:'text',     ph:'Your name / Group',     default:'Your Friends & Family' },
    { id:'date',       label:'Celebration Date',        type:'date',     ph:'', default:'' },
    { id:'time',       label:'Party Time (optional)',   type:'time',     ph:'', default:'' },
    { id:'venue',      label:'Party Venue (optional)',  type:'text',     ph:'e.g. Green Garden Hall', default:'' },
    { id:'shared_msg', label:'Shared Birthday Message', type:'textarea', ph:'Write a shared message…', default:'Wishing you all a day as special as you are!\nMay all your dreams come true! 🎉' },
  ],
  wedding: [
    { id:'bride', label:'Bride Name', type:'text', ph:'Bride full name', default:'Ananya Sharma' },
    { id:'groom', label:'Groom Name', type:'text', ph:'Groom full name', default:'Rohan Mehta' },
    { id:'date', label:'Wedding Date', type:'date', ph:'', default:'' },
    { id:'time', label:'Ceremony Time', type:'time', ph:'', default:'' },
    { id:'venue', label:'Venue / Hall Name', type:'text', ph:'e.g. The Grand Ballroom', default:'The Grand Palace Banquet Hall' },
    { id:'location', label:'Venue Address / City', type:'text', ph:'Full address or city', default:'Mumbai, Maharashtra' },
    { id:'rsvp', label:'RSVP / Contact', type:'text', ph:'Contact info', default:'RSVP: +91-XXXXXXXXXX' },
    { id:'msg', label:'Invitation Message', type:'textarea', ph:'Invitation text…', default:'Together with their families, joyfully invite you\nto celebrate the beginning of their new journey.' },
  ],
  sports: [
    { id:'org',   label:'Organization / Academy', type:'text',     ph:'Club / School name',    default:'National Sports Academy' },
    { id:'title', label:'Event Title',            type:'text',     ph:'e.g. Annual Sports Meet', default:'Annual Sports Championship 2025' },
    { id:'date',  label:'Event Date',             type:'date',     ph:'', default:'' },
    { id:'msg',   label:'Motivational Quote',     type:'textarea', ph:'Motivational message…',  default:'Champions are not born – they are built\nthrough sweat, sacrifice, and relentless effort.' },
  ],
  quote: [
    { id:'quote', label:'Quote / Message', type:'textarea', ph:'Enter your quote here…', default:'The only way to do great work\nis to love what you do.' },
    { id:'author', label:'Author / Source', type:'text', ph:'e.g. Steve Jobs', default:'— Steve Jobs' },
    { id:'context', label:'Subtitle / Context (optional)', type:'text', ph:'Additional context', default:'' },
    { id:'org', label:'Brand / Name (optional)', type:'text', ph:'Your brand name', default:'' },
  ],
  corporate: [
    { id:'org', label:'Company / Organization Name', type:'text', ph:'Company name', default:'Apex Consulting Group' },
    { id:'title', label:'Announcement / Title', type:'text', ph:'Main headline', default:'Annual Strategy Summit 2025' },
    { id:'subtitle', label:'Tagline / Subtitle', type:'text', ph:'Tagline', default:'Shaping Tomorrow, Together' },
    { id:'date', label:'Date', type:'date', ph:'', default:'' },
    { id:'time', label:'Time', type:'time', ph:'', default:'' },
    { id:'venue', label:'Venue / Platform', type:'text', ph:'Location or online platform', default:'Grand Hyatt, Mumbai' },
    { id:'desc', label:'Description', type:'textarea', ph:'Brief description…', default:'Join our leadership team for an insightful discussion\non growth strategy and innovation in 2025.' },
    { id:'contact', label:'Contact / RSVP', type:'text', ph:'Email / Phone / Website', default:'info@apexconsult.com  |  +91-XXXXXXXXXX' },
  ],
  custom: [
    { id:'title', label:'Main Title', type:'text', ph:'Enter main heading', default:'Your Custom Poster Title' },
    { id:'subtitle', label:'Subtitle', type:'text', ph:'Enter subtitle', default:'Your Perfect Subtitle Here' },
    { id:'line1', label:'Line 1', type:'text', ph:'Text line 1', default:'' },
    { id:'line2', label:'Line 2', type:'text', ph:'Text line 2', default:'' },
    { id:'body', label:'Body Text', type:'textarea', ph:'Enter body text…', default:'Add your content here. This is fully customizable for any purpose.' },
    { id:'footer', label:'Footer Text', type:'text', ph:'Footer / website / contact', default:'www.example.com  |  📞 +91-XXXXXXXXXX' },
  ],
};

/* ═══════════════════════════════════════════════════════
   P O S T E R   S I Z E S
═══════════════════════════════════════════════════════ */
const SIZES = {
  a4:        { w: 560, h: 792,  label: 'A4 Portrait' },
  square:    { w: 600, h: 600,  label: 'Square 1:1' },
  landscape: { w: 900, h: 506,  label: 'Landscape 16:9' },
  story:     { w: 405, h: 720,  label: 'Story 9:16' },
  banner:    { w: 900, h: 300,  label: 'Banner 3:1' },
  letter:    { w: 560, h: 728,  label: 'US Letter' },
};

/* ═══════════════════════════════════════════════════════
   I N I T
═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  selectPosterType('topper', document.querySelector('.type-card[data-type="topper"]'));
  renderGallery();
  renderTemplates();
  updateSliderBg('imageSize', 100, 40, 280);
  updateSliderBg('headingSize', 36, 14, 72);
  updateSliderBg('bodySize', 16, 10, 36);
  updateSliderBg('bgOpacity', 85, 0, 100);
  document.getElementById('headingSize').addEventListener('input', e => updateSliderBg('headingSize', e.target.value, 14, 72));
  document.getElementById('bodySize').addEventListener('input', e => updateSliderBg('bodySize', e.target.value, 10, 36));
  document.getElementById('bgOpacity').addEventListener('input', e => updateSliderBg('bgOpacity', e.target.value, 0, 100));
  document.getElementById('imageSize').addEventListener('input', e => updateSliderBg('imageSize', e.target.value, 40, 280));
  // Close download menu on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.header-actions')) closeDownloadMenu();
  });
});

function updateSliderBg(id, val, min, max) {
  const pct = ((val - min) / (max - min)) * 100;
  const el = document.getElementById(id);
  if (el) el.style.background = `linear-gradient(to right, #6366f1 ${pct}%, #202444 ${pct}%)`;
}

/* ═══════════════════════════════════════════════════════
   T A B   S W I T C H
═══════════════════════════════════════════════════════ */
function switchTab(tab) {
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.querySelector(`.nav-btn[data-tab="${tab}"]`).classList.add('active');
  if (tab === 'gallery') renderGallery();
  if (tab === 'templates') renderTemplates();
}

/* ═══════════════════════════════════════════════════════
   D O W N L O A D   M E N U
═══════════════════════════════════════════════════════ */
function openDownloadMenu() {
  const m = document.getElementById('downloadMenu');
  m.style.display = m.style.display === 'none' ? 'block' : 'none';
}
function closeDownloadMenu() {
  document.getElementById('downloadMenu').style.display = 'none';
}

/* ═══════════════════════════════════════════════════════
   P O S T E R   T Y P E
═══════════════════════════════════════════════════════ */
function selectPosterType(type, el) {
  state.posterType = type;
  document.querySelectorAll('.type-card').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  renderThemes();
  renderContentFields();
  generatePoster();
  pushHistory();
}

/* ═══════════════════════════════════════════════════════
   R E N D E R   T H E M E S
═══════════════════════════════════════════════════════ */
function renderThemes() {
  const grid = document.getElementById('themeGrid');
  const themes = THEMES[state.posterType];
  grid.innerHTML = '';
  themes.forEach((theme, i) => {
    const card = document.createElement('div');
    card.className = 'theme-card' + (i === 0 ? ' active' : '');
    card.style.background = theme.bg;
    card.title = theme.label;
    card.innerHTML = `<span class="theme-label">${theme.label}</span>`;
    card.onclick = () => {
      document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.theme = theme;
      generatePoster();
      pushHistory();
    };
    grid.appendChild(card);
    if (i === 0) state.theme = theme;
  });
}

/* ═══════════════════════════════════════════════════════
   C O N T E N T   F I E L D S
═══════════════════════════════════════════════════════ */
function renderContentFields() {
  const container = document.getElementById('contentFields');
  container.innerHTML = '';
  state.fields = {};
  const fields = POSTER_FIELDS[state.posterType];
  fields.forEach(f => {
    state.fields[f.id] = f.default || '';
    const group = document.createElement('div');
    group.className = 'field-group';
    let input;
    if (f.type === 'textarea') { input = document.createElement('textarea'); input.rows = 3; }
    else { input = document.createElement('input'); input.type = f.type; }
    input.id = `field_${f.id}`;
    input.placeholder = f.ph || '';
    input.value = f.default || '';
    input.oninput = () => { state.fields[f.id] = input.value; debouncedGenerate(); };
    group.innerHTML = `<label for="field_${f.id}">${f.label}</label>`;
    group.appendChild(input);
    container.appendChild(group);
  });
  if (MULTI_TYPES.includes(state.posterType)) {
    container.appendChild(buildMultiPersonSection(state.posterType));
  }
}

/* ─── Build multi-person section ─── */
function buildMultiPersonSection(type) {
  const wrap = document.createElement('div');
  wrap.className = 'multi-person-section';
  wrap.id = `multiSection_${type}`;
  const cfg = { topper:{title:'👤 Toppers / Achievers',addLabel:'+ Add Topper',max:5}, birthday:{title:'🎂 Birthday People',addLabel:'+ Add Person',max:6}, sports:{title:'🏅 Players / Athletes',addLabel:'+ Add Player',max:6} }[type];
  wrap.innerHTML = `<div class="multi-section-header"><div class="multi-section-title">${cfg.title}</div><div class="multi-section-count"><span id="personCountNum_${type}">${state.multiPersons[type].length}</span> / ${cfg.max}</div></div>`;
  const list = document.createElement('div');
  list.id = `personList_${type}`; list.className = 'person-list';
  wrap.appendChild(list);
  const addBtn = document.createElement('button');
  addBtn.className = 'btn-add-person'; addBtn.id = `addPersonBtn_${type}`;
  addBtn.textContent = cfg.addLabel; addBtn.onclick = () => addPerson(type);
  wrap.appendChild(addBtn);
  renderPersonCards(type, list);
  return wrap;
}

function renderPersonCards(type, listEl) {
  if (!listEl) listEl = document.getElementById(`personList_${type}`);
  if (!listEl) return;
  listEl.innerHTML = '';
  state.multiPersons[type].forEach((p, idx) => listEl.appendChild(buildPersonCard(type, idx)));
  const n = document.getElementById(`personCountNum_${type}`);
  if (n) n.textContent = state.multiPersons[type].length;
  const ab = document.getElementById(`addPersonBtn_${type}`);
  if (ab) ab.disabled = state.multiPersons[type].length >= MAX_PERSONS[type];
}

function buildPersonCard(type, idx) {
  const p = state.multiPersons[type][idx];
  const card = document.createElement('div');
  card.className = 'person-card'; card.id = `personCard_${type}_${idx}`;
  const medal = RANK_MEDALS[idx] || `${idx+1}.`;
  const namePrev = (type==='topper'?p.name : type==='birthday'?p.name : p.player) || `Person ${idx+1}`;
  const len = state.multiPersons[type].length;

  const hdr = document.createElement('div'); hdr.className = 'person-card-header';
  hdr.innerHTML = `<div class="person-card-left"><span class="person-medal">${medal}</span><span class="person-card-name" id="pcName_${type}_${idx}">${esc(namePrev)}</span></div>`+
    `<div class="person-card-actions">`+
    (idx>0?`<button class="pc-move-btn" onclick="movePerson('${type}',${idx},-1)" title="Up">↑</button>`:'')+
    (idx<len-1?`<button class="pc-move-btn" onclick="movePerson('${type}',${idx},1)" title="Down">↓</button>`:'')+
    `<button class="pc-collapse-btn" onclick="togglePersonCard('${type}',${idx})" id="collapseBtn_${type}_${idx}">▼</button>`+
    (len>1?`<button class="pc-remove-btn" onclick="removePerson('${type}',${idx})" title="Remove">✕</button>`:'')+
    `</div>`;
  card.appendChild(hdr);

  const body = document.createElement('div'); body.className='person-card-body'; body.id=`pcBody_${type}_${idx}`;
  const photoThumb = p.photo ? `<img src="${p.photo}" class="pc-photo-preview"/>` : `<span>📷 Upload photo</span>`;
  const removePhotoBtn = p.photo ? `<button class="pc-remove-photo" onclick="removePersonPhoto('${type}',${idx})">✕ Remove</button>` : '';

  if (type==='topper') {
    body.innerHTML = `<div class="pc-row"><div class="pc-field"><label>Rank</label><input type="text" value="${esc(p.rank)}" placeholder="e.g. 1st Rank" oninput="updatePerson('topper',${idx},'rank',this.value)"/></div><div class="pc-field"><label>Score / %</label><input type="text" value="${esc(p.score)}" placeholder="e.g. 98.5%" oninput="updatePerson('topper',${idx},'score',this.value)"/></div></div>`+
      `<div class="pc-field"><label>Student Name</label><input type="text" value="${esc(p.name)}" placeholder="Full name" oninput="updatePerson('topper',${idx},'name',this.value);document.getElementById('pcName_topper_${idx}').textContent=this.value||'Person ${idx+1}'"/></div>`+
      `<div class="pc-field"><label>Subject / Stream</label><input type="text" value="${esc(p.subject)}" placeholder="e.g. Science Stream" oninput="updatePerson('topper',${idx},'subject',this.value)"/></div>`+
      `<div class="pc-field"><label>Photo (optional)</label><div class="pc-photo-upload" onclick="document.getElementById('pcPhoto_topper_${idx}').click()"><input type="file" accept="image/*" id="pcPhoto_topper_${idx}" style="display:none" onchange="handlePersonPhoto('topper',${idx},this)"/>${photoThumb}</div>${removePhotoBtn}</div>`;
  } else if (type==='birthday') {
    body.innerHTML = `<div class="pc-row"><div class="pc-field"><label>Name</label><input type="text" value="${esc(p.name)}" placeholder="Birthday person name" oninput="updatePerson('birthday',${idx},'name',this.value);document.getElementById('pcName_birthday_${idx}').textContent=this.value||'Person ${idx+1}'"/></div><div class="pc-field"><label>Age / Label</label><input type="text" value="${esc(p.age)}" placeholder="e.g. 21st Birthday" oninput="updatePerson('birthday',${idx},'age',this.value)"/></div></div>`+
      `<div class="pc-field"><label>Personal Message (optional)</label><textarea rows="2" placeholder="Individual message…" oninput="updatePerson('birthday',${idx},'msg',this.value)">${esc(p.msg)}</textarea></div>`+
      `<div class="pc-field"><label>Photo (optional)</label><div class="pc-photo-upload" onclick="document.getElementById('pcPhoto_birthday_${idx}').click()"><input type="file" accept="image/*" id="pcPhoto_birthday_${idx}" style="display:none" onchange="handlePersonPhoto('birthday',${idx},this)"/>${photoThumb}</div>${removePhotoBtn}</div>`;
  } else if (type==='sports') {
    body.innerHTML = `<div class="pc-row"><div class="pc-field"><label>Player / Team</label><input type="text" value="${esc(p.player)}" placeholder="Name" oninput="updatePerson('sports',${idx},'player',this.value);document.getElementById('pcName_sports_${idx}').textContent=this.value||'Person ${idx+1}'"/></div><div class="pc-field"><label>Achievement</label><input type="text" value="${esc(p.achievement)}" placeholder="e.g. 🥇 Gold" oninput="updatePerson('sports',${idx},'achievement',this.value)"/></div></div>`+
      `<div class="pc-row"><div class="pc-field"><label>Sport / Category</label><input type="text" value="${esc(p.sport)}" placeholder="e.g. 100m Sprint" oninput="updatePerson('sports',${idx},'sport',this.value)"/></div><div class="pc-field"><label>Score / Record</label><input type="text" value="${esc(p.score)}" placeholder="e.g. 9.87s" oninput="updatePerson('sports',${idx},'score',this.value)"/></div></div>`+
      `<div class="pc-field"><label>Photo (optional)</label><div class="pc-photo-upload" onclick="document.getElementById('pcPhoto_sports_${idx}').click()"><input type="file" accept="image/*" id="pcPhoto_sports_${idx}" style="display:none" onchange="handlePersonPhoto('sports',${idx},this)"/>${photoThumb}</div>${removePhotoBtn}</div>`;
  }
  card.appendChild(body);
  return card;
}

function addPerson(type) {
  if (state.multiPersons[type].length >= MAX_PERSONS[type]) { showToast(`Max ${MAX_PERSONS[type]} entries.`,'warning'); return; }
  const idx = state.multiPersons[type].length;
  if      (type==='topper')   state.multiPersons[type].push(defaultTopperPerson(idx));
  else if (type==='birthday') state.multiPersons[type].push(defaultBdayPerson());
  else if (type==='sports')   state.multiPersons[type].push(defaultSportsPerson(idx));
  renderPersonCards(type); generatePoster();
  setTimeout(() => { const c=document.getElementById(`personCard_${type}_${idx}`); if(c) c.scrollIntoView({behavior:'smooth',block:'nearest'}); }, 60);
}

function removePerson(type, idx) {
  if (state.multiPersons[type].length <= 1) return;
  state.multiPersons[type].splice(idx, 1);
  renderPersonCards(type); generatePoster();
}

function movePerson(type, idx, dir) {
  const arr = state.multiPersons[type], ni = idx + dir;
  if (ni<0||ni>=arr.length) return;
  [arr[idx],arr[ni]] = [arr[ni],arr[idx]];
  renderPersonCards(type); generatePoster();
}

function updatePerson(type, idx, field, value) {
  state.multiPersons[type][idx][field] = value; debouncedGenerate();
}

function togglePersonCard(type, idx) {
  const body=document.getElementById(`pcBody_${type}_${idx}`), btn=document.getElementById(`collapseBtn_${type}_${idx}`);
  if (!body) return;
  const collapsed = body.style.display==='none';
  body.style.display = collapsed?'block':'none';
  if (btn) btn.textContent = collapsed?'▼':'▶';
}

function handlePersonPhoto(type, idx, input) {
  const file=input.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{state.multiPersons[type][idx].photo=ev.target.result;renderPersonCards(type);generatePoster();};
  reader.readAsDataURL(file);
}

function removePersonPhoto(type, idx) {
  state.multiPersons[type][idx].photo=null; renderPersonCards(type); generatePoster();
}

let _genTimer = null;
function debouncedGenerate() {
  clearTimeout(_genTimer);
  _genTimer = setTimeout(generatePoster, 280);
}

/* ═══════════════════════════════════════════════════════
   S I Z E
═══════════════════════════════════════════════════════ */
function selectSize(size, el) {
  state.size = size;
  document.querySelectorAll('.size-card').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  applyCanvasSize();
  generatePoster();
}
function applyCanvasSize() {
  const { w, h } = SIZES[state.size];
  const canvas = document.getElementById('posterCanvas');
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
}

/* ═══════════════════════════════════════════════════════
   L A Y O U T
═══════════════════════════════════════════════════════ */
function selectLayout(layout, el) {
  state.layout = layout;
  document.querySelectorAll('.layout-card').forEach(c => c.classList.remove('active'));
  if (el) el.classList.add('active');
  generatePoster();
}

/* ═══════════════════════════════════════════════════════
   Z O O M   &   F U L L S C R E E N
═══════════════════════════════════════════════════════ */
function zoomIn() { state.zoom = Math.min(1.5, state.zoom + 0.1); applyZoom(); }
function zoomOut() { state.zoom = Math.max(0.2, state.zoom - 0.1); applyZoom(); }
function applyZoom() {
  document.getElementById('posterCanvas').style.transform = `scale(${state.zoom})`;
  document.getElementById('zoomLevel').textContent = Math.round(state.zoom * 100) + '%';
}
function toggleFullscreen() {
  const wrapper = document.getElementById('canvasWrapper');
  if (!document.fullscreenElement) wrapper.requestFullscreen?.();
  else document.exitFullscreen?.();
}

/* ═══════════════════════════════════════════════════════
   F O R M A T T I N G
═══════════════════════════════════════════════════════ */
function applyFormatting() {
  state.fontFamily = document.getElementById('fontFamily').value;
  state.headingColor = document.getElementById('headingColor').value;
  state.bodyColor = document.getElementById('bodyColor').value;
  state.headingSize = parseInt(document.getElementById('headingSize').value);
  state.bodySize = parseInt(document.getElementById('bodySize').value);
  state.textShadow = document.getElementById('textShadow').checked;
  state.bgOpacity = parseInt(document.getElementById('bgOpacity').value);
  state.bgOverlayColor = document.getElementById('bgOverlayColor').value;
  updateSliderBg('headingSize', state.headingSize, 14, 72);
  updateSliderBg('bodySize', state.bodySize, 10, 36);
  updateSliderBg('bgOpacity', state.bgOpacity, 0, 100);
  generatePoster();
}
function setColor(inputId, color) { document.getElementById(inputId).value = color; applyFormatting(); }
function setAlign(align, el) {
  state.textAlign = align;
  document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  generatePoster();
}
function toggleDeco(type, el) {
  const key = `deco${type.charAt(0).toUpperCase() + type.slice(1)}`;
  state[key] = !state[key];
  el.classList.toggle('active');
  generatePoster();
}

/* ═══════════════════════════════════════════════════════
   B A C K G R O U N D   P A T T E R N
═══════════════════════════════════════════════════════ */
function selectPattern(pattern, el) {
  state.bgPattern = pattern;
  document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  generatePoster();
}

const PATTERNS = {
  none: '',
  dots: 'radial-gradient(circle, rgba(255,255,255,0.12) 1.5px, transparent 1.5px)',
  grid: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
  diagonal: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.07) 0, rgba(255,255,255,0.07) 1px, transparent 0, transparent 50%)',
  hexagon: 'radial-gradient(circle at 100% 150%, rgba(255,255,255,0.08) 24%, transparent 25%), radial-gradient(circle at 0 150%, rgba(255,255,255,0.08) 24%, transparent 25%), radial-gradient(circle at 50% 100%, rgba(255,255,255,0.1) 20%, transparent 21%)',
  waves: 'repeating-radial-gradient(circle at 50% 50%, transparent 0, rgba(255,255,255,0.06) 20px)',
};
const PATTERN_SIZES = {
  none: '',
  dots: '18px 18px',
  grid: '24px 24px',
  diagonal: '14px 14px',
  hexagon: '60px 60px',
  waves: '60px 60px',
};

/* ═══════════════════════════════════════════════════════
   I M A G E   U P L O A D  &  S H A P E S
═══════════════════════════════════════════════════════ */
function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    state.uploadedImageURL = ev.target.result;
    const prev = document.getElementById('uploadedImagePreview');
    prev.src = ev.target.result;
    prev.style.display = 'block';
    document.getElementById('uploadPlaceholder').style.display = 'none';
    document.getElementById('imageControls').style.display = 'flex';
    generatePoster();
  };
  reader.readAsDataURL(file);
}
function dragOver(e) { e.preventDefault(); document.getElementById('uploadZone').style.borderColor = '#6366f1'; }
function dropImage(e) {
  e.preventDefault();
  document.getElementById('uploadZone').style.borderColor = '';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) handleImageUpload({ target: { files: [file] } });
}
function updateImageSize(val) {
  state.imageSize = parseInt(val);
  document.getElementById('imageSizeVal').textContent = val + 'px';
  updateSliderBg('imageSize', val, 40, 280);
  generatePoster();
}
function setImagePosition(pos) { state.imagePosition = pos; generatePoster(); }
function setImageShape(shape, el) {
  state.imageShape = shape;
  document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  generatePoster();
}
function setImageFilter(filter) { state.imageFilter = filter; generatePoster(); }
function setImageBorder(val) { state.imageBorder = val; generatePoster(); }
function removeImage() {
  state.uploadedImageURL = null;
  document.getElementById('uploadedImagePreview').style.display = 'none';
  document.getElementById('uploadPlaceholder').style.display = 'flex';
  document.getElementById('imageControls').style.display = 'none';
  document.getElementById('imageInput').value = '';
  generatePoster();
}

/* BG Image Upload */
function handleBgImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    state.bgImageURL = ev.target.result;
    document.getElementById('bgImgStatus').textContent = '✅ ' + file.name;
    document.getElementById('removeBgImgBtn').style.display = 'block';
    generatePoster();
  };
  reader.readAsDataURL(file);
}
function removeBgImage() {
  state.bgImageURL = null;
  document.getElementById('bgImgStatus').textContent = '📁 Click to upload background image';
  document.getElementById('removeBgImgBtn').style.display = 'none';
  document.getElementById('bgImageInput').value = '';
  generatePoster();
}

/* ═══════════════════════════════════════════════════════
   W A T E R M A R K   &   Q R
═══════════════════════════════════════════════════════ */
function toggleWatermark(enabled) {
  state.watermarkEnabled = enabled;
  document.getElementById('watermarkText').disabled = !enabled;
  generatePoster();
}
function updateWatermark(text) { state.watermarkText = text; generatePoster(); }

function toggleQR(enabled) {
  state.qrEnabled = enabled;
  document.getElementById('qrText').disabled = !enabled;
  generatePoster();
}
function updateQRText(text) { state.qrText = text; generatePoster(); }

function renderWatermark() {
  const layer = document.getElementById('posterWatermark');
  layer.innerHTML = '';
  if (!state.watermarkEnabled || !state.watermarkText) return;
  const div = document.createElement('div');
  div.className = 'poster-watermark-text';
  div.textContent = state.watermarkText;
  layer.appendChild(div);
}

function renderQR() {
  const layer = document.getElementById('posterQR');
  layer.innerHTML = '';
  if (!state.qrEnabled || !state.qrText) return;
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:absolute; bottom:14px; right:14px; background:rgba(255,255,255,0.95); padding:5px; border-radius:6px;';
  wrap.id = '_qrInner';
  layer.appendChild(wrap);
  if (typeof QRCode !== 'undefined') {
    try {
      new QRCode(wrap, { text: state.qrText, width: 72, height: 72, colorDark: '#000', colorLight: '#fff', correctLevel: QRCode.CorrectLevel.M });
    } catch(e) { wrap.innerHTML = '<div style="width:72px;height:72px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;color:#000;">QR</div>'; }
  }
}

/* ═══════════════════════════════════════════════════════
   ★  G E N E R A T E   P O S T E R  ★
═══════════════════════════════════════════════════════ */
function generatePoster() {
  const theme = state.theme || THEMES[state.posterType][0];
  applyCanvasSize();

  /* — Background — */
  const bg = document.getElementById('posterBg');
  if (state.bgImageURL) {
    bg.style.cssText = `position:absolute; inset:0; background:url('${state.bgImageURL}') center/cover no-repeat;`;
  } else {
    bg.style.cssText = `position:absolute; inset:0; background:${theme.bg};`;
  }

  /* — Pattern Overlay — */
  const patLayer = document.getElementById('posterPattern');
  if (state.bgPattern !== 'none' && PATTERNS[state.bgPattern]) {
    patLayer.style.cssText = `position:absolute; inset:0; background-image:${PATTERNS[state.bgPattern]}; background-size:${PATTERN_SIZES[state.bgPattern]}; opacity:0.7;`;
  } else {
    patLayer.style.cssText = 'position:absolute; inset:0;';
  }

  /* — Decorations — */
  renderDecorations(theme);

  /* — Uploaded Image — */
  renderUploadedImage();

  /* — Content — */
  const content = document.getElementById('posterContent');
  content.innerHTML = '';
  const shadow = state.textShadow ? 'text-shadow: 0 2px 12px rgba(0,0,0,0.6), 0 0 30px rgba(0,0,0,0.4);' : '';
  const baseStyle = `font-family:'${state.fontFamily}',sans-serif; text-align:${state.textAlign}; ${shadow}`;

  switch (state.posterType) {
    case 'topper':    renderTopperContent(content, theme, baseStyle); break;
    case 'event':     renderEventContent(content, theme, baseStyle); break;
    case 'birthday':  renderBirthdayContent(content, theme, baseStyle); break;
    case 'wedding':   renderWeddingContent(content, theme, baseStyle); break;
    case 'sports':    renderSportsContent(content, theme, baseStyle); break;
    case 'quote':     renderQuoteContent(content, theme, baseStyle); break;
    case 'corporate': renderCorporateContent(content, theme, baseStyle); break;
    case 'custom':    renderCustomContent(content, theme, baseStyle); break;
  }

  /* — Watermark — */
  renderWatermark();

  /* — QR Code — */
  renderQR();
}

/* ═══════════════════════════════════════════════════════
   I M A G E   R E N D E R I N G   (Shapes + Filters)
═══════════════════════════════════════════════════════ */
function getImgStyle(size, isInline) {
  const s = size || state.imageSize;
  const borderStyle = state.imageBorder ? `border:3px solid rgba(255,255,255,0.5);` : '';
  const filterStyle = state.imageFilter !== 'none' ? `filter:${state.imageFilter};` : '';
  let shapeStyle = '';
  let w = s, h = s;
  switch (state.imageShape) {
    case 'circle':
      shapeStyle = `border-radius:50%;`; w = s; h = s; break;
    case 'square':
      shapeStyle = `border-radius:10px;`; w = s; h = s; break;
    case 'rect-land':
      shapeStyle = `border-radius:10px;`; w = Math.round(s * 1.6); h = s; break;
    case 'rect-port':
      shapeStyle = `border-radius:10px;`; w = s; h = Math.round(s * 1.35); break;
  }
  return {
    css: `width:${w}px; height:${h}px; object-fit:cover; ${shapeStyle} ${borderStyle} ${filterStyle} box-shadow:0 6px 24px rgba(0,0,0,0.55); display:block; flex-shrink:0;`,
    w, h
  };
}

function imgTag(extraStyle) {
  const { css } = getImgStyle(state.imageSize);
  return `<img src="${state.uploadedImageURL}" class="poster-uploaded-img" style="${css} ${extraStyle || ''}" />`;
}

function renderUploadedImage() {
  const layer = document.getElementById('posterImgLayer');
  layer.innerHTML = '';
  if (!state.uploadedImageURL) return;
  if (state.imagePosition === 'center') return;

  const { css, w, h } = getImgStyle(state.imageSize);
  const posMap = {
    'top-left':      `position:absolute; top:16px; left:16px;`,
    'top-center':    `position:absolute; top:16px; left:50%; transform:translateX(-50%);`,
    'top-right':     `position:absolute; top:16px; right:16px;`,
    'bottom-left':   `position:absolute; bottom:16px; left:16px;`,
    'bottom-center': `position:absolute; bottom:16px; left:50%; transform:translateX(-50%);`,
    'bottom-right':  `position:absolute; bottom:16px; right:16px;`,
  };
  const img = document.createElement('img');
  img.src = state.uploadedImageURL;
  img.className = 'poster-uploaded-img';
  img.style.cssText = `${posMap[state.imagePosition] || posMap['top-center']} ${css}`;
  layer.appendChild(img);
}

/* ═══════════════════════════════════════════════════════
   P O S T E R   R E N D E R E R S
═══════════════════════════════════════════════════════ */

/* TOPPER – multi-person */
function renderTopperContent(container, theme, baseStyle) {
  const f=state.fields, hc=state.headingColor, bc=state.bodyColor, hs=state.headingSize, bs=state.bodySize;
  const persons=state.multiPersons.topper;
  const dateStr=f.date?formatDate(f.date):'';
  const rankColors=['#FFD700','#C0C0C0','#CD7F32','#a78bfa','#67e8f9'];

  if (persons.length===1) {
    const p=persons[0];
    container.innerHTML=`<div class="poster-layout-centered" style="${baseStyle}">
      <div class="p-org" style="color:${theme.accent2};font-size:${Math.max(10,bs-2)}px;">${esc(f.org||'Organization')}</div>
      <div class="p-divider"></div><div class="p-logo">🏆</div>
      <div class="p-title" style="color:${hc};font-size:${hs}px;background:linear-gradient(135deg,${theme.accent},${theme.accent2});-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${esc(f.title||'Achievement Award')}</div>
      <div class="p-badge" style="border-color:${theme.accent};background:rgba(255,255,255,0.1);">CONGRATULATIONS</div>
      ${p.photo?`<img src="${p.photo}" style="width:110px;height:110px;border-radius:50%;object-fit:cover;border:3px solid ${theme.accent};box-shadow:0 4px 20px rgba(0,0,0,0.5);"/>` :''}
      <div class="p-name" style="color:${hc};font-size:${Math.round(hs*0.85)}px;">${esc(p.name||'Student Name')}</div>
      <div class="p-rank" style="color:${theme.accent2};font-size:${bs+2}px;">${esc(p.rank||'1st Rank')}</div>
      <div class="p-score" style="color:${theme.accent};font-size:${Math.min(72,hs*1.4)}px;font-weight:900;">${esc(p.score||'98%')}</div>
      <div class="p-divider"></div>
      <div style="color:${bc};font-size:${bs-1}px;">${esc(f.class||'')}</div>
      ${p.subject?`<div style="color:${bc};font-size:${bs-2}px;opacity:0.85;">${esc(p.subject)}</div>`:''}
      <div class="p-divider"></div>
      <div class="p-quote" style="color:${bc};font-size:${bs}px;">${multilineEsc(f.msg||'Congratulations!')}</div>
    </div>`;
    return;
  }

  /* Multi-topper */
  const top=persons[0]; const rest=persons.slice(1);
  const restRows=rest.map((p,i)=>`
    <div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(255,255,255,0.06);border-radius:10px;border:1px solid ${theme.accent}22;">
      <span style="font-size:18px;width:24px;text-align:center;">${RANK_MEDALS[i+1]||`${i+2}.`}</span>
      ${p.photo?`<img src="${p.photo}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid ${rankColors[i+1]||'rgba(255,255,255,0.3)'};flex-shrink:0;"/>`:`<div style="width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">👤</div>`}
      <div style="flex:1;min-width:0;">
        <div style="color:${hc};font-size:${bs+1}px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(p.name||'—')}</div>
        ${p.subject?`<div style="color:${bc};font-size:${Math.max(9,bs-3)}px;opacity:0.75;">${esc(p.subject)}</div>`:''}
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div style="color:${rankColors[i+1]||theme.accent};font-size:${bs+2}px;font-weight:900;">${esc(p.score||'—')}</div>
        ${p.rank?`<div style="color:${theme.accent2};font-size:${Math.max(9,bs-2)}px;">${esc(p.rank)}</div>`:''}
      </div>
    </div>`).join('');

  container.innerHTML=`<div class="poster-layout-centered" style="${baseStyle};padding:16px 18px;gap:6px;">
    <div class="p-org" style="color:${theme.accent2};font-size:${Math.max(9,bs-3)}px;">${esc(f.org||'Organization')}</div>
    <div class="p-title" style="font-size:${Math.round(hs*0.8)}px;background:linear-gradient(135deg,${theme.accent},${theme.accent2});-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${esc(f.title||'Top Achievers')}</div>
    ${f.class?`<div style="color:${bc};font-size:${bs-1}px;opacity:0.8;">${esc(f.class)}</div>`:''}
    <div class="p-divider" style="background:${theme.accent};opacity:0.5;width:50%;margin:2px auto;"></div>
    <div style="background:linear-gradient(135deg,${theme.accent}22,${theme.accent2}11);border:1px solid ${theme.accent}44;border-radius:14px;padding:12px 16px;width:90%;display:flex;flex-direction:column;align-items:center;gap:6px;">
      <span style="font-size:28px;">🏆</span>
      ${top.photo?`<img src="${top.photo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid ${theme.accent};box-shadow:0 4px 16px rgba(0,0,0,0.5);" />`:`<div style="width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;font-size:30px;">👤</div>`}
      <div style="color:${hc};font-size:${Math.round(hs*0.7)}px;font-weight:800;">${esc(top.name||'Name')}</div>
      <div style="color:${theme.accent};font-size:${Math.min(52,hs*1.1)}px;font-weight:900;line-height:1;">${esc(top.score||'—')}</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;align-items:center;">
        ${top.rank?`<span style="color:${theme.accent2};font-size:${bs}px;">${esc(top.rank)}</span>`:''}
        ${top.subject?`<span style="color:${bc};font-size:${bs-1}px;opacity:0.8;">• ${esc(top.subject)}</span>`:''}
      </div>
    </div>
    <div style="width:92%;display:flex;flex-direction:column;gap:4px;">${restRows}</div>
    ${dateStr?`<div style="color:${bc};font-size:${Math.max(9,bs-2)}px;opacity:0.75;">📅 ${dateStr}</div>`:''}
    <div class="p-divider" style="opacity:0.25;"></div>
    <div class="p-quote" style="color:${bc};font-size:${Math.max(10,bs-1)}px;max-width:90%;">${multilineEsc(f.msg||'Congratulations to all achievers!')}</div>
  </div>`;
}

/* EVENT */
function renderEventContent(container, theme, baseStyle) {
  const f = state.fields, hc = state.headingColor, bc = state.bodyColor, hs = state.headingSize, bs = state.bodySize;
  const dateStr = f.date ? formatDate(f.date) : '', timeStr = f.time ? formatTime(f.time) : '';
  const hasImg = state.uploadedImageURL && state.imagePosition === 'center';
  container.innerHTML = `
  <div class="poster-layout-centered" style="${baseStyle}">
    <div class="p-org" style="color:${theme.accent2}; font-size:${Math.max(9,bs-3)}px;">${esc(f.org||'Organization')}</div>
    <div style="color:${bc}; font-size:${bs-1}px; letter-spacing:3px; text-transform:uppercase; opacity:0.7;">PRESENTS</div>
    ${hasImg ? imgTag() : ''}
    <div class="p-title" style="color:${hc}; font-size:${hs}px; line-height:1.1;">${esc(f.title||'Event Name')}</div>
    <div style="color:${theme.accent}; font-size:${Math.round(hs*0.55)}px; font-style:italic;">${esc(f.subtitle||'')}</div>
    <div class="p-divider" style="background:${theme.accent}; opacity:0.6; width:80%;"></div>
    <div style="display:flex; gap:20px; justify-content:center; flex-wrap:wrap; align-items:center;">
      ${dateStr ? `<div style="color:${bc}; font-size:${bs+2}px;">📅 <b>${dateStr}</b></div>` : ''}
      ${timeStr ? `<div style="color:${bc}; font-size:${bs+2}px;">🕐 <b>${timeStr}</b></div>` : ''}
    </div>
    ${f.venue ? `<div style="color:${theme.accent2}; font-size:${bs}px;">📍 ${esc(f.venue)}</div>` : ''}
    <div class="p-divider" style="opacity:0.3;"></div>
    <div class="p-body" style="color:${bc}; font-size:${bs}px; max-width:85%;">${multilineEsc(f.desc||'Event description.')}</div>
    ${f.contact ? `<div class="p-badge" style="color:${hc}; border-color:${theme.accent}; font-size:${bs-2}px;">${esc(f.contact)}</div>` : ''}
  </div>`;
}

/* BIRTHDAY – multi-person */
function renderBirthdayContent(container, theme, baseStyle) {
  const f=state.fields, hc=state.headingColor, bc=state.bodyColor, hs=state.headingSize, bs=state.bodySize;
  const persons=state.multiPersons.birthday;
  const dateStr=f.date?formatDate(f.date):'', timeStr=f.time?formatTime(f.time):'';

  if (persons.length===1) {
    const p=persons[0];
    container.innerHTML=`<div class="poster-layout-centered" style="${baseStyle}">
      <div class="p-emoji-row">🎊 🎂 🎉</div>
      <div style="color:${theme.accent2};font-size:${bs+2}px;font-weight:700;letter-spacing:2px;">WISHING YOU A VERY HAPPY</div>
      <div class="p-title" style="color:${hc};font-size:${hs+8}px;font-weight:900;line-height:1.0;">Birthday!</div>
      ${p.age?`<div style="color:${theme.accent};font-size:${Math.round(hs*0.6)}px;font-weight:800;">${esc(p.age)}</div>`:''}
      <div class="p-divider" style="background:${theme.accent};opacity:0.5;"></div>
      ${p.photo?`<img src="${p.photo}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid ${theme.accent};box-shadow:0 4px 20px rgba(0,0,0,0.5);" />` : ''}
      <div class="p-name" style="color:${hc};font-size:${Math.round(hs*0.85)}px;">${esc(p.name||'Birthday Person')}</div>
      <div class="p-quote" style="color:${bc};font-size:${bs}px;max-width:85%;">${multilineEsc(p.msg||f.shared_msg||'Wishing you the best!')}</div>
      ${(dateStr||timeStr||f.venue)?`<div class="p-divider" style="opacity:0.3;"></div><div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;font-size:${bs-1}px;color:${bc};">${dateStr?`<span>🎂 <b>${dateStr}</b></span>`:``}${timeStr?`<span>🕐 <b>${timeStr}</b></span>`:``}${f.venue?`<span>📍 ${esc(f.venue)}</span>`:``}</div>`:''}
      <div class="p-divider" style="opacity:0.3;"></div>
      <div style="color:${theme.accent2};font-size:${bs-1}px;">With Love from ${esc(f.from||'Your Friends')}</div>
      <div class="p-emoji-row" style="font-size:22px;letter-spacing:5px;">🌟 💫 ✨</div>
    </div>`;
    return;
  }

  /* Multi-birthday */
  const cols=persons.length<=3?persons.length:Math.min(3,Math.ceil(persons.length/2));
  const cards=persons.map((p,i)=>`
    <div style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.22);border-radius:12px;padding:10px 8px;display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0;">
      ${p.photo?`<img src="${p.photo}" style="width:62px;height:62px;border-radius:50%;object-fit:cover;border:2px solid ${theme.accent};box-shadow:0 3px 10px rgba(0,0,0,0.4);"/>`:`<div style="width:62px;height:62px;border-radius:50%;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:24px;">🎂</div>`}
      <div style="color:${hc};font-size:${bs+1}px;font-weight:800;text-align:center;word-break:break-word;">${esc(p.name||'—')}</div>
      ${p.age?`<div style="color:${theme.accent};font-size:${Math.max(9,bs-2)}px;font-weight:700;">${esc(p.age)}</div>`:''}
      ${p.msg?`<div style="color:${bc};font-size:${Math.max(9,bs-3)}px;opacity:0.85;text-align:center;font-style:italic;">${esc(p.msg)}</div>`:''}
    </div>`).join('');

  container.innerHTML=`<div class="poster-layout-centered" style="${baseStyle};padding:12px 16px;gap:7px;">
    <div class="p-emoji-row" style="font-size:22px;letter-spacing:5px;">🎊 🎂 🎉 🎁 🎈</div>
    <div style="color:${theme.accent2};font-size:${bs+2}px;font-weight:700;letter-spacing:2px;">WISHING YOU ALL A VERY HAPPY</div>
    <div class="p-title" style="color:${hc};font-size:${hs+4}px;font-weight:900;line-height:1.0;">Birthday!</div>
    <div class="p-divider" style="background:${theme.accent};opacity:0.5;width:45%;margin:2px auto;"></div>
    <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:7px;width:96%;">${cards}</div>
    <div class="p-divider" style="opacity:0.3;"></div>
    <div class="p-quote" style="color:${bc};font-size:${bs}px;max-width:88%;font-style:italic;">${multilineEsc(f.shared_msg||'Wishing you all the very best!')}</div>
    ${(dateStr||timeStr||f.venue)?`<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;font-size:${bs-1}px;color:${bc};">${dateStr?`<span>🎂 <b>${dateStr}</b></span>`:``}${timeStr?`<span>🕐 <b>${timeStr}</b></span>`:``}${f.venue?`<span>📍 ${esc(f.venue)}</span>`:``}</div>`:''}
    <div style="color:${theme.accent2};font-size:${bs-1}px;">With Love from ${esc(f.from||'Your Friends')}</div>
    <div class="p-emoji-row" style="font-size:19px;letter-spacing:5px;">🌟 💫 ✨ 🥳 🎶</div>
  </div>`;
}

/* WEDDING */
function renderWeddingContent(container, theme, baseStyle) {
  const f = state.fields, hc = state.headingColor, bc = state.bodyColor, hs = state.headingSize, bs = state.bodySize;
  const dateStr = f.date ? formatDate(f.date) : '', timeStr = f.time ? formatTime(f.time) : '';
  const hasImg = state.uploadedImageURL && state.imagePosition === 'center';
  container.innerHTML = `
  <div class="poster-layout-centered" style="${baseStyle}">
    <div style="color:${theme.accent}; font-size:${bs-1}px; letter-spacing:4px; text-transform:uppercase; opacity:0.8;">~ Wedding Invitation ~</div>
    <div style="font-size:36px;">💍</div>
    ${hasImg ? imgTag() : ''}
    <div class="p-name" style="color:${hc}; font-size:${Math.round(hs*0.85)}px; font-style:italic;">${esc(f.bride||'Bride Name')}</div>
    <div style="color:${theme.accent}; font-size:${Math.round(hs*0.5)}px; font-weight:300; letter-spacing:3px;">&amp;</div>
    <div class="p-name" style="color:${hc}; font-size:${Math.round(hs*0.85)}px; font-style:italic;">${esc(f.groom||'Groom Name')}</div>
    <div class="p-divider" style="background:${theme.accent}; opacity:0.5; width:70%;"></div>
    <div class="p-quote" style="color:${bc}; font-size:${bs}px; max-width:82%;">${multilineEsc(f.msg||'Together with their families, joyfully invite you.')}</div>
    <div class="p-divider" style="opacity:0.3;"></div>
    <div style="display:flex; gap:18px; flex-wrap:wrap; justify-content:center; font-size:${bs+1}px; color:${bc};">
      ${dateStr ? `<span>📅 <b>${dateStr}</b></span>` : ''}
      ${timeStr ? `<span>🕐 <b>${timeStr}</b></span>` : ''}
    </div>
    ${f.venue ? `<div style="color:${theme.accent2}; font-size:${bs+1}px; font-weight:700;">🏛 ${esc(f.venue)}</div>` : ''}
    ${f.location ? `<div style="color:${bc}; font-size:${bs-1}px; opacity:0.8;">📍 ${esc(f.location)}</div>` : ''}
    ${f.rsvp ? `<div class="p-badge" style="color:${hc}; border-color:${theme.accent}; font-size:${bs-2}px; margin-top:4px;">${esc(f.rsvp)}</div>` : ''}
  </div>`;
}

/* SPORTS – multi-person with podium */
function renderSportsContent(container, theme, baseStyle) {
  const f=state.fields, hc=state.headingColor, bc=state.bodyColor, hs=state.headingSize, bs=state.bodySize;
  const persons=state.multiPersons.sports;
  const dateStr=f.date?formatDate(f.date):'';
  const podiumColors=['#FFD700','#C0C0C0','#CD7F32'];

  if (persons.length===1) {
    const p=persons[0];
    container.innerHTML=`<div class="poster-layout-centered" style="${baseStyle}">
      <div class="p-org" style="color:${theme.accent2};font-size:${Math.max(9,bs-2)}px;">${esc(f.org||'Sports Academy')}</div>
      <div style="font-size:52px;">🏅</div>
      ${p.photo?`<img src="${p.photo}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid ${theme.accent};box-shadow:0 4px 20px rgba(0,0,0,0.5);" />` : ''}
      <div class="p-name" style="color:${hc};font-size:${Math.round(hs*0.85)}px;">${esc(p.player||'Player / Team')}</div>
      <div class="p-title" style="color:${theme.accent};font-size:${Math.round(hs*0.65)}px;font-weight:800;">${esc(p.achievement||'Gold Medalist')}</div>
      <div class="p-divider" style="background:${theme.accent};opacity:0.5;width:60%;"></div>
      ${p.sport?`<div style="color:${bc};font-size:${bs+2}px;font-weight:600;">${esc(p.sport)}</div>`:''}
      ${p.score?`<div class="p-score" style="color:${theme.accent};font-size:${Math.min(72,hs*1.4)}px;font-weight:900;">${esc(p.score)}</div>`:''}
      <div class="p-title" style="color:${hc};font-size:${Math.round(hs*0.7)}px;line-height:1.1;">${esc(f.title||'Championship')}</div>
      ${dateStr?`<div style="color:${bc};font-size:${bs-1}px;opacity:0.8;">📅 ${dateStr}</div>`:''}
      <div class="p-divider" style="opacity:0.3;"></div>
      <div class="p-quote" style="color:${bc};font-size:${bs}px;max-width:82%;">${multilineEsc(f.msg||'Champions are built, not born.')}</div>
    </div>`;
    return;
  }

  /* Multi-sports: podium for top-3, list for rest */
  const podiumPeople=persons.slice(0,3);
  const restPeople=persons.slice(3);
  /* arrange podium order: 2nd | 1st | 3rd */
  const podiumOrder=podiumPeople.length===1?[0]:podiumPeople.length===2?[1,0]:[1,0,2];
  const podiumHeights=['70px','90px','58px'];
  const podiumCols=podiumOrder.map((pi,colIdx)=>{
    const p=podiumPeople[pi]; if(!p) return '';
    const sz=pi===0?'68px':'52px';
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;">
      ${p.photo?`<img src="${p.photo}" style="width:${sz};height:${sz};border-radius:50%;object-fit:cover;border:2px solid ${podiumColors[pi]||theme.accent};box-shadow:0 3px 10px rgba(0,0,0,0.5);" />`:`<div style="width:${sz};height:${sz};border-radius:50%;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;font-size:${pi===0?'26px':'20px'};">👤</div>`}
      <div style="color:${hc};font-size:${pi===0?bs+1:bs}px;font-weight:800;text-align:center;word-break:break-word;">${esc(p.player||'—')}</div>
      ${p.achievement?`<div style="color:${podiumColors[pi]||theme.accent};font-size:${Math.max(9,bs-2)}px;font-weight:700;text-align:center;">${esc(p.achievement)}</div>`:''}
      ${p.sport?`<div style="color:${bc};font-size:${Math.max(8,bs-3)}px;opacity:0.8;text-align:center;">${esc(p.sport)}</div>`:''}
      ${p.score?`<div style="color:${theme.accent};font-size:${pi===0?bs+2:bs}px;font-weight:900;">${esc(p.score)}</div>`:''}
      <div style="width:100%;background:${podiumColors[pi]||theme.accent}33;border-top:3px solid ${podiumColors[pi]||theme.accent};height:${podiumHeights[colIdx]||'58px'};border-radius:4px 4px 0 0;display:flex;align-items:flex-start;justify-content:center;padding-top:5px;">
        <span style="font-size:${pi===0?'28px':'22px'};">${RANK_MEDALS[pi]}</span>
      </div>
    </div>`;
  }).join('');

  const restRows=restPeople.map((p,i)=>`
    <div style="display:flex;align-items:center;gap:7px;padding:5px 8px;background:rgba(255,255,255,0.06);border-radius:8px;">
      <span style="font-size:15px;width:22px;text-align:center;">${RANK_MEDALS[i+3]||`${i+4}.`}</span>
      ${p.photo?`<img src="${p.photo}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:1px solid rgba(255,255,255,0.3);" />`:''}
      <div style="flex:1;min-width:0;">
        <div style="color:${hc};font-size:${bs}px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(p.player||'—')}</div>
        <div style="color:${bc};font-size:${Math.max(9,bs-2)}px;opacity:0.75;">${[p.sport,p.achievement].filter(Boolean).map(esc).join(' · ')}</div>
      </div>
      ${p.score?`<div style="color:${theme.accent};font-size:${bs+1}px;font-weight:900;flex-shrink:0;">${esc(p.score)}</div>`:''}
    </div>`).join('');

  container.innerHTML=`<div class="poster-layout-centered" style="${baseStyle};padding:10px 14px;gap:5px;">
    <div class="p-org" style="color:${theme.accent2};font-size:${Math.max(9,bs-3)}px;">${esc(f.org||'Sports Academy')}</div>
    <div class="p-title" style="font-size:${Math.round(hs*0.72)}px;font-weight:900;line-height:1.1;background:linear-gradient(135deg,${theme.accent},${theme.accent2});-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${esc(f.title||'Sports Championship')}</div>
    ${dateStr?`<div style="color:${bc};font-size:${Math.max(9,bs-2)}px;opacity:0.8;">📅 ${dateStr}</div>`:''}
    <div class="p-divider" style="background:${theme.accent};opacity:0.4;width:45%;margin:2px auto;"></div>
    <div style="display:flex;align-items:flex-end;gap:5px;width:96%;margin-bottom:2px;">${podiumCols}</div>
    ${restPeople.length?`<div style="width:93%;display:flex;flex-direction:column;gap:4px;">${restRows}</div>`:''}
    <div class="p-divider" style="opacity:0.25;"></div>
    <div class="p-quote" style="color:${bc};font-size:${Math.max(9,bs-1)}px;max-width:90%;font-style:italic;">${multilineEsc(f.msg||'Champions are built, not born.')}</div>
  </div>`;
}

/* QUOTE */
function renderQuoteContent(container, theme, baseStyle) {
  const f = state.fields, hc = state.headingColor, bc = state.bodyColor, hs = state.headingSize, bs = state.bodySize;
  const hasImg = state.uploadedImageURL && state.imagePosition === 'center';
  container.innerHTML = `
  <div class="poster-layout-centered" style="${baseStyle}">
    <div style="color:${theme.accent}; font-size:80px; font-weight:900; opacity:0.18; line-height:0.8; font-family:Georgia,serif;">"</div>
    ${hasImg ? imgTag() : ''}
    <div style="color:${hc}; font-size:${hs}px; font-weight:700; line-height:1.3; max-width:88%; font-style:italic;">${multilineEsc(f.quote||'Your inspiring quote goes here.')}</div>
    <div style="color:${theme.accent}; font-size:80px; font-weight:900; opacity:0.18; line-height:0.5; align-self:flex-end; font-family:Georgia,serif;">"</div>
    <div class="p-divider" style="background:${theme.accent}; opacity:0.5; width:40%;"></div>
    ${f.author ? `<div style="color:${theme.accent2}; font-size:${bs+2}px; font-weight:600; letter-spacing:1px;">${esc(f.author)}</div>` : ''}
    ${f.context ? `<div style="color:${bc}; font-size:${bs-1}px; opacity:0.75;">${esc(f.context)}</div>` : ''}
    ${f.org ? `<div style="color:${theme.accent}; font-size:${bs-2}px; letter-spacing:2px; text-transform:uppercase; opacity:0.7; margin-top:6px;">${esc(f.org)}</div>` : ''}
  </div>`;
}

/* CORPORATE */
function renderCorporateContent(container, theme, baseStyle) {
  const f = state.fields, hc = state.headingColor, bc = state.bodyColor, hs = state.headingSize, bs = state.bodySize;
  const dateStr = f.date ? formatDate(f.date) : '', timeStr = f.time ? formatTime(f.time) : '';
  const hasImg = state.uploadedImageURL && state.imagePosition === 'center';
  container.innerHTML = `
  <div class="poster-layout-centered" style="${baseStyle}">
    ${f.org ? `<div style="color:${theme.accent}; font-size:${bs}px; font-weight:700; letter-spacing:3px; text-transform:uppercase;">${esc(f.org)}</div>` : ''}
    <div class="p-divider" style="background:${theme.accent}; opacity:0.5; width:30%;"></div>
    ${hasImg ? imgTag() : ''}
    <div class="p-title" style="color:${hc}; font-size:${hs}px; line-height:1.15;">${esc(f.title||'Company Announcement')}</div>
    ${f.subtitle ? `<div style="color:${theme.accent2}; font-size:${Math.round(hs*0.5)}px; font-weight:400; font-style:italic;">${esc(f.subtitle)}</div>` : ''}
    <div class="p-divider" style="background:${theme.accent}; opacity:0.4; width:70%;"></div>
    <div style="display:flex; gap:20px; flex-wrap:wrap; justify-content:center; align-items:center;">
      ${dateStr ? `<div style="color:${bc}; font-size:${bs+1}px;">📅 <b>${dateStr}</b></div>` : ''}
      ${timeStr ? `<div style="color:${bc}; font-size:${bs+1}px;">🕐 <b>${timeStr}</b></div>` : ''}
    </div>
    ${f.venue ? `<div style="color:${theme.accent2}; font-size:${bs}px;">📍 ${esc(f.venue)}</div>` : ''}
    <div class="p-divider" style="opacity:0.25;"></div>
    <div class="p-body" style="color:${bc}; font-size:${bs}px; max-width:85%;">${multilineEsc(f.desc||'')}</div>
    ${f.contact ? `<div class="p-badge" style="color:${hc}; border-color:${theme.accent}; font-size:${bs-2}px; margin-top:6px;">${esc(f.contact)}</div>` : ''}
  </div>`;
}

/* CUSTOM */
function renderCustomContent(container, theme, baseStyle) {
  const f = state.fields, hc = state.headingColor, bc = state.bodyColor, hs = state.headingSize, bs = state.bodySize;
  const hasImg = state.uploadedImageURL && state.imagePosition === 'center';
  container.innerHTML = `
  <div class="poster-layout-centered" style="${baseStyle}">
    <div class="p-title" style="color:${hc}; font-size:${hs}px;">${esc(f.title||'Your Title')}</div>
    <div class="p-divider" style="background:${theme.accent}; opacity:0.5;"></div>
    ${f.subtitle ? `<div style="color:${theme.accent}; font-size:${Math.round(hs*0.55)}px; font-weight:700;">${esc(f.subtitle)}</div>` : ''}
    ${hasImg ? imgTag('border-radius:8px;') : ''}
    ${f.line1 ? `<div style="color:${bc}; font-size:${bs+2}px; font-weight:600;">${esc(f.line1)}</div>` : ''}
    ${f.line2 ? `<div style="color:${bc}; font-size:${bs+2}px; font-weight:600;">${esc(f.line2)}</div>` : ''}
    <div class="p-body" style="color:${bc}; font-size:${bs}px;">${multilineEsc(f.body||'')}</div>
    ${f.footer ? `<div class="p-divider" style="opacity:0.3;"></div><div style="color:${theme.accent2}; font-size:${bs-3}px; letter-spacing:1px;">${esc(f.footer)}</div>` : ''}
  </div>`;
}

/* ═══════════════════════════════════════════════════════
   D E C O R A T I O N S
═══════════════════════════════════════════════════════ */
function renderDecorations(theme) {
  const deco = document.getElementById('posterDeco');
  deco.innerHTML = '';

  if (state.decoStars) {
    const stars = document.createElement('div');
    stars.className = 'deco-stars-container';
    [[10,8],[85,12],[20,75],[70,80],[50,5],[95,45],[5,50],[38,92],[62,15],[15,40],[80,65],[44,55],[90,20],[28,30],[72,90]].forEach(([l,t],i) => {
      const star = document.createElement('span');
      star.className = 'deco-star';
      star.textContent = ['⭐','✨','💫','🌟','★'][i%5];
      star.style.left=`${l}%`; star.style.top=`${t}%`;
      star.style.setProperty('--d',`${1.5+(i%4)*0.5}s`);
      star.style.animationDelay=`${(i*0.3)%2}s`;
      stars.appendChild(star);
    });
    deco.appendChild(stars);
  }

  if (state.decoBorder) {
    const b = document.createElement('div');
    b.innerHTML = `<div class="deco-border-frame" style="border-color:${theme.accent}55;"></div><div class="deco-border-inner" style="border-color:${theme.accent}33;"></div>`;
    deco.appendChild(b);
  }

  if (state.decoConfetti) {
    const conf = document.createElement('div');
    conf.className = 'deco-confetti-container';
    const colors = ['#FFD700','#FF6B6B','#4ECDC4','#A29BFE','#FD79A8','#00CEC9'];
    for (let i=0; i<30; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.left=`${Math.random()*100}%`;
      p.style.background=colors[i%colors.length];
      p.style.setProperty('--spd',`${2+Math.random()*3}s`);
      p.style.setProperty('--delay',`${Math.random()*3}s`);
      p.style.borderRadius=Math.random()>0.5?'50%':'2px';
      p.style.width=`${4+Math.random()*7}px`; p.style.height=p.style.width;
      conf.appendChild(p);
    }
    deco.appendChild(conf);
  }

  if (state.decoRibbon) {
    const r = document.createElement('div');
    r.className = 'deco-ribbon';
    r.innerHTML = `<div style="position:absolute;top:0;right:0;width:100px;height:100px;overflow:hidden;"><div style="position:absolute;top:20px;right:-28px;background:${theme.accent};width:130px;height:22px;transform:rotate(45deg);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#000;">★ SPECIAL ★</div></div>`;
    deco.appendChild(r);
  }

  if (state.decoSparkles) {
    const sp = document.createElement('div');
    sp.className = 'deco-sparkles-container';
    const colors2 = [theme.accent, theme.accent2, '#fff', '#FFD700'];
    [[8,15],[92,20],[15,85],[85,75],[50,10],[30,50],[70,30],[20,60],[80,50]].forEach(([l,t],i) => {
      const dot = document.createElement('div');
      dot.className = 'sparkle-dot';
      dot.style.left=`${l}%`; dot.style.top=`${t}%`;
      dot.style.background=colors2[i%colors2.length];
      dot.style.setProperty('--d',`${1+Math.random()*2.5}s`);
      dot.style.animationDelay=`${Math.random()*2}s`;
      sp.appendChild(dot);
    });
    deco.appendChild(sp);
  }

  if (state.decoCornerDeco) {
    const cd = document.createElement('div');
    cd.className = 'deco-corners';
    cd.style.borderColor = theme.accent;
    cd.style.color = theme.accent;
    deco.appendChild(cd);
  }
}

/* ═══════════════════════════════════════════════════════
   D O W N L O A D
═══════════════════════════════════════════════════════ */
function downloadPoster(format = 'png') {
  generatePoster();
  showLoading(true, 'Capturing poster...');
  const canvas = document.getElementById('posterCanvas');
  const zoom = state.zoom;
  canvas.style.transform = 'scale(1)';

  setTimeout(() => {
    if (typeof html2canvas === 'undefined') {
      showToast('⚠️ Library not loaded. Check internet connection.', 'error');
      showLoading(false);
      canvas.style.transform = `scale(${zoom})`;
      return;
    }
    html2canvas(canvas, { useCORS: true, scale: 2, backgroundColor: null, logging: false }).then(cvs => {
      canvas.style.transform = `scale(${zoom})`;
      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const quality = format === 'jpg' ? 0.92 : undefined;
      const link = document.createElement('a');
      link.download = `PosterCraft_${state.posterType}_${Date.now()}.${format}`;
      link.href = cvs.toDataURL(mimeType, quality);
      saveToGallery(cvs.toDataURL('image/jpeg', 0.5));
      link.click();
      showLoading(false);
      showToast(`✅ Downloaded as ${format.toUpperCase()}!`, 'success');
    }).catch(err => {
      console.error(err);
      canvas.style.transform = `scale(${zoom})`;
      showLoading(false);
      showToast('❌ Download failed. Try again.', 'error');
    });
  }, 300);
}

/* ── PDF Download ── */
function downloadAsPDF() {
  if (typeof window.jspdf === 'undefined') {
    showToast('⚠️ PDF library not loaded. Check internet connection.', 'error');
    return;
  }
  generatePoster();
  showLoading(true, 'Generating PDF...');
  const canvas = document.getElementById('posterCanvas');
  const zoom = state.zoom;
  canvas.style.transform = 'scale(1)';

  setTimeout(() => {
    html2canvas(canvas, { useCORS: true, scale: 2, backgroundColor: null, logging: false }).then(cvs => {
      canvas.style.transform = `scale(${zoom})`;
      const { jsPDF } = window.jspdf;
      const imgW = cvs.width / 2;
      const imgH = cvs.height / 2;
      const orientation = imgW > imgH ? 'landscape' : 'portrait';
      const pdf = new jsPDF({ orientation, unit: 'px', format: [imgW, imgH], hotfixes: ['px_scaling'] });
      const imgData = cvs.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgW, imgH);
      pdf.save(`PosterCraft_${state.posterType}_${Date.now()}.pdf`);
      saveToGallery(cvs.toDataURL('image/jpeg', 0.5));
      showLoading(false);
      showToast('✅ PDF downloaded successfully!', 'success');
    }).catch(err => {
      console.error(err);
      canvas.style.transform = `scale(${zoom})`;
      showLoading(false);
      showToast('❌ PDF generation failed.', 'error');
    });
  }, 300);
}

/* ── Copy to Clipboard ── */
async function copyPosterToClipboard() {
  if (typeof html2canvas === 'undefined') { showToast('⚠️ Library not loaded.', 'error'); return; }
  generatePoster();
  showLoading(true, 'Copying to clipboard...');
  const canvas = document.getElementById('posterCanvas');
  const zoom = state.zoom;
  canvas.style.transform = 'scale(1)';
  setTimeout(() => {
    html2canvas(canvas, { useCORS: true, scale: 2, backgroundColor: null, logging: false }).then(async cvs => {
      canvas.style.transform = `scale(${zoom})`;
      try {
        cvs.toBlob(async blob => {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            showToast('✅ Copied to clipboard!', 'success');
          } else {
            showToast('📋 Right-click the poster and "Save image as" to save.', '');
          }
          showLoading(false);
        }, 'image/png');
      } catch(e) {
        showToast('📋 Clipboard not available. Use Download instead.', 'warning');
        showLoading(false);
        canvas.style.transform = `scale(${zoom})`;
      }
    });
  }, 300);
}

/* ── Save to Gallery (manual) ── */
function saveToGalleryManual() {
  if (typeof html2canvas === 'undefined') { showToast('⚠️ Library not loaded.', 'error'); return; }
  generatePoster();
  showLoading(true, 'Saving to gallery...');
  const canvas = document.getElementById('posterCanvas');
  const zoom = state.zoom;
  canvas.style.transform = 'scale(1)';
  setTimeout(() => {
    html2canvas(canvas, { useCORS: true, scale: 1.5, backgroundColor: null, logging: false }).then(cvs => {
      canvas.style.transform = `scale(${zoom})`;
      saveToGallery(cvs.toDataURL('image/jpeg', 0.6));
      showLoading(false);
      showToast('🖼 Saved to gallery!', 'success');
    }).catch(() => { showLoading(false); canvas.style.transform = `scale(${zoom})`; });
  }, 300);
}

/* ═══════════════════════════════════════════════════════
   G A L L E R Y
═══════════════════════════════════════════════════════ */
function saveToGallery(dataURL) {
  state.gallery.unshift({ id: Date.now(), dataURL, type: state.posterType, ts: new Date().toLocaleString() });
  if (state.gallery.length > 30) state.gallery.pop();
  localStorage.setItem('autoposter_gallery', JSON.stringify(state.gallery));
  renderGallery();
}

function setGalleryFilter(filter, el) {
  state.galleryFilter = filter;
  document.querySelectorAll('.gfilter-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderGallery();
}

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  state.gallery = JSON.parse(localStorage.getItem('autoposter_gallery') || '[]');
  const filtered = state.galleryFilter === 'all' ? state.gallery : state.gallery.filter(g => g.type === state.galleryFilter);

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="gallery-empty"><span>🎨</span><p>${state.galleryFilter === 'all' ? 'No saved posters yet.<br/>Generate and save your first poster!' : `No ${state.galleryFilter} posters saved.`}</p></div>`;
    return;
  }
  grid.innerHTML = '';
  filtered.forEach(item => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `
      <img src="${item.dataURL}" alt="${item.type} poster" loading="lazy"/>
      <div class="gallery-item-info">
        <div>
          <div class="gallery-item-type">${item.type}</div>
          <div class="gallery-item-date">${item.ts}</div>
        </div>
        <div class="gallery-item-actions">
          <button class="gallery-item-dl" onclick="downloadGalleryItem(${item.id})" title="Download">⬇</button>
          <button class="gallery-delete" onclick="deleteGalleryItem(${item.id})" title="Delete">🗑</button>
        </div>
      </div>`;
    div.querySelector('img').onclick = () => downloadGalleryItem(item.id);
    grid.appendChild(div);
  });
}

function downloadGalleryItem(id) {
  const item = state.gallery.find(g => g.id === id);
  if (!item) return;
  const link = document.createElement('a');
  link.href = item.dataURL; link.download = `poster_${item.id}.jpg`; link.click();
}

function deleteGalleryItem(id) {
  state.gallery = state.gallery.filter(g => g.id !== id);
  localStorage.setItem('autoposter_gallery', JSON.stringify(state.gallery));
  renderGallery();
  showToast('🗑 Poster deleted', '');
}

/* ═══════════════════════════════════════════════════════
   T E M P L A T E S
═══════════════════════════════════════════════════════ */
function saveAsTemplate() {
  const name = prompt('Template name:', `${state.posterType} – ${new Date().toLocaleDateString()}`);
  if (!name) return;
  const tpl = {
    id: Date.now(), name,
    type: state.posterType,
    theme: state.theme,
    size: state.size,
    layout: state.layout,
    fontFamily: state.fontFamily,
    headingColor: state.headingColor,
    bodyColor: state.bodyColor,
    headingSize: state.headingSize,
    bodySize: state.bodySize,
    textAlign: state.textAlign,
    textShadow: state.textShadow,
    bgOpacity: state.bgOpacity,
    bgOverlayColor: state.bgOverlayColor,
    bgPattern: state.bgPattern,
    decoStars: state.decoStars, decoBorder: state.decoBorder,
    decoConfetti: state.decoConfetti, decoRibbon: state.decoRibbon,
    decoSparkles: state.decoSparkles, decoCornerDeco: state.decoCornerDeco,
    fields: { ...state.fields },
    ts: new Date().toLocaleString()
  };
  state.templates.unshift(tpl);
  localStorage.setItem('autoposter_templates', JSON.stringify(state.templates));
  renderTemplates();
  showToast('📐 Template saved!', 'success');
}

function loadTemplate(id) {
  const tpl = state.templates.find(t => t.id === id);
  if (!tpl) return;
  Object.assign(state, tpl);
  // Re-render the whole UI
  document.querySelectorAll('.type-card').forEach(c => c.classList.remove('active'));
  const typeCard = document.querySelector(`.type-card[data-type="${tpl.type}"]`);
  if (typeCard) { typeCard.classList.add('active'); }
  renderThemes();
  renderContentFields();
  // Restore field values
  Object.keys(tpl.fields).forEach(key => {
    const el = document.getElementById(`field_${key}`);
    if (el) { el.value = tpl.fields[key]; state.fields[key] = tpl.fields[key]; }
  });
  document.getElementById('fontFamily').value = tpl.fontFamily;
  document.getElementById('headingColor').value = tpl.headingColor;
  document.getElementById('bodyColor').value = tpl.bodyColor;
  document.getElementById('headingSize').value = tpl.headingSize;
  document.getElementById('bodySize').value = tpl.bodySize;
  document.getElementById('bgOpacity').value = tpl.bgOpacity;
  document.getElementById('bgOverlayColor').value = tpl.bgOverlayColor;
  document.getElementById('textShadow').checked = tpl.textShadow;
  // Size
  document.querySelectorAll('.size-card').forEach(c => c.classList.remove('active'));
  const sizeCard = document.querySelector(`.size-card[data-size="${tpl.size}"]`);
  if (sizeCard) { sizeCard.classList.add('active'); }
  // Pattern
  document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
  const patBtn = document.querySelector(`.pattern-btn[data-pattern="${tpl.bgPattern}"]`);
  if (patBtn) patBtn.classList.add('active');
  generatePoster();
  switchTab('create');
  showToast(`📐 Template "${tpl.name}" loaded!`, 'success');
}

function deleteTemplate(id) {
  state.templates = state.templates.filter(t => t.id !== id);
  localStorage.setItem('autoposter_templates', JSON.stringify(state.templates));
  renderTemplates();
  showToast('🗑 Template deleted', '');
}

function renderTemplates() {
  const grid = document.getElementById('templateGrid');
  if (!grid) return;
  state.templates = JSON.parse(localStorage.getItem('autoposter_templates') || '[]');
  if (state.templates.length === 0) {
    grid.innerHTML = `<div class="gallery-empty"><span>📐</span><p>No templates saved yet.<br/>Save your poster settings as a reusable template!</p></div>`;
    return;
  }
  grid.innerHTML = '';
  state.templates.forEach(tpl => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    const bg = (tpl.theme && tpl.theme.bg) ? tpl.theme.bg : 'linear-gradient(135deg,#1a1d35,#202444)';
    div.innerHTML = `
      <div style="height:140px; background:${bg}; display:flex; align-items:center; justify-content:center; cursor:pointer; border-radius:0;" onclick="loadTemplate(${tpl.id})">
        <span style="color:white; font-size:30px;">📐</span>
      </div>
      <div class="gallery-item-info">
        <div>
          <div class="gallery-item-type" style="font-size:12px;">${tpl.name}</div>
          <div class="gallery-item-date">${tpl.type} · ${tpl.ts}</div>
        </div>
        <div class="gallery-item-actions">
          <button class="gallery-item-dl" onclick="loadTemplate(${tpl.id})" title="Load">✓</button>
          <button class="gallery-delete" onclick="deleteTemplate(${tpl.id})" title="Delete">🗑</button>
        </div>
      </div>`;
    grid.appendChild(div);
  });
}

/* ═══════════════════════════════════════════════════════
   U N D O   /   R E D O
═══════════════════════════════════════════════════════ */
function getSnapshot() {
  return JSON.stringify({
    posterType: state.posterType, theme: state.theme, size: state.size,
    layout: state.layout, fontFamily: state.fontFamily,
    headingColor: state.headingColor, bodyColor: state.bodyColor,
    headingSize: state.headingSize, bodySize: state.bodySize,
    textAlign: state.textAlign, textShadow: state.textShadow,
    bgOpacity: state.bgOpacity, bgOverlayColor: state.bgOverlayColor,
    bgPattern: state.bgPattern,
    decoStars: state.decoStars, decoBorder: state.decoBorder,
    decoConfetti: state.decoConfetti, decoRibbon: state.decoRibbon,
    decoSparkles: state.decoSparkles, decoCornerDeco: state.decoCornerDeco,
    fields: { ...state.fields },
    watermarkEnabled: state.watermarkEnabled, watermarkText: state.watermarkText,
  });
}

function pushHistory() {
  if (state._skipHistory) return;
  const snap = getSnapshot();
  if (state.history.length && state.history[state.historyIndex] === snap) return;
  state.history = state.history.slice(0, state.historyIndex + 1);
  state.history.push(snap);
  if (state.history.length > 12) state.history.shift();
  state.historyIndex = state.history.length - 1;
}

function undoHistory() {
  if (state.historyIndex <= 0) { showToast('Nothing to undo.', ''); return; }
  state.historyIndex--;
  restoreSnapshot(JSON.parse(state.history[state.historyIndex]));
  showToast('↩ Undo', '');
}

function redoHistory() {
  if (state.historyIndex >= state.history.length - 1) { showToast('Nothing to redo.', ''); return; }
  state.historyIndex++;
  restoreSnapshot(JSON.parse(state.history[state.historyIndex]));
  showToast('↪ Redo', '');
}

function restoreSnapshot(snap) {
  state._skipHistory = true;
  Object.assign(state, snap);
  // Sync UI elements silently
  try {
    document.getElementById('fontFamily').value = snap.fontFamily;
    document.getElementById('headingColor').value = snap.headingColor;
    document.getElementById('bodyColor').value = snap.bodyColor;
    document.getElementById('headingSize').value = snap.headingSize;
    document.getElementById('bodySize').value = snap.bodySize;
    document.getElementById('bgOpacity').value = snap.bgOpacity;
    document.getElementById('bgOverlayColor').value = snap.bgOverlayColor;
    document.getElementById('textShadow').checked = snap.textShadow;
    Object.keys(snap.fields).forEach(key => {
      const el = document.getElementById(`field_${key}`);
      if (el) el.value = snap.fields[key];
    });
    // Update deco buttons
    ['stars','border','confetti','ribbon','sparkles','cornerDeco'].forEach(d => {
      const key = `deco${d.charAt(0).toUpperCase()+d.slice(1)}`;
      const btn = document.getElementById(`deco${d.charAt(0).toUpperCase()+d.slice(1)}`);
      if (btn) btn.classList.toggle('active', !!snap[key]);
    });
    // Pattern
    document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
    const pBtn = document.querySelector(`.pattern-btn[data-pattern="${snap.bgPattern}"]`);
    if (pBtn) pBtn.classList.add('active');
    // Align
    document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
    const aBtn = document.getElementById(`align${snap.textAlign.charAt(0).toUpperCase()+snap.textAlign.slice(1)}`);
    if (aBtn) aBtn.classList.add('active');
  } catch(e) { /* silent */ }
  generatePoster();
  state._skipHistory = false;
}

/* ═══════════════════════════════════════════════════════
   R E S E T
═══════════════════════════════════════════════════════ */
function resetPoster() {
  document.getElementById('fontFamily').value = 'Outfit';
  document.getElementById('headingColor').value = '#ffffff';
  document.getElementById('bodyColor').value = '#ffffff';
  document.getElementById('headingSize').value = 36;
  document.getElementById('bodySize').value = 16;
  document.getElementById('bgOpacity').value = 85;
  document.getElementById('bgOverlayColor').value = '#000000';
  document.getElementById('textShadow').checked = true;
  document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('alignLeft').classList.add('active');
  state.textAlign = 'center';
  ['decoStars','decoBorder','decoConfetti','decoRibbon','decoSparkles','decoCornerDeco'].forEach(d => { state[d] = false; });
  document.querySelectorAll('.deco-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('decoStars').classList.add('active');
  state.decoStars = true;
  document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.pattern-btn[data-pattern="none"]').classList.add('active');
  state.bgPattern = 'none';
  state.watermarkEnabled = false;
  state.watermarkText = '';
  document.getElementById('watermarkEnabled').checked = false;
  document.getElementById('watermarkText').value = '';
  document.getElementById('watermarkText').disabled = true;
  state.qrEnabled = false;
  document.getElementById('qrEnabled').checked = false;
  document.getElementById('qrText').disabled = true;
  state.imageShape = 'circle';
  state.imageFilter = 'none';
  document.getElementById('imageFilter').value = 'none';
  document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.shape-btn[data-shape="circle"]').classList.add('active');
  removeImage();
  removeBgImage();
  applyFormatting();
  showToast('↺ Reset to defaults', '');
}

/* ═══════════════════════════════════════════════════════
   U T I L I T I E S
═══════════════════════════════════════════════════════ */
function showToast(msg, type) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.className = 'toast', 3200);
}
function showLoading(v, msg) {
  document.getElementById('loadingOverlay').style.display = v ? 'flex' : 'none';
  if (msg) document.getElementById('loadingMsg').textContent = msg;
}
function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function multilineEsc(str) { return esc(str).replace(/\n/g,'<br/>'); }
function formatDate(dateStr) {
  if (!dateStr) return '';
  try { const d = new Date(dateStr+'T00:00:00'); return d.toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }); }
  catch { return dateStr; }
}
function formatTime(timeStr) {
  if (!timeStr) return '';
  try {
    const [h,m] = timeStr.split(':').map(Number);
    const ampm = h>=12?'PM':'AM', hr = h%12||12;
    return `${hr}:${String(m).padStart(2,'0')} ${ampm}`;
  } catch { return timeStr; }
}