let currentSurahNumber = 1;
let currentSurahAyahs = [];
let quranAudio = new Audio();
let currentAyahIndex = 0;
let isAudioPlaying = false;
let isAudioRepeat = false;
let quranFontSize = 24;
let quranFilterType = 'all';

function initQuran() {
  loadQuranPreferences();
  renderSurahsList();
  renderRecitersDropdown();
  updateQuranBookmarkBanner();

  const lastSavedSurah = loadData('lastSurah', 1);
  loadSurah(lastSavedSurah);
}

function loadQuranPreferences() {
  const savedSize = localStorage.getItem('almuslim_quran_font_size');
  if (savedSize) {
    quranFontSize = parseInt(savedSize);
    applyFontSize();
  }
}

function adjustFontSize(delta) {
  quranFontSize = Math.min(Math.max(quranFontSize + delta, 18), 40);
  localStorage.setItem('almuslim_quran_font_size', quranFontSize);
  applyFontSize();
}

function applyFontSize() {
  const container = document.getElementById('ayah-container');
  if (container) {
    container.style.fontSize = `${quranFontSize}px`;
    container.style.lineHeight = `${quranFontSize * 2.1}px`;
  }
  const sizeValEl = document.getElementById('font-size-val');
  if (sizeValEl) sizeValEl.textContent = `${quranFontSize}px`;
}

function renderRecitersDropdown() {
  const select = document.getElementById('reciter-select');
  if (!select || typeof QURAN_RECITERS === 'undefined') return;

  const savedReciter = localStorage.getItem('almuslim_reciter') || 'ar.alafasy';
  select.innerHTML = '';

  QURAN_RECITERS.forEach(rec => {
    const opt = document.createElement('option');
    opt.value = rec.id;
    opt.textContent = rec.name;
    if (rec.id === savedReciter) opt.selected = true;
    select.appendChild(opt);
  });

  select.onchange = () => {
    localStorage.setItem('almuslim_reciter', select.value);
    showToast(`تم اختيار القارئ: ${select.selectedOptions[0].text}`, 'check');
    if (isAudioPlaying) {
      playCurrentAyah();
    }
  };
}

function renderSurahsList() {
  const container = document.getElementById('surah-list-container');
  if (!container || typeof SURAHS_INDEX === 'undefined') return;

  container.innerHTML = '';
  SURAHS_INDEX.forEach(s => {
    const item = document.createElement('div');
    item.className = 'surah-index-item';
    item.setAttribute('data-name', s.name);
    item.setAttribute('data-en', s.en);
    item.setAttribute('data-type', s.type);
    item.setAttribute('data-num', s.n);

    item.onclick = () => {
      loadSurah(s.n);
      closeModal('surah-list-modal');
    };

    item.innerHTML = `
      <div class="surah-num-badge">${s.n}</div>
      <div class="surah-index-details">
        <div class="surah-index-title">سورة ${s.name}</div>
        <div class="surah-index-meta">${s.type} • ${s.ayahs} آية • صفحة ${s.page}</div>
      </div>
      <div class="surah-index-action">
        ${getIcon('chevronLeft', '', 18)}
      </div>
    `;

    container.appendChild(item);
  });
}

function openSurahIndex() {
  showModal('surah-list-modal');
}

function filterSurahIndex(query) {
  const q = query.trim().toLowerCase();
  const items = document.querySelectorAll('.surah-index-item');

  items.forEach(item => {
    const name = item.getAttribute('data-name').toLowerCase();
    const en = item.getAttribute('data-en').toLowerCase();
    const num = item.getAttribute('data-num');
    const type = item.getAttribute('data-type');

    const matchesQuery = name.includes(q) || en.includes(q) || num === q || !q;
    const matchesFilter = quranFilterType === 'all' || type === quranFilterType;

    item.style.display = matchesQuery && matchesFilter ? 'flex' : 'none';
  });
}

function setSurahTypeFilter(filterType) {
  quranFilterType = filterType;
  document.querySelectorAll('.surah-filter-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filterType);
  });
  const searchInput = document.getElementById('surah-search-input');
  filterSurahIndex(searchInput ? searchInput.value : '');
}

