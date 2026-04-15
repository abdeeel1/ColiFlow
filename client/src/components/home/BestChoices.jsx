import CardTravel from "@/ui/components/CardTravel";
import SearchTravel from "../../ui/components/SearchTravel";
import { Button } from "../ui/button";

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
                <p className="text-center font-bold text-2xl">Qu'attendez-vous ? Commencez dès maintenant.</p>

                <SearchTravel />

                <p className="text-center font-semibold text-xl">Les meilleures opportunités de livraison</p>

                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-10 lg:gap-14 place-items-center justify-center items-center  py-10">
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
            </div>
        
        
        </section>
    );
}
 
export default BestChoices;