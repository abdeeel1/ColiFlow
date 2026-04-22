
import { CalendarDays, MapPin } from "lucide-react";

const tripSummary = {
  departure: { label: "LIEU DE DÉPART", city: "Casablanca" },
  arrival: { label: "LIEU D'ARRIVÉE", city: "Rabat" },
  details: [
    { label: "Date de départ", value: "Lundi, 21:00" },
    { label: "Type de véhicule", value: "Moto" },
    { label: "Poids maximum", value: "-1 kg" },
  ],
};

const TravelerFormLast = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Left — Résumé du trajet */}
      <div className="bg-white shadow-sm border border-slate-100 p-6 rounded-[2rem]">
        <h2 className="text-lg font-bold text-[#0984E3]">Résumé du trajet</h2>
        <p className="text-xs text-slate-400 mb-6">Vérifiez vos informations</p>

        {/* Route */}
        <div className="flex flex-col gap-1 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#0984E3] text-white flex items-center justify-center text-xs font-bold shrink-0"><MapPin size={14} /></span>
            <div>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest">{tripSummary.departure.label}</p>
              <p className="font-bold text-slate-800">{tripSummary.departure.city}</p>
            </div>
          </div>

          <div className="ml-4 w-px h-6 bg-slate-200" />

          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold shrink-0"><MapPin size={14} /></span>
            <div>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest">{tripSummary.arrival.label}</p>
              <p className="font-bold text-slate-800">{tripSummary.arrival.city}</p>
            </div>
          </div>
        </div>

        <hr className="border-slate-100 mb-4" />

        {/* Details */}
        <div className="flex flex-col gap-3">
          {tripSummary.details.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
              
              <div>
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="text-sm font-semibold text-[#0984E3]">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Prix */}
      <div className="bg-white h-95 shadow-sm border border-slate-100 p-6 rounded-[2rem] flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Prix</h2>
          <p className="text-xs text-slate-400">Fixez votre tarif</p>
        </div>

        {/* Input */}
        <div className="relative">
          <input
            placeholder="Ex: 100"
            type="number"
            className="w-full bg-white border-2 border-[#0984E3] text-slate-800 text-lg font-semibold rounded-xl px-4 py-3 pr-16 focus:outline-none focus:ring-4 focus:ring-[#0984E3]/10 transition-all"
          />
          <span className="absolute right-4 top-[50%] -translate-y-[50%] font-bold text-slate-400">
            MAD
          </span>
        </div>

        {/* Earnings breakdown */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col gap-2">
          <p className="text-sm font-bold text-green-800 mb-1">Détail des gains</p>
          <div className="flex justify-between text-sm text-green-700">
            <span>Prix du trajet</span>
            <span className="font-bold">100 MAD</span>
          </div>
          <div className="flex justify-between text-sm text-green-700">
            <span>Frais de service (15%)</span>
            <span className="font-bold">-15 MAD</span>
          </div>
          <hr className="border-green-200 my-1" />
          <div className="flex justify-between text-base font-extrabold text-green-800">
            <span>Vous Gagnez</span>
            <span>85 MAD</span>
          </div>
        </div>

          

      </div>
    </div>
  );
};

export default TravelerFormLast;