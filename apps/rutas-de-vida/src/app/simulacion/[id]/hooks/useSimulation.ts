import { useState, useEffect, useCallback } from 'react';
import { playSuccessSound } from '../../../../utils/audio';
import { API_URL, ETAPA_LABELS } from '../../../../utils/constants';
import type { CharacterSummary, Decision, ProgressEntry } from '../../../../types';

export function useSimulation(characterId: string) {
  const [summary, setSummary] = useState<CharacterSummary | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);
  const [completedDecisionsCount, setCompletedDecisionsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Vistas
  const [viewMode, setViewMode] = useState<'dashboard' | 'playing'>('dashboard');

  // Estados de la partida
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isTakingDecision, setIsTakingDecision] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState<'success' | 'warning'>('success');
  const [perdioVida, setPerdioVida] = useState(false);
  const [statChanges, setStatChanges] = useState<{ label: string; delta: number }[]>([]);

  // Partículas de recompensa
  const [showXpParticles, setShowXpParticles] = useState(false);
  const [showMonedaParticles, setShowMonedaParticles] = useState(false);
  const [showVidaParticles, setShowVidaParticles] = useState(false);

  // Animación de avanzar de etapa
  const [showStageUpModal, setShowStageUpModal] = useState(false);
  const [nextStageName, setNextStageName] = useState('');
  const [showFinalModal, setShowFinalModal] = useState(false);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/rdv/progress/${characterId}/summary`);
      if (!res.ok) throw new Error('Error al cargar estado del personaje');
      const data: CharacterSummary = await res.json();
      setSummary(data);
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [characterId]);

  const fetchDecisions = useCallback(async (stage: string) => {
    try {
      // Pasamos characterId para obtener las 10 deterministas de esta etapa
      const res = await fetch(`${API_URL}/api/rdv/decisions?stage=${stage}&characterId=${characterId}`);
      if (!res.ok) throw new Error('Error al cargar decisiones');
      const allDecisions: Decision[] = await res.json();

      const progressRes = await fetch(`${API_URL}/api/rdv/progress/${characterId}`);
      const progress: ProgressEntry[] = progressRes.ok ? await progressRes.json() : [];
      const takenIds = new Set(progress.map((p) => p.decisionId));

      // Solo contamos las decisiones que pertenecen a las 10 de esta etapa
      const stageCompletedCount = allDecisions.filter(d => takenIds.has(d.id)).length;
      setCompletedDecisionsCount(stageCompletedCount);
      setDecisions(allDecisions);

      const pending = allDecisions.filter((d) => !takenIds.has(d.id));
      setCurrentDecision(pending.length > 0 ? pending[0] : null);
    } catch (err) {
      console.error(err);
    }
  }, [characterId]);

  const handleRest = async () => {
    if (!summary) return;
    try {
      setIsTakingDecision(true);
      const res = await fetch(`${API_URL}/api/rdv/progress/comprar-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId, itemId: 'descanso_gratis' }),
      });
      if (!res.ok) throw new Error('Error al descansar');
      playSuccessSound();
      // Ocultamos la vista de juego para forzar re-render en el dashboard
      setViewMode('dashboard');
      await initialize();
    } catch (err) {
      console.error(err);
      alert('Error al intentar descansar.');
    } finally {
      setIsTakingDecision(false);
    }
  };

  const initialize = useCallback(async () => {
    setIsLoading(true);
    const charSummary = await fetchState();
    if (charSummary) {
      await fetchDecisions(charSummary.character.etapaActual);
    }
    setIsLoading(false);
  }, [fetchState, fetchDecisions]);

  useEffect(() => {
    if (characterId) {
      initialize();
    }
  }, [characterId, initialize]);

  const handleStartNode = () => {
    if (currentDecision) {
      setViewMode('playing');
    }
  };

  const handleSelectOption = (optionId: string) => {
    if (isTakingDecision || showDrawer) return;
    setSelectedOptionId(optionId);
  };

  const handleConfirmDecision = async () => {
    if (!selectedOptionId || !currentDecision) return;
    setIsTakingDecision(true);

    try {
      const res = await fetch(`${API_URL}/api/rdv/progress/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          decisionId: currentDecision.id,
          optionId: selectedOptionId,
        }),
      });

      if (!res.ok) throw new Error('Error al enviar la decisión');
      const data = await res.json();

      playSuccessSound();
      const perdio = data.perdioVida === true;
      setPerdioVida(perdio);
      setDrawerVariant(perdio ? 'warning' : 'success');

      // Calcular diferencias de stats
      const changes: { label: string; delta: number }[] = [];
      if (summary && data.stats) {
        const oldStats = summary.stats as unknown as Record<string, number>;
        const newStats = data.stats as Record<string, number>;
        for (const key of Object.keys(oldStats)) {
          const diff = newStats[key] - oldStats[key];
          if (diff !== 0) changes.push({ label: key, delta: diff });
        }
      }
      setStatChanges(changes);

      // Mostrar partículas
      setShowXpParticles(true);
      setShowMonedaParticles(true);
      if (perdio) setShowVidaParticles(true);

      setTimeout(() => {
        setShowXpParticles(false);
        setShowMonedaParticles(false);
        setShowVidaParticles(false);
      }, 1500);

      setShowDrawer(true);
    } catch (err) {
      console.error(err);
      alert('Hubo un error al registrar tu decisión.');
    } finally {
      setIsTakingDecision(false);
    }
  };

  const handleContinue = async () => {
    setShowDrawer(false);
    setSelectedOptionId(null);
    setPerdioVida(false);
    setStatChanges([]);
    setViewMode('dashboard');
    await initialize();
  };

  const handleAdvanceStage = async () => {
    try {
      setIsLoading(true);
      const prevStage = summary?.character.etapaActual;
      const res = await fetch(`${API_URL}/api/rdv/progress/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al avanzar de etapa');
      }
      const data = await res.json();
      const siguienteNombre = ETAPA_LABELS[data.etapaActual] || data.etapaActual;
      setNextStageName(siguienteNombre);
      // Si el jugador ya estaba en la última etapa (OLD_AGE) y avanzó, mostramos modal final
      if (prevStage === 'OLD_AGE') {
        setShowFinalModal(true);
        setShowStageUpModal(false);
      } else {
        setShowStageUpModal(true);
      }
      playSuccessSound();
      await initialize();
    } catch (error) {
      console.error(error);
      alert('Error al avanzar: ' + (error as Error).message);
      setIsLoading(false);
    }
  };

  return {
    summary,
    decisions,
    currentDecision,
    completedDecisionsCount,
    isLoading,
    viewMode,
    setViewMode,
    selectedOptionId,
    isTakingDecision,
    showDrawer,
    drawerVariant,
    perdioVida,
    statChanges,
    showXpParticles,
    showMonedaParticles,
    showVidaParticles,
    showStageUpModal,
    setShowStageUpModal,
    nextStageName,
    handleStartNode,
    handleSelectOption,
    handleConfirmDecision,
    handleContinue,
    handleAdvanceStage,
    handleRest,
    showFinalModal,
    setShowFinalModal,
  };
}
