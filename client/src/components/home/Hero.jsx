import { Package, Zap } from "lucide-react";
import Features from "../../ui/components/Features";

const Hero = () => {
    return ( 
        <section className="mt-20">
        
            <div className="flex gap-2 bg-[#0984E3] rounded-2xl  justify-center text-sm items-center mx-14">

                <div className="flex gap-4 items-center">
                    <div>
                    <Zap color="#FFFFFF" className="w-3.5" />
                    </div>
                    <div className="text-white font-semibold text-center">
                        <p className="text-[10px]">DISPONIBLE PARTOUT AU MAROC</p>
                    </div>
                </div>

            </div>

            <div className="flex flex-col space-y-2 justify-center items-center py-10">
                <p className="font-bold text-center text-[32px] md:text-[48px] leading-tight text-[#2D3436]">
                    Envoyez vos Colis au <br />
                    <span className="text-[#0984E3]">Maroc</span> en Toute 
                    <span className="inline-flex items-center gap-2 text-[#0984E3] ml-2">
                    <Package size={40} strokeWidth={2.5} />
                    Simplicité
                    </span>
                </p>

                <div className="mb-4">
                    <span className="text-center text-[12px] text-[#141414]">La première plateforme P2P de livraison au Maroc.</span>
                </div>

                <div className="flex gap-2">
                    <button className="btn btn-ghost hover:border-0 focus:border-0 hover:border-[#0984E3]  bg-[#0984E3] rounded-2xl text-white font-bold btn-sm">Trouver un trajet</button>
                    <button className="btn btn-ghost hover:border-0 focus:border-0 hover:border-[#c7c9caf6]  bg-[#c7c9caf6] rounded-2xl text-gray-500 font-bold btn-sm">Publier un trajet</button>
                </div>
            </div>

            <div>
                <div>
                    <Features />
                </div>

                <div>
                    <img src="/HeroSection-Picture.png" alt="" className="w-full h-full" />
                </div>
            </div>
            
        
        </section>
    );
}
 
export default Hero;