
import FormStepLast from "@/components/sender-form/FormStepLast";
import FormStepOne from "@/components/sender-form/FormStepOne";
import FormStepThree from "@/components/sender-form/FormStepThree";
import FormStepTwo from "@/components/sender-form/FormStepTwo";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Circle } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import z from "zod";

const AddPackage = () => {
    const nums = [1, 2, 3, 4]
    const navigate = useNavigate()

    const [step, setStep] = useState(1)
    

    

    const formSchema = z.object({
        colisName : z.string().trim().min(2, "le nom du colis doit comporter plus de trois mots"),
        category : z.string().min(1, "la sélection d'une catégorie est obligatoire"),
        colisSize : z.number("la sélection d'un poid est obligatoire"),
        cityOne : z.string().min(1, "la sélection d'une ville est obligatoire"),
        cityTwo : z.string().min(1, "la sélection d'une ville est obligatoire"),
        dateDelivery : z.string().min(1, 'date invalide'),
        emergencies : z.enum(['standard', 'urgent', 'très urgent'], {error: () => ({message : "la sélection d'une urgence est obligatoire"})}),
        pictures: z.any().refine((files) => files?.length > 0, "Ce champ est obligatoire"),
        description: z.string().optional(),
        price: z.coerce.number({ invalid_type_error: "Nombre invalide" }).min(1, "Prix requis"),
        acceptCondition : z.literal(true, 'vous devez accepter pour publier votre annonce')
    })

    const methods = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
        colisName: "",
        category: "",
        colisSize: undefined,
        cityOne: "",
        cityTwo: "",
        dateDelivery: "",
        emergencies: "standard",
        pictures: null,
        description: "",
        price: "",
        acceptCondition: false
    }
    });

    const handleCancel = () => {
        navigate('/')
    }

    const nextStep = async () => {
        let fields = []

        if(step === 1) fields = ["colisName", "category", "colisSize"]
        if(step === 2) fields = ["cityOne", "cityTwo", "dateDelivery", "emergencies"]
        if(step === 3) fields = ["pictures", "description"]
        if(step === 4) fields = ["price", "acceptCondition"]

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
                    <Circle className="size-3" fill="#0984E3" stroke="#0984E3" color="#0984E3" />
                    <h2 className="font-bold text-2xl text-slate-800">Ajouter un colis</h2>
                </div>

                {/* Bannière Stepper */}
                <div className="bg-[#0984E3] rounded-[2rem] p-6 md:p-8 shadow-lg shadow-blue-500/20">
                    <div className="flex items-center gap-3 mb-6">
                        <CheckCircle fill="#FFFFFF" color="#0984E3" className="size-6"/>
                        <p className="text-white text-lg font-medium">Créer un nouveau colis</p>
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
                                        {num === 1 ? "L'Objet" : num === 2 ? "Le Trajet" : num === 3 ? "Détails" : "Validation"}  
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
                                    {step === 1 ? "L'Objet" : step === 2 ? "Le Trajet" : step === 3 ? "Photos & Détails" : "Budget & Validation"}
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
                        {step === 1 && <FormStepOne />}
                        {step === 2 && <FormStepTwo />}
                        {step === 3 && <FormStepThree />}
                        {step === 4 && <FormStepLast />}

                        <div className="flex justify-between mt-6">
                        {step > 1 && (
                            <button type="button" onClick={prevStep} className="btn btn-ghsot bg-neutral-500 border-neutral-500 px-8 text-[1rem] rounded-2xl text-white font-bold">Prev</button>
                        )}

                        {step < 4 ? (
                            <button type="button" onClick={nextStep} className="btn btn-ghost px-8 text-[1rem] bg-[#0984E3] border-[#0984E3] rounded-2xl text-white font-bold">Next</button>
                        ) : (
                            <button type="submit" className="btn btn-ghost bg-green-700 border-green-700 px-8 text-[1rem] rounded-2xl">Submit</button>
                        )}
                        </div>
                    </form>
                </FormProvider>

                
            </div>
        </main>
    );
}
 
export default AddPackage;