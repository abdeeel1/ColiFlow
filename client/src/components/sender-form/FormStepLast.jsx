import CheckedInput from "@/ui/CheckedInput";
import ColisCheckbox from "@/ui/components/ColisCheckbox";
import { ArrowDown, ChevronDown } from "lucide-react";

const FormStepLast = () => {
    return ( 
        <div className="bg-white shadow p-6 rounded-2xl">
        
        

        <form action="#">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 w-full">
                    <label htmlFor="" className="text-sm text-gray-600 font-semibold">Combien proposez-vous au voyageur ?</label>
                    <input placeholder="Ex:120 MAD" type="number" className="border w-full text-[0.9rem] rounded-[0.625rem]  ps-2 py-1 placeholder:text-gray-300 placeholder:text-[0.8rem] focus:outline focus:outline-[#0984E3]" />
                </div>

                <div className="flex gap-2 justify-start items-center py-3">
                    <CheckedInput />
                    <p className="text-[0.75rem] font-bold text-center text-danger">Je confirme que le contenu de mon colis est conforme aux lois en vigueur et ne contient aucune substance interdite ou dangereuse</p>
                </div>
                
                
            </div>

            
        </form>
        
        </div>
    );
}
 
export default FormStepLast;

