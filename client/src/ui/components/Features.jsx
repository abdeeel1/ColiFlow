import {
    BookCheck,
    Home,
    MousePointerClickIcon,
    ShieldCheck,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"

const Features = () => {
    const [activeStep, setActiveStep] = useState(0)

    const { t } = useTranslation()

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev < 2 ? prev + 1 : 0))
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    const steps = [
        {
            title: "features.step1.title",
            desc: "features.step1.desc",
            icon: BookCheck,
        },
        {
            title: "features.step2.title",
            desc: "features.step2.desc",
            icon: ShieldCheck,
        },
        {
            title: "features.step3.title",
            desc: "features.step3.desc",
            icon: MousePointerClickIcon,
        },
    ]

    return (
        <section className="max-w-6xl mx-auto mt-5 lg:mt-10">
            <div className="grid grid-cols-3 md:grid-cols-3 gap-12 text-center">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={`transition-opacity lg:h-50 flex flex-col gap-1 2xl:gap-2 duration-500 ${activeStep === index ? "opacity-100" : "opacity-50"}`}
                    >
                        <div
                            className={`flex items-center ${activeStep === index ? "border border-gray-400" : ""} justify-center md:mx-15 lg:mx-22 xl:mx-35 rounded-2xl bg-[#cbccc9] py-2 mb-2 rtl:lg:mx-24`}
                        >
                            <step.icon color="gray" className="w-4.5" />
                        </div>
                        <p className="font-bold text-gray-600 text-md mb-2">
                            {t(step.title)}
                        </p>
                        <p className="text-gray-600 text-[11px] lg:text-[15px]">
                            {t(step.desc)}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Features
