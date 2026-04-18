import ActionTab from "@/ui/ActionTab";

const HowItsWork = () => {
    
    const expediteurData = [
        {id: 1, etape: "étape 1", title : "Préparez votre envoi", description : "Indiquez le type de colis, son poids et sa destination. Fixez votre propre prix ou laissez les voyageurs proposer", feutures : ["Formulaire simple", "Flexibilité totale", "Photos illimitées"], picture: "/images/Etape-1.png"},
        {id: 2, etape: "étape 2", title : "Choisissez un voyageur", description : "Parcourez les profils vérifiés sur votre trajet. Consultez les avis et chattez directement avec eux pour fixer les détails", feutures : ["Profils vérifiés (CIN)", "Chat sécurisé intégré", "Offline support"], picture: "/images/Etape-2.png"},
        {id: 3, etape: "étape 3", title : "Envoi sécurisé", description : "Remettez votre colis en toute confiance. Le paiement reste bloqué en sécurité jusqu'à la confirmation de livraison", feutures : ["Paiement sécurisé", "Suivi en temps réel", "Support ColiFlow 24/7"], picture: "/images/Etape-3.png"},
    ]
    
    const voyageurData = [
        {id: 1, etape: "étape 1", title : "Publiez votre trajet", description : "Renseignez votre ville de départ, votre destination et la date de votre voyage. Précisez l'espace disponible dont vous disposez (sac à dos, coffre, etc...)", feutures : ["Saisie rapide des villes", "Gestion du calendrier", "Choix du mode de transport"], picture: "/images/Travel-Etape-1.png"},
        {id: 2, etape: "étape 2", title : "Recevez des propositions", description : "Parcourez les demandes d'envoi sur votre trajet ou recevez des notifications directes d'expéditeurs intéressés par votre itinéraire", feutures : ["Notifications en temps réel", "Chat sécurisé intégré", "Liberté d'acceptation"], picture: "/images/Travel-Etape-2.png"},
        {id: 3, etape: "étape 3", title : "Rentabilisez votre déplacement", description : "Récupérez le colis, effectuez votre voyage et remettez-le en main propre au destinataire. Recevez votre paiement une fois la livraison confirmée", feutures : ["Paiement sécurisé", "Confirmation par QR Code", "Avis et notation"], picture: "/images/Travel-Etape-3.png"},
    ]
    
    
    
    return ( 
        <section className="py-20 2xl:py-20">

            <div>
                <p className="font-bold text-2xl text-center font-clashdisplay">Comment ça marche ?</p>

                <p className="text-center py-5 font-semibold leading-relaxed text-lg text-[#1E293B]">
                    Que vous souhaitiez envoyer un colis en toute
                    sécurité ou rentabiliser votre trajet à travers le Maroc,
                    ColiFlow vous simplifie la vie.
                </p>


                <div className="py-10 flex flex-col justify-center items-center">
                    <ActionTab expediteurData={expediteurData} voyageurData={voyageurData} />
                </div>
            </div>




        </section>
     );
}
 
export default HowItsWork;