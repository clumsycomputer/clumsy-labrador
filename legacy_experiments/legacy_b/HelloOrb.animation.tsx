import { AnimationModule } from "clumsy-graphics";
import {
  AlignedRhythmStructure,
  getLoopCosine,
  getLoopPendulum,
  getLoopPoint,
  getLoopSine,
  getPhasedRhythmMap,
  getPrimeContainer,
  getPrimesRangeInclusive,
  getRhythmGroup,
  getRhythmMap,
  getRhythmSlotWeights,
  LoopStructure,
  Rhythm,
  RhythmGroupBaseStructure,
  RhythmMap,
} from "clumsy-math";
import getColormap from "colormap";
import React from "react";
import { CellGraphic, WorldCellPoint } from "./CellGraphic";

const RESOLUTION_CONTAINER_INDEX = 24;

const HelloOrbAnimationModule: AnimationModule = {
  moduleName: "Hello-Orb",
  getFrameDescription: getOrbFrameDescription,
  frameCount: getPrimeContainer(RESOLUTION_CONTAINER_INDEX),
  frameSize: {
    width: 1080,
    height: 1080,
  },
  animationSettings: {
    frameRate: 10,
    constantRateFactor: 1,
  },
};

export default HelloOrbAnimationModule;

interface GetOrbFrameDescriptionApi {
  frameCount: number;
  frameIndex: number;
}

