const Footer = () => {
    return (
        <footer className="py-15">
            <hr />

            {/* Mobile Version */}

            <div className="xl:hidden">
                <img src="/images/Logo.png" alt="" className="w-40 h-40" />

                <hr className="mx-4" />

                <div className="flex flex-col gap-10 py-10 px-2">
                    <div className="flex justify-around">
                        <div>
                            <p className="text-[#A4A4A4]">Explorer</p>
                            <ul className="flex flex-col gap-3 py-3">
                                <li className="text-[#141414] text-[0.75rem]">
                                    Trouver un trajet
                                </li>
                                <li className="text-[#141414] text-[0.75rem]">
                                    Publier un trajet
                                </li>
                                <li className="text-[#141414] text-[0.75rem]">
                                    Villes couvertes
                                </li>
                                <li className="text-[#141414] text-[0.75rem]">
                                    Objets autorisés
                                </li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-[#A4A4A4]">Ressources</p>
                            <ul className="flex flex-col gap-3 py-3">
                                <li className="text-[#141414] text-[0.75rem]">
                                    Comment ça marche ?
                                </li>
                                <li className="text-[#141414] text-[0.75rem]">
                                    Centre d'assistance
                                </li>
                                <li className="text-[#141414] text-[0.75rem]">
                                    Impact Écologique
                                </li>
                                <li className="text-[#141414] text-[0.75rem]">
                                    FAQ
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex justify-around">
                        <div>
                            <p className="text-[#A4A4A4]">Légal & Sécurité</p>
                            <ul className="flex flex-col gap-3 py-3">
                                <li className="text-[#141414] text-[0.75rem]">
                                    Conditions Générales
                                </li>
                                <li className="text-[#141414] text-[0.75rem]">
                                    Confidentialité
                                </li>
                                <li className="text-[#141414] text-[0.75rem]">
                                    Sécurité des colis
                                </li>
                                <li className="text-[#141414] text-[0.75rem]">
                                    Signalement
                                </li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-[#A4A4A4]">Suivre ColiFlow</p>
                            <ul className="flex flex-col gap-3 py-3">
                                <li className="text-[#141414] text-[0.75rem]">
                                    Support Client
                                </li>
                                <li className="text-[#141414] text-[0.75rem]">
                                    Devenir Partenaire
                                </li>
                                <li className="text-[#141414] text-[0.75rem]">
                                    Suivez-nous
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center items-center gap-2 px-2 lg:flex-row lg:justify-between lg:px-80">
                    <p className="text-[13px] text-[#A4A4A4] font-bold">
                        © 2026 ColiFlow Maroc.
                    </p>
                    <p className="text-[0.75rem] text-[#656565] font-bold">
                        La livraison collaborative au Maroc
                    </p>
                </div>
            </div>

            {/* Desktop Version */}

            <div className="hidden xl:block">
                <img
                    src="/images/Logo.png"
                    alt=""
                    className="w-40 h-40  lg:mx-15 xl:mx-50 2xl:mx-70"
                />

                <hr className="mx-30" />

                <div className="flex justify-center gap-50 py-10 px-2">
                    <div>
                        <p className="text-[#A4A4A4]">Explorer</p>
                        <ul className="flex flex-col gap-3 py-3">
                            <li className="text-[#141414] text-[0.75rem] cursor-pointer">
                                Trouver un trajet
                            </li>
                            <li className="text-[#141414] text-[0.75rem] cursor-pointer">
                                Publier un trajet
                            </li>
                            <li className="text-[#141414] text-[0.75rem] cursor-pointer">
                                Villes couvertes
                            </li>
                            <li className="text-[#141414] text-[0.75rem] cursor-pointer">
                                Objets autorisés
                            </li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-[#A4A4A4]">Ressources</p>
                        <ul className="flex flex-col gap-3 py-3">
                            <li className="text-[#141414] text-[0.75rem] cursor-pointer">
                                Comment ça marche ?
                            </li>
                            <li className="text-[#141414] text-[0.75rem] cursor-pointer">
                                Centre d'assistance
                            </li>
                            <li className="text-[#141414] text-[0.75rem] cursor-pointer">
                                Impact Écologique
                            </li>
                            <li className="text-[#141414] text-[0.75rem] cursor-pointer">
                                FAQ
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-[#A4A4A4]">Légal & Sécurité</p>
                        <ul className="flex flex-col gap-3 py-3">
                            <li className="text-[#141414] text-[0.75rem] cursor-pointer">
                                Conditions Générales
                            </li>
                            <li className="text-[#141414] text-[0.75rem] cursor-pointer">
                                Confidentialité
                            </li>
                            <li className="text-[#141414] text-[0.75rem] cursor-pointer">
                                Sécurité des colis
                            </li>
                            <li className="text-[#141414] text-[0.75rem] cursor-pointer">
                                Signalement
                            </li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-[#A4A4A4]">Suivre ColiFlow</p>
                        <ul className="flex flex-col gap-3 py-3">
                            <li className="text-[#141414] text-[0.75rem] cursor-pointer">
                                Support Client
                            </li>
                            <li className="text-[#141414] text-[0.75rem] cursor-pointer">
                                Devenir Partenaire
                            </li>
                            <li className="text-[#141414] text-[0.75rem] cursor-pointer">
                                Suivez-nous
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col justify-center items-center gap-2 px-2 lg:flex-row lg:justify-between lg:px-80">
                    <p className="text-[0.813rem] text-[#A4A4A4] font-bold">
                        © 2026 ColiFlow Maroc.
                    </p>
                    <p className="text-[0.75rem] text-[#656565] font-bold">
                        La livraison collaborative au Maroc
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
