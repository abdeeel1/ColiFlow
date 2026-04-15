import BestChoices from "../components/home/BestChoices";
import Hero from "../components/home/Hero";

const Home = () => {
    return ( 
        <main className="flex flex-col justify-center items-center gap-X w-full">
        
            <Hero />

            <BestChoices />
        
        </main>
    );
}
 
export default Home;