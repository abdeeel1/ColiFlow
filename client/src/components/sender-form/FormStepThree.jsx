import { FileUploadDemo } from "@/ui/FileUploadDemo"
import { useFormContext } from "react-hook-form"

const FormStepThree = () => {
    const {
        register,
        setValue,
        watch,
        formState: { errors },
    } = useFormContext()

    const pictures = watch("pictures")

    return (
        <div className="bg-white shadow-sm border border-slate-100 p-6 md:p-8 rounded-[2rem]">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Zone d'upload (Laisser gérer par ton composant UI) */}
                <div className="w-full lg:w-1/2">
                    <label className="block text-sm text-slate-700 font-bold mb-4">
                        Photos du colis
                    </label>
                    <FileUploadDemo
                        header={"Ajoutez jusqu'à 3 photos de votre colis"}
                        description={
                            "les colis avec photos sont acceptés 2x plus vite"
                        }
                        value={pictures}
                        onChange={(files) =>
                            setValue("pictures", files, {
                                shouldValidate: true,
                                shouldDirty: true,
                            })
                        }
                    />
                    {errors.pictures && (
                        <p className="text-red-600 text-sm">
                            {errors.pictures.message}
                        </p>
                    )}
                </div>

                {/* Description */}
                <div className="w-full lg:w-1/2 flex flex-col gap-2">
                    <label className="text-sm text-slate-700 font-bold">
                        Description et consignes
                    </label>
                    <textarea
                        {...register("description")}
                        className="w-full h-full min-h-37.5 bg-slate-50 border border-slate-200 text-slate-800 text-[0.95rem] rounded-xl px-4 py-3 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all resize-none"
                        placeholder="Décrivez votre colis (Fragile, lourd, doit rester à plat...)"
                    ></textarea>
                </div>
                {errors.description && (
                    <p className="text-red-600 text-sm">
                        {errors.description.message}
                    </p>
                )}
            </div>
        </div>
    )
}

export default FormStepThree
