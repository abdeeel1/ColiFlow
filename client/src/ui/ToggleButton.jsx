import { Package, TruckElectric, Loader2 } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import axiosClient from "@/services/axios"
import { setUser } from "@/store/slices/authSlice"
import { useState } from "react"
import { toast } from "sonner"

const ToggleButton = () => {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const [loading, setLoading] = useState(false)

    const isTraveler = user?.is_traveler

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

    const handleToggle = async () => {
        if (!user || loading) return

        setLoading(true)
        try {
            const newValue = !isTraveler

            const res = await axiosClient.post("/api/switch-role", {
                is_traveler: newValue,
            })

            dispatch(setUser(res.data.user))
            toast.success(capitalize(res.data.message))
        } catch (err) {
            console.error(err)
            toast.error("Impossible de changer de rôle. Réessayez.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            onClick={handleToggle}
            aria-busy={loading}
            className={`relative lg:w-48 lg:h-8 w-full h-8 bg-gray-200 rounded-full flex items-center shadow-inner transition-all duration-300 ${
                loading ? "cursor-wait opacity-90" : "cursor-pointer"
            }`}
        >
            {/* Slider */}
            <div
                className={`absolute w-1/2 h-full bg-[#0984E3] rounded-full shadow-md transition-transform duration-300 ease-in-out flex items-center justify-center ${
                    isTraveler
                        ? "translate-x-full rtl:-translate-x-full"
                        : "translate-x-0"
                }`}
            >
                {loading && (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                )}
            </div>

            {/* Icons */}
            <div
                className={`relative flex w-full z-10 select-none transition-opacity duration-200 ${
                    loading ? "opacity-40" : "opacity-100"
                }`}
            >
                <span
                    className={`w-1/2 flex justify-center items-center transition-colors duration-300 ${
                        !isTraveler ? "text-white" : "text-gray-400"
                    }`}
                >
                    <Package className="w-5 lg:w-5" />
                </span>

                <span
                    className={`w-1/2 flex justify-center items-center transition-colors duration-300 ${
                        isTraveler ? "text-white" : "text-gray-400"
                    }`}
                >
                    <TruckElectric className="w-5 lg:w-5" />
                </span>
            </div>
        </div>
    )
}

export default ToggleButton
