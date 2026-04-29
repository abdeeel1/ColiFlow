"use client"

import { Button, Dropdown, Label } from "@heroui/react"
import { ArrowDown } from "lucide-react"
import { RangeSlider } from "./RangeSlider"
import { useState } from "react"

export default function DropdownFilter({ onBudgetChange }) {
    const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 })

    const handlePriceChange = (values) => {
        setPriceRange(values)
        if (onBudgetChange) {
            onBudgetChange(values)
        }
    }

    return (
        <Dropdown>
            <Button
                aria-label="Menu"
                className="bg-white font-bold text-green-800"
                variant="ghost"
            >
                Budget: {priceRange.min} - {priceRange.max} MAD
            </Button>
            <Dropdown.Popover className="py-2">
                <RangeSlider
                    minPrice={priceRange.min}
                    maxPrice={priceRange.max}
                    onChange={handlePriceChange}
                />
            </Dropdown.Popover>
        </Dropdown>
    )
}
