import { motion } from 'framer-motion';
import Image from 'next/image';
import { getCharacterAvatar } from '../../../../utils/visuals';
import type { CharacterSummary } from '../../../../types';

interface IsometricRoomProps {
  summary: CharacterSummary;
  onGeneratorClick?: (generatorType: string) => void;
}

export function IsometricRoom({ summary, onGeneratorClick }: IsometricRoomProps) {
  const avatarImage = getCharacterAvatar(summary.character.genero, summary.character.etapaActual);

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-sky-50 to-white rounded-3xl border border-gray-100 shadow-inner mb-10">
      
      {/* Contenedor Isométrico */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative w-[300px] h-[300px]"
        style={{
          // Proyección Isométrica CSS
          transform: 'rotateX(60deg) rotateZ(-45deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Suelo (Piso de la habitación) */}
        <div className="absolute inset-0 bg-amber-100/80 border-2 border-amber-200/50 shadow-[inset_0_0_50px_rgba(0,0,0,0.05)] rounded-lg grid grid-cols-4 grid-rows-4">
            {/* Grid styling */}
            {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-amber-200/30" />
            ))}
        </div>

        {/* Pared Izquierda */}
        <div 
            className="absolute top-0 left-0 w-[300px] h-[100px] bg-slate-100 border border-slate-200 origin-bottom"
            style={{ transform: 'rotateX(-90deg) translateY(100px)' }}
        />
        
        {/* Pared Derecha */}
        <div 
            className="absolute top-0 left-0 w-[100px] h-[300px] bg-slate-200 border border-slate-300 origin-right"
            style={{ transform: 'rotateY(90deg) translateX(-100px)' }}
        />

        {/* Objetos en la habitación (Generadores) */}
        
        {/* Escritorio (Generador Cognitivo) */}
        <motion.div 
            onClick={() => onGeneratorClick?.('cognitivo')}
            whileHover={{ scale: 1.1, translateY: -5 }}
            className="absolute top-[20px] left-[20px] w-[60px] h-[40px] bg-[#00E1FF] border-2 border-[#00B4CC] rounded shadow-[2px_2px_0_#00B4CC] cursor-pointer"
            style={{ transform: 'translateZ(20px)' }}
        >
            {/* Popover indicando pasiva */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-bold text-sky-500 shadow-sm opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap" style={{ transform: 'rotateZ(45deg) rotateX(-60deg)' }}>
               +XP / min
            </div>
        </motion.div>

        {/* Cama/Sofa (Generador Afectivo/Descanso) */}
        <motion.div 
            onClick={() => onGeneratorClick?.('afectivo')}
            whileHover={{ scale: 1.1, translateY: -5 }}
            className="absolute bottom-[20px] left-[20px] w-[80px] h-[60px] bg-[#FF96CB] border-2 border-[#E05E9C] rounded shadow-[2px_2px_0_#E05E9C] cursor-pointer"
            style={{ transform: 'translateZ(15px)' }}
        />

        {/* Personaje (Avatar 2D en entorno isométrico) */}
        <motion.div 
            animate={{ 
                z: [0, 5, 0],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-[120px] left-[120px] w-[60px] h-[60px] flex items-center justify-center pointer-events-none drop-shadow-2xl"
            style={{ 
                // Contrarrestar la rotación isométrica para que el avatar mire "a cámara" (Billboard effect)
                transform: 'rotateZ(45deg) rotateX(-60deg) translateZ(30px)',
                transformOrigin: 'bottom center'
            }}
        >
            <div className="relative w-full h-full bg-white rounded-full border-2 border-white shadow-lg overflow-hidden">
                <Image src={avatarImage} alt="Avatar" fill className="object-cover" />
            </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
