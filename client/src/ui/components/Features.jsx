import { BookCheck, Home, MousePointerClickIcon, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";

const Features = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < 2 ? prev + 1 : 0));
    }, 2000); 
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { title: "Publiez votre annonce", desc: "Décrivez votre objet et trouvez un voyageur en quelques secondes.", icon : BookCheck},
    { title: "Profils Vérifiés", desc: "Envoyez en toute sécurité grâce à notre vérification d'identité par CIN.", icon : ShieldCheck },
    { title: "Suivi en Direct", desc: "Suivez l'état de votre livraison, du départ jusqu'à l'arrivée.", icon : MousePointerClickIcon }
  ];

  return (
    <section className="py-2 lg:py-10 max-w-6xl mx-auto">
      
      <div className="grid grid-cols-3 md:grid-cols-3 gap-12 text-center mb-10">
        {steps.map((step, index) => (
          <div key={index} className={`transition-opacity lg:h-50 flex flex-col gap-1 2xl:gap-2 duration-500 ${activeStep === index ? 'opacity-100' : 'opacity-50'}`}>
             <div className={`flex items-center ${activeStep === index ? 'border border-gray-400' : ''} justify-center md:mx-15 lg:mx-22 xl:mx-35 rounded-2xl bg-[#cbccc9] py-2 mb-2`}><step.icon color="gray" className="w-4.5" /></div>
             <p className="font-bold text-gray-600 text-md mb-2">{step.title}</p>
             <p className="text-gray-600 text-[11px] lg:text-[15px]">{step.desc}</p>
          </div>
        ))}
      </div>

      
        

    </section>
  );
};

export default Features;