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

const animationFrameCount = 64 * 6
const animationFrameRate = 20
const clipStartFrameIndex = 64 * 0
const clipFinishFrameIndex = 64 * 6
const clipFrameCount = clipFinishFrameIndex - clipStartFrameIndex

const EggAnimationModule: AnimationModule = {
  moduleName: 'Egg',
  getFrameDescription: getEggFrameDescription,
  frameCount: clipFrameCount,
  frameSize: {
    width: 1024 * 2,
    height: 1024 * 2,
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
    [LOOP_ONE, 0.15, 0, 0, 0],
    [0.95, 0.5, 0, 0, 0],
    [0.925, LOOP_ZERO, 0, 0, 0],
  ]
  const depthSpacer = spacer([512, [512, 0]])
  const depthOverlaySpacer = spacer([512, [211, 0]])
  const colormapA = getColormap({
    colormap: 'phase',
    nshades: depthSpacer[0],
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
  const sliceSymmetricWeights = spacerSymmetricSlotWeights(spacer([13, [7, 0]]))
  const sliceSpacer: Spacer = [
    sliceBaseSpacer[0],
    Array.from(
      sliceBaseSpacer[1].reduce<Set<number>>(
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
  const frameColorMap = spacer([depthSpacer[0], [frameCount, 0]])
  const loopsoidCellsA = getLoopsoidCells({
    baseContextData: {},
    loopsoidOrigin: [0, 0, 0],
    depthSpacer: depthSpacer,
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
    getCellColor: ({ depthSpacerPoint }) =>
      colormapA[
        (depthSpacerPoint + frameColorMap[1][frameIndex]) % colormapA.length
      ],
    getDepthContextData: ({ depthSpacer, depthSpacerPoint }: ContextDataA) => {
      const depthSpacerStamp = depthSpacerPoint / depthSpacer[0]
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
      const angleSpreadRange = ((2 * Math.PI) / 13) * slicePointWeight
      const spreadFrequency = 13 * 13
      return (
        angleSpreadRange *
          sliceSine(spreadFrequency * depthSpacerAngle + frameAngle) +
        depthSpacerAngle
      )
    },
    getCellTransformedPoint: (cellBasePoint, {}) => {
      const uprightPoint = rotatedVector([0, 0, 1], -Math.PI / 2, cellBasePoint)
      const rotatedPoint = rotatedVector([1, 0, 0], frameAngle, uprightPoint)
      return rotatedPoint
    },
  })
  const loopsoidCellsB = getLoopsoidCells({
    baseContextData: {},
    loopsoidOrigin: [0, 0, 0],
    depthSpacer: depthOverlaySpacer,
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
    getCellSize: () => 0.1 + 1e-4,
    getCellColor: ({ depthSpacerPoint }) => 'black',
    getDepthContextData: ({ depthSpacer, depthSpacerPoint }: ContextDataA) => {
      const depthSpacerStamp = depthSpacerPoint / depthSpacer[0]
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
      const angleSpreadRange = ((2 * Math.PI) / 13) * slicePointWeight
      const spreadFrequency = 13 * 13
      return (
        angleSpreadRange *
          sliceSine(spreadFrequency * depthSpacerAngle + frameAngle) +
        depthSpacerAngle
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
  BaseContextData extends object,
  DepthContextData extends object,
  SliceContextData extends object
> {
  resultLoopsoidCells?: Array<WorldCellPoint>
  baseContextData: BaseContextData
  loopsoidOrigin: Point3
  depthSpacer: Spacer
  depthCosine: LoopAngleFunction
  depthSine: LoopAngleFunction
  getDepthContextData: (
    contextData: ContextDataA<
      BaseContextData,
      DepthContextData,
      SliceContextData
    >
  ) => DepthContextData
  getDepthCellAnglePhase: (
    contextData: ContextDataB<
      BaseContextData,
      DepthContextData,
      SliceContextData
    >
  ) => number
  getSliceSpacer: (
    contextData: ContextDataC<
      BaseContextData,
      DepthContextData,
      SliceContextData
    >
  ) => Spacer
  getSliceAngleFunctions: (
    contextData: ContextDataD<
      BaseContextData,
      DepthContextData,
      SliceContextData
    >
  ) => [sliceCosine: LoopAngleFunction, sliceSine: LoopAngleFunction]
  getSliceContextData: (
    contextData: ContextDataE<
      BaseContextData,
      DepthContextData,
      SliceContextData
    >
  ) => SliceContextData
  getSliceCellAnglePhase: (
    contextData: ContextDataF<
      BaseContextData,
      DepthContextData,
      SliceContextData
    >
  ) => number
  getCellRadius: (
    contextData: ContextDataF<
      BaseContextData,
      DepthContextData,
      SliceContextData
    >
  ) => number
  getCellTransformedPoint: (
    cellBasePoint: Point3,
    contextData: ContextDataG<
      BaseContextData,
      DepthContextData,
      SliceContextData
    >
  ) => Point3
  getCellSize: (
    contextData: ContextDataG<
      BaseContextData,
      DepthContextData,
      SliceContextData
    >
  ) => number
  getCellColor: (
    contextData: ContextDataG<
      BaseContextData,
      DepthContextData,
      SliceContextData
    >
  ) => string
}

type LoopAngleFunction = (inputAngle: number) => number

type ContextDataA<
  BaseContextData extends object = object,
  DepthContextData extends object = object,
  SliceContextData extends object = object
> = Data<
  BaseContextData,
  Data<
    Pick<
      GetLoopsoidCellsApi<BaseContextData, DepthContextData, SliceContextData>,
      'depthSpacer'
    >,
    {
      depthCosine: LoopAngleFunction
      depthSine: LoopAngleFunction
      depthSpacerPointIndex: number
      depthSpacerPoint: number
    }
  >
>

type ContextDataB<
  BaseContextData extends object = object,
  DepthContextData extends object = object,
  SliceContextData extends object = object
> = Data<
  ContextDataA<BaseContextData, DepthContextData, SliceContextData>,
  DepthContextData
>

type ContextDataC<
  BaseContextData extends object = object,
  DepthContextData extends object = object,
  SliceContextData extends object = object
> = Data<
  ContextDataB<BaseContextData, DepthContextData, SliceContextData>,
  {
    depthCellAngle: number
  }
>

type ContextDataD<
  BaseContextData extends object = object,
  DepthContextData extends object = object,
  SliceContextData extends object = object
> = Data<
  ContextDataC<BaseContextData, DepthContextData, SliceContextData>,
  {
    sliceSpacer: Spacer
  }
>

type ContextDataE<
  BaseContextData extends object = object,
  DepthContextData extends object = object,
  SliceContextData extends object = object
> = Data<
  ContextDataD<BaseContextData, DepthContextData, SliceContextData>,
  {
    sliceCosine: LoopAngleFunction
    sliceSine: LoopAngleFunction
    sliceSpacerPointIndex: number
    sliceSpacerPoint: number
  }
>

type ContextDataF<
  BaseContextData extends object = object,
  DepthContextData extends object = object,
  SliceContextData extends object = object
> = Data<
  ContextDataE<BaseContextData, DepthContextData, SliceContextData>,
  SliceContextData
>

type ContextDataG<
  BaseContextData extends object = object,
  DepthContextData extends object = object,
  SliceContextData extends object = object
> = Data<
  ContextDataF<BaseContextData, DepthContextData, SliceContextData>,
  {
    sliceCellAngle: number
    cellRadius: number
  }
>

type Data<T extends object, U extends object> = T & U

function getLoopsoidCells<
  BaseContextData extends object,
  DepthContextData extends object,
  SliceContextData extends object
>(
  api: GetLoopsoidCellsApi<BaseContextData, DepthContextData, SliceContextData>
): Array<WorldCellPoint> {
  const {
    depthSpacer,
    baseContextData,
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
  const cellDepthAngleStep = Math.PI / depthSpacer[0]
  for (
    let depthSpacerPointIndex = 0;
    depthSpacerPointIndex < depthSpacer[1].length;
    depthSpacerPointIndex++
  ) {
    const depthSpacerPoint = depthSpacer[1][depthSpacerPointIndex]
    const contextDataA = {
      ...baseContextData,
      depthCosine,
      depthSine,
      depthSpacer,
      depthSpacerPointIndex,
      depthSpacerPoint,
    }
    const contextDataB = {
      ...contextDataA,
      ...getDepthContextData(contextDataA),
    }
    const depthCellAngle =
      depthSpacerPoint * cellDepthAngleStep +
      getDepthCellAnglePhase(contextDataB)
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
      //   const sliceAdjustedCellAngle = -sliceCellAngle + Math.PI / 2
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
