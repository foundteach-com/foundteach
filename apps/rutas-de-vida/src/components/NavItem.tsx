import { motion } from 'framer-motion';

export function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group overflow-hidden relative
        ${active ? 'bg-[#FF005A]/10 text-[#FF005A] border-2 border-[#FF005A]/20' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-2 border-transparent hover:scale-[1.02]'}
      `}
    >
      {active && (
        <motion.div layoutId="nav-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#FF005A] rounded-r-full" />
      )}
      <div className={`transition-transform ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:-rotate-3'}`}>
        {icon}
      </div>
      <span className="font-bold uppercase tracking-wider text-sm">{label}</span>
    </button>
  );
}
