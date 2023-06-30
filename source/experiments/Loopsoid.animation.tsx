import { AnimationModule } from 'clumsy-graphics'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import React from 'react'
import { sphericalToCartesian } from '../library/Point3'
import { rotatedVector } from '../library/Vector3'
import { prime, primeContainer } from 'clumsy-math'
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
  const cameraDepth = -10
  const loopsoidResolution = 128
  const loopsoidCellsA: Array<WorldCellPoint> = []
  const depthCellAngleStep = Math.PI / loopsoidResolution
  const sliceCellAngleStep = (2 * Math.PI) / loopsoidResolution
  for (let cellIndex = 0; cellIndex < loopsoidResolution; cellIndex++) {
    const depthCellAngle =
      2 * Math.PI * triangleWave(cellIndex * depthCellAngleStep) +
      rootFrameData.frameAngle
    const sliceCellAngleA =
      Math.PI / 3 +
      rootFrameData.frameAngle +
      (Math.PI / 3) *
        Math.sin(
          (211 + rootFrameData.frameIndex * 2) *
            cellIndex *
            sliceCellAngleStep +
            rootFrameData.frameAngle
        )
    const cellBasePointA = sphericalToCartesian(
      Math.cos,
      Math.sin,
      Math.cos,
      Math.sin,
      [
        rangeScopeValue(
          4,
          12,
          1,
          Math.sin(
            211 * cellIndex * sliceCellAngleStep - rootFrameData.frameAngle
          )
        ),
        depthCellAngle,
        sliceCellAngleA,
      ]
    )
    const cellOrientedPointA = rotatedVector(
      [1, 0, 0],
      rootFrameData.frameAngle,
      cellBasePointA
    )
    loopsoidCellsA.push([...cellOrientedPointA, 0.1, 'white'])
    const sliceCellAngleB =
      Math.PI -
      (Math.PI / 3 +
        rootFrameData.frameAngle +
        (Math.PI / 3) *
          Math.sin(
            (211 + rootFrameData.frameIndex * 2) *
              cellIndex *
              sliceCellAngleStep +
              rootFrameData.frameAngle
          ))
    const cellBasePointB = sphericalToCartesian(
      Math.cos,
      Math.sin,
      Math.cos,
      Math.sin,
      [
        rangeScopeValue(
          4,
          12,
          1,
          Math.sin(
            211 * cellIndex * sliceCellAngleStep - rootFrameData.frameAngle
          )
        ),
        depthCellAngle,
        sliceCellAngleB,
      ]
    )
    const cellOrientedPointB = rotatedVector(
      [1, 0, 0],
      rootFrameData.frameAngle,
      cellBasePointB
    )
    loopsoidCellsA.push([...cellOrientedPointB, 0.1, 'white'])
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
