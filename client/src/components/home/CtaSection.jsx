import BadgeAlert from "@/ui/BadgeAlert"
import { Circle, DollarSign, Folder, Laptop, Send, Play } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import DemoModal from "./DemoModal"

const CtaSection = () => {
    const { t } = useTranslation()
    const [demoOpen, setDemoOpen] = useState(false)

    return (
        <section>
            <p className="text-center font-bold text-2xl xl:text-3xl font-clashdisplay capitalize">
                {t("Une interface intuitive pour tous")}
            </p>

            <div className="py-15">
                <div className="bg-[#d2e7ff] rounded-2xl py-5 flex flex-col justify-center items-center">
                    <div>
                        <BadgeAlert />
                    </div>

                    <div className="flex flex-col gap-4 justify-center items-center">
                        <p className="font-semibold text-center py-5 px-5 text-[1.188rem] lg:text-[1.375rem]">
                            {t("Suivez vos colis en temps réel Dashboard ColiFlow")}
                        </p>

                        <p className="text-[#656565] text-[0.813rem] lg:text-[0.875rem] px-5 text-center lg:mx-30">
                            {t(
                                "Que vous soyez expéditeur ou voyageur, accédez à tous vos trajets, messages et paiements sur une plateforme unique et fluide",
                            )}
                        </p>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:py-5 ">
                            <div className="flex gap-2 items-center">
                                <Folder fill="#656565" width={10} />
                                <p className="text-[0.75rem] font-semibold text-[#656565]">
                                    {t("Statut des livraisons mis à jour")}
                                </p>
                            </div>

                            <div className="flex gap-2 items-center">
                                <Send fill="#656565" width={10} />
                                <p className="text-[0.75rem] font-semibold text-[#656565]">
                                    {t("Discutez directement avec le voyageur")}
                                </p>
                            </div>

                            <div className="flex gap-2 items-center">
                                <DollarSign width={10} />
                                <p className="text-[0.75rem] font-semibold text-[#656565]">
                                    {t("Transactions protégées")}
                                </p>
                            </div>

                            <div className="flex gap-2 items-center">
                                <Laptop fill="#656565" width={10} />
                                <p className="text-[0.75rem] font-semibold text-[#656565]">
                                    {t("Une expérience fluide sur tous les supports")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row  gap-4 py-5">
                        <Link to={"/login"}>
                            <button className="btn btn-ghost bg-blue-600 hover:border-blue-600 text-white btn-sm rounded-2xl">
                                {t("Commencer Maintenant")}
                            </button>
                        </Link>
                        <button
                            onClick={() => setDemoOpen(true)}
                            className="btn btn-soft btn-sm rounded-2xl gap-2"
                        >
                            <Play size={14} />
                            {t("Voir la Démo")}
                        </button>
                    </div>
                </div>
            </div>

            <DemoModal key={demoOpen ? "open" : "closed"} open={demoOpen} onClose={() => setDemoOpen(false)} />
        </section>
    )
}

export default CtaSection
