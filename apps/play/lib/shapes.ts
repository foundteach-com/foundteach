export type ShapeType =
  | 'triangle'
  | 'square'
  | 'pentagon'
  | 'hexagon'
  | 'cube'
  | 'tetrahedron'
  | 'square-pyramid'
  | 'octahedron';

export interface ShapeDef {
  type: ShapeType;
  name: string;
  dimension: '2D' | '3D';
  value: number;   // sides (2D) or faces (3D)
  angles: number;  // vertices / angles of the shape
}

export const SHAPES: ShapeDef[] = [
  // 2D – value = lados, angles = ángulos interiores (same as sides for 2D polygons)
  { type: 'triangle',       name: 'Triángulo',        dimension: '2D', value: 3,  angles: 3  },
  { type: 'square',         name: 'Cuadrado',          dimension: '2D', value: 4,  angles: 4  },
  { type: 'pentagon',       name: 'Pentágono',         dimension: '2D', value: 5,  angles: 5  },
  { type: 'hexagon',        name: 'Hexágono',          dimension: '2D', value: 6,  angles: 6  },
  // 3D – value = caras, angles = vértices
  { type: 'tetrahedron',    name: 'Tetraedro',         dimension: '3D', value: 4,  angles: 4  },
  { type: 'square-pyramid', name: 'Pirámide Cuadrada', dimension: '3D', value: 5,  angles: 5  },
  { type: 'cube',           name: 'Cubo',              dimension: '3D', value: 6,  angles: 8  },
  { type: 'octahedron',     name: 'Octaedro',          dimension: '3D', value: 8,  angles: 6  },
];
