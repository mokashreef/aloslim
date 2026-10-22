let currentAzkarCategory = 'morning';
let azkarCounters = {};

function initAzkar() {
  renderAzkarCategoryTabs();
  autoSelectAzkarCategory();
  loadAzkarCounters();
  renderAzkarCategory(currentAzkarCategory);
}

function autoSelectAzkarCategory() {
  const hour = new Date().getHours();
  if (hour >= 3 && hour < 12) {
    currentAzkarCategory = 'morning';
  } else if (hour >= 15 && hour < 20) {
    currentAzkarCategory = 'evening';
  } else if (hour >= 20 || hour < 3) {
    currentAzkarCategory = 'sleep';
  } else {
    currentAzkarCategory = 'afterPrayer';
  }
}

function renderAzkarCategoryTabs() {
  const container = document.getElementById('azkar-categories-container');
  if (!container || typeof AZKAR_CATEGORIES === 'undefined') return;

  container.innerHTML = '';
  AZKAR_CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `azkar-cat-tab ${cat.id === currentAzkarCategory ? 'active' : ''}`;
    btn.dataset.category = cat.id;
    btn.onclick = () => switchAzkarCategory(cat.id);

    btn.innerHTML = `
      <span class="cat-icon">${getIcon(cat.icon, '', 16)}</span>
      <span class="cat-name">${cat.name}</span>
    `;

    container.appendChild(btn);
  });
}

function switchAzkarCategory(categoryId) {
  currentAzkarCategory = categoryId;
  document.querySelectorAll('.azkar-cat-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.category === categoryId);
  });
  renderAzkarCategory(categoryId);
}

function loadAzkarCounters() {
  const today = new Date().toDateString();
  const saved = loadData('azkarCountersToday', {});

  if (saved.date !== today) {
    azkarCounters = { date: today };
  } else {
    azkarCounters = saved;
  }
}

function saveAzkarCounters() {
  saveData('azkarCountersToday', azkarCounters);
}

function renderAzkarCategory(categoryId) {
  const container = document.getElementById('azkar-cards-container');
  if (!container || typeof HISN_AZKAR === 'undefined') return;

  container.innerHTML = '';
  const azkarList = HISN_AZKAR[categoryId] || [];

  if (azkarList.length === 0) {
    container.innerHTML = `<div class="empty-state"><p>لا توجد أذكار في هذا القسم حالياً.</p></div>`;
    return;
  }

  const radius = 24;
  const circumference = 2 * Math.PI * radius;

  azkarList.forEach((dhikr) => {
    const key = `${categoryId}_${dhikr.id}`;
    const count = azkarCounters[key] || 0;
    const isCompleted = count >= dhikr.count;
    const progress = Math.min(count / dhikr.count, 1);
    const strokeOffset = circumference * (1 - progress);

    const card = document.createElement('div');
    card.className = `azkar-card ${isCompleted ? 'completed' : ''}`;
    card.id = `azkar-card-${dhikr.id}`;

    card.innerHTML = `
      <div class="azkar-card-top">
        <span class="azkar-ref-badge">${dhikr.ref}</span>
        <div class="azkar-actions-mini">
          <button class="mini-icon-btn" onclick="copyDhikrText('${dhikr.id}')" title="نسخ الذكر">
            ${getIcon('copy', '', 14)}
          </button>
          <button class="mini-icon-btn" onclick="shareDhikrText('${dhikr.id}')" title="مشاركة">
            ${getIcon('share', '', 14)}
          </button>
        </div>
      </div>

      <div class="azkar-arabic-text" id="dhikr-text-${dhikr.id}">
        ${dhikr.text}
      </div>

      ${dhikr.benefit ? `
        <div class="azkar-benefit-box">
          <span class="benefit-tag">فضل الذكر:</span>
          <span class="benefit-text">${dhikr.benefit}</span>
        </div>
      ` : ''}

      <div class="azkar-card-bottom">
        <div class="counter-status-text">
          ${isCompleted ? `
            <span class="completed-label">${getIcon('checkCircle', '', 16)} اكتمل التكرار</span>
          ` : `
            <span class="remaining-label">المتبقي: ${dhikr.count - count} من ${dhikr.count}</span>
          `}
        </div>

        <button class="azkar-tap-counter ${isCompleted ? 'done' : ''}" onclick="incrementAzkar('${key}', ${dhikr.count}, '${dhikr.id}')">
          <svg class="tap-svg-ring" viewBox="0 0 60 60">
            <circle class="ring-bg" cx="30" cy="30" r="${radius}"></circle>
            <circle class="ring-fg" cx="30" cy="30" r="${radius}"
              style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeOffset};">
            </circle>
          </svg>
          <span class="tap-count-num">${count}</span>
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

function incrementAzkar(key, targetCount, dhikrId) {
  const current = azkarCounters[key] || 0;
  if (current >= targetCount) return;

  azkarCounters[key] = current + 1;
  saveAzkarCounters();

  if (typeof playClickSound === 'function') {
    playClickSound();
  }

  if (azkarCounters[key] >= targetCount) {
    if (navigator.vibrate) navigator.vibrate([80, 50, 100]);
    showToast('اكتمل هذا الذكر بحمد الله', 'checkCircle');
  } else {
    if (navigator.vibrate) navigator.vibrate(25);
  }

  renderAzkarCategory(currentAzkarCategory);
}

function resetAzkarCategory() {
  const azkarList = HISN_AZKAR[currentAzkarCategory] || [];
  azkarList.forEach(dhikr => {
    delete azkarCounters[`${currentAzkarCategory}_${dhikr.id}`];
  });
  saveAzkarCounters();
  renderAzkarCategory(currentAzkarCategory);
  showToast('تمت إعادة تعيين أذكار هذا القسم', 'refresh');
}

function copyDhikrText(dhikrId) {
  const azkarList = HISN_AZKAR[currentAzkarCategory] || [];
  const dhikr = azkarList.find(d => d.id === dhikrId);
  if (!dhikr) return;

  const content = `${dhikr.text}\n[${dhikr.ref}]`;
  navigator.clipboard.writeText(content).then(() => {
    showToast('تم نسخ الذكر', 'copy');
  }).catch(() => {});
}

function shareDhikrText(dhikrId) {
  const azkarList = HISN_AZKAR[currentAzkarCategory] || [];
  const dhikr = azkarList.find(d => d.id === dhikrId);
  if (!dhikr) return;

  const content = `${dhikr.text}\n[${dhikr.ref}]`;
  if (navigator.share) {
    navigator.share({ title: 'أذكار المسلم', text: content }).catch(() => {});
  } else {
    copyDhikrText(dhikrId);
  }
}
