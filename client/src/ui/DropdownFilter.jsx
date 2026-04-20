"use client";

import {Button, Dropdown, Label} from "@heroui/react";
import { ArrowDown } from "lucide-react";
import { RangeSlider } from "./RangeSlider";

export default function DropdownFilter() {
  return (
    <Dropdown>
      <Button aria-label="Menu" className="bg-white font-bold text-green-800" variant='ghost'>
        Budget
      </Button>
      <Dropdown.Popover className="py-2">
          <RangeSlider />
      </Dropdown.Popover>
    </Dropdown>

  );
}