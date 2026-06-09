import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Filter, Heart, Search } from 'lucide-react'
import axiosClient from '@/services/axios'
import Sidebar from '../partials/Sidebar'
import Header from '../partials/Header'
import ModalSend from '@/ui/ModalSend'

const cityImages = {
    Casablanca: '/images/cities/Casablanca.png',
    Rabat: '/images/cities/Rabat.png',
    Marrakech: '/images/cities/Marrakech.png',
    Tangier: '/images/cities/Tanger.png',
    Fes: '/images/cities/Fes.png',
    Agadir: '/images/cities/Agadir.png',
    Tetouan: '/images/cities/Tetouan.png',
    Oujda: '/images/cities/Oujda.png',
    Kenitra: '/images/cities/Kenitra.png',
    ElJadida: '/images/cities/ElJadida.png',
}

const WEIGHT_LABEL = { 1: '- 1', 2: '1 - 5', 3: '5 - 15', 4: '+ 15' }

const CAT_LABEL = {
    electronique: 'Électronique', documents: 'Documents',
    mode: 'Mode', maison: 'Maison', autre: 'Autre',
}
const CAT_COLOR = {
    electronique: 'bg-blue-100 text-blue-600',
    documents: 'bg-purple-100 text-purple-600',
    mode: 'bg-pink-100 text-pink-600',
    maison: 'bg-green-100 text-green-600',
    autre: 'bg-gray-100 text-gray-600',
}

