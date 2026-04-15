import { useState } from "react";
import { MapPin, Calendar, Package, Search } from "lucide-react";

const Divider = () => (
  <div className="hidden lg:block w-px self-stretch bg-gray-200 my-2" />
);

const SearchTravel = () => {
  const [depart, setDepart] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");

  return (
    <div className="mt-10 bg-gray-100 flex items-center justify-center px-3">

      {/* Mobile & md: stacked card */}
      <div className="flex flex-col lg:hidden bg-white rounded-2xl border border-gray-200 w-full max-w-md overflow-hidden">
        
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <MapPin size={14} className="text-gray-400 shrink-0" />
          <div className="flex flex-col w-full">
            <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">Départ</span>
            <input type="text" value={depart} onChange={e => setDepart(e.target.value)} placeholder="Ville de départ"
              className="border-none outline-none bg-transparent text-sm text-gray-800 placeholder-gray-300" />
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <MapPin size={14} className="text-gray-400 shrink-0" />
          <div className="flex flex-col w-full">
            <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">Destination</span>
            <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Ville d'arrivée"
              className="border-none outline-none bg-transparent text-sm text-gray-800 placeholder-gray-300" />
          </div>
        </div>

        <div className="flex gap-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-r border-gray-100 flex-1">
            <Calendar size={14} className="text-gray-400 shrink-0" />
            <div className="flex flex-col w-full">
              <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">Date</span>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="border-none outline-none bg-transparent text-sm text-gray-800 w-full" />
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-1">
            <Package size={14} className="text-gray-400 shrink-0" />
            <div className="flex flex-col w-full">
              <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">Type de colis</span>
              <input type="text" value={type} onChange={e => setType(e.target.value)} placeholder="Fragile, alimentaire..."
                className="border-none outline-none bg-transparent text-sm text-gray-800 placeholder-gray-300 w-full" />
            </div>
          </div>
        </div>

        <div className="p-3">
          <button className="w-full bg-[#0984E3] hover:bg-[#0984E3] active:scale-95 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">
            Trouver un trajet
          </button>
        </div>
      </div>

      {/* lg+: single pill row */}
      <div className="hidden lg:flex items-center bg-white rounded-full border border-gray-200 px-2 py-1.5 gap-1 w-full max-w-3xl xl:max-w-4xl">

        <div className="flex items-center gap-2 px-3 xl:px-4 flex-1 min-w-0">
          <MapPin size={14} className="text-gray-400 shrink-0" />
          <div className="flex flex-col min-w-0 w-full">
            <span className="text-[9px] xl:text-[10px] font-semibold uppercase tracking-wide text-gray-400">Départ</span>
            <input type="text" value={depart} onChange={e => setDepart(e.target.value)} placeholder="Ville de départ"
              className="border-none outline-none bg-transparent text-xs xl:text-sm text-gray-800 placeholder-gray-300 py-0.5 w-full" />
          </div>
        </div>

        <Divider />

        <div className="flex items-center gap-2 px-3 xl:px-4 flex-1 min-w-0">
          <MapPin size={14} className="text-gray-400 shrink-0" />
          <div className="flex flex-col min-w-0 w-full">
            <span className="text-[9px] xl:text-[10px] font-semibold uppercase tracking-wide text-gray-400">Destination</span>
            <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Ville d'arrivée"
              className="border-none outline-none bg-transparent text-xs xl:text-sm text-gray-800 placeholder-gray-300 py-0.5 w-full" />
          </div>
        </div>

        <Divider />

        <div className="flex items-center gap-2 px-3 xl:px-4" style={{ flex: "0.8" }}>
          <Calendar size={14} className="text-gray-400 shrink-0" />
          <div className="flex flex-col min-w-0 w-full">
            <span className="text-[9px] xl:text-[10px] font-semibold uppercase tracking-wide text-gray-400">Date</span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="border-none outline-none bg-transparent text-xs xl:text-sm text-gray-800 py-0.5 w-full" />
          </div>
        </div>

        <Divider />

        <div className="flex items-center gap-2 px-3 xl:px-4" style={{ flex: "0.9" }}>
          <Package size={14} className="text-gray-400 shrink-0" />
          <div className="flex flex-col min-w-0 w-full">
            <span className="text-[9px] xl:text-[10px] font-semibold uppercase tracking-wide text-gray-400">Type de colis</span>
            <input type="text" value={type} onChange={e => setType(e.target.value)} placeholder="Fragile, alimentaire..."
              className="border-none outline-none bg-transparent text-xs xl:text-sm text-gray-800 placeholder-gray-300 py-0.5 w-full" />
          </div>
        </div>

        <button className="bg-[#0984E3] hover:bg-[#085fa1] active:scale-95 text-white text-xs xl:text-sm font-semibold px-4 xl:px-5 py-2 xl:py-2.5 rounded-full shrink-0 transition-all">
            <Search />
        </button>

      </div>
    </div>
  );
}

export default SearchTravel;