import { AnimationModule } from "clumsy-graphics";
import {
  AlignedRhythmStructure,
  getLoopCosine,
  getLoopPendulum,
  getLoopPoint,
  getLoopSine,
  getNearestPrimes,
  getPhasedRhythmMap,
  getPrimeContainer,
  getRhythmMap,
  getRhythmSlotWeights,
  LoopStructure,
  _getPrimesRangeInclusive,
} from "clumsy-math";
import getColormap from "colormap";
import React from "react";
import { CellGraphic, GenericWorldCellPoint } from "./CellGraphic";

const HelloLoopAnimationModule: AnimationModule = {
  moduleName: "Hello-Loop",
  getFrameDescription: getLoopFrameDescription,
  frameCount: 32,
  frameSize: {
    width: 1024,
    height: 1024,
  },
  animationSettings: {
    frameRate: 9,
    constantRateFactor: 1,
  },
};

export default HelloLoopAnimationModule;

interface GetLoopFrameDescriptionApi {
  frameCount: number;
  frameIndex: number;
}

async function getLoopFrameDescription(api: GetLoopFrameDescriptionApi) {
  const { frameCount, frameIndex } = api;
  const frameStamp = frameIndex / frameCount;
  const loopsoidPointsA = getLoopsoidPoints({
    frameStamp,
  });
  return (
    <CellGraphic
      cameraDepth={-4}
      lightDepth={10}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      worldCellPoints={loopsoidPointsA}
    />
  );
}

interface GetLoopsoidPointsApi {
  frameStamp: number;
}

function getLoopsoidPoints(api: GetLoopsoidPointsApi) {
  const { frameStamp } = api;
  const baseLoopStructure: LoopStructure = {
    structureType: "initial",
    loopBase: {
      radius: 1,
      center: [0, 0],
    },
    loopRotation: 0,
    subStructure: {
      structureType: "terminal",
      relativeSubRadius: 0.7,
      relativeSubDepth: 0.5,
      subPhase: Math.PI / 3,
      subOrientation: 0,
    },
  };
  const loopStructureA: LoopStructure = {
    structureType: "initial",
    loopBase: {
      radius: 1,
      center: [0, 0],
    },
    loopRotation: 0,
    subStructure: {
      structureType: "interposed",
      relativeSubRadius: 0.85,
      relativeSubDepth: 1,
      subPhase:
        (Math.PI / 5) *
          getLoopSine({
            someLoopPoint: getLoopPoint({
              inputAngle: 2 * Math.PI * frameStamp,
              someLoopStructure: baseLoopStructure,
            }),
          }) +
        Math.PI / 5,
      subOrientation: 0,
      loopRotation: 0,
      subStructure: {
        structureType: "terminal",
        relativeSubRadius: 0.7,
        relativeSubDepth: 1,
        subPhase:
          (Math.PI / 3) *
            getLoopSine({
              someLoopPoint: getLoopPoint({
                inputAngle: 2 * Math.PI * frameStamp,
                someLoopStructure: baseLoopStructure,
              }),
            }) +
          Math.PI / 3,
        subOrientation: 0,
      },
    },
  };
  const pointCount = getPrimeContainer(17);
  const loopsoidColormap = getColormap({
    nshades: pointCount,
    colormap: "warm",
    format: "hex",
    alpha: 1,
  });
  // const rhythmDensity = getPrimeContainer(8);
  const rhythmDensity = getNearestPrimes(pointCount / 2)[1]!;
  const densityPrimes = _getPrimesRangeInclusive({
    maxNumber: pointCount,
    minNumber: rhythmDensity,
  });
  const loopsoidPoints: Array<GenericWorldCellPoint> = [];
  for (
    let densityIndex = 0;
    densityIndex < densityPrimes.length;
    densityIndex++
  ) {
    const loopsoidRhythmStructure: AlignedRhythmStructure = {
      structureType: "initial",
      rhythmResolution: pointCount,
      subStructure: {
        structureType: "terminal",
        rhythmDensity: densityPrimes[densityIndex],
        rhythmOrientation: 0,
      },
      // subStructure: getRhythmSubStructure({
      //   terminalDensity: rhythmDensity,
      //   interposedDensities: densityPrimes.reverse(),
      //   getRhythmOrientation: (density, index) => index,
      // }),
    };
    const baseRhythmMap = getRhythmMap(loopsoidRhythmStructure);
    const pointWeights = getRhythmSlotWeights(
      baseRhythmMap.rhythmPoints.map((someRhythmPoint) =>
        getPhasedRhythmMap(baseRhythmMap, someRhythmPoint)
      )
    );
    for (let pointIndex = 0; pointIndex < pointCount; pointIndex++) {
      const pointWeight = pointWeights[pointIndex];
      const pointScalar = pointWeight / pointCount;
      const basePoint = [
        getLoopCosine({
          someLoopPoint: getLoopPoint({
            inputAngle: ((2 * Math.PI) / pointCount) * pointIndex,
            someLoopStructure: loopStructureA,
          }),
        }) - 1,
        getLoopSine({
          someLoopPoint: getLoopPoint({
            inputAngle:
              ((2 * Math.PI) / pointCount) * pointIndex +
              2 * Math.PI * frameStamp,
            someLoopStructure: loopStructureA,
          }),
        }) + 1,
        getLoopPendulum({
          someLoopPoint: getLoopPoint({
            inputAngle:
              ((2 * Math.PI) / pointCount) * pointIndex +
              2 * Math.PI * frameStamp,
            someLoopStructure: loopStructureA,
          }),
        }) +
          0.5 *
            getLoopSine({
              someLoopPoint: getLoopPoint({
                inputAngle: 2 * ((2 * Math.PI) / pointCount) * pointIndex,
                someLoopStructure: baseLoopStructure,
              }),
            }),
        0.05,
        loopsoidColormap[pointWeight],
      ];
      loopsoidPoints.push([
        basePoint[0] + pointScalar * basePoint[0],
        basePoint[1] + pointScalar * basePoint[1],
        basePoint[2] + pointScalar * basePoint[2],
        basePoint[3],
        basePoint[4],
      ]);
    }
  }
  return loopsoidPoints;
}

interface GetRhythmSubStructureApi {
  terminalDensity: number;
  interposedDensities: Array<number>;
  getRhythmOrientation: (density: number, index: number) => number;
  densityIndex?: number;
}

function getRhythmSubStructure(
  api: GetRhythmSubStructureApi
): AlignedRhythmStructure["subStructure"] {
  const {
    interposedDensities,
    getRhythmOrientation,
    densityIndex = 0,
    terminalDensity,
  } = api;
  const [currentInterposedDenisty, ...nextInterposedDensities] =
    interposedDensities;
  return currentInterposedDenisty
    ? {
        structureType: "interposed",
        rhythmDensity: currentInterposedDenisty,
        rhythmOrientation: getRhythmOrientation(
          currentInterposedDenisty,
          densityIndex
        ),
        subStructure: getRhythmSubStructure({
          getRhythmOrientation,
          terminalDensity,
          interposedDensities: nextInterposedDensities,
          densityIndex: densityIndex + 1,
        }),
      }
    : {
        structureType: "terminal",
        rhythmDensity: terminalDensity,
        rhythmOrientation: getRhythmOrientation(
          currentInterposedDenisty,
          densityIndex
        ),
      };
}
