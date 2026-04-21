import ModalSend from "@/ui/ModalSend";
import TagChip from "@/ui/TagChip";
import { ArrowLeft, ArrowRight, Check, Divide, MapPin, Star } from "lucide-react";
import { Separator } from "radix-ui";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const TravelDetail = () => {
    
    const travelsAnnouncement = [
      {
        id: 1,
        verified: true,
        package: "petite",
        traveler: "Najib Abdessamad",
        description : "Je fais le trajet direct par l'autoroute. Je peux récupérer le colis près de Moulay Abdellah. Pas de liquides,  Pas de produits fragiles sans emballage, Remise en main propre",
        point : "Stade D'honor",
        ville_depart: "fez",
        ville_darrive: "rabat",
        date: "demain 9:00",
        type_veh: "voiture",
        poids: 10,
        direct: true,
        lat: 34.0331,
        lng: -5.0003,
        price: 75,
        rating: 5,
        review: 120,
        images : ['/vehicles/Dacia-Duster-1.webp', '/vehicles/Dacia-Duster-2.webp', '/vehicles/Dacia-Duster-3.webp']
      },
      {
        id: 2,
        verified: true,
        package: "grand",
        traveler: "Salaheddine Alaoui",
        description : "Je fais le trajet direct par l'autoroute. Je peux récupérer le colis près de Moulay Abdellah. Pas de liquides,  Pas de produits fragiles sans emballage, Remise en main propre",
        point : "Stade D'honor",
        ville_depart: "rabat",
        ville_darrive: "casablanca",
        date: "lundi 11:00",
        type_veh: "camionnette",
        poids: 25,
        direct: false,
        lat: 34.0209,
        lng: -6.8416,
        price: 80,
        rating: 4,
        review: 100,
        images : ['/vehicles/Kia-Picanto-1.webp', '/vehicles/Kia-Picanto-2.webp', '/vehicles/Kia-Picanto-3.webp']
      },
      {
        id: 3,
        verified: false,
        package: "volumineux",
        traveler: "Meriem Fadil",
        description : "Je fais le trajet direct par l'autoroute. Je peux récupérer le colis près de Moulay Abdellah. Pas de liquides,  Pas de produits fragiles sans emballage, Remise en main propre",
        point : "Stade D'honor",
        ville_depart: "oujda",
        ville_darrive: "marrakech",
        date: "mardi 8:00",
        type_veh: "petit camion",
        poids: 40,
        direct: true,
        lat: 34.6814,
        lng: -1.9086,
        price: 110,
        rating: 3,
        review: 10,
        images : ['/vehicles/Kia-Picanto-1.webp', '/vehicles/Kia-Picanto-2.webp', '/vehicles/Kia-Picanto-3.webp']
      },
      {
        id: 4,
        verified: true,
        package: "volumineux",
        traveler: "Aymane Morid",
        description : "Je fais le trajet direct par l'autoroute. Je peux récupérer le colis près de Moulay Abdellah. Pas de liquides,  Pas de produits fragiles sans emballage, Remise en main propre",
        point : "Stade D'honor",
        ville_depart: "laayoune",
        ville_darrive: "tanger",
        date: "mercredi 8:00",
        type_veh: "voiture",
        poids: 40,
        direct: true,
        lat: 26.85,
        lng: -12.9086,
        price: 150,
        rating: 4,
        review: 80,
        images : ['/vehicles/Kia-Picanto-1.webp', '/vehicles/Kia-Picanto-2.webp', '/vehicles/Kia-Picanto-3.webp']
      },
      {
        id: 5,
        verified: true,
        package: "petite",
        traveler: "Khalid Borid",
        description : "Je fais le trajet direct par l'autoroute. Je peux récupérer le colis près de Moulay Abdellah. Pas de liquides,  Pas de produits fragiles sans emballage, Remise en main propre",
        point : "Stade D'honor",
        ville_depart: "laayoune",
        ville_darrive: "casablanca",
        date: "mercredi 8:00",
        type_veh: "voiture",
        poids: 10,
        direct: true,
        lat: 26.85,
        lng: -12.9086,
        price: 140,
        rating: 4,
        review: 90,
        images : ['/vehicles/Kia-Picanto-1.webp', '/vehicles/Kia-Picanto-2.webp', '/vehicles/Kia-Picanto-3.webp']
      },
    ];

    const [selectedImage, setSelectedImage] = useState(0)

    const sizes = ['- 1kg', '1-5 kg', '5-10 kg', '+ 15kg']

    const [selectedSize, setSelectedSize] = useState('- 1kg')

    const {id} = useParams()

    const travel = travelsAnnouncement.find(travel => travel.id == id)
    
    
    return ( 
        <main>
          <div className="flex relative w-full h-full xl:h-204 shadow-2xl rounded-2xl ">

            <div className="hidden xl:block">
                <Link className="absolute bg-gray-300 opacity-80 text-[0.8rem] rounded-4xl top-4 left-4 z-10 flex items-center gap-2 font-bold py-1 px-4" to={"/travels"}>
                <ArrowLeft size={16} />
                <p>Retour aux Trajets</p>
                </Link>
                <img src={travel.images[selectedImage]} alt="" className="w-full h-full rounded-r-2xl object-cover" />
            </div>

            <div className="w-full p-8 flex flex-col justify-start">
                {/* Go Back from Mobile */}
                
                <Link className="xl:hidden text-[0.8rem] rounded-4xl  flex items-center gap-2 font-bold" to={"/travels"}>
                <ArrowLeft size={16} />
                <p>Retour aux Trajets</p>
                </Link>

                <div className="mt-10 xl:mt-0">
                  <TagChip text={"Trajet Sécurisé"} />
                </div>
                <div className="py-5">
                  <p className="font-semibold text-[1.4rem]">Transport de Colis : </p>
                  <p className="flex gap-1 p-2 items-center text-[1.1rem] xl:text-[1.7rem] font-semibold capitalize">
                    <span>{travel.ville_depart}</span>
                    <ArrowRight size={16} />
                    <span>{travel.ville_darrive}</span>
                  </p>

                  <div className="p-2 flex items-center gap-2">
                    <p className="text-[#46c48f] font-semibold text-[0.9rem]">{travel.traveler}</p>
                    <span className="text-gray-400">|</span>
                    <div className="flex wfy  gap-1 items-center">
                      {[...Array(5)].map((star, i) => (
                        <Star
                          size={13}
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
                    </div>
                    
                  </div>
                    
                    <div className="py-8 px-2 flex flex-col gap-6">
                      <div className="flex gap-2 flex-col">
                        <p className="text-[1rem] font-semibold text-gray-900">Type de Colis</p>
                        <p className="text-[0.9rem] px-4 flex items-center gap-2">
                          <Check size={14}/>  
                          <span>{travel.package}</span>
                        </p>
                      </div>
                      
                      <div className="flex gap-2 flex-col">
                        <p className="text-[1rem] font-semibold text-gray-900">Description</p>
                        <p className="text-[0.9rem] px-4 flex items-center gap-2"> 
                          <span>{travel.description}</span>
                        </p>
                      </div>
                      
                      <div className="flex gap-2 flex-col">
                        <p className="text-[1rem] font-semibold text-gray-900">Point de Rencontre</p>
                        <p className="text-[0.9rem] px-4 flex items-center gap-2"> 
                          <MapPin size={14} />
                          <span>{travel.point}</span>
                        </p>
                      </div>

                      <div className="flex gap-4">
                        {travel.images.map((image, index)=>(
                          <div className="" key={index}>
                            <img src={image} alt="" className={`w-full h-15 rounded-2xl ${selectedImage === index ? 'border-3 border-[#46c48f]' : "border-transparent "}`}
                            onClick={()=>{
                              setSelectedImage(index)
                            }}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 flex-col">
                        <p className="text-[1rem] font-semibold text-gray-900">Size</p>
                        <div className="text-[0.9rem] px-4 flex items-center gap-2"> 
                        <div className="flex overflow-x-scroll xl:no-scrollbar">
                            {
                              sizes.map((size, index)=>(
                                <button
                                key={index}
                                onClick={()=>setSelectedSize(size)}
                                value={size}
                                className={`btn btn-ghost rounded-2xl  shrink-0 font-bold  ${selectedSize === size ? 'bg-[#2592FF] text-white' : 'text-black'}`}
                                >
                                  {size}
                                </button>
                              ))
                            }
                        </div>
                          
                        </div>
                      </div>
                      
                      <div className="flex flex-col xl:flex-row  gap-2 items-center justify-between px-8 py-4">
                        <div>
                          <p className="text-[0.9rem] px-4 flex items-center gap-2"> 
                              <span className="text-[#0984E3] text-[1.6rem] font-bold">{travel.price} MAD</span>
                          </p>
                        </div>

                        <div className="flex flex-col xl:flex-row items-center gap-6 mt-10 xl:mt-0">
                          <div className="btn btn-ghost bg-[#0984E3] hover:border-[#0984E3] text-white rounded-2xl">
                            <ModalSend text={"Réserver ce trajet"} travel={travel} />
                          </div>
                          <button href="#" className="cursor-pointer font-bold">Contacter {travel.traveler} →</button>
                        </div>
                      </div>
                      

                      

                    </div>

                </div>
            </div>









          </div>
        </main>
     );
}
 
export default TravelDetail;