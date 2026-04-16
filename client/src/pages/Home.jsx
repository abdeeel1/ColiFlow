import HowItsWork from "@/components/home/HowItsWork";
import BestChoices from "../components/home/BestChoices";
import Hero from "../components/home/Hero";
import Services from "@/components/home/Services";
import Faq from "@/components/home/Faq";

const Home = () => {
    return ( 
        <main className="flex flex-col justify-center items-center gap-X w-full">
        
            <Hero />

            <BestChoices />

            <HowItsWork />

            <Services />

            <Faq />
        
        </main>
    );
}
 
export default Home;