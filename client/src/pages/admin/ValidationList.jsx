import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import axiosClient from '../../services/axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import RejectReasonDialog from '../../components/RejectReasonDialog';
import {
  Search, Filter, Download, Check, X, Eye,
  MoreHorizontal, ShieldCheck, ChevronRight,
} from 'lucide-react';

const STATUS = {
  approuve: { label: 'Approuvé',   dot: 'bg-green-500',  badge: 'bg-green-100 text-green-600 dark:bg-green-950/20 dark:text-green-400' },
  attente:  { label: 'En attente', dot: 'bg-orange-400', badge: 'bg-orange-100 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400' },
  rejete:   { label: 'Rejeté',     dot: 'bg-red-500',    badge: 'bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400' },
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—';

export default function ValidationList() {
  const [, setSearchParams] = useSearchParams();

  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters]   = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openMenuKey, setOpenMenuKey]   = useState(null);
  const [currentPage, setCurrentPage]   = useState(1);
  // approval confirm — null | { action, scope: 'single', id, category } | { action, scope: 'bulk', items }
  const [confirm, setConfirm] = useState(null);
  // rejection modal — null | { scope: 'single', id, category } | { scope: 'bulk', items }
  const [rejectTarget, setRejectTarget] = useState(null);
  const menuRef = useRef(null);
  const itemsPerPage = 10;

  const load = () => {
    setLoading(true);
    axiosClient.get('/api/admin/validations')
      .then((r) => setDossiers(r.data.dossiers ?? []))
      .catch((e) => setError(e?.response?.data?.message ?? 'Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuKey(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openExam = (id) => setSearchParams({ tab: 'validation', dossier: id });

  const toggleRow = (key) =>
    setSelectedKeys((p) => (p.includes(key) ? p.filter((r) => r !== key) : [...p, key]));

  const itemsFromKeys = (keys) =>
    dossiers.filter((d) => keys.includes(d.key)).map((d) => ({ id: d.id, category: d.category }));

  // ── actions ────────────────────────────────────────────────────────────
  const performSingle = async (action, id, category, reasons) => {
    try {
      const payload = action === 'reject' ? { category, reasons } : { category };
      const { data } = await axiosClient.patch(`/api/admin/validations/${id}/${action}`, payload);
      setDossiers((prev) => prev.map((d) => (d.key === data.dossier.key ? data.dossier : d)));
      setSelectedKeys((prev) => prev.filter((k) => k !== `${id}-${category}`));
      toast.success(data.message);
    } catch (e) {
      toast.error(e?.response?.data?.message ?? 'Une erreur est survenue.');
    }
  };

  const performBulk = async (action, items, reasons) => {
    if (!items.length) return;
    try {
      const payload = action === 'reject' ? { items, action, reasons } : { items, action };
      const { data } = await axiosClient.patch('/api/admin/validations/bulk', payload);
      toast.success(data.message);
      setSelectedKeys([]);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message ?? 'Une erreur est survenue.');
    }
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    if (confirm.scope === 'bulk') await performBulk(confirm.action, confirm.items);
    else await performSingle(confirm.action, confirm.id, confirm.category);
    setConfirm(null);
  };

  // Reject (single or bulk) with the motifs picked in the modal.
  const handleReject = async (reasons) => {
    if (!rejectTarget) return;
    if (rejectTarget.scope === 'bulk') await performBulk('reject', rejectTarget.items, reasons);
    else await performSingle('reject', rejectTarget.id, rejectTarget.category, reasons);
    setRejectTarget(null);
  };

  const handleExport = () => {
    const cols = ['ID Dossier', 'Véhicule', 'Utilisateur', "Date d'envoi", 'Type de Document', 'Statut'];
    const rows = filtered.map((d) => [
      d.ref, d.vehicle ?? '—', d.user, fmtDate(d.date), d.doc_type, STATUS[d.status]?.label ?? d.status,
    ]);
    const csv = [cols, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'validations.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── filtering / pagination ─────────────────────────────────────────────
  const filtered = dossiers.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      d.ref.toLowerCase().includes(q) ||
      d.user.toLowerCase().includes(q) ||
      (d.vehicle ?? '').toLowerCase().includes(q) ||
      d.doc_type.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const pendingDossiers = dossiers.filter((d) => d.status === 'attente');
  const pendingCount = pendingDossiers.length;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const pageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  // selectable (pending) rows on the current page
  const selectablePending = paginated.filter((d) => d.status === 'attente').map((d) => d.key);

  const CAT_BADGE = {
    identity: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
    vehicle:  'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400',
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Centre de Validation des Profils</h2>
            <span className="bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
              +{pendingCount}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            Examinez et approuvez les documents des nouveaux membres pour garantir la sécurité de la plateforme.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRejectTarget({ scope: 'bulk', items: itemsFromKeys(selectedKeys) })}
            disabled={!selectedKeys.length}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-red-300 hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <X size={15} />
            Rejeter la sélection {selectedKeys.length > 0 && `(${selectedKeys.length})`}
          </button>

          <button
            onClick={() => setShowFilters((f) => !f)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border transition cursor-pointer ${
              showFilters
                ? 'border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-gray-300'
            }`}
          >
            <Filter size={15} />
            Filters
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-gray-300 transition cursor-pointer"
          >
            <Download size={15} />
            Exporter
          </button>

          <button
            onClick={() => setConfirm({ action: 'approve', scope: 'bulk', items: itemsFromKeys(pendingDossiers.map((d) => d.key)) })}
            disabled={pendingCount === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg bg-[#0984E3] hover:bg-blue-600 active:scale-95 text-white shadow-sm transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check size={15} />
            Tout Approuver
          </button>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl px-4 py-3 shadow-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par dossier, membre, véhicule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-[#0984E3] dark:text-gray-200"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#0984E3]"
          >
            <option value="all">Tous les statuts</option>
            <option value="attente">En attente</option>
            <option value="approuve">Approuvé</option>
            <option value="rejete">Rejeté</option>
          </select>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* ── TABLE ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/30 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="pl-4 pr-2 py-3.5 w-8">
                  <input
                    type="checkbox"
                    className="rounded accent-[#0984E3] cursor-pointer"
                    checked={selectablePending.length > 0 && selectablePending.every((k) => selectedKeys.includes(k))}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedKeys((p) => [...new Set([...p, ...selectablePending])]);
                      else setSelectedKeys((p) => p.filter((k) => !selectablePending.includes(k)));
                    }}
                  />
                </th>
                {['ID Dossier', 'Véhicule', 'Utilisateur', "Date d'envoi", 'Type de Document', 'Statut'].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
                <th className="px-4 py-3.5 w-10" />
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
              {loading && Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan="8" className="px-4 py-4">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </td>
                </tr>
              ))}

              {!loading && paginated.map((d) => {
                const s = STATUS[d.status] ?? STATUS.attente;
                const selected = selectedKeys.includes(d.key);
                return (
                  <tr
                    key={d.key}
                    className={`transition group ${selected ? 'bg-blue-50/60 dark:bg-blue-950/10' : 'hover:bg-gray-50/60 dark:hover:bg-gray-700/10'}`}
                  >
                    <td className="pl-4 pr-2 py-3">
                      <input
                        type="checkbox"
                        className="rounded accent-[#0984E3] cursor-pointer disabled:opacity-30"
                        checked={selected}
                        disabled={d.status !== 'attente'}
                        onChange={() => toggleRow(d.key)}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{d.ref}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200 font-medium whitespace-nowrap">{d.vehicle ?? <span className="text-gray-400 dark:text-gray-500">—</span>}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200 whitespace-nowrap">{d.user}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">{fmtDate(d.date)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${CAT_BADGE[d.category]}`}>
                        {d.doc_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuKey(openMenuKey === d.key ? null : d.key); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {openMenuKey === d.key && (
                        <div ref={menuRef} className="absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-40">
                          <button onClick={() => { setOpenMenuKey(null); openExam(d.id); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                            <Eye size={14} /> Examiner le document
                          </button>
                          {d.status !== 'approuve' && (
                            <button onClick={() => { setOpenMenuKey(null); setConfirm({ action: 'approve', scope: 'single', id: d.id, category: d.category }); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 cursor-pointer">
                              <Check size={14} /> Approuver
                            </button>
                          )}
                          {d.status !== 'rejete' && (
                            <button onClick={() => { setOpenMenuKey(null); setRejectTarget({ scope: 'single', id: d.id, category: d.category }); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer">
                              <X size={14} /> Rejeter
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-16 text-gray-400 dark:text-gray-500">
                    <ShieldCheck size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">Aucun dossier trouvé</p>
                    <p className="text-xs mt-1">Les nouveaux dossiers de vérification apparaîtront ici.</p>
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
              <span className="font-bold text-gray-600 dark:text-gray-300">{totalPages}</span> — {filtered.length} dossiers
            </p>
            <div className="flex items-center gap-1">
              {pageNumbers().map((p, i) =>
                p === '...' ? (
                  <span key={`e-${i}`} className="px-2 text-gray-400 select-none">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`min-w-8 h-8 px-2 flex items-center justify-center text-xs font-semibold rounded-lg transition cursor-pointer ${
                      currentPage === p
                        ? 'bg-[#0984E3] text-white shadow'
                        : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-3 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => { if (!o) setConfirm(null); }}
        onConfirm={handleConfirm}
        title={confirm?.scope === 'bulk' ? 'Approuver les dossiers ?' : 'Approuver ce dossier ?'}
        description="Le membre sera notifié. Une identité validée confirme le profil ; un véhicule validé autorise la publication de trajets."
        confirmLabel="Approuver"
        loadingLabel="Approbation…"
      />

      {/* Rejection modal — admin must pick at least one motif before rejecting. */}
      <RejectReasonDialog
        open={!!rejectTarget}
        onOpenChange={(o) => { if (!o) setRejectTarget(null); }}
        onConfirm={handleReject}
      />
    </div>
  );
}