function loadSurah(surahNum, targetAyahIndex = null) {
  surahNum = parseInt(surahNum) || 1;
  currentSurahNumber = surahNum;
  saveData('lastSurah', surahNum);

  const surahMeta = SURAHS_INDEX[surahNum - 1] || SURAHS_INDEX[0];

  const titleEl = document.getElementById('surah-current-name');
  const infoEl = document.getElementById('surah-current-info');
  const bismillahEl = document.getElementById('surah-bismillah');

  if (titleEl) titleEl.textContent = `سورة ${surahMeta.name}`;
  if (infoEl) infoEl.textContent = `${surahMeta.type} • عدد آياتها ${surahMeta.ayahs} • ص ${surahMeta.page}`;

  if (bismillahEl) {
    bismillahEl.style.display = (surahNum === 9 || surahNum === 1) ? 'none' : 'block';
  }

  const loadingEl = document.getElementById('quran-loading');
  const emptyEl = document.getElementById('quran-empty');
  const container = document.getElementById('ayah-container');

  if (loadingEl) loadingEl.style.display = 'flex';
  if (emptyEl) emptyEl.style.display = 'none';
  if (container) container.innerHTML = '';

  const cacheKey = `quran_surah_${surahNum}`;
  const cachedAyahs = loadData(cacheKey);

  if (cachedAyahs && cachedAyahs.length > 0) {
    if (loadingEl) loadingEl.style.display = 'none';
    currentSurahAyahs = cachedAyahs;
    renderAyahs(currentSurahAyahs, targetAyahIndex);
    return;
  }

  if (typeof OFFLINE_SURAHS !== 'undefined' && OFFLINE_SURAHS[surahNum]) {
    if (loadingEl) loadingEl.style.display = 'none';
    currentSurahAyahs = OFFLINE_SURAHS[surahNum];
    renderAyahs(currentSurahAyahs, targetAyahIndex);
  }

  fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/quran-uthmani`)
    .then(res => res.json())
    .then(data => {
      if (loadingEl) loadingEl.style.display = 'none';
      if (data.code === 200 && data.data && data.data.ayahs) {
        currentSurahAyahs = data.data.ayahs;
        saveData(cacheKey, currentSurahAyahs);
        renderAyahs(currentSurahAyahs, targetAyahIndex);
      }
    })
    .catch(() => {
      if (loadingEl) loadingEl.style.display = 'none';
      if (!currentSurahAyahs || currentSurahAyahs.length === 0) {
        if (emptyEl) {
          emptyEl.style.display = 'flex';
          emptyEl.innerHTML = `
            <div class="empty-icon">${getIcon('warning', '', 36)}</div>
            <p>تعذر تحميل السورة. يرجى التحقق من اتصال الإنترنت.</p>
          `;
        }
      }
    });
}

function renderAyahs(ayahs, scrollToIndex = null) {
  const container = document.getElementById('ayah-container');
  if (!container) return;

  container.innerHTML = '';
  applyFontSize();

  const ayahFlow = document.createElement('div');
  ayahFlow.className = 'quran-text-flow';

  ayahs.forEach((ayah, index) => {
    let cleanText = ayah.text;
    if (ayah.numberInSurah === 1 && currentSurahNumber !== 1 && currentSurahNumber !== 9) {
      cleanText = cleanText.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, '');
    }

    const span = document.createElement('span');
    span.className = 'ayah-unit';
    span.id = `ayah-unit-${index}`;
    span.setAttribute('data-index', index);
    span.onclick = () => selectAyah(index);

    span.innerHTML = `
      <span class="ayah-words">${cleanText}</span>
      <span class="ayah-ornament">
        <span class="ayah-number-badge">${ayah.numberInSurah}</span>
      </span>
    `;

    ayahFlow.appendChild(span);
  });

  container.appendChild(ayahFlow);

  if (scrollToIndex !== null && ayahs[scrollToIndex]) {
    setTimeout(() => {
      selectAyah(scrollToIndex);
      const targetEl = document.getElementById(`ayah-unit-${scrollToIndex}`);
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  }
}

function selectAyah(index) {
  currentAyahIndex = index;
  document.querySelectorAll('.ayah-unit').forEach(el => el.classList.remove('selected'));
  const currentSpan = document.getElementById(`ayah-unit-${index}`);
  if (currentSpan) currentSpan.classList.add('selected');

  showAyahActionBar(index);
}

function showAyahActionBar(index) {
  const bar = document.getElementById('ayah-action-bar');
  if (!bar || !currentSurahAyahs[index]) return;

  const ayah = currentSurahAyahs[index];
  const surahMeta = SURAHS_INDEX[currentSurahNumber - 1];

  bar.classList.add('visible');
  bar.innerHTML = `
    <div class="action-bar-label">الآية ${ayah.numberInSurah} • سورة ${surahMeta.name}</div>
    <div class="action-bar-buttons">
      <button class="ayah-bar-btn" onclick="playFromAyah(${index})" title="استماع">
        ${getIcon('play', '', 16)}
        <span>استماع</span>
      </button>
      <button class="ayah-bar-btn" onclick="saveAyahBookmark(${index})" title="حفظ العلامة">
        ${getIcon('bookmark', '', 16)}
        <span>علامة</span>
      </button>
      <button class="ayah-bar-btn" onclick="copyAyahText(${index})" title="نسخ">
        ${getIcon('copy', '', 16)}
        <span>نسخ</span>
      </button>
      <button class="ayah-bar-btn" onclick="shareAyahText(${index})" title="مشاركة">
        ${getIcon('share', '', 16)}
        <span>مشاركة</span>
      </button>
      <button class="ayah-bar-btn close-btn" onclick="hideAyahActionBar()" title="إغلاق">
        ${getIcon('close', '', 16)}
      </button>
    </div>
  `;
}

function hideAyahActionBar() {
  const bar = document.getElementById('ayah-action-bar');
  if (bar) bar.classList.remove('visible');
  document.querySelectorAll('.ayah-unit').forEach(el => el.classList.remove('selected'));
}

function saveAyahBookmark(index) {
  if (!currentSurahAyahs[index]) return;
  const ayah = currentSurahAyahs[index];
  const surahMeta = SURAHS_INDEX[currentSurahNumber - 1];

  const bookmarkData = {
    surahNumber: currentSurahNumber,
    surahName: surahMeta.name,
    ayahNumber: ayah.numberInSurah,
    ayahIndex: index,
    page: surahMeta.page,
    timestamp: Date.now()
  };

  saveData('quranBookmark', bookmarkData);
  updateQuranBookmarkBanner();
  if (typeof loadLastReadQuranBanner === 'function') {
    loadLastReadQuranBanner();
  }

  showToast(`تم حفظ العلامة: سورة ${surahMeta.name}، الآية ${ayah.numberInSurah}`, 'bookmarkFill');
}

function updateQuranBookmarkBanner() {
  const banner = document.getElementById('quran-bookmark-banner');
  if (!banner) return;

  const bookmark = loadData('quranBookmark');
  if (bookmark && bookmark.surahNumber) {
    banner.style.display = 'flex';
    banner.innerHTML = `
      <div class="banner-left">
        <span class="bookmark-flag">${getIcon('bookmarkFill', '', 16)}</span>
        <span>آخر علامة: سورة ${bookmark.surahName}، آية ${bookmark.ayahNumber}</span>
      </div>
      <button class="resume-pill-btn" onclick="loadSurah(${bookmark.surahNumber}, ${bookmark.ayahIndex || 0})">
        انتقال
      </button>
    `;
  } else {
    banner.style.display = 'none';
  }
}

function copyAyahText(index) {
  if (!currentSurahAyahs[index]) return;
  const ayah = currentSurahAyahs[index];
  const surahMeta = SURAHS_INDEX[currentSurahNumber - 1];
  const text = `﴿ ${ayah.text} ﴾ [سورة ${surahMeta.name}: ${ayah.numberInSurah}]`;

  navigator.clipboard.writeText(text).then(() => {
    showToast('تم نسخ الآية الكريمة', 'copy');
  }).catch(() => {});
}

function shareAyahText(index) {
  if (!currentSurahAyahs[index]) return;
  const ayah = currentSurahAyahs[index];
  const surahMeta = SURAHS_INDEX[currentSurahNumber - 1];
  const text = `﴿ ${ayah.text} ﴾ [سورة ${surahMeta.name}: ${ayah.numberInSurah}]`;

  if (navigator.share) {
    navigator.share({
      title: `سورة ${surahMeta.name}`,
      text: text
    }).catch(() => {});
  } else {
    copyAyahText(index);
  }
}

function playFromAyah(index) {
  currentAyahIndex = index;
  const player = document.getElementById('quran-audio-player');
  if (player) player.classList.add('visible');

  playCurrentAyah();
}

function playCurrentAyah() {
  if (!currentSurahAyahs[currentAyahIndex]) return;

  const ayah = currentSurahAyahs[currentAyahIndex];
  const select = document.getElementById('reciter-select');
  const reciterId = select ? select.value : 'ar.alafasy';
  const reciterName = select ? select.selectedOptions[0].text : 'مشاري العفاسي';
  const surahMeta = SURAHS_INDEX[currentSurahNumber - 1];

  const audioUrl = `https://cdn.islamic.network/quran/audio/128/${reciterId}/${ayah.number}.mp3`;

  quranAudio.src = audioUrl;
  quranAudio.play().catch(() => {});
  isAudioPlaying = true;

  updatePlayButtonIcon(true);
  const titleEl = document.getElementById('audio-now-playing-title');
  const reciterEl = document.getElementById('audio-now-playing-reciter');
  if (titleEl) titleEl.textContent = `سورة ${surahMeta.name} • الآية ${ayah.numberInSurah}`;
  if (reciterEl) reciterEl.textContent = reciterName;

  document.querySelectorAll('.ayah-unit').forEach(el => el.classList.remove('playing'));
  const currentSpan = document.getElementById(`ayah-unit-${currentAyahIndex}`);
  if (currentSpan) {
    currentSpan.classList.add('playing');
    currentSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  quranAudio.ontimeupdate = () => {
    if (quranAudio.duration) {
      const progress = (quranAudio.currentTime / quranAudio.duration) * 100;
      const bar = document.getElementById('audio-progress-bar');
      if (bar) bar.style.width = `${progress}%`;
    }
  };

  quranAudio.onended = () => {
    if (isAudioRepeat) {
      playCurrentAyah();
    } else if (currentAyahIndex < currentSurahAyahs.length - 1) {
      currentAyahIndex++;
      playCurrentAyah();
    } else {
      isAudioPlaying = false;
      updatePlayButtonIcon(false);
    }
  };

  quranAudio.onerror = () => {
    showToast('تعذر تشغيل التسجيل الصوتي لهذه الآية', 'warning');
    isAudioPlaying = false;
    updatePlayButtonIcon(false);
  };
}

function toggleAudioPlay() {
  if (isAudioPlaying) {
    quranAudio.pause();
    isAudioPlaying = false;
    updatePlayButtonIcon(false);
  } else {
    if (quranAudio.src) {
      quranAudio.play().catch(() => {});
      isAudioPlaying = true;
      updatePlayButtonIcon(true);
    } else {
      playFromAyah(currentAyahIndex || 0);
    }
  }
}

function updatePlayButtonIcon(playing) {
  const btn = document.getElementById('audio-play-toggle-btn');
  if (btn) {
    btn.innerHTML = getIcon(playing ? 'pause' : 'play', '', 20);
  }
}

function nextAyahAudio() {
  if (currentAyahIndex < currentSurahAyahs.length - 1) {
    currentAyahIndex++;
    playCurrentAyah();
  }
}

function prevAyahAudio() {
  if (currentAyahIndex > 0) {
    currentAyahIndex--;
    playCurrentAyah();
  }
}

function toggleAudioRepeat() {
  isAudioRepeat = !isAudioRepeat;
  const btn = document.getElementById('audio-repeat-btn');
  if (btn) {
    btn.classList.toggle('active', isAudioRepeat);
  }
  showToast(isAudioRepeat ? 'تم تفعيل تكرار الآية' : 'تم تعطيل التكرار', 'repeat');
}

function closeAudioPlayer() {
  quranAudio.pause();
  isAudioPlaying = false;
  const player = document.getElementById('quran-audio-player');
  if (player) player.classList.remove('visible');
  document.querySelectorAll('.ayah-unit').forEach(el => el.classList.remove('playing'));
}

function seekAudio(event) {
  const barContainer = event.currentTarget;
  const rect = barContainer.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percent = Math.max(0, Math.min(1, clickX / rect.width));

  if (quranAudio.duration) {
    quranAudio.currentTime = percent * quranAudio.duration;
  }
}
