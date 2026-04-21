import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FormStepTwo = () => {
    const levels = ["standard", "urgent", "très urgent"]
    
    // Changement du nom pour ne pas confondre avec le step du parent
    const [urgency, setUrgency] = useState(0)

    return ( 
        <div className="bg-white shadow-sm border border-slate-100 p-6 md:p-8 rounded-[2rem]">
            <form action="" onSubmit={(e)=>{e.preventDefault()}}>
                <div className="flex flex-col md:flex-row gap-6">
                    
                    {/* Départ */}
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-sm text-slate-700 font-bold">D'où part le colis ?</label>
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
                    
                    {/* Arrivée */}
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-sm text-slate-700 font-bold">Où doit-il arriver ?</label>
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

                {/* Date */}
                <div className="mt-8 flex flex-col gap-2 w-full">
                    <label className="text-sm text-slate-700 font-bold">Quand doit-il être livré au plus tard ?</label>
                    <input 
                        type="datetime-local" 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[0.95rem] rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all cursor-pointer" 
                    />
                </div>
                
                {/* Niveau d'urgence */}
                <div className="mt-8 flex flex-col gap-3 w-full">
                    <label className="text-sm text-slate-700 font-bold">Niveau d'urgence</label>
                    <div className="flex flex-wrap gap-3 items-center">
                        {levels.map((level, index) => (
                            <button 
                                type="button"
                                onClick={() => setUrgency(index)} 
                                key={index}
                                className={`px-6 py-2.5 rounded-full capitalize text-sm font-bold transition-all duration-200 ${index === urgency ? 'bg-[#0984E3] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
            </form>
        </div>
    );
}
 
export default FormStepTwo;