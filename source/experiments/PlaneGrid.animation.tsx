import { AnimationModule } from 'clumsy-graphics'
import React from 'react'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import * as Vector3 from '../library/Vector3'
import * as Vector2 from '../library/Vector2'

const PlaneGridAnimationModule: AnimationModule = {
  moduleName: 'Plane-Grid',
  getFrameDescription: getPlaneGridFrameDescription,
  frameCount: 48 * 3,
  frameSize: {
    width: 2048,
    height: 2048,
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
  const waveDistance = Vector2.getVectorMagnitude([5, 5])
  const waveFrequency = 0.5 + 1.5 * frameStamp
  const planeCellPointsA = getWaveyPlaneCellPoints({
    planeCenter: [-3, -3, -5],
    planeNormal: Vector3.getNormalizedVector([1, 1, 0]),
    planeLength: 15,
    planeColor: 'white',
    planeResolution: 128,
    planeWaves: [
      {
        waveOrigin: [7.5, 7.5],
        getWaveSample: (cellAngle, cellDistance) => {
          const sampleStamp = cellDistance / waveDistance
          const sampleAngle = 2 * Math.PI * sampleStamp
          const sampleAmplitude = 5 * 1 - sampleStamp
          return sampleAmplitude * Math.sin(waveFrequency * sampleAngle)
        },
      },
      {
        waveOrigin: [-7.5, 7.5],
        getWaveSample: (cellAngle, cellDistance) => {
          const sampleStamp = cellDistance / waveDistance
          const sampleAngle = 2 * Math.PI * sampleStamp
          const sampleAmplitude = 5 * 1 - sampleStamp
          return sampleAmplitude * Math.sin(waveFrequency * sampleAngle)
        },
      },
      {
        waveOrigin: [-7.5, -7.5],
        getWaveSample: (cellAngle, cellDistance) => {
          const sampleStamp = cellDistance / waveDistance
          const sampleAngle = 2 * Math.PI * sampleStamp
          const sampleAmplitude = 5 * 1 - sampleStamp
          return sampleAmplitude * Math.sin(waveFrequency * sampleAngle)
        },
      },
      {
        waveOrigin: [7.5, -7.5],
        getWaveSample: (cellAngle, cellDistance) => {
          const sampleStamp = cellDistance / waveDistance
          const sampleAngle = 2 * Math.PI * sampleStamp
          const sampleAmplitude = 5 * 1 - sampleStamp
          return sampleAmplitude * Math.sin(waveFrequency * sampleAngle)
        },
      },
    ],
  })
  const planeCellPointsB = getWaveyPlaneCellPoints({
    planeCenter: [3, -3, -5],
    planeNormal: Vector3.getNormalizedVector([-1, 1, 0]),
    planeLength: 15,
    planeColor: 'white',
    planeResolution: 128,
    planeWaves: [
      {
        waveOrigin: [7.5, 7.5],
        getWaveSample: (cellAngle, cellDistance) => {
          const sampleStamp = cellDistance / waveDistance
          const sampleAngle = 2 * Math.PI * sampleStamp
          const sampleAmplitude = 5 * 1 - sampleStamp
          return sampleAmplitude * Math.sin(waveFrequency * sampleAngle)
        },
      },
      {
        waveOrigin: [-7.5, 7.5],
        getWaveSample: (cellAngle, cellDistance) => {
          const sampleStamp = cellDistance / waveDistance
          const sampleAngle = 2 * Math.PI * sampleStamp
          const sampleAmplitude = 5 * 1 - sampleStamp
          return sampleAmplitude * Math.sin(waveFrequency * sampleAngle)
        },
      },
      {
        waveOrigin: [-7.5, -7.5],
        getWaveSample: (cellAngle, cellDistance) => {
          const sampleStamp = cellDistance / waveDistance
          const sampleAngle = 2 * Math.PI * sampleStamp
          const sampleAmplitude = 5 * 1 - sampleStamp
          return sampleAmplitude * Math.sin(waveFrequency * sampleAngle)
        },
      },
      {
        waveOrigin: [7.5, -7.5],
        getWaveSample: (cellAngle, cellDistance) => {
          const sampleStamp = cellDistance / waveDistance
          const sampleAngle = 2 * Math.PI * sampleStamp
          const sampleAmplitude = 5 * 1 - sampleStamp
          return sampleAmplitude * Math.sin(waveFrequency * sampleAngle)
        },
      },
    ],
  })
  const planeCellPointsC = getWaveyPlaneCellPoints({
    planeCenter: [3, 3, -5],
    planeNormal: Vector3.getNormalizedVector([-1, -1, 0]),
    planeLength: 15,
    planeColor: 'white',
    planeResolution: 128,
    planeWaves: [
      {
        waveOrigin: [7.5, 7.5],
        getWaveSample: (cellAngle, cellDistance) => {
          const sampleStamp = cellDistance / waveDistance
          const sampleAngle = 2 * Math.PI * sampleStamp
          const sampleAmplitude = 5 * 1 - sampleStamp
          return sampleAmplitude * Math.sin(waveFrequency * sampleAngle)
        },
      },
      {
        waveOrigin: [-7.5, 7.5],
        getWaveSample: (cellAngle, cellDistance) => {
          const sampleStamp = cellDistance / waveDistance
          const sampleAngle = 2 * Math.PI * sampleStamp
          const sampleAmplitude = 5 * 1 - sampleStamp
          return sampleAmplitude * Math.sin(waveFrequency * sampleAngle)
        },
      },
      {
        waveOrigin: [-7.5, -7.5],
        getWaveSample: (cellAngle, cellDistance) => {
          const sampleStamp = cellDistance / waveDistance
          const sampleAngle = 2 * Math.PI * sampleStamp
          const sampleAmplitude = 5 * 1 - sampleStamp
          return sampleAmplitude * Math.sin(waveFrequency * sampleAngle)
        },
      },
      {
        waveOrigin: [7.5, -7.5],
        getWaveSample: (cellAngle, cellDistance) => {
          const sampleStamp = cellDistance / waveDistance
          const sampleAngle = 2 * Math.PI * sampleStamp
          const sampleAmplitude = 5 * 1 - sampleStamp
          return sampleAmplitude * Math.sin(waveFrequency * sampleAngle)
        },
      },
    ],
  })
  const planeCellPointsD = getWaveyPlaneCellPoints({
    planeCenter: [-3, 3, -5],
    planeNormal: Vector3.getNormalizedVector([1, -1, 0]),
    planeLength: 15,
    planeColor: 'white',
    planeResolution: 128,
    planeWaves: [
      {
        waveOrigin: [7.5, 7.5],
        getWaveSample: (cellAngle, cellDistance) => {
          const sampleStamp = cellDistance / waveDistance
          const sampleAngle = 2 * Math.PI * sampleStamp
          const sampleAmplitude = 5 * 1 - sampleStamp
          return sampleAmplitude * Math.sin(waveFrequency * sampleAngle)
        },
      },
      {
        waveOrigin: [-7.5, 7.5],
        getWaveSample: (cellAngle, cellDistance) => {
          const sampleStamp = cellDistance / waveDistance
          const sampleAngle = 2 * Math.PI * sampleStamp
          const sampleAmplitude = 5 * 1 - sampleStamp
          return sampleAmplitude * Math.sin(waveFrequency * sampleAngle)
        },
      },
      {
        waveOrigin: [-7.5, -7.5],
        getWaveSample: (cellAngle, cellDistance) => {
          const sampleStamp = cellDistance / waveDistance
          const sampleAngle = 2 * Math.PI * sampleStamp
          const sampleAmplitude = 5 * 1 - sampleStamp
          return sampleAmplitude * Math.sin(waveFrequency * sampleAngle)
        },
      },
      {
        waveOrigin: [7.5, -7.5],
        getWaveSample: (cellAngle, cellDistance) => {
          const sampleStamp = cellDistance / waveDistance
          const sampleAngle = 2 * Math.PI * sampleStamp
          const sampleAmplitude = 5 * 1 - sampleStamp
          return sampleAmplitude * Math.sin(waveFrequency * sampleAngle)
        },
      },
    ],
  })
  return (
    <CellGraphic
      cameraDepth={-10}
      lightDepth={30}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      worldCellPoints={[
        ...planeCellPointsA,
        ...planeCellPointsB,
        ...planeCellPointsC,
        ...planeCellPointsD,
      ]}
    />
  )
}

interface GetWaveyPlaneCellPointsApi
  extends Pick<
    GetPlaneCellPointsApi,
    | 'planeCenter'
    | 'planeNormal'
    | 'planeLength'
    | 'planeResolution'
    | 'planeColor'
  > {
  planeWaves: Array<{
    waveOrigin: Vector2.Vector2
    getWaveSample: (cellAngle: number, cellDistance: number) => number
  }>
}

function getWaveyPlaneCellPoints(api: GetWaveyPlaneCellPointsApi) {
  const { planeWaves, ...unadjustedPlaneCellPointsApi } = api
  return getPlaneCellPoints({
    ...unadjustedPlaneCellPointsApi,
    getCellZ: (cellX, cellY) => {
      let accumulatedWaveSample = 0
      for (let planeWave of planeWaves) {
        const [waveX, waveY] = planeWave.waveOrigin
        const deltaX = cellX - waveX
        const deltaY = cellY - waveY
        const unadjustedCellAngle = Math.atan2(deltaY, deltaX)
        const cellAngle =
          unadjustedCellAngle < 0
            ? unadjustedCellAngle + 2 * Math.PI
            : unadjustedCellAngle
        const cellDistance = Vector2.getVectorMagnitude([deltaX, deltaY])
        const currentWaveSample = planeWave.getWaveSample(
          cellAngle,
          cellDistance
        )
        accumulatedWaveSample = accumulatedWaveSample + currentWaveSample
      }
      return accumulatedWaveSample / planeWaves.length
    },
  })
}

interface GetPlaneCellPointsApi {
  planeCenter: Vector3.Vector3
  planeNormal: Vector3.Vector3
  planeLength: number
  planeResolution: number
  planeColor: string
  getCellZ: (cellX: number, cellY: number) => number
}

function getPlaneCellPoints(api: GetPlaneCellPointsApi): Array<WorldCellPoint> {
  const {
    planeLength,
    planeResolution,
    planeNormal,
    planeCenter,
    getCellZ,
    planeColor,
  } = api
  const startingPlaneNormal: Vector3.Vector3 = [0, 0, 1]
  const planeLengthHalf = planeLength / 2
  const cellFullSize = planeLength / planeResolution
  const cellSize = cellFullSize / 2
  const rotationAxis = Vector3.getCrossProduct([0, 0, 1], planeNormal)
  const rotationAngle = Math.acos(
    Vector3.getDotProduct(startingPlaneNormal, planeNormal) /
      (Vector3.getVectorMagnitude(startingPlaneNormal) *
        Vector3.getVectorMagnitude(planeNormal))
  )
  const planeCellPoints: Array<WorldCellPoint> = []
  for (let rowIndex = 0; rowIndex < planeResolution; rowIndex++) {
    const cellY = rowIndex * cellFullSize + cellSize - planeLengthHalf
    for (let columnIndex = 0; columnIndex < planeResolution; columnIndex++) {
      const cellX = columnIndex * cellFullSize + cellSize - planeLengthHalf
      const cellZ = getCellZ(cellX, cellY)
      const rotatedCellVector = getRotatedCellVector(
        rotationAxis,
        rotationAngle,
        [cellX, cellY, cellZ]
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
  rotationAxis: Vector3.Vector3,
  rotationAngle: number,
  baseVector: Vector3.Vector3
): Vector3.Vector3 {
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
