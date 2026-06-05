import { useRouter, usePathname } from 'next/navigation';
import { Navigation, Medal, ShoppingBag, User } from 'lucide-react';

export function MobileBottomNav({ characterId }: { characterId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const navItems = [
    { icon: Navigation, label: 'Aprender', path: `/simulacion/${characterId}` },
    { icon: Medal, label: 'Ligas', path: `/simulacion/${characterId}/ligas` },
    { icon: ShoppingBag, label: 'Tienda', path: `/simulacion/${characterId}/tienda` },
    { icon: User, label: 'Perfil', path: `/simulacion/${characterId}/perfil` }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t-2 border-gray-200 flex items-center justify-around p-2 z-50 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;
        
        return (
          <button
            key={index}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all min-w-[64px] ${
              isActive ? 'text-[#58CC02] bg-[#D7FFB8]/30' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
          >
            <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
            <span className={`text-[11px] font-bold ${isActive ? 'text-[#58CC02]' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
