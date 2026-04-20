import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SelectFilter() {
  return (
    <Select>
      <SelectTrigger className="w-full max-w-48 bg-white rounded-2xl py-[1.19rem] border-0 font-bold flex items-center">
        <SelectValue placeholder="Type de véhicle" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          
          <SelectItem value="tous">Tous</SelectItem>
          <SelectItem value="voiture">Voiture</SelectItem>
          <SelectItem value="moto">Moto</SelectItem>
          <SelectItem value="camionnette">Camionnette</SelectItem>
          <SelectItem value="petitCamion">Petit Camion</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
