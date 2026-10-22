let prayerTimesData = null;
let countdownInterval = null;
let lastPrayerAlert = '';
let currentCoords = { lat: 21.4225, lng: 39.8262, name: 'مكة المكرمة' };

const PRAYER_NAMES = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء'
};

const PRAYER_ICONS = {
  Fajr: 'fajr',
  Sunrise: 'sunrise',
  Dhuhr: 'dhuhr',
  Asr: 'asr',
  Maghrib: 'maghrib',
  Isha: 'isha'
};

const DAILY_WISDOM = [
  { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ', source: 'صحيح البخاري ومسلم', type: 'حديث شريف' },
  { text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ كنزٌ من كنوز الجنة', source: 'صحيح البخاري', type: 'حديث شريف' },
  { text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ', source: 'سنن ابن ماجه', type: 'دعاء مأثور' },
  { text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', source: 'سورة البقرة: 201', type: 'آية كريمة' },
  { text: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ', source: 'سنن أبي داود', type: 'دعاء مأثور' },
  { text: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ', source: 'جامع الترمذي', type: 'استغفار' },
  { text: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ', source: 'سورة الطلاق: 2-3', type: 'آية كريمة' },
  { text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', source: 'فضل الصلاة على النبي ﷺ', type: 'صلاة على النبي' },
  { text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', source: 'سورة الشرح: 6', type: 'آية كريمة' },
  { text: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', source: 'سورة طه: 25-26', type: 'دعاء قرآني' }
];

function initHome() {
  loadSavedCity();
  fetchPrayerTimes();
  loadDailyWisdom();
  loadLastReadQuranBanner();
  renderCitiesListModal();
}

function loadSavedCity() {
  const savedCityId = localStorage.getItem('almuslim_selected_city');
  if (savedCityId && typeof getCityById === 'function') {
    const city = getCityById(savedCityId);
    currentCoords = { lat: city.lat, lng: city.lng, name: `${city.name}، ${city.country}` };
  }
  updateLocationBadge();
}

function updateLocationBadge() {
  const badgeEl = document.getElementById('current-city-name');
  if (badgeEl) {
    badgeEl.textContent = currentCoords.name || 'مكة المكرمة';
  }
}

function openCitySelector() {
  showModal('city-selector-modal');
}

function selectCity(cityId) {
  if (typeof getCityById !== 'function') return;
  const city = getCityById(cityId);
  currentCoords = { lat: city.lat, lng: city.lng, name: `${city.name}، ${city.country}` };
  localStorage.setItem('almuslim_selected_city', cityId);

  if (city.method && typeof PrayTimes !== 'undefined') {
    PrayTimes.setMethod(city.method);
    localStorage.setItem('almuslim_prayer_method', city.method);
  }

  localStorage.removeItem('almuslim_prayerTimesCache');

  updateLocationBadge();
  closeModal('city-selector-modal');
  fetchPrayerTimes();

  if (typeof updateQiblaLocation === 'function') {
    updateQiblaLocation();
  }

  showToast(`تم تغيير المدينة إلى: ${city.name}`, 'mapPin');
}

function useGpsLocation() {
  if (!navigator.geolocation) {
    showToast('المتصفح لا يدعم تحديد الموقع', 'warning');
    return;
  }

  showToast('جارٍ تحديد موقعك عبر الأقمار الاصطناعية...', 'mapPin');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      currentCoords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        name: 'موقعي الحالي'
      };
      localStorage.removeItem('almuslim_selected_city');
      localStorage.removeItem('almuslim_prayerTimesCache');
      updateLocationBadge();
      closeModal('city-selector-modal');
      fetchPrayerTimes();
      if (typeof updateQiblaLocation === 'function') {
        updateQiblaLocation();
      }
      showToast('تم تحديد الموقع بنجاح', 'check');
    },
    () => {
      showToast('تعذر الوصول للموقع. تم تثبيت المدينة المختارة.', 'warning');
    },
    { timeout: 8000 }
  );
}

function renderCitiesListModal() {
  const container = document.getElementById('cities-list-container');
  if (!container || typeof ISLAMIC_CITIES === 'undefined') return;

  container.innerHTML = '';
  ISLAMIC_CITIES.forEach(city => {
    const btn = document.createElement('button');
    btn.className = 'city-select-item';
    btn.onclick = () => selectCity(city.id);
    btn.innerHTML = `
      <div class="city-name-ar">${city.name}</div>
      <div class="city-country-ar">${city.country}</div>
    `;
    container.appendChild(btn);
  });
}

function filterCities(query) {
  const items = document.querySelectorAll('.city-select-item');
  const q = query.trim().toLowerCase();
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(q) || !q ? 'flex' : 'none';
  });
}

function fetchPrayerTimes() {
  const today = new Date();
  const dateKey = today.toDateString();

  const savedMethod = localStorage.getItem('almuslim_prayer_method') || 'Makkah';
  const savedMadhab = localStorage.getItem('almuslim_madhab') || '0';

  if (typeof PrayTimes !== 'undefined') {
    PrayTimes.setMethod(savedMethod);
    PrayTimes.setAsrMadhab(savedMadhab);

    const offlineTimes = PrayTimes.getTimes(today, currentCoords);

    prayerTimesData = {
      date: dateKey,
      timings: offlineTimes,
      hijri: getCalculatedHijriDate(today)
    };

    displayPrayerTimes(prayerTimesData);
    startCountdown();
  }

  const dd = today.getDate();
  const mm = today.getMonth() + 1;
  const yyyy = today.getFullYear();
  const schoolParam = savedMadhab === '1' ? '1' : '0';
  const methodId = getMethodNumberForAlAdhan(savedMethod);

  const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${currentCoords.lat}&longitude=${currentCoords.lng}&method=${methodId}&school=${schoolParam}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.code === 200 && data.data) {
        const timings = data.data.timings;
        const hijri = data.data.date.hijri;

        prayerTimesData = {
          date: dateKey,
          timings: {
            Fajr: timings.Fajr.split(' ')[0],
            Sunrise: timings.Sunrise.split(' ')[0],
            Dhuhr: timings.Dhuhr.split(' ')[0],
            Asr: timings.Asr.split(' ')[0],
            Maghrib: timings.Maghrib.split(' ')[0],
            Isha: timings.Isha.split(' ')[0]
          },
          hijri: {
            day: hijri.day,
            month: hijri.month.ar,
            year: hijri.year
          }
        };

        saveData('prayerTimesCache', prayerTimesData);
        displayPrayerTimes(prayerTimesData);
        startCountdown();
      }
    })
    .catch(() => {});
}

function getMethodNumberForAlAdhan(methodKey) {
  const map = {
    MWL: 3,
    ISNA: 2,
    Egypt: 5,
    Makkah: 4,
    Karachi: 1,
    Tehran: 7,
    Gulf: 8,
    Kuwait: 9,
    Qatar: 10
  };
  return map[methodKey] || 4;
}

function getCalculatedHijriDate(date) {
  try {
    const formatted = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
    return { text: formatted };
  } catch (e) {
    return { text: 'التقويم الهجري' };
  }
}

function displayPrayerTimes(data) {
  const hijriEl = document.getElementById('date-hijri');
  if (hijriEl && data.hijri) {
    if (data.hijri.day && data.hijri.month) {
      hijriEl.textContent = `${data.hijri.day} ${data.hijri.month} ${data.hijri.year} هـ`;
    } else if (data.hijri.text) {
      hijriEl.textContent = `${data.hijri.text} هـ`;
    }
  }

  const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  prayers.forEach(prayer => {
    const timeEl = document.getElementById(`time-${prayer.toLowerCase()}`);
    const iconEl = document.getElementById(`icon-${prayer.toLowerCase()}`);

    if (timeEl && data.timings[prayer]) {
      timeEl.textContent = formatTime12(data.timings[prayer]);
    }
    if (iconEl && typeof getIcon === 'function') {
      iconEl.innerHTML = getIcon(PRAYER_ICONS[prayer], '', 22);
    }
  });

  highlightCurrentPrayer();
}

function getPrayerScheduleInfo() {
  if (!prayerTimesData || !prayerTimesData.timings) return null;

  const now = new Date();
  const prayerKeys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const prayerDates = [];

  prayerKeys.forEach(p => {
    const timeStr = prayerTimesData.timings[p];
    if (timeStr) {
      const [h, m] = timeStr.split(':').map(Number);
      const d = new Date(now);
      d.setHours(h, m, 0, 0);
      prayerDates.push({ key: p, name: PRAYER_NAMES[p], date: d });
    }
  });

  let currentPrayer = null;
  let nextPrayer = null;

  for (let i = 0; i < prayerDates.length; i++) {
    if (now >= prayerDates[i].date) {
      currentPrayer = prayerDates[i];
    }
    if (now < prayerDates[i].date) {
      nextPrayer = prayerDates[i];
      break;
    }
  }

  if (!nextPrayer) {
    const [h, m] = prayerTimesData.timings.Fajr.split(':').map(Number);
    const tomorrowFajr = new Date(now);
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    tomorrowFajr.setHours(h, m, 0, 0);

    nextPrayer = {
      key: 'Fajr',
      name: PRAYER_NAMES.Fajr,
      date: tomorrowFajr
    };
  }

  if (!currentPrayer) {
    const [h, m] = prayerTimesData.timings.Isha.split(':').map(Number);
    const yesterdayIsha = new Date(now);
    yesterdayIsha.setDate(yesterdayIsha.getDate() - 1);
    yesterdayIsha.setHours(h, m, 0, 0);

    currentPrayer = {
      key: 'Isha',
      name: PRAYER_NAMES.Isha,
      date: yesterdayIsha
    };
  }

  return { currentPrayer, nextPrayer };
}

function highlightCurrentPrayer() {
  document.querySelectorAll('.prayer-time-item').forEach(el => el.classList.remove('current', 'active'));
  const schedule = getPrayerScheduleInfo();
  if (schedule && schedule.nextPrayer) {
    const el = document.querySelector(`.prayer-time-item[data-prayer="${schedule.nextPrayer.key}"]`);
    if (el) el.classList.add('current');
  }
}

function startCountdown() {
  if (countdownInterval) clearInterval(countdownInterval);

  function tick() {
    const schedule = getPrayerScheduleInfo();
    if (!schedule || !schedule.nextPrayer) return;

    const now = new Date();
    const diff = schedule.nextPrayer.date - now;

    if (diff <= 0) {
      if (lastPrayerAlert !== schedule.nextPrayer.key) {
        lastPrayerAlert = schedule.nextPrayer.key;
        showKhushoo(schedule.nextPrayer.name);
        highlightCurrentPrayer();
      }
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const nextNameEl = document.getElementById('next-prayer-name');
    const nextTimeEl = document.getElementById('next-prayer-time');
    const cdHoursEl = document.getElementById('cd-hours');
    const cdMinsEl = document.getElementById('cd-minutes');
    const cdSecsEl = document.getElementById('cd-seconds');

    if (nextNameEl) nextNameEl.textContent = `صلاة ${schedule.nextPrayer.name}`;
    if (nextTimeEl && prayerTimesData.timings[schedule.nextPrayer.key]) {
      nextTimeEl.textContent = formatTime12(prayerTimesData.timings[schedule.nextPrayer.key]);
    }

    if (cdHoursEl) cdHoursEl.textContent = String(hours).padStart(2, '0');
    if (cdMinsEl) cdMinsEl.textContent = String(minutes).padStart(2, '0');
    if (cdSecsEl) cdSecsEl.textContent = String(seconds).padStart(2, '0');

    if (schedule.currentPrayer) {
      const totalWindow = schedule.nextPrayer.date - schedule.currentPrayer.date;
      const elapsed = now - schedule.currentPrayer.date;
      const percentage = Math.min(Math.max((elapsed / totalWindow) * 100, 0), 100);

      const barEl = document.getElementById('prayer-progress-bar');
      const percentEl = document.getElementById('prayer-progress-percent');
      if (barEl) barEl.style.width = `${percentage}%`;
      if (percentEl) percentEl.textContent = `${Math.round(percentage)}%`;
    }
  }

  tick();
  countdownInterval = setInterval(tick, 1000);
}

function loadLastReadQuranBanner() {
  const container = document.getElementById('home-quran-bookmark');
  if (!container) return;

  const bookmark = loadData('quranBookmark');
  if (bookmark && bookmark.surahNumber) {
    container.style.display = 'block';
    container.innerHTML = `
      <div class="bookmark-card-inner">
        <div class="bookmark-icon">${getIcon('bookmarkFill', '', 22)}</div>
        <div class="bookmark-info">
          <div class="bookmark-title">متابعة القراءة: سورة ${bookmark.surahName}</div>
          <div class="bookmark-sub">الآية رقم ${bookmark.ayahNumber} • الصفحة ${bookmark.page || 1}</div>
        </div>
        <button class="bookmark-action-btn" onclick="resumeBookmark(${bookmark.surahNumber}, ${bookmark.ayahIndex || 0})">
          <span>استئناف</span>
          ${getIcon('chevronLeft', '', 16)}
        </button>
      </div>
    `;
  } else {
    container.style.display = 'none';
  }
}

function resumeBookmark(surahNumber, ayahIndex) {
  navigateTo('quran');
  if (typeof loadSurah === 'function') {
    loadSurah(surahNumber, ayahIndex);
  }
}

function loadDailyWisdom() {
  const today = new Date();
  const dayIndex =
    (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) %
    DAILY_WISDOM.length;
  const item = DAILY_WISDOM[dayIndex];

  const textEl = document.getElementById('suggestion-text');
  const sourceEl = document.getElementById('suggestion-source');
  const badgeEl = document.getElementById('suggestion-badge');

  if (textEl) textEl.textContent = item.text;
  if (sourceEl) sourceEl.textContent = item.source;
  if (badgeEl) badgeEl.textContent = item.type;
}
