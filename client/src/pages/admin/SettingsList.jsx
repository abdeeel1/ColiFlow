import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axiosClient from '../../services/axios';
import { Loader2, Save, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const CURRENCIES = [
  { value: 'MAD', label: 'MAD (Dirham)' },
  { value: 'EUR', label: 'EUR (Euro)' },
  { value: 'USD', label: 'USD (Dollar)' },
];

// ── on/off pill toggle (mirrors the Activé/Désactivé control in the design) ──
function Toggle({ value, onChange, activeColor = 'green' }) {
  const colors = {
    green: 'bg-green-500 text-white',
    red:   'bg-red-500 text-white',
  };
  return (
    <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700/50 p-1 select-none">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition cursor-pointer ${
          value ? colors[activeColor] : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        Activé
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition cursor-pointer ${
          !value ? 'bg-red-500 text-white' : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        Désactivé
      </button>
    </div>
  );
}

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</label>
    {children}
  </div>
);

export default function SettingsList() {
  const [form, setForm]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    setLoading(true);
    axiosClient.get('/api/admin/settings')
      .then((r) => setForm(r.data.settings))
      .catch((e) => setError(e?.response?.data?.message ?? 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setVal = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axiosClient.put('/api/admin/settings', {
        platform_commission:       Number(form.platform_commission),
        withdrawal_threshold:      Number(form.withdrawal_threshold),
        support_email:             form.support_email,
        app_name:                  form.app_name,
        default_currency:          form.default_currency,
        cin_verification_required: !!form.cin_verification_required,
        maintenance_mode:          !!form.maintenance_mode,
      });
      setForm(data.settings);
      toast.success(data.message);
      // let the global banner / other tabs pick up the new maintenance state
      window.dispatchEvent(new Event('app-config-changed'));
    } catch (err) {
      const errs = err.response?.data?.errors;
      toast.error(errs ? Object.values(errs)[0][0] : err.response?.data?.message ?? 'Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#0984E3] focus:ring-2 focus:ring-[#0984E3]/10 transition';
  const triggerCls = 'w-full h-auto py-2.5 px-3.5 text-sm rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 cursor-pointer';

  return (
    <div className="flex flex-col gap-6">
      {/* ── TAB HEADER ── */}
      <div className="border-b border-gray-200 dark:border-gray-700/60">
        <span className="inline-block pb-3 text-sm font-semibold text-[#0984E3] border-b-2 border-[#0984E3]">
          Paramètres Généraux
        </span>
      </div>

      {/* live maintenance preview for the admin */}
      {!loading && form?.maintenance_mode && (
        <Alert variant="destructive" className="border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20">
          <AlertTriangle />
          <AlertTitle>Mode maintenance actif</AlertTitle>
          <AlertDescription>
            Le site est affiché en maintenance pour les utilisateurs : les opérations (création / modification de colis et trajets) sont bloquées. Les administrateurs gardent un accès complet.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700/60 p-6 sm:p-8">
        {loading || !form ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <Field label="Commission Plateforme (%)">
                <input type="number" min="0" max="100" step="0.1" className={inputCls}
                  value={form.platform_commission} onChange={set('platform_commission')} required />
              </Field>
              <Field label="Seuil de Retrait Voyageur (DH)">
                <input type="number" min="0" className={inputCls}
                  value={form.withdrawal_threshold} onChange={set('withdrawal_threshold')} required />
              </Field>
              <Field label="Email de Support">
                <input type="email" className={inputCls}
                  value={form.support_email} onChange={set('support_email')} required />
              </Field>
              <Field label="Nom de l'Application">
                <input type="text" className={inputCls}
                  value={form.app_name} onChange={set('app_name')} required />
              </Field>
              <Field label="Devise par défaut">
                <Select value={form.default_currency} onValueChange={(v) => setVal('default_currency', v)}>
                  <SelectTrigger className={triggerCls}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <Field label="Vérification CIN obligatoire">
                <Toggle
                  value={!!form.cin_verification_required}
                  onChange={(v) => setVal('cin_verification_required', v)}
                  activeColor="green"
                />
              </Field>
              <Field label="Mode Maintenance">
                <Toggle
                  value={!!form.maintenance_mode}
                  onChange={(v) => setVal('maintenance_mode', v)}
                  activeColor="red"
                />
              </Field>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg bg-[#0984E3] hover:bg-blue-600 active:scale-95 text-white shadow-sm transition cursor-pointer disabled:opacity-50">
                {saving ? (<><Loader2 size={16} className="animate-spin" />Enregistrement…</>) : (<><Save size={16} />Enregistrer</>)}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
