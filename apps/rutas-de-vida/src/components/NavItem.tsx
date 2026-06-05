export function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors
        ${active ? 'bg-[#FF005A]/10 text-[#FF005A] border-2 border-[#FF005A]/20' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-2 border-transparent'}
      `}
    >
      {icon}
      <span className="font-bold uppercase tracking-wider text-sm">{label}</span>
    </button>
  );
}
