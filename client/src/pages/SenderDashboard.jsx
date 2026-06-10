import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import axiosClient from '../services/axios';
import ConfirmDialog from '../components/ConfirmDialog';
import DeliveryLineChart from '@/charts/DeliverLineChart';
import WeeklyBarChart from '@/charts/Weeklybarchart ';
import { 
  Package, Plus, ChevronLeft, ChevronRight,
  MapPin, Calendar, Clock, DollarSign,
  ArrowRight, Search, Trash2, Shield, Star,
  Download, Filter, MoreHorizontal, ArrowUpDown, CheckSquare, Eye
} from 'lucide-react';

// ── helpers ───────────────────────────────────────────────────────
// A package is "in transit" only once a traveler has accepted to carry it,
// not based on its urgency level.
const isInTransit = (pkg) => (pkg.travel_requests?.length ?? 0) > 0;

const statusOf = (pkg) =>
  isInTransit(pkg)
    ? { label: 'En transit',  dot: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400' }
    : { label: 'En attente',  dot: 'bg-orange-400', badge: 'bg-orange-100 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400' };

const PAGE_HEADER = {
  apercu:     { title: 'Tableau de Bord Expéditeur', subtitle: 'Gérez vos expéditions, suivez vos colis et consultez vos statistiques.' },
  expedition: { title: 'Mes Colis',                  subtitle: 'Gérez et visualisez l\'état de tous vos envois ColiFlow.' },
  suivi:      { title: 'Suivi en direct',            subtitle: 'Suivez en temps réel les colis actuellement pris en charge par un voyageur.' },
};

const CAT_LABEL = {
  electronique: 'Électronique', documents: 'Documents',
  mode: 'Mode', maison: 'Maison', autre: 'Autre',
};

// ── stat card ────────────────────────────────────────────────────
function StatCard({ icon, label, value, barColor }) {
  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-3 bg-white dark:bg-gray-800 shadow-xs rounded-xl p-5 transition-transform hover:-translate-y-0.5 duration-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: barColor + '20' }}>
          {icon}
        </div>
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">{label}</span>
      </div>
      <div className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">{value}</div>
      <div className="h-1 rounded-full bg-gray-100 dark:bg-gray-700">
        <div className="h-1 rounded-full w-3/5" style={{ background: barColor }} />
      </div>
    </div>
  );
}

// ── skeletons ────────────────────────────────────────────────────
const Shimmer = ({ className = '' }) => (
  <div className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`} />
);

const SkelCard = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-xs rounded-xl ${className}`}>{children}</div>
);

// Mirrors the "Aperçu" layout: chart card + 4 stat tiles + line chart + table on
// the left, payment / tracking / badges widgets on the right.
function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* LEFT column */}
      <div className="col-span-full lg:col-span-8 flex flex-col gap-6">

        {/* Transit chart card */}
        <SkelCard className="p-5">
          <Shimmer className="h-3 w-32 mb-4" />
          <Shimmer className="h-12 w-24 mb-3" />
          <Shimmer className="h-3 w-48 mb-6" />
          <div className="flex items-end gap-2 h-24">
            {[55, 80, 40, 95, 65, 75, 50, 90, 60, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t animate-pulse" style={{ height: `${h}%` }} />
            ))}
          </div>
        </SkelCard>

        {/* Stat tiles */}
        <div className="grid grid-cols-12 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkelCard key={i} className="col-span-full sm:col-span-6 xl:col-span-3 p-5">
              <div className="flex items-center gap-3 mb-3">
                <Shimmer className="w-9 h-9 rounded-full" />
                <Shimmer className="h-3 w-16" />
              </div>
              <Shimmer className="h-7 w-20 mb-3" />
              <Shimmer className="h-1 w-full rounded-full" />
            </SkelCard>
          ))}
        </div>

        {/* Line chart card */}
        <SkelCard className="p-5">
          <div className="flex justify-between mb-4">
            <Shimmer className="h-5 w-56" />
            <Shimmer className="h-4 w-16" />
          </div>
          <Shimmer className="h-48 w-full rounded-lg" />
        </SkelCard>

        {/* Recent table card */}
        <SkelCard className="overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
            <Shimmer className="h-4 w-40" />
            <Shimmer className="h-4 w-16" />
          </div>
          <div className="p-4 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Shimmer className="h-4 w-32" />
                <Shimmer className="h-4 w-24" />
                <Shimmer className="h-4 w-20" />
                <Shimmer className="h-4 w-14" />
                <Shimmer className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </SkelCard>
      </div>

      {/* RIGHT column */}
      <div className="col-span-full lg:col-span-4 flex flex-col gap-6">
        {/* Payment card */}
        <SkelCard className="p-5">
          <Shimmer className="h-3 w-36 mb-3" />
          <Shimmer className="h-9 w-28 mb-2" />
          <Shimmer className="h-3 w-40 mb-5" />
          <Shimmer className="h-10 w-full rounded-xl" />
        </SkelCard>

        {/* Tracking list */}
        <SkelCard className="p-5">
          <Shimmer className="h-3 w-40 mb-4" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Shimmer className="w-9 h-9 rounded-full shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <Shimmer className="h-3 w-3/4" />
                  <Shimmer className="h-2.5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </SkelCard>

        {/* Badges */}
        <SkelCard className="p-5">
          <Shimmer className="h-3 w-32 mb-4" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Shimmer className="w-9 h-9 rounded-full shrink-0" />
                <Shimmer className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </SkelCard>
      </div>
    </div>
  );
}

