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
  _GetRhythmSlotWeightsApi,
  RhythmGroup,
  RhythmGroupStructure,
  getPrimeContainer,
  getPrimesRangeInclusive,
  InterposedRhythmGroupBaseStructure,
  getLoopPendulum,
  getLoopPoint,
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
  const planeResolutionA = getPrimeContainer(12)
  const planeResolutionHalf = planeResolutionA / 2
  const baseDensitiesA = getPrimesRangeInclusive(
    planeResolutionHalf,
    planeResolutionA
  )
  const terminalDensityA = getNearestPrimes(planeResolutionHalf)[0]!
  const planeLengthA = 15
  const planeCellPointsA = getWaveyPlaneCellPoints({
    // planeCenter: [3, 3, -2],
    // planeNormal: Vector3.getNormalizedVector([1, 1, 0.5]),
    // planeCenter: [2, 2, -2],
    // planeNormal: Vector3.getNormalizedVector([1, 1, 0.35]),
    planeColor: 'white',
    planeLength: planeLengthA,
    planeResolution: planeResolutionA,
    planeCenter: [0, 0, 0],
    planeNormal: Vector3.getNormalizedVector([0, 0, 1]),
    getCellSize: (fullCellSize) => fullCellSize / 2,
    // cellCoordinates: getAllGridCoordinates({
    //   planeResolution: planeResolutionA,
    // }),
    cellCoordinates: new Array(baseDensitiesA.length + 1)
      .fill(undefined)
      .reduce<{
        cellCoordinates: Array<[number, number]>
        remainingBaseDensities: Array<number>
      }>(
        (result, _, layerIndex) => {
          const currentCellCoordinates = getRhythmMatrixCoordinates({
            rhythmGroupStructures: [
              {
                baseStructure: {
                  structureType: 'initial',
                  rhythmResolution: planeResolutionA,
                  subStructure:
                    result.remainingBaseDensities.length === 0
                      ? undefined
                      : result.remainingBaseDensities.reduce<InterposedRhythmGroupBaseStructure | null>(
                          (result, someBaseDensity, baseDensityIndex) => {
                            const nextResult: InterposedRhythmGroupBaseStructure =
                              result === null
                                ? {
                                    structureType: 'interposed',
                                    rhythmOrientation: 0,
                                    rhythmDensity: someBaseDensity,
                                  }
                                : {
                                    structureType: 'interposed',
                                    rhythmOrientation: 0,
                                    rhythmDensity: someBaseDensity,
                                    subStructure: result,
                                  }
                            return nextResult
                          },
                          null
                        ) ?? throwInvalidPathError('planeA.cellCoordinates'),
                },
                memberStructure: {
                  structureType: 'terminal',
                  rhythmDensity: terminalDensityA,
                },
              },
            ],
          })
          const [staleBaseDensity, ...nextRemainingBaseDensities] =
            result.remainingBaseDensities
          return {
            cellCoordinates: [
              ...result.cellCoordinates,
              ...currentCellCoordinates,
            ],
            remainingBaseDensities: nextRemainingBaseDensities,
          }
        },
        {
          cellCoordinates: [],
          remainingBaseDensities: [...baseDensitiesA],
        }
      ).cellCoordinates,
    planeWaves: [
      {
        waveOrigin: [0, 0],
        getWaveSample: (cellDistance, cellAngle) => {
          const waveLength = Vector2.getVectorMagnitude([
            planeLengthA / 2,
            planeLengthA / 2,
          ])
          const sampleStamp = Math.min(cellDistance / waveLength, 1)
          const sampleAngle = 2 * Math.PI * sampleStamp
          const waveFrequency = 0.5
          const waveAmplitude = 2 * 1 - sampleStamp
          const wavePhase = 2 * Math.PI * frameStamp
          return (
            waveAmplitude *
            getLoopPendulum({
              someLoopPoint: getLoopPoint({
                someLoopStructure: {
                  structureType: 'initial',
                  loopBase: { center: [0, 0], radius: 1 },
                  loopRotation: 0,
                  subStructure: {
                    structureType: 'interposed',
                    subOrientation: 0,
                    loopRotation: 2 * Math.PI * frameStamp,
                    relativeSubRadius: 0.875,
                    relativeSubDepth: 1,
                    subPhase: 4 * 2 * Math.PI * frameStamp,
                    subStructure: {
                      structureType: 'terminal',
                      subOrientation: 0,
                      relativeSubRadius: 0.75,
                      relativeSubDepth: 1,
                      subPhase: 2 * Math.PI * frameStamp,
                    },
                  },
                },
                inputAngle: waveFrequency * sampleAngle + wavePhase,
              }),
            })
          )
        },
      },
    ],
  })
  // const mirrorPointsA = getSquareMirrorPoints({
  //   someCellPoints: [...planeCellPointsA],
  // })
  return (
    <CellGraphic
      cameraDepth={-9}
      lightDepth={30}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      worldCellPoints={[...planeCellPointsA]}
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
    getWaveSample: (cellDistance: number, cellAngle) => number
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
        const cellDistance = Vector2.getVectorMagnitude([deltaX, deltaY])
        const cellAngle = Math.atan2(deltaY, deltaX)
        const currentWaveSample = planeWave.getWaveSample(
          cellDistance,
          cellAngle
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

interface GetAllGridCoordinatesApi {
  planeResolution: number
}

function getAllGridCoordinates(api: GetAllGridCoordinatesApi) {
  const { planeResolution } = api
  const gridCoordinates: Array<[number, number]> = []
  for (let rowIndex = 0; rowIndex < planeResolution; rowIndex++) {
    for (let columnIndex = 0; columnIndex < planeResolution; columnIndex++) {
      gridCoordinates.push([rowIndex, columnIndex])
    }
  }
  return gridCoordinates
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

interface GetRhythmMatrixCoordinatesApi {
  rhythmGroupStructures: Array<RhythmGroupStructure>
}

function getRhythmMatrixCoordinates(api: GetRhythmMatrixCoordinatesApi) {
  const { rhythmGroupStructures } = api
  return rhythmGroupStructures.reduce<Array<[number, number]>>(
    (result, someRhythmGroupStructure) => {
      const rhythmResolution =
        someRhythmGroupStructure.baseStructure.rhythmResolution
      return getRhythmSlotWeights(
        getRhythmGroup(someRhythmGroupStructure).map(getRhythmMap)
      ).reduce<Array<[number, number]>>(
        (coordinatesResult, currentSlotWeight, currentSlotIndex) => {
          coordinatesResult.push(
            [currentSlotIndex, currentSlotWeight],
            [rhythmResolution - currentSlotIndex - 1, currentSlotWeight],
            [currentSlotWeight, currentSlotIndex],
            [currentSlotWeight, rhythmResolution - currentSlotIndex - 1],
            [currentSlotIndex, rhythmResolution - currentSlotWeight - 1],
            [
              rhythmResolution - currentSlotIndex - 1,
              rhythmResolution - currentSlotWeight - 1,
            ],
            [rhythmResolution - currentSlotWeight - 1, currentSlotIndex],
            [
              rhythmResolution - currentSlotWeight - 1,
              rhythmResolution - currentSlotIndex - 1,
            ]
          )
          return coordinatesResult
        },
        result
      )
    },
    []
  )
}

interface GetSquareMirrorPointsApi {
  someCellPoints: Array<WorldCellPoint>
}

function getSquareMirrorPoints(api: GetSquareMirrorPointsApi) {
  const { someCellPoints } = api
  return someCellPoints.reduce<Array<WorldCellPoint>>(
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
}

function throwInvalidPathError(errorPath: string): never {
  throw new Error(`invalid path reached: ${errorPath}`)
}

// ...new Array(4)
//   .fill(undefined)
//   .map<GetWaveyPlaneCellPointsApi['planeWaves'][number]>(
//     (_, waveIndex) => {
//       const waveStamp = waveIndex / 4
//       const waveAngle = 2 * Math.PI * waveStamp + Math.PI / 4
//       const waveRingRadius = Vector2.getVectorMagnitude([
//         planeLengthA / 2,
//         planeLengthA / 2,
//       ])
//       return {
//         waveOrigin: [
//           waveRingRadius * Math.cos(waveAngle),
//           waveRingRadius * Math.sin(waveAngle),
//         ],
//         getWaveSample: (cellAngle, cellDistance) => {
//           const waveLength = 2 * waveRingRadius
//           const sampleStamp = Math.min(cellDistance / waveLength, 1)
//           const sampleAngle = 2 * Math.PI * sampleStamp
//           const waveFrequency = 220 / 32
//           const waveAmplitude = 1 - sampleStamp
//           const wavePhase = 2 * Math.PI * frameStamp
//           return (
//             waveAmplitude *
//             Math.sin(waveFrequency * sampleAngle + wavePhase)
//           )
//         },
//       }
//     }
//   ),

// const planeResolutionA = getPrimeContainer(10)
// const planeResolutionHalf = planeResolutionA / 2
// const baseDensitiesA = getPrimesRangeInclusive(
//   planeResolutionHalf,
//   planeResolutionA
// )
// const terminalDensityA = getNearestPrimes(planeResolutionHalf)[0]!
// const planeLengthA = 10
// const planeCellPointsA = getWaveyPlaneCellPoints({
//   // planeCenter: [3, 3, -2],
//   // planeNormal: Vector3.getNormalizedVector([1, 1, 0.5]),
//   // planeCenter: [2, 2, -2],
//   // planeNormal: Vector3.getNormalizedVector([1, 1, 0.35]),
//   planeColor: 'white',
//   planeCenter: [0, 0, 0],
//   planeNormal: Vector3.getNormalizedVector([0, 0, 1]),
//   planeLength: planeLengthA,
//   planeResolution: planeResolutionA,
//   getCellSize: (fullCellSize) => fullCellSize / 2,
//   cellCoordinates: new Array(baseDensitiesA.length + 1)
//     .fill(undefined)
//     .reduce<{
//       cellCoordinates: Array<[number, number]>
//       remainingBaseDensities: Array<number>
//     }>(
//       (result, _, layerIndex) => {
//         const currentCellCoordinates = getRhythmMatrixCoordinates({
//           rhythmGroupStructures: [
//             {
//               baseStructure: {
//                 structureType: 'initial',
//                 rhythmResolution: planeResolutionA,
//                 subStructure:
//                   result.remainingBaseDensities.length === 0
//                     ? undefined
//                     : result.remainingBaseDensities.reduce<InterposedRhythmGroupBaseStructure | null>(
//                         (result, someBaseDensity, baseDensityIndex) => {
//                           const nextResult: InterposedRhythmGroupBaseStructure =
//                             result === null
//                               ? {
//                                   structureType: 'interposed',
//                                   rhythmOrientation: 0,
//                                   rhythmDensity: someBaseDensity,
//                                 }
//                               : {
//                                   structureType: 'interposed',
//                                   rhythmOrientation: 0,
//                                   rhythmDensity: someBaseDensity,
//                                   subStructure: result,
//                                 }
//                           return nextResult
//                         },
//                         null
//                       ) ?? throwInvalidPathError('planeA.cellCoordinates'),
//               },
//               memberStructure: {
//                 structureType: 'terminal',
//                 rhythmDensity: terminalDensityA,
//               },
//             },
//           ],
//         })
//         const [staleBaseDensity, ...nextRemainingBaseDensities] =
//           result.remainingBaseDensities
//         return {
//           cellCoordinates: [
//             ...result.cellCoordinates,
//             ...currentCellCoordinates,
//           ],
//           remainingBaseDensities: nextRemainingBaseDensities,
//         }
//       },
//       {
//         cellCoordinates: [],
//         remainingBaseDensities: [...baseDensitiesA],
//       }
//     ).cellCoordinates,
//   planeWaves: [
//     {
//       waveOrigin: [0, 0],
//       getWaveSample: (cellAngle, cellDistance) => {
//         const waveLength = Vector2.getVectorMagnitude([
//           planeLengthA / 2,
//           planeLengthA / 2,
//         ])
//         const sampleStamp = Math.min(cellDistance / waveLength, 1)
//         const sampleAngle = 2 * Math.PI * sampleStamp
//         const waveFrequency = 220
//         const waveAmplitude =
//           Math.sin(2 * Math.PI * frameStamp) * (1 - sampleStamp)
//         const wavePhase = 2 * Math.PI * frameStamp
//         return (
//           waveAmplitude * Math.sin(waveFrequency * sampleAngle + wavePhase)
//         )
//       },
//     },
//     ...new Array(3)
//       .fill(undefined)
//       .map<GetWaveyPlaneCellPointsApi['planeWaves'][number]>(
//         (_, waveIndex) => {
//           const waveStamp = waveIndex / 3
//           const waveAngle = 2 * Math.PI * waveStamp + Math.PI / 2
//           const waveRingRadius =
//             Vector2.getVectorMagnitude([planeLengthA / 2, planeLengthA / 2]) /
//             2
//           return {
//             waveOrigin: [
//               waveRingRadius * Math.cos(waveAngle),
//               waveRingRadius * Math.sin(waveAngle),
//             ],
//             getWaveSample: (cellAngle, cellDistance) => {
//               const waveLength = (2 * waveRingRadius) / 2
//               const sampleStamp = Math.min(cellDistance / waveLength, 1)
//               const sampleAngle = 2 * Math.PI * sampleStamp
//               const waveFrequency = 220 / 2
//               const waveAmplitude =
//                 Math.sin(2 * Math.PI * frameStamp) * (1 - sampleStamp)
//               const wavePhase = 2 * Math.PI * frameStamp
//               return (
//                 waveAmplitude *
//                 Math.sin(waveFrequency * sampleAngle + wavePhase)
//               )
//             },
//           }
//         }
//       ),
//   ],
// })
