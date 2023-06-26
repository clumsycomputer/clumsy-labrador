import { AnimationModule } from 'clumsy-graphics'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import React from 'react'
import {
  AlignedSpacerStructure,
  LOOP_ONE,
  LOOP_ZERO,
  LoopStructure,
  Spacer,
  loopCosine,
  loopPoint,
  loopSine,
  phasedSpacer,
  spacer,
  spacerIntervals,
} from 'clumsy-math'
import { Point3, reflectedPoint, sphericalToCartesian } from '../library/Point3'
import { rotatedVector } from '../library/Vector3'
import getColormap from 'colormap'
import { normalizedAngle } from '../library/miscellaneous'

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
  const colormapA = getColormap({
    colormap: 'phase',
    nshades: 1024,
    format: 'hex',
    alpha: 1,
  })
  const resolutionA = 512 * 8
  const colormapPhaseSpacer = spacer([resolutionA, [frameCount, 0]])
  const fooRange = 0.1
  const loopStructureA: LoopStructure = [
    [0.95, LOOP_ONE, frameAngle, 0, 0],
    [0.9, LOOP_ONE, normalizedAngle(-2 * frameAngle), 0, 0],
    [0.825, LOOP_ONE, normalizedAngle(4 * frameAngle), 0, 0],
  ]
  const loopCosineA = (angle: number) =>
    loopCosine(loopPoint(loopStructureA, angle))
  const loopSineA = (angle: number) =>
    loopSine(loopPoint(loopStructureA, angle))
  const loopsoidCellsA = getLoopsoidCells({
    baseContextData: {},
    loopsoidOrigin: [0, 0, 0],
    depthSpacer: spacer([
      resolutionA,
      [2039, spacer([2039, [frameCount, 0]])[1][frameIndex]],
    ]),
    depthCosine: loopCosineA,
    depthSine: loopSineA,
    getDepthContextData: (contextData: ContextDataA) => ({
      depthSpacerAngle:
        (Math.PI / contextData.depthSpacer[0]) * contextData.depthSpacerPoint,
      depthRelativeSpacerPoint:
        contextData.depthSpacerPoint / contextData.depthSpacer[0],
    }),
    getSliceContextData: (contextData: ContextDataD) => ({
      sliceSpacerAngle:
        ((2 * Math.PI) / contextData.sliceSpacer[0]) *
        contextData.sliceSpacerPoint,
    }),
    getDepthCellAnglePhase: () => 0,
    getSliceCellAnglePhase: ({
      depthSpacer,
      depthSpacerPoint,
      depthRelativeSpacerPoint,
    }) => {
      return (
        (Math.PI / depthSpacer[0]) * depthSpacerPoint +
        3 * frameAngle +
        (Math.PI / 3 + (Math.PI / 5) * Math.sin(frameAngle)) *
          //   depthRelativeSpacerPoint *
          Math.sin(211 * depthRelativeSpacerPoint * 2 * Math.PI)
      )
    },
    getSliceSpacer: ({}) => spacer([8, [3, 0]]),
    getSliceAngleFunctions: () => [loopCosineA, loopSineA],
    getCellRadius: ({}) => 4,
    getCellTransformedPoint: (
      cellBasePoint,
      { depthSpacerAngle, sliceSpacerAngle }
    ) => {
      return rotatedVector(
        sphericalToCartesian(loopCosineA, loopSineA, loopCosineA, loopSineA, [
          1.5,
          depthSpacerAngle,
          sliceSpacerAngle,
        ]),
        frameAngle,
        rotatedVector([1, 0, 0], frameAngle, cellBasePoint)
      )
      //   return rotatedVector([1, 0, 0], frameAngle, cellBasePoint)
    },
    getCellSize: () => 0.05,
    getCellColor: ({ depthSpacerPoint }) =>
      colormapA[
        (depthSpacerPoint + colormapPhaseSpacer[1][frameIndex]) %
          colormapA.length
      ],
  })
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
    contextData: ContextDataB<
      BaseContextData,
      DepthContextData,
      SliceContextData
    >
  ) => Spacer
  getSliceAngleFunctions: (
    contextData: ContextDataC<
      BaseContextData,
      DepthContextData,
      SliceContextData
    >
  ) => [sliceCosine: LoopAngleFunction, sliceSine: LoopAngleFunction]
  getSliceContextData: (
    contextData: ContextDataD<
      BaseContextData,
      DepthContextData,
      SliceContextData
    >
  ) => SliceContextData
  getSliceCellAnglePhase: (
    contextData: ContextDataE<
      BaseContextData,
      DepthContextData,
      SliceContextData
    >
  ) => number
  getCellRadius: (
    contextData: ContextDataE<
      BaseContextData,
      DepthContextData,
      SliceContextData
    >
  ) => number
  getCellTransformedPoint: (
    cellBasePoint: Point3,
    contextData: ContextDataF<
      BaseContextData,
      DepthContextData,
      SliceContextData
    >
  ) => Point3
  getCellSize: (
    contextData: ContextDataF<
      BaseContextData,
      DepthContextData,
      SliceContextData
    >
  ) => number
  getCellColor: (
    contextData: ContextDataF<
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
    sliceSpacer: Spacer
  }
