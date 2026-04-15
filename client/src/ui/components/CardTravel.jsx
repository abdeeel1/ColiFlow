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

const CardTravel = ({ville_depart, ville_darrive, prix, type, date, voyageur, image, verified}) => {
  return (
    <Card className="relative mx-auto w-full max-w-sm pt-0 flex flex-col">
      <div className="absolute inset-0 z-30 aspect-video" />
      <img
        src={image}
        alt=""
        className=""
      />
      <CardHeader>
        <div className="flex flex-row gap-4 items-center">
            <MoveVertical color="gray" />
            <div className="flex flex-col gap-2">
                <CardTitle className="capitalize text-sm">{ville_depart}</CardTitle>
                <CardTitle className="capitalize text-sm">{ville_darrive}</CardTitle>
            </div>
        </div>
        <CardDescription>
          <div>
            <div className="flex justify-between items-center my-4">
                <div className="flex flex-col gap-2">
                    <p className="text-[#636E72]">Prix</p>
                    <p className="text-[#001638] font-bold text-xl">{prix} MAD</p>
                </div>

                <button className="btn btn-sm btn-ghost rounded-4xl  bg-[#0984E3] text-white py-2 px-4  hover:bg-[#076bc8]">
                  <ArrowRight size={16} />
                </button>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardFooter className="bg-white mx-2">
        <div>
            <CardTitle className="text-[#001638] text-sm">Details</CardTitle>
            <CardDescription className="text-[#636E72] text-sm flex flex-col gap-4 mt-4">
                <p><span className="text-[#001638] font-semibold">Type de colis :</span> {type}</p>
                <p><span className="text-[#001638] font-semibold">Date :</span> {date}</p>
                <p className="flex gap-1 items-center"><span className="text-[#001638] font-semibold">Voyageur :</span> {voyageur} <span>{verified && <BadgeCheck className="text-[#0095F6] size-5" fill="#0095F6" color="white" />}</span></p>
            </CardDescription>
        </div>
      </CardFooter>
    </Card>
  )
}

export default CardTravel;