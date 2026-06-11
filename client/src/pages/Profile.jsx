import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
    Pencil, ShieldAlert, ShieldCheck, UploadCloud,
    Clock3, CircleAlert, CheckCircle2, ChevronDown,
} from 'lucide-react'
import axiosClient from '@/services/axios'
import { setUser } from '@/store/slices/authSlice'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import Sidebar from '../partials/Sidebar'
import TravelerSidebar from '../partials/TravelerSidebar'
import Header from '../partials/Header'

const avatarOf = (user) =>
    user?.profile_picture
        ? user.profile_picture
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? '?')}&background=0984E3&color=fff`

const VERIFICATION = {
    pending: {
        text: 'Votre profil est en attente de vérification.',
        icon: ShieldAlert,
        color: 'text-orange-500',
    },
    verified: {
        text: 'Votre profil est vérifié.',
        icon: ShieldCheck,
        color: 'text-green-500',
    },
    rejected: {
        text: 'Votre vérification a été refusée. Veuillez renvoyer votre document.',
        icon: ShieldAlert,
        color: 'text-red-500',
    },
}

const Field = ({ label, name, value, onChange, disabled = false, ...props }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">{label}</label>
        <div className="relative">
            <input
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                {...props}
                className="w-full bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-9 py-2.5 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#0984E3] disabled:text-gray-400 disabled:cursor-not-allowed"
            />
            {!disabled && <Pencil className="absolute right-3 top-3 text-gray-300 pointer-events-none" size={14} />}
        </div>
    </div>
)

const isImage = (url) => typeof url === 'string' && /\.(png|jpe?g|gif|webp)$/i.test(url)

const DropZone = ({ inputRef, uploading, onSelect, accept, label, preview }) => (
    <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
            e.preventDefault()
            onSelect(e.dataTransfer.files?.[0])
        }}
        className="relative border-2 border-dashed border-blue-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center gap-2 py-8 px-4 text-center cursor-pointer hover:border-[#0984E3] transition-colors overflow-hidden"
    >
        <input
            ref={inputRef}
            type="file"
            accept={accept}
            hidden
            onChange={(e) => onSelect(e.target.files?.[0])}
        />

        {/* Existing upload preview */}
        {preview && !uploading && (
            isImage(preview) ? (
                <img src={preview} alt="aperçu" className="absolute inset-0 w-full h-full object-cover opacity-90" />
            ) : (
                <div className="absolute top-2 right-2 text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                    ✓ Document reçu
                </div>
            )
        )}

        <div className={`relative w-9 h-9 rounded-full bg-[#0984E3]/10 flex items-center justify-center text-[#0984E3] ${preview && isImage(preview) ? 'bg-white/90 shadow' : ''}`}>
            <UploadCloud size={18} />
        </div>
        {uploading ? (
            <span className="relative text-xs text-gray-400">Envoi en cours...</span>
        ) : (
            <p className={`relative text-xs ${preview && isImage(preview) ? 'text-white drop-shadow font-medium bg-black/30 px-2 py-1 rounded' : 'text-gray-500 dark:text-gray-400'}`}>
                <span className="text-[#0984E3] font-semibold">Cliquez</span> pour uploader ou glissez-déposez
                <br />
                {label}
            </p>
        )}
    </div>
)

const VEHICLE_TYPES = [
    { value: 'moto',     label: 'Moto' },
    { value: 'voiture',  label: 'Voiture' },
    { value: 'camionnette', label: 'Camionnette' },
    { value: 'camion',   label: 'Camion' },
]

