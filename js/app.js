/* ============================================
   المسلم - App Shell & Core
   ============================================ */

let qiblaOrientationHandler = null;
let qiblaBearing = 0;

// ============ Navigation ============
function navigateTo(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Show target page
  const targetPage = document.getElementById(`page-${page}`);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Activate nav item
  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');

  // Save current page
  localStorage.setItem('almuslim_currentPage', page);

  // Trigger page-specific init
  if (page === 'azkar' && typeof initAzkar === 'function') initAzkar();
  if (page === 'live' && typeof initLive === 'function') initLive();
  if (page === 'settings' && typeof initSettings === 'function') initSettings();
  if (page === 'quran' && typeof initQuran === 'function') initQuran();
}

// ============ Modal Helpers ============
function showModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('visible');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('visible');

  if (id === 'qibla-modal' && qiblaOrientationHandler) {
    window.removeEventListener('deviceorientation', qiblaOrientationHandler);
    qiblaOrientationHandler = null;
  }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('visible');
    if (e.target.id === 'qibla-modal' && qiblaOrientationHandler) {
      window.removeEventListener('deviceorientation', qiblaOrientationHandler);
      qiblaOrientationHandler = null;
    }
  }
});

// ============ Toast Notifications ============
function showToast(text, icon = '✅') {
  const toast = document.getElementById('toast');
  document.getElementById('toast-icon').textContent = icon;
  document.getElementById('toast-text').textContent = text;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2500);
}

// ============ Dark Mode ============
function initTheme() {
  const saved = localStorage.getItem('almuslim_theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) toggle.checked = true;
  } else if (saved === null) {
    // Auto mode
    const hour = new Date().getHours();
    if (hour >= 19 || hour < 6) {
      document.documentElement.setAttribute('data-theme', 'dark');
      const toggle = document.getElementById('dark-mode-toggle');
      if (toggle) toggle.checked = true;
    }
  }
}

function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('almuslim_theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('almuslim_theme', 'dark');
  }
}

// ============ Khushoo Mode ============
function showKhushoo(prayerName) {
  const enabled = localStorage.getItem('almuslim_khushoo') !== 'false';
  if (!enabled) return;

  const overlay = document.getElementById('khushoo-overlay');
  document.getElementById('khushoo-prayer-name').textContent = prayerName;
  overlay.classList.add('visible');

  // Auto dismiss after 15 seconds
  setTimeout(() => dismissKhushoo(), 15000);
}

function dismissKhushoo() {
  document.getElementById('khushoo-overlay').classList.remove('visible');
}

function toggleKhushooMode() {
  const toggle = document.getElementById('khushoo-toggle');
  localStorage.setItem('almuslim_khushoo', toggle.checked);
}

// ============ Qibla Direction ============
function showQibla() {
  showModal('qibla-modal');
  calculateQibla();
}

function calculateQibla() {
  if (!navigator.geolocation) {
    document.getElementById('qibla-label').textContent = 'المتصفح لا يدعم تحديد الموقع';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const kaabaLat = 21.4225;
      const kaabaLng = 39.8262;

      const dLng = toRad(kaabaLng - lng);
      const lat1 = toRad(lat);
      const lat2 = toRad(kaabaLat);

      const y = Math.sin(dLng) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
      let bearing = toDeg(Math.atan2(y, x));
      bearing = (bearing + 360) % 360;
      qiblaBearing = bearing;

      const arrow = document.getElementById('qibla-arrow');
      arrow.style.transform = `translateX(-50%) rotate(${bearing}deg)`;
      document.getElementById('qibla-label').textContent = 'اتجاه القبلة من موقعك';
      document.getElementById('qibla-degree').textContent = `${bearing.toFixed(1)}° من الشمال`;

      if (window.DeviceOrientationEvent) {
        if (qiblaOrientationHandler) {
          window.removeEventListener('deviceorientation', qiblaOrientationHandler);
        }

        qiblaOrientationHandler = (e) => {
          if (e.alpha !== null) {
            const heading = e.alpha;
            const adjustedBearing = qiblaBearing - heading;
            arrow.style.transform = `translateX(-50%) rotate(${adjustedBearing}deg)`;
          }
        };

        window.addEventListener('deviceorientation', qiblaOrientationHandler);
      }
    },
    (err) => {
      document.getElementById('qibla-label').textContent = 'لم نستطع تحديد موقعك. يرجى السماح بالوصول للموقع.';
    }
  );
}

function toRad(deg) { return deg * Math.PI / 180; }
function toDeg(rad) { return rad * 180 / Math.PI; }

// ============ LocalStorage Helpers ============
function saveData(key, data) {
  localStorage.setItem(`almuslim_${key}`, JSON.stringify(data));
}

function loadData(key, fallback = null) {
  const data = localStorage.getItem(`almuslim_${key}`);
  return data ? JSON.parse(data) : fallback;
}

// ============ Greeting by Time ============
function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 3 && hour < 12) return 'صباح الخير ☀️';
  if (hour >= 12 && hour < 17) return 'مساء النور 🌤️';
  if (hour >= 17 && hour < 21) return 'مساء الخير 🌇';
  return 'طابت ليلتك 🌙';
}

// ============ Format Time ============
function formatTime12(time24) {
  if (!time24) return '--:--';
  const [hours, minutes] = time24.split(':');
  let h = parseInt(hours);
  const ampm = h >= 12 ? 'م' : 'ص';
  h = h % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
}

// ============ Initialize App ============
function initApp() {
  initTheme();

  // Set greeting
  document.getElementById('greeting-text').textContent = getGreeting();

  // Set miladi date
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('date-miladi').textContent = now.toLocaleDateString('ar', options);

  // Restore last page
  const lastPage = localStorage.getItem('almuslim_currentPage');
  if (lastPage && lastPage !== 'home') {
    navigateTo(lastPage);
  }

  // Init home page
  if (typeof initHome === 'function') initHome();

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

// Run on load
document.addEventListener('DOMContentLoaded', initApp);
