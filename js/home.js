/* ============================================
   المسلم - Home Page (Prayer Times & Countdown)
   ============================================ */

let prayerTimesData = null;
let countdownInterval = null;
let lastPrayerAlert = '';

const PRAYER_NAMES = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء'
};

const PRAYER_ICONS = {
  Fajr: '🌙',
  Sunrise: '🌅',
  Dhuhr: '☀️',
  Asr: '🌤️',
  Maghrib: '🌇',
  Isha: '🌃'
};

// Daily suggestions
const SUGGESTIONS = [
  { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ', source: 'رواه البخاري ومسلم', type: 'ذكر' },
  { text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', source: 'كنز من كنوز الجنة', type: 'ذكر' },
  { text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ', source: 'رواه ابن ماجه', type: 'دعاء' },
  { text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', source: 'سورة البقرة', type: 'دعاء' },
  { text: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', source: 'رواه أبو داود', type: 'دعاء' },
  { text: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ', source: 'الأثر', type: 'استغفار' },
  { text: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ', source: 'سورة الطلاق: 2-3', type: 'آية' },
  { text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', source: 'الصلاة على النبي ﷺ', type: 'ذكر' },
  { text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', source: 'سورة الشرح: 6', type: 'آية' },
  { text: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', source: 'سورة طه: 25-26', type: 'دعاء' }
];

function initHome() {
  fetchPrayerTimes();
  loadDailySuggestion();
}

// ============ Fetch Prayer Times ============
function fetchPrayerTimes() {
  const cached = loadData('prayerTimesCache');
  const today = new Date().toDateString();

  if (cached && cached.date === today) {
    prayerTimesData = cached;
    displayPrayerTimes(cached);
    startCountdown();
    return;
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchFromAPI(pos.coords.latitude, pos.coords.longitude),
      () => fetchFromAPI(21.4225, 39.8262)
    );
  } else {
    fetchFromAPI(21.4225, 39.8262);
  }
}

function fetchFromAPI(lat, lng) {
  const madhab = localStorage.getItem('almuslim_madhab') || '0';
  const method = 4;
  const date = new Date();
  const dd = date.getDate();
  const mm = date.getMonth() + 1;
  const yyyy = date.getFullYear();

  const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=${method}&school=${madhab}`;

  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error('Request failed');
      return res.json();
    })
    .then((data) => {
      const timings = data?.data?.timings;
      const hijri = data?.data?.date?.hijri;

      if (!timings || !hijri) {
        throw new Error('Invalid prayer response');
      }

      prayerTimesData = {
        date: new Date().toDateString(),
        timings: {
          Fajr: timings.Fajr.split(' ')[0],
          Sunrise: timings.Sunrise.split(' ')[0],
          Dhuhr: timings.Dhuhr.split(' ')[0],
          Asr: timings.Asr.split(' ')[0],
          Maghrib: timings.Maghrib.split(' ')[0],
          Isha: timings.Isha.split(' ')[0]
        },
        hijri: hijri
      };

      saveData('prayerTimesCache', prayerTimesData);
      displayPrayerTimes(prayerTimesData);
      startCountdown();
    })
    .catch(() => {
      document.getElementById('date-hijri').textContent = 'تعذّر تحميل مواقيت الصلاة. حاول لاحقاً.';
    });
}

// ============ Display Prayer Times ============
function displayPrayerTimes(data) {
  if (data.hijri) {
    const h = data.hijri;
    document.getElementById('date-hijri').textContent = `${h.day} ${h.month.ar} ${h.year} هـ`;
  }

  const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  prayers.forEach(prayer => {
    const el = document.getElementById(`time-${prayer.toLowerCase()}`);
    if (el && data.timings[prayer]) {
      el.textContent = formatTime12(data.timings[prayer]);
    }
  });

  highlightCurrentPrayer();
}

// ============ Current & Next Prayer ============
function getCurrentPrayer() {
  if (!prayerTimesData) return null;

  const now = new Date();
  const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  for (let i = prayerOrder.length - 1; i >= 0; i--) {
    const prayer = prayerOrder[i];
    const [h, m] = prayerTimesData.timings[prayer].split(':').map(Number);
    const prayerDate = new Date(now);
    prayerDate.setHours(h, m, 0, 0);

    if (prayerDate <= now) {
      return prayer;
    }
  }

  return null;
}

function getCurrentAndNextPrayer() {
  if (!prayerTimesData) return { current: null, next: null };

  const now = new Date();
  const allPrayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  let nextPrayer = null;
  let nextTime = null;

  for (const prayer of allPrayers) {
    const [h, m] = prayerTimesData.timings[prayer].split(':').map(Number);
    const prayerDate = new Date(now);
    prayerDate.setHours(h, m, 0, 0);

    if (prayerDate > now) {
      nextPrayer = prayer;
      nextTime = prayerDate;
      break;
    }
  }

  if (!nextPrayer) {
    nextPrayer = 'Fajr';
    const [h, m] = prayerTimesData.timings.Fajr.split(':').map(Number);
    nextTime = new Date(now);
    nextTime.setDate(nextTime.getDate() + 1);
    nextTime.setHours(h, m, 0, 0);
  }

  const currentPrayer = getCurrentPrayer();
  return { current: currentPrayer, next: nextPrayer, nextTime: nextTime };
}

function highlightCurrentPrayer() {
  document.querySelectorAll('.prayer-time-item').forEach(el => el.classList.remove('current'));
  const { current } = getCurrentAndNextPrayer();

  if (current) {
    const el = document.querySelector(`.prayer-time-item[data-prayer="${current}"]`);
    if (el) el.classList.add('current');
  }
}

// ============ Countdown Timer ============
function startCountdown() {
  if (countdownInterval) clearInterval(countdownInterval);

  function updateCountdown() {
    const { next, nextTime } = getCurrentAndNextPrayer();
    if (!next || !nextTime) return;

    const now = new Date();
    const diff = nextTime - now;

    if (diff <= 0) {
      if (lastPrayerAlert !== next) {
        lastPrayerAlert = next;
        showKhushoo(PRAYER_NAMES[next]);
        highlightCurrentPrayer();
      }
      return;
    }

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    document.getElementById('next-prayer-name').textContent = PRAYER_NAMES[next];
    document.getElementById('next-prayer-time').textContent = formatTime12(prayerTimesData.timings[next]);
    document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('cd-seconds').textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

// ============ Daily Suggestion ============
function loadDailySuggestion() {
  const today = new Date();
  const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % SUGGESTIONS.length;
  const suggestion = SUGGESTIONS[dayIndex];

  document.getElementById('suggestion-text').textContent = suggestion.text;
  document.getElementById('suggestion-source').textContent = `${suggestion.type} — ${suggestion.source}`;
}
