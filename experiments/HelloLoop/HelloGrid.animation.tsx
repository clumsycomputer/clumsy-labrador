import { AnimationModule } from "clumsy-graphics";
import {
  getPhasedRhythmMap,
  getPrimeContainer,
  getPrimesRangeInclusive,
  getRhythmMap,
  getRhythmSlotWeights,
  PhasedRhythmStructure,
} from "clumsy-math";
import getColormap from "colormap";
import React from "react";

const RESOLUTION_CONTAINER_INDEX = 24;
const MINIMUM_DENSITY_CONTAINER_INDEX = 12;
const RHYTHM_RESOLUTON = getPrimeContainer(RESOLUTION_CONTAINER_INDEX);

const HelloGridAnimationModule: AnimationModule = {
  moduleName: "Hello-Grid",
  getFrameDescription: getGridFrameDescription,
  frameCount: RHYTHM_RESOLUTON,
  frameSize: {
    width: 1024 * 12,
    height: 1024 * 12,
  },
  animationSettings: {
    frameRate: 20,
    constantRateFactor: 1,
  },
};

export default HelloGridAnimationModule;

interface GetGridFrameDescriptionApi {
  frameCount: number;
  frameIndex: number;
}

async function getGridFrameDescription(api: GetGridFrameDescriptionApi) {
  const { frameCount, frameIndex } = api;
  const rhythmResolution = RHYTHM_RESOLUTON;
  const gridColormap = getColormap({
    nshades: rhythmResolution,
    colormap: "jet",
    format: "hex",
    alpha: 1,
  });
  const graphicRectangle = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  };
  const cellLength = graphicRectangle.width / rhythmResolution;
  return (
    <svg viewBox="0 0 100 100">
      <rect x={0} y={0} width={100} height={100} fill="black" />
      {new Array(RESOLUTION_CONTAINER_INDEX - MINIMUM_DENSITY_CONTAINER_INDEX)
        .fill(undefined)
        .map((_, layerIndex) => {
          const densityContainerIndex =
            MINIMUM_DENSITY_CONTAINER_INDEX + layerIndex;
          const rhythmDensity = getPrimeContainer(densityContainerIndex);
          const primeDensities = getPrimesRangeInclusive(
            rhythmDensity,
            rhythmResolution
          ).reverse();
          const baseRhythmStructure: PhasedRhythmStructure = {
            structureType: "initial",
            rhythmResolution: RHYTHM_RESOLUTON,
            rhythmPhase: frameIndex,
            subStructure: getRhythmSubStructure({
              terminalDensity: rhythmDensity,
              interposedDensities: primeDensities,
              getRhythmOrientation: (density, index) => index,
              getRhythmPhase: (density) => frameIndex % density,
            }),
          };
          const baseRhythmMap = getRhythmMap(baseRhythmStructure);
          const rhythmSlotWeights = getRhythmSlotWeights(
            baseRhythmMap.rhythmPoints.map((someRhythmPoint) =>
              getPhasedRhythmMap(baseRhythmMap, someRhythmPoint)
            )
          );

          return rhythmSlotWeights.map((someSlotWeight, slotIndex) => {
            const indexAaa = slotIndex;
            const indexBbb = rhythmResolution - indexAaa - 1;
            const weightAaa = someSlotWeight;
            const weightBbb = rhythmResolution - weightAaa - 1;
            return (
              <g>
                <rect
                  x={indexAaa * cellLength}
                  y={weightAaa * cellLength}
                  width={cellLength}
                  height={cellLength}
                  fill={gridColormap[someSlotWeight]}
                />
                <rect
                  x={indexBbb * cellLength}
                  y={weightAaa * cellLength}
                  width={cellLength}
                  height={cellLength}
                  fill={gridColormap[someSlotWeight]}
                />
                <rect
                  x={indexBbb * cellLength}
                  y={weightBbb * cellLength}
                  width={cellLength}
                  height={cellLength}
                  fill={gridColormap[someSlotWeight]}
                />
                <rect
                  x={indexAaa * cellLength}
                  y={weightBbb * cellLength}
                  width={cellLength}
                  height={cellLength}
                  fill={gridColormap[someSlotWeight]}
                />

                <rect
                  y={indexAaa * cellLength}
                  x={weightAaa * cellLength}
                  width={cellLength}
                  height={cellLength}
                  fill={gridColormap[someSlotWeight]}
                />
                <rect
                  y={indexBbb * cellLength}
                  x={weightAaa * cellLength}
                  width={cellLength}
                  height={cellLength}
                  fill={gridColormap[someSlotWeight]}
                />
                <rect
                  y={indexBbb * cellLength}
                  x={weightBbb * cellLength}
                  width={cellLength}
                  height={cellLength}
                  fill={gridColormap[someSlotWeight]}
                />
                <rect
                  y={indexAaa * cellLength}
                  x={weightBbb * cellLength}
                  width={cellLength}
                  height={cellLength}
                  fill={gridColormap[someSlotWeight]}
                />
              </g>
            );
          });
        })
        .flat()}
    </svg>
  );
}

interface GetRhythmSubStructureApi {
  interposedDensities: Array<number>;
  terminalDensity: number;
  densityIndex?: number;
  getRhythmOrientation: (density: number, index: number) => number;
  getRhythmPhase: (density: number, index: number) => number;
}

function getRhythmSubStructure(
  api: GetRhythmSubStructureApi
): PhasedRhythmStructure["subStructure"] {
  const {
    interposedDensities,
    densityIndex = 0,
    getRhythmOrientation,
    getRhythmPhase,
    terminalDensity,
  } = api;
  const [currentDensity, ...nextInterposedDensities] = interposedDensities;
  return {
    structureType: "interposed",
    rhythmDensity: currentDensity,
    rhythmOrientation: getRhythmOrientation(currentDensity, densityIndex),
    rhythmPhase: getRhythmPhase(currentDensity, densityIndex),
    subStructure:
      nextInterposedDensities.length > 0
        ? getRhythmSubStructure({
            getRhythmOrientation,
            getRhythmPhase,
            terminalDensity,
            densityIndex: densityIndex + 1,
            interposedDensities: nextInterposedDensities,
          })
        : {
            structureType: "terminal",
            rhythmDensity: terminalDensity,
            rhythmOrientation: getRhythmOrientation(
              terminalDensity,
              densityIndex + 1
            ),
          },
  };
}
