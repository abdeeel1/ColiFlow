import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  Plane, Package, DollarSign, Star,
  MapPin, Inbox, ShieldCheck, Crown, CheckCircle,
  Plus, ChevronRight, ArrowRight, ArrowUpDown,
  Trash2, Filter, Download, MoreHorizontal, Eye,
  Navigation, RefreshCw, Search, Check, X, Calendar,
  Info, Phone, EyeOff, ChevronDown, QrCode,
  Wallet, TrendingUp, Clock, CreditCard,
} from 'lucide-react';
import TravelerSidebar from '../partials/TravelerSidebar';
import Header from '../partials/Header';
import WeeklyBarChart from '@/charts/Weeklybarchart ';
import RatingLineChart from '@/charts/RatingLineChart';
import GainsAreaChart from '@/charts/GainsAreaChart';
import axiosClient from '../services/axios';
import ConfirmDialog from '../components/ConfirmDialog';
import BarcodeScannerModal from '../ui/BarcodeScannerModal';

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
  apercu:   { title: 'Tableau de Bord Voyageur', subtitle: 'Gérez vos trajets, suivez vos livraisons et consultez vos gains.' },
  trajets:  { title: 'Gestion de mes Trajets',   subtitle: 'Gérez vos itinéraires, suivez vos réservations et optimisez l\'espace de votre véhicule en temps réel.' },
  demandes:   { title: 'Demandes de Réservation',  subtitle: 'Gérez les demandes des expéditeurs pour vos trajets. Acceptez les colis qui correspondent à votre capacité libre.' },
  livraisons: { title: 'Livraisons en Cours',      subtitle: 'Gérez et confirmez vos livraisons actives. Suivez l\'état de chaque colis en temps réel.' },
  gains:      { title: 'Gains et Retraits',         subtitle: 'Suivez vos revenus, consultez votre historique et gérez vos retraits ColiFlow.' },
};

const SIZE_LABEL = { 1: '< 1 kg', 2: '1 – 5 kg', 3: '5 – 15 kg', 4: '+ 15 kg' };

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

