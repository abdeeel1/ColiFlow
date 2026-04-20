import {Chip} from "@heroui/react";
import { CircleCheck } from "lucide-react";

export default function TagChip({text}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      
      <Chip className="text-white font-bold bg-[#50CC98]">
        <CircleCheck width={14} />
        <Chip.Label className="uppercase">{text}</Chip.Label>
      </Chip>
      
    </div>
  );
}