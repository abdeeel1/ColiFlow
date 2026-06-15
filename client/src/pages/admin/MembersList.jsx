import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import axiosClient from '../../services/axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Search, Filter, Download, MoreHorizontal, ShieldCheck, ChevronRight,
  UserPlus, Ban, ShieldAlert, Pause, Play, Flag, Trash2, Users, Loader2,
} from 'lucide-react';

// ── status / role config ──────────────────────────────────────────────────────
const STATUS = {
  active:    { label: 'Actif',      dot: 'bg-green-500',  badge: 'bg-green-100 text-green-600 dark:bg-green-950/20 dark:text-green-400' },
  pending:   { label: 'En attente', dot: 'bg-blue-400',   badge: 'bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400' },
  suspended: { label: 'Suspendu',   dot: 'bg-amber-400',  badge: 'bg-amber-100 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' },
  flagged:   { label: 'Signalé',    dot: 'bg-rose-500',   badge: 'bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' },
  banned:    { label: 'Banni',      dot: 'bg-red-500',    badge: 'bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400' },
};

const ROLE_OPTIONS = [
  { value: 'expediteur', label: 'Expéditeur', desc: 'Peut envoyer des colis.' },
  { value: 'voyageur',   label: 'Voyageur',   desc: 'Peut publier des trajets et transporter.' },
  { value: 'mixte',      label: 'Mixte',      desc: 'Peut à la fois envoyer et transporter.' },
  { value: 'admin',      label: 'Admin',      desc: 'Accès complet au back-office.' },
];

