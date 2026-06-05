import { PrismaClient, RdvLifeStage } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Tipo auxiliar para definir decisiones ────────────────────────────────────
interface SeedOption {
  texto: string;
  cambiosEnAtributos?: Record<string, number>;
  cambiosEnContexto?: Record<string, number>;
  cambiosEnRelaciones?: Record<string, number>;
  sortOrder: number;
}

interface SeedDecision {
  etapa: RdvLifeStage;
  titulo: string;
  descripcion: string;
  sortOrder: number;
  requisitos?: Record<string, any>;
  opciones: SeedOption[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMERA INFANCIA (0 – 5 años)
// Temáticas: descubrimiento, vínculo familiar, primeras emociones, lenguaje
// ═══════════════════════════════════════════════════════════════════════════════
const EARLY_CHILDHOOD: SeedDecision[] = [
  {
    etapa: RdvLifeStage.EARLY_CHILDHOOD,
    titulo: 'El Primer Día de Guardería',
    descripcion: 'Es tu primer día en la guardería. Tu madre te deja en la puerta y se despide con la mano. Otros niños juegan en el patio, pero tú no conoces a nadie. Sientes un nudo en el estómago.',
    sortOrder: 3,
    opciones: [
      {
        texto: 'Caminar hacia un grupo de niños y saludarlos',
        cambiosEnAtributos: { social: 5, comunicativo: 4, afectivo: 2 },
        cambiosEnContexto: { amigos: 4, escuela: 3 },
        cambiosEnRelaciones: { AMIGOS: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Sentarte solo en un rincón y esperar a que tu madre vuelva',
        cambiosEnAtributos: { afectivo: -2, social: -3 },
        cambiosEnContexto: { escuela: -2 },
        cambiosEnRelaciones: { MADRE: 2 },
        sortOrder: 2,
      },
      {
        texto: 'Llorar fuerte para que tu madre regrese',
        cambiosEnAtributos: { comunicativo: 2, social: -2, afectivo: -3 },
        cambiosEnContexto: { escuela: -3 },
        cambiosEnRelaciones: { MADRE: -1, PROFESORES: -2 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.EARLY_CHILDHOOD,
    titulo: 'El Dibujo para Mamá',
    descripcion: 'En la guardería, la profesora reparte crayones y papel. Dice que pueden dibujar lo que quieran. Tú miras los colores brillantes y piensas en qué dibujar.',
    sortOrder: 4,
    opciones: [
      {
        texto: 'Dibujar a tu familia con muchos colores',
        cambiosEnAtributos: { afectivo: 4, cognitivo: 3, comunicativo: 2 },
        cambiosEnContexto: { familia: 4, escuela: 2 },
        cambiosEnRelaciones: { MADRE: 3, PADRE: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Copiar el dibujo del niño de al lado',
        cambiosEnAtributos: { cognitivo: 1, social: 2, etico: -3 },
        cambiosEnContexto: { escuela: -1 },
        cambiosEnRelaciones: {},
        sortOrder: 2,
      },
      {
        texto: 'Rayar todo el papel sin forma y mostrarlo orgulloso',
        cambiosEnAtributos: { cognitivo: 2, comunicativo: 3, afectivo: 2 },
        cambiosEnContexto: { escuela: 1 },
        cambiosEnRelaciones: { PROFESORES: 1 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.EARLY_CHILDHOOD,
    titulo: 'El Animal Perdido',
    descripcion: 'Mientras juegas en el jardín de tu casa, encuentras un gatito pequeño escondido debajo de un arbusto. Está mojado y tiembla de frío. Tu padre está adentro.',
    sortOrder: 5,
    opciones: [
      {
        texto: 'Correr a decirle a tu padre que hay un gatito que necesita ayuda',
        cambiosEnAtributos: { comunicativo: 4, etico: 5, afectivo: 3 },
        cambiosEnContexto: { familia: 3 },
        cambiosEnRelaciones: { PADRE: 4 },
        sortOrder: 1,
      },
      {
        texto: 'Intentar recoger al gatito tú solo y llevarlo adentro',
        cambiosEnAtributos: { fisico: 3, afectivo: 4, etico: 3 },
        cambiosEnContexto: { familia: 1 },
        cambiosEnRelaciones: {},
        sortOrder: 2,
      },
      {
        texto: 'Asustarte y salir corriendo hacia la casa',
        cambiosEnAtributos: { fisico: 2, afectivo: -2, etico: -1 },
        cambiosEnContexto: {},
        cambiosEnRelaciones: {},
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.EARLY_CHILDHOOD,
    titulo: 'La Pelea por los Bloques',
    descripcion: 'Estás construyendo una torre enorme con bloques de madera. De pronto, otro niño llega y derriba tu torre de un manotazo, riéndose. La profesora no ha visto nada.',
    sortOrder: 6,
    opciones: [
      {
        texto: 'Decirle con palabras que eso no estuvo bien y pedirle que te ayude a reconstruirla',
        cambiosEnAtributos: { comunicativo: 5, social: 4, etico: 4, afectivo: 2 },
        cambiosEnContexto: { escuela: 3, amigos: 2 },
        cambiosEnRelaciones: { AMIGOS: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Empujarlo de vuelta para que sienta lo mismo',
        cambiosEnAtributos: { fisico: 2, social: -4, etico: -4, afectivo: -2 },
        cambiosEnContexto: { escuela: -4, amigos: -3 },
        cambiosEnRelaciones: { AMIGOS: -3, PROFESORES: -3 },
        sortOrder: 2,
      },
      {
        texto: 'Ir a contarle a la profesora lo que pasó',
        cambiosEnAtributos: { comunicativo: 3, etico: 2, social: 1 },
        cambiosEnContexto: { escuela: 2 },
        cambiosEnRelaciones: { PROFESORES: 2 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.EARLY_CHILDHOOD,
    titulo: 'La Tormenta de Noche',
    descripcion: 'Te despiertas en medio de la noche porque hay una tormenta muy fuerte. Los truenos suenan y ves las sombras moverse en las paredes de tu habitación.',
    sortOrder: 7,
    opciones: [
      {
        texto: 'Ir a la cama de tus padres y acurrucarte con ellos',
        cambiosEnAtributos: { afectivo: 4, social: 2 },
        cambiosEnContexto: { familia: 4 },
        cambiosEnRelaciones: { MADRE: 3, PADRE: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Abrazar tu peluche favorito y tratar de dormir solo',
        cambiosEnAtributos: { afectivo: 3, cognitivo: 3, fisico: 2 },
        cambiosEnContexto: {},
        cambiosEnRelaciones: {},
        sortOrder: 2,
      },
      {
        texto: 'Gritar pidiendo ayuda hasta que alguien venga',
        cambiosEnAtributos: { comunicativo: 2, afectivo: -2 },
        cambiosEnContexto: { familia: -1 },
        cambiosEnRelaciones: { MADRE: 1, PADRE: -1 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.EARLY_CHILDHOOD,
    titulo: 'El Charco Misterioso',
    descripcion: 'Después de la lluvia, aparece un charco enorme frente a tu casa. Tu madre te dice que no te ensucies porque van a visitar a la abuela. El charco brilla bajo el sol.',
    sortOrder: 8,
    opciones: [
      {
        texto: 'Obedecer a tu madre y caminar alrededor del charco',
        cambiosEnAtributos: { etico: 4, social: 2 },
        cambiosEnContexto: { familia: 3 },
        cambiosEnRelaciones: { MADRE: 4 },
        sortOrder: 1,
      },
      {
        texto: 'Saltar al charco con toda tu fuerza y reírte',
        cambiosEnAtributos: { fisico: 4, cognitivo: 2, etico: -3 },
        cambiosEnContexto: { familia: -2 },
        cambiosEnRelaciones: { MADRE: -3 },
        sortOrder: 2,
      },
      {
        texto: 'Meter solo un dedo del pie para probar el agua',
        cambiosEnAtributos: { cognitivo: 5, fisico: 1 },
        cambiosEnContexto: {},
        cambiosEnRelaciones: { MADRE: 1 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.EARLY_CHILDHOOD,
    titulo: 'La Palabra Mágica',
    descripcion: 'Estás en casa de tu abuela y ella tiene una bandeja llena de galletas recién horneadas. Te dice: "Si quieres una, ¿qué tienes que decir?". Te mira con una sonrisa.',
    sortOrder: 9,
    opciones: [
      {
        texto: 'Decir "Por favor, abuelita" con voz suave',
        cambiosEnAtributos: { comunicativo: 5, etico: 4, social: 3, afectivo: 2 },
        cambiosEnContexto: { familia: 4 },
        cambiosEnRelaciones: { MADRE: 2 },
        sortOrder: 1,
      },
      {
        texto: 'Tomar una galleta sin decir nada',
        cambiosEnAtributos: { fisico: 1, etico: -3, comunicativo: -2, social: -2 },
        cambiosEnContexto: { familia: -2 },
        cambiosEnRelaciones: { MADRE: -2 },
        sortOrder: 2,
      },
      {
        texto: 'Quedarte callado porque te da vergüenza hablar',
        cambiosEnAtributos: { afectivo: -1, comunicativo: -2 },
        cambiosEnContexto: {},
        cambiosEnRelaciones: {},
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.EARLY_CHILDHOOD,
    titulo: 'El Hermano Menor',
    descripcion: 'Tus padres llegan a casa con un bebé nuevo: tu hermanito. Todos los familiares vienen a verlo y le traen regalos. Nadie parece prestarte atención.',
    sortOrder: 10,
    opciones: [
      {
        texto: 'Acercarte al bebé y tocar su manita con cuidado',
        cambiosEnAtributos: { afectivo: 5, social: 3, etico: 3 },
        cambiosEnContexto: { familia: 5 },
        cambiosEnRelaciones: { HERMANOS: 5, MADRE: 3, PADRE: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Pedir atención haciendo ruido y berrinche',
        cambiosEnAtributos: { comunicativo: 2, afectivo: -3, social: -3 },
        cambiosEnContexto: { familia: -3 },
        cambiosEnRelaciones: { MADRE: -3, PADRE: -3, HERMANOS: -1 },
        sortOrder: 2,
      },
      {
        texto: 'Ir a tu cuarto solo y jugar en silencio',
        cambiosEnAtributos: { cognitivo: 2, afectivo: -1 },
        cambiosEnContexto: { familia: -1 },
        cambiosEnRelaciones: {},
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.EARLY_CHILDHOOD,
    titulo: 'El Columpio Ocupado',
    descripcion: 'En el parque, quieres subirte al columpio, pero otro niño lleva mucho rato y no se baja. Hay una fila de tres niños esperando su turno.',
    sortOrder: 11,
    opciones: [
      {
        texto: 'Esperar pacientemente tu turno en la fila',
        cambiosEnAtributos: { etico: 5, social: 4, afectivo: 2 },
        cambiosEnContexto: { amigos: 3 },
        cambiosEnRelaciones: { AMIGOS: 2 },
        sortOrder: 1,
      },
      {
        texto: 'Colarte en la fila cuando nadie esté mirando',
        cambiosEnAtributos: { fisico: 1, etico: -4, social: -3 },
        cambiosEnContexto: { amigos: -3 },
        cambiosEnRelaciones: { AMIGOS: -2 },
        sortOrder: 2,
      },
      {
        texto: 'Buscar otro juego mientras tanto',
        cambiosEnAtributos: { cognitivo: 3, fisico: 2, social: 1 },
        cambiosEnContexto: { amigos: 1 },
        cambiosEnRelaciones: {},
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.EARLY_CHILDHOOD,
    titulo: 'La Mentira Pequeña',
    descripcion: 'Sin querer, rompes un jarrón de tu madre mientras corrías por la sala. Nadie te vio. Tu madre escucha el ruido y pregunta: "¿Qué pasó?"',
    sortOrder: 12,
    opciones: [
      {
        texto: 'Decir la verdad: "Fui yo, lo siento mamá"',
        cambiosEnAtributos: { etico: 6, comunicativo: 4, afectivo: 2 },
        cambiosEnContexto: { familia: 3 },
        cambiosEnRelaciones: { MADRE: 4 },
        sortOrder: 1,
      },
      {
        texto: 'Decir que fue el gato',
        cambiosEnAtributos: { cognitivo: 2, etico: -5, comunicativo: 1 },
        cambiosEnContexto: { familia: -3 },
        cambiosEnRelaciones: { MADRE: -4 },
        sortOrder: 2,
      },
      {
        texto: 'Quedarte callado y esconderte',
        cambiosEnAtributos: { afectivo: -2, comunicativo: -2, etico: -2 },
        cambiosEnContexto: { familia: -1 },
        cambiosEnRelaciones: { MADRE: -1 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.EARLY_CHILDHOOD,
    titulo: 'Los Primeros Números',
    descripcion: 'Tu padre te muestra unos bloques numerados y te pregunta cuántos bloques hay. Pones mucha atención e intentas contar del 1 al 5.',
    sortOrder: 13,
    opciones: [
      {
        texto: 'Concentrarte y contar despacio señalando cada bloque',
        cambiosEnAtributos: { cognitivo: 6, comunicativo: 3 },
        cambiosEnContexto: { familia: 2, escuela: 2 },
        cambiosEnRelaciones: { PADRE: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Decir un número al azar para terminar rápido e ir a jugar',
        cambiosEnAtributos: { fisico: 1, cognitivo: -2 },
        cambiosEnContexto: { familia: -1, escuela: -1 },
        cambiosEnRelaciones: { PADRE: -1 },
        sortOrder: 2,
      },
      {
        texto: 'Pedir ayuda porque no entiendes',
        cambiosEnAtributos: { comunicativo: 4, cognitivo: 2, social: 2 },
        cambiosEnContexto: { familia: 2 },
        cambiosEnRelaciones: { PADRE: 2 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.EARLY_CHILDHOOD,
    titulo: 'El Niño Nuevo',
    descripcion: 'Llega un niño nuevo a la guardería. Se ve tímido y está parado solo en la esquina sin hablar con nadie. La profesora les pide que lo incluyan.',
    sortOrder: 14,
    opciones: [
      {
        texto: 'Acercarte, presentarte y preguntarle su nombre',
        cambiosEnAtributos: { social: 5, comunicativo: 4, afectivo: 3, etico: 3 },
        cambiosEnContexto: { escuela: 3, amigos: 4 },
        cambiosEnRelaciones: { AMIGOS: 4, PROFESORES: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Mirarlo de lejos pero no acercarte',
        cambiosEnAtributos: { cognitivo: 1, social: -1 },
        cambiosEnContexto: { escuela: -1 },
        cambiosEnRelaciones: {},
        sortOrder: 2,
      },
      {
        texto: 'Invitarlo a jugar con tus bloques sin decir palabras',
        cambiosEnAtributos: { social: 4, afectivo: 3, etico: 3 },
        cambiosEnContexto: { amigos: 3, escuela: 2 },
        cambiosEnRelaciones: { AMIGOS: 3 },
        sortOrder: 3,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// NIÑEZ (6 – 11 años)
// Temáticas: escuela, amistad, responsabilidad, identidad temprana
// ═══════════════════════════════════════════════════════════════════════════════
const CHILDHOOD: SeedDecision[] = [
  {
    etapa: RdvLifeStage.CHILDHOOD,
    titulo: 'El Examen Difícil',
    descripcion: 'Mañana tienes el examen de matemáticas más importante del año. Tu mejor amigo te invita a jugar videojuegos toda la tarde. No has estudiado nada.',
    sortOrder: 1,
    opciones: [
      {
        texto: 'Quedarte en casa y estudiar con dedicación',
        cambiosEnAtributos: { cognitivo: 6, etico: 3 },
        cambiosEnContexto: { escuela: 5, familia: 2 },
        cambiosEnRelaciones: { PROFESORES: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Ir a jugar videojuegos y estudiar "un poco" en la noche',
        cambiosEnAtributos: { social: 3, cognitivo: -3, etico: -2 },
        cambiosEnContexto: { escuela: -4, amigos: 2 },
        cambiosEnRelaciones: { AMIGOS: 2, PROFESORES: -2 },
        sortOrder: 2,
      },
      {
        texto: 'Invitar a tu amigo a estudiar juntos y luego jugar un rato',
        cambiosEnAtributos: { cognitivo: 4, social: 4, comunicativo: 3 },
        cambiosEnContexto: { escuela: 3, amigos: 3 },
        cambiosEnRelaciones: { AMIGOS: 3, PROFESORES: 2 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.CHILDHOOD,
    titulo: 'El Acoso en el Recreo',
    descripcion: 'En el recreo, ves que un grupo de niños mayores está molestando a un compañero más pequeño, quitándole su merienda. El niño está a punto de llorar.',
    sortOrder: 2,
    opciones: [
      {
        texto: 'Intervenir y decirles que lo dejen en paz',
        cambiosEnAtributos: { etico: 6, social: 3, fisico: 2, afectivo: 3 },
        cambiosEnContexto: { escuela: 3, amigos: 4 },
        cambiosEnRelaciones: { AMIGOS: 4, PROFESORES: 2 },
        sortOrder: 1,
      },
      {
        texto: 'Ir a buscar a un profesor para que resuelva la situación',
        cambiosEnAtributos: { etico: 4, comunicativo: 3, social: 2 },
        cambiosEnContexto: { escuela: 3 },
        cambiosEnRelaciones: { PROFESORES: 4 },
        sortOrder: 2,
      },
      {
        texto: 'No meterte en problemas y seguir caminando',
        cambiosEnAtributos: { fisico: 1, etico: -4, social: -2, afectivo: -2 },
        cambiosEnContexto: { escuela: -1, amigos: -2 },
        cambiosEnRelaciones: {},
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.CHILDHOOD,
    titulo: 'La Mascota Responsable',
    descripcion: 'Tus padres te dicen que puedes tener una mascota, pero tú serás el responsable de alimentarla, bañarla y sacarla a pasear todos los días.',
    sortOrder: 3,
    opciones: [
      {
        texto: 'Aceptar con entusiasmo y cumplir tu promesa de cuidarla',
        cambiosEnAtributos: { etico: 5, afectivo: 4, fisico: 3 },
        cambiosEnContexto: { familia: 4 },
        cambiosEnRelaciones: { MADRE: 3, PADRE: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Aceptar pero dejar que tus padres hagan la mayor parte del trabajo',
        cambiosEnAtributos: { afectivo: 2, etico: -3 },
        cambiosEnContexto: { familia: -2 },
        cambiosEnRelaciones: { MADRE: -2, PADRE: -2 },
        sortOrder: 2,
      },
      {
        texto: 'Decidir que prefieres no tener mascota porque es mucha responsabilidad',
        cambiosEnAtributos: { cognitivo: 3, etico: 2 },
        cambiosEnContexto: { familia: 1 },
        cambiosEnRelaciones: {},
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.CHILDHOOD,
    titulo: 'El Trabajo en Equipo',
    descripcion: 'La profesora de ciencias asigna un proyecto grupal. Tú quedas en un equipo con dos compañeros que no hacen nada y te toca hacer todo el trabajo.',
    sortOrder: 4,
    opciones: [
      {
        texto: 'Hablar con tus compañeros y repartir las tareas de forma justa',
        cambiosEnAtributos: { comunicativo: 5, social: 4, cognitivo: 3 },
        cambiosEnContexto: { escuela: 4, amigos: 2 },
        cambiosEnRelaciones: { AMIGOS: 2, PROFESORES: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Hacer todo tú solo para asegurarte de sacar buena nota',
        cambiosEnAtributos: { cognitivo: 4, social: -2, afectivo: -2 },
        cambiosEnContexto: { escuela: 3 },
        cambiosEnRelaciones: { PROFESORES: 2, AMIGOS: -1 },
        sortOrder: 2,
      },
      {
        texto: 'Quejarte con la profesora para que los regañe',
        cambiosEnAtributos: { comunicativo: 2, social: -3, etico: 1 },
        cambiosEnContexto: { escuela: 1, amigos: -3 },
        cambiosEnRelaciones: { AMIGOS: -3, PROFESORES: 1 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.CHILDHOOD,
    titulo: 'El Primer Deporte',
    descripcion: 'Tu escuela ofrece actividades extracurriculares. Puedes inscribirte en un equipo deportivo, pero los entrenamientos son después de clases tres veces por semana.',
    sortOrder: 5,
    opciones: [
      {
        texto: 'Inscribirte en el equipo de fútbol y dar lo mejor',
        cambiosEnAtributos: { fisico: 6, social: 4, afectivo: 2 },
        cambiosEnContexto: { escuela: 3, amigos: 3 },
        cambiosEnRelaciones: { AMIGOS: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Preferir quedarte en casa jugando videojuegos',
        cambiosEnAtributos: { cognitivo: 2, fisico: -3, social: -2 },
        cambiosEnContexto: { escuela: -1 },
        cambiosEnRelaciones: {},
        sortOrder: 2,
      },
      {
        texto: 'Inscribirte en una actividad artística como pintura o música',
        cambiosEnAtributos: { cognitivo: 4, afectivo: 4, comunicativo: 3 },
        cambiosEnContexto: { escuela: 3, comunidad: 2 },
        cambiosEnRelaciones: { PROFESORES: 2 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.CHILDHOOD,
    titulo: 'El Dinero Encontrado',
    descripcion: 'Mientras vas al colegio, encuentras un billete de $10.000 en el suelo del pasillo. Nadie está mirando. Es suficiente para comprar muchos dulces en la tienda.',
    sortOrder: 6,
    opciones: [
      {
        texto: 'Llevarlo a la oficina del colegio para que busquen al dueño',
        cambiosEnAtributos: { etico: 7, social: 2 },
        cambiosEnContexto: { escuela: 4 },
        cambiosEnRelaciones: { PROFESORES: 4 },
        sortOrder: 1,
      },
      {
        texto: 'Guardarlo y comprar dulces para ti',
        cambiosEnAtributos: { etico: -5, social: -1 },
        cambiosEnContexto: { escuela: -2 },
        cambiosEnRelaciones: {},
        sortOrder: 2,
      },
      {
        texto: 'Guardarlo y comprar dulces para compartir con tus amigos',
        cambiosEnAtributos: { social: 3, etico: -2, afectivo: 2 },
        cambiosEnContexto: { amigos: 2 },
        cambiosEnRelaciones: { AMIGOS: 2 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.CHILDHOOD,
    titulo: 'La Tarea Copiada',
    descripcion: 'Tu mejor amigo olvidó hacer la tarea y te pide que le dejes copiar la tuya antes de que entre el profesor. Te mira con ojos suplicantes.',
    sortOrder: 7,
    opciones: [
      {
        texto: 'Decirle que no puedes porque es deshonesto, pero ofrecerle ayuda para la siguiente',
        cambiosEnAtributos: { etico: 5, comunicativo: 4, social: 2 },
        cambiosEnContexto: { escuela: 3, amigos: 1 },
        cambiosEnRelaciones: { AMIGOS: 1, PROFESORES: 2 },
        sortOrder: 1,
      },
      {
        texto: 'Dejarle copiar porque es tu amigo y no quieres que le vaya mal',
        cambiosEnAtributos: { social: 3, afectivo: 2, etico: -4 },
        cambiosEnContexto: { amigos: 3, escuela: -2 },
        cambiosEnRelaciones: { AMIGOS: 3 },
        sortOrder: 2,
      },
      {
        texto: 'Explicarle rápidamente el tema para que haga algo propio',
        cambiosEnAtributos: { cognitivo: 3, comunicativo: 4, social: 4, etico: 3 },
        cambiosEnContexto: { escuela: 2, amigos: 3 },
        cambiosEnRelaciones: { AMIGOS: 3, PROFESORES: 1 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.CHILDHOOD,
    titulo: 'La Feria de Ciencias',
    descripcion: 'La escuela organiza una feria de ciencias. Puedes participar con un proyecto original. Tu padre se ofrece a ayudarte, pero tú quieres hacerlo solo.',
    sortOrder: 8,
    requisitos: { minStats: { cognitivo: 45 } },
    opciones: [
      {
        texto: 'Aceptar la ayuda de tu padre y hacer el proyecto juntos',
        cambiosEnAtributos: { cognitivo: 4, social: 3, comunicativo: 2 },
        cambiosEnContexto: { familia: 4, escuela: 3 },
        cambiosEnRelaciones: { PADRE: 5 },
        sortOrder: 1,
      },
      {
        texto: 'Hacerlo solo para demostrar que puedes',
        cambiosEnAtributos: { cognitivo: 6, fisico: 2, afectivo: 3 },
        cambiosEnContexto: { escuela: 4 },
        cambiosEnRelaciones: { PROFESORES: 3, PADRE: -1 },
        sortOrder: 2,
      },
      {
        texto: 'No participar porque te parece aburrido',
        cambiosEnAtributos: { cognitivo: -3, social: -1 },
        cambiosEnContexto: { escuela: -3 },
        cambiosEnRelaciones: { PADRE: -2, PROFESORES: -2 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.CHILDHOOD,
    titulo: 'El Amigo en Problemas',
    descripcion: 'Tu amigo te confiesa que en su casa las cosas están mal: sus padres pelean mucho y él se siente triste. Tiene los ojos rojos como si hubiera llorado.',
    sortOrder: 9,
    opciones: [
      {
        texto: 'Escucharlo con atención y decirle que puede contar contigo',
        cambiosEnAtributos: { afectivo: 6, social: 4, comunicativo: 3, etico: 3 },
        cambiosEnContexto: { amigos: 5 },
        cambiosEnRelaciones: { AMIGOS: 5 },
        sortOrder: 1,
      },
      {
        texto: 'Cambiar de tema porque no sabes qué decir',
        cambiosEnAtributos: { comunicativo: -2, afectivo: -2, social: -1 },
        cambiosEnContexto: { amigos: -2 },
        cambiosEnRelaciones: { AMIGOS: -2 },
        sortOrder: 2,
      },
      {
        texto: 'Sugerirle que hable con la profesora o con un adulto de confianza',
        cambiosEnAtributos: { cognitivo: 3, etico: 4, comunicativo: 3 },
        cambiosEnContexto: { amigos: 3, escuela: 2 },
        cambiosEnRelaciones: { AMIGOS: 3, PROFESORES: 2 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.CHILDHOOD,
    titulo: 'La Lectura Secreta',
    descripcion: 'Descubres un libro fascinante en la biblioteca del colegio sobre animales prehistóricos. El problema es que la hora de lectura ya terminó y deberías ir a clase de educación física.',
    sortOrder: 10,
    opciones: [
      {
        texto: 'Pedir permiso a la bibliotecaria para llevarte el libro a casa',
        cambiosEnAtributos: { cognitivo: 5, comunicativo: 3, etico: 3 },
        cambiosEnContexto: { escuela: 3 },
        cambiosEnRelaciones: { PROFESORES: 2 },
        sortOrder: 1,
      },
      {
        texto: 'Esconderte en la biblioteca y seguir leyendo',
        cambiosEnAtributos: { cognitivo: 4, etico: -3, fisico: -2 },
        cambiosEnContexto: { escuela: -2 },
        cambiosEnRelaciones: { PROFESORES: -3 },
        sortOrder: 2,
      },
      {
        texto: 'Ir a educación física y volver mañana por el libro',
        cambiosEnAtributos: { fisico: 3, etico: 3, cognitivo: 2 },
        cambiosEnContexto: { escuela: 2 },
        cambiosEnRelaciones: { PROFESORES: 2 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.CHILDHOOD,
    titulo: 'El Cumpleaños Difícil',
    descripcion: 'Es tu cumpleaños y quieres invitar a todos tus amigos, pero tu familia no tiene mucho dinero este mes. Tu madre te dice que solo puedes invitar a 3 personas.',
    sortOrder: 11,
    opciones: [
      {
        texto: 'Aceptar con madurez y elegir a tus 3 amigos más cercanos',
        cambiosEnAtributos: { afectivo: 4, etico: 3, cognitivo: 2 },
        cambiosEnContexto: { familia: 4, amigos: 2 },
        cambiosEnRelaciones: { MADRE: 4, AMIGOS: 2 },
        sortOrder: 1,
      },
      {
        texto: 'Hacer berrinche porque quieres una fiesta grande',
        cambiosEnAtributos: { afectivo: -3, etico: -3, social: -1 },
        cambiosEnContexto: { familia: -4 },
        cambiosEnRelaciones: { MADRE: -4 },
        sortOrder: 2,
      },
      {
        texto: 'Proponer hacer una fiesta sencilla pero divertida con juegos caseros',
        cambiosEnAtributos: { cognitivo: 5, social: 4, comunicativo: 3, afectivo: 3 },
        cambiosEnContexto: { familia: 4, amigos: 4 },
        cambiosEnRelaciones: { MADRE: 5, AMIGOS: 3 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.CHILDHOOD,
    titulo: 'La Pelea de los Padres',
    descripcion: 'Una noche escuchas a tus padres discutir fuerte. No sabes qué pasa, pero te sientes asustado. Tu hermano menor se despierta llorando.',
    sortOrder: 12,
    opciones: [
      {
        texto: 'Ir con tu hermano, abrazarlo y decirle que todo va a estar bien',
        cambiosEnAtributos: { afectivo: 6, social: 3, etico: 4 },
        cambiosEnContexto: { familia: 3 },
        cambiosEnRelaciones: { HERMANOS: 6 },
        sortOrder: 1,
      },
      {
        texto: 'Ponerte los audífonos y tratar de no escuchar',
        cambiosEnAtributos: { cognitivo: 1, afectivo: -3 },
        cambiosEnContexto: { familia: -2 },
        cambiosEnRelaciones: { HERMANOS: -2 },
        sortOrder: 2,
      },
      {
        texto: 'Salir al pasillo y pedirles a tus padres que dejen de pelear',
        cambiosEnAtributos: { comunicativo: 4, afectivo: 2, etico: 3 },
        cambiosEnContexto: { familia: 2 },
        cambiosEnRelaciones: { MADRE: 2, PADRE: 2 },
        sortOrder: 3,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ADOLESCENCIA (12 – 17 años)
// Temáticas: identidad, presión social, sexualidad, redes sociales, rebeldía
// ═══════════════════════════════════════════════════════════════════════════════
const ADOLESCENCE: SeedDecision[] = [
  {
    etapa: RdvLifeStage.ADOLESCENCE,
    titulo: 'La Presión del Grupo',
    descripcion: 'Tus amigos del colegio están fumando detrás del gimnasio durante el recreo. Te invitan a probarlo diciendo que "todos lo hacen". Te observan esperando tu respuesta.',
    sortOrder: 1,
    opciones: [
      {
        texto: 'Rechazar con firmeza: "No, gracias. No me interesa"',
        cambiosEnAtributos: { etico: 6, fisico: 3, comunicativo: 4, afectivo: 3 },
        cambiosEnContexto: { escuela: 2, amigos: -1 },
        cambiosEnRelaciones: { AMIGOS: -1 },
        sortOrder: 1,
      },
      {
        texto: 'Aceptar para no quedar como el raro del grupo',
        cambiosEnAtributos: { social: 2, fisico: -5, etico: -4, afectivo: -2 },
        cambiosEnContexto: { escuela: -3, amigos: 2 },
        cambiosEnRelaciones: { AMIGOS: 2, PROFESORES: -3 },
        sortOrder: 2,
      },
      {
        texto: 'Irte sin decir nada y buscar otros amigos',
        cambiosEnAtributos: { etico: 3, social: -1, afectivo: 1 },
        cambiosEnContexto: { amigos: -2 },
        cambiosEnRelaciones: { AMIGOS: -2 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.ADOLESCENCE,
    titulo: 'El Primer Amor',
    descripcion: 'Te gusta mucho un compañero/a de tu clase. Tus amigos te animan a declararte, pero tienes miedo al rechazo. El día de San Valentín se acerca.',
    sortOrder: 2,
    opciones: [
      {
        texto: 'Escribirle una carta honesta expresando lo que sientes',
        cambiosEnAtributos: { comunicativo: 5, afectivo: 4, social: 3, etico: 2 },
        cambiosEnContexto: { amigos: 2, escuela: 1 },
        cambiosEnRelaciones: { PAREJA: 4 },
        sortOrder: 1,
      },
      {
        texto: 'Pedirle a un amigo que le pregunte si le gustas',
        cambiosEnAtributos: { social: 3, comunicativo: -1, afectivo: 1 },
        cambiosEnContexto: { amigos: 2 },
        cambiosEnRelaciones: { AMIGOS: 1, PAREJA: 1 },
        sortOrder: 2,
      },
      {
        texto: 'No decir nada y guardar tus sentimientos para ti',
        cambiosEnAtributos: { afectivo: -3, comunicativo: -2 },
        cambiosEnContexto: {},
        cambiosEnRelaciones: {},
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.ADOLESCENCE,
    titulo: 'Las Redes Sociales',
    descripcion: 'Alguien publica un meme burlándose de un compañero de clase. El meme se está haciendo viral en el grupo de WhatsApp del salón. Muchos se ríen.',
    sortOrder: 3,
    opciones: [
      {
        texto: 'Escribir en el grupo que eso es bullying y pedir que lo borren',
        cambiosEnAtributos: { etico: 6, comunicativo: 5, social: 2, afectivo: 3 },
        cambiosEnContexto: { escuela: 3, amigos: 1 },
        cambiosEnRelaciones: { PROFESORES: 2, AMIGOS: 1 },
        sortOrder: 1,
      },
      {
        texto: 'Reenviar el meme a otro grupo riéndote',
        cambiosEnAtributos: { social: 1, etico: -6, afectivo: -3, comunicativo: -2 },
        cambiosEnContexto: { escuela: -4, amigos: 1 },
        cambiosEnRelaciones: { AMIGOS: -2, PROFESORES: -3 },
        sortOrder: 2,
      },
      {
        texto: 'Hablar en privado con el compañero afectado para apoyarlo',
        cambiosEnAtributos: { afectivo: 5, etico: 4, social: 3, comunicativo: 3 },
        cambiosEnContexto: { amigos: 4, escuela: 2 },
        cambiosEnRelaciones: { AMIGOS: 4 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.ADOLESCENCE,
    titulo: 'La Vocación',
    descripcion: 'El orientador del colegio les pide que piensen en qué carrera les gustaría estudiar. Tu familia quiere que seas abogado, pero a ti te apasiona la música.',
    sortOrder: 4,
    requisitos: { minStats: { cognitivo: 50 } },
    opciones: [
      {
        texto: 'Hablar con tus padres honestamente sobre tu pasión por la música',
        cambiosEnAtributos: { comunicativo: 5, afectivo: 4, etico: 3, cognitivo: 2 },
        cambiosEnContexto: { familia: 2, escuela: 3 },
        cambiosEnRelaciones: { MADRE: 2, PADRE: 2 },
        sortOrder: 1,
      },
      {
        texto: 'Aceptar estudiar derecho para complacer a tus padres',
        cambiosEnAtributos: { social: 2, afectivo: -4, etico: -1 },
        cambiosEnContexto: { familia: 3, escuela: 1 },
        cambiosEnRelaciones: { MADRE: 3, PADRE: 3 },
        sortOrder: 2,
      },
      {
        texto: 'Investigar carreras que combinen ambos mundos (derecho del entretenimiento)',
        cambiosEnAtributos: { cognitivo: 6, comunicativo: 3, afectivo: 3 },
        cambiosEnContexto: { familia: 3, escuela: 4 },
        cambiosEnRelaciones: { MADRE: 3, PADRE: 3, PROFESORES: 3 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.ADOLESCENCE,
    titulo: 'La Fiesta Sin Permiso',
    descripcion: 'Tus amigos organizan una fiesta un viernes por la noche. Sabes que tus padres no te darían permiso. Un amigo te dice que puedes decir que te quedas a dormir en su casa.',
    sortOrder: 5,
    opciones: [
      {
        texto: 'Ser honesto con tus padres y pedirles permiso con argumentos',
        cambiosEnAtributos: { comunicativo: 5, etico: 5, social: 2 },
        cambiosEnContexto: { familia: 4 },
        cambiosEnRelaciones: { MADRE: 4, PADRE: 4 },
        sortOrder: 1,
      },
      {
        texto: 'Mentir y ir a la fiesta a escondidas',
        cambiosEnAtributos: { social: 3, etico: -6, afectivo: -2 },
        cambiosEnContexto: { familia: -5, amigos: 3 },
        cambiosEnRelaciones: { MADRE: -5, PADRE: -5, AMIGOS: 3 },
        sortOrder: 2,
      },
      {
        texto: 'No ir a la fiesta, pero tampoco contarle a nadie por qué',
        cambiosEnAtributos: { etico: 2, social: -2, afectivo: -2 },
        cambiosEnContexto: { amigos: -2 },
        cambiosEnRelaciones: { AMIGOS: -2 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.ADOLESCENCE,
    titulo: 'El Alcohol en la Reunión',
    descripcion: 'En una reunión de amigos, alguien trae cerveza. Varios empiezan a tomar. Un amigo te pasa una lata diciendo: "Solo una no hace daño".',
    sortOrder: 6,
    opciones: [
      {
        texto: 'Rechazar con naturalidad: "Estoy bien con mi gaseosa"',
        cambiosEnAtributos: { etico: 5, fisico: 3, comunicativo: 3, afectivo: 2 },
        cambiosEnContexto: { amigos: -1 },
        cambiosEnRelaciones: {},
        sortOrder: 1,
      },
      {
        texto: 'Tomar una para no sentirte excluido',
        cambiosEnAtributos: { social: 2, fisico: -4, etico: -3, afectivo: -1 },
        cambiosEnContexto: { amigos: 2 },
        cambiosEnRelaciones: { AMIGOS: 1, MADRE: -3 },
        sortOrder: 2,
      },
      {
        texto: 'Proponer que hagan otra actividad como jugar cartas o videojuegos',
        cambiosEnAtributos: { comunicativo: 4, social: 4, cognitivo: 2, etico: 3 },
        cambiosEnContexto: { amigos: 3 },
        cambiosEnRelaciones: { AMIGOS: 3 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.ADOLESCENCE,
    titulo: 'El Voluntariado',
    descripcion: 'El colegio organiza una jornada de voluntariado en un hogar de ancianos el próximo sábado. Es opcional, pero dan puntos extra. Tu fin de semana ya tiene planes.',
    sortOrder: 7,
    opciones: [
      {
        texto: 'Ir al voluntariado y reorganizar tus planes',
        cambiosEnAtributos: { etico: 5, social: 4, afectivo: 5, comunicativo: 2 },
        cambiosEnContexto: { comunidad: 5, escuela: 3, sociedad: 3 },
        cambiosEnRelaciones: { PROFESORES: 3, COMUNIDAD: 4 },
        sortOrder: 1,
      },
      {
        texto: 'No ir porque tienes otros planes más divertidos',
        cambiosEnAtributos: { social: 1, etico: -2, afectivo: -1 },
        cambiosEnContexto: { amigos: 1, comunidad: -2 },
        cambiosEnRelaciones: {},
        sortOrder: 2,
      },
      {
        texto: 'Organizar tu propio voluntariado con amigos en otro momento',
        cambiosEnAtributos: { comunicativo: 5, social: 5, etico: 4, cognitivo: 3 },
        cambiosEnContexto: { comunidad: 4, amigos: 4, sociedad: 3 },
        cambiosEnRelaciones: { AMIGOS: 4, COMUNIDAD: 5 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.ADOLESCENCE,
    titulo: 'La Identidad Digital',
    descripcion: 'Tienes la oportunidad de crear tu propio canal de YouTube o cuenta de TikTok. Puedes hablar de lo que quieras, pero todo el mundo podría verlo.',
    sortOrder: 8,
    opciones: [
      {
        texto: 'Crear contenido educativo sobre algo que te apasiona',
        cambiosEnAtributos: { comunicativo: 6, cognitivo: 4, social: 3 },
        cambiosEnContexto: { sociedad: 4, comunidad: 3, amigos: 2 },
        cambiosEnRelaciones: { COMUNIDAD: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Hacer videos de bromas pesadas para ganar seguidores rápido',
        cambiosEnAtributos: { social: 3, comunicativo: 2, etico: -5, afectivo: -2 },
        cambiosEnContexto: { sociedad: -3, amigos: 1 },
        cambiosEnRelaciones: { PROFESORES: -3, COMUNIDAD: -2 },
        sortOrder: 2,
      },
      {
        texto: 'Decidir que aún no estás listo y esperar hasta tener algo valioso que decir',
        cambiosEnAtributos: { cognitivo: 3, etico: 2, afectivo: 1 },
        cambiosEnContexto: {},
        cambiosEnRelaciones: {},
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.ADOLESCENCE,
    titulo: 'La Nota Injusta',
    descripcion: 'Estás seguro de que tu examen estaba bien, pero el profesor te puso una nota más baja de la que merecías. Sientes que fue injusto.',
    sortOrder: 9,
    requisitos: { minStats: { comunicativo: 45 } },
    opciones: [
      {
        texto: 'Hablar respetuosamente con el profesor y mostrarle por qué crees merecer más',
        cambiosEnAtributos: { comunicativo: 6, etico: 4, cognitivo: 3, social: 2 },
        cambiosEnContexto: { escuela: 4 },
        cambiosEnRelaciones: { PROFESORES: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Quejarte con tus amigos y hablar mal del profesor a sus espaldas',
        cambiosEnAtributos: { social: 1, comunicativo: -2, etico: -4 },
        cambiosEnContexto: { escuela: -3 },
        cambiosEnRelaciones: { PROFESORES: -4, AMIGOS: 1 },
        sortOrder: 2,
      },
      {
        texto: 'Aceptar la nota y esforzarte más en el próximo examen',
        cambiosEnAtributos: { cognitivo: 3, etico: 2, afectivo: 2 },
        cambiosEnContexto: { escuela: 2 },
        cambiosEnRelaciones: { PROFESORES: 1 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.ADOLESCENCE,
    titulo: 'El Emprendimiento Juvenil',
    descripcion: 'Se te ocurre una idea para ganar algo de dinero: vender postres caseros en el colegio. Necesitas invertir un poco de tus ahorros y convencer a tu mamá de ayudarte a cocinar.',
    sortOrder: 10,
    opciones: [
      {
        texto: 'Hacer un plan de negocio sencillo y presentárselo a tu mamá',
        cambiosEnAtributos: { cognitivo: 6, comunicativo: 4, social: 3, etico: 2 },
        cambiosEnContexto: { familia: 3, escuela: 3, comunidad: 2 },
        cambiosEnRelaciones: { MADRE: 4, PROFESORES: 2 },
        sortOrder: 1,
      },
      {
        texto: 'Empezar a vender sin pedir permiso a nadie',
        cambiosEnAtributos: { cognitivo: 3, etico: -3, social: 1 },
        cambiosEnContexto: { escuela: -2, familia: -2 },
        cambiosEnRelaciones: { MADRE: -3, PROFESORES: -2 },
        sortOrder: 2,
      },
      {
        texto: 'Guardar la idea para cuando seas mayor',
        cambiosEnAtributos: { cognitivo: 1, afectivo: -1 },
        cambiosEnContexto: {},
        cambiosEnRelaciones: {},
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.ADOLESCENCE,
    titulo: 'El Amigo en las Drogas',
    descripcion: 'Descubres que un amigo cercano está consumiendo drogas. Se ve diferente últimamente: más delgado, irritable y ha bajado mucho sus notas.',
    sortOrder: 11,
    requisitos: { minStats: { social: 45, afectivo: 45 } },
    opciones: [
      {
        texto: 'Hablar con él a solas, expresar tu preocupación y ofrecerle ayuda',
        cambiosEnAtributos: { afectivo: 6, etico: 5, comunicativo: 4, social: 3 },
        cambiosEnContexto: { amigos: 4 },
        cambiosEnRelaciones: { AMIGOS: 5 },
        sortOrder: 1,
      },
      {
        texto: 'Contarle a un adulto de confianza (profesor, orientador o tus padres)',
        cambiosEnAtributos: { etico: 5, comunicativo: 3, afectivo: 2 },
        cambiosEnContexto: { amigos: 1, escuela: 3, familia: 2 },
        cambiosEnRelaciones: { PROFESORES: 4, AMIGOS: -1 },
        sortOrder: 2,
      },
      {
        texto: 'Alejarte de él porque no quieres problemas',
        cambiosEnAtributos: { fisico: 1, etico: -3, afectivo: -4, social: -2 },
        cambiosEnContexto: { amigos: -4 },
        cambiosEnRelaciones: { AMIGOS: -4 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.ADOLESCENCE,
    titulo: 'Las Elecciones Estudiantiles',
    descripcion: 'Tu colegio organiza elecciones para representante estudiantil. Varios compañeros te dicen que deberías lanzarte como candidato porque eres buen líder.',
    sortOrder: 12,
    opciones: [
      {
        texto: 'Lanzarte como candidato con propuestas reales para mejorar el colegio',
        cambiosEnAtributos: { comunicativo: 6, social: 5, cognitivo: 3, etico: 4 },
        cambiosEnContexto: { escuela: 5, comunidad: 3, amigos: 3 },
        cambiosEnRelaciones: { PROFESORES: 4, AMIGOS: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Apoyar a un amigo que se lanza como candidato',
        cambiosEnAtributos: { social: 4, afectivo: 3, etico: 2 },
        cambiosEnContexto: { escuela: 2, amigos: 3 },
        cambiosEnRelaciones: { AMIGOS: 4 },
        sortOrder: 2,
      },
      {
        texto: 'No participar porque no te interesa la política estudiantil',
        cambiosEnAtributos: { social: -2, comunicativo: -1 },
        cambiosEnContexto: { escuela: -1 },
        cambiosEnRelaciones: {},
        sortOrder: 3,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// JUVENTUD (18 – 25 años)
// Temáticas: universidad, independencia, relaciones serias, trabajo
// ═══════════════════════════════════════════════════════════════════════════════
const YOUTH: SeedDecision[] = [
  {
    etapa: RdvLifeStage.YOUTH,
    titulo: 'La Elección de Carrera',
    descripcion: 'Acabas de graduarte del colegio. Tienes tres opciones: ir a la universidad, empezar a trabajar de inmediato, o tomarte un año sabático para explorar el mundo.',
    sortOrder: 1,
    opciones: [
      {
        texto: 'Inscribirte en la universidad para estudiar lo que te apasiona',
        cambiosEnAtributos: { cognitivo: 6, social: 3, comunicativo: 2 },
        cambiosEnContexto: { escuela: 5, sociedad: 3 },
        cambiosEnRelaciones: { MADRE: 3, PADRE: 3, PROFESORES: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Buscar un trabajo para empezar a ser independiente económicamente',
        cambiosEnAtributos: { fisico: 3, cognitivo: 2, etico: 3 },
        cambiosEnContexto: { sociedad: 4, comunidad: 2 },
        cambiosEnRelaciones: { MADRE: 2, PADRE: 3 },
        sortOrder: 2,
      },
      {
        texto: 'Tomar un año sabático para descubrir tu verdadera vocación',
        cambiosEnAtributos: { afectivo: 4, cognitivo: 3, social: 3 },
        cambiosEnContexto: { sociedad: 2 },
        cambiosEnRelaciones: { MADRE: -1, PADRE: -1, AMIGOS: 2 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.YOUTH,
    titulo: 'El Compañero de Apartamento',
    descripcion: 'Decides mudarte solo por primera vez. Un amigo te propone compartir apartamento para dividir gastos, pero tiene fama de ser desordenado e irresponsable.',
    sortOrder: 2,
    opciones: [
      {
        texto: 'Aceptar pero establecer reglas claras desde el principio',
        cambiosEnAtributos: { comunicativo: 5, social: 4, cognitivo: 3, etico: 2 },
        cambiosEnContexto: { amigos: 3, comunidad: 2 },
        cambiosEnRelaciones: { AMIGOS: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Vivir solo aunque cueste más para tener tu espacio',
        cambiosEnAtributos: { cognitivo: 3, afectivo: 2, social: -1 },
        cambiosEnContexto: { comunidad: 2 },
        cambiosEnRelaciones: {},
        sortOrder: 2,
      },
      {
        texto: 'Aceptar sin poner reglas para no crear conflictos',
        cambiosEnAtributos: { social: 2, etico: -2, afectivo: -3 },
        cambiosEnContexto: { amigos: 1, comunidad: -2 },
        cambiosEnRelaciones: { AMIGOS: 1 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.YOUTH,
    titulo: 'La Primera Entrevista de Trabajo',
    descripcion: 'Consigues una entrevista para el trabajo de tus sueños. Estás nervioso y tienes que prepararte bien. La entrevista es en dos días.',
    sortOrder: 3,
    opciones: [
      {
        texto: 'Investigar la empresa a fondo y practicar posibles preguntas',
        cambiosEnAtributos: { cognitivo: 5, comunicativo: 4, etico: 2 },
        cambiosEnContexto: { sociedad: 4 },
        cambiosEnRelaciones: {},
        sortOrder: 1,
      },
      {
        texto: 'Improvisar y confiar en tu carisma natural',
        cambiosEnAtributos: { social: 3, comunicativo: 2, cognitivo: -2 },
        cambiosEnContexto: { sociedad: 1 },
        cambiosEnRelaciones: {},
        sortOrder: 2,
      },
      {
        texto: 'Pedir consejo a familiares y amigos que tengan experiencia laboral',
        cambiosEnAtributos: { comunicativo: 4, social: 4, cognitivo: 3 },
        cambiosEnContexto: { familia: 3, sociedad: 3, amigos: 2 },
        cambiosEnRelaciones: { MADRE: 2, PADRE: 2, AMIGOS: 2 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.YOUTH,
    titulo: 'El Dilema de la Deuda',
    descripcion: 'Para poder estudiar necesitas un crédito educativo. Es una deuda grande que tardarás años en pagar, pero la educación es tu prioridad.',
    sortOrder: 4,
    opciones: [
      {
        texto: 'Tomar el crédito con un plan claro de pago',
        cambiosEnAtributos: { cognitivo: 5, etico: 3, afectivo: 1 },
        cambiosEnContexto: { escuela: 4, sociedad: 2 },
        cambiosEnRelaciones: {},
        sortOrder: 1,
      },
      {
        texto: 'Buscar becas y trabajar medio tiempo para evitar la deuda',
        cambiosEnAtributos: { cognitivo: 4, fisico: 3, etico: 4, comunicativo: 3 },
        cambiosEnContexto: { escuela: 3, sociedad: 4 },
        cambiosEnRelaciones: { PROFESORES: 3 },
        sortOrder: 2,
      },
      {
        texto: 'Descartar la universidad y aprender por tu cuenta (autodidacta)',
        cambiosEnAtributos: { cognitivo: 3, afectivo: 2, social: -2 },
        cambiosEnContexto: { escuela: -2, sociedad: 2 },
        cambiosEnRelaciones: { MADRE: -2, PADRE: -2 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.YOUTH,
    titulo: 'La Relación a Distancia',
    descripcion: 'Tu pareja recibe una oferta de trabajo en otra ciudad. Les queda la decisión de intentar la relación a distancia o terminar amigablemente.',
    sortOrder: 5,
    requisitos: { minStats: { afectivo: 50 } },
    opciones: [
      {
        texto: 'Intentar la relación a distancia con compromiso y comunicación',
        cambiosEnAtributos: { afectivo: 5, comunicativo: 4, etico: 3 },
        cambiosEnContexto: { amigos: 2 },
        cambiosEnRelaciones: { PAREJA: 5 },
        sortOrder: 1,
      },
      {
        texto: 'Terminar la relación de forma madura y seguir adelante',
        cambiosEnAtributos: { afectivo: -2, cognitivo: 3, etico: 2 },
        cambiosEnContexto: { amigos: 1 },
        cambiosEnRelaciones: { PAREJA: -3 },
        sortOrder: 2,
      },
      {
        texto: 'Dejar tu vida actual y mudarte con tu pareja',
        cambiosEnAtributos: { afectivo: 4, social: -2, cognitivo: -1 },
        cambiosEnContexto: { familia: -3, amigos: -3, comunidad: -2 },
        cambiosEnRelaciones: { PAREJA: 4, MADRE: -2, PADRE: -2, AMIGOS: -3 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.YOUTH,
    titulo: 'El Proyecto Social',
    descripcion: 'Un grupo de jóvenes de tu barrio te invita a participar en un proyecto comunitario: construir una biblioteca para niños de bajos recursos. Necesitan ayuda los fines de semana.',
    sortOrder: 6,
    opciones: [
      {
        texto: 'Unirte al proyecto con entusiasmo y aportar tus habilidades',
        cambiosEnAtributos: { etico: 6, social: 5, afectivo: 4, fisico: 3 },
        cambiosEnContexto: { comunidad: 6, sociedad: 4 },
        cambiosEnRelaciones: { COMUNIDAD: 5, AMIGOS: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Donar dinero pero no participar directamente',
        cambiosEnAtributos: { etico: 3, social: 1 },
        cambiosEnContexto: { comunidad: 2 },
        cambiosEnRelaciones: { COMUNIDAD: 1 },
        sortOrder: 2,
      },
      {
        texto: 'Rechazar porque tus fines de semana son para descansar',
        cambiosEnAtributos: { fisico: 2, etico: -2, social: -2 },
        cambiosEnContexto: { comunidad: -2 },
        cambiosEnRelaciones: { COMUNIDAD: -2 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.YOUTH,
    titulo: 'El Jefe Abusivo',
    descripcion: 'En tu primer trabajo, tu jefe te pide constantemente que hagas horas extra sin pago. Otros empleados también lo sufren pero nadie dice nada.',
    sortOrder: 7,
    opciones: [
      {
        texto: 'Hablar con tu jefe de forma profesional sobre tus derechos laborales',
        cambiosEnAtributos: { comunicativo: 6, etico: 5, social: 3, cognitivo: 2 },
        cambiosEnContexto: { sociedad: 4, comunidad: 3 },
        cambiosEnRelaciones: {},
        sortOrder: 1,
      },
      {
        texto: 'Aceptar las horas extra por miedo a perder el trabajo',
        cambiosEnAtributos: { fisico: -3, afectivo: -4, etico: -2 },
        cambiosEnContexto: { sociedad: -2 },
        cambiosEnRelaciones: {},
        sortOrder: 2,
      },
      {
        texto: 'Organizar a tus compañeros para hablar juntos con recursos humanos',
        cambiosEnAtributos: { comunicativo: 5, social: 6, etico: 5, cognitivo: 3 },
        cambiosEnContexto: { sociedad: 5, comunidad: 4 },
        cambiosEnRelaciones: { AMIGOS: 3, COMUNIDAD: 3 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.YOUTH,
    titulo: 'La Oportunidad en el Extranjero',
    descripcion: 'Te ofrecen una beca para estudiar un semestre en el extranjero. Es una oportunidad única, pero significa dejar a tu familia y amigos por 6 meses.',
    sortOrder: 8,
    requisitos: { minStats: { cognitivo: 55 } },
    opciones: [
      {
        texto: 'Aceptar la beca y aprovechar la experiencia internacional',
        cambiosEnAtributos: { cognitivo: 6, social: 4, comunicativo: 5, afectivo: 3 },
        cambiosEnContexto: { escuela: 5, sociedad: 5 },
        cambiosEnRelaciones: { PROFESORES: 4 },
        sortOrder: 1,
      },
      {
        texto: 'Rechazarla porque no quieres dejar a tu familia',
        cambiosEnAtributos: { afectivo: 3, social: 1, cognitivo: -2 },
        cambiosEnContexto: { familia: 3 },
        cambiosEnRelaciones: { MADRE: 3, PADRE: 3 },
        sortOrder: 2,
      },
      {
        texto: 'Posponer la decisión y pedir más información antes de decidir',
        cambiosEnAtributos: { cognitivo: 3, comunicativo: 2 },
        cambiosEnContexto: { escuela: 1, familia: 1 },
        cambiosEnRelaciones: {},
        sortOrder: 3,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ADULTEZ (26 – 59 años)
// Temáticas: carrera profesional, familia propia, salud, comunidad, finanzas
// ═══════════════════════════════════════════════════════════════════════════════
const ADULTHOOD: SeedDecision[] = [
  {
    etapa: RdvLifeStage.ADULTHOOD,
    titulo: 'El Ascenso o la Familia',
    descripcion: 'Te ofrecen un ascenso en el trabajo que implica viajar constantemente. Tu pareja te dice que necesitan más tiempo juntos y tus hijos te extrañan.',
    sortOrder: 1,
    opciones: [
      {
        texto: 'Negociar con tu jefe un esquema flexible que permita balance',
        cambiosEnAtributos: { comunicativo: 5, cognitivo: 4, social: 3, etico: 3 },
        cambiosEnContexto: { familia: 3, sociedad: 4 },
        cambiosEnRelaciones: { PAREJA: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Aceptar el ascenso priorizando el crecimiento profesional',
        cambiosEnAtributos: { cognitivo: 4, fisico: -2, afectivo: -3 },
        cambiosEnContexto: { sociedad: 5, familia: -4 },
        cambiosEnRelaciones: { PAREJA: -4 },
        sortOrder: 2,
      },
      {
        texto: 'Rechazar el ascenso y priorizar a tu familia',
        cambiosEnAtributos: { afectivo: 5, etico: 4, cognitivo: -1 },
        cambiosEnContexto: { familia: 5, sociedad: -2 },
        cambiosEnRelaciones: { PAREJA: 5, MADRE: 2 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.ADULTHOOD,
    titulo: 'El Ahorro vs. El Lujo',
    descripcion: 'Recibes un bono de fin de año bastante generoso. Puedes invertirlo, ahorrarlo o darte un gusto que llevas tiempo deseando.',
    sortOrder: 2,
    opciones: [
      {
        texto: 'Invertir la mayor parte y ahorrar un poco para emergencias',
        cambiosEnAtributos: { cognitivo: 5, etico: 4 },
        cambiosEnContexto: { familia: 3, sociedad: 3 },
        cambiosEnRelaciones: { PAREJA: 2 },
        sortOrder: 1,
      },
      {
        texto: 'Gastarlo en unas vacaciones familiares que todos necesitan',
        cambiosEnAtributos: { afectivo: 5, social: 4, fisico: 2 },
        cambiosEnContexto: { familia: 5, amigos: 2 },
        cambiosEnRelaciones: { PAREJA: 4 },
        sortOrder: 2,
      },
      {
        texto: 'Comprar algo lujoso solo para ti',
        cambiosEnAtributos: { afectivo: 2, social: -1, etico: -2 },
        cambiosEnContexto: { familia: -2 },
        cambiosEnRelaciones: { PAREJA: -3 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.ADULTHOOD,
    titulo: 'La Salud Descuidada',
    descripcion: 'Llevas meses sin hacer ejercicio, comiendo mal y durmiendo poco por culpa del trabajo. Un día te sientes mareado y el médico te advierte que debes cambiar tus hábitos.',
    sortOrder: 3,
    opciones: [
      {
        texto: 'Tomarlo en serio: empezar a comer bien, hacer ejercicio y dormir más',
        cambiosEnAtributos: { fisico: 7, afectivo: 3, cognitivo: 2, etico: 2 },
        cambiosEnContexto: { familia: 3 },
        cambiosEnRelaciones: { PAREJA: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Hacer un cambio mínimo pero seguir trabajando al mismo ritmo',
        cambiosEnAtributos: { fisico: 1, cognitivo: 1, afectivo: -2 },
        cambiosEnContexto: { sociedad: 1 },
        cambiosEnRelaciones: {},
        sortOrder: 2,
      },
      {
        texto: 'Ignorar al médico y seguir como estás',
        cambiosEnAtributos: { fisico: -6, afectivo: -3, etico: -2 },
        cambiosEnContexto: { familia: -3 },
        cambiosEnRelaciones: { PAREJA: -3, MADRE: -2 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.ADULTHOOD,
    titulo: 'El Vecino en Necesidad',
    descripcion: 'Tu vecino pierde su empleo y no puede pagar el arriendo. Te pide prestado dinero prometiendo devolvértelo en un mes.',
    sortOrder: 4,
    opciones: [
      {
        texto: 'Prestarle el dinero y además ayudarle a buscar trabajo',
        cambiosEnAtributos: { etico: 6, social: 5, afectivo: 4 },
        cambiosEnContexto: { comunidad: 5, sociedad: 3 },
        cambiosEnRelaciones: { COMUNIDAD: 5 },
        sortOrder: 1,
      },
      {
        texto: 'Prestarle una parte más pequeña con un acuerdo claro',
        cambiosEnAtributos: { etico: 3, cognitivo: 3, social: 2 },
        cambiosEnContexto: { comunidad: 3 },
        cambiosEnRelaciones: { COMUNIDAD: 3 },
        sortOrder: 2,
      },
      {
        texto: 'Decirle que no puedes porque no confías en que te pague',
        cambiosEnAtributos: { cognitivo: 2, etico: -2, social: -3, afectivo: -2 },
        cambiosEnContexto: { comunidad: -3 },
        cambiosEnRelaciones: { COMUNIDAD: -3 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.ADULTHOOD,
    titulo: 'La Educación de tus Hijos',
    descripcion: 'Tu hijo adolescente está teniendo problemas en el colegio. Sus notas han bajado mucho y parece desmotivado. La profesora pide una reunión contigo.',
    sortOrder: 5,
    opciones: [
      {
        texto: 'Sentarte con tu hijo a escucharlo primero y entender qué está pasando',
        cambiosEnAtributos: { afectivo: 6, comunicativo: 5, social: 3, etico: 3 },
        cambiosEnContexto: { familia: 5, escuela: 3 },
        cambiosEnRelaciones: { HERMANOS: 4 },
        sortOrder: 1,
      },
      {
        texto: 'Castigarlo quitándole el celular y los videojuegos',
        cambiosEnAtributos: { etico: 1, afectivo: -2, comunicativo: -2 },
        cambiosEnContexto: { familia: -2, escuela: 1 },
        cambiosEnRelaciones: { HERMANOS: -3 },
        sortOrder: 2,
      },
      {
        texto: 'Contratar un tutor y asistir juntos a la reunión con la profesora',
        cambiosEnAtributos: { cognitivo: 4, comunicativo: 3, social: 3, etico: 3 },
        cambiosEnContexto: { familia: 3, escuela: 4 },
        cambiosEnRelaciones: { HERMANOS: 3, PROFESORES: 3 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.ADULTHOOD,
    titulo: 'La Crisis Matrimonial',
    descripcion: 'Tu relación de pareja atraviesa una etapa difícil. Ambos trabajan mucho, casi no se comunican y las discusiones son cada vez más frecuentes.',
    sortOrder: 6,
    requisitos: { minStats: { afectivo: 40, comunicativo: 40 } },
    opciones: [
      {
        texto: 'Proponer terapia de pareja para trabajar juntos en la relación',
        cambiosEnAtributos: { afectivo: 5, comunicativo: 5, social: 3, etico: 3 },
        cambiosEnContexto: { familia: 5 },
        cambiosEnRelaciones: { PAREJA: 5 },
        sortOrder: 1,
      },
      {
        texto: 'Ignorar los problemas esperando que se resuelvan solos',
        cambiosEnAtributos: { afectivo: -4, comunicativo: -3, social: -2 },
        cambiosEnContexto: { familia: -4 },
        cambiosEnRelaciones: { PAREJA: -5 },
        sortOrder: 2,
      },
      {
        texto: 'Tomar distancia temporal para reflexionar y luego hablar con calma',
        cambiosEnAtributos: { cognitivo: 3, afectivo: 2, comunicativo: 2 },
        cambiosEnContexto: { familia: 1 },
        cambiosEnRelaciones: { PAREJA: 1 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.ADULTHOOD,
    titulo: 'El Emprendimiento Propio',
    descripcion: 'Llevas años soñando con tener tu propio negocio. Tienes una idea sólida y algo de ahorro. Tu empleo actual es estable pero no te hace feliz.',
    sortOrder: 7,
    requisitos: { minStats: { cognitivo: 55, etico: 45 } },
    opciones: [
      {
        texto: 'Dejar tu empleo y lanzarte al emprendimiento con todo',
        cambiosEnAtributos: { cognitivo: 5, afectivo: 4, fisico: -1 },
        cambiosEnContexto: { sociedad: 5, comunidad: 3 },
        cambiosEnRelaciones: { PAREJA: -1 },
        sortOrder: 1,
      },
      {
        texto: 'Mantener tu empleo y desarrollar tu negocio en paralelo',
        cambiosEnAtributos: { cognitivo: 4, etico: 3, fisico: -2 },
        cambiosEnContexto: { sociedad: 3, familia: 1 },
        cambiosEnRelaciones: { PAREJA: 2 },
        sortOrder: 2,
      },
      {
        texto: 'Guardar la idea y seguir en tu empleo estable',
        cambiosEnAtributos: { afectivo: -3, cognitivo: -1, etico: 1 },
        cambiosEnContexto: { familia: 2, sociedad: -1 },
        cambiosEnRelaciones: {},
        sortOrder: 3,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// VEJEZ (60+ años)
// Temáticas: legado, salud, sabiduría, familia extendida, trascendencia
// ═══════════════════════════════════════════════════════════════════════════════
const OLD_AGE: SeedDecision[] = [
  {
    etapa: RdvLifeStage.OLD_AGE,
    titulo: 'El Legado',
    descripcion: 'Te jubilaste hace poco. Tus nietos te preguntan qué fue lo más importante de tu vida. Reflexionas sobre todo lo que has vivido.',
    sortOrder: 1,
    opciones: [
      {
        texto: 'Contarles historias de tus experiencias y las lecciones aprendidas',
        cambiosEnAtributos: { comunicativo: 5, afectivo: 5, social: 4, etico: 3 },
        cambiosEnContexto: { familia: 5, comunidad: 3 },
        cambiosEnRelaciones: { HERMANOS: 4 },
        sortOrder: 1,
      },
      {
        texto: 'Escribir un diario o libro de memorias para que lo lean cuando crezcan',
        cambiosEnAtributos: { cognitivo: 5, comunicativo: 4, afectivo: 4 },
        cambiosEnContexto: { familia: 4, sociedad: 3 },
        cambiosEnRelaciones: {},
        sortOrder: 2,
      },
      {
        texto: 'Decirles que lo descubran por sí mismos, que la vida es experiencia',
        cambiosEnAtributos: { cognitivo: 2, social: -1, afectivo: -1 },
        cambiosEnContexto: { familia: -1 },
        cambiosEnRelaciones: {},
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.OLD_AGE,
    titulo: 'El Ejercicio a los 65',
    descripcion: 'El médico te recomienda hacer ejercicio suave diariamente. Hay un grupo de adultos mayores que practica tai chi en el parque todas las mañanas.',
    sortOrder: 2,
    opciones: [
      {
        texto: 'Unirte al grupo de tai chi y hacer nuevos amigos',
        cambiosEnAtributos: { fisico: 5, social: 5, afectivo: 4 },
        cambiosEnContexto: { comunidad: 4, amigos: 4 },
        cambiosEnRelaciones: { COMUNIDAD: 4, AMIGOS: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Hacer caminatas por tu cuenta cada mañana',
        cambiosEnAtributos: { fisico: 4, cognitivo: 2, afectivo: 2 },
        cambiosEnContexto: { comunidad: 1 },
        cambiosEnRelaciones: {},
        sortOrder: 2,
      },
      {
        texto: 'Preferir quedarte en casa viendo televisión',
        cambiosEnAtributos: { fisico: -4, social: -3, afectivo: -2 },
        cambiosEnContexto: { comunidad: -2 },
        cambiosEnRelaciones: {},
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.OLD_AGE,
    titulo: 'La Herencia',
    descripcion: 'Es momento de decidir cómo distribuir tus bienes entre tus hijos. Uno de ellos tiene más necesidad económica que los otros.',
    sortOrder: 3,
    opciones: [
      {
        texto: 'Repartir de forma equitativa entre todos tus hijos',
        cambiosEnAtributos: { etico: 5, cognitivo: 3, social: 2 },
        cambiosEnContexto: { familia: 3 },
        cambiosEnRelaciones: { HERMANOS: 3 },
        sortOrder: 1,
      },
      {
        texto: 'Darle más al hijo que más lo necesita',
        cambiosEnAtributos: { afectivo: 4, etico: 3, social: -1 },
        cambiosEnContexto: { familia: 1 },
        cambiosEnRelaciones: { HERMANOS: -1 },
        sortOrder: 2,
      },
      {
        texto: 'Donar una parte a caridad y repartir el resto',
        cambiosEnAtributos: { etico: 6, social: 4, afectivo: 3 },
        cambiosEnContexto: { comunidad: 5, sociedad: 4, familia: 1 },
        cambiosEnRelaciones: { COMUNIDAD: 5 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.OLD_AGE,
    titulo: 'El Nuevo Pasatiempo',
    descripcion: 'Ahora que tienes tiempo libre, puedes dedicarte a algo que siempre quisiste hacer pero nunca pudiste por el trabajo.',
    sortOrder: 4,
    opciones: [
      {
        texto: 'Aprender a pintar e inscribirte en un taller de arte',
        cambiosEnAtributos: { cognitivo: 5, afectivo: 4, comunicativo: 3 },
        cambiosEnContexto: { comunidad: 3, amigos: 3 },
        cambiosEnRelaciones: { COMUNIDAD: 3, AMIGOS: 2 },
        sortOrder: 1,
      },
      {
        texto: 'Ser voluntario enseñando a leer a niños de tu barrio',
        cambiosEnAtributos: { etico: 6, social: 5, comunicativo: 4, afectivo: 4 },
        cambiosEnContexto: { comunidad: 6, sociedad: 4 },
        cambiosEnRelaciones: { COMUNIDAD: 6 },
        sortOrder: 2,
      },
      {
        texto: 'Cultivar un huerto en tu jardín',
        cambiosEnAtributos: { fisico: 4, cognitivo: 3, afectivo: 3 },
        cambiosEnContexto: { familia: 2, comunidad: 2 },
        cambiosEnRelaciones: {},
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.OLD_AGE,
    titulo: 'La Tecnología',
    descripcion: 'Tus nietos quieren videollamarte pero no sabes usar bien el celular. Te ofrecen enseñarte, pero te da frustración no entender rápido.',
    sortOrder: 5,
    opciones: [
      {
        texto: 'Aceptar con paciencia y dejar que te enseñen paso a paso',
        cambiosEnAtributos: { cognitivo: 5, comunicativo: 4, afectivo: 4, social: 3 },
        cambiosEnContexto: { familia: 5 },
        cambiosEnRelaciones: { HERMANOS: 4 },
        sortOrder: 1,
      },
      {
        texto: 'Intentar aprenderlo solo viendo tutoriales en internet',
        cambiosEnAtributos: { cognitivo: 4, fisico: 1 },
        cambiosEnContexto: { sociedad: 2 },
        cambiosEnRelaciones: {},
        sortOrder: 2,
      },
      {
        texto: 'Decir que prefieres las visitas en persona',
        cambiosEnAtributos: { afectivo: 2, cognitivo: -2, social: -1, comunicativo: -2 },
        cambiosEnContexto: { familia: -1 },
        cambiosEnRelaciones: {},
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.OLD_AGE,
    titulo: 'La Reconciliación',
    descripcion: 'Hay un viejo amigo o familiar con quien dejaste de hablar hace años por una pelea. A estas alturas, ya ni recuerdas bien el motivo de la discusión.',
    sortOrder: 6,
    requisitos: { minStats: { afectivo: 50, etico: 50 } },
    opciones: [
      {
        texto: 'Dar el primer paso y llamarlo para pedir disculpas',
        cambiosEnAtributos: { afectivo: 6, etico: 5, comunicativo: 4, social: 4 },
        cambiosEnContexto: { familia: 4, amigos: 4 },
        cambiosEnRelaciones: { AMIGOS: 5 },
        sortOrder: 1,
      },
      {
        texto: 'Enviarle una carta expresando que lo extrañas',
        cambiosEnAtributos: { comunicativo: 5, afectivo: 5, etico: 3 },
        cambiosEnContexto: { amigos: 3 },
        cambiosEnRelaciones: { AMIGOS: 4 },
        sortOrder: 2,
      },
      {
        texto: 'Dejarlo así, ya pasó demasiado tiempo',
        cambiosEnAtributos: { afectivo: -3, social: -2, etico: -2 },
        cambiosEnContexto: { amigos: -2 },
        cambiosEnRelaciones: { AMIGOS: -2 },
        sortOrder: 3,
      },
    ],
  },
  {
    etapa: RdvLifeStage.OLD_AGE,
    titulo: 'El Hogar de Ancianos',
    descripcion: 'Tu familia sugiere que te mudes a una residencia para adultos mayores donde tendrás compañía y atención médica. Tú quieres seguir en tu casa.',
    sortOrder: 7,
    opciones: [
      {
        texto: 'Proponer que contraten a alguien que te ayude en casa',
        cambiosEnAtributos: { comunicativo: 4, cognitivo: 3, afectivo: 3, etico: 2 },
        cambiosEnContexto: { familia: 3, comunidad: 2 },
        cambiosEnRelaciones: { HERMANOS: 2 },
        sortOrder: 1,
      },
      {
        texto: 'Aceptar ir a la residencia para no ser una carga',
        cambiosEnAtributos: { etico: 3, social: 3, afectivo: -2 },
        cambiosEnContexto: { familia: 2, comunidad: 3 },
        cambiosEnRelaciones: { HERMANOS: 2, COMUNIDAD: 3 },
        sortOrder: 2,
      },
      {
        texto: 'Negarte rotundamente y decir que puedes valerte por ti mismo',
        cambiosEnAtributos: { fisico: 1, afectivo: -1, social: -2, comunicativo: -2 },
        cambiosEnContexto: { familia: -3 },
        cambiosEnRelaciones: { HERMANOS: -3 },
        sortOrder: 3,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL DE SEED
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
  console.log('🎮 ═══════════════════════════════════════════════════════');
  console.log('🎮  SEED DE DECISIONES — RUTAS DE VIDA');
  console.log('🎮 ═══════════════════════════════════════════════════════\n');

  const allStages: { name: string; stage: RdvLifeStage; decisions: SeedDecision[] }[] = [
    { name: 'Primera Infancia', stage: RdvLifeStage.EARLY_CHILDHOOD, decisions: EARLY_CHILDHOOD },
    { name: 'Niñez', stage: RdvLifeStage.CHILDHOOD, decisions: CHILDHOOD },
    { name: 'Adolescencia', stage: RdvLifeStage.ADOLESCENCE, decisions: ADOLESCENCE },
    { name: 'Juventud', stage: RdvLifeStage.YOUTH, decisions: YOUTH },
    { name: 'Adultez', stage: RdvLifeStage.ADULTHOOD, decisions: ADULTHOOD },
    { name: 'Vejez', stage: RdvLifeStage.OLD_AGE, decisions: OLD_AGE },
  ];

  let totalCreated = 0;

  for (const { name, stage, decisions } of allStages) {
    // Verificar si ya existen decisiones para esta etapa
    const existingCount = await prisma.rdvDecision.count({
      where: { etapa: stage, isActive: true },
    });

    if (existingCount >= decisions.length) {
      console.log(`⚠️  ${name}: Ya existen ${existingCount} decisiones activas. Omitiendo...`);
      continue;
    }

    console.log(`\n🌱 Creando decisiones para: ${name} (${decisions.length} decisiones)...`);

    for (const d of decisions) {
      // Verificar si ya existe por título y etapa
      const exists = await prisma.rdvDecision.findFirst({
        where: { titulo: d.titulo, etapa: d.etapa },
      });

      if (exists) {
        console.log(`   ⏭️  "${d.titulo}" ya existe.`);
        continue;
      }

      await prisma.rdvDecision.create({
        data: {
          etapa: d.etapa,
          titulo: d.titulo,
          descripcion: d.descripcion,
          sortOrder: d.sortOrder,
          requisitos: d.requisitos || {},
          options: {
            create: d.opciones.map((opt) => ({
              texto: opt.texto,
              cambiosEnAtributos: opt.cambiosEnAtributos || {},
              cambiosEnContexto: opt.cambiosEnContexto || {},
              cambiosEnRelaciones: opt.cambiosEnRelaciones || {},
              sortOrder: opt.sortOrder,
            })),
          },
        },
      });

      console.log(`   ✅ "${d.titulo}"`);
      totalCreated++;
    }
  }

  console.log(`\n🎮 ═══════════════════════════════════════════════════════`);
  console.log(`🎮  RESULTADO: ${totalCreated} decisiones nuevas creadas`);
  console.log(`🎮 ═══════════════════════════════════════════════════════\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed de decisiones:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
