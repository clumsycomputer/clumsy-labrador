import { AnimationModule } from 'clumsy-graphics'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import React from 'react'
import { sphericalToCartesian } from '../library/Point3'
import { rotatedVector } from '../library/Vector3'
import {
  AlignedSpacerStructure,
  prime,
  primeContainer,
  spacer,
  spacerIntervals,
  spacerSymmetricSlotWeights,
} from 'clumsy-math'
import { normalizedAngle } from '../library/miscellaneous'
import getColormap from 'colormap'

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
    width: 1024 * 1,
    height: 1024 * 1,
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
  const cameraDepth = -10
  const loopsoidResolution = 2048
  const loopsoidCellsA: Array<WorldCellPoint> = []
  const depthCellAngleStep = Math.PI / loopsoidResolution
  const sliceCellAngleStep = (2 * Math.PI) / loopsoidResolution
  for (let cellIndex = 0; cellIndex < loopsoidResolution; cellIndex++) {
    const depthCellAngle =
      42 * 2 * Math.PI * triangleWave(cellIndex * depthCellAngleStep) +
      rootFrameData.frameAngle
    const sliceCellAngleA =
      (Math.PI / 12) * Math.sin(cellIndex * sliceCellAngleStep) + Math.PI
    const cellBasePointA = sphericalToCartesian(
      Math.cos,
      Math.sin,
      Math.cos,
      Math.sin,
      [4, depthCellAngle, sliceCellAngleA]
    )
    const cellOrientedPointA = rotatedVector(
      [1, 0, 0],
      rootFrameData.frameAngle,
      cellBasePointA
    )
    const cellColor = 'white'
    loopsoidCellsA.push([...cellOrientedPointA, 0.075, cellColor])
  }
  return (
    <CellGraphic
      cameraDepth={cameraDepth}
      lightDepth={500}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      backgroundColor={'black'}
      worldCellPoints={loopsoidCellsA}
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

interface GetrootFrameDatapi {
  frameCount: number
  frameIndex: number
  subFrameCount: number
}

function getSubFrameData(api: GetrootFrameDatapi) {
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

function triangleWave(inputAngle: number): number {
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
