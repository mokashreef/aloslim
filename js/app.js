let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playClickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.035);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {}
}

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const targetPage = document.getElementById(`page-${page}`);
  if (targetPage) {
    targetPage.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const appEl = document.getElementById('app');
    if (appEl) appEl.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');

  localStorage.setItem('almuslim_currentPage', page);

  if (page === 'home' && typeof initHome === 'function') initHome();
  if (page === 'quran' && typeof initQuran === 'function') initQuran();
  if (page === 'azkar' && typeof initAzkar === 'function') initAzkar();
  if (page === 'tasbih' && typeof initTasbih === 'function') initTasbih();
  if (page === 'more' && typeof initSettings === 'function') initSettings();
}

function showModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('visible');
    document.body.style.overflow = '';
  }
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('visible');
    document.body.style.overflow = '';
  }
});

let toastTimeout = null;

function showToast(text, iconName = 'check') {
  const toast = document.getElementById('toast');
  const iconEl = document.getElementById('toast-icon');
  const textEl = document.getElementById('toast-text');

  if (!toast) return;

  if (iconEl && typeof getIcon === 'function') {
    iconEl.innerHTML = getIcon(iconName, '', 20);
  }
  if (textEl) {
    textEl.textContent = text;
  }

  toast.classList.add('visible');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('visible');
  }, 2600);
}

function initTheme() {
  const saved = localStorage.getItem('almuslim_theme');
  const toggle = document.getElementById('dark-mode-toggle');

  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (toggle) toggle.checked = true;
  } else if (saved === 'light') {
    document.documentElement.removeAttribute('data-theme');
    if (toggle) toggle.checked = false;
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const hour = new Date().getHours();
    if (prefersDark || hour >= 19 || hour < 6) {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (toggle) toggle.checked = true;
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (toggle) toggle.checked = false;
    }
  }
}

function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('almuslim_theme', 'light');
    showToast('تم تفعيل المظهر النهاري', 'sun');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('almuslim_theme', 'dark');
    showToast('تم تفعيل المظهر الليلي', 'moon');
  }
}

function showKhushoo(prayerName) {
  const enabled = localStorage.getItem('almuslim_khushoo') !== 'false';
  if (!enabled) return;

  const overlay = document.getElementById('khushoo-overlay');
  const titleEl = document.getElementById('khushoo-prayer-name');
  if (titleEl) titleEl.textContent = `حان الآن وقت صلاة ${prayerName}`;
  if (overlay) overlay.classList.add('visible');

  setTimeout(() => dismissKhushoo(), 25000);
}

function dismissKhushoo() {
  const overlay = document.getElementById('khushoo-overlay');
  if (overlay) overlay.classList.remove('visible');
}

function toggleKhushooMode() {
  const toggle = document.getElementById('khushoo-toggle');
  if (toggle) {
    localStorage.setItem('almuslim_khushoo', toggle.checked);
    showToast(toggle.checked ? 'تم تفعيل وضع الخشوع' : 'تم تعطيل وضع الخشوع', 'bell');
  }
}

function saveData(key, data) {
  try {
    localStorage.setItem(`almuslim_${key}`, JSON.stringify(data));
  } catch (e) {}
}

function loadData(key, fallback = null) {
  try {
    const data = localStorage.getItem(`almuslim_${key}`);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 3 && hour < 12) return 'صباح الخير والبركة';
  if (hour >= 12 && hour < 17) return 'طاب يومكم بذكر الله';
  if (hour >= 17 && hour < 21) return 'مساء الخير والسكينة';
  return 'طابت ليلتكم بذكر الرحمن';
}

function formatTime12(time24) {
  if (!time24 || time24 === '--:--') return '--:--';
  const parts = time24.split(':');
  let h = parseInt(parts[0]);
  const m = parts[1];
  const ampm = h >= 12 ? 'م' : 'ص';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function initApp() {
  initTheme();

  const greetingEl = document.getElementById('greeting-text');
  if (greetingEl) greetingEl.textContent = getGreeting();

  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateMiladiEl = document.getElementById('date-miladi');
  if (dateMiladiEl) {
    dateMiladiEl.textContent = now.toLocaleDateString('ar-SA', options);
  }

  const lastPage = localStorage.getItem('almuslim_currentPage') || 'home';
  navigateTo(lastPage);

  if (typeof initHome === 'function') initHome();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', initApp);
