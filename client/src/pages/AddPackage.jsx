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
        <main className="p-4 xl:p-10 bg-[#F1F5F9]">
        
        <div className="flex flex-col h-full  md:h-334 lg:h-333 2xl:h-227.5 xl:px-40">
            <div className="flex  gap-2 items-center">
                <h2 className="font-bold text-[1.2rem]">Ajouter un colis</h2>
                <Circle className="size-2" fill="#0984E3" stroke="#0984E3" color="#0984E3" />
            </div>

            <div className="bg-[#0984E3] rounded-2xl p-6 my-5">
                <div className="flex items-center gap-2 my-4">
                    <CheckCircle fill="#FFFFFF" color="#0984E3" className="size-5"/>
                    <p className="text-white">Créer un nouveau colis</p>
                </div>

                <div className="bg-white rounded-2xl p-6">
                    <div className="hidden  md:flex items-center justify-between lg:justify-between lg:px-8">
                        {
                            nums.map((num, index)=>(
                                <div key={index} className="flex flex-col items-center gap-3">
                                    
                                    <span className={`rounded-full px-4 py-2 border-2 ${num === step ? 'bg-[#0984E3] text-white border-[#0984E3]' : 'bg-white text-[#0984E3] border-[#0984E3]'}`}>{num}</span>
                                    <span className="text-[0.9rem]">
                                        {
                                        
                                        num === 1 ? "L'Object" :
                                        num === 2 ? "Le Trajet" :
                                        num === 3 ? "Photos & Détails" :
                                        "Budget & Validation"
                                         
                                        }  
                                    </span>
                                </div>
                            ))
                        }
                    </div>

                    <div className="md:hidden flex flex-col items-center">
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-6">
                            <div 
                                className="bg-[#0984E3] h-full transition-all duration-300" 
                                style={{ width: `${(step / 4) * 100}%` }}
                            />
                            </div>
                            <p className="text-xs font-bold text-gray-400    uppercase tracking-wider">
                            Étape {step} sur 4
                            </p>
                        </div>
                </div>

                <p className="pt-4 text-white font-semibold">Complétez les 4 étapes pour proposer votre colis à la communauté.</p>
            </div>
            
            <div className="min-h-50 rounded-2xl p-6">
                {step === 1 && <FormStepOne />}
                {step === 2 && <FormStepTwo />}
                {step === 3 && <FormStepThree />}
                {step === 4 && <FormStepLast />}
            </div>

            
            <div className="py-6 px-10 lg:px-20   flex justify-between">
                
                {
                    step > 1 &&
                    <button className="btn btn-ghost bg-gray-300 rounded-2xl "
                    onClick={prevStep}
                    
                    >
                        ← Precedent
                    </button>
                }

                {
                    step === 1 && 
                    <button className="btn btn-ghost bg-gray-300 rounded-2xl "
                    onClick={handleCancel}
                    
                    >
                        Annuler
                    </button>
                    
                }

                <button 
                className={`btn btn-ghost  text-white rounded-2xl cursor-pointer  ${step === 4 ? 'bg-green-700 hover:bg-green-900 hover:border-green-900' : 'bg-[#0984E3] hover:bg-[#085fa1] hover:border-[#085fa1]'}`}
                onClick={step === 4 ? handleSubmit : nextStep}
                >
                    {step === 4 ? 'Publier →' : 'Suivante →'}
                </button>
            </div>

        </div>
        
        
        </main>
    );
}
 
export default AddPackage;