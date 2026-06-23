import AccordingTabs from "@/ui/AccordingTabs"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

const Faq = () => {
    const { t } = useTranslation()

    const QuestionSectionOne = [
        {
            id: 1,
            question: t("Comment puis-je avoir confiance en un voyageur ?"),
            answer: t(
                "Tous nos voyageurs passent par un processus de vérification strict (validation de la CIN et du numéro de téléphone). De plus, notre système d'avis vous permet de choisir un profil fiable basé sur les retours de la communauté.",
            ),
        },
        {
            id: 2,
            question: t("Est-ce que l'inscription est gratuite ?"),
            answer: t(
                "Oui, l'inscription sur ColiFlow est 100% gratuite, que vous soyez expéditeur ou voyageur. Vous ne payez les frais de service que lors de la validation d'une transaction.",
            ),
        },
        {
            id: 3,
            question: t("Quels types de colis sont interdits ?"),
            answer: t(
                "Pour des raisons de sécurité et pour respecter la loi marocaine, il est strictement interdit d'envoyer des substances illicites, des armes, des produits inflammables, des animaux vivants ou tout objet dangereux.",
            ),
        },
        {
            id: 4,
            question: t("Mes informations personnelles sont-elles sécurisées ?"),
            answer: t(
                "Absolument. Vos données sont cryptées et stockées en toute sécurité. Nous ne partageons jamais vos informations personnelles avec des tiers et le chat intégré permet de communiquer sans dévoiler votre numéro de téléphone.",
            ),
        },
        {
            id: 5,
            question: t("Comment sont calculés les frais de livraison ?"),
            answer: t(
                "Les frais sont fixés librement entre l'expéditeur et le voyageur. Lors de votre demande, vous proposez un prix, et le voyageur peut l'accepter ou le négocier via notre messagerie intégrée.",
            ),
        },
    ]

    const QuestionSectionTwo = [
        {
            id: 1,
            question: t("Que faire si mon colis n'est pas arrivé ?"),
            answer: t(
                "La sécurité est notre priorité. Votre paiement est bloqué sur notre plateforme et n'est transféré au voyageur qu'après confirmation de la livraison. En cas de litige, notre support client intervient rapidement pour vous assister.",
            ),
        },
        {
            id: 2,
            question: t("Quelles sont les villes couvertes ?"),
            answer: t(
                "ColiFlow couvre l'ensemble du territoire marocain ! Tant qu'un voyageur effectue le trajet entre votre ville de départ et votre destination (ex: Casablanca - Tanger), vous pouvez lui confier votre colis.",
            ),
        },
        {
            id: 3,
            question: t("Comment se passe le paiement ?"),
            answer: t(
                "Le paiement s'effectue de manière 100% sécurisée sur l'application lors de la réservation. L'argent est conservé en sécurité par ColiFlow et n'est débloqué pour le voyageur qu'une fois le colis remis en mains propres.",
            ),
        },
        {
            id: 4,
            question: t("Puis-je annuler une demande d'envoi ?"),
            answer: t(
                "Oui, vous pouvez annuler gratuitement votre demande tant qu'elle n'a pas été validée par un voyageur. Si le trajet est déjà confirmé, des conditions d'annulation peuvent s'appliquer.",
            ),
        },
        {
            id: 5,
            question: t("Comment puis-je suivre mon colis ?"),
            answer: t(
                "Vous pouvez suivre l'évolution de votre envoi (En attente, Récupéré, En cours de route, Livré) directement depuis votre tableau de bord. Le chat vous permet aussi de rester en contact avec le voyageur en temps réel.",
            ),
        },
    ]

    return (
        <section className="py-20 xl:py-40" id="faq">
            <p className="text-center font-clashdisplay font-bold text-2xl xl:text-3xl capitalize">
                {t("Questions fréquentes")}
            </p>

            <div className="py-10 lg:flex lg:gap-15">
                <AccordingTabs data={QuestionSectionOne} />

                <AccordingTabs data={QuestionSectionTwo} />
            </div>

            <div className="">
                <p className="text-[0.688rem] flex flex-col lg:flex-row justify-center items-center gap-2 text-center text-[#656565]">
                    {t("D'autres questions ? Discutez avec nous sur")} <br />
                    <span className="font-bold ms-1 py-0.5  bg-[#f7f6f6] rounded-2xl px-2">
                        {" "}
                        <a href="#">Whatsapp</a>{" "}
                    </span>
                    {t("ou")}
                    <span className="font-bold ms-1 py-0.5  bg-[#f7f6f6] rounded-2xl px-2">
                        {" "}
                        <Link to={"/readmore"}>
                            {t("Consultez le centre d'aide")}
                        </Link>{" "}
                    </span>
                </p>
            </div>
        </section>
    )
}

export default Faq
