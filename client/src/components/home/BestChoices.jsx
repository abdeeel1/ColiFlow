import CardTravel from "@/ui/components/CardTravel";
import SearchTravel from "../../ui/components/SearchTravel";
import { Button } from "../ui/button";
import { Zap } from "lucide-react";
import ActionLink from "@/ui/ActionLink";

const BestChoices = () => {
    
    const dataCard = [
        {id : 1, ville_depart : "fez", ville_darrive : "rabat", prix : 40, type : "petit colis", date: "demain, 09:00", voyageur: "Abdessamad Najib", verified : true, image : '/Rabat.png'},
        {id : 2, ville_depart : "rabat", ville_darrive : "casablanca", prix : 20, type : "grand colis", date: "lundi, 11:00", voyageur: "Salaheddine Alaoui", verified : true, image : '/Casablanca.png'},
        {id : 3, ville_depart : "oujda", ville_darrive : "marrakech", prix : 60, type : "volumineux colis", date: "jeudi, 16:00", voyageur: "Meriem Fadil", verified : false, image : '/Marrakech.png'},
        {id : 4, ville_depart : "nador", ville_darrive : "tanger", prix : 45, type : "moyen colis", date: "samedi, 21:00", voyageur: "Ilyas Dakir", verified : true, image : '/Tanger.png'}
    ]
    
    
    
    return ( 
        <section>
            
            <div className="flex justify-center items-center flex-col space-y-10">
                <p className="text-center font-bold text-2xl xl:text-3xl">Qu'attendez-vous ? Commencez dès maintenant.</p>

                <SearchTravel />

                <p className="text-center font-semibold text-xl xl:text-2xl">Les meilleures opportunités de livraison</p>

                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-10 lg:gap-14 place-items-center justify-center items-center  py-10 md:py-20">
                    {dataCard.map(card=>(
                        <div className="w-full "  key={card.id}>
                             <CardTravel 
                                ville_depart={card.ville_depart}
                                ville_darrive={card.ville_darrive}
                                prix={card.prix}
                                type={card.type}
                                date={card.date}
                                voyageur={card.voyageur}
                                verified={card.verified}
                                image={card.image}
                             />
                        </div>
                    ))}
                </div>

                <div className="py-2 md:w-[75%] xl:w-[44%] bg-[#0984E3] mx-auto rounded-2xl text-sm w-full">

                    <div className="flex gap-2 md:gap-10 justify-center md:justify-evenly items-center px-4">
                        
                        <p className="text-white font-semibold text-[8px] md:text-[15px] text-center">Une solution simple, rapide et 100% marocaine.</p>
                        
                        <ActionLink text="Read More" link="#" />
                        
                    </div>

                </div>

            </div>
        
        
        </section>
    );
}
 
export default BestChoices;