"use client"

import { Button, Modal } from "@heroui/react"
import { ArrowRight } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

export default function ModalSend({ text, travel }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Modal>
            <button
                className="font-bold flex items-center gap-1 w-40 cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(true)
                }}
            >
                {text} <ArrowRight size={18} />
            </button>

            <Modal.Backdrop variant="blur" isOpen={isOpen}>
                <Modal.Container>
                    <Modal.Dialog className="sm:max-w-90">
                        <Modal.CloseTrigger
                            onClick={() => setIsOpen(false)}
                            className="bg-[#0984E3]"
                        />
                        <Modal.Header>
                            <Modal.Heading>
                                Envoyer un colis - {travel.traveler}
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <form action="#" className="flex flex-col gap-4">
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-4">
                                        <select
                                            className="text-black rounded-2xl border py-2 px-4 appearance-none  cursor-pointer"
                                            name=""
                                            id=""
                                        >
                                            <option value="">
                                                Sélectionnez le Colis
                                            </option>
                                            <option value="">
                                                #CF101 → Laptop
                                            </option>
                                            <option value="">
                                                #CF102 → Mobile
                                            </option>
                                            <option value="">
                                                #CF103 → Chair
                                            </option>
                                        </select>
                                    </div>

                                    <div className="text-[#0F3DDE] font-semibold">
                                        <Link to={"/packages/create"}>
                                            + Créér un nouveu colis
                                        </Link>
                                    </div>
                                </div>

                                <hr className="my-2" />

                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label
                                            htmlFor=""
                                            className="text-gray-700 font-semibold"
                                        >
                                            Details
                                        </label>
                                        <div className="text-black p-4">
                                            <div className="flex justify-between items-center">
                                                <p className="flex flex-col w-20  items-center">
                                                    <span className="capitalize text-center font-semibold text-lg">
                                                        {travel.ville_depart}
                                                    </span>
                                                    <span className="text-gray-600">
                                                        Départ
                                                    </span>
                                                </p>

                                                <ArrowRight />

                                                <p className="flex flex-col w-20  items-center">
                                                    <span className="capitalize text-center font-semibold text-lg">
                                                        {travel.ville_darrive}
                                                    </span>
                                                    <span className="text-gray-600">
                                                        Arrivée
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="flex  flex-col gap-4 pt-3 text-black capitalize">
                                                <div className="flex gap-4">
                                                    <div className="bg-gray-100 capitalize rounded-[1rem] shadow p-3 w-full">
                                                        <p className="text-gray-600">
                                                            Date & Heure
                                                        </p>
                                                        <span className="font-semibold">
                                                            {travel.date}
                                                        </span>
                                                    </div>

                                                    <div className="bg-gray-100 capitalize rounded-[1rem] shadow p-3 w-full">
                                                        <p className="text-gray-600">
                                                            Véhicule
                                                        </p>
                                                        <span className="font-semibold">
                                                            {travel.type_veh}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4">
                                                    <div className="bg-gray-100 capitalize rounded-[1rem] shadow p-3 w-full">
                                                        <p className="text-gray-600">
                                                            Poids Max
                                                        </p>
                                                        <span className="font-semibold">
                                                            {travel.poids}
                                                        </span>
                                                    </div>

                                                    <div className="bg-gray-100 capitalize rounded-[1rem] shadow p-3 w-full">
                                                        <p className="text-gray-600">
                                                            Type de trajet
                                                        </p>
                                                        <span className="font-semibold">
                                                            {travel.date}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <hr className="mt-5" />

                                            <div className="flex justify-between items-center mt-5">
                                                <p className="text-gray-600">
                                                    Total à Payer
                                                </p>
                                                <span className="">
                                                    <span className="text-[1.5rem] font-bold text-[#374151]">
                                                        {travel.price}
                                                    </span>{" "}
                                                    MAD
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                className="w-full bg-[#0984E3] font-bold text-white"
                                onClick={() => setIsOpen(false)}
                            >
                                Confirmer la demande
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}
