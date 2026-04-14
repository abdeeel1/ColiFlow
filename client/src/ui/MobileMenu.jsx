import {Button, Dropdown, Label} from "@heroui/react";
import { Menu } from "lucide-react";

export default function MobileMenu({isTraveler}) {
  return (
    <>
    
    {
        !isTraveler
        ?
        <Dropdown>
                <Button aria-label="Menu" variant="">
                    <Menu color="gray" />
                </Button>
            <Dropdown.Popover>
                <Dropdown.Menu>

                    <Dropdown.SubmenuTrigger>
                        <Dropdown.Item >
                            <Label className="font-plusjakarta">Envoyer un colis</Label>
                    <Dropdown.SubmenuIndicator />
                        </Dropdown.Item>
                    <Dropdown.Popover>
                        <Dropdown.Menu>
                            <Dropdown.Item >
                                <Label className="font-plusjakarta">Nouveau colis</Label>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Label className="font-plusjakarta">Liste des colis</Label>
                            </Dropdown.Item>
                            <Dropdown.Item >
                                <Label className="font-plusjakarta">Dashboard</Label>
                            </Dropdown.Item>
                    
                </Dropdown.Menu>
            </Dropdown.Popover>
                    </Dropdown.SubmenuTrigger>

                    <Dropdown.Item>
                        <Label className="font-plusjakarta">Mes Colis</Label>
                    </Dropdown.Item>
                    <Dropdown.Item >
                        <Label className="font-plusjakarta">FAQ</Label>
                    </Dropdown.Item>
                    <Dropdown.Item className="hover:bg-transparent">
                        <div className="flex flex-col gap-3">
                            <hr className="text-[#2D3436] " />
                            <button className="btn bg-[#0984E3] font-bold text-white rounded-2xl">
                                Se connecter
                            </button>
                        </div>
                    </Dropdown.Item>
                    </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    :
        <Dropdown>
                <Button aria-label="Menu" variant="">
                    <Menu color="gray" />
                </Button>
            <Dropdown.Popover>
                <Dropdown.Menu>

                    <Dropdown.SubmenuTrigger>
                        <Dropdown.Item >
                            <Label className="font-plusjakarta">Publier un travel</Label>
                    <Dropdown.SubmenuIndicator />
                        </Dropdown.Item>
                    <Dropdown.Popover>
                        <Dropdown.Menu>
                            <Dropdown.Item >
                                <Label className="font-plusjakarta">Nouveau travel</Label>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <Label className="font-plusjakarta">Demandes de Réservation</Label>
                            </Dropdown.Item>
                            <Dropdown.Item >
                                <Label className="font-plusjakarta">Dashboard</Label>
                            </Dropdown.Item>
                    
                </Dropdown.Menu>
            </Dropdown.Popover>
                    </Dropdown.SubmenuTrigger>

                    <Dropdown.Item>
                        <Label className="font-plusjakarta">Mes Travel</Label>
                    </Dropdown.Item>
                    <Dropdown.Item >
                        <Label className="font-plusjakarta">FAQ</Label>
                    </Dropdown.Item>
                    <Dropdown.Item className="hover:bg-transparent">
                        <div className="flex flex-col gap-3">
                            <hr className="text-[#2D3436] " />
                            <button className="btn bg-[#0984E3] font-bold text-white rounded-2xl font-plusjakarta">
                                Se connecter
                            </button>
                        </div>
                    </Dropdown.Item>
                    </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    
    }
    
    </>
  );
}