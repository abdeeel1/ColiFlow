import ColisCheckbox from "@/ui/components/ColisCheckbox";
import { ChevronDown } from "lucide-react";

const FormStepOne = () => {
    return ( 
        <div className="bg-white shadow-sm border border-slate-100 p-6 md:p-8 rounded-[2rem]">
            <form action="#">
                <div className="flex flex-col md:flex-row gap-6">
                    
                    {/* Input Objet */}
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-sm text-slate-700 font-bold">Que souhaitez-vous envoyer ?</label>
                        <input 
                            placeholder="Ex: Ordinateur, Sac de vêtements..." 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[0.95rem] rounded-xl px-4 py-3 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all" 
                        />
                    </div>
                    
                    {/* Select Catégorie */}
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-sm text-slate-700 font-bold">Catégorie</label>
                        <div className="relative w-full">
                            <select className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[0.95rem] rounded-xl appearance-none px-4 py-3 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all cursor-pointer">
                                <option value="0">Choisissez une catégorie</option>
                                <option value="1">Électronique & High-Tech</option>
                                <option value="2">Documents & Papier</option>
                                <option value="3">Mode & Accessoires</option>
                                <option value="4">Maison & Déco</option>
                                <option value="5">Autre</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                                <ChevronDown className="size-5" />
                            </div>
                        </div>
                    </div>

                </div>

                <div className="mt-8">
                    <label className="block text-sm text-slate-700 font-bold mb-4">Taille du colis</label>
                    <ColisCheckbox />
                </div>
            </form>
        </div>
    );
}
 
export default FormStepOne;