import { AnimationModule } from 'clumsy-graphics'
import {
  AlignedSpacerStructure,
  LOOP_ONE,
  LOOP_ZERO,
  LoopPoint,
  LoopStructure,
  Spacer,
  SpacerPoint,
  SpacerSlotWeight,
  loopCosine,
  loopPoint,
  loopSine,
  phasedSpacer,
  primeContainer,
  spacer,
  spacerGroup,
  spacerIntervals,
  spacerLineage,
  spacerSlotWeights,
  spacerSymmetricSlotWeights,
} from 'clumsy-math'
import React from 'react'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import { Point3, reflectedPoint, sphericalToCartesian } from '../library/Point3'
import { Vector3, normalizedVector, rotatedVector } from '../library/Vector3'
import { normalizedAngle } from '../library/miscellaneous'

const animationFrameCount = 64 * 4
const animationFrameRate = 20
const clipStartFrameIndex = 64 * 0
const clipFinishFrameIndex = animationFrameCount
const clipFrameCount = clipFinishFrameIndex - clipStartFrameIndex

const LoopsoidAnimationModule: AnimationModule = {
  moduleName: 'Loopsoid',
  getFrameDescription: getLoopsoidFrameDescription,
  frameCount: clipFrameCount,
  frameSize: {
    width: 1024 * 2,
    height: 1024 * 2,
  },
  animationSettings: {
    frameRate: animationFrameRate,
    constantRateFactor: 1,
  },
}

export default LoopsoidAnimationModule

interface GetLoopsoidFrameDescriptionProps {
  frameCount: number
  frameIndex: number
}

