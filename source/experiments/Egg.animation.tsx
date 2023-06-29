import { AnimationModule } from 'clumsy-graphics'
import {
  AlignedSpacerStructure,
  LOOP_ONE,
  LOOP_ZERO,
  LoopStructure,
  Spacer,
  loopCosine,
  loopPendulum,
  loopPoint,
  loopSine,
  phasedSpacer,
  spacer,
  spacerIntervals,
  spacerSymmetricSlotWeights,
} from 'clumsy-math'
import React from 'react'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import { Point3, sphericalToCartesian } from '../library/Point3'
import { normalizedVector, rotatedVector } from '../library/Vector3'
import { normalizedAngle } from '../library/miscellaneous'
import getColormap from 'colormap'

const animationFrameCount = 64 * 2
const animationFrameRate = 20
const clipStartFrameIndex = 64 * 0
const clipFinishFrameIndex = animationFrameCount
const clipFrameCount = clipFinishFrameIndex - clipStartFrameIndex

const EggAnimationModule: AnimationModule = {
  moduleName: 'Egg',
  getFrameDescription: getEggFrameDescription,
  frameCount: clipFrameCount,
  frameSize: {
    width: 1024 * 5,
    height: 1024 * 5,
  },
  animationSettings: {
    frameRate: animationFrameRate,
    constantRateFactor: 1,
  },
}

export default EggAnimationModule

interface GetEggFrameDescriptionProps {
  frameCount: number
  frameIndex: number
}

