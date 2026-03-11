import React from 'react';
import { ShapeType } from '@/lib/shapes';

interface ShapeIconProps extends React.SVGProps<SVGSVGElement> {
  type: ShapeType;
}

export function ShapeIcon({ type, className, ...props }: ShapeIconProps) {
  const baseProps = {
    viewBox: "0 0 100 100",
    className: className,
    ...props
  };

  switch (type) {
    case 'triangle':
      return (
        <svg {...baseProps}>
          <polygon points="50,15 85,85 15,85" fill="currentColor" />
        </svg>
      );
    case 'square':
      return (
        <svg {...baseProps}>
          <rect x="20" y="20" width="60" height="60" fill="currentColor" rx="4" />
        </svg>
      );
    case 'pentagon':
      return (
        <svg {...baseProps}>
          <polygon points="50,15 85,40 70,85 30,85 15,40" fill="currentColor" strokeLinejoin="round" />
        </svg>
      );
    case 'hexagon':
      return (
        <svg {...baseProps}>
          <polygon points="50,15 85,35 85,65 50,85 15,65 15,35" fill="currentColor" strokeLinejoin="round" />
        </svg>
      );
    case 'cube':
      return (
        <svg {...baseProps}>
          <g stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
            <polygon points="30,35 70,35 70,75 30,75" fill="currentColor" fillOpacity="0.2" />
            <polygon points="30,35 50,15 90,15 70,35" fill="currentColor" fillOpacity="0.4" />
            <polygon points="70,35 90,15 90,55 70,75" fill="currentColor" fillOpacity="0.6" />
          </g>
        </svg>
      );
    case 'tetrahedron':
      return (
        <svg {...baseProps}>
          <g stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
            <polygon points="50,15 85,85 50,65" fill="currentColor" fillOpacity="0.6" />
            <polygon points="50,15 15,85 50,65" fill="currentColor" fillOpacity="0.3" />
            <polygon points="15,85 85,85 50,65" fill="currentColor" fillOpacity="0.1" />
          </g>
        </svg>
      );
    case 'square-pyramid':
      return (
        <svg {...baseProps}>
          <g stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
            <polygon points="50,15 85,70 50,90" fill="currentColor" fillOpacity="0.6" />
            <polygon points="50,15 15,70 50,90" fill="currentColor" fillOpacity="0.3" />
            <polygon points="15,70 85,70 50,90" fill="currentColor" fillOpacity="0.1" />
          </g>
        </svg>
      );
    case 'octahedron':
      return (
        <svg {...baseProps}>
          <g stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
            <polygon points="50,10 85,50 50,65" fill="currentColor" fillOpacity="0.6" />
            <polygon points="50,10 15,50 50,65" fill="currentColor" fillOpacity="0.3" />
            <polygon points="50,90 85,50 50,65" fill="currentColor" fillOpacity="0.4" />
            <polygon points="50,90 15,50 50,65" fill="currentColor" fillOpacity="0.2" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}
