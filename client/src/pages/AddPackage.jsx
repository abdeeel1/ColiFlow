
import FormStepLast from "@/components/sender-form/FormStepLast";
import FormStepOne from "@/components/sender-form/FormStepOne";
import FormStepThree from "@/components/sender-form/FormStepThree";
import FormStepTwo from "@/components/sender-form/FormStepTwo";
import { CheckCircle, Circle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddPackage = () => {
    const nums = [1, 2, 3, 4]
    const navigate = useNavigate()

    const [step, setStep] = useState(1)
    const nextStep = () => setStep((prev) => prev + 1)
    const prevStep = () => setStep((prev) => prev - 1)

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Package Add ! -- Test Mode')
    }

    const handleCancel = () => {
        navigate('/')
    }

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
                            {/* Ligne de fond du stepper (Optionnel, à ajuster selon tes préférences) */}
                            {/* <div className="hidden md:block absolute top-[50%] left-[10%] right-[10%] h-0.5 bg-slate-100 -z-0"></div> */}
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
                <div className="w-full">
                    {step === 1 && <FormStepOne />}
                    {step === 2 && <FormStepTwo />}
                    {step === 3 && <FormStepThree />}
                    {step === 4 && <FormStepLast />}
                </div>

                {/* Actions (Boutons) */}
                <div className="flex justify-between items-center mt-6 px-2">
                    {step === 1 ? (
                        <button className="btn btn-ghost text-slate-500 hover:bg-slate-200 rounded-xl px-6 py-3 font-semibold transition-colors" onClick={handleCancel}>
                            Annuler
                        </button>
                    ) : (
                        <button className="btn btn-ghost bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl px-6 py-3 font-semibold transition-colors" onClick={prevStep}>
                            ← Précédent
                        </button>
                    )}

                    <button 
                        className={`btn text-white rounded-xl px-8 py-3 font-bold shadow-lg transition-all transform active:scale-95 border-0 ${step === 4 ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30' : 'bg-[#0984E3] hover:bg-[#076ebd] shadow-blue-500/30'}`}
                        onClick={step === 4 ? handleSubmit : nextStep}
                    >
                        {step === 4 ? 'Publier l\'annonce' : 'Suivant →'}
                    </button>
                </div>

            </div>
        </main>
    );
}
 
export default AddPackage;