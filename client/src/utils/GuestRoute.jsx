import { Navigate, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"
import { getHomePath } from "./roles"

// Guest-only routes (login, register, forgot/reset password).
// Authenticated users are redirected to their proper landing page.
const GuestRoute = () => {
    const { isAuth, user } = useSelector((state) => state.auth)

    if (isAuth) {
        return <Navigate to={getHomePath(user)} replace />
    }

    return <Outlet />
}

export default GuestRoute
