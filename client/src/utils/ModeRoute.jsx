import { Navigate, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"

// Protects sender/traveler dashboards by the user's active mode.
// - guests        -> login
// - wrong mode    -> redirected to the dashboard matching their active mode
// Admins are allowed through: they switch between "espace admin" and
// "utilisateur" via the profile dropdown.
const ModeRoute = ({ mode }) => {
    const { isAuth, user } = useSelector((state) => state.auth)

    if (!isAuth) {
        return <Navigate to="/login" replace />
    }

    const isTraveler = !!user?.is_traveler

    if (mode === "traveler" && !isTraveler) {
        return <Navigate to="/sender/dashboard" replace />
    }

    if (mode === "sender" && isTraveler) {
        return <Navigate to="/traveler/dashboard" replace />
    }

    return <Outlet />
}

export default ModeRoute
