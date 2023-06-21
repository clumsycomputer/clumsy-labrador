import { AnimationModule } from 'clumsy-graphics'
import React from 'react'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import {
  AlignedSpacerStructure,
  SpacerSlotWeight,
  phasedSpacer,
  spacer,
  spacerGroup,
  spacerIntervals,
  spacerLineage,
  spacerSlotWeights,
} from 'clumsy-math'
import { Vector3 } from '../library/Vector3'
import { reflectedPoint } from '../library/Point3'

const animationFrameCount = 64 * 6
const animationFrameRate = 20
const clipStartFrameIndex = 64 * 0
const clipFinishFrameIndex = animationFrameCount
const backgroundColor = 'rgb(72,30,0)'
const colorMap = [
  'rgb(113,3,1)',
  'rgb(149,69,0)',
  'rgb(186,129,0)',
  'rgb(101,95,1)',
  'rgb(0,84,86)',
]

const PhasesAnimationModule: AnimationModule = {
  moduleName: 'Phases',
  getFrameDescription: getPhasesFrameDescription,
  frameCount: clipFinishFrameIndex - clipStartFrameIndex,
  frameSize: {
    width: 1024 * 1,
    height: 1024 * 1,
  },
  animationSettings: {
    frameRate: animationFrameRate,
    constantRateFactor: 1,
  },
}

export default PhasesAnimationModule

interface GetPhasesFrameDescriptionProps {
  frameCount: number
  frameIndex: number
}

async function getPhasesFrameDescription(
  props: GetPhasesFrameDescriptionProps
) {
  const frameCount = animationFrameCount
  const frameIndex = clipStartFrameIndex + props.frameIndex
  const frameStamp = frameIndex / animationFrameCount
  const frameAngle = 2 * Math.PI * frameStamp
  const bazCount = Math.floor(frameCount / 12)
  const bazIndex = spacerResolutionMap([frameCount, [bazCount, 0]])[frameIndex]
  const spacerStructureA: AlignedSpacerStructure = [
    13,
    [
      11,
      spacerResolutionMap([bazCount, [bazCount - (bazCount % 11), 0]])[
        bazIndex
      ] % 11,
    ],
    [
      7,
      spacerResolutionMap([bazCount, [bazCount - (bazCount % 7), 0]])[
        bazIndex
      ] % 7,
    ],
    [
      5,
      spacerResolutionMap([bazCount, [bazCount - (bazCount % 5), 0]])[
        bazIndex
      ] % 5,
    ],
    [
      3,
      spacerResolutionMap([bazCount, [bazCount - (bazCount % 3), 0]])[
        bazIndex
      ] % 3,
    ],
    // [
    //   2,
    //   spacerResolutionMap([bazCount, [bazCount - (bazCount % 2), 0]])[
    //     bazIndex
    //   ] % 2,
    // ],
  ]
  const spacerA = spacer(spacerStructureA)
  const phasedSpacerA = phasedSpacer(
    spacerA,
    spacerResolutionMap([
      frameCount,
      [frameCount - (frameCount % bazCount), 0],
    ])[frameIndex] % bazCount
  )
  const terminalWeightsA = spacerTerminalSlotWeights(spacerStructureA)
  const pointRaidusA = 6
  const pointAngleStepA = (2 * Math.PI) / spacerA[0]
  const cellsA: Array<WorldCellPoint> = []
  for (
    let pointIndexA = 0;
    pointIndexA < phasedSpacerA[1].length;
    pointIndexA++
  ) {
    const pointA = phasedSpacerA[1][pointIndexA]
    const relativePointWeight = terminalWeightsA[pointA] / terminalWeightsA[0]
    const pointAngleA = pointA * pointAngleStepA
    const adjustedPointAngleA = pointAngleA + Math.PI / 2
    const originX = pointRaidusA * Math.cos(adjustedPointAngleA)
    const originY = pointRaidusA * Math.sin(adjustedPointAngleA)
    const cellColor =
      colorMap[
        (spacerResolutionMap([
          bazCount,
          [
            bazCount -
              (bazCount %
                spacerResolutionMap([
                  bazCount,
                  [bazCount - (bazCount % terminalWeightsA[pointA]), 0],
                ])[bazIndex]),
            0,
          ],
        ])[bazIndex] +
          pointIndexA) %
          colorMap.length
      ]
    const basePoint: Vector3 = [originX, originY, 0]
    const baseCellSize = 2
    const cellSize =
      relativePointWeight * (1 / terminalWeightsA[0]) * baseCellSize +
      ((terminalWeightsA[0] - 1) / terminalWeightsA[0]) * baseCellSize
    cellsA.push([...basePoint, cellSize, cellColor])
    cellsA.push([
      ...reflectedPoint(
        [
          [0, 0, basePoint[2]],
          [0, 1, basePoint[2]],
        ],
        basePoint
      ),
      cellSize,
      cellColor,
    ])
  }
  return (
    <CellGraphic
      cameraDepth={-10}
      lightDepth={500}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      backgroundColor={backgroundColor}
      worldCellPoints={cellsA}
    />
  )
}

function spacerTerminalSlotWeights(
  someAlignedStructure: AlignedSpacerStructure
): Array<SpacerSlotWeight> {
  const depthLineage = spacerLineage(someAlignedStructure)
  const depthTerminalGroup = spacerGroup(depthLineage[depthLineage.length - 1])
  const depthTerminalSpacers = depthTerminalGroup.map((someTerminalStructure) =>
    spacer(someTerminalStructure)
  )
  return spacerSlotWeights(depthTerminalSpacers)
}

function spacerResolutionMap(
  someSpacerStructure: AlignedSpacerStructure
): Array<number> {
  return spacerIntervals(spacer(someSpacerStructure)).reduce<Array<number>>(
    (result, currentPointInterval, pointIndex) => {
      for (let i = 0; i < currentPointInterval; i++) {
        result.push(pointIndex)
      }
      return result
    },
    []
  )
}

// function spacerFoo(
//   maxResolution: number,
//   minResolution: number,
//   frameIndex: number
// ) {
//   return spacerResolutionMap(
//     maxResolution,
//     minResolution,
//     spacerResolutionMap(
//       maxResolution,
//       maxResolution - (maxResolution % minResolution)
//     )[frameIndex] % minResolution
//   )[frameIndex]
// }
