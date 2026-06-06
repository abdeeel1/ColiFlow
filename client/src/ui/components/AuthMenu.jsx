import axiosClient from "@/services/axios"
import { logout } from "@/store/slices/authSlice"
import { Avatar, Dropdown, Label } from "@heroui/react"
import { LayoutDashboard, LogOut, User } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"

export default function AuthMenu() {
    const { user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    if (!user) return null

    const handleLogout = async () => {
        try {
            await axiosClient.post("/logout")
            dispatch(logout())
            navigate("/login")
        } catch (error) {
            console.log(error)
        }
    }

    const isTraveler = user?.is_traveler

    return (
        <Dropdown>
            <Dropdown.Trigger className="rounded-full xl:mx-20 mx-2">
                <Avatar className="h-6 w-6 xl:h-10 xl:w-10">
                    <Avatar.Image
                        alt={user.name}
                        src={
                            user.profile_picture
                                ? user.profile_picture
                                : `https://ui-avatars.com/api/?name=${user.name}+Doe&background=0984E3&color=fff`
                        }
                    />
                </Avatar>
            </Dropdown.Trigger>
            <Dropdown.Popover>
                <div className="px-3 pt-3 pb-1">
                    <div className="flex items-center gap-2">
                        <Avatar size="sm">
                            <Avatar.Image
                                alt="Jane"
                                src={
                                    user.profile_picture
                                        ? user.profile_picture
                                        : `https://ui-avatars.com/api/?name=${user.name}+Doe&background=0984E3&color=fff`
                                }
                            />
                        </Avatar>
                        <div className="flex flex-col gap-0">
                            <p className="text-sm leading-5 font-medium">
                                {user.name}
                            </p>
                            <p className="text-xs leading-none text-neutral-400">
                                {user.email}
                            </p>
                        </div>
                    </div>
                </div>
                <Dropdown.Menu
                onAction={(key) => {
                    if (key === "dashboard") {
                        navigate(isTraveler ? "/traveler/dashboard" : "/sender/dashboard");
                    }
                    if (key === "profile") navigate("/profile");
                }}
                >
                    <Dropdown.Item id="dashboard" textValue="Dashboard">
                        <div className="flex w-full items-center justify-between gap-2 text-neutral-700">
                            <Label className="cursor-pointer">Dashboard</Label>
                            <LayoutDashboard size={14} />
                        </div>
                    </Dropdown.Item>
                    <Dropdown.Item id="profile" textValue="Profile">
                        <div className="flex w-full items-center justify-between gap-2 text-neutral-700">
                            <Label>Profile</Label>
                            <User size={14} />
                        </div>
                    </Dropdown.Item>

                    <Dropdown.Item
                        id="logout"
                        textValue="Logout"
                        variant="danger"
                    >
                        <div className="flex cursor-pointer w-full items-center justify-between gap-2 text-neutral-700">
                            <button
                                onClick={handleLogout}
                                className="text-red-700 cursor-pointer"
                            >
                                Se déconnecter
                            </button>
                            <LogOut
                                className="text-red-700 cursor-pointer"
                                size={14}
                            />
                        </div>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    )
}
