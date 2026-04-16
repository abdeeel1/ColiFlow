import { useEffect, useRef, useState } from "react";
import MobileMenu from "../ui/MobileMenu";
import ToggleButton from "../ui/ToggleButton";
import { ChevronDown, Globe } from 'lucide-react';
import gsap from "gsap";


const Navbar = () => {
    
    const [isTraveler, setIsTraveler] = useState(false)

    const navRef = useRef(null);

    useEffect(() => {
        
        gsap.fromTo(navRef.current, 
            { y: -100, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 1, 
                ease: "circ",
                clearProps: "all" 
            }
        );
    }, []);

    
    
    return ( 
        <header>
        
        <nav id="navbar" className="lg:px-10 fixed top-0 left-0 w-full z-50 bg-[#F1F5F9]" ref={navRef}>

            <div className="bg-[#FFFFFF] shadow-sm max-w-360 lg:mx-auto md:mx-10 rounded-2xl mx-4 my-4 flex justify-between items-center lg:py-2">
                <div className="h-10 flex items-center">
                    <img src="/Logo.png" alt="" className="w-25 h-30
                    lg:w-48 lg:h-50
                    " />
                </div>
                
                <div className="desktop-only">
                    {
                        !isTraveler ?
                        <ul className="lg:flex lg:items-center lg:gap-4 text-sm">
                            <div className="dropdown dropdown-hover">
                            <li className="lg:text-[#2D3436] cursor-pointer font-semibold flex items-center gap-2 hover:bg-gray-200 py-1 px-4 rounded-2xl">Envoyer un colis <ChevronDown /></li>
                            <ul tabIndex="-1" className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                                <li><a>Nouveau colis</a></li>
                                <li><a>Liste des colis</a></li>
                                <li><a>Dashboard</a></li>
                            </ul>
                            </div>
                            <li className="lg:text-[#2D3436] cursor-pointer hover:bg-gray-200 py-1 px-4 rounded-2xl">Mes Colis</li>
                            <li className="lg:text-[#2D3436] cursor-pointer hover:bg-gray-200 py-1 px-4 rounded-2xl">FAQ</li>
                        </ul>
                        :
                        <ul className="lg:flex lg:gap-4 lg:items-center text-sm">
                            <div className="dropdown dropdown-hover">
                            <li className="lg:text-[#2D3436] cursor-pointer font-semibold flex items-center gap-2 hover:bg-gray-200 py-1 px-4 rounded-2xl">Publier un trajet <ChevronDown /></li>
                            <ul tabIndex="-1" className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                                <li><a>Nouveau trajet</a></li>
                                <li><a>Demandes de Réservation</a></li>
                                <li><a>Dashboard</a></li>
                            </ul>
                            </div>
                            <li className="lg:text-[#2D3436] cursor-pointer hover:bg-gray-200 py-1 px-4 rounded-2xl">Mes Travel</li>
                            <li className="lg:text-[#2D3436] cursor-pointer hover:bg-gray-200 py-1 px-4 rounded-2xl">FAQ</li>
                        </ul>
                        
                        
                    }
                </div>

                <div className="lg:flex lg:gap-4 lg:pe-4 lg:items-center">


                    <div className="flex items-center gap-4 lg:gap-10">
                        <div>
                            <ToggleButton isTraveler={isTraveler} setIsTraveler={setIsTraveler}/>
                        </div>

                        <div className="flex gap-4  items-center pe-4">
                            <Globe color="gray" className='w-3.5 lg:w-5 cursor-pointer' />

                            <div id="menu" className="mobile-only bg-white">

                                <MobileMenu isTraveler={isTraveler}  />
                            </div>
                            
                        </div>

                        <div className="desktop-only">
                            <button className="btn btn-ghost hover:border-[#0984E3] xl:text-base xl:px-6 text-md bg-[#0984E3] text-white font-bold rounded-2xl transition-colors px-8">Se connecter</button>
                        </div>
                    </div>
                </div>
            </div>


        </nav>
        </header>
    );
}
 
export default Navbar;