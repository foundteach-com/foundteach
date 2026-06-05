export function getCharacterAvatar(genero: string, etapaActual: string): string {
  const baseDir = '/avatars';
  const prefix = genero === 'MALE' ? 'male' : 'female';
  
  // Mapeamos etapas a imágenes existentes
  let imageSuffix = 'baby'; // Por defecto EARLY_CHILDHOOD
  
  if (etapaActual === 'EARLY_CHILDHOOD') {
    imageSuffix = 'baby';
  } else if (etapaActual === 'CHILDHOOD') {
    imageSuffix = 'baby'; // TODO: Generate 'child' avatars and update
  } else if (etapaActual === 'ADOLESCENCE' || etapaActual === 'YOUTH') {
    imageSuffix = 'character'; // Usar el base que ya existe (ej. male_character.png)
    return `/${prefix}_character.png`;
  } else if (etapaActual === 'ADULTHOOD' || etapaActual === 'OLD_AGE') {
    imageSuffix = 'character'; // Usar base hasta tener viejos
    return `/${prefix}_character.png`;
  }

  return `${baseDir}/${prefix}_${imageSuffix}.png`;
}

export function getDecisionBackground(titulo: string, descripcion: string): string | null {
  const text = (titulo + ' ' + descripcion).toLowerCase();
  
  if (text.includes('parque') || text.includes('juego') || text.includes('calle')) {
    return '/backgrounds/parque.png';
  }
  if (text.includes('escuela') || text.includes('salón') || text.includes('clase') || text.includes('profesor') || text.includes('colegio')) {
    return '/backgrounds/escuela.png';
  }
  if (text.includes('casa') || text.includes('madre') || text.includes('padre') || text.includes('habitación') || text.includes('hogar')) {
    return '/backgrounds/casa.png';
  }
  
  return null; // Fallback
}
