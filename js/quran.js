/* ============================================
   المسلم - Quran Page
   ============================================ */

let currentSurah = null;
let surahsData = [];
let quranAudio = new Audio();
let currentAyahIndex = 0;
let totalAyahs = 0;
let isPlaying = false;
let isRepeat = false;
let currentSurahAyahs = [];
let readingStartTime = null;

// Surahs metadata
const SURAHS_META = [
  {n:1,name:"الفاتحة",en:"Al-Fatiha",ayahs:7,type:"مكية"},
  {n:2,name:"البقرة",en:"Al-Baqarah",ayahs:286,type:"مدنية"},
  {n:3,name:"آل عمران",en:"Aal-Imran",ayahs:200,type:"مدنية"},
  {n:4,name:"النساء",en:"An-Nisa",ayahs:176,type:"مدنية"},
  {n:5,name:"المائدة",en:"Al-Ma'idah",ayahs:120,type:"مدنية"},
  {n:6,name:"الأنعام",en:"Al-An'am",ayahs:165,type:"مكية"},
  {n:7,name:"الأعراف",en:"Al-A'raf",ayahs:206,type:"مكية"},
  {n:8,name:"الأنفال",en:"Al-Anfal",ayahs:75,type:"مدنية"},
  {n:9,name:"التوبة",en:"At-Tawbah",ayahs:129,type:"مدنية"},
  {n:10,name:"يونس",en:"Yunus",ayahs:109,type:"مكية"},
  {n:11,name:"هود",en:"Hud",ayahs:123,type:"مكية"},
  {n:12,name:"يوسف",en:"Yusuf",ayahs:111,type:"مكية"},
  {n:13,name:"الرعد",en:"Ar-Ra'd",ayahs:43,type:"مدنية"},
  {n:14,name:"إبراهيم",en:"Ibrahim",ayahs:52,type:"مكية"},
  {n:15,name:"الحجر",en:"Al-Hijr",ayahs:99,type:"مكية"},
  {n:16,name:"النحل",en:"An-Nahl",ayahs:128,type:"مكية"},
  {n:17,name:"الإسراء",en:"Al-Isra",ayahs:111,type:"مكية"},
  {n:18,name:"الكهف",en:"Al-Kahf",ayahs:110,type:"مكية"},
  {n:19,name:"مريم",en:"Maryam",ayahs:98,type:"مكية"},
  {n:20,name:"طه",en:"Ta-Ha",ayahs:135,type:"مكية"},
  {n:21,name:"الأنبياء",en:"Al-Anbiya",ayahs:112,type:"مكية"},
  {n:22,name:"الحج",en:"Al-Hajj",ayahs:78,type:"مدنية"},
  {n:23,name:"المؤمنون",en:"Al-Mu'minun",ayahs:118,type:"مكية"},
  {n:24,name:"النور",en:"An-Nur",ayahs:64,type:"مدنية"},
  {n:25,name:"الفرقان",en:"Al-Furqan",ayahs:77,type:"مكية"},
  {n:26,name:"الشعراء",en:"Ash-Shu'ara",ayahs:227,type:"مكية"},
  {n:27,name:"النمل",en:"An-Naml",ayahs:93,type:"مكية"},
  {n:28,name:"القصص",en:"Al-Qasas",ayahs:88,type:"مكية"},
  {n:29,name:"العنكبوت",en:"Al-Ankabut",ayahs:69,type:"مكية"},
  {n:30,name:"الروم",en:"Ar-Rum",ayahs:60,type:"مكية"},
  {n:31,name:"لقمان",en:"Luqman",ayahs:34,type:"مكية"},
  {n:32,name:"السجدة",en:"As-Sajdah",ayahs:30,type:"مكية"},
  {n:33,name:"الأحزاب",en:"Al-Ahzab",ayahs:73,type:"مدنية"},
  {n:34,name:"سبأ",en:"Saba",ayahs:54,type:"مكية"},
  {n:35,name:"فاطر",en:"Fatir",ayahs:45,type:"مكية"},
  {n:36,name:"يس",en:"Ya-Sin",ayahs:83,type:"مكية"},
  {n:37,name:"الصافات",en:"As-Saffat",ayahs:182,type:"مكية"},
  {n:38,name:"ص",en:"Sad",ayahs:88,type:"مكية"},
  {n:39,name:"الزمر",en:"Az-Zumar",ayahs:75,type:"مكية"},
  {n:40,name:"غافر",en:"Ghafir",ayahs:85,type:"مكية"},
  {n:41,name:"فصلت",en:"Fussilat",ayahs:54,type:"مكية"},
  {n:42,name:"الشورى",en:"Ash-Shura",ayahs:53,type:"مكية"},
  {n:43,name:"الزخرف",en:"Az-Zukhruf",ayahs:89,type:"مكية"},
  {n:44,name:"الدخان",en:"Ad-Dukhan",ayahs:59,type:"مكية"},
  {n:45,name:"الجاثية",en:"Al-Jathiyah",ayahs:37,type:"مكية"},
  {n:46,name:"الأحقاف",en:"Al-Ahqaf",ayahs:35,type:"مكية"},
  {n:47,name:"محمد",en:"Muhammad",ayahs:38,type:"مدنية"},
  {n:48,name:"الفتح",en:"Al-Fath",ayahs:29,type:"مدنية"},
  {n:49,name:"الحجرات",en:"Al-Hujurat",ayahs:18,type:"مدنية"},
  {n:50,name:"ق",en:"Qaf",ayahs:45,type:"مكية"},
  {n:51,name:"الذاريات",en:"Adh-Dhariyat",ayahs:60,type:"مكية"},
  {n:52,name:"الطور",en:"At-Tur",ayahs:49,type:"مكية"},
  {n:53,name:"النجم",en:"An-Najm",ayahs:62,type:"مكية"},
  {n:54,name:"القمر",en:"Al-Qamar",ayahs:55,type:"مكية"},
  {n:55,name:"الرحمن",en:"Ar-Rahman",ayahs:78,type:"مدنية"},
  {n:56,name:"الواقعة",en:"Al-Waqi'ah",ayahs:96,type:"مكية"},
  {n:57,name:"الحديد",en:"Al-Hadid",ayahs:29,type:"مدنية"},
  {n:58,name:"المجادلة",en:"Al-Mujadilah",ayahs:22,type:"مدنية"},
  {n:59,name:"الحشر",en:"Al-Hashr",ayahs:24,type:"مدنية"},
  {n:60,name:"الممتحنة",en:"Al-Mumtahanah",ayahs:13,type:"مدنية"},
  {n:61,name:"الصف",en:"As-Saff",ayahs:14,type:"مدنية"},
  {n:62,name:"الجمعة",en:"Al-Jumu'ah",ayahs:11,type:"مدنية"},
  {n:63,name:"المنافقون",en:"Al-Munafiqun",ayahs:11,type:"مدنية"},
  {n:64,name:"التغابن",en:"At-Taghabun",ayahs:18,type:"مدنية"},
  {n:65,name:"الطلاق",en:"At-Talaq",ayahs:12,type:"مدنية"},
  {n:66,name:"التحريم",en:"At-Tahrim",ayahs:12,type:"مدنية"},
  {n:67,name:"الملك",en:"Al-Mulk",ayahs:30,type:"مكية"},
  {n:68,name:"القلم",en:"Al-Qalam",ayahs:52,type:"مكية"},
  {n:69,name:"الحاقة",en:"Al-Haqqah",ayahs:52,type:"مكية"},
  {n:70,name:"المعارج",en:"Al-Ma'arij",ayahs:44,type:"مكية"},
  {n:71,name:"نوح",en:"Nuh",ayahs:28,type:"مكية"},
  {n:72,name:"الجن",en:"Al-Jinn",ayahs:28,type:"مكية"},
  {n:73,name:"المزمل",en:"Al-Muzzammil",ayahs:20,type:"مكية"},
  {n:74,name:"المدثر",en:"Al-Muddathir",ayahs:56,type:"مكية"},
  {n:75,name:"القيامة",en:"Al-Qiyamah",ayahs:40,type:"مكية"},
  {n:76,name:"الإنسان",en:"Al-Insan",ayahs:31,type:"مدنية"},
  {n:77,name:"المرسلات",en:"Al-Mursalat",ayahs:50,type:"مكية"},
  {n:78,name:"النبأ",en:"An-Naba",ayahs:40,type:"مكية"},
  {n:79,name:"النازعات",en:"An-Nazi'at",ayahs:46,type:"مكية"},
  {n:80,name:"عبس",en:"Abasa",ayahs:42,type:"مكية"},
  {n:81,name:"التكوير",en:"At-Takwir",ayahs:29,type:"مكية"},
  {n:82,name:"الانفطار",en:"Al-Infitar",ayahs:19,type:"مكية"},
  {n:83,name:"المطففين",en:"Al-Mutaffifin",ayahs:36,type:"مكية"},
  {n:84,name:"الانشقاق",en:"Al-Inshiqaq",ayahs:25,type:"مكية"},
  {n:85,name:"البروج",en:"Al-Buruj",ayahs:22,type:"مكية"},
  {n:86,name:"الطارق",en:"At-Tariq",ayahs:17,type:"مكية"},
  {n:87,name:"الأعلى",en:"Al-A'la",ayahs:19,type:"مكية"},
  {n:88,name:"الغاشية",en:"Al-Ghashiyah",ayahs:26,type:"مكية"},
  {n:89,name:"الفجر",en:"Al-Fajr",ayahs:30,type:"مكية"},
  {n:90,name:"البلد",en:"Al-Balad",ayahs:20,type:"مكية"},
  {n:91,name:"الشمس",en:"Ash-Shams",ayahs:15,type:"مكية"},
  {n:92,name:"الليل",en:"Al-Layl",ayahs:21,type:"مكية"},
  {n:93,name:"الضحى",en:"Ad-Duha",ayahs:11,type:"مكية"},
  {n:94,name:"الشرح",en:"Ash-Sharh",ayahs:8,type:"مكية"},
  {n:95,name:"التين",en:"At-Tin",ayahs:8,type:"مكية"},
  {n:96,name:"العلق",en:"Al-Alaq",ayahs:19,type:"مكية"},
  {n:97,name:"القدر",en:"Al-Qadr",ayahs:5,type:"مكية"},
  {n:98,name:"البينة",en:"Al-Bayyinah",ayahs:8,type:"مدنية"},
  {n:99,name:"الزلزلة",en:"Az-Zalzalah",ayahs:8,type:"مدنية"},
  {n:100,name:"العاديات",en:"Al-Adiyat",ayahs:11,type:"مكية"},
  {n:101,name:"القارعة",en:"Al-Qari'ah",ayahs:11,type:"مكية"},
  {n:102,name:"التكاثر",en:"At-Takathur",ayahs:8,type:"مكية"},
  {n:103,name:"العصر",en:"Al-Asr",ayahs:3,type:"مكية"},
  {n:104,name:"الهمزة",en:"Al-Humazah",ayahs:9,type:"مكية"},
  {n:105,name:"الفيل",en:"Al-Fil",ayahs:5,type:"مكية"},
  {n:106,name:"قريش",en:"Quraysh",ayahs:4,type:"مكية"},
  {n:107,name:"الماعون",en:"Al-Ma'un",ayahs:7,type:"مكية"},
  {n:108,name:"الكوثر",en:"Al-Kawthar",ayahs:3,type:"مكية"},
  {n:109,name:"الكافرون",en:"Al-Kafirun",ayahs:6,type:"مكية"},
  {n:110,name:"النصر",en:"An-Nasr",ayahs:3,type:"مدنية"},
  {n:111,name:"المسد",en:"Al-Masad",ayahs:5,type:"مكية"},
  {n:112,name:"الإخلاص",en:"Al-Ikhlas",ayahs:4,type:"مكية"},
  {n:113,name:"الفلق",en:"Al-Falaq",ayahs:5,type:"مكية"},
  {n:114,name:"الناس",en:"An-Nas",ayahs:6,type:"مكية"}
];

