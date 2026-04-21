import ColisCheckbox from "@/ui/components/ColisCheckbox";
import { ArrowDown, ChevronDown } from "lucide-react";

const FormStepOne = () => {
    return ( 
        <div className="bg-white shadow p-6 rounded-2xl">
        
        

        <form action="#">
            <div className="flex flex-col xl:flex-row gap-4">
                <div className="flex flex-col gap-3 w-full">
                    <label htmlFor="" className="text-sm text-gray-600 font-semibold">Que souhaitez-vous envoyer ?</label>
                    <input placeholder="Ex:Ordinateur, Sac de vêtements, Documents..." type="text" className="border w-full text-[0.9rem] rounded-[0.625rem]  ps-2 py-1 placeholder:text-gray-300 placeholder:text-[0.8rem] focus:outline focus:outline-[#0984E3]" />
                </div>
                
                <div className="flex flex-col gap-3 w-full">
                    <label htmlFor="" className="text-sm text-gray-600 font-semibold">Catégorie</label>
                    
                    <div className="relative w-full">
                        <select className="border w-full rounded-[0.625rem] text-[0.9rem] appearance-none   px-2 py-1 placeholder:text-gray-300  focus:outline focus:outline-[#0984E3]" >
                            <option value="0">Choisissez une catégorie</option>
                            <option value="0">Électronique & High-Tech</option>
                            <option value="0">Documents & Papier</option>
                            <option value="0">Mode & Accessoires</option>
                            <option value="0">Maison & Déco</option>
                            <option value="0">Autre</option>
                        </select>

                        
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                            <ChevronDown className="size-[1.1rem]" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="my-8">
                <label htmlFor="" className="text-sm text-gray-600 font-semibold">Taille du colis</label>

                <ColisCheckbox />
            </div>
        </form>
        
        </div>
    );
}
 
export default FormStepOne;

