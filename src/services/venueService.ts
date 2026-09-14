const VENUE_STORAGE_KEY = 'dtm_active_classroom_venue';

export const CAMPUS_VENUES = [
  'Hall C-304 (Main Lecture Hall)',
  'Lab C-201 (Advanced Computing Lab)',
  'Lab C-204 (Hardware & IoT Lab)',
  'Hall C-302 (Interactive Classroom)',
  'Seminar Hall B (Block C)',
  'Auditorium 1 (Main Campus)',
];

export function getActiveVenue(): string {
  try {
    const saved = localStorage.getItem(VENUE_STORAGE_KEY);
    return saved || 'Hall C-304';
  } catch {
    return 'Hall C-304';
  }
}

export function setActiveVenue(venue: string): void {
  const clean = venue.trim() || 'Hall C-304';
  localStorage.setItem(VENUE_STORAGE_KEY, clean);
  window.dispatchEvent(new CustomEvent('dtm_venue_change', { detail: clean }));
}
