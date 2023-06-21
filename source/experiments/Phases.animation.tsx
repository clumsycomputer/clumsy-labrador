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

const animationFrameCount = 48 * 1
const animationFrameRate = 12
const clipStartFrameIndex = 0
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
  const spacerStructureA: AlignedSpacerStructure = [
    13,
    [
      11,
      spacerResolutionMap([frameCount, [frameCount - (frameCount % 11), 0]])[
        frameIndex
      ] % 11,
    ],
    [
      7,
      spacerResolutionMap([frameCount, [frameCount - (frameCount % 7), 0]])[
        frameIndex
      ] % 7,
    ],
    [
      5,
      spacerResolutionMap([frameCount, [frameCount - (frameCount % 5), 0]])[
        frameIndex
      ] % 5,
    ],
    [
      3,
      spacerResolutionMap([frameCount, [frameCount - (frameCount % 3), 0]])[
        frameIndex
      ] % 3,
    ],
    [
      2,
      spacerResolutionMap([frameCount, [frameCount - (frameCount % 2), 0]])[
        frameIndex
      ] % 2,
    ],
  ]
  const spacerA = spacer(spacerStructureA)
  const phasedSpacerA = phasedSpacer(
    spacerA,
    spacerResolutionMap([
      frameCount,
      [frameCount - (frameCount % spacerA[0]), 0],
    ])[frameIndex]
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
    const pointAngleA = pointA * pointAngleStepA
    const adjustedPointAngleA = pointAngleA + Math.PI / 2
    const originX = pointRaidusA * Math.cos(adjustedPointAngleA)
    const originY = pointRaidusA * Math.sin(adjustedPointAngleA)
    const cellColor =
      colorMap[
        (spacerResolutionMap([
          frameCount,
          [
            frameCount -
              (frameCount %
                spacerResolutionMap([
                  frameCount,
                  [frameCount - (frameCount % terminalWeightsA[pointA]), 0],
                ])[frameIndex]),
            0,
          ],
        ])[frameIndex] +
          pointIndexA) %
          colorMap.length
      ]
    const basePoint: Vector3 = [originX, originY, 0]
    cellsA.push([...basePoint, 2.5, cellColor])
    // cellsA.push([
    //   ...reflectedPoint(
    //     [
    //       [0, 0, basePoint[2]],
    //       [0, 1, basePoint[2]],
    //     ],
    //     basePoint
    //   ),
    //   2.5,
    //   cellColor,
    // ])
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
