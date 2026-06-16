import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import axiosClient from '../../services/axios';
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Search, ChevronRight, ChevronLeft, AlertTriangle, Clock, ShieldAlert,
  CheckCircle2, XCircle, MessageSquareWarning, Loader2, MessagesSquare,
} from 'lucide-react';

const TYPE_LABEL = {
  non_livraison:   'Colis non livré',
  colis_endommage: 'Colis endommagé',
  contenu_suspect: 'Contenu suspect / interdit',
  retard:          'Retard de livraison',
  comportement:    'Comportement inapproprié',
  autre:           'Autre',
};

const STATUS = {
  open:      { label: 'Ouverte',   badge: 'bg-orange-100 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400' },
  in_review: { label: 'En examen', badge: 'bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400' },
  resolved:  { label: 'Résolue',   badge: 'bg-green-100 text-green-600 dark:bg-green-950/20 dark:text-green-400' },
  rejected:  { label: 'Rejetée',   badge: 'bg-red-100 text-red-500 dark:bg-red-950/20 dark:text-red-400' },
};

const ROLE_LABEL = { sender: 'Expéditeur', traveler: 'Voyageur' };

const fmtNumber = (n) => Number(n || 0).toLocaleString('fr-FR');
const fmtDate   = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const avatarOf  = (name, url) => url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'M')}&background=0984E3&color=fff`;

const inputCls = 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#0984E3]';

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-4 shadow-xs transition-transform hover:-translate-y-0.5 duration-200">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: accent + '18' }}>
        {icon}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  );
}

export default function ReclamationsList() {
  const [items, setItems]   = useState([]);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter]     = useState('all');
  const [currentPage, setCurrentPage]   = useState(1);
  const itemsPerPage = 8;

  // detail / resolve dialog
  const [target, setTarget]       = useState(null);
  const [editStatus, setEditStatus] = useState('open');
  const [editResponse, setEditResponse] = useState('');
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    setLoading(true);
    axiosClient.get('/api/admin/reclamations')
      .then((r) => { setItems(r.data.reclamations ?? []); setStats(r.data.stats ?? null); })
      .catch((e) => setError(e?.response?.data?.message ?? 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, typeFilter]);

  const openDetail = (r) => {
    setTarget(r);
    setEditStatus(r.status);
    setEditResponse(r.admin_response ?? '');
  };

  const save = async () => {
    if (!target) return;
    setSaving(true);
    try {
      const { data } = await axiosClient.patch(`/api/admin/reclamations/${target.id}`, {
        status: editStatus,
        admin_response: editResponse,
      });
      setItems((prev) => prev.map((x) => (x.id === data.reclamation.id ? data.reclamation : x)));
      // refresh stat tiles locally
      setStats((prev) => {
        if (!prev) return prev;
        const next = { open: 0, in_review: 0, resolved: 0, rejected: 0 };
        const updated = items.map((x) => (x.id === data.reclamation.id ? data.reclamation : x));
        updated.forEach((x) => { next[x.status] = (next[x.status] ?? 0) + 1; });
        return { ...prev, ...next };
      });
      toast.success(data.message);
      setTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => items.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQ = !q ||
      r.ref.toLowerCase().includes(q) ||
      (r.author ?? '').toLowerCase().includes(q) ||
      (r.against ?? '').toLowerCase().includes(q) ||
      (r.subject ?? '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesType   = typeFilter === 'all' || r.type === typeFilter;
    return matchesQ && matchesStatus && matchesType;
  }), [items, searchQuery, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated  = filtered.slice(startIndex, startIndex + itemsPerPage);

  const triggerCls = 'h-auto py-2 px-3.5 text-sm font-medium rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 shadow-xs cursor-pointer';

  return (
    <div className="flex flex-col gap-5">

      {/* ── HEADER ── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Réclamations</h2>
        <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
          Gestion <ChevronRight size={13} /> Litiges <ChevronRight size={13} />
          <span className="text-[#0984E3] font-medium">Réclamations des membres</span>
        </p>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {loading || !stats ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-4 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse mb-3" />
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))
        ) : (
          <>
            <StatCard icon={<MessageSquareWarning size={16} className="text-[#0984E3]" />} label="Total"      value={fmtNumber(stats.total)}     accent="#0984E3" />
            <StatCard icon={<Clock size={16} className="text-[#F39C12]" />}                label="Ouvertes"   value={fmtNumber(stats.open)}      accent="#F39C12" />
            <StatCard icon={<ShieldAlert size={16} className="text-[#6C5CE7]" />}          label="En examen"  value={fmtNumber(stats.in_review)} accent="#6C5CE7" />
            <StatCard icon={<CheckCircle2 size={16} className="text-[#00B894]" />}         label="Résolues"   value={fmtNumber(stats.resolved)}  accent="#00B894" />
            <StatCard icon={<XCircle size={16} className="text-[#E17055]" />}              label="Rejetées"   value={fmtNumber(stats.rejected)}  accent="#E17055" />
          </>
        )}
      </div>

      {/* ── TOOLBAR ── */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une réf (#REC), un membre ou un sujet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-9 pr-4 py-2 w-full ${inputCls}`}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className={triggerCls}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="open">Ouverte</SelectItem>
            <SelectItem value="in_review">En examen</SelectItem>
            <SelectItem value="resolved">Résolue</SelectItem>
            <SelectItem value="rejected">Rejetée</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className={triggerCls}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les motifs</SelectItem>
            {Object.entries(TYPE_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* ── TABLE ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm">
            <thead className="bg-blue-50/60 dark:bg-gray-700/30 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                {['Réf.', 'Auteur', 'Motif', 'Sujet', 'Contre', 'Date', 'Statut'].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
                <th className="px-4 py-3.5 text-left font-semibold w-20">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}><td colSpan="8" className="px-4 py-4"><div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td></tr>
              ))}

              {!loading && paginated.map((r) => {
                const s = STATUS[r.status] ?? STATUS.open;
                return (
                  <tr key={r.id} className="group hover:bg-gray-50/60 dark:hover:bg-gray-700/10 transition">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{r.ref}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={avatarOf(r.author, r.author_avatar)} alt={r.author} className="w-8 h-8 rounded-full object-cover" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 dark:text-gray-100">{r.author}</p>
                          <p className="text-[11px] text-gray-400">{ROLE_LABEL[r.role] ?? r.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-300">
                        {TYPE_LABEL[r.type] ?? r.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-50 truncate">{r.subject}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{r.against}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${s.badge}`}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetail(r)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-[#0984E3] hover:bg-[#0984E3] hover:text-white border border-blue-200 hover:border-[#0984E3] transition cursor-pointer whitespace-nowrap"
                      >
                        Traiter
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-16 text-gray-400 dark:text-gray-500">
                    <MessageSquareWarning size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">Aucune réclamation</p>
                    <p className="text-xs mt-1">Ajustez vos filtres pour voir d'autres litiges.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Page <span className="font-bold text-gray-600 dark:text-gray-300">{currentPage}</span> sur{' '}
              <span className="font-bold text-gray-600 dark:text-gray-300">{totalPages}</span> — {filtered.length} réclamation(s)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-3 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Préc.
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-3 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1"
              >
                Suiv. <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── DETAIL / RESOLVE DIALOG ── */}
      <Dialog open={!!target} onOpenChange={(o) => { if (!o && !saving) setTarget(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-500" /> {target?.ref} — Traiter la réclamation
            </DialogTitle>
            <DialogDescription>
              {target && `${TYPE_LABEL[target.type] ?? target.type} · ${ROLE_LABEL[target.role] ?? target.role}`}
            </DialogDescription>
          </DialogHeader>

          {target && (
            <div className="flex flex-col gap-4">
              {/* Parties */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                  <p className="text-[11px] text-gray-400 uppercase font-semibold mb-1.5">Auteur</p>
                  <div className="flex items-center gap-2">
                    <img src={avatarOf(target.author, target.author_avatar)} alt={target.author} className="w-7 h-7 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{target.author}</p>
                      {target.author_email && <p className="text-[11px] text-gray-400 truncate">{target.author_email}</p>}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                  <p className="text-[11px] text-gray-400 uppercase font-semibold mb-1.5">Mis en cause</p>
                  <div className="flex items-center gap-2">
                    <img src={avatarOf(target.against, target.against_avatar)} alt={target.against} className="w-7 h-7 rounded-full object-cover" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{target.against}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{target.subject}</p>
                {target.package && <p className="text-xs text-gray-400 mt-0.5">Colis : {target.package}</p>}
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-line">{target.description}</p>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Statut</label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="w-full h-auto py-2.5 px-3 text-sm rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:border-gray-300 focus:ring-2 focus:ring-[#0984E3]/30 cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open" className="cursor-pointer">Ouverte</SelectItem>
                    <SelectItem value="in_review" className="cursor-pointer">En examen</SelectItem>
                    <SelectItem value="resolved" className="cursor-pointer">Résolue</SelectItem>
                    <SelectItem value="rejected" className="cursor-pointer">Rejetée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Admin response */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                  <MessagesSquare size={14} className="text-[#0984E3]" /> Réponse au membre
                </label>
                <textarea
                  className={`w-full ${inputCls} resize-none`}
                  rows={4}
                  value={editResponse}
                  onChange={(e) => setEditResponse(e.target.value)}
                  maxLength={2000}
                  placeholder="Message visible par l'auteur de la réclamation…"
                />
              </div>

              <DialogFooter className="mt-2">
                <button
                  type="button"
                  onClick={() => setTarget(null)}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-[#0984E3] hover:bg-blue-600 active:scale-95 text-white shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? (<><Loader2 size={16} className="animate-spin" /> Enregistrement…</>) : 'Enregistrer'}
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
