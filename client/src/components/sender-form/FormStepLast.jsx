import { useFormContext } from "react-hook-form";
import { CheckboxInput } from "../ui/checkbox";

const FormStepLast = () => {
    
    const { register, formState: {errors} } = useFormContext()
    
    
    
    
    
    return ( 
        <div className="bg-white shadow-sm border border-slate-100 p-6 md:p-8 rounded-[2rem]">
            
                <div className="flex flex-col gap-8">
                    
                    {/* Prix */}
                    <div className="flex flex-col gap-3 w-full md:w-1/2">
                        <label className="text-sm text-slate-700 font-bold">Combien proposez-vous au voyageur ?</label>
                        <div className="relative">
                            <input 
                                {...register('price')}
                                placeholder="Ex: 120" 
                                type="number" 
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-lg font-semibold rounded-xl px-4 py-3 pr-16 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all" 
                            />
                            <span className="absolute right-4 top-[50%] -translate-y-[50%] font-bold text-slate-400">
                                MAD
                            </span>
                        </div>
                    </div>
                    {errors.price && <p className="text-red-600 text-sm">{errors.price.message}</p>}

                    {/* Avertissement / Checkbox */}
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3 items-center">
                        <div className=" md:mt-0 shrink-0">
                            
                        <input type="checkbox" {...register('acceptCondition')} className="w-6 h-6 checkbox checkbox-warning rounded-full" />
                        </div>
                        <p className="text-sm font-medium text-orange-800 leading-tight">
                            Je confirme que le contenu de mon colis est conforme aux lois en vigueur et ne contient aucune substance interdite ou dangereuse.
                        </p>
                    </div>
                    {errors.acceptCondition && <p className="text-red-600 text-sm">{errors.acceptCondition.message}</p>}

                    
                </div>
            
        </div>
    );
}
 
export default FormStepLast;