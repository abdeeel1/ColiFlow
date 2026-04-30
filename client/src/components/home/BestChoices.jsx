import CardTravel from "@/ui/components/CardTravel"
import SearchTravel from "../../ui/components/SearchTravel"
import { Button } from "../ui/button"
import { Zap } from "lucide-react"
import ActionLink from "@/ui/ActionLink"
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import axiosClient from "@/services/axios"

const BestChoices = () => {
    const { t } = useTranslation()

    

    const [travelsFeatured, setTravelFeatured] = useState([])

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await axiosClient.get("/api/travels/featured")
                setTravelFeatured(res.data)
            } catch (err) {
                console.log(err)
            }
        }

        

        fetchFeatured()
    }, [])

    return (
        <section>
            <div className="flex justify-center items-center flex-col space-y-10">
                <p className="text-center font-clashdisplay font-bold text-2xl xl:text-3xl">
                    {t("Qu'attendez-vous ? Commencez dès maintenant")}
                </p>

                <SearchTravel />

                <div className="md:py-10 flex flex-col gap-12">
                    <p className="text-center font-semibold text-xl xl:text-2xl font-clashdisplay">
                        {t("Les meilleures opportunités de livraison")}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-10 lg:gap-14 place-items-center justify-center items-center  md:py-0">
                        {travelsFeatured.map((travel) => (
                            <div className="w-full" key={travel.id}>
                                <CardTravel
                                    ville_depart={travel.from_city?.name}
                                    ville_darrive={travel.to_city?.name}
                                    prix={travel.price}
                                    type={travel.max_weight}
                                    date={travel.departure_date}
                                    voyageur={travel.user?.name}
                                    verified={travel.user?.statut_verification}
                                    image={""}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="py-2 md:w-[75%] xl:w-[44%] bg-[#0984E3] mx-auto my-10 rounded-2xl text-sm w-full">
                    <div className="flex gap-2 md:gap-10 justify-center md:justify-evenly items-center px-4">
                        <p className="text-white font-semibold text-[0.5rem] md:text-[0.938rem] text-center">
                            Une solution simple, rapide et 100% marocaine
                        </p>

                        <ActionLink text="Read More" link="#" />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default BestChoices
