"use client"

import { Checkbox, CheckboxGroup, Label } from "@heroui/react"
import { CheckboxInput } from "@/components/ui/checkbox"

export default function CheckboxGroupSelect() {
    return (
        <div className="flex gap-10 items-center py-5">
            <div className="flex flex-col lg:flex-row gap-4 justify-center">
                <div className="flex items-center gap-2">
                    <CheckboxInput />
                    <p>Petite</p>
                </div>
                <div className="flex items-center gap-2">
                    <CheckboxInput />
                    <p>Moyen</p>
                </div>
                <div className="flex items-center gap-2">
                    <CheckboxInput />
                    <p>Grand</p>
                </div>
                <div className="flex items-center gap-2">
                    <CheckboxInput />
                    <p>Volumineux</p>
                </div>
            </div>
        </div>
    )
}
