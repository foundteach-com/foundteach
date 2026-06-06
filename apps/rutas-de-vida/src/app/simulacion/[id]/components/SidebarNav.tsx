import { useRouter } from 'next/navigation';
import { Navigation, Target, Medal, ShoppingBag, Star, User } from 'lucide-react';
import { NavItem } from '../../../../components/NavItem';

export function SidebarNav({ characterId }: { characterId: string }) {
  const router = useRouter();
  
  return (
    <aside className="hidden lg:flex w-64 border-r border-gray-200 flex-col p-4 fixed h-full bg-white z-10">
      <div className="mb-10 pl-4 mt-4 cursor-pointer" onClick={() => router.push('/')}>
        <h1 className="font-display text-base sm:text-lg font-bold text-[#FF005A] tracking-tight hover:scale-105 transition-transform origin-left leading-tight">
          Enfoque ecológico, sistémico y perspectiva del ciclo vital
        </h1>
      </div>
      <nav className="flex flex-col gap-2">
        <NavItem icon={<Navigation />} label="Aprender" active onClick={() => router.push(`/simulacion/${characterId}`)} />
        <NavItem icon={<Target />} label="Práctica" onClick={() => {}} />
        <NavItem icon={<Medal />} label="Ligas" onClick={() => router.push(`/simulacion/${characterId}/ligas`)} />
        <NavItem icon={<ShoppingBag />} label="Tienda" onClick={() => router.push(`/simulacion/${characterId}/tienda`)} />
        <NavItem icon={<Star />} label="Logros" onClick={() => router.push(`/simulacion/${characterId}/logros`)} />
        <NavItem icon={<User />} label="Perfil" onClick={() => router.push(`/simulacion/${characterId}/perfil`)} />
      </nav>
    </aside>
  );
}
