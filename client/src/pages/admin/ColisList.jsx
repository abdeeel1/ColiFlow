import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import axiosClient from '../../services/axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Search, Filter, Download, MoreHorizontal, ChevronRight, ChevronLeft,
  Package, Truck, PackageSearch, AlertTriangle, ShieldCheck, Calendar,
  Pencil, Trash2, Loader2,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ── status chips (mirror the design) ────────────────────────────────────────
const STATUS = {
  en_transit: { label: 'En transit', badge: 'bg-green-100 text-green-600 dark:bg-green-950/20 dark:text-green-400' },
  livre:      { label: 'Livré',      badge: 'bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400' },
  ramassage:  { label: 'Ramassage',  badge: 'bg-amber-100 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400' },
  en_attente: { label: 'En attente', badge: 'bg-gray-100 text-gray-500 dark:bg-gray-700/40 dark:text-gray-300' },
};

const CATEGORIES = [
  { value: 'all',          label: "Type d'objet" },
  { value: 'electronique', label: 'Électronique' },
  { value: 'documents',    label: 'Documents' },
  { value: 'mode',         label: 'Mode' },
  { value: 'maison',       label: 'Maison' },
  { value: 'autre',        label: 'Autre' },
];

// editable category list (without the "all" pseudo-option)
const EDIT_CATEGORIES = CATEGORIES.filter((c) => c.value !== 'all');

const URGENCIES = [
  { value: 'standard',   label: 'Standard' },
  { value: 'urgent',     label: 'Urgent' },
  { value: 'très_urgent', label: 'Très urgent' },
];

