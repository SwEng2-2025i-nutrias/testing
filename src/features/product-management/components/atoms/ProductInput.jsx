import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function ProductInput({ 
  label, 
  id, 
  type = "text", 
  placeholder, 
  defaultValue,
  onChange,
  error
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input 
        id={id}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        onChange={onChange}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
