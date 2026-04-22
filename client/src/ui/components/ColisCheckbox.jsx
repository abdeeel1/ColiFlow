import { useState } from "react";
import { Package, PackageOpen, PackageCheck, Truck } from "lucide-react";



export default function ColisCheckbox({data}) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (id) => {
    setSelected(id);
    
  };

  return (
    <div className="w-full pt-5">

      

      {/* Radio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4  gap-8">
        {data.map(({ id, label, description, weight, icon: Icon, iconSize }) => {
          
          const isSelected = selected === id;

          return (
            <label
              key={id}
              htmlFor={id}
              className={[
                "relative flex flex-col items-start gap-3 p-4 rounded-xl border-2",
                "cursor-pointer select-none transition-all duration-150 group w-full",
                isSelected
                  ? "border-[#0984E3] bg-primary-light"
                  : "border-gray-200 bg-white hover:border-primary/40 hover:bg-primary-faint",
              ].join(" ")}
            >
              <input
                type="radio"
                id={id}
                name="package_size"
                value={id}
                checked={isSelected}
                onChange={() => handleSelect(id)}
                className="sr-only"
              />

              {/* Icon + radio indicator */}
              <div className="flex items-center justify-between w-full">
                <div
                  className={[
                    "p-2 rounded-lg transition-colors duration-150",
                    isSelected
                      ? "bg-[#0984E3] text-white"
                      : "bg-gray-100 text-gray-400 group-hover:bg-[#0984E3] group-hover:text-white",
                  ].join(" ")}
                >
                  <Icon size={iconSize} strokeWidth={1.6} />
                </div>

                {/* Custom radio dot */}
                <div
                  className={[
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    "shrink-0 transition-all duration-150",
                    isSelected
                      ? "border-[#0984E3] bg-[#0984E3]"
                      : "border-gray-300 bg-white group-hover:border-primary/50",
                  ].join(" ")}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>

              {/* Text */}
              <div className="flex flex-col gap-0.5">
                <span
                  className={[
                    "text-sm font-semibold tracking-tight",
                    isSelected ? "text-[#0984E3]" : "text-gray-800",
                  ].join(" ")}
                >
                  {label}
                </span>
                <span className="text-xs text-gray-500">{description}</span>
              </div>

              {/* Footer */}
              <div
                className={[
                  "w-full flex items-center justify-between pt-2 border-t transition-colors duration-150",
                  isSelected ? "border-[#0984E3]" : "border-gray-100",
                ].join(" ")}
              >
                <span
                  className={[
                    "text-xs font-medium",
                    isSelected ? "text-[#0984E3]" : "text-gray-500",
                  ].join(" ")}
                >
                  {weight}
                </span>
              </div>
            </label>
          );
        })}
      </div>

      
    </div>
  );
}