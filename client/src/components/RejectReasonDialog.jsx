import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

// Predefined rejection motifs shown as checkboxes (matches the admin mockup).
const DEFAULT_REJECT_REASONS = [
  "Photo du document floue ou illisible.",
  "Document expiré (Date de validité dépassée).",
  "Informations ne correspondent pas au profil.",
  "Document non conforme (ex: Photo de paysage au lieu d'une CIN).",
];

// Modal the admin sees before rejecting a verification document. At least one
// motif must be selected; the chosen reasons are passed back to onConfirm so
// they can be stored and shown on the member's profile.
export default function RejectReasonDialog({
  open,
  onOpenChange,
  onConfirm,
  reasons = DEFAULT_REJECT_REASONS,
  title = "Motif du refus de validation",
}) {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  // Reset the checkboxes each time the dialog (re)opens.
  useEffect(() => {
    if (open) setSelected([]);
  }, [open]);

  const toggle = (reason) =>
    setSelected((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );

  const handleConfirm = async () => {
    if (!selected.length) return;
    setLoading(true);
    try {
      await onConfirm(selected);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!loading) onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-800 dark:text-gray-100">{title}</DialogTitle>
        </DialogHeader>

        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Veuillez sélectionner au moins un motif :
        </p>

        <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-700/60">
          {reasons.map((reason) => {
            const checked = selected.includes(reason);
            return (
              <label
                key={reason}
                className="flex items-start gap-3 py-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(reason)}
                  className="mt-0.5 w-4 h-4 shrink-0 rounded accent-[#0984E3] cursor-pointer"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100">
                  {reason}
                </span>
              </label>
            );
          })}
        </div>

        <DialogFooter className="mt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 transition cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || !selected.length}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-red-500 hover:bg-red-600 active:scale-95 text-white shadow-sm transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Rejet…
              </>
            ) : (
              "Confirmer le rejet"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
