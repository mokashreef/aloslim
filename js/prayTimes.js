const PrayTimes = (function () {
  const METHODS = {
    MWL: {
      name: 'رابطة العالم الإسلامي',
      params: { fajr: 18, isha: 17 }
    },
    ISNA: {
      name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)',
      params: { fajr: 15, isha: 15 }
    },
    Egypt: {
      name: 'الهيئة المصرية العامة للمساحة',
      params: { fajr: 19.5, isha: 17.5 }
    },
    Makkah: {
      name: 'جامعة أم القرى - مكة المكرمة',
      params: { fajr: 18.5, isha: '90 min' }
    },
    Karachi: {
      name: 'جامعة العلوم الإسلامية بكراتشي',
      params: { fajr: 18, isha: 18 }
    },
    Tehran: {
      name: 'معهد الجيوفيزياء بجامعة طهران',
      params: { fajr: 17.7, isha: 14, maghrib: 4.5, midnight: 'Jafari' }
    },
    Gulf: {
      name: 'دبي ودول الخليج العربي',
      params: { fajr: 18.2, isha: 18.2 }
    },
    Kuwait: {
      name: 'وزارة الأوقاف والشؤون الإسلامية - الكويت',
      params: { fajr: 18, isha: 17.5 }
    },
    Qatar: {
      name: 'وزارة الأوقاف والشؤون الإسلامية - قطر',
      params: { fajr: 18, isha: '90 min' }
    }
  };

  let calcMethod = 'Makkah';
  let asrJuristic = 'Shafii';

  const dsin = (d) => Math.sin((d * Math.PI) / 180.0);
  const dcos = (d) => Math.cos((d * Math.PI) / 180.0);
  const dtan = (d) => Math.tan((d * Math.PI) / 180.0);
  const darcsin = (x) => (Math.asin(x) * 180.0) / Math.PI;
  const darccos = (x) => (Math.acos(x) * 180.0) / Math.PI;
  const darctan = (x) => (Math.atan(x) * 180.0) / Math.PI;
  const darctan2 = (y, x) => (Math.atan2(y, x) * 180.0) / Math.PI;
  const darccot = (x) => (Math.atan(1.0 / x) * 180.0) / Math.PI;
  const fixAngle = (a) => {
    a = a - 360.0 * Math.floor(a / 360.0);
    return a < 0 ? a + 360.0 : a;
  };
  const fixHour = (a) => {
    a = a - 24.0 * Math.floor(a / 24.0);
    return a < 0 ? a + 24.0 : a;
  };

  function julian(year, month, day) {
    if (month <= 2) {
      year -= 1;
      month += 12;
    }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    return (
      Math.floor(365.25 * (year + 4716)) +
      Math.floor(30.6001 * (month + 1)) +
      day +
      B -
      1524.5
    );
  }

  function sunPosition(jd) {
    const D = jd - 2451545.0;
    const g = fixAngle(357.529 + 0.98560028 * D);
    const q = fixAngle(280.459 + 0.98564736 * D);
    const L = fixAngle(q + 1.915 * dsin(g) + 0.02 * dsin(2 * g));

    const e = 23.439 - 0.00000036 * D;
    const d = darcsin(dsin(e) * dsin(L));
    let RA = darctan2(dcos(e) * dsin(L), dcos(L)) / 15.0;
    RA = fixHour(RA);
    const EqT = q / 15.0 - RA;

    return { declination: d, equation: EqT };
  }

  function midDay(time, jd) {
    const eqt = sunPosition(jd + time).equation;
    return fixHour(12 - eqt);
  }

  function sunAngleTime(angle, time, direction, jd, lat) {
    const decl = sunPosition(jd + time).declination;
    const noon = midDay(time, jd);
    const cosAngle =
      (-dsin(angle) - dsin(lat) * dsin(decl)) / (dcos(lat) * dcos(decl));

    if (cosAngle > 1 || cosAngle < -1) return null;

    const t = (1.0 / 15.0) * darccos(cosAngle);
    return noon + (direction === 'ccw' ? -t : t);
  }

  function asrTime(factor, time, jd, lat) {
    const decl = sunPosition(jd + time).declination;
    const angle = -darccot(factor + dtan(Math.abs(lat - decl)));
    return sunAngleTime(angle, time, 'cw', jd, lat);
  }

  function floatToTime24(time) {
    if (time === null || isNaN(time)) return '--:--';
    time = fixHour(time + 0.5 / 60);
    const hours = Math.floor(time);
    const minutes = Math.floor((time - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  return {
    setMethod(methodKey) {
      if (METHODS[methodKey]) calcMethod = methodKey;
    },
    getMethod() {
      return calcMethod;
    },
    getMethods() {
      return METHODS;
    },
    setAsrMadhab(madhab) {
      asrJuristic = madhab === 'Hanafi' || madhab === '1' ? 'Hanafi' : 'Shafii';
    },
    getAsrMadhab() {
      return asrJuristic;
    },

    getTimes(date, coords, timezoneOffsetHours) {
      const lat = coords.latitude || coords.lat || 21.4225;
      const lng = coords.longitude || coords.lng || 39.8262;

      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      const tz =
        timezoneOffsetHours !== undefined
          ? timezoneOffsetHours
          : -date.getTimezoneOffset() / 60;

      const jd = julian(year, month, day) - lng / (15.0 * 24.0);
      const params = METHODS[calcMethod].params;

      let fajr = 5 / 24;
      let sunrise = 6 / 24;
      let dhuhr = 12 / 24;
      let asr = 15 / 24;
      let sunset = 18 / 24;
      let maghrib = 18 / 24;
      let isha = 19.5 / 24;

      const asrFactor = asrJuristic === 'Hanafi' ? 2 : 1;

      for (let i = 0; i < 2; i++) {
        dhuhr = midDay(dhuhr, jd);
        sunrise = sunAngleTime(0.833, sunrise, 'ccw', jd, lat);
        sunset = sunAngleTime(0.833, sunset, 'cw', jd, lat);
        fajr = sunAngleTime(params.fajr, fajr, 'ccw', jd, lat);
        asr = asrTime(asrFactor, asr, jd, lat);

        if (params.maghrib) {
          maghrib = sunAngleTime(params.maghrib, maghrib, 'cw', jd, lat);
        } else {
          maghrib = sunset;
        }

        if (typeof params.isha === 'string' && params.isha.includes('min')) {
          const minutes = parseFloat(params.isha);
          isha = maghrib + minutes / 60.0;
        } else {
          isha = sunAngleTime(params.isha, isha, 'cw', jd, lat);
        }
      }

      const adjustTime = (t) => {
        if (t === null) return null;
        return t + tz - lng / 15.0;
      };

      return {
        Fajr: floatToTime24(adjustTime(fajr)),
        Sunrise: floatToTime24(adjustTime(sunrise)),
        Dhuhr: floatToTime24(adjustTime(dhuhr)),
        Asr: floatToTime24(adjustTime(asr)),
        Sunset: floatToTime24(adjustTime(sunset)),
        Maghrib: floatToTime24(adjustTime(maghrib)),
        Isha: floatToTime24(adjustTime(isha))
      };
    }
  };
})();
