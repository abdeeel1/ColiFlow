import { Navigate, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"

const AdminRoute = () => {
    const { isAuth, user } = useSelector((state) => state.auth)

    if (!isAuth) {
        return <Navigate to="/login" replace />
    }

    if (user?.role !== "admin") {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default AdminRoute
