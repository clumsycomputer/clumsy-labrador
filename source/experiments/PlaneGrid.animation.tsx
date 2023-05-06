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
  LoopStructure,
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
  const planeResolutionA = getPrimeContainer(8)
  const planeResolutionHalfA = Math.floor(planeResolutionA / 2)
  const baseDensitiesA = getPrimesRangeInclusive(
    planeResolutionHalfA,
    planeResolutionA
  )
  const terminalDensityA = getNearestPrimes(planeResolutionHalfA)[0]!
  const slotWeightsA = rhythmSlotWeights({
    baseStructure: {
      structureType: 'initial',
      rhythmResolution: planeResolutionA,
      subStructure:
        baseDensitiesA.reduce<InterposedRhythmGroupBaseStructure | null>(
          (result, someBaseDensity) => {
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
        ) ?? throwInvalidPathError('groupStructureA'),
    },
    memberStructure: {
      structureType: 'terminal',
      rhythmDensity: terminalDensityA,
    },
  })
  const planeCellPointsA = getWaveyPlaneCellPoints({
    planeColor: 'white',
    planeResolution: planeResolutionA,
    planeLength: 15,
    planeCenter: [0, 0, 0],
    planeNormal: [0, 0, 1],
    getCellSize: (fullCellSize) => fullCellSize / 2,
    planeLayers: [
      {
        cellCoordinates: getAllGridCoordinates({
          planeResolution: planeResolutionA,
        }),
        // cellCoordinates: getRhythmMatrixCoordinates(slotWeightsA),
        layerWaves: [
          ...slotWeightsA
            .map<Array<WaveyCellLayer['layerWaves'][number]>>(
              (someSlotWeight, slotIndex) => {
                const slotStamp = slotIndex / slotWeightsA.length
                const baseSlotAngle = 2 * Math.PI * slotStamp
                const slotAngleA = baseSlotAngle + Math.PI / 2
                const slotAngleB = -baseSlotAngle + Math.PI / 2
                const weightStamp = someSlotWeight / slotWeightsA[0]
                const waveFrequency = someSlotWeight / 1.5
                // neutralizes the pattern
                // const waveFrequency = 220 / Math.pow(2, someSlotWeight)
                const waveAmplitude = weightStamp / 2
                const slotPhase = 2 * Math.PI * slotStamp
                const framePhase = 2 * Math.PI * frameStamp
                const wavePhase = framePhase + slotPhase
                const layerRingRadius = Vector2.getVectorMagnitude([
                  planeResolutionHalfA,
                  planeResolutionHalfA,
                ])
                // const slotRadius = (1 - weightStamp) * layerRingRadius
                const slotRadius = weightStamp * layerRingRadius
                const waveLength = layerRingRadius
                const getSlotWaveSample = (cellDistance: number) => {
                  const sampleStamp = Math.min(cellDistance / waveLength, 1)
                  const sampleAngle = 2 * Math.PI * sampleStamp
                  const waveAngle = waveFrequency * sampleAngle + wavePhase
                  return (
                    waveAmplitude *
                    pendulum(
                      {
                        structureType: 'initial',
                        loopBase: { center: [0, 0], radius: 1 },
                        loopRotation: 0,
                        subStructure: {
                          structureType: 'interposed',
                          subOrientation: 0,
                          loopRotation: -framePhase,
                          relativeSubRadius: 0.95,
                          relativeSubDepth: 1,
                          subPhase: -framePhase + slotPhase,
                          subStructure: {
                            structureType: 'interposed',
                            subOrientation: slotPhase,
                            loopRotation: 2 * -framePhase,
                            relativeSubRadius: 0.875,
                            relativeSubDepth: 1,
                            subPhase: 2 * -framePhase + slotPhase,
                            subStructure: {
                              structureType: 'terminal',
                              relativeSubRadius: 0.75,
                              relativeSubDepth: 1,
                              subOrientation: 2 * slotPhase,
                              subPhase: 4 * -framePhase + slotPhase,
                            },
                          },
                        },
                      },
                      waveAngle
                    )
                  )
                }
                return [
                  {
                    waveOrigin: [
                      slotRadius * Math.cos(slotAngleA),
                      slotRadius * Math.sin(slotAngleA),
                    ],
                    getWaveSample: getSlotWaveSample,
                  },
                  {
                    waveOrigin: [
                      slotRadius * Math.cos(slotAngleB),
                      slotRadius * Math.sin(slotAngleB),
                    ],
                    getWaveSample: getSlotWaveSample,
                  },
                ]
              }
            )
            .flat(),
        ],
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

function pendulum(someLoopStructure: LoopStructure, inputAngle: number) {
  return getLoopPendulum({
    someLoopPoint: getLoopPoint({
      someLoopStructure,
      inputAngle,
    }),
  })
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
  planeLayers: Array<WaveyCellLayer>
}

interface WaveyCellLayer extends Pick<CellLayer, 'cellCoordinates'> {
  layerWaves: Array<{
    waveOrigin: Vector2.Vector2
    getWaveSample: (cellDistance: number) => number
  }>
}

function getWaveyPlaneCellPoints(api: GetWaveyPlaneCellPointsApi) {
  const { planeLayers, ...unadjustedPlaneCellPointsApi } = api
  return getPlaneCellPoints({
    ...unadjustedPlaneCellPointsApi,
    planeLayers: planeLayers.map((someCellLayer) => {
      return {
        cellCoordinates: someCellLayer.cellCoordinates,
        getCellZ: (cellX, cellY) => {
          let accumulatedWaveSample = 0
          for (let someLayerWave of someCellLayer.layerWaves) {
            const [waveX, waveY] = someLayerWave.waveOrigin
            const deltaX = cellX - waveX
            const deltaY = cellY - waveY
            const cellDistance = Vector2.getVectorMagnitude([deltaX, deltaY])
            const currentWaveSample = someLayerWave.getWaveSample(cellDistance)
            accumulatedWaveSample = accumulatedWaveSample + currentWaveSample
          }
          return accumulatedWaveSample
        },
      }
    }),
  })
}

interface GetPlaneCellPointsApi {
  planeCenter: Vector3.Vector3
  planeNormal: Vector3.Vector3
  planeLength: number
  planeResolution: number
  planeColor: string
  planeLayers: Array<CellLayer>
  getCellSize: (fullCellSize: number) => number
}

interface CellLayer {
  cellCoordinates: Array<[number, number]>
  getCellZ: (cellX: number, cellY: number) => number
}

function getPlaneCellPoints(api: GetPlaneCellPointsApi): Array<WorldCellPoint> {
  const {
    planeLength,
    planeResolution,
    getCellSize,
    planeNormal,
    planeLayers,
    planeCenter,
    planeColor,
  } = api
  const startingPlaneNormal: Vector3.Vector3 = [0, 0, 1]
  const planeLengthHalf = planeLength / 2
  const fullCellSize = planeLength / planeResolution
  const cellSize = getCellSize(fullCellSize)
  const cellCoordinatesMap: Record<string, Vector3.Vector3> = {}
  for (const currentCellLayer of planeLayers) {
    for (const [indexX, indexY] of currentCellLayer.cellCoordinates) {
      const currentCoordinatesKey = `${indexX},${indexY}`
      const targetCellBaseVector = cellCoordinatesMap[currentCoordinatesKey]
      if (targetCellBaseVector === undefined) {
        const cellX = indexX * fullCellSize + cellSize - planeLengthHalf
        const cellY = indexY * fullCellSize + cellSize - planeLengthHalf
        cellCoordinatesMap[currentCoordinatesKey] = [
          cellX,
          cellY,
          currentCellLayer.getCellZ(cellX, cellY),
        ]
      } else {
        targetCellBaseVector[2] =
          targetCellBaseVector[2] +
          currentCellLayer.getCellZ(
            targetCellBaseVector[0],
            targetCellBaseVector[1]
          )
      }
    }
  }
  const rotationAxis = Vector3.getCrossProduct([0, 0, 1], planeNormal)
  const rotationAngle = Math.acos(
    Vector3.getDotProduct(startingPlaneNormal, planeNormal) /
      (Vector3.getVectorMagnitude(startingPlaneNormal) *
        Vector3.getVectorMagnitude(planeNormal))
  )
  const planeCellPoints: Array<WorldCellPoint> = []
  for (const cellBaseVector of Object.values(cellCoordinatesMap)) {
    const rotatedCellVector = getRotatedCellVector(
      rotationAxis,
      rotationAngle,
      cellBaseVector
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

function rhythmSlotWeights(someRhythmGroupStructure: RhythmGroupStructure) {
  return getRhythmSlotWeights(
    getRhythmGroup(someRhythmGroupStructure).map(getRhythmMap)
  )
}

function getRhythmMatrixCoordinates(
  someRhythmSlotWeights: ReturnType<typeof rhythmSlotWeights>
): Array<[number, number]> {
  const rhythmResolution = someRhythmSlotWeights.length
  return Array.from(
    someRhythmSlotWeights.reduce<Set<[number, number]>>(
      (coordinatesResult, currentSlotWeight, currentSlotIndex) => {
        const cellA: [number, number] = [currentSlotIndex, currentSlotWeight]
        if (!coordinatesResult.has(cellA)) {
          coordinatesResult.add(cellA)
        }
        const cellB: [number, number] = [
          rhythmResolution - currentSlotIndex - 1,
          currentSlotWeight,
        ]
        if (!coordinatesResult.has(cellB)) {
          coordinatesResult.add(cellB)
        }
        const cellC: [number, number] = [currentSlotWeight, currentSlotIndex]
        if (!coordinatesResult.has(cellC)) {
          coordinatesResult.add(cellC)
        }
        const cellD: [number, number] = [
          currentSlotWeight,
          rhythmResolution - currentSlotIndex - 1,
        ]
        if (!coordinatesResult.has(cellD)) {
          coordinatesResult.add(cellD)
        }
        const cellE: [number, number] = [
          currentSlotIndex,
          rhythmResolution - currentSlotWeight - 1,
        ]
        if (!coordinatesResult.has(cellE)) {
          coordinatesResult.add(cellE)
        }
        const cellF: [number, number] = [
          rhythmResolution - currentSlotIndex - 1,
          rhythmResolution - currentSlotWeight - 1,
        ]
        if (!coordinatesResult.has(cellF)) {
          coordinatesResult.add(cellF)
        }
        const cellG: [number, number] = [
          rhythmResolution - currentSlotWeight - 1,
          currentSlotIndex,
        ]
        if (!coordinatesResult.has(cellG)) {
          coordinatesResult.add(cellG)
        }
        const cellH: [number, number] = [
          rhythmResolution - currentSlotWeight - 1,
          rhythmResolution - currentSlotIndex - 1,
        ]
        if (!coordinatesResult.has(cellH)) {
          coordinatesResult.add(cellH)
        }
        return coordinatesResult
      },
      new Set()
    )
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

// const planeResolutionA = getPrimeContainer(8)
// const planeResolutionHalf = planeResolutionA / 2
// const terminalDensityA = getNearestPrimes(planeResolutionHalf)[0]!
// const baseDensitiesA = getPrimesRangeInclusive(
//   planeResolutionHalf,
//   planeResolutionA
// )
// // console.log(getPrimesRangeInclusive(2, planeResolutionHalf))
// // const terminalDensityA = getNearestPrimes(planeResolutionHalf)[0]!
// const planeLengthA = 10
// const planeCellPointsA = getWaveyPlaneCellPoints({
//   // planeCenter: [3, 3, -2],
//   // planeNormal: Vector3.getNormalizedVector([1, 1, 0.5]),
//   // planeCenter: [2, 2, -2],
//   // planeNormal: Vector3.getNormalizedVector([1, 1, 0.35]),
//   planeColor: 'white',
//   planeLength: planeLengthA,
//   planeResolution: planeResolutionA,
//   planeCenter: [0, 0, 0],
//   planeNormal: Vector3.getNormalizedVector([0, 0, 1]),
//   getCellSize: (fullCellSize) => fullCellSize / 2,
//   cellLayers: new Array(baseDensitiesA.length + 1)
//     .fill(undefined)
//     .map<WaveyCellLayer>((_, layerIndex) => {
//       const layerBaseDensities = baseDensitiesA.slice(layerIndex)
//       const layerStamp = layerIndex / (baseDensitiesA.length + 1)
//       const layerPhase = 2 * Math.PI * layerStamp
//       const layerRingRadius =
//         layerStamp *
//         Vector2.getVectorMagnitude([planeLengthA / 2, planeLengthA / 2])
//       const layerRhythmSlotWeights = rhythmSlotWeights({
//         baseStructure: {
//           structureType: 'initial',
//           rhythmResolution: planeResolutionA,
//           subStructure:
//             layerBaseDensities.length === 0
//               ? undefined
//               : layerBaseDensities.reduce<InterposedRhythmGroupBaseStructure | null>(
//                   (result, someBaseDensity, baseDensityIndex) => {
//                     const nextResult: InterposedRhythmGroupBaseStructure =
//                       result === null
//                         ? {
//                             structureType: 'interposed',
//                             rhythmOrientation: 0,
//                             rhythmDensity: someBaseDensity,
//                           }
//                         : {
//                             structureType: 'interposed',
//                             rhythmOrientation: 0,
//                             rhythmDensity: someBaseDensity,
//                             subStructure: result,
//                           }
//                     return nextResult
//                   },
//                   null
//                 ) ?? throwInvalidPathError('planeA.cellCoordinates'),
//         },
//         memberStructure: {
//           structureType: 'terminal',
//           rhythmDensity: baseDensitiesA[layerIndex - 1] ?? terminalDensityA,
//         },
//       })
//       return {
//         cellCoordinates: getRhythmMatrixCoordinates(layerRhythmSlotWeights),
//         layerWaves: layerRhythmSlotWeights.map<
//           WaveyCellLayer['layerWaves'][number]
//         >((slotWeight, slotIndex) => {
//           const slotStamp = slotIndex / layerRhythmSlotWeights.length
//           const slotAngle = 2 * Math.PI * slotStamp + Math.PI / 2
//           const weightStamp = slotWeight / layerRhythmSlotWeights[0]!
//           return {
//             waveOrigin: [
//               weightStamp * layerRingRadius * Math.cos(slotAngle),
//               weightStamp * layerRingRadius * Math.sin(slotAngle),
//             ],
//             getWaveSample: (cellDistance) => {
//               const waveLength = 2 * layerRingRadius
//               const sampleStamp = Math.min(cellDistance / waveLength, 1)
//               const sampleAngle = 2 * Math.PI * sampleStamp
//               const waveFrequency = 220
//               const waveAmplitude = (layerIndex + 1) * (1 - sampleStamp)
//               const wavePhase = 2 * Math.PI * frameStamp
//               return (
//                 (waveAmplitude *
//                   Math.sin(waveFrequency * sampleAngle + wavePhase)) /
//                 planeResolutionA
//               )
//             },
//           }
//         }),
//       }
//     }),
// })