function initQuran() {
  populateSurahSelector();
  loadReadingStats();
  // Restore last read surah
  const lastSurah = loadData('lastSurah');
  if (lastSurah && !currentSurah) {
    loadSurah(lastSurah);
  }
}

// ============ Populate Surah Dropdown ============
function populateSurahSelector() {
  const selector = document.getElementById('surah-selector');
  if (selector.options.length > 1) return; // Already populated

  SURAHS_META.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.n;
    opt.textContent = `${s.n}. ${s.name}`;
    selector.appendChild(opt);
  });

  // Populate surah list modal
  populateSurahList();
}

function populateSurahList() {
  const container = document.getElementById('surah-list-container');
  container.innerHTML = '';

  SURAHS_META.forEach(s => {
    const div = document.createElement('div');
    div.className = 'surah-list-item';
    div.setAttribute('data-search', `${s.name} ${s.en}`);
    div.onclick = () => {
      loadSurah(s.n);
      closeModal('surah-list-modal');
    };
    div.innerHTML = `
      <div class="surah-num">${s.n}</div>
      <div class="surah-details">
        <div class="surah-ar-name">سورة ${s.name}</div>
        <div class="surah-meta">${s.type} • ${s.ayahs} آية</div>
      </div>
    `;
    container.appendChild(div);
  });
}

