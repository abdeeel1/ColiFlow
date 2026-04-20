import {Button, Drawer} from "@heroui/react";
import { ListFilter, Star } from "lucide-react";
import CheckboxGroupSelect from "./CheckboxGroupSelect";
import TimeInput from "./TimeInputStyle";
import TimeInputStyle from "./TimeInputStyle";
import DateInputStyle from "./DateInputStyle";
import CheckedInput from "./CheckedInput";

export default function DrawerRight() {
  return (
    <Drawer>
      <Button className="bg-white font-bold flex items-center gap-2 text-[#757575]">Filter <ListFilter className="size-[0.8rem]"/></Button>
      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            
            <Drawer.Body className="text-black py-5">
                <div>
                    <div className="flex flex-col gap-4 pb-10">
                        <p className="text-[0.8rem] lg:text-[1.2rem] font-semibold">Taille du Colis</p>
                        <div>
                            <CheckboxGroupSelect />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 pb-10">
                        <p className="text-[0.8rem] lg:text-[1.2rem] font-semibold">Date et Heure</p>
                        <div className="flex flex-col gap-4">
                            <TimeInputStyle />

                            <DateInputStyle />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pb-10">
                        <p className="text-[0.8rem] lg:text-[1.2rem] font-semibold">Note du voyageur</p>
  
                        <div className="flex flex-col gap-2">
                            {[5, 4, 3, 2].map((star) => (
                            <label key={star} className="flex items-center gap-3 cursor-pointer group">
                                <CheckedInput />
                                <div className="flex items-center gap-1">
                                
                                {[...Array(star)].map((_, i) => (
                                    <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                                ))}
                                {[...Array(5 - star)].map((_, i) => (
                                    <Star key={i} size={16} className="text-gray-300" />
                                ))}
                                
                                </div>
                            </label>
                            ))}
                        </div>
                    </div>

                    
                </div>
            </Drawer.Body>
            <Drawer.Footer>
              <Button slot="close" variant="ghost" className="bg-gray-400 text-white font-bold">
                Annuler
              </Button>
              <Button slot="close" variant="ghost" className="bg-[#0984E3] text-white font-bold">Sauvegarder</Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}