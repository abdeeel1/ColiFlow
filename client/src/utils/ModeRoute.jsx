import { Navigate, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"

// Protects sender/traveler dashboards by the user's active mode.
// - guests        -> login
// - admins        -> admin dashboard (they don't use the sender/traveler areas)
// - wrong mode    -> redirected to the dashboard matching their active mode
const ModeRoute = ({ mode }) => {
    const { isAuth, user } = useSelector((state) => state.auth)

    if (!isAuth) {
        return <Navigate to="/login" replace />
    }

    if (user?.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />
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