// Mirrors the "Mes Colis / Suivi" table view.
function TableSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      {/* Header + actions */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Shimmer className="h-6 w-64" />
          <Shimmer className="h-3 w-80" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Shimmer key={i} className="h-9 w-28 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Table */}
      <SkelCard className="border border-gray-100 dark:border-gray-700/60 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700/30 px-4 py-3.5">
          <Shimmer className="h-3 w-full max-w-3xl" />
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700/40">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4">
              <Shimmer className="w-4 h-4 rounded shrink-0" />
              <Shimmer className="h-4 w-20" />
              <Shimmer className="h-4 w-32" />
              <Shimmer className="h-4 w-24" />
              <Shimmer className="h-4 w-16 ml-auto" />
              <Shimmer className="h-5 w-20 rounded-full" />
              <Shimmer className="h-4 w-12" />
            </div>
          ))}
        </div>
      </SkelCard>
    </div>
  );
}

// ── main ─────────────────────────────────────────────────────────
export default function SenderDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'apercu';

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Filters & search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [selectedRows, setSelectedRows] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  // null | { type: 'single', id } | { type: 'bulk' }
  const [confirmDelete, setConfirmDelete] = useState(null);
  const menuRef = useRef(null);
  const itemsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    axiosClient.get('/api/packages')
      .then((r) => setData(r.data))
      .catch((e) => setError(e?.response?.data?.message ?? 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, urgencyFilter, activeTab]);

  const packages      = data?.packages      ?? [];
  const weeklyData    = data?.weekly_counts ?? Array(10).fill(0);
  const deliveryTimes = data?.delivery_times?.length ? data.delivery_times : Array(14).fill(0);
  const byCategory    = data?.by_category   ?? {};

  const inTransit  = packages.filter(isInTransit).length;
  const thisWeek   = data?.this_week   ?? 0;
  const totalSent  = data?.total       ?? 0;
  const totalSpent = data?.total_spent ?? 0;

  const pendingPayment = packages
    .filter(isInTransit)
    .reduce((s, p) => s + Number(p.price || 0), 0);

  const recentPkgs = packages.slice(0, 3);

  const badges = [
    ...(totalSent >= 1 ? [{ icon: '🌟', label: 'Super Expéditeur' }] : []),
    ...(totalSent >= 5 ? [{ icon: '📦', label: `${totalSent} Colis Envoyés` }] : []),
    ...(totalSent >= 1 ? [{ icon: '🛡️', label: 'Fiable' }] : []),
  ];

  const performDeletePackage = async (id) => {
    try {
      await axiosClient.delete(`/api/packages/${id}`);
      const res = await axiosClient.get('/api/packages');
      setData(res.data);
      setSelectedRows(prev => prev.filter(r => r !== id));
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression du colis.');
    }
  };

  const performBulkDelete = async () => {
    if (!selectedRows.length) return;
    try {
      await Promise.all(selectedRows.map(id => axiosClient.delete(`/api/packages/${id}`)));
      const res = await axiosClient.get('/api/packages');
      setData(res.data);
      setSelectedRows([]);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression.');
    }
  };

  // Run the delete the user confirmed in the AlertDialog, then close it.
  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'bulk') await performBulkDelete();
    else await performDeletePackage(confirmDelete.id);
    setConfirmDelete(null);
  };

  const handleExport = () => {
    const cols = ['ID', 'Nom du colis', 'Trajet', 'Date d\'envoi', 'Poids (kg)', 'Urgence', 'Statut', 'Prix (DH)'];
    const rows = filteredPackages.map(pkg => [
      `#CF-${String(pkg.id).padStart(3, '0')}`,
      pkg.package_name,
      `${pkg.from_city?.name ?? ''} -> ${pkg.to_city?.name ?? ''}`,
      new Date(pkg.created_at).toLocaleDateString('fr-FR'),
      `${pkg.package_size} kg`,
      pkg.urgency?.replace('_', ' ') ?? '',
      statusOf(pkg).label,
      pkg.price,
    ]);
    const csv = [cols, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'mes-colis.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const toggleRow = (id) => setSelectedRows(prev =>
    prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
  );

  // Filter and paginated packages based on activeTab (expedition or suivi)
  const basePackages = activeTab === 'suivi'
    ? packages.filter(isInTransit)
    : packages;

  const filteredPackages = basePackages.filter((pkg) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = 
      pkg.package_name.toLowerCase().includes(query) ||
      String(pkg.id).includes(query) ||
      (pkg.from_city?.name || '').toLowerCase().includes(query) ||
      (pkg.to_city?.name || '').toLowerCase().includes(query);
    const matchesUrgency = urgencyFilter === 'all' || pkg.urgency === urgencyFilter;
    return matchesQuery && matchesUrgency;
  });

  // Sorting
  const sortedPackages = [...filteredPackages].sort((a, b) => {
    if (!sortField) return 0;
    let aVal, bVal;
    if (sortField === 'id')         { aVal = a.id; bVal = b.id; }
    else if (sortField === 'price') { aVal = Number(a.price); bVal = Number(b.price); }
    else if (sortField === 'package_size') { aVal = Number(a.package_size); bVal = Number(b.package_size); }
    else if (sortField === 'created_at')  { aVal = new Date(a.created_at); bVal = new Date(b.created_at); }
    else if (sortField === 'trajet') { aVal = a.from_city?.name ?? ''; bVal = b.from_city?.name ?? ''; }
    else if (sortField === 'urgency') { aVal = a.urgency ?? ''; bVal = b.urgency ?? ''; }
    if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const totalPages = Math.ceil(sortedPackages.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPackages = sortedPackages.slice(startIndex, startIndex + itemsPerPage);

  // Numbered pages helper
  const pageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

            {/* Title */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-1">
                  {(PAGE_HEADER[activeTab] ?? PAGE_HEADER.apercu).title}
                </h1>
                <p className="text-sm text-gray-500">{(PAGE_HEADER[activeTab] ?? PAGE_HEADER.apercu).subtitle}</p>
              </div>
              {activeTab === 'apercu' && (
                <button
                  onClick={() => navigate('/packages/create')}
                  className="flex items-center gap-2 bg-[#0984E3] hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition mt-4 sm:mt-0 active:scale-95 shadow-sm cursor-pointer"
                >
                  <Plus size={16} />
                  Nouveau colis
                </button>
              )}
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">
                {error}
              </div>
            )}

            {/* Skeleton Loading State */}
            {loading && (
              activeTab === 'apercu'
                ? <DashboardSkeleton />
                : <TableSkeleton />
            )}

            {/* Content view when fully loaded */}
            {!loading && !error && (
              <div>
                {/* ── APERCU TAB ──────────────────────────────────────────────── */}
                {activeTab === 'apercu' && (
                  <div className="grid grid-cols-12 gap-6">
                    {/* LEFT Column */}
                    <div className="col-span-full lg:col-span-8 flex flex-col gap-6">

                      {/* Colis en transit - Chart Card */}
                      <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xs rounded-xl overflow-hidden">
                        <div className="px-5 pt-5 pb-2">
                          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3">
                            Colis en transit
                          </h2>
                          <div className="flex items-start gap-6">
                            <div className="flex flex-col gap-2 min-w-[160px]">
                              <div className="text-5xl font-bold text-[#0984E3]">
                                {String(inTransit).padStart(2, '0')}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Clock size={16} className="text-blue-400 shrink-0" />
                                Livraisons cette semaine
                                <span className="font-bold text-gray-700 dark:text-gray-200 ml-1">{thisWeek}</span>
                              </div>
                              <Link to="/packages/create" className="text-sm text-[#0984E3] hover:underline font-medium mt-2">
                                Ajouter un nouveau colis →
                              </Link>
                            </div>
                          </div>
                        </div>
                        {/* Bar chart */}
                        <div className="grow">
                          <WeeklyBarChart data={weeklyData} width={600} height={148} />
                        </div>
                      </div>

                      {/* Stat Cards Tiles */}
                      <div className="grid grid-cols-12 gap-6">
                        <StatCard
                          icon={<Package className="w-5 h-5 text-[#0984E3]" />}
                          label="Mes Envois"
                          value={totalSent}
                          barColor="#0984E3"
                        />
                        <StatCard
                          icon={<Clock className="w-5 h-5 text-[#F39C12]" />}
                          label="Trajets Actifs"
                          value={String(inTransit).padStart(2, '0')}
                          barColor="#F39C12"
                        />
                        <StatCard
                          icon={<DollarSign className="w-5 h-5 text-[#00B894]" />}
                          label="Budget Total"
                          value={`${totalSpent.toLocaleString('fr-MA')}DH`}
                          barColor="#00B894"
                        />
                        <StatCard
                          icon={<Star className="w-5 h-5 text-[#F39C12]" />}
                          label="Ma Note"
                          value="5.0/5"
                          barColor="#F39C12"
                        />
                      </div>

                      {/* Delivery Line Chart */}
                      <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xs rounded-xl">
                        <div className="px-5 pt-5">
                          <div className="flex justify-between items-start mb-1">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                              Rapidité des livraisons (Heures)
                            </h2>
                            <div className="flex items-center gap-1.5 text-sm text-[#0984E3] font-medium">
                              <span className="w-2 h-2 rounded-full bg-[#0984E3] inline-block" />
                              Délai
                            </div>
                          </div>
                        </div>
                        <div className="grow">
                          <DeliveryLineChart data={deliveryTimes} width={600} height={192} />
                        </div>
                      </div>

                      {/* Recent Shipments Table */}
                      {packages.length > 0 && (
                        <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xs rounded-xl overflow-hidden">
                          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Mes derniers envois</h2>
                            <button onClick={() => setSearchParams({ tab: 'expedition' })} className="text-sm text-[#0984E3] hover:underline font-bold">
                              Voir tout →
                            </button>
                          </header>
                          <div className="p-3">
                            <div className="overflow-x-auto">
                              <table className="table-auto w-full dark:text-gray-300">
                                <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/20">
                                  <tr>
                                    <th className="p-2 whitespace-nowrap text-left font-semibold">Colis</th>
                                    <th className="p-2 whitespace-nowrap text-left font-semibold">Trajet</th>
                                    <th className="p-2 whitespace-nowrap text-left font-semibold">Catégorie</th>
                                    <th className="p-2 whitespace-nowrap text-right font-semibold">Prix</th>
                                    <th className="p-2 whitespace-nowrap text-center font-semibold">Statut</th>
                                  </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
                                  {packages.slice(0, 5).map((pkg) => {
                                    const s = statusOf(pkg);
                                    return (
                                      <tr key={pkg.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/5 transition">
                                        <td className="p-2 whitespace-nowrap font-medium text-gray-800 dark:text-gray-100">
                                          {pkg.package_name}
                                        </td>
                                        <td className="p-2 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                          {pkg.from_city?.name} → {pkg.to_city?.name}
                                        </td>
                                        <td className="p-2 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                          {CAT_LABEL[pkg.category] ?? pkg.category}
                                        </td>
                                        <td className="p-2 whitespace-nowrap text-right font-semibold text-gray-800 dark:text-gray-100">
                                          {pkg.price} DH
                                        </td>
                                        <td className="p-2 whitespace-nowrap text-center">
                                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.badge}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                            {s.label}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}

                      {packages.length === 0 && (
                        <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xs rounded-xl p-10 items-center gap-4 text-center">
                          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-3xl">📦</div>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Vous n'avez pas encore envoyé de colis.
                          </p>
                          <Link
                            to="/packages/create"
                            className="bg-[#0984E3] hover:bg-blue-600 text-white text-sm font-semibold px-5 py-2  rounded-xl transition cursor-pointer"
                          >
                            Envoyer mon premier colis
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* RIGHT Column */}
                    <div className="col-span-full lg:col-span-4 flex flex-col gap-6">

                      {/* Payment Card */}
                      <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xs rounded-xl p-5">
                        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3">
                          Paiement à venir (MAD)
                        </h2>
                        <div className="text-4xl font-bold text-[#0984E3] mb-1">
                          {pendingPayment.toLocaleString('fr-MA')}DH
                        </div>
                        <div className="text-sm text-gray-400 mb-5">
                          Pour {inTransit} colis en transit
                        </div>
                        <button className="w-full bg-[#0984E3] hover:bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl transition cursor-pointer">
                          Payer maintenant
                        </button>
                      </div>

                      {/* Recent Tracking Timeline */}
                      <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xs rounded-xl p-5">
                        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3">
                          Suivi des colis récents
                        </h2>
                        {recentPkgs.length === 0 ? (
                          <p className="text-sm text-gray-400 dark:text-gray-500">Aucun colis pour l'instant.</p>
                        ) : (
                          <ul className="flex flex-col divide-y divide-gray-100 dark:divide-gray-700/60">
                            {recentPkgs.map((pkg) => {
                              const s = statusOf(pkg);
                              return (
                                <li key={pkg.id} className="flex items-center justify-between py-3 gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${s.dot} bg-opacity-20`} style={{ background: s.dot.includes('blue') ? '#0984E320' : '#F39C1220' }}>
                                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill={s.dot.includes('blue') ? '#0984E3' : '#F39C12'}>
                                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2.038A2 2 0 0115 11.1V15h.95a2.5 2.5 0 014.9 0H21a1 1 0 001-1v-4a1 1 0 00-.293-.707L19 7.586A2 2 0 0017.586 7H15V5a1 1 0 00-1-1H3z"/>
                                      </svg>
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
                                        Colis #{pkg.id} → {pkg.to_city?.name}
                                      </p>
                                      <p className="text-xs text-gray-400">{s.label}</p>
                                    </div>
                                  </div>
                                  <button onClick={() => setSearchParams({ tab: 'suivi' })} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                    <ChevronRight size={16} className="text-gray-400" />
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>

                      {/* Badges achievements */}
                      <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xs rounded-xl p-5">
                        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3">
                          Badges &amp; Succès
                        </h2>
                        {badges.length === 0 ? (
                          <p className="text-sm text-gray-400 dark:text-gray-500">
                            Envoyez votre premier colis pour débloquer des badges.
                          </p>
                        ) : (
                          <ul className="flex flex-col gap-3">
                            {badges.map((b) => (
                              <li key={b.label} className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-lg shrink-0">
                                  {b.icon}
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{b.label}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Categories breakdown */}
                      {Object.keys(byCategory).length > 0 && (
                        <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xs rounded-xl p-5">
                          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3">
                            Par catégorie
                          </h2>
                          <ul className="flex flex-col gap-2.5">
                            {Object.entries(byCategory).map(([cat, count]) => (
                              <li key={cat} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-300">{CAT_LABEL[cat] ?? cat}</span>
                                <span className="text-sm font-bold text-[#0984E3]">{count}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    </div>
                  </div>
                )}

                {/* ── EXPEDITION & SUIVI TABS ─────────────────────────────────── */}
                {(activeTab === 'expedition' || activeTab === 'suivi') && (
                  <div className="col-span-full flex flex-col gap-5">

                    {/* ── TABLE HEADER ── */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                            Historique des Expéditions
                          </h2>
                          <span className="bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            +{filteredPackages.length}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-0.5">
                          Gérez et visualisez l'état de tous vos envois ColiFlow en temps réel
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Supprimer */}
                        <button
                          onClick={() => setConfirmDelete({ type: 'bulk' })}
                          disabled={!selectedRows.length}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-red-300 hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          <Trash2 size={15} />
                          Supprimer {selectedRows.length > 0 && `(${selectedRows.length})`}
                        </button>

                        {/* Filtres */}
                        <button
                          onClick={() => setShowFilters(f => !f)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border transition cursor-pointer ${
                            showFilters
                              ? 'border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400'
                              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-gray-300'
                          }`}
                        >
                          <Filter size={15} />
                          Filtres
                        </button>

                        {/* Exporter */}
                        <button
                          onClick={handleExport}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-gray-300 transition cursor-pointer"
                        >
                          <Download size={15} />
                          Exporter
                        </button>

                        {/* Nouveau Colis */}
                        <Link
                          to="/packages/create"
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg bg-[#0984E3] hover:bg-blue-600 active:scale-95 text-white shadow-sm transition cursor-pointer"
                        >
                          <Plus size={15} />
                          Nouveau Colis
                        </Link>
                      </div>
                    </div>

                    {/* ── FILTER BAR (collapsible) ── */}
                    {showFilters && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl px-4 py-3 shadow-xs">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Rechercher par ID, nom, ville..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="pl-9 pr-4 py-2 w-full text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-[#0984E3] dark:text-gray-200"
                          />
                        </div>
                        <select
                          value={urgencyFilter}
                          onChange={(e) => { setUrgencyFilter(e.target.value); setCurrentPage(1); }}
                          className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#0984E3]"
                        >
                          <option value="all">Toutes les urgences</option>
                          <option value="standard">Standard</option>
                          <option value="urgent">Urgent</option>
                          <option value="très_urgent">Très urgent</option>
                        </select>
                      </div>
                    )}

                    {/* ── TABLE ── */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700/60 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="table-auto w-full text-sm">

                          {/* HEAD */}
                          <thead className="bg-gray-50 dark:bg-gray-700/30 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            <tr>
                              {/* select-all */}
                              <th className="pl-4 pr-2 py-3.5 w-8">
                                <input
                                  type="checkbox"
                                  className="rounded accent-[#0984E3] cursor-pointer"
                                  checked={paginatedPackages.length > 0 && paginatedPackages.every(p => selectedRows.includes(p.id))}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedRows(prev => [...new Set([...prev, ...paginatedPackages.map(p => p.id)])]);
                                    else setSelectedRows(prev => prev.filter(id => !paginatedPackages.map(p => p.id).includes(id)));
                                  }}
                                />
                              </th>
                              {[
                                { key: 'id',           label: 'ID Colis' },
                                { key: 'trajet',       label: 'Trajet' },
                                { key: null,           label: 'Voyageur' },
                                { key: 'created_at',   label: "Date d'envoi" },
                                { key: 'package_size', label: 'Poids (kg)' },
                                { key: 'urgency',      label: 'Statut' },
                                { key: 'price',        label: 'Prix' },
                              ].map(({ key, label }) => (
                                <th
                                  key={label}
                                  onClick={() => key && handleSort(key)}
                                  className={`px-4 py-3.5 text-left font-semibold whitespace-nowrap ${
                                    key ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-1">
                                    {label}
                                    {key && (
                                      <ArrowUpDown
                                        size={13}
                                        className={sortField === key ? 'text-[#0984E3]' : 'text-gray-300 dark:text-gray-600'}
                                      />
                                    )}
                                  </div>
                                </th>
                              ))}
                              <th className="px-4 py-3.5 w-10" />
                            </tr>
                          </thead>

                          {/* BODY */}
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
                            {paginatedPackages.map((pkg) => {
                              const s = statusOf(pkg);
                              const selected = selectedRows.includes(pkg.id);
                              return (
                                <tr
                                  key={pkg.id}
                                  className={`transition group ${
                                    selected
                                      ? 'bg-blue-50/60 dark:bg-blue-950/10'
                                      : 'hover:bg-gray-50/60 dark:hover:bg-gray-700/10'
                                  }`}
                                >
                                  {/* checkbox */}
                                  <td className="pl-4 pr-2 py-3">
                                    <input
                                      type="checkbox"
                                      className="rounded accent-[#0984E3] cursor-pointer"
                                      checked={selected}
                                      onChange={() => toggleRow(pkg.id)}
                                    />
                                  </td>

                                  {/* ID */}
                                  <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    #CF-{String(pkg.id).padStart(3, '0')}
                                  </td>

                                  {/* Trajet */}
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-1 text-gray-700 dark:text-gray-200 font-medium">
                                      <span className="capitalize">{pkg.from_city?.name ?? '—'}</span>
                                      <ArrowRight size={13} className="text-gray-300 shrink-0" />
                                      <span className="capitalize">{pkg.to_city?.name ?? '—'}</span>
                                    </div>
                                  </td>

                                  {/* Voyageur */}
                                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs whitespace-nowrap">
                                    {pkg.travel_requests?.[0]?.travel?.user?.name ?? <span className="text-gray-400 dark:text-gray-500">—</span>}
                                  </td>

                                  {/* Date */}
                                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                                    {new Date(pkg.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                                  </td>

                                  {/* Poids */}
                                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
                                    {pkg.package_size} kg
                                  </td>

                                  {/* Statut */}
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.badge}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                      {s.label}
                                    </span>
                                  </td>

                                  {/* Prix */}
                                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                    {Number(pkg.price).toLocaleString('fr-FR')} DH
                                  </td>

                                  {/* Three-dot menu */}
                                  <td className="px-4 py-3 relative">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === pkg.id ? null : pkg.id); }}
                                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                                    >
                                      <MoreHorizontal size={16} />
                                    </button>
                                    {openMenuId === pkg.id && (
                                      <div
                                        ref={menuRef}
                                        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-[140px]"
                                      >
                                        <button
                                          onClick={() => { setOpenMenuId(null); navigate(`/packages/${pkg.id}`); }}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                        >
                                          <Eye size={14} /> Voir le détail
                                        </button>
                                        <button
                                          onClick={() => { setOpenMenuId(null); setConfirmDelete({ type: 'single', id: pkg.id }); }}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                                        >
                                          <Trash2 size={14} /> Supprimer
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}

                            {filteredPackages.length === 0 && (
                              <tr>
                                <td colSpan="9" className="text-center py-16 text-gray-400 dark:text-gray-500">
                                  <Package size={36} className="mx-auto mb-3 opacity-30" />
                                  <p className="font-semibold">Aucun colis trouvé</p>
                                  <p className="text-xs mt-1">Essayez un autre terme de recherche ou ajoutez un nouveau colis.</p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* ── PAGINATION FOOTER ── */}
                      {filteredPackages.length > 0 && (
                        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Page <span className="font-bold text-gray-600 dark:text-gray-300">{currentPage}</span> sur{' '}
                            <span className="font-bold text-gray-600 dark:text-gray-300">{totalPages}</span>
                            {' '}— {filteredPackages.length} colis
                          </p>

                          <div className="flex items-center gap-1">
                            {pageNumbers().map((p, i) =>
                              p === '...' ? (
                                <span key={`ellipsis-${i}`} className="px-2 text-gray-400 select-none">…</span>
                              ) : (
                                <button
                                  key={p}
                                  onClick={() => setCurrentPage(p)}
                                  className={`min-w-[32px] h-8 px-2 flex items-center justify-center text-xs font-semibold rounded-lg transition cursor-pointer ${
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
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="h-8 px-3 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => { if (!o) setConfirmDelete(null); }}
        onConfirm={handleConfirmDelete}
        title={confirmDelete?.type === 'bulk' ? 'Supprimer les colis sélectionnés ?' : 'Supprimer ce colis ?'}
        description={
          confirmDelete?.type === 'bulk'
            ? `Cette action est irréversible. ${selectedRows.length} colis seront définitivement supprimés.`
            : 'Cette action est irréversible. Ce colis sera définitivement supprimé.'
        }
      />
    </div>
  );
}