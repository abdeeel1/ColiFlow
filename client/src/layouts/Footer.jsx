const Footer = () => {
    return ( 
        <footer className="py-15">

        
        <hr />
        
        {/* Mobile Version */}

        <div className="xl:hidden">
            <img src="/Logo.png" alt="" className="w-40 h-40" />

            <hr className="mx-4"  />

            <div className="flex flex-col gap-10 py-10 px-2">
                <div className="flex justify-around">
                    <div>
                        <p className="text-[#A4A4A4]">Explorer</p>
                        <ul className="flex flex-col gap-3 py-3">
                            <li className="text-[#141414] text-[12px]">Trouver un trajet</li>
                            <li className="text-[#141414] text-[12px]">Publier un trajet</li>
                            <li className="text-[#141414] text-[12px]">Villes couvertes</li>
                            <li className="text-[#141414] text-[12px]">Objets autorisés</li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-[#A4A4A4]">Ressources</p>
                        <ul className="flex flex-col gap-3 py-3">
                            <li className="text-[#141414] text-[12px]">Comment ça marche ?</li>
                            <li className="text-[#141414] text-[12px]">Centre d'assistance</li>
                            <li className="text-[#141414] text-[12px]">Impact Écologique</li>
                            <li className="text-[#141414] text-[12px]">FAQ</li>
                        </ul>
                    </div>
                </div>
                
                <div className="flex justify-around">
                    <div>
                        <p className="text-[#A4A4A4]">Légal & Sécurité</p>
                        <ul className="flex flex-col gap-3 py-3">
                            <li className="text-[#141414] text-[12px]">Conditions Générales</li>
                            <li className="text-[#141414] text-[12px]">Confidentialité</li>
                            <li className="text-[#141414] text-[12px]">Sécurité des colis</li>
                            <li className="text-[#141414] text-[12px]">Signalement</li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-[#A4A4A4]">Suivre ColiFlow</p>
                        <ul className="flex flex-col gap-3 py-3">
                            <li className="text-[#141414] text-[12px]">Support Client</li>
                            <li className="text-[#141414] text-[12px]">Devenir Partenaire</li>
                            <li className="text-[#141414] text-[12px]">Suivez-nous</li>
                        </ul>
                    </div>
                </div>
                
            </div>

            <div className="flex flex-col justify-center items-center gap-2 px-2 lg:flex-row lg:justify-between lg:px-80">
                <p className="text-[13px] text-[#A4A4A4] font-bold">© 2026 ColiFlow Maroc.</p>
                <p className="text-[12px] text-[#656565] font-bold">La livraison collaborative au Maroc</p>
            </div>
        </div>

        {/* Desktop Version */}

        <div className="hidden xl:block">
            <img src="/Logo.png" alt="" className="w-40 h-40 mx-72" />

            <hr className="mx-30"  />

            <div className="flex justify-center gap-50 py-10 px-2">
                
                <div>
                    <p className="text-[#A4A4A4]">Explorer</p>
                    <ul className="flex flex-col gap-3 py-3">
                        <li className="text-[#141414] text-[12px] cursor-pointer">Trouver un trajet</li>
                        <li className="text-[#141414] text-[12px] cursor-pointer">Publier un trajet</li>
                        <li className="text-[#141414] text-[12px] cursor-pointer">Villes couvertes</li>
                        <li className="text-[#141414] text-[12px] cursor-pointer">Objets autorisés</li>
                    </ul>
                </div>
                <div>
                    <p className="text-[#A4A4A4]">Ressources</p>
                    <ul className="flex flex-col gap-3 py-3">
                        <li className="text-[#141414] text-[12px] cursor-pointer">Comment ça marche ?</li>
                        <li className="text-[#141414] text-[12px] cursor-pointer">Centre d'assistance</li>
                        <li className="text-[#141414] text-[12px] cursor-pointer">Impact Écologique</li>
                        <li className="text-[#141414] text-[12px] cursor-pointer">FAQ</li>
                    </ul>
                </div>
                
                
                
                <div>
                    <p className="text-[#A4A4A4]">Légal & Sécurité</p>
                    <ul className="flex flex-col gap-3 py-3">
                        <li className="text-[#141414] text-[12px] cursor-pointer">Conditions Générales</li>
                        <li className="text-[#141414] text-[12px] cursor-pointer">Confidentialité</li>
                        <li className="text-[#141414] text-[12px] cursor-pointer">Sécurité des colis</li>
                        <li className="text-[#141414] text-[12px] cursor-pointer">Signalement</li>
                    </ul>
                </div>
                <div>
                    <p className="text-[#A4A4A4]">Suivre ColiFlow</p>
                    <ul className="flex flex-col gap-3 py-3">
                        <li className="text-[#141414] text-[12px] cursor-pointer">Support Client</li>
                        <li className="text-[#141414] text-[12px] cursor-pointer">Devenir Partenaire</li>
                        <li className="text-[#141414] text-[12px] cursor-pointer">Suivez-nous</li>
                    </ul>
                </div>
                
                
            </div>

            <div className="flex flex-col justify-center items-center gap-2 px-2 lg:flex-row lg:justify-between lg:px-80">
                <p className="text-[13px] text-[#A4A4A4] font-bold">© 2026 ColiFlow Maroc.</p>
                <p className="text-[12px] text-[#656565] font-bold">La livraison collaborative au Maroc</p>
            </div>
            
        </div>

        </footer>
    );
}
 
export default Footer;
