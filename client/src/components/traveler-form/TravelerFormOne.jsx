import ColisCheckbox from "@/ui/components/ColisCheckbox";
import { ChevronDown } from "lucide-react";

const TravelerFormOne = () => {
    return ( 
        <div className="bg-white shadow-sm border border-slate-100 p-6 md:p-8 rounded-[2rem]">
            <form action="#">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Input Objet */}
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-sm text-slate-700 font-bold">Ville de Départ</label>
                        <div className="relative w-full">
                            <select className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[0.95rem] rounded-xl appearance-none px-4 py-3 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all cursor-pointer" >
                                <option value="">Sélectionner une ville</option>
                                <option value="1">Casablanca</option>
                                <option value="2">Rabat</option>
                                <option value="3">Tanger</option>
                                <option value="4">Agadir</option>
                                <option value="5">Fez</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                                <ChevronDown className="size-5" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Select Catégorie */}
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-sm text-slate-700 font-bold">Ville d'Arrivée</label>
                        <div className="relative w-full">
                            <select className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[0.95rem] rounded-xl appearance-none px-4 py-3 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all cursor-pointer" >
                                <option value="">Sélectionner une ville</option>
                                <option value="1">Rabat</option>
                                <option value="2">Casablanca</option>
                                <option value="3">Tanger</option>
                                <option value="4">Agadir</option>
                                <option value="5">Fez</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                                <ChevronDown className="size-5" />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 my-5">
                    
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-sm text-slate-700 font-bold">Date de départ</label>
                        <input 
                        type="datetime-local" 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[0.95rem] rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all cursor-pointer" 
                        />
                    </div>
                    
                    

                </div>
                
                <div className="grid grid-cols-1 my-5">
                    
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-sm text-slate-700 font-bold">Description</label>
                        <textarea 
                            className="w-full h-full min-h-37.5 bg-slate-50 border border-slate-200 text-slate-800 text-[0.95rem] rounded-xl px-4 py-3 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all resize-none" 
                            placeholder="Ex: Je peux m'arrêter sur les aires de repos de l'autoroute..." 
                        ></textarea>
                    </div>
                    
                    

                </div>



                
            </form>
        </div>
    );
}
 
export default TravelerFormOne;