// ─── Shared Constants for Rutas de Vida ─────────────────────────

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/** Mapa de etapas (enum del backend) a nombres en español */
export const ETAPA_LABELS: Record<string, string> = {
  EARLY_CHILDHOOD: 'Primera Infancia',
  CHILDHOOD: 'Niñez',
  ADOLESCENCE: 'Adolescencia',
  YOUTH: 'Juventud',
  ADULTHOOD: 'Adultez',
  OLD_AGE: 'Vejez',
};

/** Orden secuencial de las etapas */
export const STAGES_ORDER = [
  'EARLY_CHILDHOOD',
  'CHILDHOOD',
  'ADOLESCENCE',
  'YOUTH',
  'ADULTHOOD',
  'OLD_AGE',
] as const;

/** Paleta de colores por estadística (usada en dashboard, perfil, etc.) */
export const STAT_COLORS = {
  fisico:       { bar: 'bg-[#58CC02]', bg: 'bg-[#58CC02]/10', text: 'text-[#58CC02]', icon: 'text-[#58CC02]' },
  cognitivo:    { bar: 'bg-[#00E1FF]', bg: 'bg-[#00E1FF]/10', text: 'text-[#00B4CC]', icon: 'text-[#00B4CC]' },
  social:       { bar: 'bg-[#CE82FF]', bg: 'bg-[#CE82FF]/10', text: 'text-[#A64BDB]', icon: 'text-[#A64BDB]' },
  afectivo:     { bar: 'bg-[#FF96CB]', bg: 'bg-[#FF96CB]/10', text: 'text-[#E05E9C]', icon: 'text-[#E05E9C]' },
  etico:        { bar: 'bg-[#FFC800]', bg: 'bg-[#FFC800]/10', text: 'text-[#CC9F00]', icon: 'text-[#CC9F00]' },
  comunicativo: { bar: 'bg-[#FF005A]', bg: 'bg-[#FF005A]/10', text: 'text-[#FF005A]', icon: 'text-[#FF005A]' },
} as const;

/** Colores para los contextos */
export const CONTEXT_COLORS = {
  familia:   { bar: 'bg-[#FF96CB]', bg: 'bg-[#FF96CB]/10', text: 'text-[#E05E9C]', icon: 'text-[#E05E9C]' },
  escuela:   { bar: 'bg-[#00E1FF]', bg: 'bg-[#00E1FF]/10', text: 'text-[#00B4CC]', icon: 'text-[#00B4CC]' },
  amigos:    { bar: 'bg-[#CE82FF]', bg: 'bg-[#CE82FF]/10', text: 'text-[#A64BDB]', icon: 'text-[#A64BDB]' },
  comunidad: { bar: 'bg-[#FFC800]', bg: 'bg-[#FFC800]/10', text: 'text-[#CC9F00]', icon: 'text-[#CC9F00]' },
  sociedad:  { bar: 'bg-[#58CC02]', bg: 'bg-[#58CC02]/10', text: 'text-[#58CC02]', icon: 'text-[#58CC02]' },
} as const;
