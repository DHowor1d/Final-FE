import { Search } from 'lucide-react';

interface MemberFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function MemberFilters({
  searchTerm,
  onSearchChange,
}: MemberFiltersProps) {
  return (
    <div className="mb-6">
      {/* 검색창 */}
      <div className="relative w-full border border-slate-300/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-gray-700/50 text-gray-50 placeholder-gray-400">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="이름, 사용자ID, 이메일로 검색..."
          className="w-full pl-10 pr-4 py-2 bg-transparent"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
