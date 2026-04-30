import { BrowserRouter, Route, Routes } from "react-router-dom"
import "./App.css"
import Layout from "./layouts/Layout"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import NotFound from "./pages/NotFound"
import TravelsList from "./pages/TravelsList"
import TravelDetail from "./pages/TravelDetail"
import ScrollToTop from "./components/ScrollToTop"
import AddPackage from "./pages/AddPackage"
import ForgotPassword from "./pages/ForgotPassword"
import AddTravel from "./pages/AddTravel"
import { Toaster } from "./components/ui/sonner"
import { useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import axiosClient from "./services/axios"
import { logout, setUser } from "./store/slices/authSlice"
import CompleteProfile from "./pages/CompleteProfile"
import ResetPassword from "./pages/ResetPassword"
import ProtectedRoute from "./utils/ProtectedRoute"
import { useTranslation } from "react-i18next"
import ReadMore from "./pages/ReadMore"

function App() {
    const dispatch = useDispatch()

    const [checkingServer, setCheckingServer] = useState(true)

    const { t, i18n } = useTranslation()

    useEffect(() => {
        document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr"
    }, [i18n.language])

    useEffect(() => {
        const verifySession = async () => {
            try {
                const res = await axiosClient.get("/api/user")
                dispatch(setUser(res.data))
            } catch (err) {
                console.log(err)
                dispatch(logout())
            } finally {
                setCheckingServer(false)
            }
        }

        verifySession()
    }, [dispatch])

    if (checkingServer) {
        return (
            <div className="min-h-screen gap-2 flex items-center justify-center transition-opacity duration-300">
                <span className="loading loading-spinner loading-lg text-[#0984E3]"></span>
                <p className="text-center text-[1rem] font-bold">
                    {t('Veuillez patienter')}
                </p>
            </div>
        )
    }

    return (
        <div className="font-plusjakarta">
            <BrowserRouter>
                <ScrollToTop />

                <Toaster position="top-right" />

                <Routes>
                    {/* Routes without Layout - Login & Signup */}

                    <Route element={<ProtectedRoute />}>
                        <Route path="/travels/create" element={<AddTravel />} />

                        <Route
                            path="/packages/create"
                            element={<AddPackage />}
                        />
                    </Route>

                    <Route path="login" element={<Login />} />

                    <Route path="register" element={<Signup />} />

                    <Route
                        path="/complete-profile"
                        element={<CompleteProfile />}
                    />

                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />

                    <Route
                        path="/password-reset/:token"
                        element={<ResetPassword />}
                    />

                    {/* Routes Layout */}

                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />

                        <Route path="/travels" element={<TravelsList />} />

                        <Route path="/travel/:id" element={<TravelDetail />} />
                    </Route>

                    <Route path="/readmore/:page" element={<ReadMore />} />

                    {/* Not Found Page */}

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
