import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import axiosClient from '../../services/axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  ArrowLeft, Check, X, FileText, Car, User,
  CheckCircle2, XCircle, Clock, BadgeCheck,
} from 'lucide-react';

const STATUS = {
  approuve: { label: 'Approuvé',   Icon: CheckCircle2, cls: 'text-green-600 bg-green-100 dark:bg-green-950/20 dark:text-green-400' },
  attente:  { label: 'En attente', Icon: Clock,        cls: 'text-orange-600 bg-orange-100 dark:bg-orange-950/20 dark:text-orange-400' },
  rejete:   { label: 'Rejeté',     Icon: XCircle,      cls: 'text-red-600 bg-red-100 dark:bg-red-950/20 dark:text-red-400' },
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

const StatusBadge = ({ status }) => {
  const s = STATUS[status] ?? STATUS.attente;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${s.cls}`}>
      <s.Icon size={13} /> {s.label}
    </span>
  );
};

const Field = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 py-1.5">
    <span className="text-sm text-gray-400 dark:text-gray-500">{label}</span>
    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 text-right">{value || '—'}</span>
  </div>
);

function DocPreview({ label, url }) {
  const isPdf = url && url.toLowerCase().endsWith('.pdf');
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">{label}</span>
      {url ? (
        isPdf ? (
          <a href={url} target="_blank" rel="noreferrer"
             className="flex items-center justify-center gap-2 h-40 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30 text-[#0984E3] hover:bg-blue-50 dark:hover:bg-blue-950/20 transition">
            <FileText size={20} /> Ouvrir le PDF
          </a>
        ) : (
          <a href={url} target="_blank" rel="noreferrer" className="block group">
            <img src={url} alt={label} className="h-40 w-full object-cover rounded-xl border border-gray-200 dark:border-gray-700 group-hover:opacity-90 transition" />
          </a>
        )
      ) : (
        <div className="flex items-center justify-center h-40 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/20 text-xs text-gray-400">
          Non fourni
        </div>
      )}
    </div>
  );
}

// Approve / reject buttons for one verification track.
function TrackActions({ status, onApprove, onReject }) {
  return (
    <div className="flex gap-2 shrink-0">
      <button
        onClick={onApprove}
        disabled={status === 'approuve'}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg bg-green-500 hover:bg-green-600 active:scale-95 text-white shadow-sm transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Check size={16} /> Approuver
      </button>
      <button
        onClick={onReject}
        disabled={status === 'rejete'}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg bg-red-500 hover:bg-red-600 active:scale-95 text-white shadow-sm transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <X size={16} /> Rejeter
      </button>
    </div>
  );
}

export default function ValidationExam() {
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('dossier');

  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [confirm, setConfirm] = useState(null); // { action, category }

  const fetchDossier = useCallback(() => {
    setLoading(true);
    axiosClient.get(`/api/admin/validations/${id}`)
      .then((r) => setDossier(r.data))
      .catch((e) => setError(e?.response?.data?.message ?? 'Dossier introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchDossier(); }, [fetchDossier]);

  const back = () => setSearchParams({ tab: 'validation' });

  const handleConfirm = async () => {
    const { action, category } = confirm;
    setConfirm(null);
    try {
      const { data } = await axiosClient.patch(`/api/admin/validations/${id}/${action}`, { category });
      toast.success(data.message);
      fetchDossier(); // stay on the page so the other track can be handled too
    } catch (e) {
      toast.error(e?.response?.data?.message ?? 'Une erreur est survenue.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="flex flex-col items-center gap-4 bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
        <p className="text-gray-600 dark:text-gray-300 font-semibold">{error ?? 'Dossier introuvable'}</p>
        <button onClick={back} className="text-[#0984E3] hover:underline text-sm font-medium">← Retour à la liste</button>
      </div>
    );
  }

  const identity = dossier.identity ?? {};
  const vehicle  = dossier.vehicle ?? {};

  return (
    <div className="flex flex-col gap-6">

      {/* Back link */}
      <button onClick={back} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0984E3] transition w-fit cursor-pointer">
        <ArrowLeft size={16} /> Retour à la liste de validation
      </button>

      {/* ── CANDIDATE HEADER ── */}
      <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-5">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Informations du Candidat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-1">
          <Field label="Nom" value={dossier.name} />
          <Field label="Ville" value={dossier.city} />
          <Field label="Téléphone" value={dossier.phone} />
          <Field label="Email" value={dossier.email} />
          <Field label="Rôle" value={dossier.is_traveler ? 'Voyageur' : 'Expéditeur'} />
          <Field label="Date d'envoi" value={fmtDate(dossier.submitted_at)} />
        </div>
      </div>

      {/* ── IDENTITY TRACK ── */}
      {identity.has && (
        <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <BadgeCheck size={18} className="text-[#0984E3]" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Pièce d'identité (CIN)</h3>
              <StatusBadge status={identity.status} />
            </div>
            <TrackActions
              status={identity.status}
              onApprove={() => setConfirm({ action: 'approve', category: 'identity' })}
              onReject={() => setConfirm({ action: 'reject', category: 'identity' })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <DocPreview label="Document CIN" url={identity.document} />
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl px-4 py-3 divide-y divide-gray-100 dark:divide-gray-700/40 self-start">
              <Field label="Nom complet" value={dossier.name} />
              <Field label="Email" value={dossier.email} />
              <Field label="Téléphone" value={dossier.phone} />
              <Field label="Ville" value={dossier.city} />
            </div>
          </div>
        </div>
      )}

      {/* ── VEHICLE TRACK ── */}
      {vehicle.has && (
        <div className="bg-white dark:bg-gray-800 shadow-xs rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Car size={18} className="text-[#F39C12]" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">Véhicule &amp; Documents</h3>
              <StatusBadge status={vehicle.status} />
            </div>
            <TrackActions
              status={vehicle.status}
              onApprove={() => setConfirm({ action: 'approve', category: 'vehicle' })}
              onReject={() => setConfirm({ action: 'reject', category: 'vehicle' })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
            <DocPreview label="Permis de conduire" url={vehicle.documents?.permis} />
            <DocPreview label="Assurance" url={vehicle.documents?.assurance} />
            <DocPreview label="Photo du véhicule" url={vehicle.photo} />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <User size={15} className="text-gray-400" />
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Détails du Véhicule Associé</h4>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-x-10">
            <Field label="Type" value={vehicle.type} />
            <Field label="Marque / Modèle" value={vehicle.brand_model} />
            <Field label="Immatriculation" value={vehicle.plate} />
            <Field label="Couleur" value={vehicle.color} />
            <Field label="Capacité" value={vehicle.capacity} />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => { if (!o) setConfirm(null); }}
        onConfirm={handleConfirm}
        title={
          confirm?.action === 'approve'
            ? (confirm?.category === 'identity' ? "Approuver l'identité ?" : 'Approuver le véhicule ?')
            : (confirm?.category === 'identity' ? "Rejeter l'identité ?" : 'Rejeter le véhicule ?')
        }
        description={
          confirm?.action === 'approve'
            ? (confirm?.category === 'identity'
                ? `L'identité de ${dossier.name} sera confirmée et le membre notifié.`
                : `Le véhicule de ${dossier.name} sera validé : il pourra publier des trajets et transporter des colis.`)
            : `${dossier.name} sera notifié et devra renvoyer les documents concernés.`
        }
        confirmLabel={confirm?.action === 'approve' ? 'Approuver' : 'Rejeter'}
        loadingLabel={confirm?.action === 'approve' ? 'Approbation…' : 'Rejet…'}
      />
    </div>
  );
}
