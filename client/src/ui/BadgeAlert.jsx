import { Chip } from "@heroui/react"
import { CircleAlertIcon } from "lucide-react"

export default function BadgeAlert() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
                <Chip>
                    <CircleAlertIcon width={12} />
                    <Chip.Label className="text-[10px]">New Feature</Chip.Label>
                </Chip>
            </div>
        </div>
    )
}
