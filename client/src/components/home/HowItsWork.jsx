import ActionTab from "@/ui/ActionTab"
import { useTranslation } from "react-i18next"

const HowItsWork = () => {
    const { t } = useTranslation()

    const expediteurData = [
        {
            id: 1,
            etape: t("étape 1"),
            title: t("Préparez votre envoi"),
            description: t(
                "Indiquez le type de colis, son poids et sa destination. Fixez votre propre prix ou laissez les voyageurs proposer",
            ),
            feutures: [
                t("Formulaire simple"),
                t("Flexibilité totale"),
                t("Photos illimitées"),
            ],
            picture: "/images/Etape-1.png",
        },
        {
            id: 2,
            etape: t("étape 2"),
            title: t("Choisissez un voyageur"),
            description: t(
                "Parcourez les profils vérifiés sur votre trajet. Consultez les avis et chattez directement avec eux pour fixer les détails",
            ),
            feutures: [
                t("Profils vérifiés (CIN)"),
                t("Chat sécurisé intégré"),
                t("Offline support"),
            ],
            picture: "/images/Etape-2.png",
        },
        {
            id: 3,
            etape: t("étape 3"),
            title: t("Envoi sécurisé"),
            description: t(
                "Remettez votre colis en toute confiance. Le paiement reste bloqué en sécurité jusqu'à la confirmation de livraison",
            ),
            feutures: [
                t("Paiement sécurisé"),
                t("Suivi en temps réel"),
                t("Support ColiFlow 24/7"),
            ],
            picture: "/images/Etape-3.png",
        },
    ]

    const voyageurData = [
        {
            id: 1,
            etape: t("étape 1"),
            title: t("Publiez votre trajet"),
            description: t(
                "Renseignez votre ville de départ, votre destination et la date de votre voyage. Précisez l'espace disponible dont vous disposez (sac à dos, coffre, etc...)",
            ),
            feutures: [
                t("Saisie rapide des villes"),
                t("Gestion du calendrier"),
                t("Choix du mode de transport"),
            ],
            picture: "/images/Travel-Etape-1.png",
        },
        {
            id: 2,
            etape: t("étape 2"),
            title: t("Recevez des propositions"),
            description: t(
                "Parcourez les demandes d'envoi sur votre trajet ou recevez des notifications directes d'expéditeurs intéressés par votre itinéraire",
            ),
            feutures: [
                t("Notifications en temps réel"),
                t("Chat sécurisé intégré"),
                t("Liberté d'acceptation"),
            ],
            picture: "/images/Travel-Etape-2.png",
        },
        {
            id: 3,
            etape: t("étape 3"),
            title: t("Rentabilisez votre déplacement"),
            description: t(
                "Récupérez le colis, effectuez votre voyage et remettez-le en main propre au destinataire. Recevez votre paiement une fois la livraison confirmée",
            ),
            feutures: [
                t("Paiement sécurisé"),
                t("Confirmation par QR Code"),
                t("Avis et notation"),
            ],
            picture: "/images/Travel-Etape-3.png",
        },
    ]

    return (
        <section className="py-20 2xl:py-20">
            <div>
                <p className="font-bold text-2xl text-center font-clashdisplay">
                    {t("Comment ça marche ?")}
                </p>

                <p className="text-center py-5 font-semibold leading-relaxed text-lg text-[#1E293B]">
                    {t(
                        "Que vous souhaitiez envoyer un colis en toute sécurité ou rentabiliser votre trajet à travers le Maroc, ColiFlow vous simplifie la vie.",
                    )}
                </p>

                <div className="py-10 flex flex-col justify-center items-center">
                    <ActionTab
                        expediteurData={expediteurData}
                        voyageurData={voyageurData}
                    />
                </div>
            </div>
        </section>
    )
}

export default HowItsWork
