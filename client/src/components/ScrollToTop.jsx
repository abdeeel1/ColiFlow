import { useEffect } from "react"
import { useLocation } from "react-router-dom"

const ScrollToTop = () => {
    const { pathname, hash } = useLocation()

    useEffect(() => {
        // If the URL has a hash (e.g. "/#faq"), scroll to that section instead.
        if (hash) {
            const id = hash.slice(1)
            requestAnimationFrame(() => {
                const el = document.getElementById(id)
                if (el) el.scrollIntoView({ behavior: "smooth" })
            })
            return
        }

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
        })
    }, [pathname, hash])

    return null
}

export default ScrollToTop
