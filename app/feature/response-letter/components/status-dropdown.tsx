import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface StatusDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function StatusDropdown({
  value,
  onChange,
  disabled = false,
}: StatusDropdownProps) {
  return (
    <div className="mb-6 space-y-2">
      <Label>Pilih Status</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full" disabled={disabled}>
          <SelectValue placeholder="-- Pilih Status --" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="disetujui">Disetujui</SelectItem>
          <SelectItem value="ditolak">Ditolak</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default StatusDropdown;
