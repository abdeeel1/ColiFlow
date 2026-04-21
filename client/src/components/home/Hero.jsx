import { Package, Zap } from "lucide-react";
import Features from "../../ui/components/Features";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Link } from "react-router-dom";

const Hero = () => {
    
    useGSAP(() => {
        gsap.to('#tag-website', {
            y : 20,
            duration : 2,
            yoyo : true,
            repeat : -1,
            ease: 'linear'
            
        })

        gsap.from('#header-title', {
            scale : 2,
            opacity : 0,
            duration : 1.5
        })

        gsap.fromTo('#span1', {
            x: 500
        }, {
            x : 0,
            duration : 1.3
        })

        gsap.from('#desciption', {
            opacity : 0,
            duration : 4
        })

        gsap.from('#cta-buttons', {
            y: 50,
            duration : 0.8,
            ease : 'linear'
        })

        gsap.to('#progress', {
            
            width : '100%',
            duration : 6,
            repeat : -1,
            ease : 'linear'
        })

        

    }, [])

    return ( 
        <section className="mt-5 min-h-dvh" >
        
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

            <div  className="flex flex-col space-y-2 justify-center items-center py-10 2xl:py-20">
                <p id="header-title" className="font-bold font-clashdisplay-bold  text-center text-[32px] md:text-[48px] lg:text-[4.5rem] leading-tight text-[#2D3436]">
                    Envoyez vos Colis au <br />
                    <span className="text-[#0984E3]">Maroc</span> en Toute 
                    <span id="span1" className="inline-flex items-center gap-2 text-[#0984E3] ml-2">
                    <Package className="size-10 " />
                    Simplicité
                    </span>
                </p>

                <div id="desciption" className="mb-4 lg:mb-8">
                    <span className="text-center text-[12px] lg:text-[18px] text-[#141414]">La première plateforme P2P de livraison au Maroc.</span>
                </div>

                <div id="cta-buttons" className="flex gap-4">
                    <Link to={"/travels"}><button className="btn btn-ghost hover:border-[#0984E3]  bg-[#0984E3] rounded-2xl text-white font-bold btn-sm lg:btn-md">Trouver un trajet</button></Link>
                    <button className="btn btn-ghost hover:border-[#c7c9caf6]  bg-[#c7c9caf6] rounded-2xl text-gray-500 font-bold btn-sm lg:btn-md">Publier un trajet</button>
                </div>
            </div>

            <div>
                <div>
                    <Features />

                    <div id="progress" className="bg-gray-400 py-px mb-15 mt-5 lg:mt-0 w-10"></div>
                </div>

                <div className="md:flex md:justify-center md:items-center">
                    <img src="/images/HeroSection-Picture.png" alt="" className="w-full h-full md:w-130 lg:w-170 2xl:w-200" />
                </div>
            </div>
            
        
        </section>
    );
}
 
export default Hero;