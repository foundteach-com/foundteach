export type ShapeType = 'triangle' | 'square' | 'pentagon' | 'hexagon' | 'cube' | 'tetrahedron' | 'square-pyramid' | 'octahedron';

export interface ShapeDef {
  type: ShapeType;
  name: string;
  dimension: '2D' | '3D';
  value: number; // sides or faces
}

export const SHAPES: ShapeDef[] = [
  { type: 'triangle', name: 'Triángulo', dimension: '2D', value: 3 },
  { type: 'square', name: 'Cuadrado', dimension: '2D', value: 4 },
  { type: 'pentagon', name: 'Pentágono', dimension: '2D', value: 5 },
  { type: 'hexagon', name: 'Hexágono', dimension: '2D', value: 6 },
  { type: 'tetrahedron', name: 'Tetraedro', dimension: '3D', value: 4 },
  { type: 'square-pyramid', name: 'Pirámide Cuadrada', dimension: '3D', value: 5 },
  { type: 'cube', name: 'Cubo', dimension: '3D', value: 6 },
  { type: 'octahedron', name: 'Octaedro', dimension: '3D', value: 8 },
];
