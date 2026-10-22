let liveAudio = new Audio();
let currentStationId = null;
let liveInitialized = false;

const LIVE_STATIONS = [
  {
    id: 'general-radio',
    name: 'إذاعة القرآن الكريم العامة',
    desc: 'تلاوات خاشعة على مدار الساعة',
    url: 'https://Qurango.net/radio/tarateel',
    icon: 'radio'
  },
  {
    id: 'alafasy-radio',
    name: 'مشاري بن راشد العفاسي',
    desc: 'تلاوة برواية حفص عن عاصم',
    url: 'https://Qurango.net/radio/mishary_alafasy',
    icon: 'mic'
  },
  {
    id: 'sudais-radio',
    name: 'عبد الرحمن السديس',
    desc: 'إمام وخطيب المسجد الحرام',
    url: 'https://Qurango.net/radio/abdurrahman_alsudais',
    icon: 'mosque'
  },
  {
    id: 'shuraim-radio',
    name: 'سعود الشريم',
    desc: 'تلاوات الحرم المكي الشريف',
    url: 'https://Qurango.net/radio/saoud_shuraim',
    icon: 'mosque'
  },
  {
    id: 'husary-radio',
    name: 'محمود خليل الحصري',
    desc: 'شيخ عموم المقارئ المصرية (مرتل)',
    url: 'https://Qurango.net/radio/mahmoud_khalil_alhussary',
    icon: 'quran'
  },
  {
    id: 'minshawi-radio',
    name: 'محمد صديق المنشاوي',
    desc: 'تلاوات قرآنية مجودة',
    url: 'https://Qurango.net/radio/muhammad_siddiq_alminshawi',
    icon: 'quran'
  },
  {
    id: 'abdulbasit-radio',
    name: 'عبد الباسط عبد الصمد',
    desc: 'المصحف المرتل برواية حفص',
    url: 'https://Qurango.net/radio/abdulbasit_abdulsamad',
    icon: 'mic'
  },
  {
    id: 'maher-radio',
    name: 'ماهر المعيقلي',
    desc: 'تلاوات الحرم المكي الشريف',
    url: 'https://Qurango.net/radio/maher_almuaiqly',
    icon: 'mosque'
  },
  {
    id: 'ajamy-radio',
    name: 'أحمد بن علي العجمي',
    desc: 'المصحف المرتل برواية حفص',
    url: 'https://Qurango.net/radio/ahmed_alajamy',
    icon: 'mic'
  },
  {
    id: 'huzaify-radio',
    name: 'علي بن عبد الرحمن الحذيفي',
    desc: 'إمام وخطيب المسجد النبوي الشريف',
    url: 'https://Qurango.net/radio/ali_alhuzaify',
    icon: 'mosque'
  }
];

function initLive() {
  if (liveInitialized) return;
  liveInitialized = true;
  renderLiveStations();
  initVolumeControls();
}

function renderLiveStations() {
  const container = document.getElementById('radio-stations-list');
  if (!container) return;

  container.innerHTML = '';
  LIVE_STATIONS.forEach(station => {
    const isPlaying = currentStationId === station.id && !liveAudio.paused;

    const card = document.createElement('div');
    card.className = `radio-station-card ${currentStationId === station.id ? 'active' : ''}`;
    card.id = `station-${station.id}`;
    card.onclick = () => toggleStation(station);

    card.innerHTML = `
      <div class="station-icon-wrap">
        ${getIcon(station.icon, '', 20)}
      </div>
      <div class="station-details">
        <div class="station-title">${station.name}</div>
        <div class="station-subtitle">${station.desc}</div>
      </div>
      <button class="station-play-toggle">
        ${getIcon(isPlaying ? 'pause' : 'play', '', 18)}
      </button>
    `;

    container.appendChild(card);
  });
}

function toggleStation(station) {
  const heroPlayingTitle = document.getElementById('live-now-playing-title');
  const waveform = document.getElementById('live-waveform');

  if (currentStationId === station.id) {
    if (liveAudio.paused) {
      liveAudio.play().catch(() => {});
      if (waveform) waveform.classList.remove('paused');
    } else {
      liveAudio.pause();
      if (waveform) waveform.classList.add('paused');
    }
    renderLiveStations();
    return;
  }

  if (typeof quranAudio !== 'undefined' && !quranAudio.paused) {
    quranAudio.pause();
  }

  liveAudio.pause();
  currentStationId = station.id;
  liveAudio.src = station.url;

  const slider = document.getElementById('live-volume-slider');
  if (slider) liveAudio.volume = slider.value / 100;

  liveAudio.play()
    .then(() => {
      if (heroPlayingTitle) heroPlayingTitle.textContent = station.name;
      if (waveform) waveform.classList.remove('paused');
      renderLiveStations();
      showToast(`تم بدء البث: ${station.name}`, 'radio');
    })
    .catch(() => {
      showToast('تعذر الاتصال بالبث المباشر. حاول لاحقاً.', 'warning');
      if (waveform) waveform.classList.add('paused');
    });

  liveAudio.onerror = () => {
    showToast('انقطع البث أو الخادم غير متاح', 'warning');
    if (waveform) waveform.classList.add('paused');
    renderLiveStations();
  };
}

function initVolumeControls() {
  const slider = document.getElementById('live-volume-slider');
  if (!slider) return;

  slider.oninput = (e) => {
    const val = e.target.value / 100;
    liveAudio.volume = val;
    if (typeof quranAudio !== 'undefined') {
      quranAudio.volume = val;
    }
  };
}
