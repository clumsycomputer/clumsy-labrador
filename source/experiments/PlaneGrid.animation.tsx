import { AnimationModule } from "clumsy-graphics";
import React from "react";
import { CellGraphic, WorldCellPoint } from "../library/CellGraphic";

const PlaneGridAnimationModule: AnimationModule = {
  moduleName: "Plane-Grid",
  getFrameDescription: getPlaneGridFrameDescription,
  frameCount: 96,
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
  const frameStamp = frameIndex / frameCount;
  const frameAngle = 2 * Math.PI * frameStamp;
  const gridCenter: Vector3 = [
    8 * Math.cos(frameAngle),
    8 * Math.sin(frameAngle),
    -4,
  ];
  const originalNormal: Vector3 = [0, 0, 1];
  const gridNormal: Vector3 = normal([
    -gridCenter[0],
    -gridCenter[1],
    -gridCenter[2],
  ]);
  const gridSize = 10;
  const gridResolution = 24;
  const cellSize = gridSize / gridResolution;
  const gridRectX = -gridSize / 2;
  const gridRectY = -gridSize / 2;
  const gridPoints: Array<WorldCellPoint> = [];
  const rotationAxis = crossProduct(originalNormal, gridNormal);
  const rotationAngle = Math.acos(
    dotProduct(originalNormal, gridNormal) /
      (magnitude(originalNormal) * magnitude(gridNormal))
  );
  for (let rowIndex = 0; rowIndex < gridResolution; rowIndex++) {
    const cellY = rowIndex * cellSize + cellSize / 2 + gridRectX;
    for (let columnIndex = 0; columnIndex < gridResolution; columnIndex++) {
      const cellX = columnIndex * cellSize + cellSize / 2 + gridRectY;
      const rotatedCellVector = rotateVector(rotationAxis, rotationAngle, [
        cellX,
        cellY,
        0,
      ]);
      gridPoints.push([
        rotatedCellVector[0] + gridCenter[0],
        rotatedCellVector[1] + gridCenter[1],
        rotatedCellVector[2] + gridCenter[2],
        cellSize / 2,
        "red",
      ]);
    }
  }
  return (
    <CellGraphic
      cameraDepth={-10}
      lightDepth={30}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      worldCellPoints={[
        ...gridPoints,
        // [...targetCell, 1, "green"]
      ]}
    />
  );
}

type Vector3 = [number, number, number];

function crossProduct(a: Vector3, b: Vector3): Vector3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function dotProduct(a: Vector3, b: Vector3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function magnitude(a: Vector3): number {
  return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
}

function normal(a: Vector3): Vector3 {
  const mag = magnitude(a);
  return [a[0] / mag, a[1] / mag, a[2] / mag];
}

function rotateVector(
  rotationAxis: Vector3,
  rotationAngle: number,
  baseVector: Vector3
): Vector3 {
  const rotationCosine = Math.cos(rotationAngle);
  const rotationSine = Math.sin(rotationAngle);
  const oneMinusRotationCosine = 1 - rotationCosine;
  return [
    (rotationAxis[0] * rotationAxis[0] * oneMinusRotationCosine +
      rotationCosine) *
      baseVector[0] +
      (rotationAxis[0] * rotationAxis[1] * oneMinusRotationCosine -
        rotationAxis[2] * rotationSine) *
        baseVector[1] +
      (rotationAxis[0] * rotationAxis[2] * oneMinusRotationCosine +
        rotationAxis[1] * rotationSine) *
        baseVector[2],
    (rotationAxis[0] * rotationAxis[1] * oneMinusRotationCosine +
      rotationAxis[2] * rotationSine) *
      baseVector[0] +
      (rotationAxis[1] * rotationAxis[1] * oneMinusRotationCosine +
        rotationCosine) *
        baseVector[1] +
      (rotationAxis[1] * rotationAxis[2] * oneMinusRotationCosine -
        rotationAxis[0] * rotationSine) *
        baseVector[2],
    (rotationAxis[0] * rotationAxis[2] * oneMinusRotationCosine -
      rotationAxis[1] * rotationSine) *
      baseVector[0] +
      (rotationAxis[1] * rotationAxis[2] * oneMinusRotationCosine +
        rotationAxis[0] * rotationSine) *
        baseVector[1] +
      (rotationAxis[2] * rotationAxis[2] * oneMinusRotationCosine +
        rotationCosine) *
        baseVector[2],
  ];
}