async function getEggFrameDescription(props: GetEggFrameDescriptionProps) {
  const frameCount = animationFrameCount
  const frameIndex = clipStartFrameIndex + props.frameIndex
  const frameStamp = frameIndex / animationFrameCount
  const frameAngle = 2 * Math.PI * frameStamp
  const cameraDepth = -8
  const loopStructureA: LoopStructure = [
    [LOOP_ONE, LOOP_ONE, 0, 0, 0],
    [0.95, 0.5, 0, 0, 0],
    [0.925, LOOP_ZERO, 0, 0, 0],
  ]
  const depthResolution = 257
  const depthOverlaySpacerA = spacer([depthResolution, [72, 0]])
  const depthOverlaySpacerB = spacer([depthResolution, [72, 0]])
  const colormapA = getColormap({
    colormap: 'phase',
    nshades: depthResolution,
    format: 'hex',
    alpha: 1,
  })
  const downsampleFrameDataA = downsampledFrameData(
    frameCount,
    frameIndex,
    Math.floor(frameCount / 5)
  )
  const sliceBaseSpacer = spacer([
    13,
    [
      11,
      spacerResolutionMap([
        downsampleFrameDataA[0],
        [downsampleFrameDataA[0] - (downsampleFrameDataA[0] % 11), 0],
      ])[downsampleFrameDataA[1]] % 11,
    ],
    [
      7,
      spacerResolutionMap([
        downsampleFrameDataA[0],
        [downsampleFrameDataA[0] - (downsampleFrameDataA[0] % 7), 0],
      ])[downsampleFrameDataA[1]] % 7,
    ],
    [
      5,
      spacerResolutionMap([
        downsampleFrameDataA[0],
        [downsampleFrameDataA[0] - (downsampleFrameDataA[0] % 5), 0],
      ])[downsampleFrameDataA[1]] % 5,
    ],
    [
      3,
      spacerResolutionMap([
        downsampleFrameDataA[0],
        [downsampleFrameDataA[0] - (downsampleFrameDataA[0] % 3), 0],
      ])[downsampleFrameDataA[1]] % 3,
    ],
    [
      2,
      spacerResolutionMap([
        downsampleFrameDataA[0],
        [downsampleFrameDataA[0] - (downsampleFrameDataA[0] % 2), 0],
      ])[downsampleFrameDataA[1]] % 2,
    ],
  ])
  const slicePhasedBaseSpacer = phasedSpacer(
    sliceBaseSpacer,
    0
    // spacerResolutionMap([downsampleFrameDataA[0], [13, 0]])[
    //   downsampleFrameDataA[1]
    // ]
  )
  const sliceSymmetricWeights = spacerSymmetricSlotWeights(spacer([13, [7, 0]]))
  const sliceSpacer: Spacer = [
    slicePhasedBaseSpacer[0],
    Array.from(
      slicePhasedBaseSpacer[1].reduce<Set<number>>(
        (resultPoints, someSpacerPoint) => {
          const pointZeroDistance = someSpacerPoint
          const pointResolutionDistance = sliceBaseSpacer[0] - someSpacerPoint
          const mirrorPoint =
            pointZeroDistance <= pointResolutionDistance
              ? (sliceBaseSpacer[0] - pointZeroDistance) % sliceBaseSpacer[0]
              : pointResolutionDistance
          resultPoints.add(someSpacerPoint)
          resultPoints.add(mirrorPoint)
          return resultPoints
        },
        new Set<number>()
      )
    ),
  ]
  const frameColorMap = spacer([depthResolution, [frameCount, 0]])
  const loopsoidCellsA = getLoopsoidCells({
    depthResolution,
    depthOverlaySpacer: depthOverlaySpacerA,
    loopsoidOrigin: [0, 0, 0],
    depthCosine: (angle: number) =>
      loopCosine(loopPoint(loopStructureA, angle)),
    depthSine: (angle: number) => loopSine(loopPoint(loopStructureA, angle)),
    getSliceAngleFunctions: () => [
      (angle: number) =>
        loopCosine(loopPoint(loopStructureA, normalizedAngle(angle))),
      (angle: number) =>
        loopSine(loopPoint(loopStructureA, normalizedAngle(angle))),
    ],
    getSliceSpacer: ({}) => sliceSpacer,
    getDepthCellAnglePhase: ({}) => 0,
    getCellRadius: ({}) => 4,
    getCellSize: () => 0.1,
    getCellColor: ({ depthIndex }) =>
      colormapA[(depthIndex + frameColorMap[1][frameIndex]) % colormapA.length],
    getDepthContextData: ({ depthResolution, depthIndex }: ContextDataA) => {
      const depthSpacerStamp = depthIndex / depthResolution
      const depthSpacerAngle = 2 * Math.PI * depthSpacerStamp
      return {
        depthSpacerStamp,
        depthSpacerAngle,
      }
    },
    getSliceContextData: (contextData: ContextDataE) => {
      return {}
    },
    getSliceCellAnglePhase: ({
      depthSpacerStamp,
      depthSpacerAngle,
      sliceSpacerPoint,
      sliceSine,
    }) => {
      const sliceMaxPointWeight = sliceSymmetricWeights[0]
      const slicePointWeight = sliceSymmetricWeights[sliceSpacerPoint]
      const sliceRelativePointWeight = slicePointWeight / sliceMaxPointWeight
      const angleSpreadRange = rangeScopeValue(
        (2 * Math.PI) / 72,
        sliceBaseSpacer[0],
        sliceMaxPointWeight,
        slicePointWeight
      )
      const spreadFrequency = 11
      return (
        angleSpreadRange *
          sliceSine(spreadFrequency * depthSpacerAngle + frameAngle) +
        86 * depthSpacerAngle
      )
    },
    getCellTransformedPoint: (cellBasePoint, {}) => {
      const uprightPoint = rotatedVector([0, 0, 1], -Math.PI / 2, cellBasePoint)
      const rotatedPoint = rotatedVector([1, 0, 0], frameAngle, uprightPoint)
      return rotatedPoint
    },
  })
  const loopsoidCellsB = getLoopsoidCells({
    depthResolution,
    depthOverlaySpacer: depthOverlaySpacerB,
    loopsoidOrigin: [0, 0, 0],
    depthCosine: (angle: number) =>
      loopCosine(loopPoint(loopStructureA, angle)),
    depthSine: (angle: number) => loopSine(loopPoint(loopStructureA, angle)),
    getSliceAngleFunctions: () => [
      (angle: number) =>
        loopCosine(loopPoint(loopStructureA, normalizedAngle(angle))),
      (angle: number) =>
        loopSine(loopPoint(loopStructureA, normalizedAngle(angle))),
    ],
    getSliceSpacer: ({}) => sliceSpacer,
    getDepthCellAnglePhase: ({}) => 0,
    getCellRadius: ({}) => 4,
    getCellSize: () => 0.1,
    getCellColor: ({ depthIndex }) =>
      colormapA[(depthIndex + frameColorMap[1][frameIndex]) % colormapA.length],
    getDepthContextData: ({ depthResolution, depthIndex }: ContextDataA) => {
      const depthSpacerStamp = depthIndex / depthResolution
      const depthSpacerAngle = 2 * Math.PI * depthSpacerStamp
      return {
        depthSpacerStamp,
        depthSpacerAngle,
      }
    },
    getSliceContextData: (contextData: ContextDataE) => {
      return {}
    },
    getSliceCellAnglePhase: ({
      depthSpacerStamp,
      depthSpacerAngle,
      sliceSpacerPoint,
      sliceSine,
    }) => {
      const sliceMaxPointWeight = sliceSymmetricWeights[0]
      const slicePointWeight = sliceSymmetricWeights[sliceSpacerPoint]
      const sliceRelativePointWeight = slicePointWeight / sliceMaxPointWeight
      const angleSpreadRange = rangeScopeValue(
        (2 * Math.PI) / 72,
        sliceBaseSpacer[0],
        sliceMaxPointWeight,
        slicePointWeight
      )
      const spreadFrequency = 13
      return (
        angleSpreadRange *
          sliceSine(spreadFrequency * depthSpacerAngle + frameAngle) +
        258 * depthSpacerAngle
      )
    },
    getCellTransformedPoint: (cellBasePoint, {}) => {
      const uprightPoint = rotatedVector([0, 0, 1], -Math.PI / 2, cellBasePoint)
      const rotatedPoint = rotatedVector([1, 0, 0], frameAngle, uprightPoint)
      return rotatedPoint
    },
  })
  return (
    <CellGraphic
      cameraDepth={cameraDepth}
      lightDepth={500}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      backgroundColor={'black'}
      worldCellPoints={[...loopsoidCellsA, ...loopsoidCellsB]}
    />
  )
}

