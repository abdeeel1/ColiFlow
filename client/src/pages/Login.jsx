import CheckedInput from "@/ui/CheckedInput";
import GoogleButton from "@/ui/GoogleButton";
import { Link } from "react-router-dom";

const Login = () => {
    return ( 
        
        <main className="bg-[#F1F5F9]">

        {/* Mobile Version */}
        
        <div className="lg:hidden flex flex-col py-20 px-10 justify-center h-screen">
            
            <div className="">
                <h2 className="font-bold text-black text-[21px] justify-start">Ravi de vous revoir !</h2>
                <p className="text-[#000000] text-[13px]">Enter your credentials to access your account</p>
            </div>

            <form action="#">

                <div className="flex  flex-col gap-2 justify-start items-start py-10">
                    <label htmlFor="email" className="text-[14px] font-semibold">Adressse e-mail</label>
                    <input type="email" className="border w-full rounded-[10px] pe-30 ps-2 py-1 placeholder:text-gray-300 placeholder:text-[14px] focus:outline focus:outline-[#0984E3]" placeholder="abdessamad@gmail.com" />
                </div>
                
                <div className="flex flex-col gap-2 justify-start items-start">
                    <div className="flex items-center md:gap-112 gap-20">
                        <label htmlFor="email" className="text-[14px] font-semibold">Mot de passe</label>
                        <p className="text-[12px] text-[#0C2A92] font-semibold">Mot de passe oublié ?</p>
                    </div>
                    <input type="email" className="border w-full rounded-[10px] pe-30 ps-2 py-1 placeholder:text-gray-300 placeholder:text-[14px] focus:outline focus:outline-[#0984E3]" placeholder="********" />
                </div>
                
                <div className="flex gap-2 justify-start items-center py-10">
                    <CheckedInput />
                    <p className="text-[12px] font-bold">Se souvenir de moi</p>
                </div>

                <div>
                    <button type="submit" className="btn bg-[#0984E3] btn-ghost text-white font-bold rounded-2xl w-full">Connexion</button>
                </div>

                <div className="flex justify-center items-center py-5">
                    <p className="text-[12px] font-semibold">Or</p>
                </div>

                <div className="flex flex-col gap-5 justify-center items-center">
                    <GoogleButton text={"Sign in with Google"} />

                    <p className="text-center text-[12px]">Vous n'avez pas de compte ? <span className="text-[#0C2A92] font-bold"><Link to={"/signup"}>Créer un compte</Link></span></p>
                </div>
            
            
            
            </form>

        
        </div>        
        
        
        </main>
    );
}
 
export default Login;