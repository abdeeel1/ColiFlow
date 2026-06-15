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

const CAR_TYPES = [
  { value: "voiture", label: "Voiture" },
  { value: "moto", label: "Moto" },
  { value: "camionnette", label: "Camionnette" },
  { value: "petit_camion", label: "Petit camion" },
];

const ACCEPTED_CHOICES = [
  "Documents & Plis",
  "Vêtements & Textile",
  "Électronique & High-tech",
  "Alimentaire (Non périssable)",
  "Objets fragiles",
  "Divers",
];

const inputCls =
  "w-full bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#0984E3]";

const toDateInput = (d) => (d ? String(d).slice(0, 10) : "");

// Edit modal for a traveler's published trajet (Gestion de mes Trajets tab).
// Loads the full travel on open, then PATCHes /api/traveler/travels/{id}.
export default function EditTravelDialog({ open, onOpenChange, travelId, onSaved }) {
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || cities.length) return;
    axiosClient.get("/api/cities").then((r) => setCities(r.data)).catch(() => {});
  }, [open, cities.length]);

  // Fetch the full travel record each time the dialog opens for a given id.
  useEffect(() => {
    if (!open || !travelId) return;
    setLoading(true);
    setForm(null);
    axiosClient.get(`/api/travels/${travelId}`)
      .then((r) => {
        const t = r.data;
        setForm({
          from_city_id: String(t.from_city_id ?? t.from_city?.id ?? ""),
          to_city_id: String(t.to_city_id ?? t.to_city?.id ?? ""),
          departure_date: toDateInput(t.departure_date),
          max_weight: t.max_weight ?? "",
          price: t.price ?? "",
          car_type: t.car_type ?? "voiture",
          car_model: t.car_model ?? "",
          car_identifier: t.car_identifier ?? "",
          accepted_categories: Array.isArray(t.accepted_categories) ? t.accepted_categories : [],
        });
      })
      .catch((e) => toast.error(e?.response?.data?.message ?? "Impossible de charger le trajet."))
      .finally(() => setLoading(false));
  }, [open, travelId]);

  const set = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const toggleCategory = (choice) =>
    setForm((p) => ({
      ...p,
      accepted_categories: p.accepted_categories.includes(choice)
        ? p.accepted_categories.filter((c) => c !== choice)
        : [...p.accepted_categories, choice],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.from_city_id === form.to_city_id) {
      toast.error("La ville de départ et d'arrivée doivent être différentes.");
      return;
    }
    if (!form.accepted_categories.length) {
      toast.error("Sélectionnez au moins un type de colis accepté.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await axiosClient.patch(`/api/traveler/travels/${travelId}`, {
        ...form,
        max_weight: Number(form.max_weight),
        price: Number(form.price),
      });
      toast.success(data.message ?? "Trajet mis à jour.");
      onSaved?.(data.travel);
      onOpenChange(false);
    } catch (err) {
      const errors = err.response?.data?.errors;
      toast.error(errors ? Object.values(errors)[0][0] : err.response?.data?.message ?? "Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!saving) onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-800 dark:text-gray-100">Modifier le trajet</DialogTitle>
          <DialogDescription>
            Mettez à jour votre trajet #TR-{String(travelId).padStart(3, "0")}.
          </DialogDescription>
        </DialogHeader>

        {loading || !form ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Date de départ</label>
                <input type="date" className={inputCls} value={form.departure_date} onChange={(e) => set("departure_date", e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Capacité (kg)</label>
                <input type="number" min="1" className={inputCls} value={form.max_weight} onChange={(e) => set("max_weight", e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Prix (DH)</label>
                <input type="number" min="1" className={inputCls} value={form.price} onChange={(e) => set("price", e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Type de véhicule</label>
                <select className={inputCls} value={form.car_type} onChange={(e) => set("car_type", e.target.value)}>
                  {CAR_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Modèle</label>
                <input className={inputCls} value={form.car_model} onChange={(e) => set("car_model", e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Immatriculation</label>
                <input className={inputCls} value={form.car_identifier} onChange={(e) => set("car_identifier", e.target.value)} required />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Types de colis acceptés</label>
              <div className="flex flex-wrap gap-2">
                {ACCEPTED_CHOICES.map((choice) => {
                  const active = form.accepted_categories.includes(choice);
                  return (
                    <button
                      type="button"
                      key={choice}
                      onClick={() => toggleCategory(choice)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                        active
                          ? "bg-[#0984E3] text-white border-[#0984E3]"
                          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#0984E3]"
                      }`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
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
        )}
      </DialogContent>
    </Dialog>
  );
}
