import { useState } from "react";

const aiOptions = [
  { id: "reflection", label: "🧠 Reflection AI" },
  { id: "counselor", label: "🧘 Counselor AI" },
  { id: "philosopher", label: "🏛 Philosopher" },
];

export default function AIDropdown({ onSelect }: { onSelect: (id: string) => void }) {
  const [selected, setSelected] = useState("reflection");

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const aiId = e.target.value;
    setSelected(aiId);
    onSelect(aiId);
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm font-semibold text-white">Talk to:</label>
      <select
        value={selected}
        onChange={handleSelect}
        className="w-full p-2 bg-white text-black rounded border"
      >
        {aiOptions.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
