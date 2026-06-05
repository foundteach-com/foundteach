'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSimulation } from './hooks/useSimulation';
import { DashboardView } from './components/DashboardView';
import { PlayingView } from './components/PlayingView';

export default function SimulacionPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.id as string;

  const state = useSimulation(characterId);

  if (state.isLoading && !state.summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#FF005A]"></div>
      </div>
    );
  }

  if (!state.summary) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-white">
        <h1 className="text-2xl text-red-500 font-bold">Error al cargar</h1>
        <button onClick={() => router.push('/')} className="px-6 py-2 bg-[#FF005A] text-white rounded-full font-bold">Volver</button>
      </div>
    );
  }

  return (
    <>
      {state.viewMode === 'dashboard' ? (
        <DashboardView characterId={characterId} state={state} />
      ) : (
        <PlayingView state={state} />
      )}
    </>
  );
}
