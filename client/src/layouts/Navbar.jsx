import { useEffect, useRef } from "react"
import MobileMenu from "../ui/MobileMenu"
import ToggleButton from "../ui/ToggleButton"
import { ChevronDown, Globe } from "lucide-react"
import gsap from "gsap"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import AuthMenu from "@/ui/components/AuthMenu"
import { useTranslation } from "react-i18next"

const Navbar = () => {
    const { t, i18n } = useTranslation()

    const handleTranslateLang = (selectedLang) => {
        i18n.changeLanguage(selectedLang)

        localStorage.setItem("i18nextLng", selectedLang)
    }

    const { user, isAuth } = useSelector((state) => state.auth)
    const isTraveler = user?.is_traveler

    const navRef = useRef(null)

    useEffect(() => {
        gsap.fromTo(
            navRef.current,
            { y: -100, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "circ",
                clearProps: "all",
            },
        )
    }, [])

    return (
        <header className="sticky top-0 z-50 bg-[#F1F5F9]">
            <nav id="navbar" className="lg:px-10 w-full" ref={navRef}>
                <div className="bg-[#FFFFFF] shadow-sm max-w-360 lg:mx-auto md:mx-10 rounded-2xl mx-4 my-4 flex justify-between items-center lg:py-2">
                    <div className="h-10 flex items-center">
                        <img
                            src="/images/Logo.png"
                            alt=""
                            className="w-25 h-30
                    lg:w-48 lg:h-50
                    "
                        />
                    </div>

                    <div className="desktop-only">
                        {!isTraveler ? (
                            <ul className="lg:flex font-semibold lg:items-center lg:gap-6 text-sm">
                                <Link to={"/"}>{t("Acceuil")}</Link>
                                <div className="dropdown dropdown-hover">
                                    <li className="lg:text-[#2D3436] cursor-pointer font-semibold flex items-center gap-2 hover:bg-gray-200 py-1 px-4 rounded-2xl">
                                        {t("Envoyer un colis")}
                                        <ChevronDown />
                                    </li>
                                    <ul
                                        tabIndex="-1"
                                        className="dropdown-content menu bg-white rounded-box z-1 w-52 p-2 shadow-sm"
                                    >
                                        <li className="hover:bg-gray-200 rounded-2xl">
                                            <Link to={"/packages/create"}>
                                                {t("Nouveau colis")}
                                            </Link>
                                        </li>
                                        <li className="hover:bg-gray-200 rounded-2xl">
                                            <Link to={"/travels"}>
                                                {t("Liste des trajets")}
                                            </Link>
                                        </li>
                                        <li className="hover:bg-gray-200 rounded-2xl">
                                            <Link to={"/sender/dashboard"}>
                                                {t("Dashboard")}
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                                <li className="lg:text-[#2D3436] cursor-pointer hover:bg-gray-200 py-1 px-4 rounded-2xl">
                                    <Link to={"/sender/dashboard?tab=expedition"}>
                                        {t("Mes Colis")}
                                    </Link>
                                </li>
                                <li className="lg:text-[#2D3436] cursor-pointer hover:bg-gray-200 py-1 px-4 rounded-2xl">
                                    <Link to={"/#faq"}>{t("FAQ")}</Link>
                                </li>
                            </ul>
                        ) : (
                            <ul className="lg:flex font-semibold lg:gap-4 lg:items-center text-sm">
                                <Link to={"/"}>{t("Acceuil")}</Link>
                                <div className="dropdown dropdown-hover">
                                    <li className="lg:text-[#2D3436] cursor-pointer font-semibold flex items-center gap-2 hover:bg-gray-200 py-1 px-4 rounded-2xl">
                                        {t("Publier un trajet")} <ChevronDown />
                                    </li>
                                    <ul
                                        tabIndex="-1"
                                        className="dropdown-content menu bg-white rounded-box z-1 w-52 p-2 shadow-sm"
                                    >
                                        <li className="hover:bg-gray-200 rounded-2xl">
                                            <Link to={"/travels/create"}>
                                                {t("Nouveau trajet")}
                                            </Link>
                                        </li>
                                        <li className="hover:bg-gray-200 rounded-2xl">
                                            <Link to={"/traveler/dashboard?tab=demandes"}>
                                                {t("Demandes de Réservation")}
                                            </Link>
                                        </li>
                                        <li className="hover:bg-gray-200 rounded-2xl">
                                            <Link to={"/traveler/dashboard"}>
                                                {t("Dashboard")}
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                                <li className="lg:text-[#2D3436] cursor-pointer hover:bg-gray-200 py-1 px-4 rounded-2xl">
                                    <Link to={"/traveler/dashboard?tab=trajets"}>
                                        {t("Mes Travel")}
                                    </Link>
                                </li>
                                <li className="lg:text-[#2D3436] cursor-pointer hover:bg-gray-200 py-1 px-4 rounded-2xl">
                                    <Link to={"/#faq"}>{t("FAQ")}</Link>
                                </li>
                            </ul>
                        )}
                    </div>

                    <div className="lg:flex lg:gap-4 lg:pe-4 lg:items-center">
                        <div className="flex items-center gap-4 lg:gap-10">
                            {isAuth && (
                                <div className="hidden lg:block">
                                    <ToggleButton />
                                </div>
                            )}

                            <div className="flex gap-4 2xl:gap-0   items-center pe-4">
                                <div className="dropdown dropdown-center w-10 xl:w-14">
                                    <div
                                        tabIndex={0}
                                        role="button"
                                        className="btn m-1 btn-ghost hover:bg-[#FFFFFF] hover:border-[#FFFFFF]"
                                    >
                                        <Globe
                                            color="gray"
                                            className="w-3.5 lg:w-5 cursor-pointer"
                                        />
                                    </div>
                                    <ul
                                        tabIndex="-1"
                                        className="dropdown-content menu flex justify-center items-center  z-1 w-20 p-2 bg-base-100 shadow-sm"
                                    >
                                        <li value="en">
                                            <button
                                                onClick={() =>
                                                    handleTranslateLang("en")
                                                }
                                            >
                                                <span className="fi fi-gb"></span>
                                            </button>
                                        </li>
                                        <li value="ar">
                                            <button
                                                onClick={() =>
                                                    handleTranslateLang("ar")
                                                }
                                            >
                                                <span className="fi fi-ma"></span>
                                            </button>
                                        </li>
                                        <li value="fr">
                                            <button
                                                onClick={() =>
                                                    handleTranslateLang("fr")
                                                }
                                            >
                                                <span className="fi fi-gf"></span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>

                                {!isAuth ? (
                                    <div className="desktop-only">
                                        <Link to={"/login"}>
                                            <button className="btn btn-ghost hover:border-[#0984E3] xl:text-base xl:px-6 2xl:mx-4 text-md bg-[#0984E3] text-white font-bold rounded-2xl transition-colors px-8">
                                                Se connecter
                                            </button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="desktop-only">
                                        <AuthMenu />
                                    </div>
                                )}

                                <div
                                    id="menu"
                                    className="mobile-only flex items-center bg-white"
                                >
                                    <MobileMenu isTraveler={isTraveler} />

                                    {isAuth && <AuthMenu />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Navbar
