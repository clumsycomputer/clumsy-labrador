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
  loopPendulum,
  loopPoint,
  loopSine,
  spacer,
  spacerGroup,
  spacerIntervals,
  spacerLineage,
  spacerSlotWeights,
} from 'clumsy-math'
import { normalizedAngle } from '../library/miscellaneous'
import { AnimationModule } from 'clumsy-graphics'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import React from 'react'
import { sphericalToCartesian } from '../library/Point3'
import { normalizedVector, rotatedVector } from '../library/Vector3'

const animationFrameCount = 64 * 8
const animationFrameRate = 20
const clipStartFrameIndex = 64 * 0
const clipFinishFrameIndex = animationFrameCount
const clipFrameCount = clipFinishFrameIndex - clipStartFrameIndex

const LapsesAnimationModule: AnimationModule = {
  moduleName: 'Lapses',
  getFrameDescription: getLapsesFrameDescription,
  frameCount: clipFrameCount,
  frameSize: {
    width: 1024 * 4,
    height: 1024 * 4,
  },
  animationSettings: {
    frameRate: animationFrameRate,
    constantRateFactor: 1,
  },
}

export default LapsesAnimationModule

interface GetLapsesFrameDescriptionProps {
  frameCount: number
  frameIndex: number
}

async function getLapsesFrameDescription(
  props: GetLapsesFrameDescriptionProps
) {
  const rootFrameData = getFrameData({
    frameCount: animationFrameCount,
    frameIndex: clipStartFrameIndex + props.frameIndex,
  })
  const cameraDepth = -8
  //   const contortionCellsA = getContortionCells({
  //     frameAngle: rootFrameData.frameAngle,
  //     sliceRangeAngle: Math.PI / 3,
  //     cellSize: 0.35,
  //     loopsoidRadius: 4,
  //     loopsoidResolution: 256,
  //     loopsoidLoopStructure: [
  //       [0.975, LOOP_ZERO, 0, 0, 0],
  //       [0.95, 0.5, 0, 0, 0],
  //       [0.9, LOOP_ONE, 0, 0, 0],
  //     ],
  //   })
  const contortionCellsB = getContortionCells({
    frameAngle: rootFrameData.frameAngle,
    sliceRangeAngle: Math.PI / 3,
    cellSize: 0.35,
    loopsoidRadius: 4,
    loopsoidResolution: 256,
    loopsoidLoopStructure: [
      [0.975, LOOP_ZERO, Math.PI / 3, rootFrameData.frameAngle, 0],
      [
        0.95,
        0.5,
        Math.PI / 5,
        normalizedAngle(-2 * rootFrameData.frameAngle),
        0,
      ],
      [
        0.9,
        LOOP_ONE,
        Math.PI / 6,
        normalizedAngle(4 * rootFrameData.frameAngle),
        0,
      ],
    ],
  })
  return (
    <CellGraphic
      cameraDepth={cameraDepth}
      lightDepth={500}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      backgroundColor={'black'}
      worldCellPoints={[
        // ...contortionCellsA,
        ...contortionCellsB,
      ]}
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

interface GetContortionCellsApi {
  frameAngle: number
  sliceRangeAngle: number
  loopsoidResolution: number
  loopsoidRadius: number
  loopsoidLoopStructure: LoopStructure
  cellSize: number
}

function getContortionCells(api: GetContortionCellsApi) {
  const {
    loopsoidResolution,
    loopsoidRadius,
    loopsoidLoopStructure,
    frameAngle,
    cellSize,
    sliceRangeAngle,
  } = api
  const resultCells: Array<WorldCellPoint> = []
  const depthCellAngleRange = 2 * Math.PI
  const depthCellAngleStep = depthCellAngleRange / loopsoidResolution
  const sliceCellAngleStep = (2 * Math.PI) / loopsoidResolution
  const sliceRadiusAngleStep = (2 * Math.PI) / loopsoidResolution
  const loopsoidAngle = (inputAngle: number) =>
    loopAngle(loopPoint(loopsoidLoopStructure, normalizedAngle(inputAngle)))
  const loopsoidCosine = (inputAngle: number) =>
    loopCosine(loopPoint(loopsoidLoopStructure, loopsoidAngle(inputAngle)))
  const loopsoidSine = (inputAngle: number) =>
    loopSine(loopPoint(loopsoidLoopStructure, loopsoidAngle(inputAngle)))
  for (let cellIndex = 0; cellIndex < loopsoidResolution; cellIndex++) {
    const depthCellAngle =
      2 * Math.PI * triangleSample(cellIndex * depthCellAngleStep)
    const sliceAngleOrigin = frameAngle
    const sliceCellAngleDelta = sliceRangeAngle * loopsoidCosine(frameAngle)
    const sliceCellAngleA = sliceAngleOrigin + sliceCellAngleDelta
    const sliceCellAngleB = sliceAngleOrigin - sliceCellAngleDelta
    const sliceCellBasePointA = sphericalToCartesian(
      loopsoidCosine,
      loopsoidSine,
      loopsoidCosine,
      loopsoidSine,
      [loopsoidRadius, depthCellAngle, sliceCellAngleA]
    )
    const sliceCellBasePointB = sphericalToCartesian(
      loopsoidCosine,
      loopsoidSine,
      loopsoidCosine,
      loopsoidSine,
      [loopsoidRadius, depthCellAngle, sliceCellAngleB]
    )
    const sliceCellOrientedPointA = rotatedVector(
      normalizedVector(
        rotatedVector(sliceCellBasePointA, frameAngle, [1, 0, 0])
      ),
      frameAngle,
      sliceCellBasePointA
    )
    const sliceCellOrientedPointB = rotatedVector(
      normalizedVector(
        rotatedVector(sliceCellBasePointB, frameAngle, [1, 0, 0])
      ),
      frameAngle,
      sliceCellBasePointB
    )
    const sliceCellRotatedPointA = rotatedVector(
      normalizedVector([Math.cos(frameAngle), Math.sin(frameAngle), 0]),
      frameAngle,
      sliceCellOrientedPointA
    )
    const sliceCellRotatedPointB = rotatedVector(
      normalizedVector([Math.cos(frameAngle), Math.sin(frameAngle), 0]),
      frameAngle,
      sliceCellOrientedPointB
    )
    resultCells.push([...sliceCellRotatedPointA, cellSize, 'white'])
    resultCells.push([...sliceCellRotatedPointB, cellSize, 'white'])
  }
  return resultCells
}
