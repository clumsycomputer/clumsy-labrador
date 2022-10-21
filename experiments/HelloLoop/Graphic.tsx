import React from "react";
import { ReactNode } from "react";

export interface GraphicProps {
  graphicRectangle: Rectangle;
  children: ReactNode;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function Graphic(props: GraphicProps) {
  const { graphicRectangle, children } = props;
  return (
    <svg
      viewBox={`${graphicRectangle.x} ${graphicRectangle.y} ${graphicRectangle.width} ${graphicRectangle.height}`}
    >
      {/* <g transform="scale(1,-1)"> */}
      <rect
        x={graphicRectangle.x}
        y={graphicRectangle.y}
        width={graphicRectangle.width}
        height={graphicRectangle.height}
        fill={"black"}
      />
      {children}
      {/* </g> */}
    </svg>
  );
}
