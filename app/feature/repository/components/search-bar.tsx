import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import type { SearchBarProps } from "../types";

export function SearchBar({ value, onChange, placeholder = "Cari laporan KP..." }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-4 py-2 w-full"
      />
    </div>
  );
}