async function getLoopsoidFrameDescription(
  props: GetLoopsoidFrameDescriptionProps
) {
  const rootFrameData = getFrameData({
    frameCount: animationFrameCount,
    frameIndex: clipStartFrameIndex + props.frameIndex,
  })
  const subFrameDataA = getSubFrameData({
    frameCount: rootFrameData.frameCount,
    frameIndex: rootFrameData.frameIndex,
    subFrameCount: Math.floor(rootFrameData.frameCount / 2),
  })
  const cameraDepth = -8
  const rootResolution = 11
  const rootAngleStep = (2 * Math.PI) / rootResolution
  const rootRadius = 6
  const rootWeights = spacerTerminalSlotWeights([rootResolution, [6, 0]])
  const rootMaxWeight = rootWeights[0]
  const ringSpacer = spacer([
    rootResolution,
    [
      7,
      spacerResolutionMap([rootFrameData.frameCount, [7, 0]])[
        rootFrameData.frameIndex
      ],
    ],
    [
      5,
      spacerResolutionMap([rootFrameData.frameCount, [5, 0]])[
        rootFrameData.frameIndex
      ],
    ],
    [
      3,
      spacerResolutionMap([rootFrameData.frameCount, [3, 0]])[
        rootFrameData.frameIndex
      ],
    ],
    [
      2,
      spacerResolutionMap([rootFrameData.frameCount, [2, 0]])[
        rootFrameData.frameIndex
      ],
    ],
  ])
  const ringPhasedSpacer = phasedSpacer(
    ringSpacer,
    spacerResolutionMap([rootFrameData.frameCount, [ringSpacer[0], 0]])[
      rootFrameData.frameIndex
    ]
  )
  const ringCulledSpacer = culledSpacer(ringPhasedSpacer)
  const slotCells: Array<WorldCellPoint> = []
  for (let ringPoint of ringCulledSpacer[1]) {
    const ringPointRootWeight = rootWeights[ringPoint]
    const ringPointRootWeightStamp = ringPointRootWeight / rootMaxWeight
    const ringPointAngle = ringPoint * rootAngleStep
    const ringPointAdjustedAngle = ringPointAngle - Math.PI / 2
    const ringPointOrigin: Point3 = [
      rootRadius * Math.cos(ringPointAdjustedAngle),
      rootRadius * Math.sin(ringPointAdjustedAngle),
      0,
    ]
    const ringPointTarget: Point3 = [0, 0, 0]
    const ringPointDeltas: Vector3 = [
      ringPointTarget[0] - ringPointOrigin[0],
      ringPointTarget[1] - ringPointOrigin[1],
      ringPointTarget[2] - ringPointOrigin[2],
    ]
    const rootSlotAnchor: Point3 = [
      ringPointRootWeightStamp * ringPointDeltas[0] + ringPointOrigin[0],
      ringPointRootWeightStamp * ringPointDeltas[1] + ringPointOrigin[1],
      ringPointRootWeightStamp * ringPointDeltas[2] + ringPointOrigin[2],
    ]
    const loopsoidResolution = 1024
    const loopsoidRadius =
      (rootRadius / rootResolution) * ringPointRootWeightStamp * 2 + 2
    const depthCellAngleStep = Math.PI / loopsoidResolution
    const sliceCellAngleStep = (2 * Math.PI) / loopsoidResolution
    const loopsoidLoopStructure: LoopStructure = [
      [
        0.975,
        LOOP_ONE,
        ringPointAngle,
        normalizedAngle(rootFrameData.frameAngle),
        0,
      ],
      [
        0.95,
        0.5,
        normalizedAngle(-2 * ringPointAngle),
        normalizedAngle(2 * rootFrameData.frameAngle),
        0,
      ],
      [
        0.9,
        LOOP_ZERO,
        normalizedAngle(4 * ringPointAngle),
        normalizedAngle(-4 * rootFrameData.frameAngle),
        0,
      ],
    ]
    const loopsoidAngle = (inputAngle: number) =>
      loopAngle(loopPoint(loopsoidLoopStructure, normalizedAngle(inputAngle)))
    const loopsoidCosine = (inputAngle: number) =>
      loopCosine(loopPoint(loopsoidLoopStructure, loopsoidAngle(inputAngle)))
    const loopsoidSine = (inputAngle: number) =>
      loopSine(loopPoint(loopsoidLoopStructure, loopsoidAngle(inputAngle)))
    const ringPointOrientationAxis = normalizedVector(
      rotatedVector([0, 0, 1], ringPointAdjustedAngle, [1, 0, 0])
    )
    for (let sliceIndex = 0; sliceIndex < loopsoidResolution; sliceIndex++) {
      const depthCellAngle =
        2 *
        Math.PI *
        triangleSample(loopsoidAngle(sliceIndex * depthCellAngleStep))
      const sliceCellAngle =
        (Math.PI / ringPointRootWeight / 2) *
          Math.sin(42 * 2 * sliceIndex * sliceCellAngleStep) +
        Math.PI / ringPointRootWeight
      const cellBasePoint = sphericalToCartesian(
        loopsoidCosine,
        loopsoidSine,
        loopsoidCosine,
        loopsoidSine,
        [loopsoidRadius, depthCellAngle, sliceCellAngle]
      )
      const cellOrientedPoint = rotatedVector(
        ringPointOrientationAxis,
        Math.atan2(
          Math.sqrt(
            ringPointOrigin[0] * ringPointOrigin[0] +
              ringPointOrigin[1] * ringPointOrigin[1]
          ),
          cameraDepth
        ) +
          loopsoidAngle(
            rootFrameData.frameAngle + Math.PI / ringPointRootWeight
          ),
        cellBasePoint
      )
      const cellTranslatedPoint: Point3 = [
        cellOrientedPoint[0] + rootSlotAnchor[0],
        cellOrientedPoint[1] + rootSlotAnchor[1],
        cellOrientedPoint[2] + rootSlotAnchor[2],
      ]
      const cellDistance = Math.sqrt(
        cellTranslatedPoint[0] * cellTranslatedPoint[0] +
          cellTranslatedPoint[1] * cellTranslatedPoint[1]
      )
      const cellSize = rangeScopeValue(0.05, 1, 0.5, cellDistance / rootRadius)
      const cellColor = 'white'
      slotCells.push([...cellTranslatedPoint, cellSize, cellColor])
      slotCells.push([
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
  return (
    <CellGraphic
      cameraDepth={cameraDepth}
      lightDepth={500}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      backgroundColor={'black'}
      worldCellPoints={slotCells}
    />
  )
}

interface GetFrameDataApi {
  frameCount: number
  frameIndex: number
}

function getFrameData(api: GetFrameDataApi) {
  const { frameCount, frameIndex } = api
  const frameStamp = frameIndex / frameCount
  return {
    frameCount,
    frameIndex,
    frameStamp,
    frameAngle: 2 * Math.PI * frameStamp,
  }
}

interface GetSubFrameDataApi {
  frameCount: number
  frameIndex: number
  subFrameCount: number
}

function getSubFrameData(api: GetSubFrameDataApi) {
  const { frameCount, subFrameCount, frameIndex } = api
  const subFrameIndex = spacerResolutionMap([frameCount, [subFrameCount, 0]])[
    frameIndex
  ]
  const subFrameStamp = subFrameIndex / subFrameCount
  const subFrameAngle = 2 * Math.PI * subFrameStamp
  return {
    frameCount: subFrameCount,
    frameIndex: subFrameIndex,
    frameStamp: subFrameStamp,
    frameAngle: subFrameAngle,
  }
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

function culledSpacer(someSpacer: Spacer): Spacer {
  return [
    someSpacer[0],
    Array.from(
      someSpacer[1].reduce<Set<SpacerPoint>>(
        (resultPointSet, someSpacerPoint) => {
          const pointZeroDistance = someSpacerPoint
          const pointResolutionDistance = someSpacer[0] - someSpacerPoint
          const mirrorPoint =
            pointZeroDistance <= pointResolutionDistance
              ? (someSpacer[0] - pointZeroDistance) % someSpacer[0]
              : pointResolutionDistance
          if (!resultPointSet.has(mirrorPoint)) {
            resultPointSet.add(someSpacerPoint)
          }
          return resultPointSet
        },
        new Set<SpacerPoint>()
      )
    ),
  ]
}

function triangleSample(inputAngle: number): number {
  const periodStamp = inputAngle / Math.PI
  return 2 * Math.abs(periodStamp - Math.floor(periodStamp + 0.5))
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

function loopAngle(someLoopPoint: LoopPoint) {
  return normalizedAngle(
    Math.atan2(
      someLoopPoint[1] - someLoopPoint[7],
      someLoopPoint[0] - someLoopPoint[6]
    )
  )
}
