export default function ColisCheckbox({ data, value, onSelect }) {

  const handleSelect = (id) => {
    onSelect?.(id)
  };

  return (
    <div className="w-full pt-5">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {data.map(({ id, label, description, weight, icon: Icon, iconSize }) => {

          const isSelected = value === id;

          return (
            <label
              key={id}
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
                value={id}
                checked={isSelected}
                onChange={() => handleSelect(id)}
                className="sr-only"
              />

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

                <div
                  className={[
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    isSelected
                      ? "border-[#0984E3] bg-[#0984E3]"
                      : "border-gray-300 bg-white",
                  ].join(" ")}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className={isSelected ? "text-[#0984E3]" : "text-gray-800"}>
                  {label}
                </span>
                <span className="text-xs text-gray-500">{description}</span>
              </div>

              <div className="w-full flex justify-between pt-2 border-t">
                <span className={isSelected ? "text-[#0984E3]" : "text-gray-500"}>
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