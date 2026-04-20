"use client";


import {Button, Modal} from "@heroui/react";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export default function ModalSend( {text, travel} ) {

    const [isOpen, setIsOpen] = useState(false)
    
    return (
        <Modal>
        
        <button
        className="text-[#0984E3] font-bold flex items-center gap-1 w-40 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        >
            {text} <ArrowRight size={18} />
        </button>

        <Modal.Backdrop variant="blur" isOpen={isOpen} >
            <Modal.Container>
            <Modal.Dialog className="sm:max-w-90">
                <Modal.CloseTrigger onClick={() => setIsOpen(false)} className="bg-[#0984E3]" />
                <Modal.Header>
                    <Modal.Heading>Envoyer un colis - {travel.traveler}</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                <form action="#" className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4">
                        <label htmlFor="" className="text-gray-700 font-semibold">Sélectionnez le Colis</label>
                        <select className="text-black rounded-2xl border py-2 px-4 appearance-none  cursor-pointer" name="" id="">
                            <option value="">#CF101 → Laptop</option>
                            <option value="">#CF102 → Mobile</option>
                            <option value="">#CF103 → Chair</option>
                        </select>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="" className="text-gray-700 font-semibold">Details</label>
                            <div className="text-black p-4">
                                <p className="flex gap-2 items-center">
                                    {travel.ville_depart} <ArrowRight size={14} /> {travel.ville_darrive}
                                </p>
                                <div className="flex flex-col gap-4 pt-3 text-black capitalize">
                                    <p>{travel.date}</p>
                                    <p>{travel.type_veh}</p>
                                    <p>{travel.poids}kg max</p>
                                    <p>{travel.direct ? "Trajet direct" : "Trajet indirect"}</p>
                                    <p><span className="capitalize text-[1.3rem] font-bold text-[#374151]">{travel.price}</span> MAD</p>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </form>
                </Modal.Body>
                <Modal.Footer>
                <Button className="w-full bg-[#0984E3] font-bold text-white" onClick={() => setIsOpen(false)}>
                    Confirmer la demande
                </Button>
                </Modal.Footer>
            </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
        </Modal>
    );
}