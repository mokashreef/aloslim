let settingsInitialized = false;

function initSettings() {
  if (settingsInitialized) return;
  settingsInitialized = true;

  loadPrayerMethodOptions();
  loadIntentionNote();
  loadWorshipLogGrid();
  loadSettingToggles();
  renderSettingsIcons();

  if (typeof initLive === 'function') initLive();
  if (typeof initQibla === 'function') initQibla();
}

function renderSettingsIcons() {
  const iconTargets = [
    { id: 'settings-icon-theme', icon: 'moon' },
    { id: 'settings-icon-method', icon: 'clock' },
    { id: 'settings-icon-madhab', icon: 'mosque' },
    { id: 'settings-icon-city', icon: 'mapPin' },
    { id: 'settings-icon-khushoo', icon: 'bell' },
    { id: 'settings-icon-sound', icon: 'audioSound' },
    { id: 'settings-icon-vibrate', icon: 'vibrate' },
    { id: 'settings-icon-about', icon: 'info' }
  ];

  iconTargets.forEach(t => {
    const el = document.getElementById(t.id);
    if (el && typeof getIcon === 'function') {
      el.innerHTML = getIcon(t.icon, '', 20);
    }
  });
}

function loadPrayerMethodOptions() {
  const select = document.getElementById('calc-method-select');
  if (!select || typeof PrayTimes === 'undefined') return;

  const methods = PrayTimes.getMethods();
  const current = localStorage.getItem('almuslim_prayer_method') || PrayTimes.getMethod();

  select.innerHTML = '';
  Object.keys(methods).forEach(key => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = methods[key].name;
    if (key === current) opt.selected = true;
    select.appendChild(opt);
  });

  select.onchange = () => {
    const val = select.value;
    localStorage.setItem('almuslim_prayer_method', val);
    if (typeof PrayTimes !== 'undefined') PrayTimes.setMethod(val);
    localStorage.removeItem('almuslim_prayerTimesCache');
    showToast('تم حفظ طريقة الحساب وتحديث المواقيت', 'check');
    if (typeof fetchPrayerTimes === 'function') fetchPrayerTimes();
  };

  const madhabSelect = document.getElementById('madhab-select');
  if (madhabSelect) {
    const savedMadhab = localStorage.getItem('almuslim_madhab') || '0';
    madhabSelect.value = savedMadhab;
    madhabSelect.onchange = () => {
      localStorage.setItem('almuslim_madhab', madhabSelect.value);
      if (typeof PrayTimes !== 'undefined') {
        PrayTimes.setAsrMadhab(madhabSelect.value);
      }
      localStorage.removeItem('almuslim_prayerTimesCache');
      showToast('تم تحديث المذهب الفقهي', 'check');
      if (typeof fetchPrayerTimes === 'function') fetchPrayerTimes();
    };
  }
}

function loadIntentionNote() {
  const textarea = document.getElementById('intention-input');
  if (!textarea) return;

  const today = new Date().toDateString();
  const saved = loadData('dailyIntention', { date: '', text: '' });

  if (saved.date === today) {
    textarea.value = saved.text;
  }
}

function saveIntentionNote() {
  const textarea = document.getElementById('intention-input');
  if (!textarea) return;

  saveData('dailyIntention', {
    date: new Date().toDateString(),
    text: textarea.value
  });
}

function loadWorshipLogGrid() {
  const container = document.getElementById('worship-log-grid');
  if (!container) return;

  const log = loadData('worshipLogMap', {});
  container.innerHTML = '';

  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    const dayNumber = d.getDate();

    const cell = document.createElement('button');
    cell.className = 'worship-day-cell';
    if (log[key] === 'full') {
      cell.classList.add('level-full');
    } else if (log[key] === 'partial') {
      cell.classList.add('level-partial');
    }

    if (i === 0) {
      cell.classList.add('today');
    }

    cell.textContent = dayNumber;
    cell.onclick = () => toggleWorshipDayStatus(key, cell);

    container.appendChild(cell);
  }
}

function toggleWorshipDayStatus(dateKey, cellElement) {
  const log = loadData('worshipLogMap', {});

  if (!log[dateKey]) {
    log[dateKey] = 'partial';
    cellElement.className = 'worship-day-cell level-partial';
  } else if (log[dateKey] === 'partial') {
    log[dateKey] = 'full';
    cellElement.className = 'worship-day-cell level-full';
  } else {
    delete log[dateKey];
    cellElement.className = 'worship-day-cell';
  }

  saveData('worshipLogMap', log);
}

function loadSettingToggles() {
  const khushooToggle = document.getElementById('khushoo-toggle');
  if (khushooToggle) {
    const val = localStorage.getItem('almuslim_khushoo');
    khushooToggle.checked = val !== 'false';
  }

  const soundToggle = document.getElementById('sound-click-toggle');
  if (soundToggle) {
    const val = localStorage.getItem('almuslim_sound_click');
    soundToggle.checked = val !== 'false';
    soundToggle.onchange = () => {
      localStorage.setItem('almuslim_sound_click', soundToggle.checked);
      showToast(soundToggle.checked ? 'تم تفعيل صوت النقر' : 'تم كتم الصوت', 'audioSound');
    };
  }

  const vibrateToggle = document.getElementById('vibrate-toggle');
  if (vibrateToggle) {
    const val = localStorage.getItem('almuslim_vibrate_global');
    vibrateToggle.checked = val !== 'false';
    vibrateToggle.onchange = () => {
      localStorage.setItem('almuslim_vibrate_global', vibrateToggle.checked);
      showToast(vibrateToggle.checked ? 'تم تفعيل الاهتزاز' : 'تم تعطيل الاهتزاز', 'vibrate');
    };
  }
}
