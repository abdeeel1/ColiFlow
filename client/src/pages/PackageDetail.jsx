import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion as Motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Package as PackageIcon, MapPin, Calendar,
  Weight, Tag, DollarSign, Clock, Truck, User, MessageSquare, Loader,
} from 'lucide-react';
import Sidebar from '../partials/Sidebar';
import TravelerSidebar from '../partials/TravelerSidebar';
import Header from '../partials/Header';
import axiosClient from '../services/axios';

const CAT_LABEL = {
  electronique: 'Électronique', documents: 'Documents',
  mode: 'Mode', maison: 'Maison', autre: 'Autre',
};

const imgUrl = (path) => `http://localhost:8000/storage/${path}`;

const isInTransit = (pkg) => (pkg?.travel_requests?.length ?? 0) > 0;

function InfoTile({ icon, label, value }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-4 flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-sm font-bold text-gray-800 dark:text-gray-100 capitalize">{value}</span>
    </div>
  );
}

export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const isTraveler = !!user?.is_traveler;

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    axiosClient.get(`/api/packages/${id}`)
      .then((r) => setPkg(r.data))
      .catch((e) => setError(e?.response?.status === 403 ? 'Accès non autorisé à ce colis.' : 'Colis introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  const images = pkg?.images ?? [];
  const transit = isInTransit(pkg);
  const carrier = pkg?.travel_requests?.[0]?.travel?.user ?? null;
  const status = transit
    ? { label: 'En transit', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-600' }
    : { label: 'En attente', dot: 'bg-orange-400', badge: 'bg-orange-100 text-orange-600' };

  return (
    <div className="flex h-screen overflow-hidden">
      {isTraveler
        ? <TravelerSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        : <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-5xl mx-auto">

            {/* Back */}
            <Link
              to="/sender/dashboard?tab=expedition"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0984E3] transition mb-6"
            >
              <ArrowLeft size={16} /> Retour à mes colis
            </Link>

            {loading && (
              <div className="flex items-center justify-center h-64 text-gray-400 gap-3">
                <Loader size={22} className="animate-spin" /> Chargement…
              </div>
            )}

            {!loading && error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-10 text-center">
                <PackageIcon size={36} className="mx-auto mb-3 opacity-40" />
                <p className="font-semibold">{error}</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-sm text-[#0984E3] hover:underline font-semibold">
                  Revenir en arrière
                </button>
              </div>
            )}

            {!loading && !error && pkg && (
              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* LEFT — images + title */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <div className="bg-white dark:bg-gray-800 shadow-xs rounded-2xl overflow-hidden">
                    {images.length > 0 ? (
                      <img
                        src={imgUrl(images[selectedImage]?.path)}
                        alt={pkg.package_name}
                        className="w-full h-72 object-cover"
                      />
                    ) : (
                      <div className="w-full h-72 bg-linear-to-br from-blue-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <PackageIcon size={56} className="text-[#0984E3]/40" />
                      </div>
                    )}

                    {images.length > 1 && (
                      <div className="flex gap-3 p-4 overflow-x-auto no-scrollbar">
                        {images.map((img, i) => (
                          <img
                            key={i}
                            src={imgUrl(img.path)}
                            alt=""
                            onClick={() => setSelectedImage(i)}
                            className={`w-20 h-16 rounded-xl object-cover cursor-pointer shrink-0 transition ${
                              selectedImage === i ? 'ring-2 ring-[#0984E3]' : 'opacity-70 hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white dark:bg-gray-800 shadow-xs rounded-2xl p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="font-mono text-xs font-semibold text-gray-400 mb-1">
                          #CF-{String(pkg.id).padStart(3, '0')}
                        </p>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{pkg.package_name}</h1>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${status.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-200 mb-5 capitalize">
                      <MapPin size={18} className="text-[#0984E3]" />
                      {pkg.from_city?.name ?? '—'}
                      <ArrowRight size={16} className="text-gray-300" />
                      {pkg.to_city?.name ?? '—'}
                    </div>

                    {pkg.description && (
                      <div className="mb-5">
                        <p className="text-xs font-semibold uppercase text-gray-400 mb-1.5">Description</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{pkg.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <InfoTile icon={<Tag size={14} />} label="Catégorie" value={CAT_LABEL[pkg.category] ?? pkg.category ?? '—'} />
                      <InfoTile icon={<Weight size={14} />} label="Poids" value={`${pkg.package_size} kg`} />
                      <InfoTile icon={<Clock size={14} />} label="Urgence" value={(pkg.urgency ?? '—').replace('_', ' ')} />
                      <InfoTile
                        icon={<Calendar size={14} />}
                        label="Date d'envoi"
                        value={new Date(pkg.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      />
                      {pkg.date_delivery && (
                        <InfoTile
                          icon={<Truck size={14} />}
                          label="Livraison prévue"
                          value={new Date(pkg.date_delivery).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT — price + carrier */}
                <div className="flex flex-col gap-6">
                  <div className="bg-white dark:bg-gray-800 shadow-xs rounded-2xl p-6">
                    <p className="text-xs font-semibold uppercase text-gray-400 mb-1 flex items-center gap-1.5">
                      <DollarSign size={14} /> Prix du transport
                    </p>
                    <p className="text-4xl font-bold text-[#0984E3]">
                      {Number(pkg.price).toLocaleString('fr-MA')} <span className="text-lg">DH</span>
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 shadow-xs rounded-2xl p-6">
                    <p className="text-xs font-semibold uppercase text-gray-400 mb-3">Voyageur</p>
                    {carrier ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={carrier.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(carrier.name ?? '?')}&background=0984E3&color=fff`}
                            alt={carrier.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{carrier.name}</p>
                            <p className="text-xs text-green-500 font-medium">A accepté votre colis</p>
                          </div>
                        </div>
                        <Link
                          to="/messages"
                          className="flex items-center justify-center gap-2 w-full bg-[#0984E3] hover:bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl transition"
                        >
                          <MessageSquare size={16} /> Contacter le voyageur
                        </Link>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center gap-2 py-4 text-gray-400">
                        <User size={32} className="opacity-30" />
                        <p className="text-sm">Aucun voyageur n'a encore pris en charge ce colis.</p>
                      </div>
                    )}
                  </div>
                </div>
              </Motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
