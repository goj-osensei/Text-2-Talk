/* /src/script.js
   Single client-side file:
   - typewriter
   - scroll reveal for features & highlights
   - simple particle background
   - contact form (mailto fallback)
   - WhatsApp open
   - chatbot UI + Gemini call to /api/gemini (server proxy)
   - localStorage chat history
*/

/* ---------- Utility & DOM references ---------- */
const byId = id => document.getElementById(id);
const timeline = byId('timeline');
const grid = byId('grid');
const chatBtn = byId('geminiChatbot');
const chatInterface = byId('chatInterface');
const openWhats = document.getElementById('openWhats');
const sendMessageBtn = byId('sendMessage');
const chatInput = byId('chatInput');
const chatMessages = byId('chatMessages');
const closeChat = byId('closeChat');
const typewriterEl = document.getElementById('typewriter');
const contactForm = byId('contactForm');
const bookDemo = byId('bookDemo');
const callNow = byId('callNow');

/* ---------- Typewriter ---------- */
(function typewriter() {
  const words = ['Text2Talk', 'Speak With Prashanta'];
  let i = 0, j = 0, back = false;
  const speed = 80;
  function tick() {
    const word = words[i];
    if (!back) {
      typewriterEl.textContent = word.slice(0, ++j);
      if (j === word.length) {
        back = true;
        setTimeout(tick, 700);
        return;
      }
    } else {
      typewriterEl.textContent = word.slice(0, --j);
      if (j === 0) {
        back = false;
        i = (i + 1) % words.length;
      }
    }
    setTimeout(tick, speed);
  }
  tick();
})();

/* ---------- Scroll reveal for timeline & grid ---------- */
(function revealOnScroll() {
  const observerOpts = { threshold: 0.15 };
  const reveal = entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  };
  const observer = new IntersectionObserver(reveal, observerOpts);
  document.querySelectorAll('.feature, .feature-tile').forEach(el => observer.observe(el));
})();

/* ---------- Simple particle background (lightweight) ---------- */
(function particles() {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const particles = [];
  const count = Math.floor((w * h) / 60000) + 25; // scale with screen

  function rand(min, max){ return Math.random() * (max - min) + min; }

  function createParticles() {
    particles.length = 0;
    for (let i=0;i<count;i++){
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(0.9, 2.6),
        vx: rand(-0.25, 0.25),
        vy: rand(-0.15, 0.15),
        alpha: rand(0.08, 0.28)
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
      // update
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
    createParticles();
  });

  // gentle parallax on mouse
  window.addEventListener('mousemove', (e) => {
    const cx = e.clientX / w - 0.5;
    const cy = e.clientY / h - 0.5;
    for (let i=0;i<particles.length;i++){
      particles[i].x += cx * 0.3 * (i % 3 === 0 ? 1 : -1);
      particles[i].y += cy * 0.2;
    }
  });

  createParticles();
  draw();
})();

/* ---------- Contact form & buttons ---------- */
function sendMail(e) {
  e.preventDefault();
  const name = byId('name').value.trim();
  const email = byId('email').value.trim();
  const message = byId('message').value.trim();
  if (!name || !email || !message) {
    alert('Please fill the form before sending.');
    return false;
  }
  // fallback: open mailto with prefilled content
  const subject = encodeURIComponent(`Demo request from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
  window.location.href = `mailto:prashantmajumder4@example.com?subject=${subject}&body=${body}`;
  return false;
}
window.sendMail = sendMail;

if (openWhats) {
  openWhats.addEventListener('click', () => {
    // opens WhatsApp chat - change number if needed
    window.open('https://wa.me/918961484431', '_blank');
  });
}
if (bookDemo) {
  bookDemo.addEventListener('click', () => {
    // scroll to contact
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    // focus name
    setTimeout(()=> byId('name').focus(), 400);
  });
}
if (callNow) {
  callNow.addEventListener('click', () => {
    window.location.href = 'tel:+918961484431';
  });
}

/* ---------- Chat UI toggles & persistence ---------- */
(function chatUI() {
  const STORAGE_KEY = 't2t_chat_history_v1';

  function renderMessage(text, who='bot', opts={}) {
    const el = document.createElement('div');
    el.className = 'message ' + (who === 'bot' ? 'bot' : 'user');
    el.textContent = text;
    if (opts.loading) el.classList.add('loading');
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return el;
  }

  function saveHistory(history) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch(e){}
  }

  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch(e){ return []; }
  }

  function appendToHistory(entry) {
    const hist = loadHistory();
    hist.push(entry);
    saveHistory(hist);
  }

  // populate history
  (function populate() {
    const history = loadHistory();
    if (history.length === 0) {
      renderMessage("Hello! I'm your AI assistant. How can I help you today?");
      return;
    }
    for (const m of history) {
      renderMessage(m.text, m.who);
    }
  })();

  // open / close
  chatBtn.addEventListener('click', ()=> {
    chatInterface.classList.toggle('active');
  });
  closeChat.addEventListener('click', ()=> chatInterface.classList.remove('active'));

  // send on button / enter
  function userSend(text) {
    if (!text || !text.trim()) return;
    const trimmed = text.trim();
    renderMessage(trimmed, 'user');
    appendToHistory({ who: 'user', text: trimmed, ts: Date.now() });
    chatInput.value = '';
    // call Gemini (server proxy)
    callGemini(trimmed);
  }

  sendMessageBtn.addEventListener('click', () => userSend(chatInput.value));
  chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); userSend(chatInput.value); } });

  /* ---------- Gemini call (POST to /api/gemini) ---------- */
  let isRequesting = false;
  async function callGemini(promptText) {
    if (isRequesting) {
      renderMessage('Please wait while I finish the previous response...', 'bot');
      return;
    }
    isRequesting = true;
    const loadingEl = renderMessage('...', 'bot', { loading: true });
    try {
      // POST to your server endpoint which holds the API key in .env
      const resp = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText })
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Server error: ${resp.status} ${txt}`);
      }

      // expecting JSON: { reply: "text" }
      const data = await resp.json();
      loadingEl.classList.remove('loading');
      loadingEl.textContent = data.reply || '[no reply from server]';
      appendToHistory({ who: 'bot', text: data.reply || '', ts: Date.now() });
    } catch (err) {
      console.error('Gemini call failed', err);
      loadingEl.classList.remove('loading');
      loadingEl.textContent = 'Sorry — I could not get a reply. Try again later.';
      appendToHistory({ who: 'bot', text: loadingEl.textContent, ts: Date.now() });
    } finally {
      isRequesting = false;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }
})();

/* ---------- Helper: Simple visual focus when user types (optional small UI nicety) ---------- */
chatInput && chatInput.addEventListener('focus', () => chatInterface.classList.add('active'));

/* ---------- Small accessibility: allow clicking timeline items to expand more text ---------- */
document.querySelectorAll('.feature-tile').forEach(tile => {
  tile.addEventListener('click', () => tile.classList.toggle('expanded'));
});
