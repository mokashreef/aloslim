/* ============================================
   المسلم - Settings & Extra Features
   ============================================ */

let settingsInitialized = false;

function initSettings() {
  if (settingsInitialized) return;
  settingsInitialized = true;

  // Load saved settings
  loadIntention();
  loadMadhab();
  loadWorshipLog();
  loadToggles();
}

// ============ Daily Intention ============
function loadIntention() {
  const today = new Date().toDateString();
  const saved = loadData('intention', { date: '', text: '' });

  if (saved.date === today) {
    document.getElementById('intention-input').value = saved.text;
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
  document.getElementById('madhab-select').value = madhab;
}

function saveMadhab() {
  const madhab = document.getElementById('madhab-select').value;
  localStorage.setItem('almuslim_madhab', madhab);
  // Clear cached prayer times to refetch
  localStorage.removeItem('almuslim_prayerTimesCache');
  showToast('تم تحديث المذهب. سيتم تحديث المواقيت.', '🕌');
  if (typeof fetchPrayerTimes === 'function') fetchPrayerTimes();
}

// ============ Worship Log ============
function loadWorshipLog() {
  const log = loadData('worshipLog', {});
  const container = document.getElementById('worship-log');
  container.innerHTML = '';

  // Show last 28 days
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

    // Highlight today
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

// ============ Toggle Saves ============
function loadToggles() {
  const khushoo = localStorage.getItem('almuslim_khushoo');
  if (khushoo !== null) {
    document.getElementById('khushoo-toggle').checked = khushoo === 'true';
  }

  const azkarReminder = localStorage.getItem('almuslim_azkarReminder');
  if (azkarReminder !== null) {
    document.getElementById('azkar-reminder-toggle').checked = azkarReminder !== 'false';
  }
}

function toggleAzkarReminder() {
  const toggle = document.getElementById('azkar-reminder-toggle');
  localStorage.setItem('almuslim_azkarReminder', toggle.checked);
  if (toggle.checked) {
    showToast('تم تفعيل تذكير الأذكار', '🔔');
  }
}
