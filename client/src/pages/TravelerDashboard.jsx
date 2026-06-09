import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plane, Package, DollarSign, Star,
  MapPin, Inbox, ShieldCheck, Crown, CheckCircle,
  Plus, ChevronRight, ArrowRight, ArrowUpDown,
  Trash2, Filter, Download, MoreHorizontal, Eye,
  Navigation,
} from 'lucide-react';
import TravelerSidebar from '../partials/TravelerSidebar';
import Header from '../partials/Header';
import WeeklyBarChart from '@/charts/Weeklybarchart ';
import RatingLineChart from '@/charts/RatingLineChart';
import axiosClient from '../services/axios';

// ── status config ──────────────────────────────────────────────────────────────

const STATUS = {
  disponible: { label: 'Disponible', dot: 'bg-gray-400',    badge: 'bg-gray-100 text-gray-500 dark:bg-gray-700/40 dark:text-gray-400' },
  ouvert:     { label: 'Ouvert',     dot: 'bg-orange-400',  badge: 'bg-orange-100 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400' },
  en_route:   { label: 'En route',   dot: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400' },
  complet:    { label: 'Complet',    dot: 'bg-red-500',     badge: 'bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400' },
  termine:    { label: 'Terminé',    dot: 'bg-green-500',   badge: 'bg-green-100 text-green-600 dark:bg-green-950/20 dark:text-green-400' },
};

// ── step / badge configs ───────────────────────────────────────────────────────

const STEP_CONFIG = {
  request: { Icon: Inbox,   bg: 'bg-blue-100 dark:bg-blue-950/30',    color: 'text-blue-500' },
  travel:  { Icon: MapPin,  bg: 'bg-orange-100 dark:bg-orange-950/30', color: 'text-orange-500' },
  pickup:  { Icon: Package, bg: 'bg-green-100 dark:bg-green-950/30',   color: 'text-green-500' },
};

const BADGE_CONFIG = {
  elite:    { Icon: Crown,       bg: 'bg-yellow-100 dark:bg-yellow-950/30', color: 'text-yellow-500' },
  driver:   { Icon: Plane,       bg: 'bg-blue-100 dark:bg-blue-950/30',    color: 'text-[#0984E3]' },
  packages: { Icon: Package,     bg: 'bg-purple-100 dark:bg-purple-950/30', color: 'text-purple-500' },
  verified: { Icon: ShieldCheck, bg: 'bg-green-100 dark:bg-green-950/30',  color: 'text-green-500' },
};

// ── page headers ───────────────────────────────────────────────────────────────

const PAGE_HEADER = {
  apercu:  { title: 'Tableau de Bord Voyageur', subtitle: 'Gérez vos trajets, suivez vos livraisons et consultez vos gains.' },
  trajets: { title: 'Gestion de mes Trajets',   subtitle: 'Gérez vos itinéraires, suivez vos réservations et optimisez l\'espace de votre véhicule en temps réel.' },
};

// ── skeleton ───────────────────────────────────────────────────────────────────

function AperçuSkeleton() {
  const pulse = 'animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700';
  return (
    <div className="grid grid-cols-12 gap-6">

      {/* LEFT column */}
      <div className="col-span-full lg:col-span-8 flex flex-col gap-6">

        {/* Main card skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700/60 overflow-hidden">
          <div className="px-5 pt-5 pb-4 flex flex-col gap-3">
            <div className={`h-3 w-24 ${pulse}`} />
            <div className={`h-10 w-40 ${pulse}`} />
            <div className={`h-3 w-32 ${pulse}`} />
            <div className={`h-3 w-28 ${pulse}`} />
          </div>
          <div className={`mx-4 mb-4 h-36 ${pulse}`} />
          <div className="grid grid-cols-4 border-t border-gray-100 dark:border-gray-700/60">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`flex flex-col items-center gap-2 py-4 ${i < 3 ? 'border-r border-gray-100 dark:border-gray-700/60' : ''}`}>
                <div className={`w-5 h-5 rounded-full ${pulse}`} />
                <div className={`h-3 w-10 ${pulse}`} />
                <div className={`h-2 w-16 ${pulse}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Rating chart skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700/60 p-5">
          <div className="flex justify-between mb-4">
            <div className={`h-4 w-48 ${pulse}`} />
            <div className={`h-4 w-16 ${pulse}`} />
          </div>
          <div className={`h-48 w-full ${pulse}`} />
        </div>
      </div>

      {/* RIGHT column */}
      <div className="col-span-full lg:col-span-4 flex flex-col gap-6">

        {/* Gains card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700/60 p-5 flex flex-col gap-3">
          <div className={`h-3 w-28 ${pulse}`} />
          <div className={`h-10 w-32 ${pulse}`} />
          <div className={`h-3 w-24 ${pulse}`} />
          <div className={`h-9 w-full rounded-xl ${pulse}`} />
        </div>

        {/* Prochaines étapes card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700/60 p-5 flex flex-col gap-4">
          <div className={`h-3 w-32 ${pulse}`} />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full shrink-0 ${pulse}`} />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className={`h-3 w-full ${pulse}`} />
                <div className={`h-2 w-2/3 ${pulse}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Niveau card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700/60 p-5 flex flex-col gap-4">
          <div className={`h-3 w-32 ${pulse}`} />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full shrink-0 ${pulse}`} />
              <div className={`h-3 w-28 ${pulse}`} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

function TrajetsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-16 bg-white dark:bg-gray-800 rounded-xl animate-pulse" />
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 flex flex-col gap-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function TravelerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'apercu';

  // ── apercu state
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // ── trajets state
  const [travels, setTravels]           = useState([]);
  const [travelsLoading, setTravelsLoading] = useState(false);
  const [travelsError, setTravelsError]   = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters]   = useState(false);
  const [sortField, setSortField]       = useState(null);
  const [sortDir, setSortDir]           = useState('asc');
  const [selectedRows, setSelectedRows] = useState([]);
  const [openMenuId, setOpenMenuId]     = useState(null);
  const [currentPage, setCurrentPage]   = useState(1);
  const menuRef = useRef(null);
  const itemsPerPage = 10;

  // ── fetch apercu
  useEffect(() => {
    axiosClient.get('/api/traveler/dashboard')
      .then(r => setData(r.data))
      .catch(e => setError(e?.response?.data?.message ?? 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  // ── fetch trajets when tab is active
  const fetchTravels = useCallback(() => {
    setTravelsLoading(true);
    axiosClient.get('/api/traveler/travels')
      .then(r => setTravels(r.data))
      .catch(e => setTravelsError(e?.response?.data?.message ?? 'Erreur de chargement'))
      .finally(() => setTravelsLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'trajets') fetchTravels();
  }, [activeTab, fetchTravels]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, activeTab]);

  // ── close three-dot menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── apercu data
  const weeklyData    = data?.weekly_counts  ?? Array(10).fill(0);
  const ratingHistory = data?.rating_history ?? [5, 5];
  const totalTravels  = data?.total_travels  ?? 0;
  const pkgCount      = data?.packages_transported ?? 0;
  const totalRevenue  = data?.total_revenue  ?? 0;
  const weekRevenue   = data?.this_week_revenue ?? 0;
  const rating        = data?.rating         ?? 5.0;
  const pendingGains  = data?.pending_gains  ?? 0;
  const nextSteps     = data?.next_steps     ?? [];
  const badges        = data?.badges         ?? [];

  // ── trajets filtering + sorting + pagination
  const filtered = travels.filter(t => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQ = !q ||
      String(t.id).includes(q) ||
      t.from_city.toLowerCase().includes(q) ||
      t.to_city.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesQ && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    let av, bv;
    if (sortField === 'id')             { av = a.id; bv = b.id; }
    else if (sortField === 'itineraire'){ av = a.from_city; bv = b.from_city; }
    else if (sortField === 'departure') { av = new Date(a.departure_date); bv = new Date(b.departure_date); }
    else if (sortField === 'gains')     { av = a.gains_estimes; bv = b.gains_estimes; }
    else if (sortField === 'colis')     { av = a.colis; bv = b.colis; }
    else if (sortField === 'status')    { av = a.status; bv = b.status; }
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  const totalPages     = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated      = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const toggleRow = (id) => setSelectedRows(prev =>
    prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce trajet ?')) return;
    try {
      await axiosClient.delete(`/api/traveler/travels/${id}`);
      setTravels(prev => prev.filter(t => t.id !== id));
      setSelectedRows(prev => prev.filter(r => r !== id));
    } catch (err) {
      alert(err?.response?.data?.message ?? 'Erreur lors de la suppression.');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedRows.length) return;
    if (!window.confirm(`Supprimer ${selectedRows.length} trajet(s) ?`)) return;
    try {
      await Promise.all(selectedRows.map(id => axiosClient.delete(`/api/traveler/travels/${id}`)));
      fetchTravels();
      setSelectedRows([]);
    } catch (err) {
      alert(err?.response?.data?.message ?? 'Erreur lors de la suppression.');
    }
  };

  const handleExport = () => {
    const cols = ['ID Trajet', 'Itinéraire', 'Colis', 'Date de Départ', 'Capacité Libre', 'État', 'Gains Estimés (DH)'];
    const rows = filtered.map(t => [
      `#TR-${String(t.id).padStart(3, '0')}`,
      `${t.from_city} → ${t.to_city}`,
      t.colis,
      new Date(t.departure_date).toLocaleString('fr-FR'),
      t.capacite_libre,
      STATUS[t.status]?.label ?? t.status,
      t.gains_estimes,
    ]);
    const csv = [cols, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'mes-trajets.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const pageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const header = PAGE_HEADER[activeTab] ?? PAGE_HEADER.apercu;

  return (
    <div className="flex h-screen overflow-hidden">
      <TravelerSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

            {/* Page title */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                    {header.title}
                  </h1>
                  {activeTab === 'trajets' && filtered.length > 0 && (
                    <span className="bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      +{filtered.length}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{header.subtitle}</p>
              </div>
              <button
                onClick={() => navigate('/travels/create')}
                className="flex items-center gap-2 bg-[#0984E3] hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition mt-4 sm:mt-0 active:scale-95 shadow-sm cursor-pointer"
              >
                <Plus size={16} />
                Publier un Trajet
              </button>
            </div>

            {/* ── APERÇU TAB ──────────────────────────────────────────── */}
            {activeTab === 'apercu' && (
              <>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">
                    {error}
                  </div>
                )}
                {loading && <AperçuSkeleton />}
                {!loading && !error && (
                  <div className="grid grid-cols-12 gap-6">

                    {/* LEFT */}
                    <div className="col-span-full lg:col-span-8 flex flex-col gap-6">

                      {/* Livraisons en cours card */}
                      <div className="flex flex-col bg-linear-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-800 border border-blue-100 dark:border-gray-700/60 shadow-xs rounded-xl overflow-hidden">
                        <div className="px-5 pt-5 pb-2">
                          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3">
                            Livraisons en cours
                          </h2>
                          <div className="flex items-start gap-6">
                            <div className="flex flex-col gap-2 min-w-45">
                              <div className="text-5xl font-bold text-[#0984E3]">
                                {weekRevenue.toLocaleString('fr-MA')}
                                <span className="text-2xl ml-1">MAD</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Star size={14} className="text-yellow-400 shrink-0" />
                                Gains cette semaine
                              </div>
                              <Link to="/travels/create" className="text-sm text-[#0984E3] hover:underline font-medium mt-2">
                                Publier un nouveau trajet →
                              </Link>
                            </div>
                          </div>
                        </div>
                        <div className="grow">
                          <WeeklyBarChart data={weeklyData} width={600} height={148} />
                        </div>
                        {/* Stats row */}
                        <div className="grid grid-cols-4 border-t border-blue-100 dark:border-gray-700/60">
                          {[
                            { Icon: Plane,      label: 'Trajets réalisés',  value: totalTravels,  color: '#0984E3' },
                            { Icon: Package,    label: 'Colis transportés', value: String(pkgCount).padStart(2, '0'), color: '#F39C12' },
                            { Icon: DollarSign, label: 'Revenus Totaux',    value: `${totalRevenue.toLocaleString('fr-MA')}DH`, color: '#00B894' },
                            { Icon: Star,       label: 'Note Voyageur',     value: `${rating}/5`, color: '#F39C12' },
                          ].map(({ Icon, label, value, color }, i) => (
                            <div key={label} className={`flex flex-col items-center justify-center py-4 gap-1 ${i < 3 ? 'border-r border-blue-100 dark:border-gray-700/60' : ''}`}>
                              <Icon size={18} style={{ color }} />
                              <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{value}</span>
                              <span className="text-xs text-gray-400 dark:text-gray-500 text-center">{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rating chart */}
                      <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xs rounded-xl">
                        <div className="px-5 pt-5">
                          <div className="flex justify-between items-start mb-1">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                              Évolution de ma Note Voyageur
                            </h2>
                            <div className="flex items-center gap-1.5 text-sm text-[#0984E3] font-medium">
                              <span className="w-2 h-2 rounded-full bg-[#0984E3] inline-block" />
                              Note
                            </div>
                          </div>
                        </div>
                        <div className="grow">
                          <RatingLineChart data={ratingHistory} width={600} height={192} />
                        </div>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="col-span-full lg:col-span-4 flex flex-col gap-6">

                      <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xs rounded-xl p-5">
                        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3">
                          Gains en attente (MAD)
                        </h2>
                        <div className="text-4xl font-bold text-[#0984E3] mb-1">
                          {pendingGains.toLocaleString('fr-MA')}DH
                        </div>
                        <div className="text-sm text-gray-400 mb-5">Pour {pkgCount} colis à livrer</div>
                        <button className="w-full bg-[#0984E3] hover:bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl transition cursor-pointer">
                          Débloquer mes fonds
                        </button>
                      </div>

                      <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xs rounded-xl p-5">
                        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3">
                          Prochaines étapes
                        </h2>
                        {nextSteps.length === 0 ? (
                          <div className="text-center py-4">
                            <CheckCircle size={28} className="mx-auto mb-2 text-green-400" />
                            <p className="text-sm text-gray-400 dark:text-gray-500">Aucune action requise.</p>
                          </div>
                        ) : (
                          <ul className="flex flex-col divide-y divide-gray-100 dark:divide-gray-700/60">
                            {nextSteps.map((step, i) => {
                              const cfg = STEP_CONFIG[step.type] ?? STEP_CONFIG.request;
                              const { Icon } = cfg;
                              return (
                                <li key={i} className="flex items-center gap-3 py-3">
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}>
                                    <Icon size={16} className={cfg.color} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{step.label}</p>
                                    <p className="text-xs text-gray-400 truncate">{step.detail}</p>
                                  </div>
                                  <ChevronRight size={16} className="text-gray-300 shrink-0" />
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>

                      <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xs rounded-xl p-5">
                        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3">
                          Niveau du Voyageur
                        </h2>
                        {badges.length === 0 ? (
                          <p className="text-sm text-gray-400 dark:text-gray-500">
                            Effectuez votre première livraison pour débloquer des badges.
                          </p>
                        ) : (
                          <ul className="flex flex-col gap-3">
                            {badges.map((badge) => {
                              const cfg = BADGE_CONFIG[badge.icon] ?? BADGE_CONFIG.driver;
                              const { Icon } = cfg;
                              return (
                                <li key={badge.label} className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}>
                                    <Icon size={16} className={cfg.color} />
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{badge.label}</span>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>

                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── TRAJETS TAB ─────────────────────────────────────────── */}
            {activeTab === 'trajets' && (
              <div className="flex flex-col gap-5">

                {travelsError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                    {travelsError}
                  </div>
                )}

                {travelsLoading && <TrajetsSkeleton />}

                {!travelsLoading && !travelsError && (
                  <>
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-400 mt-0.5">
                          Gérez et visualisez l'état de tous vos trajets ColiFlow en temps réel
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={handleBulkDelete}
                          disabled={!selectedRows.length}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-red-300 hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          <Trash2 size={15} />
                          Supprimer {selectedRows.length > 0 && `(${selectedRows.length})`}
                        </button>
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
                        <button
                          onClick={handleExport}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-gray-300 transition cursor-pointer"
                        >
                          <Download size={15} />
                          Exporter
                        </button>
                        <Link
                          to="/travels/create"
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg bg-[#0984E3] hover:bg-blue-600 active:scale-95 text-white shadow-sm transition cursor-pointer"
                        >
                          <Plus size={15} />
                          Publier un Trajet
                        </Link>
                      </div>
                    </div>

                    {/* Filter bar */}
                    {showFilters && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl px-4 py-3 shadow-xs">
                        <div className="relative flex-1">
                          <Navigation className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Rechercher par ID, ville…"
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="pl-9 pr-4 py-2 w-full text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-[#0984E3] dark:text-gray-200"
                          />
                        </div>
                        <select
                          value={statusFilter}
                          onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                          className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#0984E3]"
                        >
                          <option value="all">Tous les états</option>
                          <option value="disponible">Disponible</option>
                          <option value="en_route">En route</option>
                          <option value="complet">Complet</option>
                          <option value="termine">Terminé</option>
                        </select>
                      </div>
                    )}

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700/60 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="table-auto w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-700/30 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            <tr>
                              <th className="pl-4 pr-2 py-3.5 w-8">
                                <input
                                  type="checkbox"
                                  className="rounded accent-[#0984E3] cursor-pointer"
                                  checked={paginated.length > 0 && paginated.every(t => selectedRows.includes(t.id))}
                                  onChange={e => {
                                    if (e.target.checked) setSelectedRows(prev => [...new Set([...prev, ...paginated.map(t => t.id)])]);
                                    else setSelectedRows(prev => prev.filter(id => !paginated.map(t => t.id).includes(id)));
                                  }}
                                />
                              </th>
                              {[
                                { key: 'id',         label: 'ID Trajet' },
                                { key: 'itineraire', label: 'Itinéraire' },
                                { key: 'colis',      label: 'Colis' },
                                { key: 'departure',  label: 'Date de Départ' },
                                { key: null,         label: 'Capacité Libre' },
                                { key: 'status',     label: 'État du Trajet' },
                                { key: 'gains',      label: 'Gains Estimés' },
                              ].map(({ key, label }) => (
                                <th
                                  key={label}
                                  onClick={() => key && handleSort(key)}
                                  className={`px-4 py-3.5 text-left font-semibold whitespace-nowrap ${key ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200' : ''}`}
                                >
                                  <div className="flex items-center gap-1">
                                    {label}
                                    {key && (
                                      <ArrowUpDown size={13} className={sortField === key ? 'text-[#0984E3]' : 'text-gray-300 dark:text-gray-600'} />
                                    )}
                                  </div>
                                </th>
                              ))}
                              <th className="px-4 py-3.5 w-10" />
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
                            {paginated.map(travel => {
                              const s = STATUS[travel.status] ?? STATUS.ouvert;
                              const selected = selectedRows.includes(travel.id);
                              return (
                                <tr
                                  key={travel.id}
                                  className={`transition group ${selected ? 'bg-blue-50/60 dark:bg-blue-950/10' : 'hover:bg-gray-50/60 dark:hover:bg-gray-700/10'}`}
                                >
                                  <td className="pl-4 pr-2 py-3">
                                    <input
                                      type="checkbox"
                                      className="rounded accent-[#0984E3] cursor-pointer"
                                      checked={selected}
                                      onChange={() => toggleRow(travel.id)}
                                    />
                                  </td>

                                  {/* ID */}
                                  <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    #TR-{String(travel.id).padStart(3, '0')}
                                  </td>

                                  {/* Itinéraire */}
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-1 text-gray-700 dark:text-gray-200 font-medium">
                                      <span className="capitalize">{travel.from_city}</span>
                                      <ArrowRight size={13} className="text-gray-300 shrink-0" />
                                      <span className="capitalize">{travel.to_city}</span>
                                    </div>
                                  </td>

                                  {/* Colis */}
                                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">
                                    {travel.colis}
                                  </td>

                                  {/* Date */}
                                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                                    {new Date(travel.departure_date).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                                  </td>

                                  {/* Capacité Libre */}
                                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                    {travel.capacite_libre}
                                  </td>

                                  {/* État */}
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.badge}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                      {s.label}
                                    </span>
                                  </td>

                                  {/* Gains */}
                                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                    {Number(travel.gains_estimes).toLocaleString('fr-FR')} DH
                                  </td>

                                  {/* Three-dot menu */}
                                  <td className="px-4 py-3 relative">
                                    <button
                                      onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === travel.id ? null : travel.id); }}
                                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                                    >
                                      <MoreHorizontal size={16} />
                                    </button>
                                    {openMenuId === travel.id && (
                                      <div
                                        ref={menuRef}
                                        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-36"
                                      >
                                        <button
                                          onClick={() => { setOpenMenuId(null); navigate(`/travels/${travel.id}`); }}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                        >
                                          <Eye size={14} /> Voir le détail
                                        </button>
                                        <button
                                          onClick={() => { setOpenMenuId(null); handleDelete(travel.id); }}
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

                            {filtered.length === 0 && (
                              <tr>
                                <td colSpan="9" className="text-center py-16 text-gray-400 dark:text-gray-500">
                                  <Navigation size={36} className="mx-auto mb-3 opacity-30" />
                                  <p className="font-semibold">Aucun trajet trouvé</p>
                                  <p className="text-xs mt-1">Essayez un autre terme ou publiez un nouveau trajet.</p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {filtered.length > 0 && (
                        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Page <span className="font-bold text-gray-600 dark:text-gray-300">{currentPage}</span> sur{' '}
                            <span className="font-bold text-gray-600 dark:text-gray-300">{totalPages}</span>
                            {' '}— {filtered.length} trajet{filtered.length > 1 ? 's' : ''}
                          </p>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="h-8 px-3 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                            >
                              Prev
                            </button>
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
                  </>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
