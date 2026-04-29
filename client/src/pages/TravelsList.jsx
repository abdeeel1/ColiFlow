import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMapEvent,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"

import L from "leaflet"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
import { useEffect, useRef, useState } from "react"
import {
    ArrowRight,
    BadgeCheck,
    Calendar,
    Divide,
    Heart,
    Map,
    MapPin,
    Package,
    Search,
    Star,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Dropdown } from "@heroui/react"
import DropdownFilter from "@/ui/DropdownFilter"
import SelectFilter from "@/ui/SelectFilter"
import DrawerRight from "@/ui/DrawerRight"
import MapDrawer from "@/ui/MapDrawer"
import ModalSend from "@/ui/ModalSend"
import axiosClient from "@/services/axios"
import { useSelector } from "react-redux"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

const TravelsList = () => {
    const { user } = useSelector((state) => state.auth)

    const [loading, setLoading] = useState(false)

    const [extraFilters, setExtraFilters] = useState({
        verified: false,
        minPrice: 0,
        maxPrice: 5000,
        vehicleType: null,
        rating: null,
    })

    const FormSchema = z.object({
        depart: z.string().trim().min(3),
        arrive: z.string().trim().min(3),
        dateDepart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
        typeColis: z.string().trim(),
    })

    const { register, handleSubmit, reset, watch } = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            depart: "",
            arrive: "",
            dateDepart: "",
            typeColis: "",
        },
    })

    const filters = watch()

    const isFiltered =
        filters.depart ||
        filters.arrive ||
        filters.dateDepart ||
        filters.typeColis ||
        extraFilters.verified ||
        extraFilters.minPrice > 0 ||
        extraFilters.maxPrice < 5000 ||
        extraFilters.vehicleType

    const handleBudgetChange = (priceRange) => {
        const updated = {
            ...extraFilters,
            minPrice: priceRange.min,
            maxPrice: priceRange.max,
        }
        setExtraFilters(updated)
        applyAllFilters(filters, updated)
    }

    const handleVehicleTypeChange = (vehicleType) => {
        const updated = {
            ...extraFilters,
            vehicleType: vehicleType === "tous" ? null : vehicleType,
        }
        setExtraFilters(updated)
        applyAllFilters(filters, updated)
    }

    const debounceRef = useRef(null)

    const applyAllFilters = (searchFilters, allExtraFilters) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true)

            try {
                const params = {}

                if (searchFilters.depart)
                    params.from_city = searchFilters.depart
                if (searchFilters.arrive) params.to_city = searchFilters.arrive
                if (searchFilters.dateDepart)
                    params.departure_date = searchFilters.dateDepart
                if (searchFilters.typeColis)
                    params.max_weight = searchFilters.typeColis
                if (allExtraFilters.verified) params.verified = 1
                if (allExtraFilters.minPrice !== 0)
                    params.min_price = allExtraFilters.minPrice
                if (allExtraFilters.maxPrice !== 5000)
                    params.max_price = allExtraFilters.maxPrice
                if (allExtraFilters.vehicleType)
                    params.car_type = allExtraFilters.vehicleType

                const res = await axiosClient.get("/api/travels", { params })

                setTravelsAnnouncement(res.data)
                setPage(1)
                setFilterdCards(res.data)
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false)
            }
        }, 400)
    }

    const onSubmitData = async (data) => {
        applyAllFilters(data, extraFilters)
    }

    const [travelsAnnouncement, setTravelsAnnouncement] = useState([])

    useEffect(() => {
        const fetchAnnounement = async () => {
            try {
                const res = await axiosClient.get("/api/travels")
                setTravelsAnnouncement(res.data)
            } catch (err) {
                console.log(err)
            }
        }

        fetchAnnounement()
    }, [])

    const [filterdCards, setFilterdCards] = useState(travelsAnnouncement)

    useEffect(() => {
        setFilterdCards(travelsAnnouncement)
    }, [travelsAnnouncement])

    const [page, setPage] = useState(1)
    const ITEMS_PER_PAGE = 4
    const [visibleCards, setVisibleCards] = useState([])
    const loaderRef = useRef(null)
    const [savedTravel, setSavedTravel] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        if (user?.is_traveler) {
            navigate("/")
        }
    }, [user, navigate])

    const MapBoundsFilter = () => {
        useMapEvent("moveend", (e) => {
            const bounds = e.target.getBounds()

            const visible = travelsAnnouncement.filter((travel) =>
                bounds.contains([travel.latitude, travel.longitude]),
            )

            setFilterdCards(visible)
            setPage(1)
        })

        return null
    }

    useEffect(() => {
        const nextItems = filterdCards.slice(0, page * ITEMS_PER_PAGE)

        if (nextItems.length === visibleCards.length) return

        setVisibleCards(nextItems)
    }, [page, filterdCards])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    visibleCards.length < filterdCards.length
                ) {
                    setPage((prev) => prev + 1)
                }
            },
            {
                root: null,
                rootMargin: "100px",
                threshold: 0.1,
            },
        )

        if (loaderRef.current) observer.observe(loaderRef.current)

        return () => observer.disconnect()
    }, [visibleCards, filterdCards])

    useEffect(() => {
        const container = loaderRef.current?.parentElement

        if (!container) return

        if (
            container.scrollHeight <= container.clientHeight &&
            visibleCards.length < filterdCards.length
        ) {
            setPage((prev) => prev + 1)
        }
    }, [visibleCards, filterdCards])

    const saveToggle = (e, id) => {
        e.stopPropagation()

        setSavedTravel((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        )
    }

    const handleReset = async () => {
        try {
            reset()
            setExtraFilters({
                verified: false,
                minPrice: 0,
                maxPrice: 5000,
                vehicleType: null,
                rating: null,
            })

            const res = await axiosClient.get("/api/travels")

            setTravelsAnnouncement(res.data)
            setPage(1)
            setVisibleCards([])
            setFilterdCards(res.data)
        } catch (err) {
            console.log(err)
        }
    }

    const Divider = () => (
        <div className="hidden lg:block w-px self-stretch bg-gray-200 my-2" />
    )

    return (
        <main>
            {/* Desktop Version +lg */}
            <form
                onSubmit={handleSubmit(onSubmitData)}
                className="hidden lg:flex justify-center items-center bg-white rounded-full border border-gray-200 px-2.5 py-0 gap-1 max-w-4xl mx-auto mt-2 "
            >
                <div className="flex w-full items-center gap-2 px-3 xl:px-4 flex-1 min-w-0">
                    <div className="flex flex-col min-w-0 w-full">
                        <input
                            {...register("depart")}
                            type="text"
                            placeholder="Ville de départ"
                            className="border-none outline-none bg-transparent text-xs xl:text-sm text-gray-800 placeholder-gray-300 py-0.5 w-full"
                        />
                    </div>
                </div>

                <Divider />

                <div className="flex items-center gap-2 px-3 xl:px-4 flex-1 min-w-0">
                    <div className="flex flex-col min-w-0 w-full">
                        <input
                            {...register("arrive")}
                            type="text"
                            placeholder="Ville d'arrivée"
                            className="border-none outline-none bg-transparent text-xs xl:text-sm text-gray-800 placeholder-gray-300 py-0.5 w-full"
                        />
                    </div>
                </div>

                <Divider />

                <div
                    className="flex items-center gap-2 px-3 xl:px-4"
                    style={{ flex: "0.8" }}
                >
                    <div className="flex flex-col min-w-0 w-full">
                        <input
                            {...register("dateDepart")}
                            type="date"
                            className="border-none outline-none bg-transparent text-xs xl:text-sm text-gray-800 py-0.5 w-full"
                        />
                    </div>
                </div>

                <Divider />

                <div
                    className="flex items-center gap-2 px-3 xl:px-4"
                    style={{ flex: "0.9" }}
                >
                    <div className="flex flex-col min-w-0 w-full">
                        <select
                            {...register("typeColis")}
                            className="border-none select select-xs outline-none bg-white text-sm text-gray-800 w-full  flex items-center"
                        >
                            <option value="" disabled>
                                Select Type
                            </option>
                            <option value="1">Petit</option>
                            <option value="2">Moyen</option>
                            <option value="3">Grand</option>
                            <option value="4">Volumineux</option>
                        </select>
                    </div>
                </div>

                <button className="bg-[#0984E3] cursor-pointer hover:bg-[#085fa1] active:scale-95 text-white text-xs xl:text-sm font-semibold px-3 py-1 my-2 rounded-full shrink-0 transition-all">
                    {loading ? (
                        <span className="loading loading-spinner loading-sm text-white"></span>
                    ) : (
                        <Search className="size-[1.3rem]" />
                    )}
                </button>
            </form>

            <div className="hidden lg:flex gap-2 items-center my-4">
                <DropdownFilter onBudgetChange={handleBudgetChange} />
                <div>
                    <SelectFilter
                        onVehicleTypeChange={handleVehicleTypeChange}
                    />
                </div>

                <div>
                    <button
                        onClick={async () => {
                            const updated = {
                                ...extraFilters,
                                verified: !extraFilters.verified,
                            }
                            setExtraFilters(updated)
                            applyAllFilters(filters, updated)
                        }}
                        className={`px-4 py-[0.52rem] rounded-2xl font-bold text-sm cursor-pointer transition-all ${
                            extraFilters.verified
                                ? "bg-[#0984E3] text-white"
                                : "bg-white text-[#757575] border border-gray-300"
                        }`}
                    >
                        Vérifiés
                    </button>
                </div>
                <div>
                    <DrawerRight />
                </div>
            </div>

            <div className="hidden lg:flex w-full gap-4 h-screen mt-10">
                {/* LEFT: CARDS */}
                <div className="w-full flex flex-col gap-4 overflow-y-auto h-full">
                    <div className="flex justify-between items-center px-10">
                        <h3 className="text-[#6B7280] text-[1rem]">
                            +{filterdCards.length} Trajets disponibles
                        </h3>

                        {isFiltered && (
                            <button
                                onClick={handleReset}
                                className="btn btn-sm btn-error text-white font-semibold"
                            >
                                Réinitialiser
                            </button>
                        )}
                    </div>
                    <hr className="bg-gray-400 my-4" />

                    {filterdCards.length > 0 ? (
                        <>
                            {visibleCards.map((travel) => (
                                <div
                                    key={travel.id}
                                    className="bg-white rounded-2xl mb-4 p-8 mx-10 cursor-pointer hover:bg-gray-100 hover:transition-all"
                                    onClick={() =>
                                        navigate(`/travel/${travel.id}`)
                                    }
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="flex items-center gap-2">
                                                {travel.user?.name}
                                                {travel.user
                                                    ?.statut_verification ===
                                                    "verified" && (
                                                    <BadgeCheck
                                                        className="text-[#0095F6] size-5"
                                                        fill="#0095F6"
                                                        color="white"
                                                    />
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <button
                                                className="cursor-pointer"
                                                onClick={(e) =>
                                                    saveToggle(e, travel.id)
                                                }
                                            >
                                                <Heart
                                                    stroke="#838383"
                                                    fill={
                                                        savedTravel.includes(
                                                            travel.id,
                                                        )
                                                            ? "#FFA2A3"
                                                            : "#FFF"
                                                    }
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <h4 className="flex py-1 text-[1.4rem] items-center capitalize gap-1">
                                        {travel.from_city?.name} <ArrowRight />{" "}
                                        {travel.to_city?.name}
                                    </h4>

                                    <div className="flex gap-4 items-center py-5 capitalize">
                                        <p>
                                            {new Date(
                                                travel.departure_date,
                                            ).toLocaleString()}
                                        </p>
                                        <p>{travel.car_type}</p>
                                        <p>
                                            {travel.max_weight == 1
                                                ? "- 1"
                                                : travel.max_weight == 2
                                                  ? "1-5"
                                                  : travel.max_weight == 3
                                                    ? "5-15"
                                                    : "+ 15"}{" "}
                                            kg max
                                        </p>
                                    </div>

                                    <div className="text-[#0984E3]">
                                        <ModalSend
                                            className="text-[#0984E3]"
                                            text={"Envoyer un colis"}
                                            travel={travel}
                                        />
                                    </div>

                                    <div className="mt-10 justify-between flex items-center">
                                        {/* <div className="flex wfy  gap-1 items-center">
                      {[...Array(5)].map((star, i) => (
                        <Star
                          key={i}
                          className={
                            i < travel.rating
                              ? "fill-yellow-400 stroke-yellow-500"
                              : "text-gray-300"
                          }
                        />
                      ))}

                      <span className="text-[0.8rem]">
                        ({travel.review} Review)
                      </span>
                    </div> */}

                                        <div>
                                            <p className="capitalize text-[1.3rem] font-bold text-[#374151]">
                                                {travel.price} MAD{" "}
                                                <span className="text-[0.8rem] text-gray-400 font-normal">
                                                    /{" "}
                                                    {travel.max_weight == 1
                                                        ? "Petit"
                                                        : travel.max_weight == 2
                                                          ? "Moyen"
                                                          : travel.max_weight ==
                                                              3
                                                            ? "Grand"
                                                            : "Volumineux"}{" "}
                                                    colis
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* loader */}
                            {visibleCards.length < filterdCards.length && (
                                <div
                                    ref={loaderRef}
                                    className="text-center py-4"
                                >
                                    Loading...
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="font-bold text-center">
                            Aucun voyage trouvé dans cette zone. Essayez de
                            dézoomer !
                        </p>
                    )}
                </div>

                {/* RIGHT: MAP */}
                <div className="w-full z-40">
                    <MapContainer
                        center={[31.7917, -7.0926]}
                        zoom={6}
                        zoomControl={false}
                        className="w-full h-full"
                    >
                        <TileLayer
                            attribution="&copy; OpenStreetMap contributors"
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <MapBoundsFilter />

                        {travelsAnnouncement.map((travel) => (
                            <Marker
                                key={travel.id}
                                position={[travel.latitude, travel.longitude]}
                            >
                                <Popup>
                                    <strong>{travel.user?.name}</strong>
                                    <br />
                                    De : {travel.from_city?.name} à{" "}
                                    {travel.to_city?.name}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>

            {/* Mobile Version -lg */}
            <div className="lg:hidden flex flex-col gap-5">
                <div className="flex flex-col lg:hidden bg-white rounded-2xl border border-gray-200 w-full max-w-md overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                        <div className="flex flex-col w-full">
                            <input
                                type="text"
                                placeholder="Ville de départ"
                                className="border-none outline-none bg-transparent text-sm text-gray-800 placeholder-gray-300"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                        <div className="flex flex-col w-full">
                            <input
                                type="text"
                                placeholder="Ville d'arrivée"
                                className="border-none outline-none bg-transparent text-sm text-gray-800 placeholder-gray-300"
                            />
                        </div>
                    </div>

                    <div className="flex gap-0">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-r border-gray-100 flex-1">
                            <div className="flex flex-col w-full">
                                <input
                                    type="date"
                                    className="border-none outline-none bg-transparent text-sm text-gray-800 w-full"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-1">
                            <div className="flex flex-col w-full">
                                <input
                                    type="text"
                                    placeholder="Fragile, alimentaire..."
                                    className="border-none outline-none bg-transparent text-sm text-gray-800 placeholder-gray-300 w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-3">
                        <button className="w-full bg-[#0984E3] hover:bg-[#0984E3] active:scale-95 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">
                            Trouver un trajet
                        </button>
                    </div>
                </div>

                <div>
                    <div className="w-full flex flex-col gap-4 overflow-y-auto h-full my-10">
                        <div className="flex justify-between items-center px-4">
                            <h3 className="text-[#6B7280] text-[0.9rem]">
                                +{filterdCards.length} Trajets disponibles
                            </h3>

                            <div>
                                <MapDrawer
                                    travelsAnnouncement={travelsAnnouncement}
                                    MapBoundsFilter={MapBoundsFilter}
                                />
                            </div>
                        </div>
                        <hr className="bg-gray-400 my-4" />

                        {filterdCards.length > 0 ? (
                            <>
                                <div className="flex gap-3 mb-3 overflow-x-auto no-scrollbar">
                                    <div className="shrink-0">
                                        <DropdownFilter />
                                    </div>
                                    <div className="shrink-0">
                                        <SelectFilter />
                                    </div>
                                    <div className="shrink-0">
                                        <button className="px-4 py-[0.52rem] bg-white rounded-2xl font-bold text-sm text-[#757575] cursor-pointer">
                                            Verification
                                        </button>
                                    </div>
                                    <div className="shrink-0">
                                        <DrawerRight />
                                    </div>
                                </div>
                                {visibleCards.map((travel) => (
                                    <div
                                        key={travel.id}
                                        className="bg-white rounded-2xl mb-4 p-8  cursor-pointer w-full"
                                        onClick={() =>
                                            navigate(`/travel/${travel.id}`)
                                        }
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="flex items-center gap-2">
                                                    {travel.user?.name}
                                                    {travel.user
                                                        ?.statut_verification && (
                                                        <BadgeCheck
                                                            className="text-[#0095F6] size-5"
                                                            fill="#0095F6"
                                                            color="white"
                                                        />
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <button
                                                    className="cursor-pointer"
                                                    onClick={(e) =>
                                                        saveToggle(e, travel.id)
                                                    }
                                                >
                                                    <Heart
                                                        stroke="#838383"
                                                        fill={
                                                            savedTravel.includes(
                                                                travel.id,
                                                            )
                                                                ? "#FFA2A3"
                                                                : "#FFF"
                                                        }
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        <h4 className="flex py-1 text-[1.3rem] items-center capitalize gap-1">
                                            {travel.from_city?.name}{" "}
                                            <ArrowRight />{" "}
                                            {travel.to_city?.name}
                                        </h4>

                                        <div className="flex gap-4 text-[0.8rem] text-center items-center py-5 capitalize">
                                            <p>
                                                {new Date(
                                                    travel.departure_date,
                                                ).toLocaleString()}
                                            </p>
                                            <p>{travel.car_type}</p>
                                            <p>
                                                {travel.max_weight == 1
                                                    ? "- 1"
                                                    : travel.max_weight == 2
                                                      ? "1-5"
                                                      : travel.max_weight == 3
                                                        ? "5-15"
                                                        : "+ 15"}{" "}
                                                kg max
                                            </p>
                                        </div>

                                        <div className="text-[#0984E3]">
                                            <ModalSend
                                                className="text-[#0984E3]"
                                                text={"Envoyer un colis"}
                                                travel={travel}
                                            />
                                        </div>

                                        <div className="mt-5 justify-between flex flex-col gap-4 items-center">
                                            <div className="flex flex-col w-32  gap-1 items-center">
                                                {/* <div className="flex">
                          {[...Array(5)].map((star, i) => (
                            <Star
                              size={15}
                              key={i}
                              className={
                                i < travel.rating
                                  ? "fill-yellow-400 stroke-yellow-500"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div> */}

                                                {/* <div>
                          <span className="text-[0.7rem]">
                            ({travel.review} Review)
                          </span>
                        </div> */}
                                            </div>

                                            <div>
                                                <p className="capitalize text-[1.3rem] font-bold text-[#374151]">
                                                    {travel.price} MAD{" "}
                                                    <span className="text-[0.8rem] text-gray-400 font-normal">
                                                        /{" "}
                                                        {travel.max_weight == 1
                                                            ? "Petit"
                                                            : travel.max_weight ==
                                                                2
                                                              ? "Moyen"
                                                              : travel.max_weight ==
                                                                  3
                                                                ? "Grand"
                                                                : "Volumineux"}{" "}
                                                        colis
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* loader */}
                                {visibleCards.length < filterdCards.length && (
                                    <div
                                        ref={loaderRef}
                                        className="text-center py-4"
                                    >
                                        Loading...
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="font-bold text-center">
                                Aucun voyage trouvé dans cette zone. Essayez de
                                dézoomer !
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}

export default TravelsList
