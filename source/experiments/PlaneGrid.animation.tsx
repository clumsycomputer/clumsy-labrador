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
  const gridCenter = [0, 0, 0];
  const gridSize = 10;
  const gridResolution = 12;
  const cellSize = gridSize / gridResolution;
  const gridRectX = gridCenter[0] - gridSize / 2;
  const gridRectY = gridCenter[1] - gridSize / 2;
  const gridPoints: Array<WorldCellPoint> = [];
  for (let rowIndex = 0; rowIndex < gridResolution; rowIndex++) {
    const cellY = rowIndex * cellSize + gridRectY + cellSize / 2;
    for (let columnIndex = 0; columnIndex < gridResolution; columnIndex++) {
      const cellX = columnIndex * cellSize + gridRectX + cellSize / 2;
      gridPoints.push([cellX, cellY, gridCenter[2], cellSize / 3, "red"]);
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
