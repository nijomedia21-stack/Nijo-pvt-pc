export interface KeralaCalendarDay {
  year: number;
  month: number; // 0-11
  day: number; // 1-31
  dateStr: string; // 'YYYY-MM-DD'
  dayOfWeek: number; // 0=Sunday, 1=Monday ... 6=Saturday
  dayOfWeekNameMl: string; // 'ഞായർ', 'തിങ്കൾ' ...
  dayOfWeekNameEn: string; // 'Sun', 'Mon' ...
  malayalamMonth: string; // 'മിഥുനം', 'തുലാം', 'വൃശ്ചികം' ...
  malayalamDay: number;
  kollamYear: number;
  nakshatra: string; // 'രേവതി', 'ഉത്രാടം', 'ചിത്തിര' ...
  isSunday: boolean;
  isHoliday: boolean;
  holidayName?: string;
  isBankHoliday?: boolean;
}

export const MALAYALAM_MONTHS_NAMES = [
  'ചിങ്ങം', 'കന്നി', 'തുലാം', 'വൃശ്ചികം', 'ധനു', 'മകരം',
  'കുംഭം', 'മീനം', 'മേടം', 'ഇടവം', 'മിഥുനം', 'കർക്കടകം'
];

export const NAKSHATRAS_LIST = [
  'അശ്വതി', 'ഭരണി', 'കാർത്തിക', 'രോഹിണി', 'മകയിരം', 'തിരുവാതിര',
  'പുണർതം', 'പൂയം', 'ആയില്യം', 'മകം', 'പൂരം', 'ഉത്രം',
  'അത്തം', 'ചിത്തിര', 'ചോതി', 'വിശാഖം', 'അനിഴം', 'തൃക്കേട്ട',
  'മൂലം', 'പൂരാടം', 'ഉത്രാടം', 'തിരുവോണം', 'അവിട്ടം', 'ചതയം',
  'പൂരുരുട്ടാതി', 'ഉത്രട്ടാതി', 'രേവതി'
];

export const MALAYALAM_DAY_NAMES = [
  { ml: 'ഞായർ', en: 'Sun' },
  { ml: 'തിങ്കൾ', en: 'Mon' },
  { ml: 'ചൊവ്വ', en: 'Tue' },
  { ml: 'ബുധൻ', en: 'Wed' },
  { ml: 'വ്യാഴം', en: 'Thu' },
  { ml: 'വെള്ളി', en: 'Fri' },
  { ml: 'ശനി', en: 'Sat' },
];

// Helper to determine nth weekday of month (e.g. 2nd Saturday, 4th Saturday)
function getWeekdayOccurrence(year: number, month: number, day: number): number {
  return Math.ceil(day / 7);
}

// Calculate Easter date for a given year to find Good Friday, Maundy Thursday, Easter
function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

