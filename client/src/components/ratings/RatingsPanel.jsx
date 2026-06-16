import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { motion as Motion, AnimatePresence } from 'motion/react';
import axiosClient from '../../services/axios';
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Star, Loader2, Inbox, ArrowRight, Package as PackageIcon, Send, Award,
} from 'lucide-react';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const avatarOf = (name, url) => url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'M')}&background=0984E3&color=fff`;

// ── reusable star row (read-only or interactive) ─────────────────────────────
function Stars({ value = 0, onChange, size = 16, interactive = false }) {
  const [hover, setHover] = useState(0);
  const shown = interactive ? (hover || value) : value;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={interactive ? () => onChange?.(n) : undefined}
          onMouseEnter={interactive ? () => setHover(n) : undefined}
          onMouseLeave={interactive ? () => setHover(0) : undefined}
          className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
        >
          <Star
            size={size}
            className={n <= shown ? 'text-[#F39C12]' : 'text-gray-300 dark:text-gray-600'}
            fill={n <= shown ? '#F39C12' : 'none'}
          />
        </button>
      ))}
    </div>
  );
}

/**
 * "Évaluations" — shared by sender & traveler dashboards. Senders rate the
 * traveler who carried their colis and vice-versa. Shows the received average,
 * deliveries waiting to be rated, and the ratings given/received.
 */
export default function RatingsPanel({ role = 'sender' }) {
  const [pending, setPending]   = useState([]);
  const [received, setReceived] = useState(null);
  const [given, setGiven]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [view, setView]         = useState('received'); // received | given

  // rate dialog
  const [target, setTarget]   = useState(null); // pending delivery being rated
  const [stars, setStars]     = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving]   = useState(false);

  const otherLabel = role === 'sender' ? 'Voyageur' : 'Expéditeur';

  const fetchAll = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      axiosClient.get('/api/ratings/pending', { params: { role } }),
      axiosClient.get('/api/ratings/received'),
      axiosClient.get('/api/ratings/given', { params: { role } }),
    ])
      .then(([p, r, g]) => { setPending(p.data ?? []); setReceived(r.data ?? null); setGiven(g.data ?? []); })
      .catch((e) => setError(e?.response?.data?.message ?? 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [role]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openRate = (d) => { setTarget(d); setStars(0); setComment(''); };

  const submit = async (e) => {
    e.preventDefault();
    if (!stars) { toast.error('Choisissez une note (1 à 5 étoiles).'); return; }
    setSaving(true);
    try {
      const { data } = await axiosClient.post('/api/ratings', {
        travel_request_id: target.travel_request_id,
        stars,
        comment: comment.trim() || null,
      });
      toast.success(data.message);
      setTarget(null);
      fetchAll(); // refresh pending + given + received average
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Erreur lors de l'envoi.");
    } finally {
      setSaving(false);
    }
  };

  const average = received?.average;
  const count   = received?.count ?? 0;

  return (
    <div className="flex flex-col gap-5">

      {/* ── Summary + pending count ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Average received */}
        <div className="sm:col-span-1 bg-linear-to-br from-amber-50 to-white dark:from-gray-800 dark:to-gray-800 border border-amber-100 dark:border-gray-700/60 rounded-xl p-5 flex flex-col gap-2 shadow-xs">
          <span className="text-xs font-semibold text-gray-400 uppercase">Ma note moyenne</span>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-gray-800 dark:text-gray-100">{average != null ? average : '—'}</span>
            <span className="text-sm text-gray-400 mb-1.5">/ 5</span>
          </div>
          <Stars value={Math.round(average ?? 0)} size={18} />
          <span className="text-xs text-gray-400">{count} évaluation{count > 1 ? 's' : ''} reçue{count > 1 ? 's' : ''}</span>
        </div>

        {/* Breakdown */}
        <div className="sm:col-span-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-5 shadow-xs flex flex-col justify-center gap-1.5">
          {[5, 4, 3, 2, 1].map((n) => {
            const c = received?.breakdown?.[n] ?? 0;
            const pct = count ? Math.round((c / count) * 100) : 0;
            return (
              <div key={n} className="flex items-center gap-3 text-xs">
                <span className="w-3 text-gray-500 dark:text-gray-400 font-medium">{n}</span>
                <Star size={12} className="text-[#F39C12]" fill="#F39C12" />
                <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div className="h-full rounded-full bg-[#F39C12]" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-right text-gray-400">{c}</span>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* ── Deliveries to rate ── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
          <Send size={15} className="text-[#0984E3]" /> Livraisons à évaluer
          {pending.length > 0 && (
            <span className="bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
          )}
        </h3>

        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700/40 rounded-lg animate-pulse" />)}
          </div>
        ) : pending.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">Aucune livraison en attente d'évaluation.</p>
        ) : (
          <AnimatePresence initial={false}>
            <div className="flex flex-col gap-2.5">
              {pending.map((d) => (
                <Motion.div
                  key={d.travel_request_id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="flex items-center justify-between gap-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={avatarOf(d.ratee, d.ratee_avatar)} alt={d.ratee} className="w-9 h-9 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{d.ratee}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                        <PackageIcon size={11} className="shrink-0" /> {d.package}
                        <span className="mx-1">·</span>
                        <span className="capitalize">{d.from_city}</span>
                        <ArrowRight size={10} className="shrink-0" />
                        <span className="capitalize">{d.to_city}</span>
                      </p>
                    </div>
                  </div>
                  <Motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => openRate(d)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#F39C12]/10 text-[#F39C12] hover:bg-[#F39C12] hover:text-white border border-[#F39C12]/30 hover:border-[#F39C12] transition cursor-pointer whitespace-nowrap"
                  >
                    <Star size={13} /> Noter
                  </Motion.button>
                </Motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* ── Tabs: received / given ── */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl shadow-xs overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-gray-700/60">
          {[
            { key: 'received', label: `Reçues (${received?.items?.length ?? 0})` },
            { key: 'given',    label: `Données (${given.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setView(t.key)}
              className={`px-5 py-3 text-sm font-semibold transition cursor-pointer relative ${
                view === t.key ? 'text-[#0984E3]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t.label}
              {view === t.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0984E3]" />}
            </button>
          ))}
        </div>

        <div className="p-4 flex flex-col gap-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700/40 rounded-lg animate-pulse" />)
          ) : view === 'received' ? (
            (received?.items?.length ?? 0) === 0 ? (
              <EmptyRow icon={<Award size={26} className="text-[#0984E3]" />} text="Aucune évaluation reçue pour l'instant." />
            ) : (
              received.items.map((r) => (
                <ReviewRow key={r.id} name={r.rater} avatar={r.rater_avatar} stars={r.stars} comment={r.comment} pkg={r.package} date={r.created_at} />
              ))
            )
          ) : (
            given.length === 0 ? (
              <EmptyRow icon={<Star size={26} className="text-[#F39C12]" />} text={`Vous n'avez encore évalué aucun ${otherLabel.toLowerCase()}.`} />
            ) : (
              given.map((r) => (
                <ReviewRow key={r.id} name={r.ratee} avatar={r.ratee_avatar} stars={r.stars} comment={r.comment} pkg={r.package} date={r.created_at} />
              ))
            )
          )}
        </div>
      </div>

      {/* ── Rate dialog ── */}
      <Dialog open={!!target} onOpenChange={(o) => { if (!o && !saving) setTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Star size={18} className="text-[#F39C12]" fill="#F39C12" /> Évaluer {otherLabel.toLowerCase()}
            </DialogTitle>
            <DialogDescription>
              {target && `${target.ratee} · ${target.package}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-2 py-2">
              <Stars value={stars} onChange={setStars} size={36} interactive />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 h-5">
                {['', 'Très insatisfait', 'Insatisfait', 'Correct', 'Satisfait', 'Excellent'][stars]}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Commentaire (optionnel)</label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                placeholder="Partagez votre expérience…"
                className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#0984E3] resize-none"
              />
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setTarget(null)}
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-[#0984E3] hover:bg-blue-600 active:scale-95 text-white shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {saving ? (<><Loader2 size={16} className="animate-spin" /> Envoi…</>) : 'Envoyer mon évaluation'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── small presentational helpers ─────────────────────────────────────────────
function ReviewRow({ name, avatar, stars, comment, pkg, date }) {
  return (
    <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
      <img src={avatarOf(name, avatar)} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{name}</p>
          <span className="text-xs text-gray-400 shrink-0">{fmtDate(date)}</span>
        </div>
        <div className="mt-0.5"><Stars value={stars} size={13} /></div>
        {comment && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1.5">{comment}</p>}
        {pkg && <p className="text-xs text-gray-400 mt-1">Colis : {pkg}</p>}
      </div>
    </div>
  );
}

function EmptyRow({ icon, text }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">{icon}</div>
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}
