declare module "react-simple-maps" {
  import type { ReactNode, CSSProperties } from "react";

  interface GeographyType {
    rsmKey: string;
    properties: Record<string, unknown>;
    geometry: {
      type: string;
      coordinates: unknown[];
    };
  }

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: {
      scale?: number;
      center?: [number, number];
      rotate?: [number, number, number];
    };
    width?: number;
    height?: number;
    style?: CSSProperties;
    children?: ReactNode;
  }

  interface GeographiesProps {
    geography: string | object | unknown[];
    children: (props: {
      geographies: GeographyType[];
      outline: string | null;
      borders: string | null;
      path: unknown;
      projection: unknown;
    }) => ReactNode;
    parseGeographies?: (geos: unknown[]) => unknown[];
  }

  interface GeographyProps {
    geography: GeographyType;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: {
      default?: CSSProperties;
      hover?: CSSProperties;
      pressed?: CSSProperties;
    };
    onClick?: () => void;
  }

  interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
  }

  interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: [[number, number], [number, number]];
    onMoveStart?: (event: unknown, transform: unknown) => void;
    onMove?: (event: unknown, transform: unknown) => void;
    onMoveEnd?: (event: unknown, transform: unknown) => void;
    className?: string;
    children?: ReactNode;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;
  export const Geographies: React.FC<GeographiesProps>;
  export const Geography: React.FC<GeographyProps>;
  export const Marker: React.FC<MarkerProps>;
  export const ZoomableGroup: React.FC<ZoomableGroupProps>;
}
