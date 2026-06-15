import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axiosClient from "@/services/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const CATEGORIES = [
  { value: "electronique", label: "Électronique" },
  { value: "documents", label: "Documents" },
  { value: "mode", label: "Mode" },
  { value: "maison", label: "Maison" },
  { value: "autre", label: "Autre" },
];

const URGENCIES = [
  { value: "standard", label: "Standard" },
  { value: "urgent", label: "Urgent" },
  { value: "très_urgent", label: "Très urgent" },
];

const inputCls =
  "w-full bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#0984E3]";

// ISO datetime → "YYYY-MM-DD" for a <input type="date">.
const toDateInput = (d) => (d ? String(d).slice(0, 10) : "");

// Edit modal for a sender's package (Mes Colis tab). Prefills from the row and
// PATCHes /api/packages/{id}; onSaved lets the dashboard refresh its list.
export default function EditPackageDialog({ open, onOpenChange, pkg, onSaved }) {
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load the city list once (for the trajet selects).
  useEffect(() => {
    if (!open || cities.length) return;
    axiosClient.get("/api/cities").then((r) => setCities(r.data)).catch(() => {});
  }, [open, cities.length]);

  // (Re)prefill the form each time a package is opened for editing.
  useEffect(() => {
    if (open && pkg) {
      setForm({
        package_name: pkg.package_name ?? "",
        from_city_id: String(pkg.from_city_id ?? pkg.from_city?.id ?? ""),
        to_city_id: String(pkg.to_city_id ?? pkg.to_city?.id ?? ""),
        category: pkg.category ?? "autre",
        urgency: pkg.urgency ?? "standard",
        package_size: pkg.package_size ?? "",
        price: pkg.price ?? "",
        date_delivery: toDateInput(pkg.date_delivery),
        description: pkg.description ?? "",
      });
    }
  }, [open, pkg]);

  const set = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.from_city_id === form.to_city_id) {
      toast.error("La ville de départ et d'arrivée doivent être différentes.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await axiosClient.patch(`/api/packages/${pkg.id}`, {
        ...form,
        package_size: Number(form.package_size),
        price: Number(form.price),
      });
      toast.success(data.message ?? "Colis mis à jour.");
      onSaved?.(data.package);
      onOpenChange(false);
    } catch (err) {
      const errors = err.response?.data?.errors;
      toast.error(errors ? Object.values(errors)[0][0] : err.response?.data?.message ?? "Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  if (!form || !pkg) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!saving) onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-800 dark:text-gray-100">Modifier le colis</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de votre colis #CF-{String(pkg.id).padStart(3, "0")}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Nom du colis</label>
            <input className={inputCls} value={form.package_name} onChange={(e) => set("package_name", e.target.value)} required minLength={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Ville de départ</label>
              <select className={inputCls} value={form.from_city_id} onChange={(e) => set("from_city_id", e.target.value)} required>
                <option value="">Sélectionner…</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Ville d'arrivée</label>
              <select className={inputCls} value={form.to_city_id} onChange={(e) => set("to_city_id", e.target.value)} required>
                <option value="">Sélectionner…</option>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Catégorie</label>
              <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Urgence</label>
              <select className={inputCls} value={form.urgency} onChange={(e) => set("urgency", e.target.value)}>
                {URGENCIES.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Poids (kg)</label>
              <input type="number" min="0" step="0.01" className={inputCls} value={form.package_size} onChange={(e) => set("package_size", e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Prix (DH)</label>
              <input type="number" min="1" className={inputCls} value={form.price} onChange={(e) => set("price", e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Livraison</label>
              <input type="date" className={inputCls} value={form.date_delivery} onChange={(e) => set("date_delivery", e.target.value)} required />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Description</label>
            <textarea rows={3} className={`${inputCls} resize-none`} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Détails du colis…" />
          </div>

          <DialogFooter className="mt-2">
            <button type="button" onClick={() => onOpenChange(false)} disabled={saving} className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 transition cursor-pointer">
              Annuler
            </button>
            <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-[#0984E3] hover:bg-blue-600 active:scale-95 text-white shadow-sm transition cursor-pointer disabled:opacity-50 disabled:active:scale-100">
              {saving ? (<><Loader2 size={16} className="animate-spin" />Enregistrement…</>) : "Enregistrer"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
