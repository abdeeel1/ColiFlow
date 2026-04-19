import { MapContainer, Marker, Popup, TileLayer, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BadgeCheck, Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { a } from "motion/react-client";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const TravelsList = () => {
  const travelsAnnouncement = [
    { id: 1, verified: true, package:"petite", traveler: "Najib Abdessamad", ville_depart: "fez", ville_darrive: "rabat", date: "demain 9:00", type_veh: "voiture", poids: 10, direct: true, lat: 34.0331, lng: -5.0003 , price: 75, rating: 5, review: 120},
    { id: 2, verified: true, package:"grand", traveler: "Salaheddine Alaoui", ville_depart: "rabat", ville_darrive: "casablanca", date: "lundi 11:00", type_veh: "camionnette", poids: 25, direct: false, lat: 34.0209, lng: -6.8416, price: 80, rating: 4, review: 100},
    { id: 3, verified: false, package:"volumineux", traveler: "Meriem Fadil", ville_depart: "oujda", ville_darrive: "marrakech", date: "mardi 8:00", type_veh: "petit camion", poids: 40, direct: true, lat: 34.6814, lng: -1.9086, price: 110, rating: 3 , review: 10},
    { id: 4, verified: true, package:"volumineux", traveler: "Aymane Morid", ville_depart: "laayoune", ville_darrive: "tanger", date: "mercredi 8:00", type_veh: "voiture", poids: 40, direct: true, lat: 26.85, lng: -12.9086, price: 150, rating: 4, review: 80},
    { id: 5, verified: true, package:"petite", traveler: "Khalid Borid", ville_depart: "laayoune", ville_darrive: "casablanca", date: "mercredi 8:00", type_veh: "voiture", poids: 10, direct: true, lat: 26.85, lng: -12.9086, price: 140, rating: 4, review: 90},
  ];

  const [filterdCards, setFilterdCards] = useState(travelsAnnouncement);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  const [visibleCards, setVisibleCards] = useState([]);
  const loaderRef = useRef(null);
  const [savedTravel, setSavedTravel] = useState([])


  
  // ✅ Map filter
  const MapBoundsFilter = () => {
    useMapEvent("moveend", (e) => {
      const bounds = e.target.getBounds();

      const visible = travelsAnnouncement.filter((travel) =>
        bounds.contains([travel.lat, travel.lng])
      );

      setFilterdCards(visible);
      setPage(1);
    });
    
    return null;
  };

  // ✅ Pagination
  useEffect(() => {
    const nextItems = filterdCards.slice(0, page * ITEMS_PER_PAGE);

    if (nextItems.length === visibleCards.length) return;

    setVisibleCards(nextItems);
}, [page, filterdCards]);

  // ✅ Infinite scroll observer (improved)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          visibleCards.length < filterdCards.length
        ) {
            setPage((prev) => prev + 1);
        }
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
    }
);

if (loaderRef.current) observer.observe(loaderRef.current);

return () => observer.disconnect();
  }, [visibleCards, filterdCards]);
  
  // ✅ Auto-load if no scroll
  useEffect(() => {
    const container = loaderRef.current?.parentElement;
    
    if (!container) return;

    if (
      container.scrollHeight <= container.clientHeight &&
      visibleCards.length < filterdCards.length
    ) {
        setPage((prev) => prev + 1);
    }
  }, [visibleCards, filterdCards]);


  const saveToggle = (id) => {
    setSavedTravel((prev) => prev.includes(id) 
    ? prev.filter(item => item !== id)
    : [...prev, id]
    
    )}

 


  return (
    <main>
      <div className="hidden lg:flex w-full gap-2 h-screen">

        {/* LEFT: CARDS */}
        <div className="w-full flex flex-col gap-4 overflow-y-auto h-full">
          <h3 className="font-semibold text-lg">
            Voyages disponibles {filterdCards.length}
          </h3>
          <hr className="bg-gray-400 my-4" />

          {filterdCards.length > 0 ? (
            <>
              {visibleCards.map((travel) => (
                <div key={travel.id} className="bg-white rounded-2xl mb-4 p-8 mx-10">
                  <div className="flex justify-between items-center">
                    <div>
                        <p className="flex items-center gap-2">
                            {travel.traveler}
                            {travel.verified && (
                            <BadgeCheck className="text-[#0095F6] size-5" fill="#0095F6" color="white" />
                            )}
                        </p>
                    </div>

                    <div>
                        <button className="cursor-pointer" onClick={()=>saveToggle(travel.id)}><Heart stroke="#838383" fill={savedTravel.includes(travel.id) ? '#FFA2A3' : "#FFF"} /></button>
                    </div>
                  </div>

                  <h4 className="flex py-1 text-[1.4rem] items-center capitalize gap-1">
                    {travel.ville_depart} <ArrowRight /> {travel.ville_darrive}
                  </h4>

                  <div className="flex gap-4 items-center py-5 capitalize">
                    <p>{travel.date}</p>
                    <p>{travel.type_veh}</p>
                    <p>{travel.poids}kg max</p>
                    <p>{travel.direct ? "Trajet direct" : "Trajet indirect"}</p>
                  </div>

                  <Link
                    to={`/colis/send/${travel.id}`}
                    className="text-[#0984E3] font-bold flex items-center gap-1"
                  >
                    Envoyer un colis <ArrowRight size={18} />
                  </Link>

                  <div className="mt-10 justify-between flex items-center">
                    
                    <div className="flex wfy  gap-1 items-center">
                        {[...Array(5)].map(((star, i) => (
                            <Star 
                            key={i} 
                            className={i < travel.rating ? "fill-yellow-400 stroke-yellow-500" : "text-gray-300"}
                             />
                        )))}

                        <span className="text-[0.8rem]">({travel.review} Review)</span>
                    </div>

                    <div>
                        <p className="capitalize text-[1.3rem] font-bold text-[#374151]">{travel.price} MAD <span className="text-[0.8rem] text-gray-400 font-normal">/ {travel.package} colis</span></p>
                    </div>
                  </div>
                </div>
              ))}

              {/* ✅ loader */}
              {visibleCards.length < filterdCards.length && (
                <div ref={loaderRef} className="text-center py-4">
                  Loading...
                </div>
              )}
            </>
          ) : (
            <p className="font-bold text-center">
              Aucun voyage trouvé dans cette zone. Essayez de dézoomer !
            </p>
          )}
        </div>

        {/* RIGHT: MAP */}
        <div className="w-full z-40">
          <MapContainer
            center={[31.7917, -7.0926]}
            zoom={6}
            zoomControl={false}
            className="w-full h-full"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapBoundsFilter />

            {travelsAnnouncement.map((travel) => (
              <Marker key={travel.id} position={[travel.lat, travel.lng]}>
                <Popup>
                  <strong>{travel.traveler}</strong>
                  <br />
                  De : {travel.ville_depart} à {travel.ville_darrive}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </main>
  );
};

export default TravelsList;