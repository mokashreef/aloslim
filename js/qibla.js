let qiblaBearing = 0;
let qiblaDistanceKm = 0;
let currentHeading = 0;
let hasOrientationSensor = false;
let orientationListenerActive = false;

const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

function initQibla() {
  updateQiblaLocation();
}

function updateQiblaLocation() {
  const statusEl = document.getElementById('qibla-status-text');
  if (statusEl) statusEl.textContent = 'جارٍ تحديد الموقع وحساب زاوية القبلة...';

  const savedCityId = localStorage.getItem('almuslim_selected_city');
  let coords = { lat: 21.4225, lng: 39.8262 };

  if (savedCityId && typeof getCityById === 'function') {
    const city = getCityById(savedCityId);
    coords = { lat: city.lat, lng: city.lng, name: city.name };
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        calculateQiblaValues(pos.coords.latitude, pos.coords.longitude, 'موقعك الحالي');
        startOrientationSensor();
      },
      () => {
        calculateQiblaValues(coords.lat, coords.lng, coords.name || 'مكة المكرمة');
        startOrientationSensor();
      },
      { timeout: 7000 }
    );
  } else {
    calculateQiblaValues(coords.lat, coords.lng, coords.name || 'مكة المكرمة');
    startOrientationSensor();
  }
}

function calculateQiblaValues(lat, lng, locationLabel) {
  const phi1 = (lat * Math.PI) / 180;
  const phi2 = (KAABA_LAT * Math.PI) / 180;
  const deltaLambda = ((KAABA_LNG - lng) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  qiblaBearing = (bearing + 360) % 360;

  const R = 6371;
  const deltaPhi = phi2 - phi1;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  qiblaDistanceKm = Math.round(R * c);

  renderQiblaInfo(locationLabel);
}

function getCardinalDirection(deg) {
  const directions = [
    'شمال', 'شمال شرق', 'شرق', 'جنوب شرق',
    'جنوب', 'جنوب غرب', 'غرب', 'شمال غرب'
  ];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

function renderQiblaInfo(locationLabel) {
  const degreeEl = document.getElementById('qibla-degree-val');
  const dirNameEl = document.getElementById('qibla-direction-name');
  const distanceEl = document.getElementById('qibla-distance-val');
  const statusEl = document.getElementById('qibla-status-text');
  const needleEl = document.getElementById('qibla-compass-needle');

  if (degreeEl) degreeEl.textContent = `${qiblaBearing.toFixed(1)}°`;
  if (dirNameEl) dirNameEl.textContent = getCardinalDirection(qiblaBearing);
  if (distanceEl) distanceEl.textContent = `${qiblaDistanceKm.toLocaleString('ar-EG')} كم`;
  if (statusEl) statusEl.textContent = `محسوبة بدقة من: ${locationLabel}`;

  if (needleEl && !orientationListenerActive) {
    needleEl.style.transform = `rotate(${qiblaBearing}deg)`;
  }
}

function requestSensorPermission() {
  if (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    DeviceOrientationEvent.requestPermission()
      .then((permissionState) => {
        if (permissionState === 'granted') {
          startOrientationSensor();
          showToast('تم تفعيل مستشعر البوصلة بنجاح', 'check');
        } else {
          showToast('تم رفض إذن مستشعر الاتجاه', 'warning');
        }
      })
      .catch(() => {
        showToast('تعذر الوصول لمستشعر الاتجاه', 'warning');
      });
  } else {
    startOrientationSensor();
  }
}

function startOrientationSensor() {
  if (orientationListenerActive) return;

  const handleOrientation = (e) => {
    let heading = null;

    if (e.webkitCompassHeading !== undefined) {
      heading = e.webkitCompassHeading;
    } else if (e.alpha !== null) {
      heading = 360 - e.alpha;
    }

    if (heading !== null && !isNaN(heading)) {
      hasOrientationSensor = true;
      orientationListenerActive = true;
      currentHeading = heading;

      const compassRing = document.getElementById('compass-dial-ring');
      const qiblaNeedle = document.getElementById('qibla-compass-needle');
      const headingValueEl = document.getElementById('compass-live-heading');
      const sensorNotice = document.getElementById('compass-sensor-notice');

      if (compassRing) {
        compassRing.style.transform = `rotate(${-heading}deg)`;
      }
      if (qiblaNeedle) {
        const needleAngle = qiblaBearing - heading;
        qiblaNeedle.style.transform = `rotate(${needleAngle}deg)`;
      }
      if (headingValueEl) {
        headingValueEl.textContent = `${Math.round(heading)}°`;
      }
      if (sensorNotice) {
        sensorNotice.style.display = 'none';
      }
    }
  };

  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', handleOrientation, true);
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);

    setTimeout(() => {
      if (!hasOrientationSensor) {
        const sensorNotice = document.getElementById('compass-sensor-notice');
        if (sensorNotice) sensorNotice.style.display = 'block';
      }
    }, 2000);
  }
}
