/* ============================================
   المسلم - Azkar Page
   ============================================ */

let currentAzkarCategory = 'morning';
let azkarCounters = {};

const AZKAR_DATA = {
  morning: [
    { text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 1, ref: "رواه أبو داود" },
    { text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ", count: 1, ref: "رواه الترمذي" },
    { text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", count: 1, ref: "سيد الاستغفار - رواه البخاري" },
    { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", count: 100, ref: "رواه مسلم" },
    { text: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 10, ref: "رواه البخاري ومسلم" },
    { text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ", count: 3, ref: "رواه ابن ماجه" },
    { text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", count: 3, ref: "رواه أبو داود والترمذي" },
    { text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَٰهَ إِلَّا أَنْتَ", count: 3, ref: "رواه أبو داود" },
    { text: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", count: 7, ref: "رواه أبو داود" },
    { text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", count: 3, ref: "رواه مسلم" },
  ],
  evening: [
    { text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 1, ref: "رواه أبو داود" },
    { text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ", count: 1, ref: "رواه الترمذي" },
    { text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", count: 1, ref: "سيد الاستغفار - رواه البخاري" },
    { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", count: 100, ref: "رواه مسلم" },
    { text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", count: 3, ref: "رواه مسلم" },
    { text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ", count: 3, ref: "رواه ابن ماجه" },
    { text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", count: 3, ref: "رواه أبو داود والترمذي" },
    { text: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", count: 7, ref: "رواه أبو داود" },
  ],
  afterPrayer: [
    { text: "أَسْتَغْفِرُ اللَّهَ (ثلاثاً)، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ", count: 1, ref: "رواه مسلم" },
    { text: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 1, ref: "رواه مسلم" },
    { text: "سُبْحَانَ اللَّهِ", count: 33, ref: "رواه مسلم" },
    { text: "الْحَمْدُ لِلَّهِ", count: 33, ref: "رواه مسلم" },
    { text: "اللَّهُ أَكْبَرُ", count: 33, ref: "رواه مسلم" },
    { text: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 1, ref: "تمام المائة - رواه مسلم" },
  ],
  sleep: [
    { text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", count: 1, ref: "رواه البخاري" },
    { text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ", count: 3, ref: "رواه أبو داود والترمذي" },
    { text: "سُبْحَانَ اللَّهِ", count: 33, ref: "رواه البخاري ومسلم" },
    { text: "الْحَمْدُ لِلَّهِ", count: 33, ref: "رواه البخاري ومسلم" },
    { text: "اللَّهُ أَكْبَرُ", count: 34, ref: "رواه البخاري ومسلم" },
    { text: "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ", count: 1, ref: "رواه البخاري ومسلم" },
  ],
  misc: [
    { text: "لَا إِلَٰهَ إِلَّا اللَّهُ", count: 100, ref: "أفضل ما قلته أنا والنبيون من قبلي" },
    { text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ", count: 10, ref: "كلمتان حبيبتان إلى الرحمن" },
    { text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", count: 10, ref: "كنز من كنوز الجنة" },
    { text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", count: 10, ref: "الصلاة على النبي ﷺ" },
    { text: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", count: 100, ref: "رواه البخاري ومسلم" },
    { text: "سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَٰهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ", count: 10, ref: "الباقيات الصالحات" },
  ]
};

function initAzkar() {
  // Auto-select category based on time
  const hour = new Date().getHours();
  if (hour >= 3 && hour < 12) {
    currentAzkarCategory = 'morning';
  } else if (hour >= 15 && hour < 20) {
    currentAzkarCategory = 'evening';
  } else if (hour >= 21 || hour < 3) {
    currentAzkarCategory = 'sleep';
  }

  // Update active button
  document.querySelectorAll('.azkar-category-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === currentAzkarCategory);
  });

  loadAzkarCategory(currentAzkarCategory);
}

function loadAzkarCategory(category) {
  currentAzkarCategory = category;

  // Update active button
  document.querySelectorAll('.azkar-category-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });

  // Load counters from storage
  const savedCounters = loadData('azkarCounters', {});
  const today = new Date().toDateString();

  if (savedCounters.date !== today) {
    azkarCounters = { date: today };
  } else {
    azkarCounters = savedCounters;
  }

  renderAzkar(category);
}

function renderAzkar(category) {
  const container = document.getElementById('azkar-container');
  container.innerHTML = '';

  const azkar = AZKAR_DATA[category];
  if (!azkar) return;

  azkar.forEach((dhikr, index) => {
    const key = `${category}_${index}`;
    const currentCount = azkarCounters[key] || 0;
    const isCompleted = currentCount >= dhikr.count;
    const progress = Math.min(currentCount / dhikr.count, 1);
    const circumference = 2 * Math.PI * 33; // radius 33 for the SVG circle

    const card = document.createElement('div');
    card.className = `dhikr-card ${isCompleted ? 'completed' : ''}`;
    card.id = `dhikr-${index}`;

    card.innerHTML = `
      <div class="dhikr-text">${dhikr.text}</div>
      <div class="dhikr-reference">${dhikr.ref}</div>
      <div class="dhikr-counter">
        <div class="counter-info">
          ${isCompleted ? '✅ اكتمل' : `المتبقي: ${dhikr.count - currentCount}`}
        </div>
        <div class="counter-circle" onclick="incrementDhikr('${key}', ${dhikr.count}, ${index})" ${isCompleted ? 'style="pointer-events:none;"' : ''}>
          ${currentCount}
          <div class="counter-progress">
            <svg viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="33" style="stroke-dashoffset: ${circumference * (1 - progress)}; stroke-dasharray: ${circumference};" />
            </svg>
          </div>
        </div>
        <div class="counter-info" style="font-size:0.7rem;color:var(--text-muted);">
          / ${dhikr.count}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function incrementDhikr(key, maxCount, index) {
  const current = azkarCounters[key] || 0;
  if (current >= maxCount) return;

  azkarCounters[key] = current + 1;
  saveData('azkarCounters', azkarCounters);

  // Vibrate
  if (azkarCounters[key] >= maxCount && navigator.vibrate) {
    navigator.vibrate([100, 50, 100]);
    showToast('ما شاء الله! اكتمل الذكر ✅', '📿');
  } else if (navigator.vibrate) {
    navigator.vibrate(30);
  }

  // Re-render the specific card
  renderAzkar(currentAzkarCategory);
}

function resetAzkarCounters() {
  azkarCounters = { date: new Date().toDateString() };
  saveData('azkarCounters', azkarCounters);
  renderAzkar(currentAzkarCategory);
  showToast('تم إعادة تعيين العدّادات', '↺');
}
