import axiosClient from "@/services/axios";
import ColisCheckbox from "@/ui/components/ColisCheckbox";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

const TravelerFormOne = () => {
    
    const {register, watch, setValue, formState : {errors}} = useFormContext()
    
    const [cities, setCities] = useState([])
    
    useEffect(() => {
        try {
            axiosClient.get('/api/cities').then((res)=>setCities(res.data))
        } catch (err) {
            console.log(err)
        }
    }, [])

    
    const travelCityOne = watch('travelCityOne')

    useEffect(() => {
    if (!travelCityOne || cities.length === 0) return;

    const selectedCity = cities.find(
        (city) => city.id === Number(travelCityOne)
    );

    if (selectedCity) {
        setValue("latitude", selectedCity.latitude);
        setValue("longitude", selectedCity.longitude);
    }
    }, [travelCityOne, cities, setValue]);
    
    
    return ( 
        <div className="bg-white shadow-sm border border-slate-100 p-6 md:p-8 rounded-[2rem]">
            
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Input Objet */}
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-sm text-slate-700 font-bold">Ville de Départ</label>
                        <div className="relative w-full">
                            <select {...register('travelCityOne')} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[0.95rem] rounded-xl appearance-none px-4 py-3 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all cursor-pointer" >
                                <option value="">Sélectionner une ville</option>
                                {
                                    cities.map((city) => (
                                        <option key={city.id} value={city.id} className="capitalize">{city.name}</option>
                                    ))
                                }
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                                <ChevronDown className="size-5" />
                            </div>
                        </div>
                    {errors.travelCityOne && <p className="text-red-600 text-sm">{errors.travelCityOne.message}</p>}
                    </div>
                    
                    {/* Select Catégorie */}
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-sm text-slate-700 font-bold">Ville d'Arrivée</label>
                        <div className="relative w-full">
                            <select {...register('travelCityTwo')} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[0.95rem] rounded-xl appearance-none px-4 py-3 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all cursor-pointer" >
                                <option value="">Sélectionner une ville</option>
                                {
                                    cities.filter(city => city.id !== Number(travelCityOne) )
                                    .map((city) => (
                                        <option key={city.id} value={city.id} className="capitalize">{city.name}</option>
                                    ))
                                }
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                                <ChevronDown className="size-5" />
                            </div>
                        </div>
                     {errors.travelCityTwo && <p className="text-red-600 text-sm">{errors.travelCityTwo.message}</p>}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 my-5">
                    
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-sm text-slate-700 font-bold">Date et Heure de départ</label>
                        <input 
                        {...register('travelDate')}
                        type="datetime-local" 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[0.95rem] rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all cursor-pointer" 
                        />
                    </div>
                    {errors.travelDate && <p className="text-red-600 text-sm">{errors.travelDate.message}</p>}
                    
                    

                </div>
                
                <div className="grid grid-cols-1 my-5">
                    
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-sm text-slate-700 font-bold">Description</label>
                        <textarea 
                            {...register('travelDescription')}
                            className="w-full h-full min-h-37.5 bg-slate-50 border border-slate-200 text-slate-800 text-[0.95rem] rounded-xl px-4 py-3 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all resize-none" 
                            placeholder="Ex: Je peux m'arrêter sur les aires de repos de l'autoroute..." 
                        ></textarea>
                    </div>
                    {errors.travelDescription && <p className="text-red-600 text-sm">{errors.travelDescription.message}</p>}
                    
                    

                </div>



                
            
        </div>
    );
}
 
export default TravelerFormOne;