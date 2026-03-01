/* ============================================
   المسلم - Live Quran Streaming
   ============================================ */

let liveAudio = new Audio();
let currentStation = null;
let liveInitialized = false;

const RADIO_STATIONS = [
  {
    id: 'quran-radio',
    name: 'إذاعة القرآن الكريم',
    desc: 'بث مباشر 24/7',
    url: 'https://Qurango.net/radio/tarateel',
    icon: '🕌'
  },
  {
    id: 'alafasy',
    name: 'مشاري العفاسي',
    desc: 'تلاوات خاشعة',
    url: 'https://Qurango.net/radio/mishary_alafasy',
    icon: '🎙️'
  },
  {
    id: 'sudais',
    name: 'عبد الرحمن السديس',
    desc: 'إمام الحرم المكي',
    url: 'https://Qurango.net/radio/abdurrahman_alsudais',
    icon: '🕋'
  },
  {
    id: 'shuraim',
    name: 'سعود الشريم',
    desc: 'إمام الحرم المكي',
    url: 'https://Qurango.net/radio/saoud_shuraim',
    icon: '🌙'
  },
  {
    id: 'husary',
    name: 'محمود خليل الحصري',
    desc: 'رواية حفص عن عاصم',
    url: 'https://Qurango.net/radio/mahmoud_khalil_alhussary',
    icon: '📚'
  },
  {
    id: 'minshawi',
    name: 'محمد صديق المنشاوي',
    desc: 'تلاوات مجودة',
    url: 'https://Qurango.net/radio/muhammad_siddiq_alminshawi',
    icon: '✨'
  },
  {
    id: 'abdulbasit',
    name: 'عبد الباسط عبد الصمد',
    desc: 'تلاوة مرتلة',
    url: 'https://Qurango.net/radio/abdulbasit_abdulsamad',
    icon: '🌟'
  },
  {
    id: 'maher',
    name: 'ماهر المعيقلي',
    desc: 'إمام الحرم المكي',
    url: 'https://Qurango.net/radio/maher_almuaiqly',
    icon: '💫'
  },
  {
    id: 'ajamy',
    name: 'أحمد العجمي',
    desc: 'تلاوات مميزة',
    url: 'https://Qurango.net/radio/ahmed_alajamy',
    icon: '🎶'
  },
  {
    id: 'huzaify',
    name: 'علي الحذيفي',
    desc: 'إمام المسجد النبوي',
    url: 'https://Qurango.net/radio/ali_alhuzaify',
    icon: '🕌'
  }
];

function initLive() {
  if (liveInitialized) return;
  liveInitialized = true;
  renderStations();
}

function renderStations() {
  const container = document.getElementById('radio-stations');
  container.innerHTML = '';

  RADIO_STATIONS.forEach(station => {
    const div = document.createElement('div');
    div.className = `radio-station ${currentStation === station.id ? 'playing' : ''}`;
    div.id = `station-${station.id}`;
    div.onclick = () => playStation(station);

    div.innerHTML = `
      <div class="station-icon">${station.icon}</div>
      <div class="station-info">
        <div class="station-name">${station.name}</div>
        <div class="station-desc">${station.desc}</div>
      </div>
      <button class="station-play-btn">
        ${currentStation === station.id ? '⏸' : '▶'}
      </button>
    `;

    container.appendChild(div);
  });
}

function playStation(station) {
  // If same station, toggle play/pause
  if (currentStation === station.id) {
    if (liveAudio.paused) {
      liveAudio.play().catch(() => {});
      document.getElementById('waveform').classList.remove('paused');
    } else {
      liveAudio.pause();
      document.getElementById('waveform').classList.add('paused');
    }
    renderStations();
    return;
  }

  // Stop previous
  liveAudio.pause();

  // Play new station
  currentStation = station.id;
  liveAudio.src = station.url;
  liveAudio.volume = document.getElementById('volume-slider').value / 100;
  liveAudio.play().catch(() => {
    showToast('تعذّر تشغيل البث. حاول مرة أخرى.', '⚠️');
  });

  // Update UI
  document.getElementById('live-now-playing').textContent = `🎧 ${station.name}`;
  document.getElementById('waveform').classList.remove('paused');
  renderStations();

  // Handle errors
  liveAudio.onerror = () => {
    showToast('تعذّر الاتصال بالبث', '⚠️');
    document.getElementById('waveform').classList.add('paused');
  };
}

function setVolume(value) {
  liveAudio.volume = value / 100;
  // Also set quran audio volume
  if (typeof quranAudio !== 'undefined') {
    quranAudio.volume = value / 100;
  }
}
