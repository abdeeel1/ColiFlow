import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

// Reusable confirmation dialog (shadcn AlertDialog) used for destructive
// actions like deleting rows from the dashboard tables. While the async
// onConfirm runs, the action button shows a spinner and the dialog stays open.
export default function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Êtes-vous sûr ?",
  description,
  confirmLabel = "Supprimer",
  loadingLabel = "Suppression…",
  cancelLabel = "Annuler",
}) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (e) => {
    e.preventDefault(); // keep the dialog open while the async action runs
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!loading) onOpenChange(o); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAction}
            disabled={loading}
            className="bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500/30"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                {loadingLabel}
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
