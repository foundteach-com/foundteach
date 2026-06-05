// ─── Shared Types for Rutas de Vida ─────────────────────────────

export type Gender = 'MALE' | 'FEMALE';

export interface CharacterSummary {
  character: {
    id: string;
    nombre: string;
    genero: Gender;
    etapaActual: string;
    xp: number;
    monedas: number;
    vidas: number;
    escudoRacha: boolean;
    xpBoostCharges: number;
  };
  stats: {
    fisico: number;
    cognitivo: number;
    social: number;
    afectivo: number;
    etico: number;
    comunicativo: number;
  };
  context: {
    familia: number;
    escuela: number;
    amigos: number;
    comunidad: number;
    sociedad: number;
  };
  relationships: Array<{ tipo: string; valor: number }>;
  decisionsCount: number;
}

export interface Decision {
  id: string;
  etapa: string;
  titulo: string;
  descripcion: string;
  options: Array<{
    id: string;
    texto: string;
  }>;
}

export interface ProgressEntry {
  decisionId: string;
}

export interface Logro {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  color: string;
  unlocked: boolean;
}

export interface Jugador {
  id: string;
  nombre: string;
  genero: Gender;
  etapaActual: string;
  xp: number;
  monedas: number;
}
