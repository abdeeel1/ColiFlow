import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "@/services/axios";
import { toast } from "sonner";
import { logout } from "@/store/slices/authSlice";
import ToggleButton from "./ToggleButton";


export default function MobileMenu({ isTraveler }) {
  const [isOpen, setIsOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [loading, setLoading] = useState(false)

  const {isAuth, user} = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    
    setLoading(true)

    try {

      await axiosClient.post('/logout')
      dispatch(logout())
      navigate('/login')

    } catch (error) {

        console.log(error)

    }

    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const senderLinks = [
    { label: "Nouveau colis", href: "/packages/create" },
    { label: "Liste des trajets", href: "/travels" },
    { label: "Dashboard", href: "#" },
  ];

  const travelerLinks = [
      { label: "Nouveau travel", href: "/travels/create" },
      { label: "Demandes de Réservation", href: "#" },
      { label: "Dashboard", href: "#" },
  ];

  const subLinks = isTraveler ? travelerLinks : senderLinks;
  const mainLabel = isTraveler ? "Publier un travel" : "Envoyer un colis";
  const secondaryLabel = isTraveler ? "Mes Travel" : "Mes Colis";

  return (
    <>
    <div className="mobile-only flex flex-col items-center font-plusjakarta">
      
      <button onClick={() => setIsOpen(true)} aria-label="Open menu">
        <Menu color="gray" size={20} />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setIsOpen(false)}
        />
      )}

      
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-xl flex flex-col px-5 py-6 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        
        <nav className="flex flex-col gap-1 flex-1">
          <Link to="/"  className="px-3 py-2.5 rounded-xl text-sm text-[#2D3436] hover:bg-gray-100">Acceuil</Link>
          
          <button
            onClick={() => setSubmenuOpen(!submenuOpen)}
            className="flex justify-between items-center w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-[#2D3436] hover:bg-gray-100"
          >
            {mainLabel}
            {submenuOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {submenuOpen && (
            <div className="flex flex-col pl-3 mb-1">
              {subLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="px-3 py-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 hover:text-[#2D3436]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <a href="#" className="px-3 py-2.5 rounded-xl text-sm text-[#2D3436] hover:bg-gray-100">
            {secondaryLabel}
          </a>
          <a href="#faq" className="px-3 py-2.5 rounded-xl text-sm text-[#2D3436] hover:bg-gray-100">
            FAQ
          </a>
        </nav>

        
        <div className="border-t flex flex-col gap-4 border-gray-200 pt-4 mt-4">
          
          <div>
            <ToggleButton />  
          </div>

          
          {
            !isAuth ?
            <Link to={"/login"}>
              <button className="btn btn-ghost w-full hover:bg-[#0984E3] bg-[#0984E3] text-white font-bold rounded-2xl text-sm">
                Se connecter
              </button>
            </Link>
            :
            <button onClick={handleLogout} className="btn btn-ghost w-full border-red-700 hover:bg-red-700 bg-red-700 text-white font-bold rounded-2xl text-sm">
                {loading ? <span className="loading loading-spinner loading-sm text-white"></span> : 'Se déconnecter'}
            </button>
          }
          <button className="btn btn-neutral w-full  text-white font-bold rounded-2xl text-sm">
            Dashboard
          </button>
        </div>
      </div>
    </div>
    </>
  );
}