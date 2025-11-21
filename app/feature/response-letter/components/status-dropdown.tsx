interface StatusDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

function StatusDropdown({ value, onChange }: StatusDropdownProps) {
  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2">
        Pilih Status
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">-- Pilih Status --</option>
        <option value="disetujui">Disetujui</option>
        <option value="ditolak">Ditolak</option>
      </select>
    </div>
  );
}

export default StatusDropdown;
