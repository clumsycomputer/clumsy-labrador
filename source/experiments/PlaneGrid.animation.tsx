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
  const gridOrientation: Vector3 = [0, 1, 0.5];
  const gridCenter: Vector3 = [0, 0, 0];
  const gridSize = 15;
  const gridResolution = 48;
  const cellSize = gridSize / gridResolution;
  const gridRectX = gridCenter[0] - gridSize / 2;
  const gridRectY = gridCenter[1] - gridSize / 2;
  const gridPoints: Array<WorldCellPoint> = [];
  const getRotatedPlaneVector = getGetRotatedPlaneVector({
    planeOrientation: gridOrientation,
    planeCenter: gridCenter,
  });
  for (let rowIndex = 0; rowIndex < gridResolution; rowIndex++) {
    const cellY = rowIndex * cellSize + gridRectY + cellSize / 2;
    for (let columnIndex = 0; columnIndex < gridResolution; columnIndex++) {
      const cellX = columnIndex * cellSize + gridRectX + cellSize / 2;
      gridPoints.push([
        ...getRotatedPlaneVector([cellX, cellY, gridCenter[2]]),
        cellSize / 2,
        "red",
      ]);
    }
  }
  return (
    <CellGraphic
      cameraDepth={-15}
      lightDepth={30}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      worldCellPoints={gridPoints}
    />
  );
}

type Vector3 = [number, number, number];

interface GetGetRotatedPlaneVectorApi {
  planeCenter: Vector3;
  planeOrientation: Vector3;
}

function getGetRotatedPlaneVector(api: GetGetRotatedPlaneVectorApi) {
  const { planeOrientation, planeCenter } = api;
  const unitVectorZ: Vector3 = [
    0, // planeCenter[0],
    0, // planeCenter[1],
    1, // planeCenter[2] + 1,
  ];
  const rotationAxis = getCrossProduct({
    vectorA: unitVectorZ,
    vectorB: planeOrientation,
  });
  const normalizedRotationAxis = getNormalizedVector({
    someVector: rotationAxis,
  });
  const rotationAngle = Math.acos(
    getDotProduct({
      vectorA: unitVectorZ,
      vectorB: planeOrientation,
    }) /
      (getVectorMagnitude({
        someVector: unitVectorZ,
      }) *
        getVectorMagnitude({
          someVector: planeOrientation,
        }))
  );
  return (someVector: Vector3): Vector3 => {
    const rotationCosine = Math.cos(rotationAngle);
    const vectorA = [
      someVector[0] * rotationCosine,
      someVector[1] * rotationCosine,
      someVector[2] * rotationCosine,
    ];
    const vectorBA = getCrossProduct({
      vectorA: normalizedRotationAxis,
      vectorB: someVector,
    });
    const rotationSine = Math.sin(rotationAngle);
    const vectorB = [
      vectorBA[0] * rotationSine,
      vectorBA[1] * rotationSine,
      vectorBA[2] * rotationSine,
    ];
    const dotCA = getDotProduct({
      vectorA: normalizedRotationAxis,
      vectorB: someVector,
    });
    const oneMinusRotationCosine = 1 - rotationCosine;
    const vectorC = [
      normalizedRotationAxis[0] * dotCA * oneMinusRotationCosine,
      normalizedRotationAxis[1] * dotCA * oneMinusRotationCosine,
      normalizedRotationAxis[2] * dotCA * oneMinusRotationCosine,
    ];
    return [
      vectorA[0] + vectorB[0] + vectorC[0],
      vectorA[1] + vectorB[1] + vectorC[1],
      vectorA[2] + vectorB[2] + vectorC[2],
    ];
  };
}

interface GetCrossProductApi {
  vectorA: Vector3;
  vectorB: Vector3;
}

function getCrossProduct(api: GetCrossProductApi): Vector3 {
  const { vectorA, vectorB } = api;
  return [
    vectorA[1] * vectorB[2] - vectorA[2] * vectorB[1],
    vectorA[2] * vectorB[0] - vectorA[0] * vectorB[2],
    vectorA[0] * vectorB[1] - vectorA[1] * vectorB[0],
  ];
}

interface GetNormalizedVectorApi {
  someVector: Vector3;
}

function getNormalizedVector(api: GetNormalizedVectorApi): Vector3 {
  const { someVector } = api;
  const vectorMagnitude = getVectorMagnitude({
    someVector,
  });
  return vectorMagnitude === 0
    ? [...someVector]
    : [
        someVector[0] / vectorMagnitude,
        someVector[1] / vectorMagnitude,
        someVector[2] / vectorMagnitude,
      ];
}

interface GetDotProductApi {
  vectorA: Vector3;
  vectorB: Vector3;
}

function getDotProduct(api: GetDotProductApi) {
  const { vectorA, vectorB } = api;
  return (
    vectorA[0] * vectorB[0] + vectorA[1] * vectorB[1] + vectorA[2] * vectorB[2]
  );
}

interface GetVectorMagnitudeApi {
  someVector: Vector3;
}

function getVectorMagnitude(api: GetVectorMagnitudeApi) {
  const { someVector } = api;
  return Math.sqrt(
    someVector[0] * someVector[0] +
      someVector[1] * someVector[1] +
      someVector[2] * someVector[2]
  );
}
