import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FormStepTwo = () => {
    
    const levels = ["standard", "urgent", "très urgent"]

    const [step, setStep] = useState(0)

    
    
    
    
    
    return ( 
        <div className="bg-white shadow p-6 rounded-2xl">
        
        

        <form action="" onSubmit={(e)=>{e.preventDefault()}}>
            <div className="flex flex-col xl:flex-row gap-4">
                
                        
                <div className="flex flex-col gap-3 w-full">
                    <label htmlFor="" className="text-sm text-gray-600 font-semibold">D'où part le colis ?</label>
                    <div className="relative w-full">
                        <select className="border w-full rounded-[0.625rem] appearance-none  ps-2 py-1 placeholder:text-gray-300 placeholder:text-[0.938rem] focus:outline focus:outline-[#0984E3]" >
                            <option value="0">Casablanca</option>
                            <option value="0">Rabat</option>
                            <option value="0">Tanger</option>
                            <option value="0">Agadir</option>
                            <option value="0">Fez</option>
                            
                        </select>

                        
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                            <ChevronDown className="size-[1.1rem]" />
                        </div>
                        
                        
                    </div>
                </div>
                
                <div className="flex flex-col gap-3 w-full">
                    <label htmlFor="" className="text-sm text-gray-600 font-semibold">Où doit-il arriver ?</label>
                    <div className="relative w-full">
                        <select className="border w-full rounded-[0.625rem] appearance-none  ps-2 py-1 placeholder:text-gray-300 placeholder:text-[0.938rem] focus:outline focus:outline-[#0984E3]" >
                            <option value="0">Rabat</option>
                            <option value="0">Casablanca</option>
                            <option value="0">Tanger</option>
                            <option value="0">Agadir</option>
                            <option value="0">Fez</option>
                        </select>

                        
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                            <ChevronDown className="size-[1.1rem]" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="my-8 flex flex-col gap-3 w-full">
                <label htmlFor="" className="text-sm text-gray-600 font-semibold">Quand doit-il être livré au plus tard ?</label>
                <input placeholder="Ex:Ordinateur, Sac de vêtements, Documents..." type="datetime-local" className="border w-full rounded-[0.625rem]  ps-2 py-1 placeholder:text-gray-300 placeholder:text-[0.938rem] focus:outline focus:outline-[#0984E3]" />
            </div>
            
            <div className="my-8 flex flex-col gap-3 w-full">
                <label htmlFor="" className="text-sm text-gray-600 font-semibold">Niveau d'urgence</label>
                <div className="flex gap-4 items-center">
                    {
                        levels.map((level, index) => (
                            <div onClick={() => setStep(index)} key={index}>
                                <label 
                                
                                className={` btn text-[0.65rem] md:text-[0.8rem] btn-sm rounded-full capitalize border-0 text-white font-bold
                                ${index === step ? 'bg-[#0984E3] hover:bg-[#0984E3]' : 'text-gray-500 bg-gray-400'} 
                                
                                `}
                                >
                                    {level}
                                </label>
                                
                            </div>
                            
                         
                            
                        ))
                    }
                </div>
            </div>
        </form>
        
        </div>
    );
}
 
export default FormStepTwo;