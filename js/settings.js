/* ============================================
   المسلم - Settings & Extra Features
   ============================================ */

let settingsInitialized = false;

function initSettings() {
  if (settingsInitialized) return;
  settingsInitialized = true;

  loadIntention();
  loadMadhab();
  loadWorshipLog();
  loadToggles();
  updateAppInfo();
}

// ============ Daily Intention ============
function loadIntention() {
  const today = new Date().toDateString();
  const saved = loadData('intention', { date: '', text: '' });

  if (saved.date === today) {
    const el = document.getElementById('intention-input');
    if (el) el.value = saved.text;
  }
}

function saveIntention() {
  const text = document.getElementById('intention-input').value;
  saveData('intention', {
    date: new Date().toDateString(),
    text: text
  });
}

// ============ Madhab ============
function loadMadhab() {
  const madhab = localStorage.getItem('almuslim_madhab') || '0';
  const el = document.getElementById('madhab-select');
  if (el) el.value = madhab;
}

function saveMadhab() {
  const madhab = document.getElementById('madhab-select').value;
  localStorage.setItem('almuslim_madhab', madhab);
  localStorage.removeItem('almuslim_prayerTimesCache');
  showToast('تم تحديث المذهب. سيتم تحديث المواقيت.', '🕌');
  if (typeof fetchPrayerTimes === 'function') fetchPrayerTimes();
}

function refreshPrayerTimes() {
  localStorage.removeItem('almuslim_prayerTimesCache');
  if (typeof fetchPrayerTimes === 'function') {
    fetchPrayerTimes();
    showToast('جارٍ تحديث مواقيت الصلاة', '🔄');
  }
}

// ============ Worship Log ============
function loadWorshipLog() {
  const log = loadData('worshipLog', {});
  const container = document.getElementById('worship-log');
  if (!container) return;
  container.innerHTML = '';

  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toDateString();
    const dayNum = date.getDate();

    const div = document.createElement('div');
    div.className = 'worship-day';

    if (log[key] === 'full') {
      div.className += ' active';
    } else if (log[key] === 'partial') {
      div.className += ' partial';
    }

    if (i === 0) {
      div.style.fontWeight = '800';
    }

    div.textContent = dayNum;
    div.onclick = () => toggleWorshipDay(key, div);
    container.appendChild(div);
  }
}

function toggleWorshipDay(key, element) {
  const log = loadData('worshipLog', {});

  if (!log[key]) {
    log[key] = 'partial';
    element.className = 'worship-day partial';
  } else if (log[key] === 'partial') {
    log[key] = 'full';
    element.className = 'worship-day active';
  } else {
    delete log[key];
    element.className = 'worship-day';
  }

  saveData('worshipLog', log);
}

function updateAppInfo() {
  const appVersionEl = document.getElementById('app-version');
  if (appVersionEl) {
    appVersionEl.textContent = 'الإصدار 1.1.0';
  }

  const lastSyncEl = document.getElementById('last-sync');
  if (lastSyncEl) {
    const now = new Date();
    lastSyncEl.textContent = `آخر تحديث: ${now.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}`;
  }
}

function resetAppData() {
  const keysToClear = [
    'almuslim_prayerTimesCache',
    'almuslim_intention',
    'almuslim_worshipLog',
    'almuslim_lastSurah',
    'almuslim_readingStats',
    'almuslim_khushoo',
    'almuslim_azkarReminder',
    'almuslim_currentPage',
    'almuslim_theme'
  ];

  keysToClear.forEach((key) => localStorage.removeItem(key));

  const themeToggle = document.getElementById('dark-mode-toggle');
  if (themeToggle) themeToggle.checked = false;

  const khushooToggle = document.getElementById('khushoo-toggle');
  if (khushooToggle) khushooToggle.checked = true;

  if (typeof initHome === 'function') initHome();
  if (typeof initQuran === 'function') initQuran();

  showToast('تم إعادة ضبط البيانات بنجاح', '✅');
}

// ============ Toggle Saves ============
function loadToggles() {
  const khushoo = localStorage.getItem('almuslim_khushoo');
  const khushooToggle = document.getElementById('khushoo-toggle');
  if (khushoo !== null && khushooToggle) {
    khushooToggle.checked = khushoo === 'true';
  }

  const azkarReminder = localStorage.getItem('almuslim_azkarReminder');
  const azkarReminderToggle = document.getElementById('azkar-reminder-toggle');
  if (azkarReminder !== null && azkarReminderToggle) {
    azkarReminderToggle.checked = azkarReminder !== 'false';
  }
}

function toggleAzkarReminder() {
  const toggle = document.getElementById('azkar-reminder-toggle');
  localStorage.setItem('almuslim_azkarReminder', toggle.checked);
  if (toggle.checked) {
    showToast('تم تفعيل تذكير الأذكار', '🔔');
  }
}
