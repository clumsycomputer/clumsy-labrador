import { AnimationModule } from 'clumsy-graphics'
import React from 'react'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import * as Vector3 from '../library/Vector3'
import * as Vector2 from '../library/Vector2'
import {
  getRhythmSlotWeights,
  getRhythmGroup,
  getRhythmMap,
  getNearestPrimes,
} from 'clumsy-math'
import { Point3, getReflectedPoint } from '../library/Point3'

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
  const planeResolutionA = 48
  const planeLengthA = 10
  const planeCellPointsA = getWaveyPlaneCellPoints({
    planeCenter: [3, 3, -2],
    planeNormal: Vector3.getNormalizedVector([1, 1, 0.5]),
    planeLength: planeLengthA,
    planeColor: 'white',
    planeResolution: planeResolutionA,
    getCellSize: (fullCellSize) => fullCellSize / 3,
    cellCoordinates: [
      ...getRhythmSlotWeights(
        getRhythmGroup({
          baseStructure: {
            structureType: 'initial',
            rhythmResolution: planeResolutionA,
            subStructure: {
              structureType: 'interposed',
              rhythmDensity: getNearestPrimes((planeResolutionA / 4) * 3)[1],
              rhythmOrientation: 0,
            },
          },
          memberStructure: {
            structureType: 'terminal',
            rhythmDensity: getNearestPrimes(planeResolutionA / 2)[1],
          },
        }).map(getRhythmMap)
      ).reduce<Array<[number, number]>>(
        (coordinatesResult, currentSlotWeight, currentSlotIndex) => {
          coordinatesResult.push(
            [currentSlotIndex, currentSlotWeight],
            [planeResolutionA - currentSlotIndex - 1, currentSlotWeight],
            [currentSlotWeight, currentSlotIndex],
            [currentSlotWeight, planeResolutionA - currentSlotIndex - 1],
            [currentSlotIndex, planeResolutionA - currentSlotWeight - 1],
            [
              planeResolutionA - currentSlotIndex - 1,
              planeResolutionA - currentSlotWeight - 1,
            ],
            [planeResolutionA - currentSlotWeight - 1, currentSlotIndex],
            [
              planeResolutionA - currentSlotWeight - 1,
              planeResolutionA - currentSlotIndex - 1,
            ]
          )
          return coordinatesResult
        },
        []
      ),
      ...getRhythmSlotWeights(
        getRhythmGroup({
          baseStructure: {
            structureType: 'initial',
            rhythmResolution: planeResolutionA,
            subStructure: {
              structureType: 'interposed',
              rhythmDensity: getNearestPrimes((planeResolutionA / 4) * 3)[1],
              rhythmOrientation: 0,
            },
          },
          memberStructure: {
            structureType: 'terminal',
            rhythmDensity: getNearestPrimes(planeResolutionA / 2)[0]!,
          },
        }).map(getRhythmMap)
      ).reduce<Array<[number, number]>>(
        (coordinatesResult, currentSlotWeight, currentSlotIndex) => {
          coordinatesResult.push(
            [currentSlotIndex, currentSlotWeight],
            [planeResolutionA - currentSlotIndex - 1, currentSlotWeight],
            [currentSlotWeight, currentSlotIndex],
            [currentSlotWeight, planeResolutionA - currentSlotIndex - 1],
            [currentSlotIndex, planeResolutionA - currentSlotWeight - 1],
            [
              planeResolutionA - currentSlotIndex - 1,
              planeResolutionA - currentSlotWeight - 1,
            ],
            [planeResolutionA - currentSlotWeight - 1, currentSlotIndex],
            [
              planeResolutionA - currentSlotWeight - 1,
              planeResolutionA - currentSlotIndex - 1,
            ]
          )
          return coordinatesResult
        },
        []
      ),
      ...getRhythmSlotWeights(
        getRhythmGroup({
          baseStructure: {
            structureType: 'initial',
            rhythmResolution: planeResolutionA,
            subStructure: {
              structureType: 'interposed',
              rhythmDensity: getNearestPrimes((planeResolutionA / 4) * 3)[0]!,
              rhythmOrientation: 0,
            },
          },
          memberStructure: {
            structureType: 'terminal',
            rhythmDensity: getNearestPrimes(planeResolutionA / 2)[0]!,
          },
        }).map(getRhythmMap)
      ).reduce<Array<[number, number]>>(
        (coordinatesResult, currentSlotWeight, currentSlotIndex) => {
          coordinatesResult.push(
            [currentSlotIndex, currentSlotWeight],
            [planeResolutionA - currentSlotIndex - 1, currentSlotWeight],
            [currentSlotWeight, currentSlotIndex],
            [currentSlotWeight, planeResolutionA - currentSlotIndex - 1],
            [currentSlotIndex, planeResolutionA - currentSlotWeight - 1],
            [
              planeResolutionA - currentSlotIndex - 1,
              planeResolutionA - currentSlotWeight - 1,
            ],
            [planeResolutionA - currentSlotWeight - 1, currentSlotIndex],
            [
              planeResolutionA - currentSlotWeight - 1,
              planeResolutionA - currentSlotIndex - 1,
            ]
          )
          return coordinatesResult
        },
        []
      ),
      ...getRhythmSlotWeights(
        getRhythmGroup({
          baseStructure: {
            structureType: 'initial',
            rhythmResolution: planeResolutionA,
            subStructure: {
              structureType: 'interposed',
              rhythmOrientation: frameIndex % frameCount,
              rhythmDensity: getNearestPrimes((planeResolutionA / 4) * 3)[0]!,
            },
          },
          memberStructure: {
            structureType: 'terminal',
            rhythmDensity: getNearestPrimes(planeResolutionA / 2)[1],
          },
        }).map(getRhythmMap)
      ).reduce<Array<[number, number]>>(
        (coordinatesResult, currentSlotWeight, currentSlotIndex) => {
          coordinatesResult.push(
            [currentSlotIndex, currentSlotWeight],
            [planeResolutionA - currentSlotIndex - 1, currentSlotWeight],
            [currentSlotWeight, currentSlotIndex],
            [currentSlotWeight, planeResolutionA - currentSlotIndex - 1],
            [currentSlotIndex, planeResolutionA - currentSlotWeight - 1],
            [
              planeResolutionA - currentSlotIndex - 1,
              planeResolutionA - currentSlotWeight - 1,
            ],
            [planeResolutionA - currentSlotWeight - 1, currentSlotIndex],
            [
              planeResolutionA - currentSlotWeight - 1,
              planeResolutionA - currentSlotIndex - 1,
            ]
          )
          return coordinatesResult
        },
        []
      ),
    ],
    planeWaves: [
      {
        waveOrigin: [0, 0],
        getWaveSample: (cellAngle, cellDistance) => {
          const waveLength = Vector2.getVectorMagnitude([
            planeLengthA / 2,
            planeLengthA / 2,
          ])
          const sampleStamp = Math.min(cellDistance / waveLength, 1)
          const sampleAngle = 2 * Math.PI * sampleStamp
          const waveFrequency = 220
          const waveAmplitude =
            4 * Math.sin(2 * Math.PI * frameStamp) * (1 - sampleStamp)
          const wavePhase = 2 * Math.PI * frameStamp
          return (
            waveAmplitude * Math.sin(waveFrequency * sampleAngle + wavePhase)
          )
        },
      },
    ],
  })
  const mirrorPointsA = planeCellPointsA.reduce<Array<WorldCellPoint>>(
    (mirrorPointsResult, someCellPoint) => {
      const [baseX, baseY, baseZ, baseSize, baseColor] = someCellPoint
      const basePoint: Point3 = [baseX, baseY, baseZ]
      const reflectedPointY = getReflectedPoint(
        [
          [0, 0, baseZ],
          [0, 1, baseZ],
        ],
        basePoint
      )
      const reflectedPointX = getReflectedPoint(
        [
          [0, 0, baseZ],
          [1, 0, baseZ],
        ],
        basePoint
      )
      const reflectedPointYX = getReflectedPoint(
        [
          [0, 0, baseZ],
          [1, 0, baseZ],
        ],
        reflectedPointY
      )
      mirrorPointsResult.push(
        someCellPoint,
        [...reflectedPointY, baseSize, baseColor],
        [...reflectedPointX, baseSize, baseColor],
        [...reflectedPointYX, baseSize, baseColor]
      )
      return mirrorPointsResult
    },
    []
  )
  return (
    <CellGraphic
      cameraDepth={-9}
      lightDepth={30}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      worldCellPoints={[...mirrorPointsA]}
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
    | 'cellCoordinates'
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
  cellCoordinates: Array<[number, number]>
  getCellSize: (fullCellSize: number) => number
  getCellZ: (cellX: number, cellY: number) => number
}

function getPlaneCellPoints(api: GetPlaneCellPointsApi): Array<WorldCellPoint> {
  const {
    planeLength,
    planeResolution,
    getCellSize,
    planeNormal,
    cellCoordinates,
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
  for (const [columnIndex, rowIndex] of cellCoordinates) {
    const cellX = columnIndex * fullCellSize + cellSize - planeLengthHalf
    const cellY = rowIndex * fullCellSize + cellSize - planeLengthHalf
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
