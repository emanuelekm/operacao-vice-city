// Lançamento previsto para 19/11/2026 às 00:00 no horário de Brasília (UTC-3).
// Para testar a tela de lançamento antes da hora, abra o site com ?teste=lancamento no final do endereço.
const TEST_LAUNCH = new URLSearchParams(location.search).get('teste') === 'lancamento';
const launchDate = TEST_LAUNCH ? Date.now() + 4000 : new Date('2026-11-19T00:00:00-03:00').getTime();
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Tela de carregamento ---------- */
const splash = document.querySelector('#splash');
const loaderBar = document.querySelector('#loaderBar');
const tipEl = document.querySelector('#splashTip');
const startBtn = document.querySelector('#startBtn');
const tips = [
  'DICA: hidrate-se. A Player 2 está monitorando.',
  'DICA: snacks restauram a vida instantaneamente.',
  'DICA: nenhum controle descarregado será tolerado.',
  'DICA: a carta no fundo da caixa só abre no lançamento.',
  'CARREGANDO: saudades da Player 2... 100%'
];
let progress = 0, tipIndex = 0;
const loadTimer = setInterval(() => {
  progress = Math.min(100, progress + Math.random() * 14 + 4);
  loaderBar.style.width = progress + '%';
  if (progress >= 100) {
    clearInterval(loadTimer);
    tipEl.textContent = 'TRANSMISSÃO PRONTA, AGENTE EDU.';
    startBtn.hidden = false;
    startBtn.focus();
  }
}, 220);
const tipTimer = setInterval(() => {
  if (progress >= 100) return clearInterval(tipTimer);
  tipIndex = (tipIndex + 1) % tips.length;
  tipEl.textContent = tips[tipIndex];
}, 1100);

function startTransmission() {
  splash.classList.add('hide');
  document.body.classList.remove('is-loading');
  document.querySelectorAll('.hero .reveal').forEach((el, i) => setTimeout(() => el.classList.add('visible'), 250 + i * 180));
}
startBtn.addEventListener('click', startTransmission);

/* ---------- Revelar ao rolar ---------- */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  });
}, { threshold: 0.18 });
document.querySelectorAll('.page .reveal').forEach(el => observer.observe(el));

/* ---------- Contagem regressiva ---------- */
const fields = ['days', 'hours', 'minutes', 'seconds'].map(id => document.getElementById(id));
const label = document.querySelector('#launchLabel');
const status = document.querySelector('#liveStatus');
let launched = false;

function setField(el, value) {
  const text = String(value).padStart(2, '0');
  if (el.textContent === text) return;
  el.textContent = text;
  el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick');
}

function updateCountdown() {
  const distance = launchDate - Date.now();
  if (distance <= 0) {
    if (!launched) onLaunch();
    return;
  }
  setField(fields[0], Math.floor(distance / 86400000));
  setField(fields[1], Math.floor(distance / 3600000) % 24);
  setField(fields[2], Math.floor(distance / 60000) % 60);
  setField(fields[3], Math.floor(distance / 1000) % 60);
}

function onLaunch() {
  launched = true;
  fields.forEach(f => f.textContent = '00');
  label.textContent = 'É HORA DE JOGAR · BOA MISSÃO, AGENTE EDU!';
  status.textContent = '● LANÇAMENTO LIBERADO';
  document.querySelector('#secretLetter').classList.add('unlocked');
  document.querySelector('#letterLock').textContent = '💌';
  document.querySelector('#letterTitle').textContent = 'ARQUIVO LIBERADO';
  document.querySelector('#letterText').textContent = 'Chegou a hora, agente. Pegue a carta no fundo da caixa e leia antes de apertar START.';
  if (!reduceMotion) confetti();
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ---------- Confete no lançamento ---------- */
function confetti() {
  const canvas = document.querySelector('#confetti');
  const ctx = canvas.getContext('2d');
  const colors = ['#ff5aa8', '#ff9b54', '#a77aff', '#ffe08a', '#5ad1ff'];
  const resize = () => { canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio; };
  resize(); addEventListener('resize', resize);
  const pieces = Array.from({ length: 180 }, () => ({
    x: Math.random() * canvas.width, y: -Math.random() * canvas.height,
    w: 6 + Math.random() * 8, h: 8 + Math.random() * 10,
    vy: 2 + Math.random() * 4, vx: -1.5 + Math.random() * 3,
    r: Math.random() * Math.PI, vr: -0.1 + Math.random() * 0.2,
    c: colors[Math.floor(Math.random() * colors.length)]
  }));
  const end = Date.now() + 7000;
  (function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx * devicePixelRatio; p.y += p.vy * devicePixelRatio; p.r += p.vr;
      if (p.y > canvas.height && Date.now() < end) { p.y = -20; p.x = Math.random() * canvas.width; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w * devicePixelRatio, p.h * devicePixelRatio);
      ctx.restore();
    });
    if (pieces.some(p => p.y < canvas.height)) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  })();
}
