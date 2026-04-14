import { useState } from "react";
import MobileMenu from "../ui/MobileMenu";
import ToggleButton from "../ui/ToggleButton";
import { Globe } from 'lucide-react';


const Navbar = () => {
    
    const [isTraveler, setIsTraveler] = useState(false)
    
    return ( 
        <>
        
        <nav>

            <div className="bg-[#FFFFFF] rounded-2xl mx-4 my-4 flex justify-between items-center">
                <div className="h-10 flex items-center">
                    <img src="/Logo.png" alt="" className="w-25 h-30" />
                </div>

                <div className="flex gap-4 pe-4 items-center">
                    <ToggleButton isTraveler={isTraveler} setIsTraveler={setIsTraveler}  />

                    <div className="flex items-center">
                        <Globe width={16} color="gray" className="cursor-pointer" />

                        <button >
                            <MobileMenu isTraveler={isTraveler}  />
                        </button>
                    </div>
                </div>
            </div>


        </nav>


        </>
    );
}
 
export default Navbar;