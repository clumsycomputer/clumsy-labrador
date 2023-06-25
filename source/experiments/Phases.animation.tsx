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
import { Point3, reflectedPoint, sphericalToCartesian } from '../library/Point3'
import {
  normalizedAngle,
  throwInvalidPathError,
} from '../library/miscellaneous'

const animationFrameCount = 64 * 4
const animationFrameRate = 20
const clipStartFrameIndex = 64 * 0
const clipFinishFrameIndex = animationFrameCount
const backgroundColor = 'black'
// const colorMap = [
//   'rgb(255,8,6)',
//   'rgb(249,226,116)',
//   'rgb(248,168,6)',
//   'rgb(204,184,58)',
//   'rgb(1,192,123)',
// ]
const colorMap = [
  'rgb(132,245,177)',
  'rgb(165,247,236)',
  'rgb(217,246,130)',
  'rgb(255,179,232)',
  'rgb(252,252,126)',
]
// const backgroundColor = 'rgb(72,30,0)'
// const colorMap = [
//   'rgb(113,3,1)',
//   'rgb(149,69,0)',
//   'rgb(186,129,0)',
//   'rgb(101,95,1)',
//   'rgb(0,84,86)',
// ]

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
  const downsampleFrameDataA = downsampledFrameData(
    frameCount,
    frameIndex,
    Math.floor(frameCount / 5)
  )
  const downsampleFrameDataB = downsampledFrameData(
    frameCount,
    frameIndex,
    Math.floor(frameCount / 2)
  )
  const cameraDepth = -6
  const orbSymmetricWeightsA = spacerSymmetricSlotWeights(spacer([13, [7, 0]]))
  const orbSpacerStructureA: AlignedSpacerStructure = [
    13,
    [
      11,
      spacerResolutionMap([
        downsampleFrameDataA[0],
        [downsampleFrameDataA[0] - (downsampleFrameDataA[0] % 11), 0],
      ])[downsampleFrameDataA[1]] % 11,
    ],
    [
      7,
      spacerResolutionMap([
        downsampleFrameDataA[0],
        [downsampleFrameDataA[0] - (downsampleFrameDataA[0] % 7), 0],
      ])[downsampleFrameDataA[1]] % 7,
    ],
    [
      5,
      spacerResolutionMap([
        downsampleFrameDataA[0],
        [downsampleFrameDataA[0] - (downsampleFrameDataA[0] % 5), 0],
      ])[downsampleFrameDataA[1]] % 5,
    ],
    [
      3,
      spacerResolutionMap([
        downsampleFrameDataA[0],
        [downsampleFrameDataA[0] - (downsampleFrameDataA[0] % 3), 0],
      ])[downsampleFrameDataA[1]] % 3,
    ],
    [
      2,
      spacerResolutionMap([
        downsampleFrameDataA[0],
        [downsampleFrameDataA[0] - (downsampleFrameDataA[0] % 2), 0],
      ])[downsampleFrameDataA[1]] % 2,
    ],
  ]
  const orbCellsA = getOrbLayerCells({
    frameAngle,
    ringDepth: -cameraDepth,
    ringRadius: 0,
    cellRadius: 2,
    cellBaseSize: 0.375,
    orbSymmetricWeights: orbSymmetricWeightsA,
    orbSpacerStructure: orbSpacerStructureA,
    getRingSpacerPhase: () =>
      spacerResolutionMap([
        downsampleFrameDataA[0],
        [orbSpacerStructureA[0], 0],
      ])[downsampleFrameDataA[1]],
    getDepthSpacerPhase: () =>
      spacerResolutionMap([
        downsampleFrameDataA[0],
        [
          downsampleFrameDataA[0] -
            (downsampleFrameDataA[0] % orbSpacerStructureA[0]),
          0,
        ],
      ])[downsampleFrameDataA[1]] % orbSpacerStructureA[0],
    getSliceSpacerPhase: () =>
      spacerResolutionMap([
        downsampleFrameDataA[0],
        [orbSpacerStructureA[0], 0],
      ])[downsampleFrameDataA[1]],
    getDepthLoopStructure: ({ ringPointAngle }) => {
      const relativeRingPointAngle = (ringPointAngle / 2) * Math.PI
      const loopRangeScalar = 0.1
      return [
        [
          0.95,
          loopRangeScalar * relativeRingPointAngle + LOOP_ZERO,
          ringPointAngle,
          0,
          0,
        ],
      ]
    },
    getSliceLoopStructure: ({ ringPointAngle }) => {
      const relativeRingPointAngle = (ringPointAngle / 2) * Math.PI
      const loopRangeScalar = 0.1
      return [
        [
          0.95,
          loopRangeScalar * relativeRingPointAngle + LOOP_ZERO,
          ringPointAngle,
          frameAngle,
          0,
        ],
      ]
    },
    getCellOrientation: ({
      ringPointSymmetricWeight,
      ringPointRelativeTerminalWeight,
    }) => {
      return (
        ringPointSymmetricWeight * frameAngle +
        Math.PI * ringPointRelativeTerminalWeight
      )
    },
    getCellColor: ({ ringPointIndex, ringPointTerminalWeight }) => {
      return colorMap[downsampleFrameDataB[1] % colorMap.length]
    },
  })
  return (
    <CellGraphic
      cameraDepth={cameraDepth}
      lightDepth={500}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      backgroundColor={backgroundColor}
      worldCellPoints={[...orbCellsA]}
    />
  )
}