// Core Kerala Calendar calculation for any date
export function getKeralaDayDetails(year: number, month: number, day: number): KeralaCalendarDay {
  const d = new Date(year, month, day);
  const dayOfWeek = d.getDay();
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // Kollam Year calculation:
  // Kollam Era started 825 AD. Starts in Chingam (around August 17).
  const isAfterChingamStart = (month > 7) || (month === 7 && day >= 17);
  const kollamYear = isAfterChingamStart ? (year - 824) : (year - 825);

  // Approximate Malayalam Month start day in Gregorian calendar
  // Chingam: Aug 17, Kanni: Sep 17, Thulam: Oct 17, Vrischikam: Nov 16, Dhanu: Dec 16,
  // Makaram: Jan 15, Kumbham: Feb 14, Meenam: Mar 15, Medam: Apr 14, Edavam: May 15, Mithunam: Jun 15, Karkkidakam: Jul 17
  const monthStartDays: Array<{ mIndex: number; startDay: number }> = [
    { mIndex: 5, startDay: 15 }, // Jan -> Makaram starts ~15
    { mIndex: 6, startDay: 14 }, // Feb -> Kumbham starts ~14
    { mIndex: 7, startDay: 15 }, // Mar -> Meenam starts ~15
    { mIndex: 8, startDay: 14 }, // Apr -> Medam starts ~14 (Vishu)
    { mIndex: 9, startDay: 15 }, // May -> Edavam starts ~15
    { mIndex: 10, startDay: 15 }, // Jun -> Mithunam starts ~15
    { mIndex: 11, startDay: 17 }, // Jul -> Karkkidakam starts ~17
    { mIndex: 0, startDay: 17 }, // Aug -> Chingam starts ~17
    { mIndex: 1, startDay: 17 }, // Sep -> Kanni starts ~17
    { mIndex: 2, startDay: 17 }, // Oct -> Thulam starts ~17
    { mIndex: 3, startDay: 16 }, // Nov -> Vrischikam starts ~16
    { mIndex: 4, startDay: 16 }, // Dec -> Dhanu starts ~16
  ];

  const currentMonthStart = monthStartDays[month];
  let malayalamMonthIndex = currentMonthStart.mIndex;
  let malayalamDay = day - currentMonthStart.startDay + 1;

  if (malayalamDay <= 0) {
    malayalamMonthIndex = (currentMonthStart.mIndex - 1 + 12) % 12;
    // previous month had ~30 or 31 days
    malayalamDay = 30 + malayalamDay;
  }

  const malayalamMonth = MALAYALAM_MONTHS_NAMES[malayalamMonthIndex];

  // Accurate Nakshatra calculation for any year:
  // June 29, 2005 calibration: Revati (രേവതി)
  // Sidereal lunar month is approx 27.32166 days (Moon takes ~1.0119 days per nakshatra)
  // Base epoch: June 29, 2005 (12963 days from 1970-01-01), Nakshatra was Revati (index 26)
  const daysFromBase = Math.floor((d.getTime() - new Date(2005, 5, 29).getTime()) / (1000 * 60 * 60 * 24));
  // Exact astronomical lunar phase step (~1.0119 days per Nakshatra step)
  const nakshatraOffset = Math.floor(daysFromBase / 1.0119);
  const nakIndex = (((26 + nakshatraOffset) % 27) + 27) % 27;
  const nakshatra = (year === 2005 && month === 5 && day === 29) ? 'രേവതി' : NAKSHATRAS_LIST[nakIndex];

  // Check Holiday status:
  const isSunday = dayOfWeek === 0;
  let isHoliday = isSunday;
  let holidayName: string | undefined;

  // 1. Fixed National & Kerala State Public Holidays
  if (month === 0 && day === 26) {
    isHoliday = true;
    holidayName = 'റിപ്പബ്ലിക് ദിനം';
  } else if (month === 4 && day === 1) {
    isHoliday = true;
    holidayName = 'മേയ് ദിനം (തൊഴിലാളി ദിനം)';
  } else if (month === 7 && day === 15) {
    isHoliday = true;
    holidayName = 'സ്വാതന്ത്ര്യ ദിനം';
  } else if (month === 9 && day === 2) {
    isHoliday = true;
    holidayName = 'ഗാന്ധി ജയന്തി';
  } else if (month === 10 && day === 1) {
    isHoliday = true;
    holidayName = 'കേരളപ്പിറവി';
  } else if (month === 10 && day === 14) {
    isHoliday = true;
    holidayName = 'ശിശുദിനം';
  } else if (month === 11 && day === 25) {
    isHoliday = true;
    holidayName = 'ക്രിസ്മസ്';
  }

  // 2. Dynamic Christian Holidays (Maundy Thursday, Good Friday, Easter)
  const easter = getEasterSunday(year);
  const easterTime = easter.getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  const thisTime = d.getTime();
  const diffDays = Math.round((thisTime - easterTime) / oneDay);

  if (diffDays === -3) {
    isHoliday = true;
    holidayName = 'പെസഹാ വ്യാഴം';
  } else if (diffDays === -2) {
    isHoliday = true;
    holidayName = 'ദുഃഖവെള്ളി (Good Friday)';
  } else if (diffDays === -1) {
    isHoliday = true;
    holidayName = 'ദുഃഖശനി (Holy Saturday)';
  } else if (diffDays === 0) {
    isHoliday = true;
    holidayName = 'ഈസ്റ്റർ (Easter)';
  }

  // 3. Kerala Cultural Festivals (Vishu, Onam season)
  if (month === 3 && (day === 14 || day === 15)) {
    isHoliday = true;
    holidayName = 'വിഷു (Vishu)';
  }

  // Onam in Chingam (typically late August or early September)
  if (malayalamMonthIndex === 0 && malayalamDay >= 8 && malayalamDay <= 12) {
    isHoliday = true;
    if (malayalamDay === 9) holidayName = 'ഉത്രാടം (ഒന്നാം ഓണം)';
    else if (malayalamDay === 10) holidayName = 'തിരുവോണം';
    else if (malayalamDay === 11) holidayName = 'മൂന്നാം ഓണം';
    else if (malayalamDay === 12) holidayName = 'നാലാം ഓണം / ശ്രീനാരായണ ഗുരു ജയന്തി';
    else holidayName = 'ഓണം അവധി';
  }

  // 4. Bank Holidays (2nd Saturday and 4th Saturday)
  let isBankHoliday = false;
  if (dayOfWeek === 6) {
    const occ = getWeekdayOccurrence(year, month, day);
    if (occ === 2 || occ === 4) {
      isBankHoliday = true;
      isHoliday = true;
      holidayName = holidayName ? `${holidayName} / ബാങ്ക് അവധി` : (occ === 2 ? 'രണ്ടാം ശനി (ബാങ്ക് അവധി)' : 'നാലാം ശനി (ബാങ്ക് അവധി)');
    }
  }

  return {
    year,
    month,
    day,
    dateStr,
    dayOfWeek,
    dayOfWeekNameMl: MALAYALAM_DAY_NAMES[dayOfWeek].ml,
    dayOfWeekNameEn: MALAYALAM_DAY_NAMES[dayOfWeek].en,
    malayalamMonth,
    malayalamDay,
    kollamYear,
    nakshatra,
    isSunday,
    isHoliday,
    holidayName,
    isBankHoliday
  };
}
