import { AnimationModule } from 'clumsy-graphics'
import React from 'react'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import * as Vector3 from '../library/Vector3'
import * as Vector2 from '../library/Vector2'
import { getReflectedPoint } from '../library/Point3'

const PlaneGridAnimationModule: AnimationModule = {
  moduleName: 'Plane-Grid',
  getFrameDescription: getPlaneGridFrameDescription,
  frameCount: 48,
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
  const planeCellPointsA = getWaveyPlaneCellPoints({
    planeCenter: [4, 4, -3],
    planeNormal: Vector3.getNormalizedVector([1, 1, 0]),
    planeLength: 10,
    getCellSize: (fullCellSize) => fullCellSize / 3,
    planeColor: 'white',
    planeResolution: 48,
    planeWaves: [
      ...new Array(4).fill(undefined).map<any>((_, waveIndex) => {
        const waveRingRadius = Vector2.getVectorMagnitude([5, 5])
        const waveRingStamp = waveIndex / 4
        return {
          waveOrigin: [
            waveRingRadius *
              Math.cos(2 * Math.PI * waveRingStamp + Math.PI / 4),
            waveRingRadius *
              Math.sin(2 * Math.PI * waveRingStamp + Math.PI / 4),
          ],
          getWaveSample: (cellAngle, cellDistance) => {
            const waveDistance = 2 * waveRingRadius
            const waveFrequency = 220 / 64
            const sampleStamp = Math.min(cellDistance / waveDistance, 1)
            const sampleAngle = 2 * Math.PI * sampleStamp
            const sampleAmplitude = 1 - 1 * sampleStamp
            return (
              sampleAmplitude *
              Math.sin(waveFrequency * sampleAngle + 2 * Math.PI * frameStamp)
            )
          },
        }
      }),
    ],
  })
  const planeCellPointsB = getWaveyPlaneCellPoints({
    planeCenter: [4, 4, -2],
    planeNormal: Vector3.getNormalizedVector([1, 1, 0]),
    planeLength: 10,
    getCellSize: (fullCellSize) => fullCellSize / 3,
    planeColor: 'white',
    planeResolution: 96,
    planeWaves: [
      ...new Array(4).fill(undefined).map<any>((_, waveIndex) => {
        const waveRingRadius = Vector2.getVectorMagnitude([5, 5])
        const waveRingStamp = waveIndex / 4
        return {
          waveOrigin: [
            waveRingRadius *
              Math.cos(2 * Math.PI * waveRingStamp + Math.PI / 4),
            waveRingRadius *
              Math.sin(2 * Math.PI * waveRingStamp + Math.PI / 4),
          ],
          getWaveSample: (cellAngle, cellDistance) => {
            const waveDistance = 2 * waveRingRadius
            const waveFrequency = 220 / 32
            const sampleStamp = Math.min(cellDistance / waveDistance, 1)
            const sampleAngle = 2 * Math.PI * sampleStamp
            const sampleAmplitude = 1 - 1 * sampleStamp
            return (
              sampleAmplitude *
              Math.sin(
                waveFrequency * sampleAngle +
                  2 * Math.PI * frameStamp +
                  Math.PI / 3
              )
            )
          },
        }
      }),
    ],
  })
  const mirrorPoints = [...planeCellPointsA, ...planeCellPointsB].reduce<
    Array<WorldCellPoint>
  >((result, baseCellPoint) => {
    const [cellX, cellY, cellZ, cellSize, cellColor] = baseCellPoint
    const reflectedPointY = getReflectedPoint(
      [
        [0, 0, cellZ],
        [0, 1, cellZ],
      ],
      [cellX, cellY, cellZ]
    )
    const reflectedPointX = getReflectedPoint(
      [
        [0, 0, cellZ],
        [1, 0, cellZ],
      ],
      [cellX, cellY, cellZ]
    )
    const reflectedPointYX = getReflectedPoint(
      [
        [0, 0, cellZ],
        [0, 1, cellZ],
      ],
      reflectedPointX
    )
    result.push(
      baseCellPoint,
      [...reflectedPointY, cellSize, cellColor],
      [...reflectedPointX, cellSize, cellColor],
      [...reflectedPointYX, cellSize, cellColor]
    )
    return result
  }, [])
  const planeCellPointsC = getWaveyPlaneCellPoints({
    planeCenter: [0, 0, 0],
    planeNormal: Vector3.getNormalizedVector([0, 0, 1]),
    planeLength: 10,
    getCellSize: (fullCellSize) => fullCellSize / 2,
    planeColor: 'white',
    planeResolution: 48 * 3,
    planeWaves: [
      ...new Array(4).fill(undefined).map<any>((_, waveIndex) => {
        const waveRingRadius = Vector2.getVectorMagnitude([5, 5])
        const waveRingStamp = waveIndex / 4
        return {
          waveOrigin: [
            waveRingRadius *
              Math.cos(2 * Math.PI * waveRingStamp + Math.PI / 4),
            waveRingRadius *
              Math.sin(2 * Math.PI * waveRingStamp + Math.PI / 4),
          ],
          getWaveSample: (cellAngle, cellDistance) => {
            const waveDistance = 2 * waveRingRadius
            const waveFrequency = 220
            const sampleStamp = Math.min(cellDistance / waveDistance, 1)
            const sampleAngle = 2 * Math.PI * sampleStamp
            const sampleAmplitude = 1 - 1 * sampleStamp
            return (
              sampleAmplitude *
              Math.sin(waveFrequency * sampleAngle + 2 * Math.PI * frameStamp)
            )
          },
        }
      }),
    ],
  })
  return (
    <CellGraphic
      cameraDepth={-9}
      lightDepth={30}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      worldCellPoints={[...mirrorPoints, ...planeCellPointsC]}
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
    | 'getCellSize'
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
      return accumulatedWaveSample
    },
  })
}

interface GetPlaneCellPointsApi {
  planeCenter: Vector3.Vector3
  planeNormal: Vector3.Vector3
  planeLength: number
  planeResolution: number
  planeColor: string
  getCellSize: (fullCellSize: number) => number
  getCellZ: (cellX: number, cellY: number) => number
}

function getPlaneCellPoints(api: GetPlaneCellPointsApi): Array<WorldCellPoint> {
  const {
    planeLength,
    planeResolution,
    getCellSize,
    planeNormal,
    planeCenter,
    getCellZ,
    planeColor,
  } = api
  const startingPlaneNormal: Vector3.Vector3 = [0, 0, 1]
  const planeLengthHalf = planeLength / 2
  const fullCellSize = planeLength / planeResolution
  const cellSize = getCellSize(fullCellSize)
  const rotationAxis = Vector3.getCrossProduct([0, 0, 1], planeNormal)
  const rotationAngle = Math.acos(
    Vector3.getDotProduct(startingPlaneNormal, planeNormal) /
      (Vector3.getVectorMagnitude(startingPlaneNormal) *
        Vector3.getVectorMagnitude(planeNormal))
  )
  const planeCellPoints: Array<WorldCellPoint> = []
  for (let rowIndex = 0; rowIndex < planeResolution; rowIndex++) {
    const cellY = rowIndex * fullCellSize + cellSize - planeLengthHalf
    for (let columnIndex = 0; columnIndex < planeResolution; columnIndex++) {
      const cellX = columnIndex * fullCellSize + cellSize - planeLengthHalf
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
