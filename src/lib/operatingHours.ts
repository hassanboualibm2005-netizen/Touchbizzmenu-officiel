import { DayOfWeek, DaySchedule, OperatingHoursSchedule, LanguageCode } from '../types/database';

export const DAYS_ORDER: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const DAY_LABELS: Record<DayOfWeek, Record<LanguageCode, string>> = {
  monday: { fr: 'Lundi', ar: 'الإثنين', en: 'Monday' },
  tuesday: { fr: 'Mardi', ar: 'الثلاثاء', en: 'Tuesday' },
  wednesday: { fr: 'Mercredi', ar: 'الأربعاء', en: 'Wednesday' },
  thursday: { fr: 'Jeudi', ar: 'الخميس', en: 'Thursday' },
  friday: { fr: 'Vendredi', ar: 'الجمعة', en: 'Friday' },
  saturday: { fr: 'Samedi', ar: 'السبت', en: 'Saturday' },
  sunday: { fr: 'Dimanche', ar: 'الأحد', en: 'Sunday' },
};

export const DEFAULT_OPERATING_HOURS: OperatingHoursSchedule = {
  monday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
  tuesday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
  wednesday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
  thursday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
  friday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
  saturday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
  sunday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
};

const JS_DAY_INDEX_MAP: Record<number, DayOfWeek> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

/**
 * Normalizes raw operating_hours from database/JSON/null into a valid OperatingHoursSchedule
 */
export function normalizeOperatingHours(raw: any): OperatingHoursSchedule {
  if (!raw) {
    return { ...DEFAULT_OPERATING_HOURS };
  }

  let parsed = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { ...DEFAULT_OPERATING_HOURS };
    }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { ...DEFAULT_OPERATING_HOURS };
  }

  const result: Partial<OperatingHoursSchedule> = {};

  for (const day of DAYS_ORDER) {
    const dayData = parsed[day];
    if (dayData && typeof dayData === 'object') {
      result[day] = {
        isOpen: Boolean(dayData.isOpen),
        openTime: typeof dayData.openTime === 'string' && dayData.openTime.includes(':')
          ? dayData.openTime
          : '09:00',
        closeTime: typeof dayData.closeTime === 'string' && dayData.closeTime.includes(':')
          ? dayData.closeTime
          : '23:00',
      };
    } else {
      result[day] = { ...DEFAULT_OPERATING_HOURS[day] };
    }
  }

  return result as OperatingHoursSchedule;
}

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

export interface OperatingStatus {
  isOpen: boolean;
  todayKey: DayOfWeek;
  todaySchedule: DaySchedule;
  statusText: string;
  badgeColor: 'green' | 'red';
  todayHoursText: string;
  schedule: OperatingHoursSchedule;
}

/**
 * Calculates whether the restaurant is currently open or closed,
 * taking into account the schedule, overnight shifts, and current time.
 */
export function getOperatingStatus(
  rawSchedule: any,
  lang: LanguageCode = 'fr',
  refDate?: Date
): OperatingStatus {
  const schedule = normalizeOperatingHours(rawSchedule);
  const now = refDate || new Date();

  const currentDayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const todayKey = JS_DAY_INDEX_MAP[currentDayIndex];
  const todaySchedule = schedule[todayKey];

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let isOpen = false;

  // 1. Check if yesterday had an overnight shift that is still open this early morning
  const yesterdayIndex = (currentDayIndex + 6) % 7;
  const yesterdayKey = JS_DAY_INDEX_MAP[yesterdayIndex];
  const yesterdaySchedule = schedule[yesterdayKey];

  if (yesterdaySchedule && yesterdaySchedule.isOpen) {
    const yOpenMin = parseTimeToMinutes(yesterdaySchedule.openTime);
    const yCloseMin = parseTimeToMinutes(yesterdaySchedule.closeTime);

    // Overnight shift (e.g. 18:00 to 02:00)
    if (yCloseMin < yOpenMin) {
      if (currentMinutes < yCloseMin) {
        isOpen = true;
      }
    }
  }

  // 2. Check today's shift if not already determined open from overnight
  if (!isOpen && todaySchedule && todaySchedule.isOpen) {
    const tOpenMin = parseTimeToMinutes(todaySchedule.openTime);
    const tCloseMin = parseTimeToMinutes(todaySchedule.closeTime);

    if (tCloseMin > tOpenMin) {
      // Standard same-day shift (e.g. 09:00 to 23:00)
      if (currentMinutes >= tOpenMin && currentMinutes < tCloseMin) {
        isOpen = true;
      }
    } else if (tCloseMin < tOpenMin) {
      // Today has an overnight shift that starts today (e.g. 18:00 to 02:00)
      if (currentMinutes >= tOpenMin) {
        isOpen = true;
      }
    } else {
      // Open 24h if openTime === closeTime and isOpen is true
      isOpen = true;
    }
  }

  // Localized texts
  let statusText = '';
  if (isOpen) {
    if (lang === 'ar') statusText = 'مفتوح';
    else if (lang === 'en') statusText = 'Open';
    else statusText = 'Ouvert';
  } else {
    if (lang === 'ar') statusText = 'مغلق';
    else if (lang === 'en') statusText = 'Closed';
    else statusText = 'Fermé';
  }

  let todayHoursText = '';
  if (!todaySchedule || !todaySchedule.isOpen) {
    if (lang === 'ar') todayHoursText = 'مغلق اليوم';
    else if (lang === 'en') todayHoursText = 'Closed today';
    else todayHoursText = "Fermé aujourd'hui";
  } else {
    todayHoursText = `${todaySchedule.openTime} — ${todaySchedule.closeTime}`;
  }

  return {
    isOpen,
    todayKey,
    todaySchedule,
    statusText,
    badgeColor: isOpen ? 'green' : 'red',
    todayHoursText,
    schedule,
  };
}
