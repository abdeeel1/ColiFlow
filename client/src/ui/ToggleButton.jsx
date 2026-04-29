import { Package, TruckElectric } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import axiosClient from "@/services/axios"
import { setUser } from "@/store/slices/authSlice"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const ToggleButton = () => {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const [successMessage, setSuccessMessage] = useState("")

    const isTraveler = user?.is_traveler

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage)
        }
    }, [successMessage])

    const handleToggle = async () => {
        if (!user) return
        setSuccessMessage("")

        try {
            const newValue = !isTraveler

            const res = await axiosClient.post("/api/switch-role", {
                is_traveler: newValue,
            })

            setSuccessMessage(capitalize(res.data.message))

            dispatch(setUser(res.data.user))
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div
            onClick={handleToggle}
            className="relative lg:w-48 lg:h-8 w-full h-8 bg-gray-200 rounded-full cursor-pointer flex items-center shadow-inner transition-all duration-300"
        >
            {/* Slider */}
            <div
                className={`absolute w-1/2 h-full bg-[#0984E3] rounded-full shadow-md transition-transform duration-300 ease-in-out ${
                    isTraveler
                        ? "translate-x-full rtl:-translate-x-full"
                        : "translate-x-0"
                }`}
            />

            {/* Icons */}
            <div className="relative flex w-full z-10 select-none">
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