async function getOrbFrameDescription(api: GetOrbFrameDescriptionApi) {
  const { frameCount, frameIndex } = api;
  const frameStamp = frameIndex / frameCount;
  // const layerCount = frameCount;
  // const pointCount = frameCount;
  const loopStructureA: LoopStructure = {
    structureType: "initial",
    loopBase: {
      radius: 1,
      center: [0, 0],
    },
    loopRotation: 0,
    subStructure: {
      structureType: "terminal",
      relativeSubRadius: 0.9,
      relativeSubDepth: 1,
      subPhase: 2 * Math.PI * frameStamp + Math.PI / 2,
      subOrientation: 0,
    },
  };
  const rotationPoint = getLoopPoint({
    inputAngle:
      (Math.PI / 8) * Math.sin(2 * Math.PI * frameStamp) + Math.PI / 5,
    someLoopStructure: loopStructureA,
  });
  const rotationX = getLoopCosine({
    someLoopPoint: rotationPoint,
  });
  const rotationY = getLoopSine({
    someLoopPoint: rotationPoint,
  });
  const rotationZ = getLoopPendulum({
    someLoopPoint: rotationPoint,
  });
  const rotationMagnitude = Math.sqrt(
    rotationX * rotationX + rotationY * rotationY + rotationZ * rotationZ
  );
  const unitRotationX = rotationX / rotationMagnitude;
  const unitRotationY = rotationY / rotationMagnitude;
  const unitRotationZ = rotationZ / rotationMagnitude;
  const otherRotationPoint = getLoopPoint({
    inputAngle: 2 * Math.PI * frameStamp,
    someLoopStructure: loopStructureA,
  });
  const rotationCos = getLoopCosine({
    someLoopPoint: otherRotationPoint,
  });
  const rotationSin = getLoopSine({
    someLoopPoint: otherRotationPoint,
  });
  const rotationX0 =
    rotationCos + unitRotationX * unitRotationX * (1 - rotationCos);
  const rotationX1 =
    unitRotationX * unitRotationY * (1 - rotationCos) -
    unitRotationZ * rotationSin;
  const rotationX2 =
    unitRotationX * unitRotationZ * (1 - rotationCos) +
    unitRotationY * rotationSin;
  const rotationY0 =
    unitRotationX * unitRotationY * (1 - rotationCos) +
    unitRotationZ * rotationSin;
  const rotationY1 =
    rotationCos + unitRotationY * unitRotationY * (1 - rotationCos);
  const rotationY2 =
    unitRotationY * unitRotationZ * (1 - rotationCos) -
    unitRotationX * rotationSin;
  const rotationZ0 =
    unitRotationX * unitRotationZ * (1 - rotationCos) -
    unitRotationY * rotationSin;
  const rotationZ1 =
    unitRotationY * unitRotationZ * (1 - rotationCos) +
    unitRotationX * rotationSin;
  const rotationZ2 =
    rotationCos + unitRotationZ * unitRotationZ * (1 - rotationCos);
  ////
  const resolutionContainerIndex = RESOLUTION_CONTAINER_INDEX;
  const minDensityContainerIndex = 12;
  const layersConfig: Array<{
    rhythmMaps: ReturnType<typeof getFooRhythmMaps>;
    slotWeights: ReturnType<typeof getRhythmSlotWeights>;
  }> = [];
  for (
    let densityContainerIndex = minDensityContainerIndex;
    densityContainerIndex < resolutionContainerIndex;
    densityContainerIndex++
  ) {
    const fooGroupMaps = getFooGroupRhythmMaps({
      resolutionContainerIndex,
      densityContainerIndex,
      getRhythmOrientation: (density) => Math.floor(density / 2),
      // getRhythmOrientation: (density) => 0,
    });
    const fooRhythmMaps = getFooRhythmMaps({
      fooGroupMaps,
    });
    const fooSlotWeights = getRhythmSlotWeights(
      fooRhythmMaps[0].rhythmPoints.map((someRhythmPoint) =>
        getPhasedRhythmMap(fooRhythmMaps[0], someRhythmPoint)
      )
    );
    layersConfig.push({
      rhythmMaps: fooRhythmMaps,
      slotWeights: fooSlotWeights,
    });
  }
  const orbColormap = getColormap({
    nshades: layersConfig.length,
    colormap: "rainbow-soft",
    format: "hex",
    alpha: 1,
  });
  const orbPoints: Array<WorldCellPoint> = [];
  for (let layerIndex = 1; layerIndex < layersConfig.length; layerIndex++) {
    const layerStamp = layerIndex / layersConfig.length;
    const layerConfig = layersConfig[layerIndex];
    const pointRhythmMap = getPhasedRhythmMap(
      layerConfig.rhythmMaps[0],
      frameIndex
    );
    for (
      let _pointIndex = 0;
      _pointIndex < pointRhythmMap.rhythmPoints.length;
      _pointIndex++
    ) {
      const pointIndex = pointRhythmMap.rhythmPoints[_pointIndex];
      const pointWeight = layerConfig.slotWeights[pointIndex];
      // const pointScalar = 1 - pointWeight / layerConfig.slotWeights[0];
      const pointScalar = 1 - pointWeight / layerConfig.slotWeights.length;
      const pointStamp = pointIndex / layerConfig.slotWeights.length;
      const polarAngle = 2 * Math.PI * pointStamp;
      const zenithAngle = Math.PI * layerStamp;
      const polarPoint = getLoopPoint({
        inputAngle: polarAngle,
        someLoopStructure: loopStructureA,
      });
      const zenithPoint = getLoopPoint({
        inputAngle: zenithAngle,
        someLoopStructure: loopStructureA,
      });
      const pointRadius = 1;
      const baseX =
        pointScalar *
        pointRadius *
        getLoopCosine({
          someLoopPoint: polarPoint,
        }) *
        getLoopSine({
          someLoopPoint: zenithPoint,
        });
      const baseY =
        pointScalar *
        pointRadius *
        getLoopSine({
          someLoopPoint: polarPoint,
        }) *
        getLoopSine({
          someLoopPoint: zenithPoint,
        });
      const baseZ =
        pointRadius *
        getLoopCosine({
          someLoopPoint: zenithPoint,
        });
      const rotatedX =
        rotationX0 * baseX + rotationX1 * baseY + rotationX2 * baseZ;
      const rotatedY =
        rotationY0 * baseX + rotationY1 * baseY + rotationY2 * baseZ;
      const rotatedZ =
        rotationZ0 * baseX + rotationZ1 * baseY + rotationZ2 * baseZ;
      orbPoints.push([
        rotatedX,
        rotatedY,
        rotatedZ,
        0.02,
        orbColormap[layerIndex],
      ]);
    }
  }
  return (
    <CellGraphic
      cameraDepth={-2}
      lightDepth={5}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      worldCellPoints={orbPoints}
    />
  );
}

interface GetFooGroupRhythmMapsApi {
  resolutionContainerIndex: number;
  densityContainerIndex: number;
  getRhythmOrientation: (density: number, densityIndex: number) => number;
}

