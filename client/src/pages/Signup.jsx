import CheckedInput from "@/ui/CheckedInput";
import GoogleButton from "@/ui/GoogleButton";
import { Link } from "react-router-dom";

const Signup = () => {
    return ( 
        
        <main className="bg-[#F1F5F9]">

        {/* Mobile Version */}
        
        <div className="xl:hidden flex flex-col pt-6 px-10 justify-center   h-screen">
            
            <div className="">
                <h2 className="font-bold text-black text-[1.313rem] justify-start">Créer un compte</h2>
            </div>

            <form action="#">

                <div className="flex flex-col gap-2 justify-start items-start py-3">
                    <label htmlFor="Telephone" className="text-[0.875rem] font-semibold">Telephone</label>
                    <input type="tel" className="border w-full rounded-[0.625rem]  ps-2 py-1 placeholder:text-gray-300 placeholder:text-[0.875rem] focus:outline focus:outline-[#0984E3]" placeholder="+212600000000" />
                </div>
                
                <div className="flex flex-col gap-2 justify-start items-start">
                    <label htmlFor="nom" className="text-[0.875rem] font-semibold">Nom</label>
                    <input type="text" className="border w-full rounded-[0.625rem]  ps-2 py-1 placeholder:text-gray-300 placeholder:text-[0.875rem] focus:outline focus:outline-[#0984E3]" placeholder="Najib Abdessamad" />
                </div>
                
                <div className="flex flex-col gap-2 justify-start items-start py-3">
                    <label htmlFor="email" className="text-[0.875rem] font-semibold">Adressse e-mail</label>
                    <input type="email" className="border w-full rounded-[0.625rem]  ps-2 py-1 placeholder:text-gray-300 placeholder:text-[0.875rem] focus:outline focus:outline-[#0984E3]" placeholder="abdessamad@gmail.com" />
                </div>
                
                <div className="flex flex-col gap-2 justify-start items-start">
                    <div className="flex w-full justify-between items-center">
                        <label htmlFor="email" className="text-[0.875rem] font-semibold">Mot de passe</label>
                        
                    </div>
                    <input type="password" className="border w-full rounded-[0.625rem]  ps-2 py-1 placeholder:text-gray-300 placeholder:text-[0.875rem] focus:outline focus:outline-[#0984E3]" placeholder="********" />
                </div>
                
                <div className="flex gap-2 justify-start items-center py-10">
                    <CheckedInput />
                    <p className="text-[0.75rem] font-bold">J'accepte les conditions et la politique de confidentialité</p>
                </div>

                <div>
                    <button type="submit" className="btn bg-[#0984E3] btn-ghost text-white font-bold rounded-2xl w-full">S'inscrire</button>
                </div>

                <div className="flex justify-center items-center py-5">
                    <p className="text-[0.75rem] font-semibold">Or</p>
                </div>

                <div className="flex flex-col gap-5 justify-center items-center">
                    <GoogleButton text={"Sign up with Google"} />

                    <p className="text-center text-[0.75rem]">Déjà un compte ? <span className="text-[#0C2A92] font-bold"><Link to={"/login"}>Connectez-vous</Link></span></p>
                </div>
            
            
            
            </form>

        
        </div>    


        {/* Desktop Version */}
        
              <div className="hidden  xl:flex flex-row xl:flex-row-reverse   h-screen">
                
                
                
                <div className="w-full flex flex-col justify-center px-60">
                    <div className="flex flex-col gap-4">
                        <h2 className="font-bold text-black text-[1.563rem] justify-start">
                        Créer un compte
                        </h2>
                    </div>
        
                  <form action="#">

                        <div className="flex flex-col gap-2 justify-start items-start py-3">
                            <label htmlFor="Telephone" className="text-[0.875rem] font-semibold">Telephone</label>
                            <input type="tel" className="border w-full rounded-[0.625rem]  ps-2 py-1 placeholder:text-gray-300 placeholder:text-[0.875rem] focus:outline focus:outline-[#0984E3]" placeholder="+212600000000" />
                        </div>
                        
                        <div className="flex flex-col gap-2 justify-start items-start">
                            <label htmlFor="nom" className="text-[0.875rem] font-semibold">Nom</label>
                            <input type="text" className="border w-full rounded-[0.625rem]  ps-2 py-1 placeholder:text-gray-300 placeholder:text-[0.875rem] focus:outline focus:outline-[#0984E3]" placeholder="Najib Abdessamad" />
                        </div>

                        <div className="flex  flex-col gap-2 justify-start items-start py-10">
                            <label htmlFor="email" className="text-[0.938rem] font-semibold">
                                Adressse e-mail
                            </label>
                            <input
                                type="email"
                                className="border w-full rounded-[0.75rem]  ps-2 py-1 placeholder:text-gray-300 placeholder:text-[0.875rem] focus:outline focus:outline-[#0984E3]"
                                placeholder="abdessamad@gmail.com"
                            />
                        </div>
        
                    <div className="flex flex-col gap-2 justify-start items-start">
                            <div className="flex items-center w-full justify-between">
                                <label htmlFor="email" className="text-[0.938rem] font-semibold">
                                Mot de passe
                                </label>
                            </div>
                            <input
                                type="password"
                                className="border w-full rounded-[0.625rem]  ps-2 py-1 placeholder:text-gray-300 placeholder:text-[0.938rem] focus:outline focus:outline-[#0984E3]"
                                placeholder="********"
                            />
                    </div>
        
                    <div className="flex gap-2 justify-start items-center py-10">
                        <CheckedInput />
                        <p className="text-[0.938rem] font-bold">J'accepte les conditions et la politique de confidentialité</p>
                    </div>
        
                    <div>
                        <button
                            type="submit"
                            className="btn bg-[#0984E3] btn-ghost text-white font-bold rounded-2xl w-full"
                        >
                            S'inscrire
                        </button>
                    </div>
        
                    <div className="flex justify-center items-center py-5">
                        <p className="text-[0.875rem] font-semibold">Or</p>
                    </div>
        
                        <div className="flex flex-col gap-5 justify-center items-center">
                            <GoogleButton text={"Sign up with Google"} />
        
                            <p className="text-center text-[0.938rem]">
                                Déjà un compte ?{" "}
                                <span className="text-[#0C2A92] font-bold">
                                <Link to={"/login"}>Connectez-vous</Link>
                                </span>
                            </p>
                        </div>
                    </form>
        
                </div>
        
                <div>
                    <img src="/images/Login-Picture.jpg" alt="" className="w-400 h-full rounded-r-3xl" />
                </div>
        
              </div>    
        
        
        </main>
    );
}
 
export default Signup;