const fmtNumber = (n) => Number(n || 0).toLocaleString('fr-FR');
const fmtMad    = (n) => `${Number(n || 0).toLocaleString('fr-FR')} DH`;
const fmtToday  = () => new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
const avatarOf  = (name, url) => url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0984E3&color=fff`;

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

export default function ColisList() {
  const [packages, setPackages] = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [searchQuery, setSearchQuery]   = useState('');
  const [catFilter, setCatFilter]       = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom]         = useState('');
  const [dateTo, setDateTo]             = useState('');
  const [showFilters, setShowFilters]   = useState(false);
  const [openMenuId, setOpenMenuId]     = useState(null);
  const [currentPage, setCurrentPage]   = useState(1);
  const menuRef = useRef(null);
  const itemsPerPage = 10;

  // edit / delete
  const [cities, setCities]         = useState([]);
  const [editTarget, setEditTarget] = useState(null); // package row being edited
  const [editForm, setEditForm]     = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // package row to delete

  useEffect(() => {
    setLoading(true);
    axiosClient.get('/api/admin/logistics/packages')
      .then((r) => { setPackages(r.data.packages ?? []); setStats(r.data.stats ?? null); })
      .catch((e) => setError(e?.response?.data?.message ?? 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    axiosClient.get('/api/cities').then((r) => setCities(r.data ?? [])).catch(() => {});
  }, []);

  // ── edit / delete actions ────────────────────────────────────────────────
  const openEdit = (p) => {
    setOpenMenuId(null);
    setEditTarget(p);
    setEditForm({
      package_name: p.object ?? '',
      category:     p.category ?? 'autre',
      urgency:      p.urgency ?? 'standard',
      package_size: p.weight ?? '',
      price:        p.price ?? '',
      from_city_id: String(p.from_city_id ?? ''),
      to_city_id:   String(p.to_city_id ?? ''),
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;
    if (editForm.from_city_id === editForm.to_city_id) {
      toast.error('Les villes de départ et de destination doivent être différentes.');
      return;
    }
    setEditSaving(true);
    try {
      const { data } = await axiosClient.patch(`/api/admin/logistics/packages/${editTarget.id}`, {
        package_name: editForm.package_name,
        category:     editForm.category,
        urgency:      editForm.urgency,
        package_size: Number(editForm.package_size),
        price:        Number(editForm.price),
        from_city_id: Number(editForm.from_city_id),
        to_city_id:   Number(editForm.to_city_id),
      });
      setPackages((prev) => prev.map((x) => (x.id === data.package.id ? data.package : x)));
      toast.success(data.message);
      setEditTarget(null);
    } catch (err) {
      const errs = err.response?.data?.errors;
      toast.error(errs ? Object.values(errs)[0][0] : err.response?.data?.message ?? 'Erreur lors de la mise à jour.');
    } finally {
      setEditSaving(false);
    }
  };

  const deletePackage = async () => {
    if (!confirmTarget) return;
    try {
      await axiosClient.delete(`/api/admin/logistics/packages/${confirmTarget.id}`);
      setPackages((prev) => prev.filter((x) => x.id !== confirmTarget.id));
      toast.success('Colis supprimé.');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Erreur lors de la suppression.');
    } finally {
      setConfirmTarget(null);
    }
  };

  useEffect(() => { setCurrentPage(1); }, [searchQuery, catFilter, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── filtering / pagination ──────────────────────────────────────────────
  const filtered = packages.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQ = !q ||
      p.ref.toLowerCase().includes(q) ||
      p.sender.toLowerCase().includes(q) ||
      (p.object ?? '').toLowerCase().includes(q) ||
      p.destination.toLowerCase().includes(q);
    const matchesCat    = catFilter === 'all' || p.category === catFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    let matchesDate = true;
    if (dateFrom && p.created_at && new Date(p.created_at) < new Date(dateFrom)) matchesDate = false;
    if (dateTo && p.created_at && new Date(p.created_at) > new Date(dateTo + 'T23:59:59')) matchesDate = false;
    return matchesQ && matchesCat && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated  = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleExport = () => {
    const cols = ['Réf', 'Expéditeur', 'Objet', 'Poids', 'Statut', 'Destination', 'Valeur (DH)'];
    const rows = filtered.map((p) => [
      p.ref, p.sender, p.object, p.weight_label, STATUS[p.status]?.label ?? p.status, p.destination, p.price,
    ]);
    const csv = [cols, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'colis.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls = 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#0984E3]';
  const triggerCls = 'h-auto py-2 px-3.5 text-sm font-medium rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 shadow-xs cursor-pointer';
  const panelTriggerCls = 'h-auto py-2 px-3 text-sm rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 cursor-pointer';

  return (
    <div className="flex flex-col gap-5">

      {/* ── HEADER ── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Suivi des Livraisons</h2>
        <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
          Gestion <ChevronRight size={13} /> Colis <ChevronRight size={13} />
          <span className="text-[#0984E3] font-medium">Expéditions Actives</span>
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
            <StatCard icon={<Package size={16} className="text-[#0984E3]" />}        label="Colis Totaux"   value={fmtNumber(stats.colis_totaux)}  accent="#0984E3" />
            <StatCard icon={<Truck size={16} className="text-[#00B894]" />}          label="En Transit"     value={fmtNumber(stats.en_transit)}    accent="#00B894" />
            <StatCard icon={<PackageSearch size={16} className="text-[#F39C12]" />}  label="À Ramasser"     value={fmtNumber(stats.a_ramasser)}    accent="#F39C12" />
            <StatCard icon={<AlertTriangle size={16} className="text-[#E17055]" />}  label="Litiges Colis"  value={fmtNumber(stats.litiges)}       accent="#E17055" />
            <StatCard icon={<ShieldCheck size={16} className="text-[#6C5CE7]" />}    label="Valeur Assurée" value={fmtMad(stats.valeur_assuree)}   accent="#6C5CE7" />
          </>
        )}
      </div>

      {/* ── TOOLBAR ── */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un numéro de suivi (#CF), un objet ou un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-9 pr-4 py-2 w-full ${inputCls}`}
          />
        </div>
        <button
          onClick={() => setShowFilters((f) => !f)}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border transition cursor-pointer ${
            showFilters
              ? 'border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-gray-300'
          }`}
        >
          <Filter size={15} /> Filter
        </button>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className={triggerCls}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 whitespace-nowrap">
          <Calendar size={15} className="text-gray-400" /> {fmtToday()}
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-gray-300 transition cursor-pointer"
        >
          <Download size={15} /> Export
        </button>
      </div>

      {/* ── FILTER PANEL ── */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl px-4 py-3 shadow-xs">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className={panelTriggerCls}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="en_transit">En transit</SelectItem>
              <SelectItem value="ramassage">Ramassage</SelectItem>
              <SelectItem value="livre">Livré</SelectItem>
              <SelectItem value="en_attente">En attente</SelectItem>
            </SelectContent>
          </Select>
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
            <thead className="bg-blue-50/60 dark:bg-gray-700/30 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <tr>
                {['Réf. Colis', 'Expéditeur', 'Objet (Contenu)', 'Poids', 'Status', 'Destination'].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
                <th className="px-4 py-3.5 text-left font-semibold w-20">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
              {loading && Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan="7" className="px-4 py-4">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </td>
                </tr>
              ))}

              {!loading && paginated.map((p) => {
                const s = STATUS[p.status] ?? STATUS.en_attente;
                return (
                  <tr key={p.id} className="group hover:bg-gray-50/60 dark:hover:bg-gray-700/10 transition">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{p.ref}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={avatarOf(p.sender, p.avatar)} alt={p.sender} className="w-8 h-8 rounded-full object-cover" />
                          <span className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full bg-[#0984E3] border-2 border-white dark:border-gray-800" />
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{p.sender}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{p.object}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{p.weight_label}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${s.badge}`}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{p.destination}</td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === p.id ? null : p.id); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {openMenuId === p.id && (
                        <div ref={menuRef} className="absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-48">
                          <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100 dark:border-gray-700/60">{p.ref} · {fmtMad(p.price)} assurés</div>
                          <button
                            onClick={() => openEdit(p)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                          >
                            <Pencil size={14} className="text-gray-400" /> Modifier le colis
                          </button>
                          <button
                            onClick={() => { setOpenMenuId(null); setConfirmTarget(p); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer border-t border-gray-100 dark:border-gray-700/60 mt-1 pt-2"
                          >
                            <Trash2 size={14} /> Supprimer le colis
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-gray-400 dark:text-gray-500">
                    <Package size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">Aucun colis trouvé</p>
                    <p className="text-xs mt-1">Ajustez vos filtres pour voir d'autres expéditions.</p>
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
              <span className="font-bold text-gray-600 dark:text-gray-300">{totalPages}</span> — {filtered.length} colis
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

      {/* ── EDIT DIALOG ── */}
      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o && !editSaving) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Pencil size={18} className="text-[#0984E3]" /> Modifier le colis
            </DialogTitle>
            <DialogDescription>
              {editTarget?.ref} — {editTarget?.sender}
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <form onSubmit={saveEdit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Objet (contenu)</label>
                <input
                  className={`w-full ${inputCls}`}
                  value={editForm.package_name}
                  onChange={(e) => setEditForm((f) => ({ ...f, package_name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Catégorie</label>
                  <select
                    className={`w-full ${inputCls}`}
                    value={editForm.category}
                    onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {EDIT_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Urgence</label>
                  <select
                    className={`w-full ${inputCls}`}
                    value={editForm.urgency}
                    onChange={(e) => setEditForm((f) => ({ ...f, urgency: e.target.value }))}
                  >
                    {URGENCIES.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Poids (kg)</label>
                  <input
                    type="number" min="1"
                    className={`w-full ${inputCls}`}
                    value={editForm.package_size}
                    onChange={(e) => setEditForm((f) => ({ ...f, package_size: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Valeur / Prix (MAD)</label>
                  <input
                    type="number" min="1"
                    className={`w-full ${inputCls}`}
                    value={editForm.price}
                    onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Ville de départ</label>
                  <select
                    className={`w-full ${inputCls}`}
                    value={editForm.from_city_id}
                    onChange={(e) => setEditForm((f) => ({ ...f, from_city_id: e.target.value }))}
                    required
                  >
                    <option value="" disabled>Sélectionner…</option>
                    {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Destination</label>
                  <select
                    className={`w-full ${inputCls}`}
                    value={editForm.to_city_id}
                    onChange={(e) => setEditForm((f) => ({ ...f, to_city_id: e.target.value }))}
                    required
                  >
                    <option value="" disabled>Sélectionner…</option>
                    {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <DialogFooter className="mt-2">
                <button type="button" onClick={() => setEditTarget(null)} disabled={editSaving} className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 transition cursor-pointer">
                  Annuler
                </button>
                <button type="submit" disabled={editSaving} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-[#0984E3] hover:bg-blue-600 active:scale-95 text-white shadow-sm transition cursor-pointer disabled:opacity-50">
                  {editSaving ? (<><Loader2 size={16} className="animate-spin" />Enregistrement…</>) : 'Enregistrer'}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRM ── */}
      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(o) => { if (!o) setConfirmTarget(null); }}
        onConfirm={deletePackage}
        title="Supprimer ce colis ?"
        description={`Le colis ${confirmTarget?.ref ?? ''} (${confirmTarget?.object ?? ''}) et ses demandes associées seront définitivement supprimés.`}
        confirmLabel="Supprimer"
        loadingLabel="Suppression…"
      />
    </div>
  );
}