function getFooGroupRhythmMaps(
  api: GetFooGroupRhythmMapsApi
): Array<RhythmMap> {
  const {
    resolutionContainerIndex,
    densityContainerIndex,
    getRhythmOrientation,
  } = api;
  const baseResolution = getPrimeContainer(resolutionContainerIndex);
  const baseDensity = getPrimeContainer(densityContainerIndex);
  const baseInterposedDensities = getPrimesRangeInclusive(
    baseDensity,
    baseResolution
  );
  return getRhythmGroup({
    baseStructure: {
      structureType: "initial",
      rhythmResolution: baseResolution,
      subStructure: getBaseRhythmSubStructure({
        getRhythmOrientation,
        interposedDensities: baseInterposedDensities.reverse(),
      }),
    },
    memberStructure: {
      structureType: "terminal",
      rhythmDensity: baseDensity,
    },
  }).map(getRhythmMap);
}

interface GetFooRhythmMapApi {
  fooGroupMaps: Array<RhythmMap>;
}

function getFooRhythmMaps(
  api: GetFooRhythmMapApi
): [normal: RhythmMap, inverted: RhythmMap] {
  const { fooGroupMaps } = api;
  const baseRhythmSlots = getRhythmSlotWeights(fooGroupMaps);
  const normalRhythmMap: RhythmMap = {
    rhythmResolution: baseRhythmSlots.length,
    rhythmPoints: [],
  };
  const invertedRhythmMap: RhythmMap = {
    rhythmResolution: baseRhythmSlots.length,
    rhythmPoints: [],
  };
  for (let slotIndex = 0; slotIndex < baseRhythmSlots.length; slotIndex++) {
    const slotWeight = baseRhythmSlots[slotIndex];
    if (slotWeight > 0) {
      normalRhythmMap.rhythmPoints.push(slotIndex);
    } else {
      invertedRhythmMap.rhythmPoints.push(slotIndex);
    }
  }
  return [normalRhythmMap, invertedRhythmMap];
}

interface GetAlignedRhythmSubStructureApi {
  terminalDensity: number;
  interposedDensities: Array<number>;
  getRhythmOrientation: (density: number, densityIndex: number) => number;
  densityIndex?: number;
}

function getAlignedRhythmSubStructure(
  api: GetAlignedRhythmSubStructureApi
): AlignedRhythmStructure["subStructure"] {
  const {
    interposedDensities,
    getRhythmOrientation,
    densityIndex = 0,
    terminalDensity,
  } = api;
  const [currentInterposedDensity, ...nextInterposedDensities] =
    interposedDensities;
  return nextInterposedDensities.length > 0
    ? {
        structureType: "interposed",
        rhythmDensity: currentInterposedDensity,
        rhythmOrientation: getRhythmOrientation(
          currentInterposedDensity,
          densityIndex
        ),
        subStructure: getAlignedRhythmSubStructure({
          getRhythmOrientation,
          terminalDensity,
          interposedDensities: nextInterposedDensities,
          densityIndex: densityIndex + 1,
        }),
      }
    : {
        structureType: "terminal",
        rhythmDensity: terminalDensity,
        rhythmOrientation: getRhythmOrientation(terminalDensity, densityIndex),
      };
}

interface GetBaseRhythmSubStructureApi {
  interposedDensities: Array<number>;
  getRhythmOrientation: (density: number, densityIndex: number) => number;
  densityIndex?: number;
}

function getBaseRhythmSubStructure(
  api: GetBaseRhythmSubStructureApi
): RhythmGroupBaseStructure["subStructure"] {
  const { interposedDensities, getRhythmOrientation, densityIndex = 0 } = api;
  const [currentInterposedDensity, ...nextInterposedDensities] =
    interposedDensities;
  return {
    structureType: "interposed",
    rhythmDensity: currentInterposedDensity,
    rhythmOrientation: getRhythmOrientation(
      currentInterposedDensity,
      densityIndex
    ),
    subStructure:
      nextInterposedDensities.length > 0
        ? getBaseRhythmSubStructure({
            getRhythmOrientation,
            interposedDensities: nextInterposedDensities,
            densityIndex: densityIndex + 1,
          })
        : undefined,
  };
}