interface GetOrbLayerCellsApi {
  frameAngle: number
  orbSpacerStructure: AlignedSpacerStructure
  orbSymmetricWeights: Array<SpacerSlotWeight>
  ringDepth: number
  ringRadius: number
  cellRadius: number
  cellBaseSize: number
  getRingSpacerPhase: () => number
  getDepthSpacerPhase: () => number
  getSliceSpacerPhase: () => number
  getDepthLoopStructure: (dataContext: OrbLayerDataContext) => LoopStructure
  getSliceLoopStructure: (dataContext: OrbLayerDataContext) => LoopStructure
  getCellOrientation: (dataContext: OrbLayerDataContext) => number
  getCellColor: (dataContext: OrbLayerDataContext) => string
}

interface OrbLayerDataContext {
  ringPointAngle: number
  ringPointIndex: number
  ringPointTerminalWeight: number
  ringPointRelativeTerminalWeight: number
  ringPointSymmetricWeight: number
}

function getOrbLayerCells(api: GetOrbLayerCellsApi): Array<WorldCellPoint> {
  const {
    orbSpacerStructure,
    orbSymmetricWeights,
    getRingSpacerPhase,
    ringRadius,
    ringDepth,
    getDepthSpacerPhase,
    getDepthLoopStructure,
    getSliceSpacerPhase,
    getSliceLoopStructure,
    getCellOrientation,
    cellRadius,
    cellBaseSize,
    getCellColor,
  } = api
  const orbTerminalWeights = spacerTerminalSlotWeights(orbSpacerStructure)
  const orbMaxTerminalWeight = orbSymmetricWeights[0]
  const orbMaxSymmetricWeight = orbSymmetricWeights[0]
  const orbSpacer = spacer(orbSpacerStructure)
  const ringSpacer = phasedSpacer(orbSpacer, getRingSpacerPhase())
  const ringPointAngleStep = (2 * Math.PI) / ringSpacer[0]
  const resultCells: Array<WorldCellPoint> = []
  for (
    let ringPointIndex = 0;
    ringPointIndex < ringSpacer[1].length;
    ringPointIndex++
  ) {
    const ringPoint = ringSpacer[1][ringPointIndex]
    const ringPointAngle = ringPoint * ringPointAngleStep
    const ringAdjustedPointAngle = ringPointAngle + Math.PI / 2
    const ringPointTerminalWeight = orbTerminalWeights[ringPoint]
    const ringPointRelativeTerminalWeight =
      ringPointTerminalWeight / orbMaxTerminalWeight
    const ringPointSymmetricWeight = orbSymmetricWeights[ringPoint]
    const ringPointRelativeSymmetricWeight =
      ringPointSymmetricWeight / orbMaxSymmetricWeight
    const ringPointOrigin: Point3 = [
      ringRadius * Math.cos(ringAdjustedPointAngle),
      ringRadius * Math.sin(ringAdjustedPointAngle),
      0,
    ]
    const ringPointOrientationAxis = normalizedVector(
      rotatedVector([0, 0, 1], ringPointAngle, [1, 0, 0])
    )
    const depthSpacer = phasedSpacer(orbSpacer, getDepthSpacerPhase())
    const depthPointAngleStep = Math.PI / depthSpacer[0]
    const depthLoopStructure = getDepthLoopStructure({
      ringPointAngle,
      ringPointIndex,
      ringPointTerminalWeight,
      ringPointSymmetricWeight,
      ringPointRelativeTerminalWeight,
    })
    const depthCosine = (someDepthAngle: number) =>
      loopCosine(loopPoint(depthLoopStructure, someDepthAngle))
    const depthSine = (someDepthAngle: number) =>
      loopSine(loopPoint(depthLoopStructure, someDepthAngle))
    for (
      let depthPointIndex = 0;
      depthPointIndex < depthSpacer[1].length;
      depthPointIndex++
    ) {
      const depthPoint = depthSpacer[1][depthPointIndex]
      const depthPointAngle = depthPoint * depthPointAngleStep
      const depthPointTerminalWeight = orbTerminalWeights[depthPoint]
      const depthPointRelativeTerminalWeight =
        depthPointTerminalWeight / orbMaxTerminalWeight
      const depthPointSymmetricWeight = orbSymmetricWeights[depthPoint]
      const depthPointRelativeSymmetricWeight =
        depthPointSymmetricWeight / orbMaxSymmetricWeight
      const sliceSpacer = phasedSpacer(orbSpacer, getSliceSpacerPhase())
      const slicePointAngleStep = (2 * Math.PI) / sliceSpacer[0]
      const sliceLoopStructure = getSliceLoopStructure({
        ringPointAngle,
        ringPointIndex,
        ringPointTerminalWeight,
        ringPointSymmetricWeight,
        ringPointRelativeTerminalWeight,
      })
      const sliceCosine = (someSliceAngle: number) =>
        loopCosine(loopPoint(sliceLoopStructure, someSliceAngle))
      const sliceSine = (someSliceAngle: number) =>
        loopSine(loopPoint(sliceLoopStructure, someSliceAngle))
      for (
        let slicePointIndex = 0;
        slicePointIndex < sliceSpacer[1].length;
        slicePointIndex++
      ) {
        const slicePoint = sliceSpacer[1][slicePointIndex]
        const slicePointAngle = slicePoint * slicePointAngleStep
        const slicePointTerminalWeight = orbTerminalWeights[slicePoint]
        const slicePointRelativeTerminalWeight =
          slicePointTerminalWeight / orbMaxTerminalWeight
        const slicePointSymmetricWeight = orbSymmetricWeights[slicePoint]
        const slicePointRelativeSymmetricWeight =
          slicePointSymmetricWeight / orbMaxSymmetricWeight
        const cellBasePoint = sphericalToCartesian(
          depthCosine,
          depthSine,
          sliceCosine,
          sliceSine,
          [cellRadius, depthPointAngle, slicePointAngle]
        )
        const cellOrientedPoint = rotatedVector(
          ringPointOrientationAxis,
          Math.atan2(
            Math.sqrt(
              ringPointOrigin[0] * ringPointOrigin[0] +
                ringPointOrigin[1] * ringPointOrigin[1]
            ),
            ringDepth
          ) +
            getCellOrientation({
              ringPointAngle,
              ringPointIndex,
              ringPointTerminalWeight,
              ringPointSymmetricWeight,
              ringPointRelativeTerminalWeight,
            }),
          cellBasePoint
        )
        const cellTransformedPoint = cellOrientedPoint
        const cellTranslatedPoint: Vector3 = [
          cellTransformedPoint[0] + ringPointOrigin[0],
          cellTransformedPoint[1] + ringPointOrigin[1],
          cellTransformedPoint[2] + ringPointOrigin[2],
        ]
        const cellSize = rangeScopeValue(
          cellBaseSize,
          orbMaxTerminalWeight,
          1,
          ringPointRelativeTerminalWeight
        )
        const cellColor = getCellColor({
          ringPointAngle,
          ringPointIndex,
          ringPointTerminalWeight,
          ringPointSymmetricWeight,
          ringPointRelativeTerminalWeight,
        })
        resultCells.push([...cellTranslatedPoint, cellSize, cellColor])
        resultCells.push([
          ...reflectedPoint(
            [
              [0, 0, cellTranslatedPoint[2]],
              [0, 1, cellTranslatedPoint[2]],
            ],
            cellTranslatedPoint
          ),
          cellSize,
          cellColor,
        ])
      }
    }
  }
  return resultCells
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

function downsampledFrameData(
  frameCount: number,
  frameIndex: number,
  downsampledFrameCount: number
): [number, number, number, number] {
  const downsampleFrameIndex = spacerResolutionMap([
    frameCount,
    [downsampledFrameCount, 0],
  ])[frameIndex]
  const downsampledFrameStamp = downsampleFrameIndex / downsampledFrameCount
  const downSampledFrameAngle = 2 * Math.PI * downsampledFrameStamp
  return [
    downsampledFrameCount,
    downsampleFrameIndex,
    downsampledFrameStamp,
    downSampledFrameAngle,
  ]
}
