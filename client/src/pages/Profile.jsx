import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { Pencil, ShieldAlert, ShieldCheck, UploadCloud } from 'lucide-react'
import axiosClient from '@/services/axios'
import { setUser } from '@/store/slices/authSlice'
import Sidebar from '../partials/Sidebar'
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

const DropZone = ({ inputRef, uploading, onSelect, accept, label }) => (
    <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
            e.preventDefault()
            onSelect(e.dataTransfer.files?.[0])
        }}
        className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center gap-2 py-8 px-4 text-center cursor-pointer hover:border-[#0984E3]/50 transition-colors"
    >
        <input
            ref={inputRef}
            type="file"
            accept={accept}
            hidden
            onChange={(e) => onSelect(e.target.files?.[0])}
        />
        <div className="w-9 h-9 rounded-full bg-[#0984E3]/10 flex items-center justify-center text-[#0984E3]">
            <UploadCloud size={18} />
        </div>
        {uploading ? (
            <span className="text-xs text-gray-400">Envoi en cours...</span>
        ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="text-[#0984E3] font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                <br />
                {label}
            </p>
        )}
    </div>
)

const Profile = () => {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.auth.user)

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

    const verification = VERIFICATION[user?.statut_verification] ?? VERIFICATION.pending
    const VerificationIcon = verification.icon

    const handleConnectGoogle = () => {
        window.location.href = 'http://localhost:8000/auth/google'
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="grow">
                    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

                        <div className="mb-6">
                            <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-1">
                                Mon Profil
                            </h1>
                            <p className="text-sm text-gray-500">
                                Gérez vos informations personnelles et la sécurité de votre compte.
                            </p>
                        </div>

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
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Profile
