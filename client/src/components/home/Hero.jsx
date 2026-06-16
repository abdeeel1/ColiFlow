import { AwardIcon, Package, Zap } from "lucide-react"
import Features from "../../ui/components/Features"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ScrollTrigger } from "gsap/all"
import { useSelector } from "react-redux"

const Hero = () => {
    const { t } = useTranslation()

    const { user } = useSelector((state) => state.auth)
    const isTraveler = user?.is_traveler

    const tl = gsap.timeline()

    gsap.registerPlugin(ScrollTrigger)

    useGSAP(() => {
        tl.from("#tag-website", { y: -50, opacity: 0, duration: 0.7 })
            .from(
                "#header-title",
                { y: -30, opacity: 0, duration: 0.7 },
                "-=0.1",
            )
            .from("#span1", { x: 300, opacity: 0, duration: 0.4 })
            .from("#desciption", { y: 30, opacity: 0, duration: 0.6 }, "-=0.1")
            .from("#cta-buttons", { y: 30, opacity: 0, duration: 0.6 }, "-=0.3")

        gsap.from("#hero-image img", {
            scrollTrigger: {
                trigger: "#hero-image img",
                start: "-=1050",
                end: "+=400",
                scrub: true,
                toggleActions: "play reverse play reverse",
            },

            y: 200,
            opacity: 0,
            duration: 0.8,
        })

        gsap.to("#progress", {
            width: "100%",
            duration: 6,
            repeat: -1,
            ease: "linear",
        })
    }, [])

    return (
        <section className="mt-5 2xl:mt-20 min-h-dvh" id="hero">
            <div
                id="tag-website"
                className="flex gap-2 bg-[#0984E3] rounded-2xl md:mx-55 rtl:lg:mx-70 lg:mx-80 xl:mx-100 2xl:mx-100 justify-center text-sm items-center mx-14"
            >
                <div className="flex gap-2 items-center">
                    <div>
                        <Zap color="#FFFFFF" className="w-3.5" />
                    </div>
                    <div className="text-white font-semibold text-center">
                        <p className="text-[8px] lg:text-[10px] rtl:text-[13px]">
                            {t("DISPONIBLE PARTOUT AU MAROC")}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col space-y-2 justify-center items-center py-8 2xl:py-10">
                <p
                    id="header-title"
                    className="font-bold font-clashdisplay-bold  text-center text-[32px] md:text-[48px] lg:text-[4.5rem]  leading-tight text-[#2D3436]"
                >
                    {t("Envoyez vos Colis au")} <br />
                    <span className="text-[#0984E3]">{t("Maroc")}</span>{" "}
                    {t("en Toute")}
                    <span
                        id="span1"
                        className="inline-flex items-center gap-2 text-[#0984E3] ml-2"
                    >
                        <Package className="size-10 rtl:size-6 " />
                        {t("Simplicité")}
                    </span>
                </p>

                <div id="desciption" className="mb-4 lg:my-8">
                    <span className="text-center text-[12px] lg:text-[18px] text-[#141414]">
                        {t("La première plateforme P2P de livraison au Maroc")}
                    </span>
                </div>

                <div id="cta-buttons" className="flex gap-4">
                    <Link to={isTraveler ? "/traveler/dashboard?tab=demandes" : "/travels"}>
                        <button className="btn btn-ghost hover:border-[#0984E3]  bg-[#0984E3] rounded-2xl text-white font-bold btn-sm lg:btn-md">
                            {isTraveler ? t("Trouver un colis") : t("Trouver un trajet")}
                        </button>
                    </Link>
                    <Link to={isTraveler ? "/travels/create" : "/packages/create"}>
                        <button className="btn btn-ghost hover:border-[#c7c9caf6]  bg-[#c7c9caf6] rounded-2xl text-gray-500 font-bold btn-sm lg:btn-md">
                            {isTraveler ? t("Publier un trajet") : t("Publier un colis")}
                        </button>
                    </Link>
                </div>
            </div>

            <div>
                <div>
                    <Features />

                    <div
                        id="progress"
                        className="bg-gray-400 py-px mb-15 mt-5 lg:mt-0 w-10"
                    ></div>
                </div>

                <div
                    id="hero-image"
                    className="md:flex md:justify-center md:items-center 2xl:pt-14"
                >
                    <img
                        src="/images/HeroSection-Picture.png"
                        alt=""
                        className="w-full h-full md:w-130 lg:w-170 2xl:w-200"
                        loading="lazy"
                    />
                </div>
            </div>
        </section>
    )
}

export default Hero
