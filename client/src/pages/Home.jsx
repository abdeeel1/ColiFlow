import HowItsWork from "@/components/home/HowItsWork";
import BestChoices from "../components/home/BestChoices";
import Hero from "../components/home/Hero";
import Services from "@/components/home/Services";

const Home = () => {
    return ( 
        <main className="flex flex-col justify-center items-center gap-X w-full">
        
            <Hero />

            <BestChoices />

            <HowItsWork />

            <Services />
        
        </main>
    );
}
 
export default Home;