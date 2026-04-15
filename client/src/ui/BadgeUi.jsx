import {Chip} from "@heroui/react";
import { CircleSmall } from "lucide-react";

export default function BadgeUi({text}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Chip className="bg-[#1976D2] text-white font-bold">
          <CircleSmall size={12} fill="#FFFFFF" />
          <Chip.Label className="capitalize">{text}</Chip.Label>
        </Chip>
      </div>

     
    </div>
  );
}