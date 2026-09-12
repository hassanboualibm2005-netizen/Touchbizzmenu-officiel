import React from 'react';
import { Clock, Check, Moon } from 'lucide-react';
import { OperatingHoursSchedule, DayOfWeek } from '../../types/database';
import { DAYS_ORDER, DAY_LABELS, normalizeOperatingHours } from '../../lib/operatingHours';

interface OperatingHoursEditorProps {
  value?: OperatingHoursSchedule | null;
  onChange: (updated: OperatingHoursSchedule) => void;
}

export const OperatingHoursEditor: React.FC<OperatingHoursEditorProps> = ({
  value,
  onChange,
}) => {
  const schedule = normalizeOperatingHours(value);

  const handleToggleDay = (day: DayOfWeek) => {
    const current = schedule[day];
    onChange({
      ...schedule,
      [day]: {
        ...current,
        isOpen: !current.isOpen,
      },
    });
  };

  const handleTimeChange = (day: DayOfWeek, field: 'openTime' | 'closeTime', val: string) => {
    const current = schedule[day];
    onChange({
      ...schedule,
      [day]: {
        ...current,
        [field]: val,
      },
    });
  };

  const handleApplyToAllDays = (sourceDay: DayOfWeek) => {
    const template = schedule[sourceDay];
    const newSched: Partial<OperatingHoursSchedule> = {};
    for (const d of DAYS_ORDER) {
      newSched[d] = { ...template };
    }
    onChange(newSched as OperatingHoursSchedule);
  };

  const handleSetStandardHours = () => {
    const newSched: Partial<OperatingHoursSchedule> = {};
    for (const d of DAYS_ORDER) {
      newSched[d] = {
        isOpen: true,
        openTime: '09:00',
        closeTime: '23:00',
      };
    }
    onChange(newSched as OperatingHoursSchedule);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Horaires d'ouverture (Operating Hours)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configurez les heures de service par jour de la semaine. Le badge de votre carte digitale affichera en temps réel « Ouvert » ou « Fermé ».
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSetStandardHours}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 text-xs font-medium transition-colors bg-slate-50/70 cursor-pointer"
            title="Appliquer 09:00 - 23:00 à tous les jours"
          >
            09:00 - 23:00 (Tous les jours)
          </button>
          <button
            type="button"
            onClick={() => handleApplyToAllDays('monday')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 text-xs font-medium transition-colors bg-slate-50/70 cursor-pointer"
            title="Copier les horaires du Lundi à tous les autres jours"
          >
            Copier Lundi à tous
          </button>
        </div>
      </div>

      {/* 7-Day Schedule List */}
      <div className="space-y-3">
        {DAYS_ORDER.map((dayKey) => {
          const day = schedule[dayKey];
          const labelFr = DAY_LABELS[dayKey].fr;
          const labelAr = DAY_LABELS[dayKey].ar;
          const isOvernight = day.isOpen && day.closeTime < day.openTime;

          return (
            <div
              key={dayKey}
              id={`operating-day-${dayKey}`}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                day.isOpen
                  ? 'bg-slate-50/50 border-slate-200/90'
                  : 'bg-slate-100/40 border-dashed border-slate-200 opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Day name & toggle */}
                <div className="flex items-center justify-between sm:justify-start gap-4 min-w-[170px]">
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 block">
                      {labelFr}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-arabic" dir="rtl">
                      {labelAr}
                    </span>
                  </div>

                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleDay(dayKey)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer select-none ${
                      day.isOpen
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        day.isOpen ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <span>{day.isOpen ? 'Ouvert' : 'Fermé'}</span>
                  </button>
                </div>

                {/* Time inputs or Closed banner */}
                <div className="flex-1 flex items-center justify-end">
                  {day.isOpen ? (
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-500 font-medium">De</span>
                        <input
                          type="time"
                          value={day.openTime}
                          onChange={(e) => handleTimeChange(dayKey, 'openTime', e.target.value)}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>

                      <span className="text-slate-400 text-xs font-semibold">à</span>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="time"
                          value={day.closeTime}
                          onChange={(e) => handleTimeChange(dayKey, 'closeTime', e.target.value)}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>

                      {isOvernight && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-medium border border-indigo-200/60"
                          title="Ferme le lendemain matin (service nocturne)"
                        >
                          <Moon className="w-3 h-3" />
                          <span>+1 jour</span>
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs font-medium text-slate-400 italic py-1">
                      Fermé toute la journée
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