function toggleSurahList() {
  showModal('surah-list-modal');
}

function filterSurahs(query) {
  const items = document.querySelectorAll('.surah-list-item');
  items.forEach(item => {
    const searchText = item.getAttribute('data-search').toLowerCase();
    item.style.display = searchText.includes(query.toLowerCase()) || query === '' ? 'flex' : 'none';
  });
}

// ============ Load Surah ============
function loadSurah(surahNumber) {
  if (!surahNumber) return;

  surahNumber = parseInt(surahNumber);
  currentSurah = surahNumber;

  // Save last read
  saveData('lastSurah', surahNumber);

  // Start reading timer
  readingStartTime = Date.now();

  // Update selector
  document.getElementById('surah-selector').value = surahNumber;

  // Show loading
  document.getElementById('quran-empty').style.display = 'none';
  document.getElementById('quran-loading').style.display = 'block';
  document.getElementById('ayah-container').innerHTML = '';

  const surahMeta = SURAHS_META[surahNumber - 1];

  // Update header
  const header = document.getElementById('surah-header');
  header.style.display = 'block';
  document.getElementById('surah-name-display').textContent = `سورة ${surahMeta.name}`;
  document.getElementById('surah-info-display').textContent = `${surahMeta.type} • ${surahMeta.ayahs} آية`;

  // Hide bismillah for At-Tawbah
  header.querySelector('.bismillah-text').style.display = surahNumber === 9 ? 'none' : 'block';

  // Fetch from API
  fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('quran-loading').style.display = 'none';

      if (data.code === 200) {
        currentSurahAyahs = data.data.ayahs;
        totalAyahs = currentSurahAyahs.length;
        displayAyahs(currentSurahAyahs);
      }
    })
    .catch(() => {
      document.getElementById('quran-loading').style.display = 'none';
      // Try text-only
      fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`)
        .then(res => res.json())
        .then(data => {
          if (data.code === 200) {
            currentSurahAyahs = data.data.ayahs;
            totalAyahs = currentSurahAyahs.length;
            displayAyahs(currentSurahAyahs);
          }
        });
    });
}

// ============ Display Ayahs ============
function displayAyahs(ayahs) {
  const container = document.getElementById('ayah-container');
  container.innerHTML = '';

  const favorites = loadData('favorites', []);

  // Show all ayahs as a flowing text block
  const ayahCard = document.createElement('div');
  ayahCard.className = 'ayah-container';

  let textHTML = '';
  ayahs.forEach((ayah, index) => {
    const isFav = favorites.includes(`${currentSurah}:${ayah.numberInSurah}`);
    textHTML += `<span class="ayah-span" data-index="${index}" id="ayah-${index}">${ayah.text} <span class="ayah-number">${ayah.numberInSurah}</span></span> `;
  });

  ayahCard.innerHTML = `
    <div class="ayah-text">${textHTML}</div>
    <div class="ayah-actions">
      <button class="ayah-action-btn" onclick="playFromAyah(0)" title="تشغيل صوتي">▶</button>
      <button class="ayah-action-btn" onclick="copySurahText()" title="نسخ">📋</button>
      <button class="ayah-action-btn" onclick="shareSurah()" title="مشاركة">📤</button>
    </div>
  `;

  container.appendChild(ayahCard);

  // Track pages read
  updateReadingStats();
}

// ============ Audio Player ============
function playFromAyah(index) {
  currentAyahIndex = index;
  const player = document.getElementById('quran-audio-player');
  player.classList.add('visible');

  const reciter = document.getElementById('reciter-select').value;
  const reciterName = document.getElementById('reciter-select').selectedOptions[0].text;
  document.getElementById('audio-reciter-display').textContent = reciterName;

  playCurrentAyah();
}

function playCurrentAyah() {
  if (!currentSurahAyahs[currentAyahIndex]) return;

  const ayah = currentSurahAyahs[currentAyahIndex];
  const reciter = document.getElementById('reciter-select').value;

  // Build audio URL
  const audioUrl = ayah.audio || `https://cdn.islamic.network/quran/audio/128/${reciter}/${ayah.number}.mp3`;

  quranAudio.src = audioUrl;
  quranAudio.play().catch(() => {});
  isPlaying = true;
  document.getElementById('play-btn').textContent = '⏸';
  document.getElementById('audio-now-playing').textContent = `الآية ${ayah.numberInSurah} من سورة ${SURAHS_META[currentSurah - 1].name}`;

  // Highlight current ayah
  document.querySelectorAll('.ayah-span').forEach(s => s.style.background = 'transparent');
  const currentSpan = document.getElementById(`ayah-${currentAyahIndex}`);
  if (currentSpan) {
    currentSpan.style.background = 'var(--accent-light)';
    currentSpan.style.borderRadius = '4px';
    currentSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Progress bar
  quranAudio.ontimeupdate = () => {
    if (quranAudio.duration) {
      const progress = (quranAudio.currentTime / quranAudio.duration) * 100;
      document.getElementById('audio-progress-bar').style.width = `${progress}%`;
    }
  };

  // Auto next
  quranAudio.onended = () => {
    if (isRepeat) {
      playCurrentAyah();
    } else if (currentAyahIndex < totalAyahs - 1) {
      currentAyahIndex++;
      playCurrentAyah();
    } else {
      isPlaying = false;
      document.getElementById('play-btn').textContent = '▶';
    }
  };
}

function togglePlay() {
  if (isPlaying) {
    quranAudio.pause();
    isPlaying = false;
    document.getElementById('play-btn').textContent = '▶';
  } else {
    if (quranAudio.src) {
      quranAudio.play().catch(() => {});
      isPlaying = true;
      document.getElementById('play-btn').textContent = '⏸';
    } else {
      playFromAyah(0);
    }
  }
}

function nextAyah() {
  if (currentAyahIndex < totalAyahs - 1) {
    currentAyahIndex++;
    playCurrentAyah();
  }
}

function prevAyah() {
  if (currentAyahIndex > 0) {
    currentAyahIndex--;
    playCurrentAyah();
  }
}

function toggleRepeat() {
  isRepeat = !isRepeat;
  const btn = document.getElementById('repeat-btn');
  btn.style.color = isRepeat ? 'var(--accent)' : 'var(--text-secondary)';
  btn.style.background = isRepeat ? 'var(--accent-light)' : 'transparent';
}

function closeAudioPlayer() {
  quranAudio.pause();
  isPlaying = false;
  document.getElementById('quran-audio-player').classList.remove('visible');
  document.querySelectorAll('.ayah-span').forEach(s => s.style.background = 'transparent');
}

function seekAudio(event) {
  const bar = event.currentTarget;
  const rect = bar.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const percent = x / rect.width;
  if (quranAudio.duration) {
    quranAudio.currentTime = percent * quranAudio.duration;
  }
}

// ============ Copy & Share ============
function copySurahText() {
  if (!currentSurahAyahs.length) return;
  const text = currentSurahAyahs.map(a => a.text).join(' ');
  navigator.clipboard.writeText(text).then(() => {
    showToast('تم نسخ النص', '📋');
  }).catch(() => {});
}

function shareSurah() {
  if (!currentSurahAyahs.length) return;
  const surahName = SURAHS_META[currentSurah - 1].name;
  const text = `سورة ${surahName}\n\n${currentSurahAyahs.slice(0, 5).map(a => a.text).join(' ')}...`;

  if (navigator.share) {
    navigator.share({ title: `سورة ${surahName}`, text: text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      showToast('تم نسخ النص للمشاركة', '📤');
    });
  }
}

// ============ Reading Stats ============
function loadReadingStats() {
  const stats = loadData('readingStats', { pages: 0, time: 0, streak: 0, lastDate: '' });
  const today = new Date().toDateString();

  if (stats.lastDate !== today) {
    stats.pages = 0;
    stats.time = 0;
    // Check streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (stats.lastDate === yesterday.toDateString()) {
      stats.streak++;
    } else if (stats.lastDate !== today) {
      stats.streak = 0;
    }
  }

  document.getElementById('stat-pages').textContent = stats.pages;
  document.getElementById('stat-time').textContent = stats.time;
  document.getElementById('stat-streak').textContent = stats.streak;
}

function updateReadingStats() {
  const stats = loadData('readingStats', { pages: 0, time: 0, streak: 0, lastDate: '' });
  const today = new Date().toDateString();

  if (stats.lastDate !== today) {
    stats.pages = 0;
    stats.time = 0;
  }

  stats.pages++;
  stats.lastDate = today;

  if (readingStartTime) {
    stats.time += Math.round((Date.now() - readingStartTime) / 60000);
    readingStartTime = Date.now();
  }

  saveData('readingStats', stats);
  loadReadingStats();
}
