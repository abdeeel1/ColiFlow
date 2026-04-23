import ColisCheckbox from "@/ui/components/ColisCheckbox";
import { Package, PackageOpen, PackageCheck, Truck } from "lucide-react";
import { useFormContext } from "react-hook-form";

const TravelFormThree = () => {
  const { setValue, watch, formState: { errors } } = useFormContext();

  const selectedPoids = watch("colisPoids");
  const selectedChoices = watch("colisAccept") || [];

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
  ];

  const choices = [
    "Documents & Plis",
    "Vêtements & Textile",
    "Électronique & High-tech",
    "Alimentaire (Non périssable)",
    "Objets fragiles",
    "Divers"
  ];

  const handleToggle = (value) => {
    const updated = selectedChoices.includes(value)
      ? selectedChoices.filter((v) => v !== value)
      : [...selectedChoices, value];

    setValue("colisAccept", updated, {
      shouldValidate: true,
      shouldDirty: true
    });
  };

  return (
    <div className="bg-white shadow-sm border border-slate-100 p-6 md:p-8 rounded-[2rem]">
      <div className="mb-5">
        <label className="block text-sm text-slate-700 font-bold">
          Sélection du poids
        </label>

        <ColisCheckbox
          value={selectedPoids}
          onSelect={(value) =>
            setValue("colisPoids", value, {
              shouldValidate: true,
              shouldDirty: true
            })
          }
          data={packages}
        />

        {errors.colisPoids && (
          <p className="text-red-600 text-sm mt-2">
            {errors.colisPoids.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm text-slate-700 font-bold mb-3">
          Type de colis accepté
        </label>

        <div className="flex flex-wrap gap-3 items-center">
          {choices.map((choice, index) => (
            <label
              key={index}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg cursor-pointer border transition-all ${
                selectedChoices.includes(choice)
                  ? "bg-[#0984E3] text-white border-[#0984E3]"
                  : "bg-base-200 border-transparent hover:border-[#0984E3]"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedChoices.includes(choice)}
                onChange={() => handleToggle(choice)}
                className="checkbox"
              />
              <span className="text-sm font-medium">{choice}</span>
            </label>
          ))}
        </div>

        {errors.colisAccept && (
          <p className="text-red-600 text-sm mt-2">
            {errors.colisAccept.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default TravelFormThree;