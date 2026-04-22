import { FileUploadDemo } from "@/ui/FileUploadDemo";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const TravelerFormTwo = () => {
    const levels = ["voiture", "moto", "camionnette", "petit camion"]
    
    // Changement du nom pour ne pas confondre avec le step du parent
    const [urgency, setUrgency] = useState(0)

    return ( 
        <div className="bg-white shadow-sm border border-slate-100 p-6 md:p-8 rounded-[2rem]">
            <form action="" onSubmit={(e)=>{e.preventDefault()}} className="flex flex-col lg:flex-row lg:justify-between gap-4">

            <div>

                {/* Niveau d'urgence */}
                <div className="mb-8 flex flex-col gap-4 w-full">
                    <label className="text-sm text-slate-700 font-bold">Sélection du type</label>
                    <div className="flex lg:flex-wrap overflow-x-scroll lg:overflow-x-hidden lg:flex-row gap-3 items-center">
                        {levels.map((level, index) => (
                            <button 
                                type="button"
                                onClick={() => setUrgency(index)} 
                                key={index}
                                className={`px-6 py-2.5 rounded-full capitalize text-sm font-bold transition-all cursor-pointer duration-200 ${index === urgency ? 'bg-[#0984E3] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                <h4 className="font-semibold my-4 text-[#0767B1]">Détails techniques</h4>


                <div className="flex flex-col md:flex-row gap-6 p-2">
                    
                    {/* Départ */}
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-sm text-slate-700 font-bold">Modèle du véhicule</label>
                        <input 
                            placeholder="Ex: Dacia Dockker" 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[0.95rem] rounded-xl px-4 py-3 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all" 
                        />
                    </div>
                    
                    {/* Arrivée */}
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-sm text-slate-700 font-bold">Plaque d'immatriculation</label>
                        <input 
                            placeholder="Ex: Dacia Dockker" 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[0.95rem] rounded-xl px-4 py-3 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all" 
                        />
                    </div>
                </div>
            </div>


            <div className="w-full lg:w-100">
                <label className="block text-sm text-slate-700 font-bold mb-4">Zone d'upload</label>
                <FileUploadDemo header={"Cliquez pour ajouter une photo de votre véhicule"} description={"( JPG, PNG ou WebP )"} />
            </div>
                
            </form>
        </div>
    );
}
 
export default TravelerFormTwo;