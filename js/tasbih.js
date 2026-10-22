let tasbihCount = 0;
let tasbihTarget = 33;
let tasbihCycles = 0;
let currentTasbihDhikrIndex = 0;
let tasbihSoundEnabled = true;
let tasbihVibrateEnabled = true;

const TASBIH_PRESETS = [
  { text: 'سُبْحَانَ اللَّهِ', target: 33, subtext: 'تنزيه الله عن كل نقص' },
  { text: 'الْحَمْدُ لِلَّهِ', target: 33, subtext: 'الثناء المطلق على نعم الله' },
  { text: 'اللَّهُ أَكْبَرُ', target: 33, subtext: 'التعظيم وإجلال الخالق' },
  { text: 'لَا إِلَٰهَ إِلَّا اللَّهُ', target: 100, subtext: 'أفضل ما قاله النبيون' },
  { text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', target: 100, subtext: 'ممحاة الذنوب ومجلبة الرزق' },
  { text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', target: 100, subtext: 'كنز من كنوز الجنة' },
  { text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', target: 100, subtext: 'شفاعة يوم القيامة وبركة' },
  { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ', target: 100, subtext: 'كلمتان خفيفتان على اللسان ثقيلتان في الميزان' },
  { text: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', target: 100, subtext: 'أمان وتفويض الأمر للرب' },
  { text: 'تَسْبِيحٌ حُرٌّ', target: 0, subtext: 'عدّاد مفتوح دون حد أقصى' }
];

function initTasbih() {
  loadTasbihState();
  renderTasbihPresets();
  updateTasbihUI();
}

function loadTasbihState() {
  const saved = loadData('tasbihState', {
    count: 0,
    target: 33,
    cycles: 0,
    dhikrIndex: 0,
    sound: true,
    vibrate: true
  });

  tasbihCount = saved.count || 0;
  tasbihTarget = saved.target !== undefined ? saved.target : 33;
  tasbihCycles = saved.cycles || 0;
  currentTasbihDhikrIndex = saved.dhikrIndex || 0;
  tasbihSoundEnabled = saved.sound !== undefined ? saved.sound : true;
  tasbihVibrateEnabled = saved.vibrate !== undefined ? saved.vibrate : true;

  updateTasbihStats();
}

function saveTasbihState() {
  saveData('tasbihState', {
    count: tasbihCount,
    target: tasbihTarget,
    cycles: tasbihCycles,
    dhikrIndex: currentTasbihDhikrIndex,
    sound: tasbihSoundEnabled,
    vibrate: tasbihVibrateEnabled
  });
}

function renderTasbihPresets() {
  const select = document.getElementById('tasbih-preset-select');
  if (!select) return;

  select.innerHTML = '';
  TASBIH_PRESETS.forEach((preset, index) => {
    const opt = document.createElement('option');
    opt.value = index;
    opt.textContent = `${preset.text} (${preset.target > 0 ? preset.target : 'حر'})`;
    select.appendChild(opt);
  });

  select.value = currentTasbihDhikrIndex;
}

function onTasbihDhikrChange(index) {
  currentTasbihDhikrIndex = parseInt(index);
  const preset = TASBIH_PRESETS[currentTasbihDhikrIndex];
  tasbihTarget = preset.target;
  tasbihCount = 0;
  tasbihCycles = 0;

  saveTasbihState();
  updateTasbihUI();
}

function setTasbihTarget(targetNum) {
  tasbihTarget = targetNum;
  tasbihCount = 0;
  tasbihCycles = 0;

  document.querySelectorAll('.target-pill').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.target) === targetNum);
  });

  saveTasbihState();
  updateTasbihUI();
}

function handleTasbihTap() {
  tasbihCount++;
  recordDailyTasbih();

  if (tasbihSoundEnabled && typeof playClickSound === 'function') {
    playClickSound();
  }

  const ring = document.getElementById('tasbih-btn');
  if (ring) {
    ring.classList.add('pulse');
    setTimeout(() => ring.classList.remove('pulse'), 150);
  }

  if (tasbihTarget > 0 && tasbihCount >= tasbihTarget) {
    tasbihCycles++;
    tasbihCount = 0;

    if (tasbihVibrateEnabled && navigator.vibrate) {
      navigator.vibrate([100, 60, 100, 60, 150]);
    }
    showToast('اكتملت دورة التسبيح بحمد الله', 'checkCircle');
  } else {
    if (tasbihVibrateEnabled && navigator.vibrate) {
      navigator.vibrate(25);
    }
  }

  saveTasbihState();
  updateTasbihUI();
}

function resetTasbih() {
  tasbihCount = 0;
  tasbihCycles = 0;
  saveTasbihState();
  updateTasbihUI();
  showToast('تمت إعادة ضبط العدّاد', 'refresh');
}

function toggleTasbihSound() {
  tasbihSoundEnabled = !tasbihSoundEnabled;
  saveTasbihState();
  updateTasbihControlsUI();
  showToast(tasbihSoundEnabled ? 'تم تفعيل صوت النقر' : 'تم كتم صوت النقر', 'volume');
}

function toggleTasbihVibrate() {
  tasbihVibrateEnabled = !tasbihVibrateEnabled;
  saveTasbihState();
  updateTasbihControlsUI();
  showToast(tasbihVibrateEnabled ? 'تم تفعيل الاهتزاز' : 'تم تعطيل الاهتزاز', 'vibrate');
}

function updateTasbihUI() {
  const countEl = document.getElementById('tasbih-count-display');
  const targetEl = document.getElementById('tasbih-target-display');
  const cyclesEl = document.getElementById('tasbih-cycles-display');
  const dhikrTextEl = document.getElementById('tasbih-current-text');
  const dhikrSubtextEl = document.getElementById('tasbih-current-subtext');
  const circleProgressEl = document.getElementById('tasbih-circle-progress');

  if (countEl) countEl.textContent = tasbihCount;
  if (targetEl) targetEl.textContent = tasbihTarget > 0 ? tasbihTarget : '∞';
  if (cyclesEl) cyclesEl.textContent = tasbihCycles;

  const currentPreset = TASBIH_PRESETS[currentTasbihDhikrIndex] || TASBIH_PRESETS[0];
  if (dhikrTextEl) dhikrTextEl.textContent = currentPreset.text;
  if (dhikrSubtextEl) dhikrSubtextEl.textContent = currentPreset.subtext;

  if (circleProgressEl) {
    const radius = 100;
    const circumference = 2 * Math.PI * radius;
    circleProgressEl.style.strokeDasharray = `${circumference}`;

    if (tasbihTarget > 0) {
      const progress = Math.min(tasbihCount / tasbihTarget, 1);
      circleProgressEl.style.strokeDashoffset = `${circumference * (1 - progress)}`;
    } else {
      circleProgressEl.style.strokeDashoffset = `${circumference * 0.2}`;
    }
  }

  updateTasbihControlsUI();
  updateTasbihStats();
}

function updateTasbihControlsUI() {
  const soundBtn = document.getElementById('tasbih-sound-btn');
  const vibrateBtn = document.getElementById('tasbih-vibrate-btn');

  if (soundBtn) {
    soundBtn.classList.toggle('active', tasbihSoundEnabled);
    soundBtn.innerHTML = getIcon(tasbihSoundEnabled ? 'volume' : 'volumeMute', '', 18);
  }
  if (vibrateBtn) {
    vibrateBtn.classList.toggle('active', tasbihVibrateEnabled);
    vibrateBtn.innerHTML = getIcon('vibrate', '', 18);
  }
}

function recordDailyTasbih() {
  const today = new Date().toDateString();
  const stats = loadData('dailyTasbihStats', { date: today, total: 0 });

  if (stats.date !== today) {
    stats.date = today;
    stats.total = 0;
  }

  stats.total++;
  saveData('dailyTasbihStats', stats);
  updateTasbihStats();
}

function updateTasbihStats() {
  const today = new Date().toDateString();
  const stats = loadData('dailyTasbihStats', { date: today, total: 0 });
  const totalEl = document.getElementById('tasbih-today-total');
  if (totalEl) {
    totalEl.textContent = stats.date === today ? stats.total : 0;
  }
}
