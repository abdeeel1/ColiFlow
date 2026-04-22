import ColisCheckbox from "@/ui/components/ColisCheckbox";
import { ChevronDown, Package, PackageCheck, PackageCheckIcon, PackageOpen, Truck } from "lucide-react";
import { useState } from "react";

const TravelFormThree = () => {
    
    const [selected, setSelected] = useState(new Set())
    const toggle = (index) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(index) ? next.delete(index) : next.add(index);
            return next;
        })
    }
    
    const packages = [
    {
        id: "petite",
        label: "Petite",
        description: "Enveloppe ou petite boîte",
        weight: "Jusqu'à 1 kg",
        icon: Package,
        iconSize: 24,
        
    },
    {
        id: "moyen",
        label: "Moyen",
        description: "Boîte standard",
        weight: "1 – 5 kg",
        icon: PackageOpen,
        iconSize: 28,
        
    },
    {
        id: "grand",
        label: "Grand",
        description: "Grande boîte",
        weight: "5 – 15 kg",
        icon: PackageCheck,
        iconSize: 32,
        
    },
    {
        id: "volumineux",
        label: "Volumineux",
        description: "Colis encombrant",
        weight: "+ 15 kg",
        icon: Truck,
        iconSize: 34,
        
    },
    ];
    
    const choices = ["Documents & Plis", "Vêtements & Textile", "Électronique & High-tech", "Alimentaire (Non périssable)", "Objets fragiles", "Divers"]
    
    
    
    
    
    
    
    return ( 
        <div className="bg-white shadow-sm border border-slate-100 p-6 md:p-8 rounded-[2rem]">
            <form action="#">
                

                <div className="mb-5">
                    <label className="block text-sm text-slate-700 font-bold">Sélection du poids</label>
                    <ColisCheckbox data={packages} />
                </div>

                <div>

                    <div className="flex flex-wrap gap-3 items-center">
                       {choices.map((choice, index) => (
                        
                        <label
                            key={index}
                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg cursor-pointer border transition-all
                            ${selected.has(index)
                                ? "bg-[#0984E3] text-[#0984E3]-content border-[#0984E3]"
                                : "bg-base-200 border-transparent hover:border-[#0984E3]"
                            }`}
                        >
                            <input
                            type="checkbox"
                            className="checkbox"
                            checked={selected.has(index)}
                            onChange={() => toggle(index)}
                            />
                            <span className="text-sm font-medium">{choice}</span>
                        </label>
                        ))}
                    </div>

                </div>
            </form>
        </div>
    );
}
 
export default TravelFormThree;