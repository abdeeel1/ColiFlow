import { ShieldAlert, LifeBuoy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Shown when a suspended member tries to create a package or publish a travel.
// Closing it sends them back (they can't proceed while suspended).
export default function SuspendedAccountDialog({
  open,
  onClose,
  description = "Votre compte a été suspendu. Vous ne pouvez pas créer de colis ni publier de trajets pour le moment.",
  supportEmail = "support@coliflow.com",
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose?.(); }}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
            <ShieldAlert size={24} className="text-amber-500" />
          </div>
          <DialogTitle className="text-center text-gray-800 dark:text-gray-100">
            Compte suspendu
          </DialogTitle>
          <DialogDescription className="text-center">
            {description} Veuillez contacter le support pour réactiver votre compte.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 sm:justify-center">
          <button
            type="button"
            onClick={() => onClose?.()}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer"
          >
            Retour
          </button>
          <a
            href={`mailto:${supportEmail}?subject=${encodeURIComponent("Compte suspendu — Demande de réactivation")}`}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-[#0984E3] hover:bg-blue-600 active:scale-95 text-white shadow-sm transition cursor-pointer"
          >
            <LifeBuoy size={16} />
            Contacter le support
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
