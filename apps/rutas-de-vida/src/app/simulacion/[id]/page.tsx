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
      <div className="min-h-screen flex bg-white font-sans overflow-hidden">
        {/* Sidebar Left Skeleton */}
        <div className="hidden lg:flex w-64 border-r border-gray-100 flex-col p-4">
          <div className="h-8 w-40 bg-gray-200 rounded-full mb-12 mt-4 animate-pulse" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col items-center p-6 sm:p-10 w-full">
          <div className="w-full max-w-[600px] flex justify-end gap-4 mb-8">
            <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="w-full max-w-[600px] h-32 bg-gray-200 rounded-2xl mb-10 animate-pulse" />
          <div className="flex flex-col items-center gap-8 w-full">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
        {/* Sidebar Right Skeleton */}
        <div className="hidden lg:flex w-80 border-l border-gray-100 flex-col p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="h-6 w-24 bg-gray-200 rounded-full mb-4 animate-pulse" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 w-full bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
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