const avatarOf = (m) =>
  m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=0984E3&color=fff`;

const fmtScore = (s) => (s == null ? '—' : Number(s).toFixed(1));

export default function MembersList() {
  const currentUserId = useSelector((s) => s.auth.user?.id);
  const [members, setMembers] = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [searchQuery, setSearchQuery]   = useState('');
  const [roleFilter, setRoleFilter]     = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom]         = useState('');
  const [dateTo, setDateTo]             = useState('');
  const [showFilters, setShowFilters]   = useState(false);
  const [selectedIds, setSelectedIds]   = useState([]);
  const [openMenuId, setOpenMenuId]     = useState(null);
  const [currentPage, setCurrentPage]   = useState(1);
  const menuRef = useRef(null);
  const itemsPerPage = 12;

  // dialogs
  const [roleTarget, setRoleTarget]   = useState(null); // member being re-roled
  const [roleValue, setRoleValue]     = useState('expediteur');
  const [addOpen, setAddOpen]         = useState(false);
  const [addForm, setAddForm]         = useState({ first_name: '', last_name: '', email: '', password: '' });
  const [addSaving, setAddSaving]     = useState(false);
  const [roleSaving, setRoleSaving]   = useState(false);
  // null | { type: 'ban' | 'delete', id, name }
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    axiosClient.get('/api/admin/members')
      .then((r) => { setMembers(r.data.members ?? []); setTotal(r.data.total ?? 0); })
      .catch((e) => setError(e?.response?.data?.message ?? 'Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, roleFilter, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const replaceMember = (m) => setMembers((prev) => prev.map((x) => (x.id === m.id ? m : x)));

  // ── actions ─────────────────────────────────────────────────────────────────
  const setStatus = async (id, status) => {
    try {
      const { data } = await axiosClient.patch(`/api/admin/members/${id}/status`, { status });
      replaceMember(data.member);
      toast.success(data.message);
    } catch (e) {
      toast.error(e?.response?.data?.message ?? 'Une erreur est survenue.');
    }
  };

  const saveRole = async () => {
    if (!roleTarget) return;
    setRoleSaving(true);
    try {
      const { data } = await axiosClient.patch(`/api/admin/members/${roleTarget.id}/role`, { role: roleValue });
      replaceMember(data.member);
      toast.success(data.message);
      setRoleTarget(null);
    } catch (e) {
      toast.error(e?.response?.data?.message ?? 'Une erreur est survenue.');
    } finally {
      setRoleSaving(false);
    }
  };

  const removeMember = async (id) => {
    try {
      await axiosClient.delete(`/api/admin/members/${id}`);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setSelectedIds((prev) => prev.filter((x) => x !== id));
      setTotal((t) => Math.max(0, t - 1));
      toast.success('Membre supprimé.');
    } catch (e) {
      toast.error(e?.response?.data?.message ?? 'Une erreur est survenue.');
    }
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    if (confirm.type === 'ban') await setStatus(confirm.id, 'banned');
    else if (confirm.type === 'delete') await removeMember(confirm.id);
    setConfirm(null);
  };

  const addAdmin = async (e) => {
    e.preventDefault();
    setAddSaving(true);
    try {
      const { data } = await axiosClient.post('/api/admin/members', addForm);
      setMembers((prev) => [data.member, ...prev]);
      setTotal((t) => t + 1);
      toast.success(data.message);
      setAddOpen(false);
      setAddForm({ first_name: '', last_name: '', email: '', password: '' });
    } catch (err) {
      const errs = err.response?.data?.errors;
      toast.error(errs ? Object.values(errs)[0][0] : err.response?.data?.message ?? 'Erreur lors de la création.');
    } finally {
      setAddSaving(false);
    }
  };

  const handleExport = () => {
    const cols = ['ID Membre', 'Utilisateur', 'Email', 'Rôle', 'Ville', 'Score', 'Statut'];
    const rows = filtered.map((m) => [
      m.ref, m.name, m.email, m.role_label, m.city ?? '', fmtScore(m.score), STATUS[m.status]?.label ?? m.status,
    ]);
    const csv = [cols, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'membres.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── filtering / pagination ──────────────────────────────────────────────────
  const filtered = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQ = !q ||
      m.name.toLowerCase().includes(q) ||
      m.ref.toLowerCase().includes(q) ||
      (m.email ?? '').toLowerCase().includes(q) ||
      (m.city ?? '').toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    let matchesDate = true;
    if (dateFrom && new Date(m.created_at) < new Date(dateFrom)) matchesDate = false;
    if (dateTo && new Date(m.created_at) > new Date(dateTo + 'T23:59:59')) matchesDate = false;
    return matchesQ && matchesRole && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
  const selectableIds = paginated.filter((m) => m.role !== 'admin').map((m) => m.id);

  const pageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const toggleRow = (id) => setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const bulkBan = async () => {
    if (!selectedIds.length) return;
    await Promise.all(selectedIds.map((id) => setStatus(id, 'banned')));
    setSelectedIds([]);
  };

  const inputCls = 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#0984E3]';

  return (
    <div className="flex flex-col gap-5">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Gestion des Membres</h2>
            <span className="bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
              +{total}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            Gérez les comptes utilisateurs, modérez les profils et surveillez l'activité de la communauté ColiFlow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={bulkBan}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-red-300 hover:text-red-500 transition cursor-pointer"
            >
              <Ban size={15} /> Bannir ({selectedIds.length})
            </button>
          )}
          <button
            onClick={() => setShowFilters((f) => !f)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border transition cursor-pointer ${
              showFilters
                ? 'border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-gray-300'
            }`}
          >
            <Filter size={15} /> Filters
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-gray-300 transition cursor-pointer"
          >
            <Download size={15} /> Exporter
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg bg-[#0984E3] hover:bg-blue-600 active:scale-95 text-white shadow-sm transition cursor-pointer"
          >
            <UserPlus size={15} /> Ajouter un Admin
          </button>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      {showFilters && (
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl px-4 py-3 shadow-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un membre, email ou ville..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 pr-4 py-2 w-full ${inputCls}`}
            />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={inputCls}>
            <option value="all">Tous les rôles</option>
            <option value="expediteur">Expéditeur</option>
            <option value="voyageur">Voyageur</option>
            <option value="mixte">Mixte</option>
            <option value="admin">Admin</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputCls}>
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="suspended">Suspendu</option>
            <option value="banned">Banni</option>
            <option value="flagged">Signalé</option>
            <option value="pending">En attente</option>
          </select>
          <div className="flex items-center gap-2">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputCls} />
            <span className="text-gray-400 text-sm">→</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputCls} />
          </div>
        </div>
      )}

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
                    checked={selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id))}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds((p) => [...new Set([...p, ...selectableIds])]);
                      else setSelectedIds((p) => p.filter((id) => !selectableIds.includes(id)));
                    }}
                  />
                </th>
                {['ID Membre', 'Utilisateur', 'Rôle', 'Ville', 'Score', 'État du Trajet'].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
                <th className="px-4 py-3.5 w-10" />
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
              {loading && Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan="8" className="px-4 py-4">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </td>
                </tr>
              ))}

              {!loading && paginated.map((m) => {
                const s = STATUS[m.status] ?? STATUS.active;
                const selected = selectedIds.includes(m.id);
                const isAdmin = m.role === 'admin';
                const isSelf = m.id === currentUserId;
                return (
                  <tr
                    key={m.id}
                    className={`transition group ${selected ? 'bg-blue-50/60 dark:bg-blue-950/10' : 'hover:bg-gray-50/60 dark:hover:bg-gray-700/10'}`}
                  >
                    <td className="pl-4 pr-2 py-3">
                      <input
                        type="checkbox"
                        className="rounded accent-[#0984E3] cursor-pointer disabled:opacity-30"
                        checked={selected}
                        disabled={isAdmin}
                        onChange={() => toggleRow(m.id)}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{m.ref}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={avatarOf(m)} alt={m.name} className="w-8 h-8 rounded-full object-cover" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 dark:text-gray-100 truncate">{m.name}</p>
                          <p className="text-xs text-gray-400 truncate">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{m.role_label}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{m.city ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">{fmtScore(m.score)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 relative">
                      {isSelf ? (
                        <span className="inline-block text-[11px] font-semibold text-gray-300 dark:text-gray-600 px-2 whitespace-nowrap">Vous</span>
                      ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === m.id ? null : m.id); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      )}
                      {!isSelf && openMenuId === m.id && (
                        <div ref={menuRef} className="absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-44">
                          <button
                            onClick={() => { setOpenMenuId(null); setRoleTarget(m); setRoleValue(m.role === 'admin' ? 'admin' : m.role); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                          >
                            <ShieldCheck size={14} /> Changer le rôle
                          </button>

                          {!isAdmin && m.status !== 'suspended' && (
                            <button
                              onClick={() => { setOpenMenuId(null); setStatus(m.id, 'suspended'); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 cursor-pointer"
                            >
                              <Pause size={14} /> Suspendre
                            </button>
                          )}
                          {!isAdmin && m.status !== 'flagged' && m.status !== 'banned' && (
                            <button
                              onClick={() => { setOpenMenuId(null); setStatus(m.id, 'flagged'); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                            >
                              <Flag size={14} /> Signaler
                            </button>
                          )}
                          {!isAdmin && m.status !== 'active' && (
                            <button
                              onClick={() => { setOpenMenuId(null); setStatus(m.id, 'active'); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 cursor-pointer"
                            >
                              <Play size={14} /> Réactiver
                            </button>
                          )}
                          {!isAdmin && m.status !== 'banned' && (
                            <button
                              onClick={() => { setOpenMenuId(null); setConfirm({ type: 'ban', id: m.id, name: m.name }); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                            >
                              <Ban size={14} /> Bannir
                            </button>
                          )}
                          <button
                            onClick={() => { setOpenMenuId(null); setConfirm({ type: 'delete', id: m.id, name: m.name }); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer border-t border-gray-100 dark:border-gray-700/60 mt-1 pt-2"
                          >
                            <Trash2 size={14} /> Supprimer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-16 text-gray-400 dark:text-gray-500">
                    <Users size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">Aucun membre trouvé</p>
                    <p className="text-xs mt-1">Ajustez vos filtres ou ajoutez un nouveau membre.</p>
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
              <span className="font-bold text-gray-600 dark:text-gray-300">{totalPages}</span> — {filtered.length} membres
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

      {/* ── ROLE DIALOG ── */}
      <Dialog open={!!roleTarget} onOpenChange={(o) => { if (!o && !roleSaving) setRoleTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-800 dark:text-gray-100">Changer le rôle</DialogTitle>
            <DialogDescription>
              Définissez le rôle de {roleTarget?.name} sur la plateforme.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {ROLE_OPTIONS.map((opt) => {
              const active = roleValue === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    active ? 'border-[#0984E3] bg-blue-50/60 dark:bg-blue-950/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    className="mt-0.5 accent-[#0984E3] cursor-pointer"
                    checked={active}
                    onChange={() => setRoleValue(opt.value)}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{opt.label}</p>
                    <p className="text-xs text-gray-400">{opt.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>
          <DialogFooter className="mt-2">
            <button
              type="button"
              onClick={() => setRoleTarget(null)}
              disabled={roleSaving}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={saveRole}
              disabled={roleSaving}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-[#0984E3] hover:bg-blue-600 active:scale-95 text-white shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {roleSaving ? (<><Loader2 size={16} className="animate-spin" />Enregistrement…</>) : 'Enregistrer'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ADD ADMIN DIALOG ── */}
      <Dialog open={addOpen} onOpenChange={(o) => { if (!addSaving) setAddOpen(o); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <ShieldAlert size={18} className="text-[#0984E3]" /> Ajouter un Administrateur
            </DialogTitle>
            <DialogDescription>
              Le nouvel administrateur aura un accès complet au back-office.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={addAdmin} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Prénom</label>
                <input className={`w-full ${inputCls}`} value={addForm.first_name} onChange={(e) => setAddForm((f) => ({ ...f, first_name: e.target.value }))} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Nom</label>
                <input className={`w-full ${inputCls}`} value={addForm.last_name} onChange={(e) => setAddForm((f) => ({ ...f, last_name: e.target.value }))} required />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Email</label>
              <input type="email" className={`w-full ${inputCls}`} value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Mot de passe</label>
              <input type="password" minLength={8} className={`w-full ${inputCls}`} value={addForm.password} onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))} required />
            </div>
            <DialogFooter className="mt-2">
              <button type="button" onClick={() => setAddOpen(false)} disabled={addSaving} className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 transition cursor-pointer">
                Annuler
              </button>
              <button type="submit" disabled={addSaving} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-[#0984E3] hover:bg-blue-600 active:scale-95 text-white shadow-sm transition cursor-pointer disabled:opacity-50">
                {addSaving ? (<><Loader2 size={16} className="animate-spin" />Création…</>) : 'Ajouter l\'admin'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── BAN / DELETE CONFIRM ── */}
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => { if (!o) setConfirm(null); }}
        onConfirm={handleConfirm}
        title={confirm?.type === 'delete' ? 'Supprimer ce membre ?' : 'Bannir ce membre ?'}
        description={
          confirm?.type === 'delete'
            ? `Cette action est irréversible. Le compte de ${confirm?.name} et ses données seront supprimés.`
            : `${confirm?.name} sera banni et ne pourra plus se connecter à ColiFlow.`
        }
        confirmLabel={confirm?.type === 'delete' ? 'Supprimer' : 'Bannir'}
        loadingLabel={confirm?.type === 'delete' ? 'Suppression…' : 'Bannissement…'}
      />
    </div>
  );
}
