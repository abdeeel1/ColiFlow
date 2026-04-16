import { Package, Zap } from "lucide-react";
import Features from "../../ui/components/Features";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const Hero = () => {
    
    useGSAP(() => {
        gsap.to('#tag-website', {
            y : 20,
            duration : 2,
            yoyo : true,
            repeat : -1,
            
        })

        gsap.from('#header-title', {
            x: -600,
            opacity : 0.3,
            duration : 1.3
        })
    }, [])

    return ( 
        <section className="mt-20 lg:mt-30">
        
            <div id="tag-website" className="flex gap-2 bg-[#0984E3] rounded-2xl md:mx-55 lg:mx-80 xl:mx-100 2xl:mx-100 justify-center text-sm items-center mx-14">

                <div className="flex gap-2 items-center">
                    <div>
                    <Zap color="#FFFFFF" className="w-3.5" />
                    </div>
                    <div className="text-white font-semibold text-center">
                        <p className="text-[8px] lg:text-[10px]">DISPONIBLE PARTOUT AU MAROC</p>
                    </div>
                </div>

            </div>

            <div id="header-title" className="flex flex-col space-y-2 justify-center items-center py-10 2xl:py-20">
                <p className="font-bold text-center text-[32px] md:text-[48px] lg:text-[64px] leading-tight text-[#2D3436]">
                    Envoyez vos Colis au <br />
                    <span className="text-[#0984E3]">Maroc</span> en Toute 
                    <span className="inline-flex items-center gap-2 text-[#0984E3] ml-2">
                    <Package className="size-10 " />
                    Simplicité
                    </span>
                </p>

                <div className="mb-4 lg:mb-8">
                    <span className="text-center text-[12px] lg:text-[18px] text-[#141414]">La première plateforme P2P de livraison au Maroc.</span>
                </div>

                <div className="flex gap-4">
                    <button className="btn btn-ghost hover:border-[#0984E3]  bg-[#0984E3] rounded-2xl text-white font-bold btn-sm lg:btn-md">Trouver un trajet</button>
                    <button className="btn btn-ghost hover:border-[#c7c9caf6]  bg-[#c7c9caf6] rounded-2xl text-gray-500 font-bold btn-sm lg:btn-md">Publier un trajet</button>
                </div>
            </div>

            <div>
                <div>
                    <Features />
                </div>

                <div className="md:flex md:justify-center md:items-center">
                    <img src="/HeroSection-Picture.png" alt="" className="w-full h-full md:w-130 lg:w-170 2xl:w-200" />
                </div>
            </div>
            
        
        </section>
    );
}
 
export default Hero;