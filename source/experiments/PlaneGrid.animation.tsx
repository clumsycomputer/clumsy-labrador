import { AnimationModule } from 'clumsy-graphics'
import React from 'react'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import {
  Vector3,
  getCrossProduct,
  getDotProduct,
  getNormalizedVector,
  getVectorMagnitude,
} from '../library/Vector3'

const PlaneGridAnimationModule: AnimationModule = {
  moduleName: 'Plane-Grid',
  getFrameDescription: getPlaneGridFrameDescription,
  frameCount: 48,
  frameSize: {
    width: 1024,
    height: 1024,
  },
  animationSettings: {
    frameRate: 10,
    constantRateFactor: 1,
  },
}

export default PlaneGridAnimationModule

interface GetPlaneGridFrameDescriptionApi {
  frameCount: number
  frameIndex: number
}

async function getPlaneGridFrameDescription(
  api: GetPlaneGridFrameDescriptionApi
) {
  const { frameCount, frameIndex } = api
  const frameStamp = frameIndex / frameCount
  const frameAngle = 2 * Math.PI * frameStamp
  const planeCellPointsA = getPlaneCellPoints({
    planeCenter: [-1, -3, -3],
    planeNormal: getNormalizedVector([1, 1, 0.25]),
    planeLength: 10,
    planeColor: 'red',
    planeResolution: 128,
    planeWaves: [],
  })
  const planeCellPointsB = getPlaneCellPoints({
    planeCenter: [1, -3, -3],
    planeNormal: getNormalizedVector([-1, 1, 0.25]),
    planeLength: 10,
    planeColor: 'red',
    planeResolution: 128,
    planeWaves: [],
  })
  return (
    <CellGraphic
      cameraDepth={-10}
      lightDepth={30}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      worldCellPoints={[...planeCellPointsA, ...planeCellPointsB]}
    />
  )
}

interface GetPlaneCellPointsApi {
  planeCenter: Vector3
  planeNormal: Vector3
  planeLength: number
  planeResolution: number
  planeColor: string
  planeWaves: Array<{
    waveOrigin: Vector2
    getWaveSample: () => number
  }>
}

type Vector2 = [number, number]

function getPlaneCellPoints(api: GetPlaneCellPointsApi): Array<WorldCellPoint> {
  const { planeLength, planeResolution, planeNormal, planeCenter, planeColor } =
    api
  const startingPlaneNormal: Vector3 = [0, 0, 1]
  const planeLengthHalf = planeLength / 2
  const cellFullSize = planeLength / planeResolution
  const cellSize = cellFullSize / 2
  const rotationAxis = getCrossProduct([0, 0, 1], planeNormal)
  const rotationAngle = Math.acos(
    getDotProduct(startingPlaneNormal, planeNormal) /
      (getVectorMagnitude(startingPlaneNormal) *
        getVectorMagnitude(planeNormal))
  )
  const planeCellPoints: Array<WorldCellPoint> = []
  for (let rowIndex = 0; rowIndex < planeResolution; rowIndex++) {
    const cellY = rowIndex * cellFullSize + cellSize - planeLengthHalf
    for (let columnIndex = 0; columnIndex < planeResolution; columnIndex++) {
      const cellX = columnIndex * cellFullSize + cellSize - planeLengthHalf
      const originDistance = Math.sqrt(cellX * cellX + cellY * cellY)
      let originAngle = Math.atan2(cellY, cellX)
      originAngle = originAngle < 0 ? originAngle + 2 * Math.PI : originAngle
      const maxWaveDistance = Math.sqrt(
        planeLength * planeLength + planeLength * planeLength
      )
      const waveSampleDistanceStamp = originDistance / maxWaveDistance
      const waveSample =
        0.5 * Math.sin(6 * 2 * Math.PI * waveSampleDistanceStamp)
      const rotatedCellVector = getRotatedCellVector(
        rotationAxis,
        rotationAngle,
        [cellX, cellY, waveSample]
      )
      planeCellPoints.push([
        rotatedCellVector[0] + planeCenter[0],
        rotatedCellVector[1] + planeCenter[1],
        rotatedCellVector[2] + planeCenter[2],
        cellSize,
        planeColor,
      ])
    }
  }
  return planeCellPoints
}

function getRotatedCellVector(
  rotationAxis: Vector3,
  rotationAngle: number,
  baseVector: Vector3
): Vector3 {
  const rotationCosine = Math.cos(rotationAngle)
  const rotationSine = Math.sin(rotationAngle)
  const oneMinusRotationCosine = 1 - rotationCosine
  return [
    (rotationAxis[0] * rotationAxis[0] * oneMinusRotationCosine +
      rotationCosine) *
      baseVector[0] +
      (rotationAxis[0] * rotationAxis[1] * oneMinusRotationCosine -
        rotationAxis[2] * rotationSine) *
        baseVector[1] +
      (rotationAxis[0] * rotationAxis[2] * oneMinusRotationCosine +
        rotationAxis[1] * rotationSine) *
        baseVector[2],
    (rotationAxis[0] * rotationAxis[1] * oneMinusRotationCosine +
      rotationAxis[2] * rotationSine) *
      baseVector[0] +
      (rotationAxis[1] * rotationAxis[1] * oneMinusRotationCosine +
        rotationCosine) *
        baseVector[1] +
      (rotationAxis[1] * rotationAxis[2] * oneMinusRotationCosine -
        rotationAxis[0] * rotationSine) *
        baseVector[2],
    (rotationAxis[0] * rotationAxis[2] * oneMinusRotationCosine -
      rotationAxis[1] * rotationSine) *
      baseVector[0] +
      (rotationAxis[1] * rotationAxis[2] * oneMinusRotationCosine +
        rotationAxis[0] * rotationSine) *
        baseVector[1] +
      (rotationAxis[2] * rotationAxis[2] * oneMinusRotationCosine +
        rotationCosine) *
        baseVector[2],
  ]
}
