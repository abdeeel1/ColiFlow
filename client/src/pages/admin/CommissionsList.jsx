import React, { useState, useEffect } from 'react';
import axiosClient from '../../services/axios';
import {
  Search, Filter, Download, ChevronRight, ChevronLeft,
  BarChart3, Coins, ArrowLeftRight, Hourglass, Percent, Calendar, Receipt,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ── payment status chips (mirror the design) ────────────────────────────────
const STATUS = {
  paye:    { label: 'Payé',       text: 'text-green-600 dark:text-green-400' },
  attente: { label: 'En attente', text: 'text-amber-500 dark:text-amber-400' },
  echoue:  { label: 'Échoué',     text: 'text-red-500 dark:text-red-400' },
};

const METHODS = {
  carte: 'Carte',
  cash:  'Cash',
};

const fmtMad   = (n) => `${Number(n || 0).toLocaleString('fr-FR')} DH`;
const fmtTime  = (d) => (d ? new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—');
const fmtToday = () => new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
const monthLabel = () => {
  const s = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// ── stat card (matches the bordered tiles in the mockup) ────────────────────
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

export default function CommissionsList() {
  const [rows, setRows]       = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFrom, setDateFrom]         = useState('');
  const [dateTo, setDateTo]             = useState('');
  const [showFilters, setShowFilters]   = useState(false);
  const [currentPage, setCurrentPage]   = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    axiosClient.get('/api/admin/finance/commissions')
      .then((r) => { setRows(r.data.commissions ?? []); setStats(r.data.stats ?? null); })
      .catch((e) => setError(e?.response?.data?.message ?? 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, methodFilter, dateFrom, dateTo]);

  // ── filtering / pagination ──────────────────────────────────────────────
  const filtered = rows.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQ = !q ||
      r.ref.toLowerCase().includes(q) ||
      (r.traveler ?? '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || r.methode === methodFilter;
    let matchesDate = true;
    if (dateFrom && r.date && new Date(r.date) < new Date(dateFrom)) matchesDate = false;
    if (dateTo && r.date && new Date(r.date) > new Date(dateTo + 'T23:59:59')) matchesDate = false;
    return matchesQ && matchesStatus && matchesMethod && matchesDate;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated  = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleExport = () => {
    const cols = ['Réf. Colis', 'Voyageur', 'Date', 'Montant Total', 'Part Voyageur', 'Commission', 'Méthode', 'Statut'];
    const data = filtered.map((r) => [
      r.ref, r.traveler, fmtTime(r.date), r.montant_total, r.part_voyageur, r.commission,
      METHODS[r.methode] ?? r.methode, STATUS[r.status]?.label ?? r.status,
    ]);
    const csv = [cols, ...data].map((line) => line.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'commissions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls = 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#0984E3]';
  const triggerCls = 'h-auto py-2 px-3.5 text-sm font-medium rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 shadow-xs cursor-pointer';
  const panelTriggerCls = 'h-auto py-2 px-3 text-sm rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 cursor-pointer';

  return (
    <div className="flex flex-col gap-5">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestion des Commissions</h2>
          <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
            Finances <ChevronRight size={13} /> Commissions <ChevronRight size={13} />
            <span className="text-[#0984E3] font-medium">Rapport Mensuel</span>
          </p>
        </div>
        <p className="text-sm text-gray-400">Historique des Revenus ({monthLabel()})</p>
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
            <StatCard icon={<BarChart3 size={16} className="text-[#0984E3]" />}     label="Volume d'Affaires"      value={fmtMad(stats.volume_affaires)}        accent="#0984E3" />
            <StatCard icon={<Coins size={16} className="text-[#00B894]" />}         label="Revenus ColiFlow (10%)" value={fmtMad(stats.revenus_coliflow)}       accent="#00B894" />
            <StatCard icon={<ArrowLeftRight size={16} className="text-[#6C5CE7]" />} label="Reversements Voyageurs" value={fmtMad(stats.reversements_voyageurs)} accent="#6C5CE7" />
            <StatCard icon={<Hourglass size={16} className="text-[#F39C12]" />}     label="En attente de virement" value={fmtMad(stats.en_attente_virement)}     accent="#F39C12" />
            <StatCard icon={<Percent size={16} className="text-[#E17055]" />}       label="Taux de Commission"     value={`${Number(stats.taux_commission).toFixed(1)}%`} accent="#E17055" />
          </>
        )}
      </div>

      {/* ── TOOLBAR ── */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par #CF, nom de voyageur..."
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className={triggerCls}>
            <SelectValue placeholder="Statut Paiement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Statut Paiement</SelectItem>
            <SelectItem value="paye">Payé</SelectItem>
            <SelectItem value="attente">En attente</SelectItem>
            <SelectItem value="echoue">Échoué</SelectItem>
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
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className={panelTriggerCls}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les méthodes</SelectItem>
              <SelectItem value="carte">Carte</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
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
                {['Réf. Colis', 'Date', 'Montant Total', 'Part Voyageur (90%)', 'Commission (10%)', 'Méthode', 'Statut'].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left font-semibold whitespace-nowrap">{h}</th>
                ))}
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

              {!loading && paginated.map((r) => {
                const s = STATUS[r.status] ?? STATUS.attente;
                return (
                  <tr key={r.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/10 transition">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{r.ref}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{fmtTime(r.date)}</td>
                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">{fmtMad(r.montant_total)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{fmtMad(r.part_voyageur)}</td>
                    <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">+ {fmtMad(r.commission)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{METHODS[r.methode] ?? r.methode}</td>
                    <td className={`px-4 py-3 font-semibold whitespace-nowrap ${s.text}`}>{s.label}</td>
                  </tr>
                );
              })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-gray-400 dark:text-gray-500">
                    <Receipt size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">Aucune transaction trouvée</p>
                    <p className="text-xs mt-1">Ajustez vos filtres pour voir d'autres commissions.</p>
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
              <span className="font-bold text-gray-600 dark:text-gray-300">{totalPages}</span> — {filtered.length} transactions
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
    </div>
  );
}
