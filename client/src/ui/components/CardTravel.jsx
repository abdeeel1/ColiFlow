import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ArrowRight, BadgeCheck, MoveVertical, Verified } from "lucide-react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

const CardTravel = ({
    ville_depart,
    ville_darrive,
    prix,
    type,
    date,
    voyageur,
    verified,
}) => {
    const cityImages = {
        Casablanca: "/images/cities/Casablanca.png",
        Rabat: "/images/cities/Rabat.png",
        Marrakech: "/images/cities/Marrakech.png",
        Tangier: "/images/cities/Tanger.png",
        Fes: "/images/cities/Fes.png",
        Agadir: "/images/cities/Agadir.png",
        Tetouan: "/images/cities/Tetouan.png",
        Oujda: "/images/cities/Oujda.png",
        Kenitra: "/images/cities/Kenitra.png",
        ElJadida: "/images/cities/ElJadida.png",
    }

    const navigate = useNavigate();

    const {user} = useSelector((state) => state.auth)

    const isTraveler = user?.is_traveler

    const handleClick = (e) => {

        e.preventDefault()

        if(isTraveler) {
            toast.error('Passez en mode expéditeur pour réserver')
        }else{
            navigate('/travels')
        }
    }

    return (
        <Card className="relative mx-auto w-full max-w-sm pt-0 flex flex-col">
            <div className="absolute inset-0 z-30 aspect-video pointer-events-none" />
            <img
                src={cityImages[ville_depart]}
                alt=""
                className=""
                loading="lazy"
            />
            <CardHeader>
                <div className="flex flex-row gap-4 items-center">
                    <MoveVertical color="gray" />
                    <div className="flex flex-col gap-2">
                        <CardTitle className="capitalize text-sm">
                            {ville_depart}
                        </CardTitle>
                        <CardTitle className="capitalize text-sm">
                            {ville_darrive}
                        </CardTitle>
                    </div>
                </div>
                <CardDescription>
                    <div>
                        <div className="flex justify-between items-center my-4">
                            <div className="flex flex-col gap-2">
                                <p className="text-[#636E72]">Prix</p>
                                <p className="text-[#001638] font-bold text-xl">
                                    {prix} MAD
                                </p>
                            </div>

                            <button type="button" onClick={handleClick} className="btn btn-sm btn-ghost hover:border-[#0984E3] rounded-4xl  bg-[#0984E3] text-white py-2 px-4 cursor-pointer  hover:bg-[#076bc8]">
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardFooter className="bg-white mx-2">
                <div>
                    <CardTitle className="text-[#001638] text-sm">
                        Details
                    </CardTitle>
                    <CardDescription className="text-[#636E72] text-sm flex flex-col gap-4 mt-4">
                        <p>
                            <span className="text-[#001638] font-semibold">
                                Type de colis :
                            </span>{" "}
                            {type == 1
                                ? "Petit"
                                : type == 2
                                  ? "Moyen"
                                  : type == 3
                                    ? "Grand"
                                    : "Volumineux"}
                        </p>
                        <p>
                            <span className="text-[#001638] font-semibold">
                                Date :
                            </span>{" "}
                            {new Date(date).toLocaleString()}
                        </p>
                        <p className="flex gap-1 items-center">
                            <span className="text-[#001638] font-semibold">
                                Voyageur :
                            </span>{" "}
                            {voyageur}{" "}
                            <span>
                                {verified === "verified" && (
                                    <BadgeCheck
                                        className="text-[#0095F6] size-5"
                                        fill="#0095F6"
                                        color="white"
                                    />
                                )}
                            </span>
                        </p>
                    </CardDescription>
                </div>
            </CardFooter>
        </Card>
    )
}

export default CardTravel
