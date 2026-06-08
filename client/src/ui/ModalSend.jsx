import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, X, Package, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import axiosClient from '@/services/axios'
import { useSelector } from 'react-redux'

const SIZE_LABEL = { 1: 'Petit', 2: 'Moyen', 3: 'Grand', 4: 'Volumineux' }
const CAT_LABEL  = {
    electronique: 'Électronique', documents: 'Documents',
    mode: 'Mode', maison: 'Maison', autre: 'Autre',
}
const URGENCY_COLOR = {
    standard:    'bg-gray-100 text-gray-600',
    urgent:      'bg-orange-100 text-orange-600',
    très_urgent: 'bg-red-100 text-red-600',
}

export default function ModalSend({ text, travel, className = '' }) {
    const [isOpen,     setIsOpen]     = useState(false)
    const [packages,   setPackages]   = useState([])
    const [selected,   setSelected]   = useState('')
    const [message,    setMessage]    = useState('')
    const [loading,    setLoading]    = useState(false)
    const [fetching,   setFetching]   = useState(false)
    const [status,     setStatus]     = useState(null) // 'success' | 'error' | 'duplicate'
    const [errMsg,     setErrMsg]     = useState('')
    const overlayRef = useRef(null)
    const { user } = useSelector((s) => s.auth)
    const navigate  = useNavigate()

    // fetch sender's packages when modal opens
    useEffect(() => {
        if (!isOpen) return
        setFetching(true)
        setStatus(null)
        setSelected('')
        setMessage('')
        axiosClient.get('/api/packages')
            .then(r => setPackages(r.data?.packages ?? []))
            .catch(() => setPackages([]))
            .finally(() => setFetching(false))
    }, [isOpen])

    // close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') setIsOpen(false) }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [])

    const open = (e) => {
        e.stopPropagation()
        if (!user) { navigate('/login'); return }
        if (user.is_traveler) return  // guard: traveler can't send
        setIsOpen(true)
    }

    const handleSubmit = async () => {
        if (!selected) return
        setLoading(true)
        setStatus(null)
        try {
            await axiosClient.post('/api/travel-requests', {
                travel_id:  travel.id,
                package_id: Number(selected),
                message:    message.trim() || null,
            })
            setStatus('success')
        } catch (err) {
            const code = err?.response?.status
            if (code === 409) {
                setStatus('duplicate')
            } else {
                setStatus('error')
                setErrMsg(err?.response?.data?.message ?? 'Une erreur est survenue.')
            }
        } finally {
            setLoading(false)
        }
    }

    const selectedPkg = packages.find(p => String(p.id) === String(selected))

    return (
        <>
            {/* Trigger button */}
            <button
                className={`font-bold flex items-center gap-1 cursor-pointer ${className}`}
                onClick={open}
            >
                {text} <ArrowRight size={18} />
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    ref={overlayRef}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={(e) => {
                        e.stopPropagation()
                        if (e.target === overlayRef.current) setIsOpen(false)
                    }}
                >
                    {/* Dialog */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

                        {/* Close */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
                        >
                            <X size={16} />
                        </button>

                        {/* Header */}
                        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">Envoyer un colis</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Trajet de{' '}
                                <span className="font-semibold text-gray-700 capitalize">
                                    {travel.from_city?.name ?? travel.ville_depart}
                                </span>
                                {' → '}
                                <span className="font-semibold text-gray-700 capitalize">
                                    {travel.to_city?.name ?? travel.ville_darrive}
                                </span>
                            </p>
                        </div>

                        <div className="px-6 py-5 flex flex-col gap-5">

                            {/* ── Success state ── */}
                            {status === 'success' && (
                                <div className="flex flex-col items-center gap-3 py-6 text-center">
                                    <CheckCircle size={48} className="text-green-500" />
                                    <p className="text-lg font-bold text-gray-800">Demande envoyée !</p>
                                    <p className="text-sm text-gray-500">
                                        Le voyageur recevra votre demande et vous contactera.
                                    </p>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="mt-2 bg-[#0984E3] hover:bg-blue-600 text-white text-sm font-semibold px-6 py-2 rounded-lg transition"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            )}

                            {/* ── Duplicate state ── */}
                            {status === 'duplicate' && (
                                <div className="flex flex-col items-center gap-3 py-6 text-center">
                                    <AlertCircle size={48} className="text-orange-400" />
                                    <p className="text-lg font-bold text-gray-800">Demande déjà envoyée</p>
                                    <p className="text-sm text-gray-500">
                                        Vous avez déjà soumis ce colis pour ce trajet.
                                    </p>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold px-6 py-2 rounded-lg transition"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            )}

                            {/* ── Error state ── */}
                            {status === 'error' && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 flex items-start gap-2">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    {errMsg}
                                </div>
                            )}

                            {/* ── Form ── */}
                            {status !== 'success' && status !== 'duplicate' && (
                                <>
                                    {/* Package select */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Sélectionnez votre colis
                                        </label>

                                        {fetching ? (
                                            <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                                                <Loader size={16} className="animate-spin" /> Chargement…
                                            </div>
                                        ) : packages.length === 0 ? (
                                            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 text-center">
                                                Vous n'avez pas encore de colis.
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
                                                {packages.map(pkg => (
                                                    <label
                                                        key={pkg.id}
                                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                                                            String(selected) === String(pkg.id)
                                                                ? 'border-[#0984E3] bg-blue-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="package"
                                                            value={pkg.id}
                                                            checked={String(selected) === String(pkg.id)}
                                                            onChange={() => setSelected(String(pkg.id))}
                                                            className="accent-[#0984E3]"
                                                        />
                                                        <Package size={16} className="text-gray-400 shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                                #{pkg.id} — {pkg.package_name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {CAT_LABEL[pkg.category] ?? pkg.category}
                                                                {' · '}
                                                                {SIZE_LABEL[pkg.package_size] ?? `${pkg.package_size} kg`}
                                                            </p>
                                                        </div>
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${URGENCY_COLOR[pkg.urgency] ?? ''}`}>
                                                            {pkg.urgency}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        <Link
                                            to="/packages/create"
                                            className="text-sm text-[#0984E3] font-semibold hover:underline"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            + Créer un nouveau colis
                                        </Link>
                                    </div>

                                    {/* Travel details summary */}
                                    <div className="flex flex-col gap-3">
                                        <p className="text-sm font-semibold text-gray-700">Détails du trajet</p>

                                        {/* Route */}
                                        <div className="flex justify-around items-center py-3 bg-gray-50 rounded-xl">
                                            <div className="flex flex-col items-center">
                                                <span className="text-base font-bold text-gray-800 capitalize">
                                                    {travel.from_city?.name ?? travel.ville_depart}
                                                </span>
                                                <span className="text-xs text-gray-500">Départ</span>
                                            </div>
                                            <ArrowRight size={18} className="text-gray-400" />
                                            <div className="flex flex-col items-center">
                                                <span className="text-base font-bold text-gray-800 capitalize">
                                                    {travel.to_city?.name ?? travel.ville_darrive}
                                                </span>
                                                <span className="text-xs text-gray-500">Arrivée</span>
                                            </div>
                                        </div>

                                        {/* Info grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-50 rounded-xl p-3">
                                                <p className="text-xs text-gray-500 mb-1">Date de départ</p>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {travel.departure_date
                                                        ? new Date(travel.departure_date).toLocaleDateString('fr-MA', { day: 'numeric', month: 'short', year: 'numeric' })
                                                        : travel.date ?? '—'}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-3">
                                                <p className="text-xs text-gray-500 mb-1">Véhicule</p>
                                                <p className="text-sm font-semibold text-gray-800 capitalize">
                                                    {travel.car_type ?? travel.type_veh ?? '—'}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-3">
                                                <p className="text-xs text-gray-500 mb-1">Poids max</p>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {travel.max_weight ?? travel.poids ?? '—'} kg
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-3">
                                                <p className="text-xs text-gray-500 mb-1">Voyageur</p>
                                                <p className="text-sm font-semibold text-gray-800 truncate">
                                                    {travel.user?.name ?? travel.traveler ?? '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Optional message */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Message au voyageur <span className="font-normal text-gray-400">(optionnel)</span>
                                        </label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={3}
                                            maxLength={500}
                                            placeholder="Ex : Le colis est fragile, merci de le manipuler avec soin."
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0984E3] resize-none"
                                        />
                                    </div>

                                    {/* Price summary */}
                                    <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                                        <span className="text-sm text-gray-500">Total à payer</span>
                                        <span className="text-2xl font-bold text-gray-800">
                                            {travel.price ?? '—'}{' '}
                                            <span className="text-base font-medium text-gray-500">MAD</span>
                                        </span>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!selected || loading}
                                        className="w-full bg-[#0984E3] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                                    >
                                        {loading
                                            ? <><Loader size={16} className="animate-spin" /> Envoi en cours…</>
                                            : 'Confirmer la demande'
                                        }
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}