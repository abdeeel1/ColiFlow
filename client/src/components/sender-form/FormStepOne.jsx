import ColisCheckbox from "@/ui/components/ColisCheckbox"
import {
    ChevronDown,
    Package,
    PackageCheck,
    PackageOpen,
    Truck,
} from "lucide-react"
import { useFormContext } from "react-hook-form"

const FormStepOne = () => {
    const packages = [
        {
            id: 1,
            label: "Petite",
            description: "Enveloppe ou petite boîte",
            weight: "Jusqu'à 1 kg",
            icon: Package,
            iconSize: 24,
        },
        {
            id: 2,
            label: "Moyen",
            description: "Boîte standard",
            weight: "1 – 5 kg",
            icon: PackageOpen,
            iconSize: 28,
        },
        {
            id: 3,
            label: "Grand",
            description: "Grande boîte",
            weight: "5 – 15 kg",
            icon: PackageCheck,
            iconSize: 32,
        },
        {
            id: 4,
            label: "Volumineux",
            description: "Colis encombrant",
            weight: "+ 15 kg",
            icon: Truck,
            iconSize: 34,
        },
    ]

    const {
        register,
        setValue,
        watch,
        formState: { errors },
    } = useFormContext()

    const selected = watch("colisSize")

    return (
        <div className="bg-white shadow-sm border border-slate-100 p-6 md:p-8 rounded-[2rem]">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Input Objet */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-sm text-slate-700 font-bold">
                        Que souhaitez-vous envoyer ?
                    </label>
                    <input
                        {...register("colisName")}
                        placeholder="Ex: Ordinateur, Sac de vêtements..."
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[0.95rem] rounded-xl px-4 py-3 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all"
                    />
                    {errors.colisName && (
                        <p className="text-red-600 text-sm">
                            {errors.colisName.message}
                        </p>
                    )}
                </div>

                {/* Select Catégorie */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-sm text-slate-700 font-bold">
                        Catégorie
                    </label>
                    <div className="relative w-full">
                        <select
                            {...register("category")}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[0.95rem] rounded-xl appearance-none px-4 py-3 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0984E3] focus:ring-4 focus:ring-[#0984E3]/10 transition-all cursor-pointer"
                        >
                            <option value="">Choisissez une catégorie</option>
                            <option value="electronique">
                                Électronique & High-Tech
                            </option>
                            <option value="documents">
                                Documents & Papier
                            </option>
                            <option value="mode">Mode & Accessoires</option>
                            <option value="maison">Maison & Déco</option>
                            <option value="autre">Autre</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                            <ChevronDown className="size-5" />
                        </div>
                    </div>
                    {errors.category && (
                        <p className="text-red-600 text-sm">
                            {errors.category.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <label className="block text-sm text-slate-700 font-bold mb-4">
                    Taille du colis
                </label>
                <ColisCheckbox
                    value={selected}
                    onSelect={(value) =>
                        setValue("colisSize", value, {
                            shouldValidate: true,
                            shouldDirty: true,
                        })
                    }
                    data={packages}
                />
            </div>
            {errors.colisSize && (
                <p className="text-red-600 text-sm">
                    {errors.colisSize.message}
                </p>
            )}
        </div>
    )
}

export default FormStepOne
