import TravelerFormLast from "@/components/traveler-form/TravelerFormLast";
import TravelerFormOne from "@/components/traveler-form/TravelerFormOne";
import TravelerFormThree from "@/components/traveler-form/TravelerFormThree";
import TravelerFormTwo from "@/components/traveler-form/TravelerFormTwo";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Circle } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import z from "zod";

const AddTravel = () => {
    const nums = [1, 2, 3, 4]

    const [step, setStep] = useState(1)

    const formSchema = z.object({
        travelCityOne : z.string().min(1, "la sélection d'une ville est obligatoire"),
        travelCityTwo : z.string().min(1, "la sélection d'une ville est obligatoire"),
        travelDate : z.string().min(1, 'date invalide'),
        travelDescription : z.string().optional(),
        carType : z.enum(['voiture', 'moto', 'camionnette', 'petit camion'], {error: () => ({message : "la sélection d'une voiture est obligatoire"})}),
        carModel : z.string().min(3, 'le modele du voiture doit comporter plus de trois mots'),
        carId : z.string().min(4, 'la matriculation du voiture doit comporter plus de trois mots'),
        carPictures : z.any().refine((files) => files?.length > 0, "Ce champ est obligatoire"),
        colisPoids : z.number("la sélection d'un poid est obligatoire"),
        colisAccept : z.array(z.string()).min(1, "choisissez au moins une option"),
        travelPrice: z.coerce.number({ invalid_type_error: "nombre invalide" }).min(1, "Prix requis"),
    })


    const methods = useForm({
        resolver : zodResolver(formSchema),
        defaultValues : {
            travelCityOne : "",
            travelCityTwo : "",
            travelDate : "",
            travelDescription : "",
            carType : 'voiture',
            carModel : "",
            carId : "",
            carPictures : null,
            colisPoids : "",
            colisAccept : [],
            travelPrice : ""
        }
    })

    const nextStep = async () => {
        let fields = []

        if(step === 1) fields = ["travelCityOne", "travelCityTwo", "travelDate", "travelDescription"]
        if(step === 2) fields = ["carType", "carModel",  "carId","carPictures"]
        if(step === 3) fields = ["colisPoids", "colisAccept"]
        if(step === 4) fields = ["travelPrice"]

        const valid = await methods.trigger(fields)

        console.log("valid:", valid)
        console.log("errors:", methods.formState.errors)

        if (valid) setStep(s => s + 1)
    }

    const prevStep = () => setStep((prev) => prev - 1)

    const onSubmitData = (data) => console.log(data)

    return ( 
        <main className="min-h-screen p-4 md:p-8 xl:p-12 bg-slate-50">
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
                
                {/* Header */}
                <div className="flex gap-3 items-center px-2">
                    <Link to={'/'} className="font-bold text-lg text-slate-800">← Retour</Link>
                </div>

                {/* Bannière Stepper */}
                <div className="bg-[#0984E3] rounded-[2rem] p-6 md:p-8 shadow-lg shadow-blue-500/20">
                    <div className="flex items-center gap-3 mb-6">
                        <CheckCircle fill="#FFFFFF" color="#0984E3" className="size-6"/>
                        <p className="text-white text-lg font-medium">Créer un nouveau trajet</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        {/* Stepper Desktop */}
                        <div className="hidden md:flex items-center justify-between px-4 lg:px-12">
                            {nums.map((num, index) => (
                                <div key={index} className="flex flex-col items-center gap-3 relative z-10">
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 font-bold transition-all duration-300 ${num === step ? 'bg-[#0984E3] text-white border-[#0984E3] shadow-md ring-4 ring-blue-50' : num < step ? 'bg-blue-50 text-[#0984E3] border-blue-200' : 'bg-white text-slate-300 border-slate-200'}`}>
                                        {num < step ? '✓' : num}
                                    </div>
                                    <span className={`text-sm font-semibold transition-colors ${num === step ? 'text-[#0984E3]' : 'text-slate-400'}`}>
                                        {num === 1 ? "Itinéraire & Date" : num === 2 ? "Véhicule" : num === 3 ? "Colis & Capacité" : "Prix & Validation"}  
                                    </span>
                                </div>
                            ))}
                            
                           
                        </div>

                        {/* Stepper Mobile */}
                        <div className="md:hidden flex flex-col">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-xs font-bold text-[#0984E3] uppercase tracking-wider">
                                    Étape {step} sur 4
                                </p>
                                <span className="text-xs font-semibold text-slate-500">
                                    {step === 1 ? "Itinéraire & Date" : step === 2 ? "Véhicule" : step === 3 ? "Colis & Capacité" : "Prix & Validation"}
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-[#0984E3] h-full transition-all duration-500 ease-out rounded-full" style={{ width: `${(step / 4) * 100}%` }} />
                            </div>
                        </div>
                    </div>

                    <p className="pt-6 text-blue-50/90 font-medium text-sm md:text-base">
                        Complétez les 4 étapes pour proposer votre colis à la communauté.
                    </p>
                </div>
                
                {/* Formulaire Actif */}
                <FormProvider {...methods} >
                    <form className="w-full" onSubmit={methods.handleSubmit(onSubmitData)}>
                        {step === 1 && <TravelerFormOne />}
                        {step === 2 && <TravelerFormTwo />}
                        {step === 3 && <TravelerFormThree />}
                        {step === 4 && <TravelerFormLast />}

                        <div className="flex justify-between mt-6">
                        {step > 1 && (
                            <button type="button" onClick={prevStep} className="btn btn-ghsot bg-neutral-500 border-neutral-500 px-8 text-[1rem] rounded-2xl text-white font-bold">Prev</button>
                        )}

                        {step < 4 ? (
                            <button type="button" onClick={nextStep} className="btn btn-ghost px-8 text-[1rem] bg-[#0984E3] border-[#0984E3] rounded-2xl text-white font-bold">Next</button>
                        ) : (
                            <button type="submit" className="btn btn-ghost bg-green-700 border-green-700 px-8 text-[1rem] rounded-2xl hover:text-white">Submit</button>
                        )}
                        </div>
                    </form>
                </FormProvider>

            </div>
        </main>
    );
}
 
export default AddTravel;