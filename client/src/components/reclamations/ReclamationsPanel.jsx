import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { motion as Motion, AnimatePresence } from 'motion/react';
import axiosClient from '../../services/axios';
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Plus, AlertTriangle, ShieldAlert, Clock, CheckCircle2, XCircle,
  MessageSquareWarning, Loader2, Inbox, ChevronRight, Package as PackageIcon, ArrowRight,
} from 'lucide-react';

// ── reference data ───────────────────────────────────────────────────────────
const RECLAMATION_TYPES = [
  { value: 'non_livraison',   label: 'Colis non livré' },
  { value: 'colis_endommage', label: 'Colis endommagé' },
  { value: 'contenu_suspect', label: 'Contenu suspect / interdit' },
  { value: 'retard',          label: 'Retard de livraison' },
  { value: 'comportement',    label: 'Comportement inapproprié' },
  { value: 'autre',           label: 'Autre' },
];

const TYPE_LABEL = Object.fromEntries(RECLAMATION_TYPES.map((t) => [t.value, t.label]));

const STATUS = {
  open:      { label: 'Ouverte',  cls: 'bg-orange-100 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400', dot: 'bg-orange-500', Icon: Clock },
  in_review: { label: 'En examen', cls: 'bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',         dot: 'bg-blue-500',   Icon: ShieldAlert },
  resolved:  { label: 'Résolue',  cls: 'bg-green-100 text-green-600 dark:bg-green-950/20 dark:text-green-400',      dot: 'bg-green-500',  Icon: CheckCircle2 },
  rejected:  { label: 'Rejetée',  cls: 'bg-red-100 text-red-500 dark:bg-red-950/20 dark:text-red-400',              dot: 'bg-red-500',    Icon: XCircle },
};

const inputCls = 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#0984E3] w-full';
const selectTriggerCls = 'w-full h-auto py-2.5 px-3 text-sm rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:border-gray-300 focus:ring-2 focus:ring-[#0984E3]/30 data-[placeholder]:text-gray-400 cursor-pointer';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

/**
 * "Mes Réclamations" — list + create panel shared by the sender and traveler
 * dashboards. `role` controls which deliveries can be claimed about and scopes
 * the list. The other party label adapts to the role.
 */
