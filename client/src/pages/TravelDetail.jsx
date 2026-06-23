import ModalSend from "@/ui/ModalSend"
import TagChip from "@/ui/TagChip"
import { ArrowLeft, ArrowRight, Check, MapPin, Star, Loader } from "lucide-react"
import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import axiosClient from "@/services/axios"
import { storageUrl } from "@/config"

const TravelDetail = () => {
    const { id } = useParams()
    const [travel,   setTravel]   = useState(null)
    const [loading,  setLoading]  = useState(true)
    const [error,    setError]    = useState(null)
    const [selectedImage, setSelectedImage] = useState(0)

    useEffect(() => {
        axiosClient.get(`/api/travels/${id}`)
            .then(r => setTravel(r.data))
            .catch(() => setError('Trajet introuvable.'))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return (
        <main className="flex items-center justify-center h-64 text-gray-400 gap-3">
            <Loader size={24} className="animate-spin" /> Chargement…
        </main>
    )

    if (error || !travel) return (
        <main className="flex items-center justify-center h-64 text-red-500">
            {error ?? 'Trajet introuvable.'}
        </main>
    )

    const images  = travel.images ?? []
    const cats    = travel.accepted_categories ?? []

    return (
        <main>
            <div className="flex relative w-full h-full xl:h-204 shadow-2xl rounded-2xl">
                {/* Left: image gallery (desktop only) */}
                <div className="hidden xl:block">
                    <Link
                        className="absolute bg-gray-300 opacity-80 text-[0.8rem] rounded-4xl top-4 left-4 z-10 flex items-center gap-2 font-bold py-1 px-4"
                        to="/travels"
                    >
                        <ArrowLeft size={16} />
                        <p>Retour aux Trajets</p>
                    </Link>
                    {images.length > 0 ? (
                        <img
                            src={storageUrl(images[selectedImage]?.path)}
                            alt=""
                            className="w-full h-full rounded-r-2xl object-cover"
                        />
                    ) : (
                        <div className="w-72 h-full bg-gray-100 rounded-r-2xl flex items-center justify-center text-gray-300">
                            Pas d'image
                        </div>
                    )}
                </div>

                <div className="w-full p-8 flex flex-col justify-start">
                    {/* Mobile back */}
                    <Link
                        className="xl:hidden text-[0.8rem] rounded-4xl flex items-center gap-2 font-bold"
                        to="/travels"
                    >
                        <ArrowLeft size={16} />
                        <p>Retour aux Trajets</p>
                    </Link>

                    <div className="mt-10 xl:mt-0">
                        <TagChip text="Trajet Sécurisé" />
                    </div>

                    <div className="py-5">
                        <p className="font-semibold text-[1.4rem]">Transport de Colis :</p>
                        <p className="flex gap-1 p-2 items-center text-[1.1rem] xl:text-[1.7rem] font-semibold capitalize">
                            <span>{travel.from_city?.name}</span>
                            <ArrowRight size={16} />
                            <span>{travel.to_city?.name}</span>
                        </p>

                        <div className="p-2 flex items-center gap-2">
                            <p className="text-[#46c48f] font-semibold text-[0.9rem]">
                                {travel.user?.name}
                            </p>
                            <span className="text-gray-400">|</span>
                            {(() => {
                                const avg = travel.user?.ratings_avg != null ? Number(travel.user.ratings_avg) : null
                                const count = travel.user?.ratings_count ?? 0
                                return (
                                    <div className="flex gap-1 items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                size={13}
                                                key={i}
                                                className={avg && i < Math.round(avg) ? "text-[#F39C12]" : "text-gray-300"}
                                                fill={avg && i < Math.round(avg) ? "#F39C12" : "none"}
                                            />
                                        ))}
                                        <span className="text-[0.8rem]">
                                            {avg ? `${avg.toFixed(1)} (${count})` : '(Nouveau)'}
                                        </span>
                                    </div>
                                )
                            })()}
                        </div>

                        <div className="py-8 px-2 flex flex-col gap-6">

                            {/* Accepted categories */}
                            {cats.length > 0 && (
                                <div className="flex gap-2 flex-col">
                                    <p className="text-[1rem] font-semibold text-gray-900">
                                        Catégories acceptées
                                    </p>
                                    <div className="flex flex-wrap gap-2 px-4">
                                        {cats.map(cat => (
                                            <span key={cat} className="flex items-center gap-1 text-[0.85rem] bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium capitalize">
                                                <Check size={12} /> {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Details grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-100 rounded-[1rem] shadow p-3">
                                    <p className="text-gray-600 text-sm">Date de départ</p>
                                    <span className="font-semibold">
                                        {travel.departure_date
                                            ? new Date(travel.departure_date).toLocaleDateString('fr-MA', { day: 'numeric', month: 'long', year: 'numeric' })
                                            : '—'}
                                    </span>
                                </div>
                                <div className="bg-gray-100 rounded-[1rem] shadow p-3">
                                    <p className="text-gray-600 text-sm">Véhicule</p>
                                    <span className="font-semibold capitalize">
                                        {travel.car_type ?? '—'} {travel.car_model ? `· ${travel.car_model}` : ''}
                                    </span>
                                </div>
                                <div className="bg-gray-100 rounded-[1rem] shadow p-3">
                                    <p className="text-gray-600 text-sm">Poids Max</p>
                                    <span className="font-semibold">{travel.max_weight ?? '—'} kg</span>
                                </div>
                                <div className="bg-gray-100 rounded-[1rem] shadow p-3">
                                    <p className="text-gray-600 text-sm">Immatriculation</p>
                                    <span className="font-semibold uppercase">{travel.car_identifier ?? '—'}</span>
                                </div>
                            </div>

                            {/* Image thumbnails */}
                            {images.length > 0 && (
                                <div className="flex gap-4">
                                    {images.map((img, index) => (
                                        <div key={index}>
                                            <img
                                                src={storageUrl(img.path)}
                                                alt=""
                                                className={`w-full h-15 rounded-2xl cursor-pointer ${
                                                    selectedImage === index
                                                        ? "border-3 border-[#46c48f]"
                                                        : "border-transparent"
                                                }`}
                                                onClick={() => setSelectedImage(index)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Price + CTA */}
                            <div className="flex flex-col xl:flex-row gap-2 items-center justify-between px-8 py-4">
                                <div>
                                    <span className="text-[#0984E3] text-[1.6rem] font-bold">
                                        {travel.price} MAD
                                    </span>
                                </div>
                                <div className="flex flex-col xl:flex-row items-center gap-6 mt-10 xl:mt-0">
                                    <ModalSend
                                        className="btn btn-ghost bg-[#0984E3] hover:border-[#0984E3] text-white rounded-2xl"
                                        text="Réserver ce trajet"
                                        travel={travel}
                                    />
                                    <button className="cursor-pointer font-bold">
                                        Contacter {travel.user?.name} →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default TravelDetail