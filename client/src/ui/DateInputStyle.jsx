import {Label} from "@heroui/react";

export default function DateInputStyle() {
  return (
    <div className="w-[256px]">
      <Label className="mb-2">Date</Label>
      <input type="date" className="input border border-slate-600 rounded-3xl" />
    </div>
  );
}