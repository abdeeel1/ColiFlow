import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminSidebar from '../partials/AdminSidebar';
import Header from '../partials/Header';
import axiosClient from '../services/axios';
import WeeklyBarChart from '@/charts/Weeklybarchart ';
import ValidationList from './admin/ValidationList';
import ValidationExam from './admin/ValidationExam';
import MembersList from './admin/MembersList';
import TrajetsList from './admin/TrajetsList';
import ColisList from './admin/ColisList';
import CommissionsList from './admin/CommissionsList';
import SettingsList from './admin/SettingsList';
import ReclamationsList from './admin/ReclamationsList';
import {
  Users, Package, DollarSign, Star, TrendingUp,
  ShieldCheck, AlertTriangle, Car, ChevronRight, Construction,
} from 'lucide-react';

// ── page headers per tab ───────────────────────────────────────────────────
const PAGE_HEADER = {
  apercu:       { title: 'Tableau de Bord Administrateur', subtitle: 'Pilotez la plateforme ColiFlow : membres, logistique, finances et santé du système.' },
  documents:    { title: 'Vérification des Documents',     subtitle: 'Validez les pièces justificatives des nouveaux membres.' },
  vehicules:    { title: 'Approbation des Véhicules',       subtitle: 'Contrôlez et approuvez les véhicules des voyageurs.' },
  membres:      { title: 'Gestion des Membres',             subtitle: 'Gérez les comptes utilisateurs, modérez les profils et surveillez l\'activité de la communauté ColiFlow.' },
  trajets:      { title: 'Trajets en Circulation',          subtitle: 'Supervisez tous les trajets actifs de la plateforme en temps réel.' },
  colis:        { title: 'Suivi des Livraisons',            subtitle: 'Vue globale de tous les colis en circulation.' },
  transactions: { title: 'Transactions',                    subtitle: 'Suivez les paiements et mouvements financiers.' },
  commissions:  { title: 'Commissions',                     subtitle: 'Configurez et suivez les commissions ColiFlow.' },
  config:       { title: 'Configuration Système',           subtitle: 'Paramètres généraux de la plateforme.' },
  reclamations: { title: 'Réclamations',                    subtitle: 'Traitez les litiges signalés par les expéditeurs et les voyageurs.' },
};

const STEP_CONFIG = {
  document: { Icon: ShieldCheck,   color: '#0984E3', bg: '#0984E320' },
  litige:   { Icon: AlertTriangle, color: '#E17055', bg: '#E1705520' },
  vehicule: { Icon: Car,           color: '#F39C12', bg: '#F39C1220' },
};

const DOC_STATUS = {
  attente: { label: 'En attente', cls: 'text-orange-500' },
  valide:  { label: 'Validé',     cls: 'text-green-500' },
  refuse:  { label: 'Refusé',     cls: 'text-red-500' },
};

