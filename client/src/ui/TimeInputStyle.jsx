import { Label } from "@heroui/react"

export default function TimeInputStyle() {
    return (
        <div className="w-[256px]">
            <Label className="mb-2">Heure</Label>
            <input
                type="time"
                className="input border border-slate-600 rounded-3xl"
            />
        </div>
    )
}
