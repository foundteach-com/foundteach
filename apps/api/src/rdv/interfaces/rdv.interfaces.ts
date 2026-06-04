/**
 * Tipos de relación del enfoque sistémico.
 * Cada personaje tiene exactamente una instancia de cada tipo.
 */
export const RDV_RELATIONSHIP_TYPES = [
  'MADRE',
  'PADRE',
  'HERMANOS',
  'AMIGOS',
  'PROFESORES',
  'PAREJA',
  'COMUNIDAD',
] as const;

export type RdvRelationshipType = (typeof RDV_RELATIONSHIP_TYPES)[number];

/**
 * Campos modificables en RdvStats.
 */
export const RDV_STAT_FIELDS = [
  'fisico',
  'cognitivo',
  'social',
  'afectivo',
  'etico',
  'comunicativo',
] as const;

export type RdvStatField = (typeof RDV_STAT_FIELDS)[number];

/**
 * Campos modificables en RdvContext (enfoque ecológico).
 */
export const RDV_CONTEXT_FIELDS = [
  'familia',
  'escuela',
  'amigos',
  'comunidad',
  'sociedad',
] as const;

export type RdvContextField = (typeof RDV_CONTEXT_FIELDS)[number];

/**
 * Orden de las etapas del ciclo vital.
 * Se usa para determinar la progresión del personaje.
 */
export const RDV_LIFE_STAGE_ORDER = [
  'EARLY_CHILDHOOD',
  'CHILDHOOD',
  'ADOLESCENCE',
  'YOUTH',
  'ADULTHOOD',
  'OLD_AGE',
] as const;

/**
 * Resumen del estado completo de un personaje.
 */
export interface RdvCharacterSummary {
  character: {
    id: string;
    nombre: string;
    genero: string;
    etapaActual: string;
  };
  stats: Record<RdvStatField, number>;
  context: Record<RdvContextField, number>;
  relationships: Array<{ tipo: string; valor: number }>;
  decisionsCount: number;
}