const Profile = () => {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.auth.user)

    const [searchParams] = useSearchParams()
    const activeTab = searchParams.get('tab') === 'vehicle' ? 'vehicle' : 'profil'

    const [sidebarOpen, setSidebarOpen] = useState(false)

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        postal_code: '',
        city: '',
        country: '',
        bio: '',
    })
    const [saving, setSaving] = useState(false)

    const photoInputRef = useRef(null)
    const documentInputRef = useRef(null)
    const [uploadingPhoto, setUploadingPhoto] = useState(false)
    const [uploadingDocument, setUploadingDocument] = useState(false)

    // ── vehicle tab
    const [vehicle, setVehicle] = useState({
        vehicle_type: '',
        vehicle_brand_model: '',
        vehicle_plate: '',
        vehicle_color: '',
        vehicle_capacity: '',
    })
    const [savingVehicle, setSavingVehicle] = useState(false)
    const vehiclePhotoRef = useRef(null)
    const permisRef = useRef(null)
    const assuranceRef = useRef(null)
    const [uploadingDoc, setUploadingDoc] = useState(null) // which doc type is uploading

    useEffect(() => {
        if (!user) return

        setForm({
            first_name: user.first_name ?? '',
            last_name: user.last_name ?? '',
            phone: user.phone ?? '',
            postal_code: user.postal_code ?? '',
            city: user.city ?? '',
            country: user.country ?? '',
            bio: user.bio ?? '',
        })

        setVehicle({
            vehicle_type: user.vehicle_type ?? '',
            vehicle_brand_model: user.vehicle_brand_model ?? '',
            vehicle_plate: user.vehicle_plate ?? '',
            vehicle_color: user.vehicle_color ?? '',
            vehicle_capacity: user.vehicle_capacity ?? '',
        })
    }, [user])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            const res = await axiosClient.patch('/api/profile', form)
            dispatch(setUser(res.data.user))
            toast.success(res.data.message)
        } catch (err) {
            const errorsData = err.response?.data?.errors
            const message = errorsData
                ? Object.values(errorsData)[0][0]
                : err.response?.data?.message ?? 'Erreur lors de la mise à jour du profil'
            toast.error(message)
        } finally {
            setSaving(false)
        }
    }

    const uploadFile = async (url, field, file, setUploading) => {
        if (!file) return

        const formData = new FormData()
        formData.append(field, file)

        setUploading(true)
        try {
            const res = await axiosClient.post(url, formData)
            dispatch(setUser(res.data.user))
            toast.success(res.data.message)
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Une erreur est survenue lors de l\'envoi du fichier')
        } finally {
            setUploading(false)
        }
    }

    const handleVehicleChange = (e) => {
        const { name, value } = e.target
        setVehicle((prev) => ({ ...prev, [name]: value }))
    }

    const handleVehicleSubmit = async (e) => {
        e.preventDefault()
        setSavingVehicle(true)
        try {
            const res = await axiosClient.patch('/api/profile/vehicle', vehicle)
            dispatch(setUser(res.data.user))
            toast.success(res.data.message)
        } catch (err) {
            const errorsData = err.response?.data?.errors
            const message = errorsData
                ? Object.values(errorsData)[0][0]
                : err.response?.data?.message ?? 'Erreur lors de l\'enregistrement du véhicule'
            toast.error(message)
        } finally {
            setSavingVehicle(false)
        }
    }

    const uploadVehicleDoc = async (type, file) => {
        if (!file) return
        const formData = new FormData()
        formData.append('type', type)
        formData.append('file', file)

        setUploadingDoc(type)
        try {
            const res = await axiosClient.post('/api/profile/vehicle-document', formData)
            dispatch(setUser(res.data.user))
            toast.success(res.data.message)
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Erreur lors de l\'envoi du fichier')
        } finally {
            setUploadingDoc(null)
        }
    }

    const verification = VERIFICATION[user?.statut_verification] ?? VERIFICATION.pending
    const VerificationIcon = verification.icon
    // Identity (CIN) and vehicle/documents are verified independently.
    const isVehicleVerified = user?.vehicle_verification === 'verified'

    const handleConnectGoogle = () => {
        window.location.href = 'http://localhost:8000/auth/google'
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {user?.is_traveler
                ? <TravelerSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                : <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}

            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="grow">
                    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

                        <div className="mb-6">
                            <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-1">
                                {activeTab === 'vehicle' ? 'Paramètres | Mon Véhicule & Documents' : 'Mon Profil'}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {activeTab === 'vehicle'
                                    ? 'Renseignez les informations de votre véhicule et téléchargez vos documents pour validation.'
                                    : 'Gérez vos informations personnelles et la sécurité de votre compte.'}
                            </p>
                        </div>

                        {/* ── VEHICLE TAB ───────────────────────────────────── */}
                        {activeTab === 'vehicle' && (
                            <div className="flex flex-col gap-6">

                                {/* Verification in-progress alert (hidden once verified) */}
                                {!isVehicleVerified && (user?.vehicle_photo || user?.permis_document || user?.assurance_document) && (
                                    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50">
                                        <Clock3 className="text-amber-500" />
                                        <AlertTitle className="text-amber-800 dark:text-amber-300">Vérification en cours</AlertTitle>
                                        <AlertDescription className="text-amber-700/90 dark:text-amber-400/80">
                                            Vos documents (Permis, Assurance et Photo du véhicule) ont été reçus. Un administrateur les examine
                                            actuellement. Vous serez notifié par email dès que votre profil voyageur sera activé.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Verified success alert */}
                                {isVehicleVerified && (
                                    <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900/50">
                                        <CheckCircle2 className="text-green-500" />
                                        <AlertTitle className="text-green-800 dark:text-green-300">Véhicule validé</AlertTitle>
                                        <AlertDescription className="text-green-700/90 dark:text-green-400/80">
                                            Votre véhicule et vos documents ont été validés. Vous pouvez désormais accepter des colis.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                                    {/* Détails du compte (véhicule) */}
                                    <form
                                        onSubmit={handleVehicleSubmit}
                                        className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-6 shadow-xs"
                                    >
                                        <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-5">Détails du compte</h2>

                                        {/* Destructive (must-validate) alert — hidden once verified */}
                                        {!isVehicleVerified && (
                                            <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 mb-6">
                                                <CircleAlert />
                                                <AlertDescription className="text-red-600 dark:text-red-400">
                                                    Les informations de votre véhicule doivent être validées par l'administrateur avant que vous ne
                                                    puissiez accepter des colis.
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            {/* Type de véhicule */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Type de véhicule</label>
                                                <div className="relative">
                                                    <select
                                                        name="vehicle_type"
                                                        value={vehicle.vehicle_type}
                                                        onChange={handleVehicleChange}
                                                        className="w-full appearance-none bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-9 py-2.5 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#0984E3] cursor-pointer"
                                                    >
                                                        <option value="">Sélectionner…</option>
                                                        {VEHICLE_TYPES.map((t) => (
                                                            <option key={t.value} value={t.value}>{t.label}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-3 text-gray-300 pointer-events-none" size={16} />
                                                </div>
                                            </div>

                                            <Field label="Marque & Modèle" name="vehicle_brand_model" value={vehicle.vehicle_brand_model} onChange={handleVehicleChange} placeholder="Kia Picanto" />
                                            <Field label="Plaque d'immatriculation" name="vehicle_plate" value={vehicle.vehicle_plate} onChange={handleVehicleChange} placeholder="XXXXX - A - 72" />
                                            <Field label="Couleur" name="vehicle_color" value={vehicle.vehicle_color} onChange={handleVehicleChange} placeholder="Noire" />
                                        </div>

                                        <div className="mt-5">
                                            <Field label="Capacité de chargement" name="vehicle_capacity" value={vehicle.vehicle_capacity} onChange={handleVehicleChange} placeholder="50 Kg / 300 L" />
                                        </div>

                                        {/* Photo du véhicule */}
                                        <div className="mt-5 flex flex-col gap-1.5">
                                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                                Photo du Véhicule (Extérieur + Coffre)
                                            </label>
                                            <DropZone
                                                inputRef={vehiclePhotoRef}
                                                uploading={uploadingDoc === 'vehicle_photo'}
                                                onSelect={(file) => uploadVehicleDoc('vehicle_photo', file)}
                                                accept="image/png, image/jpeg, image/gif"
                                                label="SVG, PNG, JPG or GIF"
                                                preview={user?.vehicle_photo}
                                            />
                                        </div>

                                        <div className="mt-6 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={savingVehicle}
                                                className="px-5 py-2.5 text-sm font-bold rounded-lg bg-[#0984E3] hover:bg-blue-600 active:scale-95 text-white shadow-sm transition cursor-pointer disabled:opacity-60"
                                            >
                                                {savingVehicle ? 'Enregistrement...' : 'Enregistrer le véhicule'}
                                            </button>
                                        </div>
                                    </form>

                                    {/* Documents & Photos */}
                                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
                                        <h2 className="font-bold text-gray-800 dark:text-gray-100">Documents &amp; Photos</h2>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                                Permis de Conduire ( Recto &amp; Verso )
                                            </label>
                                            <DropZone
                                                inputRef={permisRef}
                                                uploading={uploadingDoc === 'permis_document'}
                                                onSelect={(file) => uploadVehicleDoc('permis_document', file)}
                                                accept="image/png, image/jpeg, image/gif, application/pdf"
                                                label="SVG, PNG, JPG or GIF"
                                                preview={user?.permis_document}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                                Assurance du Véhicule
                                            </label>
                                            <DropZone
                                                inputRef={assuranceRef}
                                                uploading={uploadingDoc === 'assurance_document'}
                                                onSelect={(file) => uploadVehicleDoc('assurance_document', file)}
                                                accept="image/png, image/jpeg, image/gif, application/pdf"
                                                label="SVG, PNG, JPG or GIF"
                                                preview={user?.assurance_document}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── PROFILE TAB ───────────────────────────────────── */}
                        {activeTab === 'profil' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                            {/* Détails du compte */}
                            <form
                                onSubmit={handleSubmit}
                                className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-6 shadow-xs"
                            >
                                <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-5">Détails du compte</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <Field label="Prénom" name="first_name" value={form.first_name} onChange={handleChange} required />
                                    <Field label="Nom" name="last_name" value={form.last_name} onChange={handleChange} required />

                                    <Field label="Adresse Email" name="email" value={user?.email ?? ''} disabled />
                                    <Field label="Téléphone" name="phone" value={form.phone} onChange={handleChange} placeholder="+212600000000" required />

                                    <Field label="Code Postal" name="postal_code" value={form.postal_code} onChange={handleChange} placeholder="20000" />
                                    <Field label="Ville" name="city" value={form.city} onChange={handleChange} placeholder="Casablanca" />

                                    <Field label="Country Name" name="country" value={form.country} onChange={handleChange} placeholder="Morocco" />
                                </div>

                                <div className="mt-5 flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                        Description (À propos de vous)
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={form.bio}
                                        onChange={handleChange}
                                        rows={5}
                                        placeholder="Parlez-nous un peu de vous..."
                                        className="w-full bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#0984E3] resize-none"
                                    />
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-5 py-2.5 text-sm font-bold rounded-lg bg-[#0984E3] hover:bg-blue-600 active:scale-95 text-white shadow-sm transition cursor-pointer disabled:opacity-60"
                                    >
                                        {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                    </button>
                                </div>
                            </form>

                            {/* Right column */}
                            <div className="flex flex-col gap-6">

                                {/* Photo de profil */}
                                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-6 shadow-xs">
                                    <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Photo de profil</h2>

                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src={avatarOf(user)}
                                            alt={user?.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                                Modifier votre Photo
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => photoInputRef.current?.click()}
                                                className="text-xs text-[#0984E3] font-semibold hover:underline cursor-pointer"
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </div>

                                    <DropZone
                                        inputRef={photoInputRef}
                                        uploading={uploadingPhoto}
                                        onSelect={(file) => uploadFile('/api/profile/photo', 'photo', file, setUploadingPhoto)}
                                        accept="image/png, image/jpeg, image/gif"
                                        label="SVG, PNG, JPG ou GIF (max. 800x400px)"
                                    />
                                </div>

                                {/* Sécurité & Vérification */}
                                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-6 shadow-xs">
                                    <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Sécurité &amp; Vérification</h2>

                                    <div className="flex items-center gap-2 mb-4">
                                        <VerificationIcon className={verification.color} size={18} />
                                        <p className={`text-sm font-medium ${verification.color}`}>{verification.text}</p>
                                    </div>

                                    <DropZone
                                        inputRef={documentInputRef}
                                        uploading={uploadingDocument}
                                        onSelect={(file) => uploadFile('/api/profile/document', 'document', file, setUploadingDocument)}
                                        accept="image/png, image/jpeg, application/pdf"
                                        label="Cliquez pour uploader votre CIN — SVG, PNG, JPG ou GIF"
                                    />
                                </div>

                                {/* Google */}
                                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-6 shadow-xs">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 dark:border-gray-700 flex items-center justify-center font-bold text-[#4285F4] text-sm">
                                                G
                                            </div>
                                            <span className="font-bold text-gray-800 dark:text-gray-100">Google</span>
                                        </div>

                                        {user?.google_id ? (
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-600">
                                                Connected
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                                                Not connected
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {user?.google_id ? (
                                            'Vous utilisez Google pour vous connecter à votre compte.'
                                        ) : (
                                            <>
                                                Utilisez Google pour vous connecter à votre compte.{' '}
                                                <button
                                                    type="button"
                                                    onClick={handleConnectGoogle}
                                                    className="text-[#0984E3] font-semibold hover:underline cursor-pointer"
                                                >
                                                    Cliquez ici pour le connecter.
                                                </button>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Profile