const avatarOf = (user) =>
    user?.profile_picture
        ? user.profile_picture
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? '?')}&background=0984E3&color=fff`

const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="h-36 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="p-4 flex flex-col gap-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
            <div className="flex justify-between items-center mt-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-24 animate-pulse" />
            </div>
        </div>
    </div>
)

const ITEMS_PER_PAGE = 6

const Favoris = () => {
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const [loading, setLoading] = useState(true)
    const [travels, setTravels] = useState([])

    const [search, setSearch] = useState('')
    const [routeFilter, setRouteFilter] = useState('')
    const [appliedSearch, setAppliedSearch] = useState('')
    const [appliedRoute, setAppliedRoute] = useState('')
    const [page, setPage] = useState(1)

    useEffect(() => {
        axiosClient
            .get('/api/favorites')
            .then((res) => setTravels(res.data.travels))
            .catch((err) => console.log(err))
            .finally(() => setLoading(false))
    }, [])

    const handleUnfavorite = async (e, id) => {
        e.stopPropagation()

        try {
            await axiosClient.post(`/api/travels/${id}/favorite`)
            setTravels((prev) => prev.filter((travel) => travel.id !== id))
        } catch (err) {
            console.log(err)
        }
    }

    const routeLabel = (travel) =>
        `${travel.from_city?.name ?? ''} → ${travel.to_city?.name ?? ''}`

    const routes = useMemo(
        () => [...new Set(travels.map(routeLabel))],
        [travels],
    )

    const travelers = useMemo(() => {
        const seen = new Map()
        travels.forEach((t) => {
            if (t.user && !seen.has(t.user.id)) seen.set(t.user.id, t.user)
        })
        return [...seen.values()]
    }, [travels])

    const filteredTravels = useMemo(() => {
        const query = appliedSearch.toLowerCase().trim()

        return travels.filter((travel) => {
            const matchesQuery =
                !query ||
                (travel.user?.name ?? '').toLowerCase().includes(query) ||
                (travel.from_city?.name ?? '').toLowerCase().includes(query) ||
                (travel.to_city?.name ?? '').toLowerCase().includes(query)

            const matchesRoute =
                !appliedRoute || routeLabel(travel) === appliedRoute

            return matchesQuery && matchesRoute
        })
    }, [travels, appliedSearch, appliedRoute])

    const totalPages = Math.max(1, Math.ceil(filteredTravels.length / ITEMS_PER_PAGE))
    const startIndex = (page - 1) * ITEMS_PER_PAGE
    const paginated = filteredTravels.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    const applyFilters = () => {
        setAppliedSearch(search)
        setAppliedRoute(routeFilter)
        setPage(1)
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="grow">
                    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

                        {/* Title */}
                        <div className="sm:flex sm:justify-between sm:items-center mb-6">
                            <div>
                                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-1">
                                    Mes Voyageurs Favoris
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Retrouvez ici les profils de confiance avec qui vous avez déjà collaboré.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 mt-4 sm:mt-0">
                                <div className="text-right">
                                    <p className="text-xs text-gray-400">Total</p>
                                    <p className="font-bold text-gray-800 dark:text-gray-100">
                                        : {travelers.length} Voyageur{travelers.length > 1 ? 's' : ''}
                                    </p>
                                </div>
                                {travelers.length > 0 && (
                                    <div className="flex -space-x-3">
                                        {travelers.slice(0, 3).map((t) => (
                                            <img
                                                key={t.id}
                                                src={avatarOf(t)}
                                                alt={t.name}
                                                className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                                            />
                                        ))}
                                        {travelers.length > 3 && (
                                            <div className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-800 bg-[#0984E3] text-white text-xs font-bold flex items-center justify-center">
                                                +{travelers.length - 3}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Filter bar */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-xl px-4 py-3 mb-6 shadow-xs">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Chercher un nom ou une ville..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 pr-4 py-2 w-full text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-[#0984E3] dark:text-gray-200"
                                />
                            </div>

                            <select
                                value={routeFilter}
                                onChange={(e) => setRouteFilter(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-[#0984E3] capitalize"
                            >
                                <option value="">Trajet fréquent</option>
                                {routes.map((r) => (
                                    <option key={r} value={r} className="capitalize">{r}</option>
                                ))}
                            </select>

                            <button
                                onClick={applyFilters}
                                className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg bg-[#0984E3] hover:bg-blue-600 active:scale-95 text-white shadow-sm transition cursor-pointer shrink-0"
                            >
                                <Filter size={15} />
                                Apply Filter
                            </button>
                        </div>

                        {/* Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        ) : filteredTravels.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {paginated.map((travel) => (
                                        <div
                                            key={travel.id}
                                            onClick={() => navigate(`/travel/${travel.id}`)}
                                            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xs hover:-translate-y-0.5 transition-transform duration-200 cursor-pointer flex flex-col"
                                        >
                                            <div className="relative h-36">
                                                <img
                                                    src={cityImages[travel.from_city?.name]}
                                                    alt={travel.from_city?.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                <button
                                                    onClick={(e) => handleUnfavorite(e, travel.id)}
                                                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center cursor-pointer"
                                                >
                                                    <Heart size={16} stroke="#FFA2A3" fill="#FFA2A3" />
                                                </button>
                                            </div>

                                            <div className="p-4 flex flex-col gap-2 grow">
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={avatarOf(travel.user)}
                                                        alt={travel.user?.name}
                                                        className="w-7 h-7 rounded-full object-cover"
                                                    />
                                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                                                        {travel.user?.name}
                                                    </span>
                                                    {travel.user?.statut_verification === 'verified' && (
                                                        <BadgeCheck className="text-[#0095F6] size-4 shrink-0" fill="#0095F6" color="white" />
                                                    )}
                                                </div>

                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 capitalize">
                                                    <span className="font-semibold text-gray-600 dark:text-gray-300">Trajet :</span>
                                                    {travel.from_city?.name} <ArrowRight size={12} /> {travel.to_city?.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="font-semibold text-gray-600 dark:text-gray-300">Poids :</span>{' '}
                                                    {WEIGHT_LABEL[travel.max_weight] ?? travel.max_weight} kg
                                                </p>

                                                {Array.isArray(travel.accepted_categories) && travel.accepted_categories.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                        {travel.accepted_categories.map((cat) => (
                                                            <span key={cat} className={`text-[0.65rem] font-semibold px-2 py-0.5 rounded-full ${CAT_COLOR[cat] ?? CAT_COLOR.autre}`}>
                                                                {CAT_LABEL[cat] ?? cat}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between mt-auto pt-3">
                                                    <span className="font-bold text-[#374151] dark:text-gray-100">
                                                        {travel.price}MAD
                                                    </span>
                                                    <ModalSend className="text-[#0984E3]" text="Réserver" travel={travel} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-8">
                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setPage(i + 1)}
                                                aria-label={`Page ${i + 1}`}
                                                className={`rounded-full transition-all cursor-pointer ${
                                                    page === i + 1
                                                        ? 'w-6 h-2.5 bg-[#0984E3]'
                                                        : 'w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 flex flex-col items-center gap-3 text-center shadow-xs">
                                <Heart className="text-gray-300" size={36} />
                                <p className="font-semibold text-gray-700 dark:text-gray-200">
                                    Aucun favori trouvé
                                </p>
                                <p className="text-sm text-gray-400">
                                    {travels.length === 0
                                        ? "Ajoutez des voyageurs à vos favoris depuis la liste des voyageurs pour les retrouver ici."
                                        : 'Essayez un autre terme de recherche ou un autre trajet.'}
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Favoris