function DemandesSkeleton() {
  const pulse = 'animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700';
  return (
    <div className="flex flex-col gap-5">
      <div className={`h-16 rounded-xl ${pulse}`} />
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/40">
          <div className={`h-5 w-48 ${pulse}`} />
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 dark:border-gray-700/20 last:border-0">
            <div className={`w-8 h-8 rounded-full shrink-0 ${pulse}`} />
            <div className={`h-4 flex-1 ${pulse}`} />
            <div className={`h-4 w-32 ${pulse}`} />
            <div className={`h-4 w-24 ${pulse}`} />
            <div className={`h-8 w-40 ${pulse}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function LivraisonsSkeleton() {
  const pulse = 'animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700';
  return (
    <div className="flex flex-col gap-5">
      <div className={`h-14 rounded-xl ${pulse}`} />
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/60 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700/40 flex justify-between">
            <div className="flex flex-col gap-2 flex-1">
              <div className={`h-4 w-40 ${pulse}`} />
              <div className={`h-3 w-64 ${pulse}`} />
            </div>
            <div className={`h-9 w-44 rounded-xl ${pulse}`} />
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-700/40">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="p-6 flex flex-col gap-3">
                <div className={`h-3 w-28 ${pulse}`} />
                <div className={`h-16 w-full ${pulse}`} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function GainsSkeleton() {
  const pulse = 'animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700';
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-full lg:col-span-8 flex flex-col gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/60 p-5">
          <div className={`h-4 w-32 mb-4 ${pulse}`} />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className={`h-20 ${pulse}`} />)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/60 p-5">
          <div className={`h-4 w-40 mb-4 ${pulse}`} />
          <div className={`h-56 w-full ${pulse}`} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/60 p-5 flex flex-col gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className={`h-10 ${pulse}`} />)}
        </div>
      </div>
      <div className="col-span-full lg:col-span-4 flex flex-col gap-6">
        <div className={`h-56 rounded-xl ${pulse}`} />
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/60 p-5 flex flex-col gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className={`h-12 ${pulse}`} />)}
        </div>
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
  const user = useSelector((state) => state.auth.user);
  const isVerified = user?.statut_verification === 'verified';

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
  // null | { type: 'single', id } | { type: 'bulk' }
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentPage, setCurrentPage]   = useState(1);
  const menuRef = useRef(null);
  const itemsPerPage = 10;

  // ── demandes state
  const [demandesData, setDemandesData]       = useState([]);
  const [demandesLoading, setDemandesLoading] = useState(false);
  const [demandesError, setDemandesError]     = useState(null);
  const [demandesSubTab, setDemandesSubTab]   = useState('pending');
  const [demandesSearch, setDemandesSearch]   = useState('');
  const [demandesDateFrom, setDemandesDateFrom] = useState('');
  const [demandesDateTo, setDemandesDateTo]   = useState('');
  const [demandesPage, setDemandesPage]       = useState(1);
  const [demandesPerPage, setDemandesPerPage] = useState(13);
  const [actionLoading, setActionLoading]     = useState({});

  // ── livraisons state
  const [livraisonsTravelFilter, setLivraisonsTravelFilter] = useState('all');
  const [livraisonsDateFilter, setLivraisonsDateFilter]     = useState('');
  const [confirmCodes, setConfirmCodes]         = useState({});
  const [showConfirmCode, setShowConfirmCode]   = useState({});
  const [confirmLoading, setConfirmLoading]     = useState({});
  const [scannerOpenId, setScannerOpenId]       = useState(null);

  // ── gains state
  const [gainsData, setGainsData]         = useState(null);
  const [gainsLoading, setGainsLoading]   = useState(false);
  const [gainsError, setGainsError]       = useState(null);
  const [gainsMetric, setGainsMetric]     = useState('gains'); // gains | trajets | commissions
  const [gainsPeriod, setGainsPeriod]     = useState('Mensuel');

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

  // ── fetch demandes when tab is active
  const fetchDemandes = useCallback(() => {
    setDemandesLoading(true);
    setDemandesError(null);
    axiosClient.get('/api/travel-requests/received')
      .then(r => setDemandesData(r.data))
      .catch(e => setDemandesError(e?.response?.data?.message ?? 'Erreur de chargement'))
      .finally(() => setDemandesLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'demandes' || activeTab === 'livraisons') fetchDemandes();
  }, [activeTab, fetchDemandes]);

  // ── fetch gains when tab is active
  const fetchGains = useCallback(() => {
    setGainsLoading(true);
    setGainsError(null);
    axiosClient.get('/api/traveler/gains')
      .then(r => setGainsData(r.data))
      .catch(e => setGainsError(e?.response?.data?.message ?? 'Erreur de chargement'))
      .finally(() => setGainsLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'gains') fetchGains();
  }, [activeTab, fetchGains]);

  // Traveler enters the code the sender received by email → confirms pickup → "livraison en cours".
  const handleVerifyCode = async (id) => {
    const code = (confirmCodes[id] ?? '').trim();
    if (!code) {
      toast.error('Saisissez le code communiqué par l\'expéditeur.');
      return;
    }
    setConfirmLoading(prev => ({ ...prev, [id]: true }));
    try {
      await axiosClient.post(`/api/travel-requests/${id}/verify-code`, { code });
      setDemandesData(prev => prev.map(r => r.id === id ? { ...r, status: 'in_transit' } : r));
      setConfirmCodes(prev => { const n = { ...prev }; delete n[id]; return n; });
      toast.success('Code validé. Livraison en cours 🚚');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Code incorrect.');
    } finally {
      setConfirmLoading(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  // ── live position sharing (geolocation) ──────────────────────────────────
  const [sharingIds, setSharingIds]   = useState([]);
  const watchIdRef   = useRef(null);
  const sharingRef   = useRef([]);
  const lastPostRef  = useRef(0);

  useEffect(() => { sharingRef.current = sharingIds; }, [sharingIds]);

  // clear the geolocation watcher on unmount
  useEffect(() => () => {
    if (watchIdRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
  }, []);

  const pushLocation = (id, lat, lng) =>
    axiosClient.post(`/api/travel-requests/${id}/location`, { lat, lng }).catch(() => {});

  const startWatch = () => {
    if (watchIdRef.current != null) return;
    if (!navigator.geolocation) {
      toast.error('La géolocalisation n\'est pas supportée par ce navigateur.');
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastPostRef.current < 5000) return; // throttle to ~5s
        lastPostRef.current = now;
        sharingRef.current.forEach((id) => pushLocation(id, pos.coords.latitude, pos.coords.longitude));
      },
      (err) => {
        toast.error(err.code === 1
          ? 'Permission de localisation refusée. Activez-la pour partager votre position.'
          : 'Position indisponible pour le moment.');
        setSharingIds([]);
        if (watchIdRef.current != null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
  };

  const toggleShareLocation = async (id) => {
    if (sharingIds.includes(id)) {
      setSharingIds((prev) => prev.filter((x) => x !== id));
      try { await axiosClient.delete(`/api/travel-requests/${id}/location`); } catch { /* noop */ }
      // stop the watcher if nothing else is being shared
      if (sharingRef.current.filter((x) => x !== id).length === 0 && watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      toast('Partage de position arrêté.');
    } else {
      if (!navigator.geolocation) {
        toast.error('La géolocalisation n\'est pas supportée par ce navigateur.');
        return;
      }
      toast.loading('Récupération de votre position…', { id: `geo-${id}` });
      // Only mark as "sharing" once a real position has actually been saved.
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            await axiosClient.post(`/api/travel-requests/${id}/location`, {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
            lastPostRef.current = Date.now();
            setSharingIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
            startWatch();
            toast.success('Partage de position activé 📍', { id: `geo-${id}` });
          } catch (e) {
            toast.error(e?.response?.data?.message ?? 'Échec de l\'envoi de la position au serveur.', { id: `geo-${id}` });
          }
        },
        (err) => {
          toast.error(
            err.code === 1
              ? 'Permission de localisation refusée. Autorisez la localisation pour ce site (icône 🔒 dans la barre d\'adresse).'
              : err.code === 3
              ? 'Délai de localisation dépassé. Réessayez.'
              : 'Position indisponible pour le moment.',
            { id: `geo-${id}` },
          );
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      );
    }
  };

  // Traveler marks an in-transit delivery as completed.
  const handleMarkDelivered = async (id) => {
    setConfirmLoading(prev => ({ ...prev, [id]: true }));
    try {
      await axiosClient.patch(`/api/travel-requests/${id}/status`, { status: 'delivered' });
      setDemandesData(prev => prev.map(r => r.id === id ? { ...r, status: 'delivered' } : r));
      // stop sharing the position once delivered
      if (sharingIds.includes(id)) {
        setSharingIds(prev => prev.filter(x => x !== id));
        if (sharingRef.current.filter(x => x !== id).length === 0 && watchIdRef.current != null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      }
      toast.success('Livraison confirmée ✓');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Erreur lors de la confirmation.');
    } finally {
      setConfirmLoading(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  const handleDecision = async (id, status) => {
    // Block accepting colis until the vehicle & documents are verified
    if (status === 'accepted' && !isVerified) {
      toast.error("Votre véhicule n'est pas encore vérifié.", {
        description: 'Ajoutez et faites valider vos documents (permis, assurance, photo) avant d\'accepter des colis.',
        classNames: {
          title: '!text-red-600 !font-bold',
          description: '!text-gray-900 dark:!text-gray-100',
        },
        action: {
          label: 'Vérifier',
          onClick: () => navigate('/profile?tab=vehicle'),
        },
      });
      return;
    }

    setActionLoading(prev => ({ ...prev, [id]: status }));
    try {
      await axiosClient.patch(`/api/travel-requests/${id}/status`, { status });
      setDemandesData(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast.success(status === 'accepted' ? 'Demande acceptée.' : 'Demande refusée.');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Erreur lors de la mise à jour.');
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

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

  const performDelete = async (id) => {
    try {
      await axiosClient.delete(`/api/traveler/travels/${id}`);
      setTravels(prev => prev.filter(t => t.id !== id));
      setSelectedRows(prev => prev.filter(r => r !== id));
    } catch (err) {
      alert(err?.response?.data?.message ?? 'Erreur lors de la suppression.');
    }
  };

  const performBulkDelete = async () => {
    if (!selectedRows.length) return;
    try {
      await Promise.all(selectedRows.map(id => axiosClient.delete(`/api/traveler/travels/${id}`)));
      fetchTravels();
      setSelectedRows([]);
    } catch (err) {
      alert(err?.response?.data?.message ?? 'Erreur lors de la suppression.');
    }
  };

  // Run the delete the user confirmed in the AlertDialog, then close it.
  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'bulk') await performBulkDelete();
    else await performDelete(confirmDelete.id);
    setConfirmDelete(null);
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

  // ── demandes computed
  const totalDemandes   = demandesData.length;
  const pendingCount    = demandesData.filter(r => r.status === 'pending').length;
  const confirmedCount  = demandesData.filter(r => r.status === 'accepted').length;

  const filteredDemandes = demandesData.filter(r => {
    if (demandesSubTab === 'pending'   && r.status !== 'pending')  return false;
    if (demandesSubTab === 'confirmed' && r.status !== 'accepted') return false;
    const q = demandesSearch.toLowerCase().trim();
    if (q) {
      const senderName = `${r.sender?.first_name ?? ''} ${r.sender?.last_name ?? ''} ${r.sender?.name ?? ''}`.toLowerCase();
      const from = r.travel?.from_city?.name?.toLowerCase() ?? '';
      const to   = r.travel?.to_city?.name?.toLowerCase()   ?? '';
      if (!senderName.includes(q) && !from.includes(q) && !to.includes(q)) return false;
    }
    if (demandesDateFrom) {
      if (new Date(r.created_at) < new Date(demandesDateFrom)) return false;
    }
    if (demandesDateTo) {
      if (new Date(r.created_at) > new Date(demandesDateTo + 'T23:59:59')) return false;
    }
    return true;
  });

  const demandesPageCount  = Math.ceil(filteredDemandes.length / demandesPerPage) || 1;
  const paginatedDemandes  = filteredDemandes.slice(
    (demandesPage - 1) * demandesPerPage,
    demandesPage * demandesPerPage,
  );

  // ── livraisons computed
  const livraisonsBase = demandesData.filter(r => r.status === 'accepted' || r.status === 'in_transit');
  const livraisonsTravels = [...new Map(livraisonsBase.map(r => [r.travel_id, r.travel])).entries()]
    .map(([id, t]) => ({
      id,
      label: `TR#${id} ${t?.from_city?.name ?? ''} → ${t?.to_city?.name ?? ''}`,
    }));
  const filteredLivraisons = livraisonsBase.filter(r => {
    if (livraisonsTravelFilter !== 'all' && String(r.travel_id) !== String(livraisonsTravelFilter)) return false;
    if (livraisonsDateFilter && r.package?.date_delivery) {
      const d = new Date(r.package.date_delivery).toDateString();
      if (d !== new Date(livraisonsDateFilter).toDateString()) return false;
    }
    return true;
  });

  // ── gains computed
  const gainsSeriesLabels = gainsData?.series?.labels ?? [];
  const gainsSeries = {
    gains:       gainsData?.series?.gains       ?? [],
    trajets:     gainsData?.series?.trajets     ?? [],
    commissions: gainsData?.series?.commissions ?? [],
  };
  const gainsMetricUnit = gainsMetric === 'trajets' ? 'trajets' : 'MAD';

  // group upcoming deliveries by date label
  const upcomingByDate = (gainsData?.upcoming ?? []).reduce((acc, item) => {
    const d = new Date(item.date);
    const dayKey = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    (acc[dayKey] ??= []).push(item);
    return acc;
  }, {});

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
              {activeTab === 'demandes' ? (
                <div className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl px-5 py-3 shadow-xs mt-4 sm:mt-0">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#0984E3]">{totalDemandes}</div>
                    <div className="text-xs text-gray-400 whitespace-nowrap">Total reçu</div>
                  </div>
                  <div className="w-px h-10 bg-gray-100 dark:bg-gray-700" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">{pendingCount}</div>
                    <div className="text-xs text-gray-400">À traiter</div>
                  </div>
                  <div className="w-px h-10 bg-gray-100 dark:bg-gray-700" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{confirmedCount}</div>
                    <div className="text-xs text-gray-400">Confirmées</div>
                  </div>
                </div>
              ) : activeTab !== 'trajets' ? (
                <button
                  onClick={() => navigate('/travels/create')}
                  className="flex items-center gap-2 bg-[#0984E3] hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition mt-4 sm:mt-0 active:scale-95 shadow-sm cursor-pointer"
                >
                  <Plus size={16} />
                  Publier un Trajet
                </button>
              ) : null}
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
                          onClick={() => setConfirmDelete({ type: 'bulk' })}
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
                                          onClick={() => { setOpenMenuId(null); navigate(`/travel/${travel.id}`); }}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                        >
                                          <Eye size={14} /> Voir le détail
                                        </button>
                                        <button
                                          onClick={() => { setOpenMenuId(null); setConfirmDelete({ type: 'single', id: travel.id }); }}
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

            {/* ── GAINS TAB ───────────────────────────────────────── */}
            {activeTab === 'gains' && (
              <>
                {gainsError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">{gainsError}</div>
                )}

                {gainsLoading && <GainsSkeleton />}

                {!gainsLoading && !gainsError && gainsData && (
                  <div className="grid grid-cols-12 gap-6">

                    {/* ── LEFT ── */}
                    <div className="col-span-full lg:col-span-8 flex flex-col gap-6">

                      {/* Portefeuille */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700/60 p-5">
                        <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">Portefeuille</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            { Icon: Wallet,      label: 'Solde Total',  value: gainsData.solde_total, ring: 'text-[#0984E3]', bg: 'bg-blue-50 dark:bg-blue-950/30' },
                            { Icon: TrendingUp,  label: 'Total Gagné',  value: gainsData.total_gagne, ring: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-950/30' },
                            { Icon: Clock,       label: 'En attente',   value: gainsData.en_attente,  ring: 'text-gray-400',   bg: 'bg-gray-100 dark:bg-gray-700/40' },
                          ].map(({ Icon, label, value, ring, bg }) => (
                            <div key={label} className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-700/50 p-3">
                              <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                                <Icon size={20} className={ring} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{label}</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                  {Number(value).toLocaleString('fr-MA')} <span className="text-sm font-semibold text-gray-400">MAD</span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Suivi des Gains */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700/60">
                        <div className="px-5 pt-5">
                          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-3">Suivi des Gains</h2>
                          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60">
                            <div className="flex gap-6">
                              {[
                                { key: 'gains',       label: 'Gains' },
                                { key: 'trajets',     label: 'Trajets' },
                                { key: 'commissions', label: 'Commissions' },
                              ].map(({ key, label }) => (
                                <button
                                  key={key}
                                  onClick={() => setGainsMetric(key)}
                                  className={`pb-2.5 text-sm font-semibold border-b-2 -mb-px transition cursor-pointer ${
                                    gainsMetric === key
                                      ? 'border-[#0984E3] text-[#0984E3]'
                                      : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                            <div className="relative pb-2">
                              <select
                                value={gainsPeriod}
                                onChange={e => setGainsPeriod(e.target.value)}
                                className="appearance-none text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-7 py-1.5 focus:outline-none focus:border-[#0984E3] cursor-pointer"
                              >
                                <option>Mensuel</option>
                                <option>Hebdomadaire</option>
                                <option>Annuel</option>
                              </select>
                              <ChevronDown className="absolute right-2 top-2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                        <div className="px-1 pb-3">
                          <GainsAreaChart
                            data={gainsSeries[gainsMetric]}
                            labels={gainsSeriesLabels}
                            unit={gainsMetricUnit}
                            width={600}
                            height={260}
                          />
                        </div>
                      </div>

                      {/* Historique des Gains */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700/60 overflow-hidden">
                        <div className="px-5 pt-5 pb-3">
                          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">Historique des Gains</h2>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="table-auto w-full text-sm">
                            <thead className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide border-y border-gray-100 dark:border-gray-700/40">
                              <tr>
                                {['Client', 'Type', 'Statut', 'Montant', 'Date & Heure'].map(c => (
                                  <th key={c} className="px-5 py-3 text-left font-semibold whitespace-nowrap">{c}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
                              {gainsData.history.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/10 transition">
                                  <td className="px-5 py-3.5 font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">{row.client}</td>
                                  <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{row.type}</td>
                                  <td className="px-5 py-3.5 whitespace-nowrap">
                                    {row.status === 'paye' ? (
                                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Payé
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-500 dark:text-orange-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> En attente
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-5 py-3.5 font-bold text-[#0984E3] whitespace-nowrap">
                                    +{Number(row.amount).toLocaleString('fr-MA')}MAD
                                  </td>
                                  <td className="px-5 py-3.5 text-gray-400 dark:text-gray-500 whitespace-nowrap text-xs">
                                    {new Date(row.date).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </td>
                                </tr>
                              ))}
                              {gainsData.history.length === 0 && (
                                <tr>
                                  <td colSpan="5" className="text-center py-12 text-gray-400 dark:text-gray-500">
                                    <DollarSign size={32} className="mx-auto mb-2 opacity-30" />
                                    <p className="font-semibold text-sm">Aucun gain pour le moment</p>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* ── RIGHT ── */}
                    <div className="col-span-full lg:col-span-4 flex flex-col gap-6">

                      {/* Ma Carte ColiFlow */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700/60 p-5">
                        <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">Ma Carte ColiFlow</h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Card visual */}
                          <div className="relative w-full sm:w-48 aspect-[1.6] rounded-2xl bg-gradient-to-br from-[#0984E3] to-blue-700 p-4 text-white shadow-lg shrink-0 overflow-hidden">
                            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
                            <div className="absolute -right-2 top-8 w-20 h-20 rounded-full bg-white/5" />
                            <div className="flex flex-col h-full justify-between relative">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold opacity-90">ColiFlow Premium</span>
                                <CreditCard size={18} className="opacity-90" />
                              </div>
                              <div className="w-8 h-6 rounded-md bg-yellow-300/80" />
                              <div className="flex items-end justify-between">
                                <span className="text-sm font-mono tracking-widest">
                                  {gainsData.card.last4} •••• •••• 2005
                                </span>
                              </div>
                              <div className="text-[10px] uppercase tracking-wider opacity-80 truncate">
                                {gainsData.card.holder}
                              </div>
                            </div>
                          </div>
                          {/* Card stats */}
                          <div className="flex flex-col justify-center gap-2 flex-1">
                            <div className="flex items-baseline justify-between">
                              <span className="text-lg font-bold text-[#0984E3]">{Number(gainsData.card.solde_disponible).toLocaleString('fr-MA')} MAD</span>
                            </div>
                            <p className="text-xs text-gray-400 -mt-1.5">Solde Disponible</p>
                            <div className="flex items-baseline justify-between mt-1">
                              <span className="text-base font-bold text-green-600 dark:text-green-400">{Number(gainsData.card.revenus).toLocaleString('fr-MA')} MAD</span>
                            </div>
                            <p className="text-xs text-gray-400 -mt-1.5">Revenus</p>
                            <div className="flex items-baseline justify-between mt-1">
                              <span className="text-base font-bold text-gray-500 dark:text-gray-400">{Number(gainsData.card.commissions).toLocaleString('fr-MA')} MAD</span>
                            </div>
                            <p className="text-xs text-gray-400 -mt-1.5">Commissions</p>
                          </div>
                        </div>
                        <button className="w-full mt-4 bg-[#0984E3] hover:bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl transition cursor-pointer active:scale-[0.98]">
                          Demander un retrait
                        </button>
                      </div>

                      {/* Livraisons Prévues */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700/60 p-5">
                        <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">Livraisons Prévues</h2>
                        {Object.keys(upcomingByDate).length === 0 ? (
                          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                            <Calendar size={28} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Aucune livraison prévue.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-7">
                            {Object.entries(upcomingByDate).map(([day, items]) => (
                              <div key={day}>
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">{day}</p>
                                <div className="flex flex-col gap-4">
                                  {items.map(item => {
                                    const t = new Date(item.date);
                                    const hh = t.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                                    return (
                                      <div key={item.id} className="flex items-center gap-3 py-1">
                                        <div className="w-1 self-stretch rounded-full bg-[#0984E3]/70 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                            {hh} | Trajet
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                                            {item.from_city} → {item.to_city}
                                          </p>
                                        </div>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">{Number(item.price).toLocaleString('fr-MA')} MAD</span>
                                        <button
                                          onClick={() => setSearchParams({ tab: 'livraisons' })}
                                          className="text-xs font-semibold text-[#0984E3] border border-blue-200 dark:border-blue-900/50 rounded-lg px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition cursor-pointer whitespace-nowrap"
                                        >
                                          Voir Détails
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── LIVRAISONS TAB ──────────────────────────────────── */}
            {activeTab === 'livraisons' && (
              <div className="flex flex-col gap-5">

                {demandesError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{demandesError}</div>
                )}

                {demandesLoading && <LivraisonsSkeleton />}

                {!demandesLoading && !demandesError && (
                  <>
                    {/* Filter bar */}
                    <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700/60 px-5 py-3.5">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200 shrink-0">Filtres de Livraison</span>

                      {/* Travel selector */}
                      <div className="relative">
                        <select
                          value={livraisonsTravelFilter}
                          onChange={e => setLivraisonsTravelFilter(e.target.value)}
                          className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-[#0984E3] dark:text-gray-200 min-w-52 cursor-pointer"
                        >
                          <option value="all">Tous les trajets</option>
                          {livraisonsTravels.map(t => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>

                      {/* Date filter */}
                      <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700/50">
                        <Calendar size={14} className="text-gray-400 shrink-0" />
                        <input
                          type="date"
                          value={livraisonsDateFilter}
                          onChange={e => setLivraisonsDateFilter(e.target.value)}
                          className="text-xs text-gray-600 dark:text-gray-300 bg-transparent border-none outline-none w-40"
                        />
                      </div>

                      {/* Filters toggle */}
                      <button
                        onClick={() => { setLivraisonsTravelFilter('all'); setLivraisonsDateFilter(''); }}
                        className="ml-auto flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-gray-300 transition cursor-pointer"
                      >
                        <Filter size={15} />
                        Filters
                      </button>
                    </div>

                    {/* Empty state */}
                    {filteredLivraisons.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/60">
                        <Package size={40} className="mb-3 opacity-30" />
                        <p className="font-semibold">Aucune livraison en cours</p>
                        <p className="text-xs mt-1">Les colis acceptés apparaîtront ici une fois confirmés.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-5">
                        {filteredLivraisons.map(req => {
                          const sName = req.sender?.first_name && req.sender?.last_name
                            ? `${req.sender.first_name} ${req.sender.last_name}`
                            : req.sender?.name ?? 'Expéditeur';

                          const pkgName    = req.package?.package_name ?? '-';
                          const pkgSize    = req.package?.package_size;
                          const pkgPrice   = Number(req.package?.price ?? 0);
                          const commission = Math.round(pkgPrice * 0.1) || 10;
                          const gainNet    = pkgPrice - commission;
                          const pkgImage   = req.package?.images?.[0]?.path ?? null;
                          const toCity     = req.travel?.to_city?.name ?? req.package?.to_city?.name ?? '-';
                          const colisRef   = `EL-${String(req.package?.id ?? 0).padStart(7, '0')}`;
                          const isInTransit = req.status === 'in_transit';

                          const d = new Date(req.created_at);
                          const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
                          const recuLe = `${d.getDate()} ${MONTHS[d.getMonth()]}. ${d.getFullYear()}`;

                          return (
                            <div key={req.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700/60 overflow-hidden">

                              {/* ── Détails du Colis ── */}
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 px-6 pt-5 pb-5 border-b border-gray-100 dark:border-gray-700/40">
                                <div>
                                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-3">Détails du Colis</h3>
                                  <div className="flex flex-col gap-1.5 text-sm">
                                    {[
                                      { label: 'Référence Colis', value: colisRef },
                                      { label: 'Reçu le',         value: recuLe },
                                      { label: 'Nature',           value: req.package?.category ?? '-' },
                                    ].map(({ label, value }) => (
                                      <div key={label} className="flex items-center gap-2">
                                        <span className="text-gray-400 w-32 shrink-0">{label}</span>
                                        <span className="text-gray-300">:</span>
                                        <span className="text-gray-700 dark:text-gray-200 font-medium">{value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {!isInTransit && (
                                  <button
                                    onClick={() => setScannerOpenId(req.id)}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl bg-[#0984E3] hover:bg-blue-600 text-white transition cursor-pointer shrink-0 self-start active:scale-95"
                                  >
                                    <QrCode size={15} />
                                    Scanner Code-Barres
                                  </button>
                                )}
                              </div>

                              {/* ── Middle: Contenu + Destinataire ── */}
                              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-700/40">

                                {/* Contenu & Poids */}
                                <div className="p-6">
                                  <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">Contenu & Poids</h4>
                                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 mb-3">
                                    {pkgImage ? (
                                      <img
                                        src={`http://localhost:8000/storage/${pkgImage}`}
                                        alt={pkgName}
                                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
                                        <Package size={22} className="text-[#0984E3]" />
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{pkgName}</p>
                                      <p className="text-xs text-gray-400 mt-0.5">
                                        {SIZE_LABEL[Math.round(pkgSize)] ?? (pkgSize ? `${pkgSize} kg` : '-')}
                                      </p>
                                    </div>
                                  </div>
                                  {isInTransit ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                      En cours de livraison
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-100 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400">
                                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                      À récupérer
                                    </span>
                                  )}
                                </div>

                                {/* Destinataire & Contact */}
                                <div className="p-6">
                                  <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">Destinataire & Contact</h4>
                                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{sName}</span>
                                      <button className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-500 transition cursor-pointer">
                                        <Info size={12} />
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="text-gray-400 w-36 shrink-0">Téléphone :</span>
                                      <span className="text-gray-700 dark:text-gray-200">{req.sender?.phone ?? '-'}</span>
                                      {req.sender?.phone && <Phone size={14} className="text-green-500 shrink-0" />}
                                    </div>
                                    <div className="flex items-start gap-2 text-sm">
                                      <span className="text-gray-400 w-36 shrink-0">Adresse de Livraison :</span>
                                      <span className="text-gray-700 dark:text-gray-200 capitalize">{toCity}</span>
                                    </div>
                                    {req.message && (
                                      <div className="flex items-start gap-2 text-sm">
                                        <span className="text-gray-400 w-36 shrink-0">Note de l'expéditeur :</span>
                                        <span className="text-gray-600 dark:text-gray-300 italic">{req.message}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* ── Bottom: Gains + Confirmation ── */}
                              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-700/40 border-t border-gray-100 dark:border-gray-700/40">

                                {/* Gains du Voyageur */}
                                <div className="p-6">
                                  <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">Gains du Voyageur (MAD)</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-3">Paiement Espèces/En ligne</p>
                                  <div className="flex flex-col gap-2 text-sm">
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-400">Gain Net :</span>
                                      <span className="text-[#0984E3] font-bold">{gainNet.toLocaleString('fr-MA')} MAD</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-400">Détails de commission :</span>
                                      <span className="text-gray-500 dark:text-gray-400 font-medium">{commission} MAD</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Confirmation — code de récupération (accepted) ou finalisation (in_transit) */}
                                {isInTransit ? (
                                  <div className="p-6">
                                    <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">Finaliser la Livraison</h4>
                                    <div className="flex items-start gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
                                      <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                                      <span>Colis récupéré. Partagez votre position pour que l'expéditeur suive la livraison en direct.</span>
                                    </div>

                                    {/* Live position sharing toggle */}
                                    <button
                                      onClick={() => toggleShareLocation(req.id)}
                                      className={`w-full flex items-center justify-center gap-2 py-2.5 mb-3 text-sm font-bold rounded-xl transition cursor-pointer active:scale-[0.98] border ${
                                        sharingIds.includes(req.id)
                                          ? 'bg-blue-50 border-blue-200 text-[#0984E3] dark:bg-blue-950/20 dark:border-blue-900'
                                          : 'bg-white border-gray-200 text-gray-600 hover:border-[#0984E3] hover:text-[#0984E3] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                                      }`}
                                    >
                                      {sharingIds.includes(req.id) ? (
                                        <>
                                          <span className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0984E3] opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0984E3]" />
                                          </span>
                                          Position partagée — Arrêter
                                        </>
                                      ) : (
                                        <><Navigation size={15} /> Partager ma position</>
                                      )}
                                    </button>

                                    <button
                                      onClick={() => handleMarkDelivered(req.id)}
                                      disabled={confirmLoading[req.id]}
                                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition cursor-pointer disabled:opacity-60 active:scale-[0.98]"
                                    >
                                      {confirmLoading[req.id] ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      ) : (
                                        <><CheckCircle size={16} /> Marquer comme livré</>
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="p-6">
                                    <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">Confirmation de Récupération</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Saisissez le code reçu par l'expéditeur :</p>
                                    <div className="relative mb-3">
                                      <input
                                        type={showConfirmCode[req.id] ? 'text' : 'password'}
                                        value={confirmCodes[req.id] ?? ''}
                                        onChange={e => setConfirmCodes(prev => ({ ...prev, [req.id]: e.target.value }))}
                                        onKeyDown={e => { if (e.key === 'Enter') handleVerifyCode(req.id); }}
                                        placeholder="Saisir le code du client"
                                        className="w-full px-4 py-2.5 pr-10 text-sm bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-[#0984E3] dark:text-gray-200 placeholder:text-gray-400 uppercase tracking-widest font-mono"
                                      />
                                      <button
                                        onClick={() => setShowConfirmCode(prev => ({ ...prev, [req.id]: !prev[req.id] }))}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                                      >
                                        {showConfirmCode[req.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => handleVerifyCode(req.id)}
                                      disabled={confirmLoading[req.id]}
                                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0984E3] hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition cursor-pointer disabled:opacity-60 active:scale-[0.98]"
                                    >
                                      {confirmLoading[req.id] ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      ) : (
                                        <>Confirmer la récupération <ArrowRight size={16} /></>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── DEMANDES TAB ────────────────────────────────────── */}
            {activeTab === 'demandes' && (
              <div className="flex flex-col gap-5">

                {demandesError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                    {demandesError}
                  </div>
                )}

                {demandesLoading && <DemandesSkeleton />}

                {!demandesLoading && !demandesError && (
                  <>
                    {/* Toolbar row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700/60 px-5 py-3.5">

                      {/* Sub-tabs */}
                      <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl p-1 shrink-0">
                        {[
                          { key: 'pending',   label: 'En attente', count: pendingCount,   activeClass: 'bg-orange-100 text-orange-600' },
                          { key: 'confirmed', label: 'Confirmées', count: confirmedCount, activeClass: 'bg-green-100 text-green-600' },
                        ].map(({ key, label, count, activeClass }) => (
                          <button
                            key={key}
                            onClick={() => { setDemandesSubTab(key); setDemandesPage(1); }}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                              demandesSubTab === key
                                ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-xs'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                          >
                            {label}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                              demandesSubTab === key
                                ? activeClass
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                            }`}>
                              {count}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Right controls */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Search */}
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="Rechercher un expéditeur ou une ville..."
                            value={demandesSearch}
                            onChange={e => { setDemandesSearch(e.target.value); setDemandesPage(1); }}
                            className="pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-[#0984E3] dark:text-gray-200 w-52"
                          />
                        </div>

                        {/* Date range */}
                        <div className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500">
                          <Calendar size={14} className="text-gray-400 shrink-0" />
                          <input
                            type="date"
                            value={demandesDateFrom}
                            onChange={e => { setDemandesDateFrom(e.target.value); setDemandesPage(1); }}
                            className="text-xs text-gray-600 dark:text-gray-300 bg-transparent border-none outline-none w-28"
                          />
                          <span className="text-gray-300 select-none">–</span>
                          <input
                            type="date"
                            value={demandesDateTo}
                            onChange={e => { setDemandesDateTo(e.target.value); setDemandesPage(1); }}
                            className="text-xs text-gray-600 dark:text-gray-300 bg-transparent border-none outline-none w-28"
                          />
                        </div>

                        {/* Refresh */}
                        <button
                          onClick={fetchDemandes}
                          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:text-[#0984E3] hover:border-blue-300 transition cursor-pointer"
                        >
                          <RefreshCw size={15} />
                        </button>

                        {/* Publier un Trajet */}
                        <Link
                          to="/travels/create"
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg bg-[#0984E3] hover:bg-blue-600 active:scale-95 text-white shadow-sm transition cursor-pointer"
                        >
                          <Plus size={15} />
                          Publier un Trajet
                        </Link>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-gray-700/60 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="table-auto w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-700/30 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            <tr>
                              {['Reçu le', 'Expéditeur', 'Colis', 'Trajet', 'Poids & Prix', 'Décision'].map(col => (
                                <th key={col} className="px-4 py-3.5 text-left font-semibold whitespace-nowrap">{col}</th>
                              ))}
                              <th className="px-4 py-3.5 w-10" />
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/40">
                            {paginatedDemandes.map(req => {
                              const sName = req.sender?.first_name && req.sender?.last_name
                                ? `${req.sender.first_name} ${req.sender.last_name}`
                                : req.sender?.name ?? 'Expéditeur';
                              const fromCity = req.travel?.from_city?.name ?? '-';
                              const toCity   = req.travel?.to_city?.name   ?? '-';
                              const pkgName  = req.package?.package_name   ?? '-';
                              const pkgCat   = req.package?.category       ?? '';
                              const pkgSize  = req.package?.package_size;
                              const pkgPrice = req.package?.price;

                              const isAccepting = actionLoading[req.id] === 'accepted';
                              const isRejecting = actionLoading[req.id] === 'rejected';

                              const d = new Date(req.created_at);
                              const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
                              const formattedDate = `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;

                              return (
                                <tr key={req.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/10 transition group">

                                  {/* Reçu le */}
                                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                                    {formattedDate}
                                  </td>

                                  {/* Expéditeur */}
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2.5">
                                      <img
                                        src={
                                          req.sender?.profile_picture
                                            ? req.sender.profile_picture
                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(sName)}&background=0984E3&color=fff`
                                        }
                                        alt={sName}
                                        className="w-8 h-8 rounded-full object-cover shrink-0"
                                      />
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{sName}</span>
                                    </div>
                                  </td>

                                  {/* Colis */}
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{pkgName}</span>
                                      {pkgCat && (
                                        <span className="text-xs text-gray-400 dark:text-gray-500">{pkgCat}</span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Trajet */}
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-1 text-gray-700 dark:text-gray-200 font-medium text-sm">
                                      <span className="capitalize">{fromCity}</span>
                                      <ArrowRight size={13} className="text-gray-300 shrink-0" />
                                      <span className="capitalize">{toCity}</span>
                                    </div>
                                  </td>

                                  {/* Poids & Prix */}
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                    {SIZE_LABEL[Math.round(pkgSize)] ?? (pkgSize ? `${pkgSize} kg` : '-')}
                                    {pkgPrice != null && (
                                      <span className="text-gray-400"> / {Number(pkgPrice).toLocaleString('fr-MA')} MAD</span>
                                    )}
                                  </td>

                                  {/* Décision */}
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    {req.status === 'pending' ? (
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          onClick={() => handleDecision(req.id, 'accepted')}
                                          disabled={isAccepting || isRejecting}
                                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-green-50 text-green-600 hover:bg-green-500 hover:text-white border border-green-200 hover:border-green-500 disabled:opacity-50 transition cursor-pointer"
                                        >
                                          {isAccepting ? (
                                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                          ) : (
                                            <Check size={12} />
                                          )}
                                          Accepter
                                        </button>
                                        <button
                                          onClick={() => handleDecision(req.id, 'rejected')}
                                          disabled={isAccepting || isRejecting}
                                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-200 hover:border-red-500 disabled:opacity-50 transition cursor-pointer"
                                        >
                                          {isRejecting ? (
                                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                          ) : (
                                            <X size={12} />
                                          )}
                                          Refuser
                                        </button>
                                      </div>
                                    ) : req.status === 'accepted' ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600 dark:bg-green-950/20 dark:text-green-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        Confirmé
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-500 dark:bg-red-950/20 dark:text-red-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        Refusé
                                      </span>
                                    )}
                                  </td>

                                  {/* Eye icon */}
                                  <td className="px-4 py-3">
                                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-[#0984E3] hover:bg-blue-50 dark:hover:bg-blue-950/20 transition opacity-0 group-hover:opacity-100 cursor-pointer">
                                      <Eye size={16} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}

                            {filteredDemandes.length === 0 && (
                              <tr>
                                <td colSpan="7" className="text-center py-16 text-gray-400 dark:text-gray-500">
                                  <Package size={36} className="mx-auto mb-3 opacity-30" />
                                  <p className="font-semibold">Aucune demande</p>
                                  <p className="text-xs mt-1">
                                    {demandesSubTab === 'pending'
                                      ? "Vous n'avez aucune demande en attente."
                                      : 'Aucune demande confirmée pour le moment.'}
                                  </p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Footer: items-per-page + range + pagination */}
                      {filteredDemandes.length > 0 && (
                        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>Items per page</span>
                              <select
                                value={demandesPerPage}
                                onChange={e => { setDemandesPerPage(Number(e.target.value)); setDemandesPage(1); }}
                                className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#0984E3] cursor-pointer"
                              >
                                {[10, 13, 20, 30].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {(demandesPage - 1) * demandesPerPage + 1} – {Math.min(demandesPage * demandesPerPage, filteredDemandes.length)} of {filteredDemandes.length} items
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setDemandesPage(p => Math.max(1, p - 1))}
                              disabled={demandesPage === 1}
                              className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                            >
                              {'<'}
                            </button>
                            {(() => {
                              const total = demandesPageCount;
                              const cur   = demandesPage;
                              const window = 5;
                              const start = Math.max(1, Math.min(cur - Math.floor(window / 2), total - window + 1));
                              const end   = Math.min(total, start + window - 1);
                              return Array.from({ length: end - start + 1 }, (_, i) => start + i).map(p => (
                                <button
                                  key={p}
                                  onClick={() => setDemandesPage(p)}
                                  className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-semibold transition cursor-pointer ${
                                    demandesPage === p
                                      ? 'bg-[#0984E3] text-white shadow'
                                      : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                  }`}
                                >
                                  {String(p).padStart(2, '0')}
                                </button>
                              ));
                            })()}
                            <button
                              onClick={() => setDemandesPage(p => Math.min(demandesPageCount, p + 1))}
                              disabled={demandesPage === demandesPageCount}
                              className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs"
                            >
                              {'>'}
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

      {/* Barcode scanner modal (livraisons) */}
      <BarcodeScannerModal
        open={scannerOpenId !== null}
        onClose={() => setScannerOpenId(null)}
        onScan={(code) => {
          setConfirmCodes(prev => ({ ...prev, [scannerOpenId]: code }));
          setShowConfirmCode(prev => ({ ...prev, [scannerOpenId]: true }));
          setTimeout(() => setScannerOpenId(null), 900);
        }}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => { if (!o) setConfirmDelete(null); }}
        onConfirm={handleConfirmDelete}
        title={confirmDelete?.type === 'bulk' ? 'Supprimer les trajets sélectionnés ?' : 'Supprimer ce trajet ?'}
        description={
          confirmDelete?.type === 'bulk'
            ? `Cette action est irréversible. ${selectedRows.length} trajet(s) seront définitivement supprimés.`
            : 'Cette action est irréversible. Ce trajet sera définitivement supprimé.'
        }
      />
    </div>
  );
}
