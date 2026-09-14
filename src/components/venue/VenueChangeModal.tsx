import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Check, X, MapPin } from 'lucide-react';
import { getActiveVenue, setActiveVenue, CAMPUS_VENUES } from '../../services/venueService';

interface VenueChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVenueChanged?: (newVenue: string) => void;
}

export const VenueChangeModal: React.FC<VenueChangeModalProps> = ({
  isOpen,
  onClose,
  onVenueChanged,
}) => {
  const [selectedVenue, setSelectedVenue] = useState(getActiveVenue());
  const [customVenue, setCustomVenue] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  if (!isOpen) return null;

  const handleApply = (venueToApply: string) => {
    const finalVenue = isCustom && customVenue.trim() ? customVenue.trim() : venueToApply;
    setActiveVenue(finalVenue);
    onVenueChanged?.(finalVenue);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md p-6 rounded-2xl erp-card shadow-2xl space-y-5 border border-[var(--erp-border-strong)] relative"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--erp-text-muted)] hover:text-[var(--erp-text-main)] p-1.5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--erp-text-main)] tracking-tight">
                Update Classroom Venue
              </h3>
              <p className="text-xs text-[var(--erp-text-muted)]">
                Daily venue assignment for B.Tech CSE (Semester III &bull; 2nd Year &bull; Section A)
              </p>
            </div>
          </div>

          <p className="text-xs text-[var(--erp-text-muted)] leading-relaxed">
            As Class Teacher, update the active lecture venue whenever lab sessions, seminars, or room reassignments occur. This updates student dashboards, the hardware gateway, and lecture logs in real time.
          </p>

          {/* Preset list */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--erp-text-faint)]">
              Select Campus Venue:
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {CAMPUS_VENUES.map((v) => {
                const isCurrent = !isCustom && selectedVenue === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setSelectedVenue(v);
                      setIsCustom(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                      isCurrent
                        ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40 shadow-sm'
                        : 'bg-[var(--erp-card-subtle)] text-[var(--erp-text-muted)] border-[var(--erp-border)] hover:text-[var(--erp-text-main)] hover:border-[var(--erp-border-strong)]'
                    }`}
                  >
                    <span className="truncate">{v}</span>
                    {isCurrent && <Check className="w-4 h-4 shrink-0 text-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom room input */}
          <div className="space-y-1.5 pt-2 border-t border-[var(--erp-border)]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--erp-text-faint)]">
              Or Specify Custom Room / Lab:
            </label>
            <input
              type="text"
              placeholder="e.g. Block C - Audi 2 or Smart Room 102"
              value={customVenue}
              onFocus={() => setIsCustom(true)}
              onChange={(e) => {
                setCustomVenue(e.target.value);
                setIsCustom(true);
              }}
              className="w-full bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--erp-text-main)] placeholder:text-[var(--erp-text-faint)] focus:outline-none focus:border-emerald-500 transition-colors font-medium"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="erp-btn px-4 py-2 rounded-xl text-xs font-semibold text-[var(--erp-text-muted)] hover:text-[var(--erp-text-main)] bg-[var(--erp-card-subtle)] border border-[var(--erp-border)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-apply-classroom-venue"
              onClick={() => handleApply(selectedVenue)}
              className="erp-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Classroom Venue</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
