import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Link } from "react-router-dom";

const NotFound = () => {
    
    useGSAP(()=>{

        gsap.to('#notfound', {
            y: 4,
            x: 30,
            z: 4,
            repeat : -1,
            duration: 1.4,
            yoyo : true,
            ease : "none"
        })
    })
    
    
    
    
    
    
    
    return ( 
        <main className="flex flex-col justify-center h-screen w-full items-center bg-[#F1F5F9]">
        
            
            <div className="bg-[#0984E3] lg:py-40 lg:px-40 lg:-left-30 lg:top-20 py-20 px-20 rounded-[100%] absolute top-7 -left-20"></div>

            <div id="notfound">
                <img src="/NotFound-Picture.png" alt="" className="w-full 2xl:h-180 lg:h-100" />
            </div>

            <div className="flex flex-col gap-2 items-center">
                <p className="font-bold text-[20px]">Une erreur est survenue</p>
                <p className="text-[12px] text-[#000000]">Oups ! Nous ne parvenons pas à trouver cette page</p>
            </div>

            <div className="py-5">
                <Link to={'/'}><button className="btn btn-ghost bg-[#0984E3] rounded-2xl text-white">Retour à l'accueil</button></Link>
            </div>
        
        
        </main>
    );
}
 
export default NotFound;