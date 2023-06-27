import { AnimationModule } from 'clumsy-graphics'
import {
  AlignedSpacerStructure,
  LOOP_ONE,
  LOOP_ZERO,
  LoopStructure,
  Spacer,
  loopCosine,
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

const animationFrameCount = 64 * 3
const animationFrameRate = 20
const clipStartFrameIndex = 64 * 0
const clipFinishFrameIndex = animationFrameCount
const clipFrameCount = clipFinishFrameIndex - clipStartFrameIndex

const EggAnimationModule: AnimationModule = {
  moduleName: 'Egg',
  getFrameDescription: getEggFrameDescription,
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
    [0.975, LOOP_ZERO, 0, 0, 0],
    [0.95, LOOP_ZERO, 0, 0, 0],
    [0.9, LOOP_ZERO, 0, 0, 0],
  ]
  const depthResolution = 1024
  const colormapA = getColormap({
    colormap: 'phase',
    nshades: depthResolution,
    format: 'hex',
    alpha: 1,
  })
  const fooFrequency = 3 + 3 * Math.sin(3 * frameAngle)
  const sliceSymmetricWeights = spacerSymmetricSlotWeights(spacer([12, [7, 0]]))
  const frameColorMap = spacer([depthResolution, [frameCount, 0]])
  const depthSpacer = spacer([depthResolution, [511, 0]])
  const loopsoidCellsA = getLoopsoidCells({
    baseContextData: {
      sliceSymmetricWeights,
    },
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
    getSliceSpacer: ({}) => spacer([12, [3, 0]]),
    getDepthCellAnglePhase: ({}) => 0,
    getCellRadius: ({}) => 4,
    getCellSize: () => 0.1,
    getCellColor: ({ depthSpacerPoint }) =>
      colormapA[
        (depthSpacerPoint + frameColorMap[1][frameIndex]) % colormapA.length
      ],
    getDepthContextData: ({ depthSpacer, depthSpacerPoint }: ContextDataA) => {
      return {
        depthSpacerStamp: depthSpacerPoint / depthSpacer[0],
      }
    },
    getSliceContextData: (contextData: ContextDataE) => {
      return {}
    },
    getSliceCellAnglePhase: ({
      depthSpacerStamp,
      sliceSymmetricWeights,
      sliceSpacerPoint,
      sliceSine,
    }) => {
      return (
        (fooFrequency * 2 * Math.PI +
          (fooFrequency / sliceSymmetricWeights[sliceSpacerPoint]) *
            2 *
            Math.PI *
            sliceSine(2 * Math.PI * depthSpacerStamp + frameAngle)) *
        sliceSine(
          sliceSymmetricWeights[sliceSpacerPoint] *
            (2 * Math.PI * depthSpacerStamp +
              frameAngle +
              Math.PI / sliceSymmetricWeights[sliceSpacerPoint])
        )
      )
      //   return (Math.PI / depthSpacer[0]) * depthSpacerPoint
    },
    getCellTransformedPoint: (
      cellBasePoint,
      {
        depthCosine,
        depthSine,
        sliceCosine,
        sliceSine,
        depthCellAngle,
        sliceCellAngle,
      }
    ) => {
      const uprightPoint = rotatedVector([0, 0, 1], -Math.PI / 2, cellBasePoint)
      const rotatedPoint = rotatedVector([1, 0, 0], frameAngle, uprightPoint)
      //   const twistedPoint = rotatedVector(
      //     sphericalToCartesian(depthCosine, depthSine, sliceCosine, sliceSine, [
      //       1.125,
      //       depthCellAngle,
      //       sliceCellAngle,
      //     ]),
      //     frameAngle,
      //     rotatedPoint
      //   )
      return rotatedPoint
    },
  })
  const loopsoidCellsB = getLoopsoidCells({
    baseContextData: {
      sliceSymmetricWeights,
    },
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
    getSliceSpacer: ({}) => spacer([12, [3, 0]]),
    getDepthCellAnglePhase: ({}) => 0,
    getCellRadius: ({}) => 4,
    getCellSize: () => 0.1,
    getCellColor: ({ depthSpacerPoint }) =>
      colormapA[
        (depthSpacerPoint + frameColorMap[1][frameIndex]) % colormapA.length
      ],
    getDepthContextData: ({ depthSpacer, depthSpacerPoint }: ContextDataA) => {
      return {
        depthSpacerStamp: depthSpacerPoint / depthSpacer[0],
      }
    },
    getSliceContextData: (contextData: ContextDataE) => {
      return {}
    },
    getSliceCellAnglePhase: ({
      depthSpacerStamp,
      sliceSymmetricWeights,
      sliceSpacerPoint,
      sliceSine,
    }) => {
      return (
        -(
          fooFrequency * 2 * Math.PI +
          (fooFrequency / sliceSymmetricWeights[sliceSpacerPoint]) *
            2 *
            Math.PI *
            sliceSine(2 * Math.PI * depthSpacerStamp + frameAngle)
        ) *
        sliceSine(
          sliceSymmetricWeights[sliceSpacerPoint] *
            (2 * Math.PI * depthSpacerStamp +
              frameAngle +
              Math.PI / sliceSymmetricWeights[sliceSpacerPoint])
        )
      )
      //   return (Math.PI / depthSpacer[0]) * depthSpacerPoint
    },
    getCellTransformedPoint: (
      cellBasePoint,
      {
        depthCosine,
        depthSine,
        sliceCosine,
        sliceSine,
        depthCellAngle,
        sliceCellAngle,
      }
    ) => {
      const uprightPoint = rotatedVector([0, 0, 1], -Math.PI / 2, cellBasePoint)
      const rotatedPoint = rotatedVector([1, 0, 0], frameAngle, uprightPoint)
      //   const twistedPoint = rotatedVector(
      //     sphericalToCartesian(depthCosine, depthSine, sliceCosine, sliceSine, [
      //       1.125,
      //       depthCellAngle,
      //       sliceCellAngle,
      //     ]),
      //     frameAngle,
      //     rotatedPoint
      //   )
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
      const sliceCellAngle =
        sliceSpacerPoint * cellSliceAngleStep +
        getSliceCellAnglePhase(contextDataF)
      //   const sliceAdjustedCellAngle = -sliceCellAngle + Math.PI / 2
      const cellRadius = getCellRadius(contextDataF)
      const contextDataG = {
        ...contextDataF,
        sliceCellAngle,
        cellRadius,
      }
      const cellBasePoint = sphericalToCartesian(
        depthCosine,
        depthSine,
        sliceCosine,
        sliceSine,
        [
          cellRadius,
          normalizedAngle(depthCellAngle),
          normalizedAngle(sliceCellAngle),
        ]
      )
      const cellTransformedPoint = getCellTransformedPoint(
        cellBasePoint,
        contextDataG
      )
      const cellTranslatedPoint: Point3 = [
        cellTransformedPoint[0] + loopsoidOrigin[0],
        cellTransformedPoint[1] + loopsoidOrigin[1],
        cellTransformedPoint[2] + loopsoidOrigin[2],
      ]
      resultLoopsoidCells.push([
        ...cellTranslatedPoint,
        getCellSize(contextDataG),
        getCellColor(contextDataG),
      ])
    }
  }
  return resultLoopsoidCells
}
