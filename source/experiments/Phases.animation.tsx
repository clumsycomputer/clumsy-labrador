import { AnimationModule } from 'clumsy-graphics'
import React from 'react'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import {
  AlignedSpacerStructure,
  LOOP_ONE,
  LOOP_ZERO,
  LoopStructure,
  SpacerSlotWeight,
  loopCosine,
  loopPoint,
  loopSine,
  phasedSpacer,
  spacer,
  spacerGroup,
  spacerIntervals,
  spacerLineage,
  spacerSlotWeights,
  spacerSymmetricSlotWeights,
} from 'clumsy-math'
import { Vector3, normalizedVector, rotatedVector } from '../library/Vector3'
import { reflectedPoint, sphericalToCartesian } from '../library/Point3'
import { normalizedAngle } from '../library/miscellaneous'

const animationFrameCount = 64 * 4
const animationFrameRate = 30
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
  const adjustedFrameCountA = Math.floor(frameCount / 7)
  const adjustedFrameIndexA = spacerResolutionMap([
    frameCount,
    [adjustedFrameCountA, 0],
  ])[frameIndex]
  const frameStamp = frameIndex / animationFrameCount
  const frameAngle = 2 * Math.PI * frameStamp
  const cameraDepth = -6
  const ringDepth = -cameraDepth
  const ringSpacerStructure: AlignedSpacerStructure = [
    13,
    [
      11,
      spacerResolutionMap([
        adjustedFrameCountA,
        [adjustedFrameCountA - (adjustedFrameCountA % 11), 0],
      ])[adjustedFrameIndexA] % 11,
    ],
    [
      7,
      spacerResolutionMap([
        adjustedFrameCountA,
        [adjustedFrameCountA - (adjustedFrameCountA % 7), 0],
      ])[adjustedFrameIndexA] % 7,
    ],
    [
      5,
      spacerResolutionMap([
        adjustedFrameCountA,
        [adjustedFrameCountA - (adjustedFrameCountA % 5), 0],
      ])[adjustedFrameIndexA] % 5,
    ],
    [
      3,
      spacerResolutionMap([
        adjustedFrameCountA,
        [adjustedFrameCountA - (adjustedFrameCountA % 3), 0],
      ])[adjustedFrameIndexA] % 3,
    ],
    [
      2,
      spacerResolutionMap([
        adjustedFrameCountA,
        [adjustedFrameCountA - (adjustedFrameCountA % 2), 0],
      ])[adjustedFrameIndexA] % 2,
    ],
  ]
  const ringSpacer = spacer(ringSpacerStructure)
  const ringPhasedSpacer = phasedSpacer(
    ringSpacer,
    spacerResolutionMap([adjustedFrameCountA, [ringSpacer[0], 0]])[
      adjustedFrameIndexA
    ]
  )
  const ringTerminalWeights = spacerTerminalSlotWeights(ringSpacerStructure)
  const ringMaxTerminalWeight = ringTerminalWeights[0]
  const ringSymmetricWeights = spacerSymmetricSlotWeights(spacer([13, [7, 0]]))
  const ringMaxSymmetricWeight = ringSymmetricWeights[0]
  const ringRadius = 1
  const ringPointAngleStep = (2 * Math.PI) / ringPhasedSpacer[0]
  const cellsA: Array<WorldCellPoint> = []
  for (
    let ringPointIndex = 0;
    ringPointIndex < ringPhasedSpacer[1].length;
    ringPointIndex++
  ) {
    const ringPoint = ringPhasedSpacer[1][ringPointIndex]
    const ringPointAngle = ringPoint * ringPointAngleStep
    const ringAdjustedPointAngle = ringPointAngle + Math.PI / 2
    const ringPointTerminalWeight = ringTerminalWeights[ringPoint]
    const ringPointRelativeTerminalWeight =
      ringTerminalWeights[ringPoint] / ringMaxTerminalWeight
    const ringPointSymmetricWeight = ringSymmetricWeights[ringPoint]
    const ringPointRelativeSymmetricWeight =
      ringPointSymmetricWeight / ringMaxSymmetricWeight
    const ringPointOriginX = ringRadius * Math.cos(ringAdjustedPointAngle)
    const ringPointOriginY = ringRadius * Math.sin(ringAdjustedPointAngle)
    const ringPointOrientationAxis = normalizedVector(
      rotatedVector([0, 0, 1], ringPointAngle, [1, 0, 0])
    )
    const ringPointColor = colorMap[2]
    //   colorMap[
    //     (spacerResolutionMap([
    //       adjustedFrameCountA,
    //       [
    //         adjustedFrameCountA -
    //           (adjustedFrameCountA %
    //             spacerResolutionMap([
    //               adjustedFrameCountA,
    //               [
    //                 adjustedFrameCountA -
    //                   (adjustedFrameCountA % ringPointTerminalWeight),
    //                 0,
    //               ],
    //             ])[adjustedFrameIndexA]),
    //         0,
    //       ],
    //     ])[adjustedFrameIndexA] +
    //       ringPointIndex) %
    //       colorMap.length
    //   ]
    const depthSpacerStructure: AlignedSpacerStructure = ringSpacerStructure
    const depthSpacer = spacer(depthSpacerStructure)
    const depthPhasedSpacer = phasedSpacer(
      depthSpacer,
      spacerResolutionMap([
        adjustedFrameCountA,
        [adjustedFrameCountA - (adjustedFrameCountA % depthSpacer[0]), 0],
      ])[adjustedFrameIndexA] % depthSpacer[0]
    )
    const depthPointAngleStep = Math.PI / depthPhasedSpacer[0]
    const relativeRingPointAngle = (ringPointAngle / 2) * Math.PI
    const depthLoopRangeScalar = 0.1
    const depthLoopStructure: LoopStructure = [
      [
        0.95,
        depthLoopRangeScalar * relativeRingPointAngle + LOOP_ZERO,
        ringPointAngle,
        0,
        0,
      ],
      [
        0.9,
        depthLoopRangeScalar * relativeRingPointAngle +
          1 * depthLoopRangeScalar * relativeRingPointAngle +
          LOOP_ZERO,
        normalizedAngle(-2 * ringPointAngle),
        0,
        0,
      ],
      [
        0.825,
        depthLoopRangeScalar * relativeRingPointAngle +
          1 * depthLoopRangeScalar * relativeRingPointAngle +
          LOOP_ZERO,
        normalizedAngle(4 * ringPointAngle),
        0,
        0,
      ],
    ]
    const depthCosine = (someDepthAngle: number) =>
      loopCosine(loopPoint(depthLoopStructure, someDepthAngle))
    const depthSine = (someDepthAngle: number) =>
      loopSine(loopPoint(depthLoopStructure, someDepthAngle))
    for (
      let depthPointIndex = 0;
      depthPointIndex < depthPhasedSpacer[1].length;
      depthPointIndex++
    ) {
      const depthPoint = depthPhasedSpacer[1][depthPointIndex]
      const depthPointAngle = depthPoint * depthPointAngleStep
      const sliceSpacerStructure: AlignedSpacerStructure = ringSpacerStructure
      const sliceSpacer = spacer(sliceSpacerStructure)
      const slicePhasedSpacer = phasedSpacer(
        sliceSpacer,
        spacerResolutionMap([adjustedFrameCountA, [sliceSpacer[0], 0]])[
          adjustedFrameIndexA
        ]
      )
      const slicePointAngleStep = (2 * Math.PI) / slicePhasedSpacer[0]
      const sliceLoopStructure: LoopStructure = [
        [
          0.95,
          depthLoopRangeScalar * relativeRingPointAngle + LOOP_ZERO,
          ringPointAngle,
          frameAngle,
          0,
        ],
        [
          0.9,
          depthLoopRangeScalar * relativeRingPointAngle +
            1 * depthLoopRangeScalar * relativeRingPointAngle +
            LOOP_ZERO,
          normalizedAngle(-2 * ringPointAngle),
          normalizedAngle(2 * frameAngle),
          0,
        ],
        [
          0.825,
          depthLoopRangeScalar * relativeRingPointAngle +
            1 * depthLoopRangeScalar * relativeRingPointAngle +
            LOOP_ZERO,
          normalizedAngle(4 * ringPointAngle),
          normalizedAngle(-4 * frameAngle),
          0,
        ],
      ]
      const sliceCosine = (someSliceAngle: number) =>
        loopCosine(loopPoint(sliceLoopStructure, someSliceAngle))
      const sliceSine = (someSliceAngle: number) =>
        loopSine(loopPoint(sliceLoopStructure, someSliceAngle))
      for (
        let slicePointIndex = 0;
        slicePointIndex < slicePhasedSpacer[0];
        slicePointIndex++
      ) {
        const slicePoint = slicePhasedSpacer[1][slicePointIndex]
        const slicePointAngle = slicePoint * slicePointAngleStep
        const cellBasePoint = sphericalToCartesian(
          depthCosine,
          depthSine,
          sliceCosine,
          sliceSine,
          [ringRadius * 2, depthPointAngle, slicePointAngle]
        )
        const cellOrientedPoint = rotatedVector(
          ringPointOrientationAxis,
          Math.atan2(
            Math.sqrt(
              ringPointOriginX * ringPointOriginX +
                ringPointOriginY * ringPointOriginY
            ),
            ringDepth
          ) +
            1 * ringPointSymmetricWeight * frameAngle +
            Math.PI * ringPointRelativeTerminalWeight,
          cellBasePoint
        )
        const cellTransformedPoint = cellOrientedPoint
        const cellTranslatedPoint: Vector3 = [
          cellTransformedPoint[0] + ringPointOriginX,
          cellTransformedPoint[1] + ringPointOriginY,
          cellTransformedPoint[2],
        ]
        const cellSize = rangeScopeValue(
          0.5,
          ringMaxTerminalWeight,
          1,
          ringPointRelativeTerminalWeight
        )
        cellsA.push([...cellTranslatedPoint, cellSize, ringPointColor])
        cellsA.push([
          ...reflectedPoint(
            [
              [0, 0, cellTranslatedPoint[2]],
              [0, 1, cellTranslatedPoint[2]],
            ],
            cellTranslatedPoint
          ),
          cellSize,
          ringPointColor,
        ])
      }
    }
  }
  return (
    <CellGraphic
      cameraDepth={cameraDepth}
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

function rangeScopeValue(
  rangeScalar: number,
  rangeResolution: number,
  rangeScope: number,
  rangeStamp: number
) {
  return (
    rangeStamp * (rangeScope / rangeResolution) * rangeScalar +
    ((rangeResolution - rangeScope) / rangeResolution) * rangeScalar
  )
}
