import { Globe } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { Link, useParams, useSearchParams } from "react-router-dom"

const BRAND_BLUE = "#0984E3"

// ─── FAQ ACCORDION ────────────────────────────────────────────────────────────

function FAQContent() {
    const [open, setOpen] = useState(null)
    const faqs = [
        {
            q: "Est-ce sans danger ?",
            a: "Oui ! L'identité de tous les voyageurs est vérifiée à l'aide de leur pièce d'identité officielle (CIN), et notre système de notation garantit la transparence. Chaque transaction est également protégée par notre système de paiement par dépôt fiduciaire.",
        },
        {
            q: "Combien ça coûte ?",
            a: "Les prix sont négociés entre l'expéditeur et le voyageur. ColiFlow prélève une modeste commission pour assurer le fonctionnement de la plateforme. Il n'y a pas de frais cachés.",
        },
        {
            q: "Que se passe-t-il si mon colis est perdu ?",
            a: "Nous encourageons tous les utilisateurs à souscrire à nos options d'assurance « Parcel Security » pour les articles de grande valeur. En cas de perte, notre équipe d'assistance vous aidera à régler le problème.",
        },
        {
            q: "Comment puis-je faire vérifier mon compte ?",
            a: "Rendez-vous dans les paramètres de votre profil et téléchargez une photo lisible de votre carte d'identité. La vérification prend généralement moins de 24 heures. Les utilisateurs vérifiés reçoivent un badge sur leur profil.",
        },
        {
            q: "Puis-je annuler une livraison ?",
            a: "Oui, les annulations sont autorisées avant la phase de remise. Une fois la remise effectuée, la transaction ne peut plus être annulée. Veuillez consulter nos Conditions générales pour connaître l'intégralité de notre politique d'annulation.",
        },
    ]
    return (
        <div className="space-y-2">
            {faqs.map((item, i) => (
                <div
                    key={i}
                    className="rounded-xl border overflow-hidden transition-all duration-200"
                    style={{
                        borderColor: open === i ? `${BRAND_BLUE}44` : "#f3f4f6",
                    }}
                >
                    <button
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                        onClick={() => setOpen(open === i ? null : i)}
                    >
                        <span className="text-sm font-medium text-gray-800 pr-4">
                            {item.q}
                        </span>
                        <span
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
                            style={{
                                backgroundColor:
                                    open === i ? BRAND_BLUE : "#f3f4f6",
                                transform:
                                    open === i
                                        ? "rotate(45deg)"
                                        : "rotate(0deg)",
                            }}
                        >
                            <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke={open === i ? "white" : "#9ca3af"}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                        </span>
                    </button>
                    <div
                        className="overflow-hidden transition-all duration-200"
                        style={{ maxHeight: open === i ? "200px" : "0px" }}
                    >
                        <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">
                            {item.a}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─── CITIES TABLE ─────────────────────────────────────────────────────────────

const citiesData = [
    { city: "Casablanca", region: "Casablanca-Settat", status: "Active" },
    { city: "Rabat", region: "Rabat-Salé-Kénitra", status: "Active" },
    { city: "Marrakech", region: "Marrakech-Safi", status: "Active" },
    { city: "Fes", region: "Fès-Meknès", status: "Active" },
    { city: "Agadir", region: "Souss-Massa", status: "Active" },
    { city: "Tangier", region: "Tanger-Tetouan-Al Hoceima", status: "Active" },
    { city: "Oujda", region: "Oriental", status: "Active" },
    { city: "Kenitra", region: "Rabat-Salé-Kénitra", status: "Active" },
    { city: "Tetouan", region: "Tanger-Tetouan-Al Hoceima", status: "Active" },
    { city: "El Jadida", region: "Casablanca-Settat", status: "Active" },
]

function CitiesContent() {
    const [search, setSearch] = useState("")
    const filtered = citiesData.filter(
        (c) =>
            c.city.toLowerCase().includes(search.toLowerCase()) ||
            c.region.toLowerCase().includes(search.toLowerCase()),
    )
    return (
        <div className="space-y-5">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Villes actives", value: "10" },
                    { label: "Régions couvertes", value: "7" },
                    { label: "Disponibilité", value: "100%" },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="p-4 rounded-xl border border-gray-100 bg-gray-50 text-center"
                    >
                        <p
                            className="text-2xl font-bold mb-0.5"
                            style={{ color: BRAND_BLUE }}
                        >
                            {s.value}
                        </p>
                        <p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500 focus-within:border-blue-300 transition-colors">
                <svg
                    className="w-3.5 h-3.5 text-gray-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                </svg>
                <input
                    className="bg-transparent outline-none w-full text-sm text-gray-700 placeholder-gray-400"
                    placeholder="Filtrer par ville ou région..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    />
            </div>

            {/* Table */}
            <div className="rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr style={{ backgroundColor: `${BRAND_BLUE}0D` }}>
                            {["Ville", "Région", "Disponibilité"].map((h) => (
                                <th
                                    key={h}
                                    className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                                    style={{ color: BRAND_BLUE }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="px-5 py-8 text-center text-sm text-gray-400"
                                >
                                    Aucune ville ne correspond à votre
                                    recherche.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((row, i) => (
                                <tr
                                key={row.city}
                                className={`border-t border-gray-50 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                                >
                                    <td className="px-5 py-3.5 font-medium text-gray-800">
                                        {row.city}
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-500 text-sm">
                                        {row.region}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <p className="text-xs text-gray-400 text-center">
                D'autres villes seront bientôt disponibles.{" "}
                <a
                    href="mailto:support@coliflow.ma"
                    className="hover:underline"
                    style={{ color: BRAND_BLUE }}
                    >
                    Contactez-nous
                </a>{" "}
                pour sélectionner votre ville.
            </p>
        </div>
    )
}

// ─── PAGE CONTENT MAP ─────────────────────────────────────────────────────────

const pages = {
    "How it works": {
        title: "How it works",
        subtitle: "Comment ça marche ?",
        badge: "Guide",
        description:
            "La révolution du transport entre particuliers. ColiFlow met en relation les personnes qui ont besoin d'envoyer des colis avec des voyageurs disposant d'espace libre dans leurs bagages.",
        onThisPage: [
            "Étape 1 : Publier ou rechercher",
            "Étape 2 : Se connecter",
            "Étape 3 : Remise des clés",
            "Étape 4 : Livraison",
        ],
        prev: null,
        next: "Impact Écologique",
        content: (
            <div className="space-y-4">
                {[
                    {
                        step: "01",
                        title: "Publier ou Rechercher",
                        desc: "Que vous soyez expéditeur ou voyageur, indiquez vos besoins ou votre prochain voyage en quelques secondes.",
                        icon: (
                            <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                    />
                            </svg>
                        ),
                    },
                    {
                        step: "02",
                        title: "Se connecter",
                        desc: "Utilisez notre système de messagerie sécurisé pour convenir d'un prix et d'un lieu de rendez-vous.",
                        icon: (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                            </svg>
                        ),
                    },
                    {
                        step: "03",
                        title: "Remise",
                        desc: "Rencontrez-vous, remettez le colis et suivez son acheminement via l'application.",
                        icon: (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                    />
                            </svg>
                        ),
                    },
                    {
                        step: "04",
                        title: "Livraison",
                        desc: "Une fois l'article reçu, le voyageur est payé, puis les deux parties laissent un avis.",
                        icon: (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                            </svg>
                        ),
                    },
                ].map((item) => (
                    <div
                    key={item.step}
                        className="flex gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all"
                    >
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white"
                            style={{ backgroundColor: BRAND_BLUE }}
                        >
                            {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono font-semibold text-gray-300">
                                    Étape {item.step}
                                </span>
                                <h3 className="text-sm font-semibold text-gray-900">
                                    {item.title}
                                </h3>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        ),
    },
    
    "Impact Écologique": {
    title: "Impact Écologique",
    subtitle: "Environmental Impact",
    badge: "Guide",
    description: "Découvrez comment ColiFlow réduit l’empreinte carbone en optimisant les trajets existants.",
    onThisPage: ["Réduction CO2", "Optimisation des trajets", "Transport collaboratif"],
    prev: "How it works",
    next: "Customer Support",
    content: (
        <div className="space-y-4">
        <p className="text-sm text-gray-500">
            En utilisant les trajets déjà existants des voyageurs, ColiFlow réduit considérablement les émissions de CO₂.
        </p>
        </div>
    ),
    },

    "Customer Support": {
        title: "Customer Support",
        subtitle: "Support Client",
        badge: "Aide",
        description:
            "Nous sommes là pour vous aider. Notre équipe met tout en œuvre pour que votre expérience avec ColiFlow se déroule dans les meilleures conditions possibles.",
        onThisPage: ["E-mail", "Téléphone", "Bureau", "Chat en direct"],
        prev: "Impact Écologique",
        next: "Cities Covered",
        content: (
            <div className="space-y-4">
                {[
                    {
                        label: "E-mail",
                        value: "support@coliflow.ma",
                        sub: "Nous vous répondons dans les 24 heures",
                        href: "mailto:support@coliflow.ma",
                        icon: (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        ),
                    },
                    {
                        label: "Téléphone",
                        value: "+212 697 48 31 66",
                        sub: "Disponible du lun-ven, de 9 h à 18 h",
                        icon: (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                            </svg>
                        ),
                    },
                    {
                        label: "Bureau",
                        value: "Casablanca, Maroc",
                        sub: "Ain chock",
                        icon: (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                        ),
                    },
                    {
                        label: "Chat en direct",
                        value: "Disponible sur votre tableau de bord",
                        sub: "Cliquez sur l'icône de chat en bas à droite pour obtenir une aide immédiate",
                        icon: (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                />
                            </svg>
                        ),
                    },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="flex gap-4 items-start p-5 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/20 transition-all"
                    >
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white"
                            style={{ backgroundColor: BRAND_BLUE }}
                        >
                            {item.icon}
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                                {item.label}
                            </p>
                            {item.href ? (
                                <a
                                    href={item.href}
                                    className="text-sm font-medium hover:underline"
                                    style={{ color: BRAND_BLUE }}
                                >
                                    {item.value}
                                </a>
                            ) : (
                                <p className="text-sm font-medium text-gray-800">
                                    {item.value}
                                </p>
                            )}
                            <p className="text-xs text-gray-400 mt-0.5">
                                {item.sub}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        ),
    },

    "Terms & Conditions": {
        title: "Terms & Conditions",
        subtitle: "Conditions Générales",
        badge: "Mentions légales",
        description:
            "La transparence avant tout. En utilisant ColiFlow, vous acceptez de respecter les règles de notre communauté.",
        onThisPage: [
            "Identification",
            "Paiements et dépôt fiduciaire",
            "Articles interdits",
            "Responsabilité de la plateforme",
        ],
        prev: "Follow us",
        next: "Privacy Policy",
        content: (
            <div className="space-y-4">
                <div className="border-l-4 pl-4 py-3 rounded-r-xl bg-amber-50 border-amber-300">
                    <p className="text-sm font-semibold text-amber-800 mb-0.5">
                        Veuillez lire attentivement
                    </p>
                    <p className="text-xs text-amber-600">
                        En utilisant ColiFlow, vous acceptez les conditions
                        suivantes. Dernière mise à jour : juin 2026
                    </p>
                </div>
                {[
                    {
                        title: "Identification",
                        desc: "Les utilisateurs doivent fournir une pièce d'identité valide (CIN) afin d'être vérifiés sur la plateforme. Cela garantit la sécurité et la responsabilité de tous les membres de la communauté.",
                    },
                    {
                        title: "Paiements et dépôt fiduciaire",
                        desc: "Les paiements sont conservés en dépôt fiduciaire via notre système de portefeuille électronique jusqu'à ce que la livraison soit confirmée par le destinataire. Les fonds ne sont débloqués qu'une fois la livraison marquée comme effectuée.",
                    },
                    {
                        title: "Articles interdits",
                        desc: "Les substances illégales, les marchandises dangereuses et tout article enfreignant la législation marocaine ou internationale sont strictement interdits. Toute infraction entraînera la suspension immédiate du compte.",
                    },
                    {
                        title: "Responsabilité de la plateforme",
                        desc: "ColiFlow sert de plateforme pour mettre en relation les utilisateurs et n'est pas responsable du contenu des colis. Les utilisateurs sont seuls responsables des articles qu'ils envoient ou transportent.",
                    },
                ].map((item, i) => (
                    <div
                        key={i}
                        className="p-5 rounded-xl border border-gray-100 bg-gray-50"
                    >
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <span
                                className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0"
                                style={{ backgroundColor: BRAND_BLUE }}
                            >
                                {i + 1}
                            </span>
                            {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed pl-7">
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>
        ),
    },

    "Cities Covered": {
        title: "Cities Covered",
        subtitle: "Villes Couvertes",
        badge: "Réseau",
        description:
            "Nous relions le Maroc, ville après ville. ColiFlow connaît une expansion rapide à travers tout le Royaume. Nous proposons actuellement des services d'expédition entre particuliers dans les grands centres suivants.",
        onThisPage: [
            "Statistiques de couverture",
            "Annuaire de la ville",
            "À venir",
        ],
        prev: "Customer Support",
        next: "Follow us",
        content: <CitiesContent />,
    },

    "Follow us": {
        title: "Follow us",
        subtitle: "Suivez-nous",
        badge: "Réseau",
        description: "Restez connecté avec ColiFlow sur nos réseaux sociaux et suivez toutes nos actualités.",
        onThisPage: ["GitHub", "Facebook", "Instagram"],
        prev: "Cities Covered",
        next: "Terms & Conditions",
        content: (
            <div className="space-y-4">
            {[
                {
                name: "GitHub",
                link: "https://github.com/your-username",
                color: "#111827",
                icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 008.2 11.4c.6.1.8-.26.8-.58v-2.2c-3.34.72-4.04-1.6-4.04-1.6-.54-1.38-1.32-1.74-1.32-1.74-1.08-.74.08-.72.08-.72 1.2.08 1.84 1.24 1.84 1.24 1.06 1.82 2.78 1.3 3.46.98.1-.78.42-1.3.76-1.6-2.66-.3-5.46-1.34-5.46-5.94 0-1.32.46-2.4 1.24-3.24-.12-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.24a11.5 11.5 0 016 0C17 3.02 18 3.34 18 3.34c.66 1.66.24 2.88.12 3.18.78.84 1.24 1.92 1.24 3.24 0 4.62-2.8 5.64-5.48 5.94.44.38.82 1.12.82 2.26v3.36c0 .32.2.7.82.58A12 12 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                ),
                },
                {
                name: "Facebook",
                link: "https://facebook.com/your-page",
                color: "#1877F2",
                icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12a10 10 0 10-11.5 9.88v-7H8v-3h2.5V9.5c0-2.46 1.47-3.82 3.72-3.82 1.08 0 2.2.2 2.2.2v2.4h-1.24c-1.22 0-1.6.76-1.6 1.54V12H16l-.4 3h-2.22v7A10 10 0 0022 12z"/>
                    </svg>
                ),
                },
                {
                name: "Instagram",
                link: "https://instagram.com/your-page",
                color: "#E1306C",
                icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm4.25 5.5A4.5 4.5 0 1016.5 12 4.5 4.5 0 0012 7.5zm0 7.5A3 3 0 1115 12a3 3 0 01-3 3zm4.75-8.75a1.25 1.25 0 11-1.25 1.25 1.25 1.25 0 011.25-1.25z"/>
                    </svg>
                ),
                },
            ].map((item) => (
                <a
                key={item.name}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/20 transition-all"
                >
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: item.color }}
                >
                    {item.icon}
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-900">
                    {item.name}
                    </p>
                    <p className="text-xs text-gray-400">
                    Suivez-nous sur {item.name}
                    </p>
                </div>
                </a>
            ))}
            </div>
        ),
        },

    "Privacy Policy": {
        title: "Privacy Policy",
        subtitle: "Confidentiality",
        badge: "Mentions légales",
        description:
            "Vos données vous appartiennent. Nous prenons la protection de votre vie privée très au sérieux.",
        onThisPage: ["Protection des données", "Lieu", "Cookies"],
        prev: "Terms & Conditions",
        next: "FAQ",
        content: (
            <div className="space-y-4">
                <div className="border-l-4 pl-4 py-3 rounded-r-xl bg-green-50 border-green-300">
                    <p className="text-sm font-semibold text-green-800 mb-0.5">
                        Nous accordons de l'importance à la protection de vos
                        données personnelles
                    </p>
                    <p className="text-xs text-green-600">
                        Nous ne vendons jamais vos données et ne les partageons
                        jamais avec des tiers sans votre consentement.
                    </p>
                </div>
                {[
                    {
                        icon: (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        ),
                        title: "Protection des données",
                        desc: "Vos informations personnelles et vos documents CIN sont cryptés à l'aide de l'algorithme AES-256 et ne sont jamais communiqués à des tiers.",
                    },
                    {
                        icon: (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                        ),
                        title: "Lieu",
                        desc: "Nous n'utilisons votre position géographique que pour vous aider à trouver des voyageurs ou des expéditeurs à proximité. Les données de localisation ne sont jamais conservées de manière permanente.",
                    },
                    {
                        icon: (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        ),
                        title: "Cookies",
                        desc: "Nous utilisons des cookies uniquement pour vous permettre de rester connecté et pour améliorer votre expérience utilisateur. Nous n'utilisons aucun cookie de suivi tiers.",
                    },
                ].map((item) => (
                    <div
                        key={item.title}
                        className="flex gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50 hover:border-blue-100 transition-all"
                    >
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white"
                            style={{ backgroundColor: BRAND_BLUE }}
                        >
                            {item.icon}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                {item.title}
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        ),
    },


    FAQ: {
        title: "FAQ",
        subtitle: "Foire aux questions",
        badge: "Aide",
        description: "Réponses rapides aux questions courantes.",
        onThisPage: [
            "Est-ce sans danger ?",
            "Combien ça coûte ?",
            "Que se passe-t-il si mon colis est perdu ?",
            "Comment puis-je faire vérifier mon compte ?",
            "Puis-je annuler une livraison ?",
        ],
        prev: "Privacy Policy",
        next: null,
        content: <FAQContent />,
    },
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

const sidebarSections = [
    {
        title: "Help Center",
        items: [
            { label: "How it works" },
            { label: "Impact Écologique" },
            { label: "Customer Support" },
            { label: "Cities Covered" },
            { label: "Follow us" },
        ],
    },
    {
        title: "Legal",
        items: [{ label: "Terms & Conditions" }, { label: "Privacy Policy" }],
    },
    {
        title: "Support",
        items: [{ label: "FAQ" }],
    },
]

function Sidebar({ active, setActive, mobileOpen, setMobileOpen }) {
    return (
        <>
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
            <aside
                className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-100 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:sticky lg:top-0 lg:translate-x-0 lg:z-auto  lg:shrink-0
        `}
            >
                {/* Logo */}
                <div className="flex justify-center items-center gap-2.5 px-5 py-4 border-b border-gray-100">
                    <div>
                        <img src="/images/Logo.png" alt="" className="w-40" />
                    </div>
                </div>

                {/* Nav sections */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    {sidebarSections.map((section) => (
                        <div key={section.title} className="mb-5">
                            <p className="px-2 mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {section.title}
                            </p>
                            {section.items.map((item) => {
                                const isActive = item.label === active
                                return (
                                    <button
                                        key={item.label}
                                        onClick={() => {
                                            setActive(item.label)
                                            setMobileOpen(false)
                                        }}
                                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm mb-0.5 transition-all duration-150 ${
                                            isActive
                                                ? "font-medium text-white"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                        }`}
                                        style={
                                            isActive
                                                ? {
                                                      backgroundColor:
                                                          BRAND_BLUE,
                                                  }
                                                : {}
                                        }
                                    >
                                        {item.label}
                                    </button>
                                )
                            })}
                        </div>
                    ))}
                </nav>

                <div className="px-4 py-4 border-t border-gray-100">
                    <p className="text-xs text-gray-300 text-center">
                        © 2026 ColiFlow · Casablanca, MA
                    </p>
                </div>
            </aside>
        </>
    )
}

// ─── TOP NAV (v1 style) ───────────────────────────────────────────────────────

function TopNav({ setMobileOpen }) {
    const { t, i18n } = useTranslation()

    const handleTranslateLang = (selectedLang) => {
        i18n.changeLanguage(selectedLang)

        localStorage.setItem("i18nextLng", selectedLang)
    }

    return (
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 flex items-center gap-4 px-5 py-3">
            {/* Mobile hamburger */}
            <button
                className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
                onClick={() => setMobileOpen((v) => !v)}
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                </svg>
            </button>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1 text-sm ml-2">
                {["Acceuil"].map((item, i) => (
                    <Link
                        to={"/"}
                        key={item}
                        href="#"
                        className={`px-3 py-1.5 rounded-md transition-colors font-medium cursor-pointer ${
                            i === 0
                                ? ""
                                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                        }`}
                        style={i === 0 ? { color: BRAND_BLUE } : {}}
                    >
                        {item}
                    </Link>
                ))}
            </nav>

            {/* Right side */}
            <div className="ml-auto flex items-center gap-2">
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
                            <button onClick={() => handleTranslateLang("en")}>
                                <span className="fi fi-gb"></span>
                            </button>
                        </li>
                        <li value="ar">
                            <button onClick={() => handleTranslateLang("ar")}>
                                <span className="fi fi-sa"></span>
                            </button>
                        </li>
                        <li value="fr">
                            <button onClick={() => handleTranslateLang("fr")}>
                                <span className="fi fi-gf"></span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    )
}

// ─── ON THIS PAGE ─────────────────────────────────────────────────────────────

function OnThisPage({ items }) {
    const [active, setActive] = useState(items[0])
    useEffect(() => setActive(items[0]), [items])
    return (
        <aside className="hidden xl:block w-52 shrink-0">
            <div className="sticky top-20 pt-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    On This Page
                </p>
                <ul className="space-y-1.5">
                    {items.map((item) => (
                        <li key={item}>
                            <button
                                onClick={() => setActive(item)}
                                className="text-sm text-left w-full leading-snug transition-colors"
                                style={{
                                    color:
                                        item === active
                                            ? BRAND_BLUE
                                            : "#9ca3af",
                                }}
                            >
                                {item}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    )
}

// ─── MAIN CONTENT ─────────────────────────────────────────────────────────────

function MainContent({ pageKey, setActive }) {
    const [visible, setVisible] = useState(true)
    const [renderedKey, setRenderedKey] = useState(pageKey)
    const prevKey = useRef(pageKey)

    useEffect(() => {
        if (pageKey !== prevKey.current) {
            setVisible(false)
            const t = setTimeout(() => {
                setRenderedKey(pageKey)
                prevKey.current = pageKey
                setVisible(true)
                window.scrollTo({ top: 0, behavior: "smooth" })
            }, 150)
            return () => clearTimeout(t)
        }
    }, [pageKey])

    const page = pages[renderedKey]
    if (!page) return null

    const badgeStyles = {
        Guide: { bg: "#e0f2fe", color: BRAND_BLUE },
        Help: { bg: "#f0fdf4", color: "#16a34a" },
        Legal: { bg: "#fefce8", color: "#b45309" },
        Network: { bg: "#f0f9ff", color: "#0369a1" },
    }
    const badge = badgeStyles[page.badge] || badgeStyles.Guide

    return (
        <article
            className="flex-1 min-w-0 max-w-3xl py-8 px-4 lg:px-10"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0px)" : "translateY(10px)",
                transition: "opacity 0.15s ease, transform 0.15s ease",
            }}
        >
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
                <span>ColiFlow</span>
                <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
                <span className="text-gray-500">{page.title}</span>
            </div>

            {/* Header */}
            <div className="mb-8">
                <span
                    className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3"
                    style={{ backgroundColor: badge.bg, color: badge.color }}
                >
                    {page.badge}
                </span>
                <h1
                    className="text-3xl font-bold tracking-tight mb-1"
                    style={{ color: BRAND_BLUE }}
                >
                    {page.title}
                </h1>
                <p
                    className="text-sm italic mb-3"
                    style={{ color: `${BRAND_BLUE}99` }}
                >
                    {page.subtitle}
                </p>
                <p className="text-base text-gray-500 leading-relaxed">
                    {page.description}
                </p>
            </div>

            <hr className="border-gray-100 mb-8" />

            {page.content}

            {/* Prev / Next */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-100">
                {page.prev ? (
                    <button
                        onClick={() => setActive(page.prev)}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors group"
                    >
                        <svg
                            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        <span>
                            <span className="block text-xs text-gray-300 mb-0.5">
                                Previous
                            </span>
                            {page.prev}
                        </span>
                    </button>
                ) : (
                    <div />
                )}
                {page.next ? (
                    <button
                        onClick={() => setActive(page.next)}
                        className="flex items-center gap-2 text-sm font-medium transition-all group text-right hover:opacity-80"
                        style={{ color: BRAND_BLUE }}
                    >
                        <span>
                            <span
                                className="block text-xs mb-0.5"
                                style={{ color: `${BRAND_BLUE}66` }}
                            >
                                Next
                            </span>
                            {page.next}
                        </span>
                        <svg
                            className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                ) : (
                    <div />
                )}
            </div>
        </article>
    )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function ReadMore() {
    const { page } = useParams()

    const initialPage = page || "How it works"

    const [active, setActive] = useState(initialPage)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        if (page) {
            setActive(page)
        }
    }, [page])

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <TopNav setMobileOpen={setMobileOpen} />
            <div className="flex max-w-7xl mx-auto">
                <Sidebar
                    active={active}
                    setActive={setActive}
                    mobileOpen={mobileOpen}
                    setMobileOpen={setMobileOpen}
                />
                <div className="flex flex-1 min-w-0">
                    <MainContent pageKey={active} setActive={setActive} />
                    <OnThisPage items={pages[active]?.onThisPage || []} />
                </div>
            </div>
        </div>
    )
}
