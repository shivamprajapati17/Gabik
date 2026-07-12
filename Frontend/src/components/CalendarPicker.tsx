import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  selectedStart?: Date | null;
  selectedEnd?: Date | null;
  onSelect: (start: Date, end: Date | null) => void;
  minDate?: Date;
}

export default function CalendarPicker({ selectedStart, selectedEnd, onSelect, minDate }: Props) {
  const [viewDate, setViewDate] = useState(() => selectedStart || new Date());
  const [selectingEnd, setSelectingEnd] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [year, month, daysInMonth, firstDayOfWeek]);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isToday = (d: number) => {
    const date = new Date(year, month, d);
    return date.getTime() === today.getTime();
  };

  const isSelected = (d: number) => {
    const date = new Date(year, month, d);
    if (selectedStart && date.getTime() === selectedStart.getTime()) return 'start';
    if (selectedEnd && date.getTime() === selectedEnd.getTime()) return 'end';
    if (selectedStart && selectedEnd && date > selectedStart && date < selectedEnd) return 'range';
    return null;
  };

  const isDisabled = (d: number) => {
    if (!minDate) return false;
    return new Date(year, month, d) < minDate;
  };

  const handleDayClick = (d: number) => {
    if (isDisabled(d)) return;
    const clicked = new Date(year, month, d);

    if (!selectingEnd || !selectedStart) {
      onSelect(clicked, null);
      setSelectingEnd(true);
    } else {
      if (clicked < selectedStart) {
        onSelect(clicked, null);
        setSelectingEnd(true);
      } else {
        onSelect(selectedStart, clicked);
        setSelectingEnd(false);
      }
    }
  };

  return (
    <div className="card p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gabik-ink">{MONTHS[month]} {year}</span>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gabik-100 text-gabik-ink-muted transition-colors"><ChevronLeft size={16} /></button>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gabik-100 text-gabik-ink-muted transition-colors"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Month/Year quick jump */}
      <div className="flex gap-2 mb-4">
        <select value={month} onChange={e => setViewDate(new Date(year, parseInt(e.target.value), 1))} className="input-field text-xs py-1.5 flex-1">
          {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setViewDate(new Date(parseInt(e.target.value), month, 1))} className="input-field text-xs py-1.5 flex-1">
          {Array.from({ length: 21 }, (_, i) => today.getFullYear() - 5 + i).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gabik-ink-muted py-1">{d}</div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {calendarDays.map((d, i) => {
          if (d === null) return <div key={`empty-${i}`} />;
          const sel = isSelected(d);
          const disabled = isDisabled(d);
          return (
            <button
              key={d}
              disabled={disabled}
              onClick={() => handleDayClick(d)}
              className={`
                relative text-sm py-1.5 rounded-lg transition-all text-center
                ${disabled ? 'text-gabik-border cursor-not-allowed' : 'hover:bg-gabik-100 cursor-pointer'}
                ${sel === 'start' || sel === 'end' ? 'bg-gabik-500 text-white font-semibold hover:bg-gabik-700' : ''}
                ${sel === 'range' ? 'bg-gabik-100 text-gabik-700 rounded-none' : ''}
                ${isToday(d) && !sel ? 'ring-1 ring-gabik-300 font-medium' : ''}
                ${!sel && !disabled ? 'text-gabik-ink' : ''}
              `}
            >
              {d}
              {(sel === 'start' && selectedEnd) && <span className="absolute inset-y-0 -right-0.5 w-1 bg-gabik-100" />}
            </button>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-3 flex items-center justify-between text-xs text-gabik-ink-muted">
        <span>
          {selectedStart && selectedEnd
            ? `${selectedStart.toLocaleDateString()} — ${selectedEnd.toLocaleDateString()}`
            : selectedStart
              ? `Start: ${selectedStart.toLocaleDateString()} — select end date`
              : 'Select a date'}
        </span>
        {selectedStart && (
          <button onClick={() => { onSelect(new Date(), null); setSelectingEnd(false); }} className="text-gabik-500 hover:underline">
            Clear
          </button>
        )}
      </div>

      {/* Time pickers */}
      {selectedStart && (
        <div className="mt-3 pt-3 border-t border-gabik-border grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gabik-ink-muted block mb-1">Start Time</label>
            <input
              type="time"
              defaultValue={selectedStart ? `${String(selectedStart.getHours()).padStart(2, '0')}:${String(selectedStart.getMinutes()).padStart(2, '0')}` : '09:00'}
              onChange={e => {
                const [h, m] = e.target.value.split(':').map(Number);
                const d = new Date(selectedStart);
                d.setHours(h, m, 0, 0);
                onSelect(d, selectedEnd);
              }}
              className="input-field text-xs py-1.5"
            />
          </div>
          {selectedEnd && (
            <div>
              <label className="text-xs text-gabik-ink-muted block mb-1">End Time</label>
              <input
                type="time"
                defaultValue={selectedEnd ? `${String(selectedEnd.getHours()).padStart(2, '0')}:${String(selectedEnd.getMinutes()).padStart(2, '0')}` : '17:00'}
                onChange={e => {
                  const [h, m] = e.target.value.split(':').map(Number);
                  const d = new Date(selectedEnd);
                  d.setHours(h, m, 0, 0);
                  onSelect(selectedStart, d);
                }}
                className="input-field text-xs py-1.5"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