>

type ContextDataD<
  BaseContextData extends object = object,
  DepthContextData extends object = object,
  SliceContextData extends object = object
> = Data<
  ContextDataC<BaseContextData, DepthContextData, SliceContextData>,
  {
    sliceSpacerPointIndex: number
    sliceSpacerPoint: number
  }
>

type ContextDataE<
  BaseContextData extends object = object,
  DepthContextData extends object = object,
  SliceContextData extends object = object
> = Data<
  ContextDataD<BaseContextData, DepthContextData, SliceContextData>,
  SliceContextData
>

type ContextDataF<
  BaseContextData extends object = object,
  DepthContextData extends object = object,
  SliceContextData extends object = object
> = Data<
  ContextDataE<BaseContextData, DepthContextData, SliceContextData>,
  {
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
    const sliceSpacer = getSliceSpacer(contextDataB)
    const contextDataC = { ...contextDataB, sliceSpacer }
    const cellSliceAngleStep = (2 * Math.PI) / sliceSpacer[0]
    const [sliceCosine, sliceSine] = getSliceAngleFunctions(contextDataC)
    for (
      let sliceSpacerPointIndex = 0;
      sliceSpacerPointIndex < sliceSpacer[1].length;
      sliceSpacerPointIndex++
    ) {
      const sliceSpacerPoint = sliceSpacer[1][sliceSpacerPointIndex]
      const contextDataD = {
        ...contextDataC,
        sliceSpacerPointIndex,
        sliceSpacerPoint,
      }
      const contextDataE = {
        ...contextDataD,
        ...getSliceContextData(contextDataD),
      }
      const sliceCellAngle =
        sliceSpacerPoint * cellSliceAngleStep +
        getSliceCellAnglePhase(contextDataE)
      const sliceAdjustedCellAngle = -sliceCellAngle + Math.PI / 2
      const cellRadius = getCellRadius(contextDataE)
      const contextDataF = {
        ...contextDataE,
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
          normalizedAngle(sliceAdjustedCellAngle),
        ]
      )
      const cellTransformedPoint = getCellTransformedPoint(
        cellBasePoint,
        contextDataF
      )
      const cellTranslatedPoint: Point3 = [
        cellTransformedPoint[0] + loopsoidOrigin[0],
        cellTransformedPoint[1] + loopsoidOrigin[1],
        cellTransformedPoint[2] + loopsoidOrigin[2],
      ]
      resultLoopsoidCells.push([
        ...cellTranslatedPoint,
        getCellSize(contextDataF),
        getCellColor(contextDataF),
      ])
    }
  }
  return resultLoopsoidCells
}
