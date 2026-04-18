import { MapContainer, Marker, Popup, TileLayer, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css"

import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useState } from "react";
import { div, p } from "motion/react-m";
import { ArrowRight, BadgeCheck, Circle, Verified } from "lucide-react";
import { Link } from "react-router-dom";

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const TravelsList = () => {
    
    const travelsAnnouncement = [
    
    { id: 1, verified: true, package: "petite", traveler: "Najib Abdessamad", ville_depart: "fez", ville_darrive: "rabat", date: "demain 9:00", type_veh: "voiture", poids: 10, direct: true, lat: 34.0331, lng: -5.0003 },
    {id: 2, verified: true, package: "grand", traveler: "Salaheddine Alaoui", ville_depart: "rabat", ville_darrive: "casablanca", date: "lundi 11:00", type_veh: "camionnette", poids: 40, direct: false, lat: 34.0209, lng: -6.8416 },
    {id: 3, verified: false, package: "volumineux", traveler: "Meriem Fadil", ville_depart: "oujda", ville_darrive: "marrakech", date: "mardi 8:00", type_veh: "petit camion", poids: 25, direct: true, lat: 34.6814, lng: -1.9086 },
    
    ];

    const [filterdCards, setFilterdCards] = useState(travelsAnnouncement)

    const MapBoundsFilter = () => {
        const map = useMapEvent({
            moveend: () => {
                const bounds = map.getBounds()
                const visible = travelsAnnouncement.filter(travel=>
                    bounds.contains([travel.lat, travel.lng])
                )
                setFilterdCards(visible)
            },
        })
        return null
    }
    

    
    
    
    return ( 
        <main>

                
            

                <div className="flex w-full gap-2">
                    
                    <div className="w-full flex flex-col gap-4">
                        <h3 className="font-semibold text-lg">Voyages disponibles {filterdCards.length}</h3>
                        <hr className="bg-gray-400 my-4"/>

                        {filterdCards.length > 0 ? (
                            filterdCards.map(travel=>(
                                <div key={travel.id} className="bg-white rounded-2xl mb-4 p-8 mx-10">
                                    <p className="flex items-center gap-2">{travel.traveler} <span>{travel.verified && <BadgeCheck className="text-[#0095F6] size-5" fill="#0095F6" color="white" />}</span></p>
                                    <h4 className="flex py-1 text-[1.4rem] items-center capitalize gap-1">{travel.ville_depart} <ArrowRight /> {travel.ville_darrive}</h4>

                                    <div className="flex gap-4 items-center py-5 capitalize">
                                        <p className="flex gap-1 items-center">{travel.date}</p>
                                        <p className="flex gap-1 items-center">{travel.type_veh}</p>
                                        <p className="flex gap-1 items-center">{travel.poids}kg max</p>
                                        <p className="flex gap-1 items-center">{travel.direct ? "Trajet direct" : "Trajet indirect"}</p>
                                    </div>

                                    <div>
                                        <Link to={"/colis/send/{colis}"} className="text-[#0984E3] font-bold">Envoyer un colis</Link>
                                    </div>
                                </div>
                            ))
                        ) :
                        
                        (
                            <p className="font-bold text-center">Aucun voyage trouvé dans cette zone. Essayez de dézoomer !</p>
                        )

                        }
                    </div>

                    <div className="w-full z-40">
                        <MapContainer 
                        center={[31.7917, -7.0926]} 
                        zoom={6}
                        zoomControl={false} 
                        className="w-full h-180">
                            <TileLayer 
                            attribution="&copy; OpenStreetMap contributors" 
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                            />
                            
                            <MapBoundsFilter />

                            {
                                travelsAnnouncement.map(travel=>(
                                    <Marker key={travel.id} position={[travel.lat, travel.lng]}>
                                        <Popup>
                                            <strong className="block">{travel.traveler}</strong>
                                            De : {travel.ville_depart} à {travel.ville_darrive}
                                        </Popup>
                                    </Marker>
                                ))
                            }

                        </MapContainer>
                    </div>
                </div>

            






        </main>
     );
}
 
export default TravelsList;