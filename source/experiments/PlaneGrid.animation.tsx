import { AnimationModule } from "clumsy-graphics";
import React from "react";
import { CellGraphic, WorldCellPoint } from "../library/CellGraphic";

const PlaneGridAnimationModule: AnimationModule = {
  moduleName: "Plane-Grid",
  getFrameDescription: getPlaneGridFrameDescription,
  frameCount: 24,
  frameSize: {
    width: 1024,
    height: 1024,
  },
  animationSettings: {
    frameRate: 10,
    constantRateFactor: 1,
  },
};

export default PlaneGridAnimationModule;

interface GetPlaneGridFrameDescriptionApi {
  frameCount: number;
  frameIndex: number;
}

async function getPlaneGridFrameDescription(
  api: GetPlaneGridFrameDescriptionApi
) {
  const { frameCount, frameIndex } = api;
  const gridRect = { x: -5, y: -5, width: 10, height: 10 };
  const gridResolution = 12;
  const gridPoints: Array<WorldCellPoint> = [];
  const cellSize = Math.min(gridRect.width, gridRect.height) / gridResolution;
  for (let rowIndex = 0; rowIndex < gridResolution; rowIndex++) {
    const cellY =
      rowIndex * (gridRect.height / gridResolution) + gridRect.y + cellSize / 2;
    for (let columnIndex = 0; columnIndex < gridResolution; columnIndex++) {
      const cellX =
        columnIndex * (gridRect.width / gridResolution) +
        gridRect.x +
        cellSize / 2;
      gridPoints.push([cellX, cellY, 0, cellSize / 3, "red"]);
    }
  }
  return (
    <CellGraphic
      cameraDepth={-5}
      lightDepth={30}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      worldCellPoints={gridPoints}
    />
  );
}
