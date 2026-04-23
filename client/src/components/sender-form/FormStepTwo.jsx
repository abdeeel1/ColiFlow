import { ChevronDown } from "lucide-react";
import { useFormContext } from "react-hook-form";

const FormStepTwo = () => {
    const levels = ["standard", "urgent", "très urgent"]
    
    const { register, setValue, watch, formState: {errors} } = useFormContext()

    

    const cityOne = watch('cityOne')

    const emergency = watch('emergencies')

    const cities = ["casablanca", "rabat", "tanger", "agadir", "fez", "marrakech"]

    return ( 
        <div className="bg-white shadow-sm border border-slate-100 p-6 md:p-8 rounded-[2rem]">
            
                <div className="flex flex-col md:flex-row gap-6">
                    
                    {/* Départ */}
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-sm text-slate-700 font-bold">D'où part le colis ?</label>
                        <div className="relative w-full">
                            <select {...register('cityOne')} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[0.95rem] rounded-xl appearance-none px-4 py-3 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all cursor-pointer" >
                                <option value="">Sélectionner une ville</option>
                                {
                                    cities.map((city, index)=>(
                                        <option key={index} value={city} className="capitalize">{city}</option>
                                    ))
                                }
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                                <ChevronDown className="size-5" />
                            </div>
                        </div>
                    {errors.cityOne && <p className="text-red-600 text-sm">{errors.cityOne.message}</p>}
                    </div>
                    
                    {/* Arrivée */}
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-sm text-slate-700 font-bold">Où doit-il arriver ?</label>
                        <div className="relative w-full">
                            <select {...register('cityTwo')} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[0.95rem] rounded-xl appearance-none px-4 py-3 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all cursor-pointer" >
                                <option value="">Sélectionner une ville</option>
                                {
                                    cities.filter(city=>city !== cityOne)
                                    .map((city, index)=>(
                                        <option className="capitalize" key={index} value={city} >{city}</option>
                                    ))
                                }
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                                <ChevronDown className="size-5" />
                            </div>
                        </div>
                    {errors.cityTwo && <p className="text-red-600 text-sm">{errors.cityTwo.message}</p>}
                    </div>

                </div>

                {/* Date */}
                <div className="mt-8 flex flex-col gap-2 w-full">
                    <label className="text-sm text-slate-700 font-bold">Quand doit-il être livré au plus tard ?</label>
                    <input 
                        {...register('dateDelivery')}
                        type="datetime-local" 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[0.95rem] rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all cursor-pointer" 
                    />
                </div>
                {errors.dateDelivery && <p className="text-red-600 text-sm">{errors.dateDelivery.message}</p>}

                
                {/* Niveau d'urgence */}
                <div className="mt-8 flex flex-col gap-3 w-full">
                    <label className="text-sm text-slate-700 font-bold">Niveau d'urgence</label>
                    <div className="flex flex-wrap gap-3 items-center">
                        {levels.map((level, index) => (
                            <button 
                                {...register('emergencies')}
                                type="button"
                                onClick={() => setValue("emergencies", level, {shouldValidate: true, shouldDirty: true})} 
                                key={index}
                                className={`px-6 py-2.5 rounded-full capitalize text-sm cursor-pointer font-bold transition-all duration-200 ${level === emergency ? 'bg-[#0984E3] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                    {errors.emergencies && <p className="text-red-600 text-sm">{errors.emergencies.message}</p>}
                </div>
            
        </div>
    );
}
 
export default FormStepTwo;