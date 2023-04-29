import React from "react";
import Color from "color";

export interface CellGraphicProps {
  cameraDepth: number;
  perspectiveVerticalFieldOfViewAngle: number;
  perspectiveDepthNear: number;
  perspectiveDepthFar: number;
  lightDepth: number;
  worldCellPoints: Array<GenericWorldCellPoint>;
}

export interface ViewRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type WorldCellPoint = [
  x: number,
  y: number,
  z: number,
  size: number,
  color: string
];

export type GenericWorldCellPoint = [...WorldCellPoint, ...Array<unknown>];

type GraphicCellPoint = [...WorldCellPoint, number];

export function CellGraphic(props: CellGraphicProps) {
  const {
    worldCellPoints,
    cameraDepth,
    perspectiveDepthNear,
    perspectiveDepthFar,
    perspectiveVerticalFieldOfViewAngle,
    lightDepth,
  } = props;
  const { perspectiveCellPoints } = getPerspectiveCellPoints({
    worldCellPoints,
    cameraDepth,
    perspectiveDepthNear,
    perspectiveDepthFar,
    perspectiveVerticalFieldOfViewAngle,
  });
  const viewRectangle = { x: -1, y: -1, width: 2, height: 2 };
  return (
    <svg
      viewBox={`${viewRectangle.x} ${viewRectangle.y} ${viewRectangle.width} ${viewRectangle.height}`}
    >
      <g transform="scale(1,-1)">
        <rect
          x={viewRectangle.x}
          y={viewRectangle.y}
          width={viewRectangle.width}
          height={viewRectangle.height}
          fill={"black"}
        />
        {perspectiveCellPoints
          .sort((pointA, pointB) => pointA[2] - pointB[2])
          .map(
            ([
              perspectiveCellX,
              perspectiveCellY,
              perspectiveCellZ,
              perspectiveCellSize,
              perspectiveCellColor,
              perspectiveCellDistance,
            ]) => {
              const graphicCellSize =
                perspectiveCellSize / perspectiveCellDistance;
              const halfGraphiclCellSize = graphicCellSize / 2;
              return perspectiveCellDistance >= perspectiveDepthNear &&
                perspectiveCellDistance <= perspectiveDepthFar ? (
                <rect
                  x={
                    perspectiveCellX / perspectiveCellDistance -
                    halfGraphiclCellSize
                  }
                  y={
                    perspectiveCellY / perspectiveCellDistance -
                    halfGraphiclCellSize
                  }
                  width={graphicCellSize}
                  height={graphicCellSize}
                  fill={new Color(perspectiveCellColor).darken(
                    perspectiveCellDistance / lightDepth
                  )}
                />
              ) : null;
            }
          )}
      </g>
    </svg>
  );
}

interface GetPerspectiveCellPointsApi
  extends Pick<
    CellGraphicProps,
    | "cameraDepth"
    | "perspectiveDepthNear"
    | "perspectiveDepthFar"
    | "perspectiveVerticalFieldOfViewAngle"
    | "worldCellPoints"
  > {}

function getPerspectiveCellPoints(api: GetPerspectiveCellPointsApi) {
  const {
    worldCellPoints,
    cameraDepth,
    perspectiveDepthNear,
    perspectiveDepthFar,
    perspectiveVerticalFieldOfViewAngle,
  } = api;
  const verticalFieldOfViewScalar =
    1 / Math.tan(perspectiveVerticalFieldOfViewAngle / 2);
  const perspectiveScalarX = verticalFieldOfViewScalar;
  const perspectiveScalarY = verticalFieldOfViewScalar;
  const perspectiveScalarSize = verticalFieldOfViewScalar;
  const perspectiveDepthDelta = perspectiveDepthNear - perspectiveDepthFar;
  const perspectiveScalarZ = -(
    (perspectiveDepthFar + perspectiveDepthNear) /
    perspectiveDepthDelta
  );
  const perspectiveTranslationZ = -(
    (2 * perspectiveDepthFar * perspectiveDepthNear) /
    perspectiveDepthDelta
  );
  const perspectiveScalarDistance = -1;
  const perspectiveCellPoints: Array<GraphicCellPoint> = [];
  for (let pointIndex = 0; pointIndex < worldCellPoints.length; pointIndex++) {
    perspectiveCellPoints.push(
      getPerspectiveCellPoint(
        cameraDepth,
        perspectiveScalarX,
        perspectiveScalarY,
        perspectiveScalarZ,
        perspectiveTranslationZ,
        perspectiveScalarSize,
        perspectiveScalarDistance,
        worldCellPoints[pointIndex]
      )
    );
  }
  return { perspectiveCellPoints };
}

function getPerspectiveCellPoint(
  cameraDepth: GetPerspectiveCellPointsApi["cameraDepth"],
  perspectiveScalarX: number,
  perspectiveScalarY: number,
  perspectiveScalarZ: number,
  perspectiveTranslationZ: number,
  perspectiveScalarSize: number,
  perspectiveScalarDistance: number,
  someWorldCellPoint: GetPerspectiveCellPointsApi["worldCellPoints"][number]
): GraphicCellPoint {
  const pointResult: GraphicCellPoint = [
    someWorldCellPoint[0],
    someWorldCellPoint[1],
    someWorldCellPoint[2],
    someWorldCellPoint[3],
    someWorldCellPoint[4],
    1,
  ];
  pointResult[2] = pointResult[2] + cameraDepth;
  const cameraCellZ = pointResult[2];
  pointResult[0] = perspectiveScalarX * pointResult[0];
  pointResult[1] = perspectiveScalarY * pointResult[1];
  pointResult[2] =
    perspectiveScalarZ * pointResult[2] + perspectiveTranslationZ;
  pointResult[3] = perspectiveScalarSize * pointResult[3];
  pointResult[5] = perspectiveScalarDistance * cameraCellZ;
  return pointResult;
}