export default function ReclamationsPanel({ role = 'sender' }) {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // create dialog
  const [open, setOpen]           = useState(false);
  const [eligible, setEligible]   = useState([]);
  const [eligibleLoading, setEligibleLoading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({ travel_request_id: '', type: 'non_livraison', subject: '', description: '' });

  const otherLabel = role === 'sender' ? 'Voyageur' : 'Expéditeur';

  const fetchList = useCallback(() => {
    setLoading(true);
    setError(null);
    axiosClient.get('/api/reclamations', { params: { role } })
      .then((r) => setItems(r.data ?? []))
      .catch((e) => setError(e?.response?.data?.message ?? 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [role]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const openDialog = () => {
    setForm({ travel_request_id: '', type: 'non_livraison', subject: '', description: '' });
    setOpen(true);
    setEligibleLoading(true);
    axiosClient.get('/api/reclamations/eligible', { params: { role } })
      .then((r) => setEligible(r.data ?? []))
      .catch(() => setEligible([]))
      .finally(() => setEligibleLoading(false));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.travel_request_id) {
      toast.error('Sélectionnez la livraison concernée.');
      return;
    }
    if (!form.subject.trim()) {
      toast.error('Indiquez un sujet.');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Décrivez le problème rencontré.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await axiosClient.post('/api/reclamations', {
        travel_request_id: Number(form.travel_request_id),
        type:        form.type,
        subject:     form.subject,
        description: form.description,
      });
      setItems((prev) => [data.reclamation, ...prev]);
      toast.success(data.message);
      setOpen(false);
    } catch (err) {
      const errs = err.response?.data?.errors;
      toast.error(errs ? Object.values(errs)[0][0] : err.response?.data?.message ?? "Erreur lors de l'envoi.");
    } finally {
      setSaving(false);
    }
  };

  const counts = {
    open:     items.filter((r) => r.status === 'open').length,
    review:   items.filter((r) => r.status === 'in_review').length,
    resolved: items.filter((r) => r.status === 'resolved').length,
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ── Top bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl px-5 py-3 shadow-xs">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{items.length}</div>
            <div className="text-xs text-gray-400 whitespace-nowrap">Total</div>
          </div>
          <div className="w-px h-10 bg-gray-100 dark:bg-gray-700" />
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{counts.open}</div>
            <div className="text-xs text-gray-400">Ouvertes</div>
          </div>
          <div className="w-px h-10 bg-gray-100 dark:bg-gray-700" />
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{counts.review}</div>
            <div className="text-xs text-gray-400 whitespace-nowrap">En examen</div>
          </div>
          <div className="w-px h-10 bg-gray-100 dark:bg-gray-700" />
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{counts.resolved}</div>
            <div className="text-xs text-gray-400">Résolues</div>
          </div>
        </div>

        <Motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openDialog}
          className="flex items-center justify-center gap-2 bg-[#0984E3] hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} /> Nouvelle réclamation
        </Motion.button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* ── List ── */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
            <Inbox size={26} className="text-[#0984E3]" />
          </div>
          <p className="font-semibold text-gray-700 dark:text-gray-200">Aucune réclamation</p>
          <p className="text-sm text-gray-400 max-w-sm">
            Un problème avec une livraison (colis non reçu, endommagé, contenu suspect…) ? Ouvrez une réclamation et notre équipe s'en occupe.
          </p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <div className="flex flex-col gap-3">
            {items.map((r) => {
              const s = STATUS[r.status] ?? STATUS.open;
              return (
                <Motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center shrink-0">
                        <MessageSquareWarning size={20} className="text-orange-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-gray-400">{r.ref}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-300">
                            {TYPE_LABEL[r.type] ?? r.type}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-1 truncate">{r.subject}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{r.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-2 flex-wrap">
                          {r.package && <span>Colis : <span className="text-gray-600 dark:text-gray-300 font-medium">{r.package}</span></span>}
                          <span>{otherLabel} : <span className="text-gray-600 dark:text-gray-300 font-medium">{r.against}</span></span>
                          <span>{fmtDate(r.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${s.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </div>

                  {r.admin_response && (
                    <div className="mt-4 ml-13 bg-blue-50/60 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-3">
                      <p className="text-xs font-semibold text-[#0984E3] mb-1 flex items-center gap-1.5">
                        <ShieldAlert size={13} /> Réponse de l'équipe ColiFlow
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{r.admin_response}</p>
                    </div>
                  )}
                </Motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      {/* ── Create dialog ── */}
      <Dialog open={open} onOpenChange={(o) => { if (!o && !saving) setOpen(false); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-500" /> Nouvelle réclamation
            </DialogTitle>
            <DialogDescription>
              Décrivez le problème rencontré. L'équipe ColiFlow examinera votre demande.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="flex flex-col gap-4">
            {/* Delivery */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Livraison concernée</label>
              {eligibleLoading ? (
                <div className="h-11 rounded-lg bg-gray-100 dark:bg-gray-700/40 animate-pulse" />
              ) : eligible.length === 0 ? (
                <p className="text-sm text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2.5">
                  Aucune livraison éligible. Vous ne pouvez ouvrir une réclamation que sur un colis accepté, en transit ou livré.
                </p>
              ) : (
                <Select
                  value={form.travel_request_id}
                  onValueChange={(v) => setForm((f) => ({ ...f, travel_request_id: v }))}
                >
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue placeholder="Sélectionner une livraison…" />
                  </SelectTrigger>
                  <SelectContent className="max-w-(--radix-select-trigger-width)">
                    {eligible.map((d) => (
                      <SelectItem key={d.travel_request_id} value={String(d.travel_request_id)} className="cursor-pointer py-2">
                        <span className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
                            <PackageIcon size={14} className="text-[#0984E3]" />
                          </span>
                          <span className="flex flex-col min-w-0">
                            <span className="font-medium text-gray-800 dark:text-gray-100 truncate">{d.package}</span>
                            <span className="text-xs text-gray-400 flex items-center gap-1 truncate">
                              <span className="capitalize">{d.from_city}</span>
                              <ArrowRight size={11} className="shrink-0" />
                              <span className="capitalize">{d.to_city}</span>
                              <span className="mx-1">·</span>
                              {otherLabel}: {d.against}
                            </span>
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Motif</label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger className={selectTriggerCls}>
                  <SelectValue placeholder="Choisir un motif…" />
                </SelectTrigger>
                <SelectContent>
                  {RECLAMATION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="cursor-pointer">{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Sujet</label>
              <input
                className={inputCls}
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                maxLength={150}
                placeholder="Ex : Colis jamais reçu"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Description détaillée</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                maxLength={2000}
                placeholder="Expliquez ce qui s'est passé…"
              />
            </div>

            <DialogFooter className="mt-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving || eligible.length === 0}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-[#0984E3] hover:bg-blue-600 active:scale-95 text-white shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {saving ? (<><Loader2 size={16} className="animate-spin" /> Envoi…</>) : (<>Envoyer <ChevronRight size={15} /></>)}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
