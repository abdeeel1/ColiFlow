const Services = () => {
    
    const ServicesData = [
        {id:1, picture:"/Service-1.png", title:"Envoyer vos colis à prix réduit", description: "Profitez des trajets de notre communauté pour expédier vos objets partout au Maroc. Que ce soit un document urgent ou un bagage encombrant, trouvez un voyageur de confiance en quelques clics et économisez jusqu'à 50% sur vos frais de livraison habituels", textButton: "Trouver un trajet"},
        {id:2, picture:"/Service-2.png", title:"Rentabilisez vos déplacements", description: "Vous voyagez souvent entre les villes du Royaume ? Ne roulez plus à vide ! Proposez l'espace libre dans votre coffre pour transporter des colis et amortissez vos frais de carburant et de péage. C'est simple, écologique et convivial", textButton: "En savoir plus"},
        {id:3, picture:"/Service-3.png", title:"Une communauté 100% vérifiée", description: "La sécurité est notre priorité. Chaque membre de ColiFlow passe par un processus de vérification rigoureux de son identité (CIN). Consultez les avis et les notes des autres utilisateurs pour choisir votre partenaire de transport en toute sérénité. Votre colis est entre de bonnes mains", textButton: "Publier un trajet"},
    ]

    
    return ( 
        <section className="">
        
        
        <div>
            <p className="font-bold text-2xl text-center xl:text-3xl font-clashdisplay">Une Nouvelle ère de livraison au Maroc</p>

            {/* Mobile Version */}

            <div className="xl:hidden flex flex-col space-y-30 py-20">
                {
                    ServicesData.map(service=>(
                        <div key={service.id}>
                            <div className="">
                                <img className="shadow-2xl bg-[#F1F5F9] shadow-gray-400" src={service.picture} alt="" />
                                <div className="pt-5 flex flex-col space-y-4">
                                    <p className="font-extrabold text-[18px] text-[#1E293B]">{service.title}</p>
                                    <p className="text-[11px] text-[#636E72]">{service.description}</p>
                                    <button className="btn btn-ghost hover:bg-[#065ea1] hover:border-[#065ea1] bg-[#0984E3] text-white justify-start w-35 text-[13px] text-center rounded-2xl"><a href="#" className="text-center decoration-0">{service.textButton}</a></button>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* Desktop Version */}
            <div className="hidden xl:flex xl:flex-col xl:space-y-30 xl:py-20">
                {
                    ServicesData.map(service=>(
                        <div key={service.id}>
                            <div className={`xl:flex xl:gap-50 xl:items-center ${service.id === 2 ? 'xl:flex-row-reverse xl:gap-50' : ''}`}>
                                <div>
                                    <img className="xl:shadow-2xl xl:bg-[#F1F5F9] xl:shadow-gray-400 h-80" src={service.picture} alt="" />
                                </div>
                                <div className="xl:pt-5 xl:flex xl:flex-col xl:space-y-4">
                                    <p className="font-extrabold text-[1.125rem] xl:text-[1.125rem] text-[#1E293B]">{service.title}</p>
                                    <p className="text-[0.688rem] xl:text-[0.875rem] text-[#636E72] w-120">{service.description}</p>
                                    <button className="btn btn-ghost hover:bg-[#065ea1] hover:border-[#065ea1] bg-[#0984E3] text-white justify-start w-35 text-[0.813rem] text-center rounded-2xl"><a href="#" className="text-center decoration-0">{service.textButton}</a></button>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>


        
        </section>
    );
}
 
export default Services;