// ── formatters ──────────────────────────────────────────────────────────────
const fmtNumber = (n) => Number(n || 0).toLocaleString('fr-FR');
const fmtCompact = (n) => {
  const v = Number(n || 0);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(1).replace('.0', '')}K`;
  return fmtNumber(v);
};
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');

// ── stat card (mirrors the sender/traveler dashboards) ──────────────────────
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

// ── skeleton ────────────────────────────────────────────────────────────────
const Shimmer = ({ className = '' }) => (
  <div className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`} />
);
const SkelCard = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-xs rounded-xl ${className}`}>{children}</div>
);

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-full lg:col-span-8 flex flex-col gap-6">
        <SkelCard className="p-5">
          <Shimmer className="h-3 w-40 mb-4" />
          <Shimmer className="h-10 w-24 mb-3" />
          <Shimmer className="h-3 w-48 mb-6" />
          <div className="flex items-end gap-2 h-24">
            {[55, 80, 40, 95, 65, 75, 50, 90, 60, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t animate-pulse" style={{ height: `${h}%` }} />
            ))}
          </div>
        </SkelCard>
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
        <SkelCard className="overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
            <Shimmer className="h-4 w-56" />
            <Shimmer className="h-4 w-16" />
          </div>
          <div className="p-4 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <Shimmer className="h-4 w-32" />
                <Shimmer className="h-4 w-28" />
                <Shimmer className="h-4 w-20" />
                <Shimmer className="h-4 w-16" />
              </div>
            ))}
          </div>
        </SkelCard>
      </div>
      <div className="col-span-full lg:col-span-4 flex flex-col gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkelCard key={i} className="p-5">
            <Shimmer className="h-3 w-36 mb-4" />
            <Shimmer className="h-9 w-28 mb-2" />
            <Shimmer className="h-3 w-40 mb-5" />
            <Shimmer className="h-10 w-full rounded-xl" />
          </SkelCard>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'apercu';
  const dossier = searchParams.get('dossier');
  const header = PAGE_HEADER[activeTab] ?? PAGE_HEADER.apercu;

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (activeTab !== 'apercu') return;
    setLoading(true);
    axiosClient.get('/api/admin/dashboard')
      .then((r) => setData(r.data))
      .catch((e) => setError(e?.response?.data?.message ?? 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const weeklySignups  = data?.weekly_signups?.length ? data.weekly_signups : Array(10).fill(0);
  const docVerifs      = data?.doc_verifications ?? [];
  const nextSteps      = data?.next_steps ?? [];
  const systemHealth   = data?.system_health ?? [];

  // Build & download a PDF report with every metric on this dashboard.
  const downloadReport = () => {
    const doc = new jsPDF();
    const BLUE = [9, 132, 227];
    const today = new Date().toLocaleDateString('fr-FR');

    doc.setFontSize(18);
    doc.setTextColor(...BLUE);
    doc.text('ColiFlow - Rapport Administrateur', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Genere le ${today}`, 14, 27);

    autoTable(doc, {
      startY: 34,
      head: [['Indicateur', 'Valeur']],
      body: [
        ['Croissance des inscriptions', `${data?.growth_percent >= 0 ? '+' : ''}${data?.growth_percent ?? 0}%`],
        ['Utilisateurs totaux', fmtNumber(data?.total_users)],
        ['Flux colis', fmtNumber(data?.flux_colis)],
        ["Chiffre d'affaires", `${fmtNumber(data?.chiffre_affaires)} MAD`],
        ['Taux de succes', `${data?.taux_succes ?? 0}%`],
        ['Revenus a encaisser', `${fmtNumber(data?.revenue_to_collect)} MAD`],
      ],
      headStyles: { fillColor: BLUE },
      theme: 'striped',
    });

    if (systemHealth.length) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        head: [['Sante Systeme', 'Etat']],
        body: systemHealth.map((h) => [h.label, `${h.value} ${h.ok ? '(OK)' : '(Alerte)'}`]),
        headStyles: { fillColor: BLUE },
        theme: 'grid',
      });
    }

    if (nextSteps.length) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        head: [['Prochaines etapes', 'Detail']],
        body: nextSteps.map((s) => [s.title, s.sub]),
        headStyles: { fillColor: BLUE },
        theme: 'grid',
      });
    }

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [['Utilisateur', 'Document', 'Date', 'Statut']],
      body: docVerifs.length
        ? docVerifs.map((r) => [r.user, r.doc, fmtDate(r.date), (DOC_STATUS[r.status] ?? DOC_STATUS.attente).label])
        : [['-', '-', '-', 'Aucune verification']],
      headStyles: { fillColor: BLUE },
      theme: 'striped',
    });

    doc.save(`coliflow-rapport-admin-${today.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

            {/* Title (validation, membres, logistique & finance tabs render their own header) */}
            {activeTab !== 'validation' && activeTab !== 'membres' && activeTab !== 'trajets' && activeTab !== 'colis' && activeTab !== 'commissions' && activeTab !== 'config' && activeTab !== 'reclamations' && (
              <div className="sm:flex sm:justify-between sm:items-center mb-8">
                <div>
                  <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-1">
                    {header.title}
                  </h1>
                  <p className="text-sm text-gray-500">{header.subtitle}</p>
                </div>
              </div>
            )}

            {/* ── CENTRE DE VALIDATION ───────────────────────────────────── */}
            {activeTab === 'validation' && (
              dossier ? <ValidationExam /> : <ValidationList />
            )}

            {/* ── GESTION DES MEMBRES ────────────────────────────────────── */}
            {activeTab === 'membres' && <MembersList />}

            {/* ── LOGISTIQUE GLOBALE ─────────────────────────────────────── */}
            {activeTab === 'trajets' && <TrajetsList />}
            {activeTab === 'colis'   && <ColisList />}

            {/* ── FINANCES & COMMISSIONS ─────────────────────────────────── */}
            {activeTab === 'commissions' && <CommissionsList />}

            {/* ── CONFIGURATION SYSTÈME ──────────────────────────────────── */}
            {activeTab === 'config' && <SettingsList />}

            {/* ── RÉCLAMATIONS ───────────────────────────────────────────── */}
            {activeTab === 'reclamations' && <ReclamationsList />}

            {/* Error State */}
            {activeTab === 'apercu' && error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">
                {error}
              </div>
            )}

            {/* ── DASHBOARD (apercu) ─────────────────────────────────────── */}
            {activeTab === 'apercu' ? (
              loading ? (
                <DashboardSkeleton />
              ) : !error && (
              <div className="grid grid-cols-12 gap-6">

                {/* LEFT column */}
                <div className="col-span-full lg:col-span-8 flex flex-col gap-6">

                  {/* Platform growth chart */}
                  <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xs rounded-xl overflow-hidden">
                    <div className="px-5 pt-5 pb-2">
                      <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3">
                        Croissance de la Plateforme
                      </h2>
                      <div className="flex items-start gap-6">
                        <div className="flex flex-col gap-2 min-w-40">
                          <div className="flex items-center gap-2 text-3xl font-bold text-[#0984E3]">
                            <TrendingUp size={24} className="text-[#0984E3]" />
                            {data?.growth_percent >= 0 ? '+' : ''}{data?.growth_percent ?? 0}%
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">d'inscriptions</span>
                          <button
                            onClick={downloadReport}
                            className="text-sm text-[#0984E3] hover:underline font-medium mt-2 text-left w-fit cursor-pointer"
                          >
                            Télécharger le rapport (PDF) →
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grow">
                      <WeeklyBarChart data={weeklySignups} width={600} height={148} />
                    </div>
                  </div>

                  {/* Stat tiles */}
                  <div className="grid grid-cols-12 gap-6">
                    <StatCard
                      icon={<Users className="w-5 h-5 text-[#0984E3]" />}
                      label="Utilisateurs Totaux"
                      value={fmtNumber(data?.total_users)}
                      barColor="#0984E3"
                    />
                    <StatCard
                      icon={<Package className="w-5 h-5 text-[#F39C12]" />}
                      label="Flux Colis"
                      value={fmtNumber(data?.flux_colis)}
                      barColor="#F39C12"
                    />
                    <StatCard
                      icon={<DollarSign className="w-5 h-5 text-[#00B894]" />}
                      label="Chiffre d'Affaires"
                      value={fmtCompact(data?.chiffre_affaires)}
                      barColor="#00B894"
                    />
                    <StatCard
                      icon={<Star className="w-5 h-5 text-[#F39C12]" />}
                      label="Taux de Succès"
                      value={`${data?.taux_succes ?? 0}%`}
                      barColor="#F39C12"
                    />
                  </div>

                  {/* Document verifications table */}
                  <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xs rounded-xl overflow-hidden">
                    <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                      <h2 className="font-semibold text-gray-800 dark:text-gray-100">Dernières Vérifications de Documents</h2>
                      <Link to="/admin/dashboard?tab=validation" className="text-sm text-[#0984E3] hover:underline font-bold">Voir tout →</Link>
                    </header>
                    <div className="p-3">
                      <div className="overflow-x-auto">
                        <table className="table-auto w-full dark:text-gray-300">
                          <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/20">
                            <tr>
                              <th className="p-2 whitespace-nowrap text-left font-semibold">Utilisateur</th>
                              <th className="p-2 whitespace-nowrap text-left font-semibold">Document</th>
                              <th className="p-2 whitespace-nowrap text-left font-semibold">Date</th>
                              <th className="p-2 whitespace-nowrap text-left font-semibold">Statut</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
                            {docVerifs.map((row, i) => {
                              const s = DOC_STATUS[row.status] ?? DOC_STATUS.attente;
                              return (
                                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/5 transition">
                                  <td className="p-2 whitespace-nowrap font-medium text-gray-800 dark:text-gray-100">{row.user}</td>
                                  <td className="p-2 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-300">
                                      {row.doc}
                                    </span>
                                  </td>
                                  <td className="p-2 whitespace-nowrap text-gray-500 dark:text-gray-400">{fmtDate(row.date)}</td>
                                  <td className={`p-2 whitespace-nowrap font-semibold ${s.cls}`}>{s.label}</td>
                                </tr>
                              );
                            })}
                            {docVerifs.length === 0 && (
                              <tr>
                                <td colSpan="4" className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
                                  Aucune vérification de document pour l'instant.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT column */}
                <div className="col-span-full lg:col-span-4 flex flex-col gap-6">

                  {/* Revenue to collect */}
                  <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xs rounded-xl p-5">
                    <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3">
                      Revenus à Encaisser (MAD)
                    </h2>
                    <div className="text-4xl font-bold text-[#00B894] mb-1">{fmtNumber(data?.revenue_to_collect)} MAD</div>
                    <div className="text-sm text-gray-400 mb-5">Paiements Stripe en attente</div>
                    <button className="w-full bg-[#0984E3] hover:bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl transition cursor-pointer">
                      Transférer vers le Compte
                    </button>
                  </div>

                  {/* Next steps */}
                  <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xs rounded-xl p-5">
                    <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3">
                      Prochaines étapes
                    </h2>
                    {nextSteps.length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500">Aucune action en attente.</p>
                    ) : (
                      <ul className="flex flex-col divide-y divide-gray-100 dark:divide-gray-700/60">
                        {nextSteps.map((step, i) => {
                          const cfg = STEP_CONFIG[step.type] ?? STEP_CONFIG.document;
                          return (
                            <li key={i} className="flex items-center justify-between py-3 gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                                  <cfg.Icon size={18} style={{ color: cfg.color }} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">{step.title}</p>
                                  <p className="text-xs text-gray-400 truncate">{step.sub}</p>
                                </div>
                              </div>
                              <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                <ChevronRight size={16} className="text-gray-400" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {/* System health */}
                  <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xs rounded-xl p-5">
                    <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-3">
                      Santé Système
                    </h2>
                    <ul className="flex flex-col gap-3.5">
                      {systemHealth.map((item) => (
                        <li key={item.label} className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                          <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                            {item.value}
                            <span className={`w-2 h-2 rounded-full ${item.ok ? 'bg-green-500' : 'bg-red-500'}`} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
              )
            ) : (activeTab === 'validation' || activeTab === 'membres' || activeTab === 'trajets' || activeTab === 'colis' || activeTab === 'commissions' || activeTab === 'config' || activeTab === 'reclamations') ? null : (
              /* ── PLACEHOLDER for sections we'll build in the next steps ─── */
              <div className="flex flex-col bg-white dark:bg-gray-800 shadow-xs rounded-xl p-12 items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Construction size={30} className="text-[#0984E3]" />
                </div>
                <p className="text-gray-700 dark:text-gray-200 font-semibold">{header.title}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm">
                  Cette section sera construite à la prochaine étape.
                </p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
