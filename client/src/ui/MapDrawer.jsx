import {Button, Drawer} from "@heroui/react";
import { ListFilter, Map, Star } from "lucide-react";
import CheckboxGroupSelect from "./CheckboxGroupSelect";
import TimeInput from "./TimeInputStyle";
import TimeInputStyle from "./TimeInputStyle";
import DateInputStyle from "./DateInputStyle";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

export default function MapDrawer({travelsAnnouncement, MapBoundsFilter}) {
  return (
    <Drawer>
      <Button className="font-bold flex items-center gap-2 text-[#757575]"><Map /></Button>
      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            
            <Drawer.Body className="text-black py-5">
                <MapContainer
                            center={[31.7917, -7.0926]}
                            zoom={4}
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
            </Drawer.Body>
            
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}