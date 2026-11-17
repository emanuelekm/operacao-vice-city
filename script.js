// Lançamento: 19/11/2026 às 00:00, horário de Brasília (UTC-3).
// Para ver a tela de lançamento antes da hora, abra o site com ?teste=lancamento no fim do endereço.
const TEST_LAUNCH = new URLSearchParams(location.search).get('teste') === 'lancamento';
const LAUNCH = TEST_LAUNCH ? Date.now() + 6000 : Date.parse('2026-11-19T00:00:00-03:00');
const WAIT_START = Date.parse('2013-09-17T00:00:00-03:00'); // lançamento do GTA V
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = s => document.querySelector(s);

/* ---------- START ---------- */
const tips = [
  'Carregando Leonida…',
  'Dica: hidrate-se. A Player 2 está de olho.',
  'Dica: snacks restauram a vida na hora.',
  'Dica: controle descarregado não é desculpa.',
  'Carregando saudades da Player 2…'
];
let progress = 0, tip = 0;
const loading = setInterval(() => {
  progress = Math.min(100, progress + 5 + Math.random() * 11);
  $('#loaderBar').style.width = progress + '%';
  if (progress >= 100) {
    clearInterval(loading);
    $('#splashTip').textContent = 'Tudo pronto, Eduardo.';
    $('#startBtn').hidden = false;
    $('#startBtn').focus();
  }
}, 230);
const tipTimer = setInterval(() => {
  if (progress >= 100) return clearInterval(tipTimer);
  tip = (tip + 1) % tips.length;
  $('#splashTip').textContent = tips[tip];
}, 1200);

$('#startBtn').addEventListener('click', () => {
  $('#flash').classList.add('go');
  $('#splash').classList.add('hide');
  document.body.classList.remove('is-loading');
  document.body.classList.add('started');
  setTimeout(() => { $('.hud-stars').classList.add('on'); countCash(); }, 500);
});

function countCash() {
  const target = 1911, el = $('#cash'), t0 = performance.now();
  (function step(t) {
    const p = Math.min(1, (t - t0) / 1400);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('pt-BR');
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}

/* ---------- Revelar ao rolar ---------- */
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
}), { threshold: 0.2 });
document.querySelectorAll('.reveal, .reveal-tilt').forEach(el => io.observe(el));

// a barra de espera enche quando aparece
const waitIo = new IntersectionObserver(([e]) => {
  if (e.isIntersecting) { updateWait(); waitIo.disconnect(); }
}, { threshold: 0.4 });
waitIo.observe($('.wait'));

/* ---------- Contagem regressiva ---------- */
const els = ['days', 'hours', 'minutes', 'seconds'].map(id => document.getElementById(id));
let launched = false;

function setDigits(el, n) {
  const txt = String(n).padStart(2, '0');
  if (el.textContent === txt) return;
  el.textContent = txt;
  el.classList.remove('flip'); void el.offsetWidth; el.classList.add('flip');
}

function tick() {
  const left = LAUNCH - Date.now();
  if (left <= 0) { if (!launched) launch(); return; }
  updateLeftText(left);
  setDigits(els[0], Math.floor(left / 86400000));
  setDigits(els[1], Math.floor(left / 3600000) % 24);
  setDigits(els[2], Math.floor(left / 60000) % 60);
  setDigits(els[3], Math.floor(left / 1000) % 60);
}

// Data e hora do lançamento por extenso
const fmtBR = opts => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', ...opts }).format(LAUNCH);
$('#launchDay').textContent = `${fmtBR({ weekday: 'long' }).replace('-feira', '')} · ${fmtBR({ day: 'numeric', month: 'long' })}`;
$('#launchHour').textContent = 'à meia-noite · horário de Brasília';
const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const localStr = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(LAUNCH);
if (fmtBR({ hour: '2-digit', minute: '2-digit', day: 'numeric' }) !== new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', day: 'numeric' }).format(LAUNCH)) {
  $('#localTime').textContent = `No seu fuso (${userTz.split('/').pop().replace('_', ' ')}): ${localStr}`;
}

function updateWait() {
  const total = LAUNCH - WAIT_START, done = Math.min(total, Date.now() - WAIT_START);
  const pct = Math.max(0, done / total * 100);
  $('#waitBar').style.width = pct.toFixed(2) + '%';
  $('#waitPct').textContent = (pct >= 99.9 && pct < 100 ? pct.toFixed(2) : pct.toFixed(1)).replace('.', ',') + '%';
  const days = Math.floor(done / 86400000);
  const years = Math.floor(done / (365.25 * 86400000));
  $('#waitNote').textContent = launched
    ? `${years} anos e ${days.toLocaleString('pt-BR')} dias de espera. Valeu cada um.`
    : `${years} anos esperando, ${days.toLocaleString('pt-BR')} dias desde o GTA V. Agora é reta final.`;
}

function updateLeftText(left) {
  const d = Math.floor(left / 86400000), h = Math.floor(left / 3600000) % 24, m = Math.floor(left / 60000) % 60;
  const parts = [];
  if (d) parts.push(d + (d === 1 ? ' dia' : ' dias'));
  if (h) parts.push(h + (h === 1 ? ' hora' : ' horas'));
  if (!d) parts.push(m + (m === 1 ? ' minuto' : ' minutos'));
  $('#leftText').textContent = 'Faltam ' + parts.join(' e ') + '!';
}

function launch() {
  launched = true;
  els.forEach(el => el.textContent = '00');
  $('#countdownTitle').textContent = 'É hora de jogar!';
  $('#leftText').textContent = 'Liberado! Boa missão, Eduardo.';
  $('.hud-stars').classList.add('alarm');
  updateWait();
  if (!reduceMotion) confetti();
}

tick();
setInterval(tick, 1000);

/* ---------- Confete ---------- */
function confetti() {
  const c = $('#confetti'), ctx = c.getContext('2d'), dpr = devicePixelRatio || 1;
  const size = () => { c.width = innerWidth * dpr; c.height = innerHeight * dpr; };
  size(); addEventListener('resize', size);
  const colors = ['#ff3d8b', '#ffb648', '#3fc6d4', '#fff3e3', '#9bffb0', '#c2349b'];
  const bits = Array.from({ length: 220 }, () => ({
    x: Math.random() * c.width, y: -Math.random() * c.height, w: (6 + Math.random() * 8) * dpr, h: (9 + Math.random() * 10) * dpr,
    vx: (-1.5 + Math.random() * 3) * dpr, vy: (2 + Math.random() * 4) * dpr, r: Math.random() * 6, vr: -.12 + Math.random() * .24,
    col: colors[Math.random() * colors.length | 0]
  }));
  const until = Date.now() + 8000;
  (function frame() {
    ctx.clearRect(0, 0, c.width, c.height);
    bits.forEach(b => {
      b.x += b.vx; b.y += b.vy; b.r += b.vr;
      if (b.y > c.height && Date.now() < until) { b.y = -20; b.x = Math.random() * c.width; }
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r); ctx.fillStyle = b.col;
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h * Math.abs(Math.cos(b.r))); ctx.restore();
    });
    if (bits.some(b => b.y < c.height)) requestAnimationFrame(frame); else ctx.clearRect(0, 0, c.width, c.height);
  })();
}