function downsampledFrameData(
  frameCount: number,
  frameIndex: number,
  downsampledFrameCount: number
): [number, number, number, number] {
  const downsampleFrameIndex = spacerResolutionMap([
    frameCount,
    [downsampledFrameCount, 0],
  ])[frameIndex]
  const downsampledFrameStamp = downsampleFrameIndex / downsampledFrameCount
  const downSampledFrameAngle = 2 * Math.PI * downsampledFrameStamp
  return [
    downsampledFrameCount,
    downsampleFrameIndex,
    downsampledFrameStamp,
    downSampledFrameAngle,
  ]
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

interface GetLoopsoidCellsApi<
  DepthContextData extends object,
  SliceContextData extends object
> {
  resultLoopsoidCells?: Array<WorldCellPoint>
  loopsoidOrigin: Point3
  depthResolution: number
  depthOverlaySpacer: Spacer
  depthCosine: LoopAngleFunction
  depthSine: LoopAngleFunction
  getDepthContextData: (
    contextData: ContextDataA<DepthContextData, SliceContextData>
  ) => DepthContextData
  getDepthCellAnglePhase: (
    contextData: ContextDataB<DepthContextData, SliceContextData>
  ) => number
  getSliceSpacer: (
    contextData: ContextDataC<DepthContextData, SliceContextData>
  ) => Spacer
  getSliceAngleFunctions: (
    contextData: ContextDataD<DepthContextData, SliceContextData>
  ) => [sliceCosine: LoopAngleFunction, sliceSine: LoopAngleFunction]
  getSliceContextData: (
    contextData: ContextDataE<DepthContextData, SliceContextData>
  ) => SliceContextData
  getSliceCellAnglePhase: (
    contextData: ContextDataF<DepthContextData, SliceContextData>
  ) => number
  getCellRadius: (
    contextData: ContextDataF<DepthContextData, SliceContextData>
  ) => number
  getCellTransformedPoint: (
    cellBasePoint: Point3,
    contextData: ContextDataG<DepthContextData, SliceContextData>
  ) => Point3
  getCellSize: (
    contextData: ContextDataG<DepthContextData, SliceContextData>
  ) => number
  getCellColor: (
    contextData: ContextDataG<DepthContextData, SliceContextData>
  ) => string
}

type LoopAngleFunction = (inputAngle: number) => number

type ContextDataA<
  DepthContextData extends object = object,
  SliceContextData extends object = object
> = Data<
  Pick<
    GetLoopsoidCellsApi<DepthContextData, SliceContextData>,
    'depthResolution' | 'depthOverlaySpacer'
  >,
  {
    depthCosine: LoopAngleFunction
    depthSine: LoopAngleFunction
    depthIndex: number
    depthOverlayPoint: boolean
  }
>

type ContextDataB<
  DepthContextData extends object = object,
  SliceContextData extends object = object
> = Data<ContextDataA<DepthContextData, SliceContextData>, DepthContextData>

type ContextDataC<
  DepthContextData extends object = object,
  SliceContextData extends object = object
> = Data<
  ContextDataB<DepthContextData, SliceContextData>,
  {
    depthCellAngle: number
  }
>

type ContextDataD<
  DepthContextData extends object = object,
  SliceContextData extends object = object
> = Data<
  ContextDataC<DepthContextData, SliceContextData>,
  {
    sliceSpacer: Spacer
  }
>

type ContextDataE<
  DepthContextData extends object = object,
  SliceContextData extends object = object
> = Data<
  ContextDataD<DepthContextData, SliceContextData>,
  {
    sliceCosine: LoopAngleFunction
    sliceSine: LoopAngleFunction
    sliceSpacerPointIndex: number
    sliceSpacerPoint: number
  }
>

type ContextDataF<
  DepthContextData extends object = object,
  SliceContextData extends object = object
> = Data<ContextDataE<DepthContextData, SliceContextData>, SliceContextData>

type ContextDataG<
  DepthContextData extends object = object,
  SliceContextData extends object = object
> = Data<
  ContextDataF<DepthContextData, SliceContextData>,
  {
    sliceCellAngle: number
    cellRadius: number
  }
>

type Data<T extends object, U extends object> = T & U

function getLoopsoidCells<
  DepthContextData extends object,
  SliceContextData extends object
>(
  api: GetLoopsoidCellsApi<DepthContextData, SliceContextData>
): Array<WorldCellPoint> {
  const {
    depthResolution,
    depthOverlaySpacer,
    getDepthContextData,
    getDepthCellAnglePhase,
    getSliceSpacer,
    getSliceAngleFunctions,
    getSliceContextData,
    getSliceCellAnglePhase,
    depthCosine,
    depthSine,
    getCellRadius,
    getCellTransformedPoint,
    loopsoidOrigin,
    getCellSize,
    getCellColor,
    resultLoopsoidCells = [],
  } = api
  const cellDepthAngleStep = Math.PI / depthResolution
  const depthOverlayPoints = depthOverlaySpacer[1]
  for (let depthIndex = 0; depthIndex < depthResolution; depthIndex++) {
    const depthOverlayPoint = depthOverlayPoints[0] === depthIndex
    if (depthOverlayPoint) {
      depthOverlayPoints.shift()
      continue
    }
    const contextDataA = {
      depthResolution,
      depthOverlaySpacer,
      depthCosine,
      depthSine,
      depthIndex,
      depthOverlayPoint,
    }
    const contextDataB = {
      ...contextDataA,
      ...getDepthContextData(contextDataA),
    }
    const depthCellAngle =
      depthIndex * cellDepthAngleStep + getDepthCellAnglePhase(contextDataB)
    const contextDataC = {
      ...contextDataB,
      depthCellAngle,
    }
    const sliceSpacer = getSliceSpacer(contextDataC)
    const contextDataD = { ...contextDataC, sliceSpacer }
    const cellSliceAngleStep = (2 * Math.PI) / sliceSpacer[0]
    const [sliceCosine, sliceSine] = getSliceAngleFunctions(contextDataD)
    for (
      let sliceSpacerPointIndex = 0;
      sliceSpacerPointIndex < sliceSpacer[1].length;
      sliceSpacerPointIndex++
    ) {
      const sliceSpacerPoint = sliceSpacer[1][sliceSpacerPointIndex]
      const contextDataE = {
        ...contextDataD,
        sliceCosine,
        sliceSine,
        sliceSpacerPointIndex,
        sliceSpacerPoint,
      }
      const contextDataF = {
        ...contextDataE,
        ...getSliceContextData(contextDataE),
      }
      const sliceCellAngle = sliceSpacerPoint * cellSliceAngleStep
      const sliceCellAngleA =
        sliceCellAngle + getSliceCellAnglePhase(contextDataF)
      const sliceCellAngleB =
        sliceCellAngle - getSliceCellAnglePhase(contextDataF)
      const cellRadius = getCellRadius(contextDataF)
      const contextDataG = {
        ...contextDataF,
        sliceCellAngle,
        cellRadius,
      }
      const cellBasePointA = sphericalToCartesian(
        depthCosine,
        depthSine,
        sliceCosine,
        sliceSine,
        [
          cellRadius,
          normalizedAngle(depthCellAngle),
          normalizedAngle(sliceCellAngleA),
        ]
      )
      const cellTransformedPointA = getCellTransformedPoint(
        cellBasePointA,
        contextDataG
      )
      const cellTranslatedPointA: Point3 = [
        cellTransformedPointA[0] + loopsoidOrigin[0],
        cellTransformedPointA[1] + loopsoidOrigin[1],
        cellTransformedPointA[2] + loopsoidOrigin[2],
      ]
      const cellBasePointB = sphericalToCartesian(
        depthCosine,
        depthSine,
        sliceCosine,
        sliceSine,
        [
          cellRadius,
          normalizedAngle(depthCellAngle),
          normalizedAngle(sliceCellAngleB),
        ]
      )
      const cellTransformedPointB = getCellTransformedPoint(
        cellBasePointB,
        contextDataG
      )
      const cellTranslatedPointB: Point3 = [
        cellTransformedPointB[0] + loopsoidOrigin[0],
        cellTransformedPointB[1] + loopsoidOrigin[1],
        cellTransformedPointB[2] + loopsoidOrigin[2],
      ]
      const cellSize = getCellSize(contextDataG)
      const cellColor = getCellColor(contextDataG)
      resultLoopsoidCells.push([...cellTranslatedPointA, cellSize, cellColor])
      resultLoopsoidCells.push([...cellTranslatedPointB, cellSize, cellColor])
    }
  }
  return resultLoopsoidCells
}

function noteFrequency(
  baseFrequency: number,
  octaveResolution: number,
  noteIndex: number
) {
  return Math.pow(2, noteIndex / octaveResolution) * baseFrequency
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
