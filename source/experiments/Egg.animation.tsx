import { AnimationModule } from 'clumsy-graphics'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import React from 'react'
import { Spacer, spacer } from 'clumsy-math'
import { Point3, sphericalToCartesian } from '../library/Point3'

const animationFrameCount = 64 * 1
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
  const cameraDepth = -10
  const loopsoidCellsA = getLoopsoidCells({
    baseContextData: {},
    loopsoidOrigin: [0, 0, 0],
    depthSpacer: spacer([12, [12, 0]]),
    depthCosine: Math.cos,
    depthSine: Math.sin,
    getDepthContextData: () => ({}),
    getDepthCellAnglePhase: () => 0,
    getSliceSpacer: () => spacer([24, [24, 0]]),
    getSliceContextData: () => ({}),
    getSliceCellAnglePhase: () => 0,
    getSliceAngleFunctions: () => [Math.cos, Math.sin],
    getCellRadius: () => 4,
    getCellTransformedPoint: (cellBasePoint) => cellBasePoint,
    getCellSize: () => 0.1,
    getCellColor: () => 'white',
  })
  return (
    <CellGraphic
      cameraDepth={cameraDepth}
      lightDepth={100}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      backgroundColor={'black'}
      worldCellPoints={loopsoidCellsA}
    />
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
  BaseContextData extends object,
  DepthContextData extends object,
  SliceContextData extends object
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
  BaseContextData extends object,
  DepthContextData extends object,
  SliceContextData extends object
> = Data<
  ContextDataA<BaseContextData, DepthContextData, SliceContextData>,
  ReturnType<
    GetLoopsoidCellsApi<
      BaseContextData,
      DepthContextData,
      SliceContextData
    >['getDepthContextData']
  >
>

type ContextDataC<
  BaseContextData extends object,
  DepthContextData extends object,
  SliceContextData extends object
> = Data<
  ContextDataB<BaseContextData, DepthContextData, SliceContextData>,
  {
    sliceSpacer: Spacer
  }
>

type ContextDataD<
  BaseContextData extends object,
  DepthContextData extends object,
  SliceContextData extends object
> = Data<
  ContextDataC<BaseContextData, DepthContextData, SliceContextData>,
  {
    sliceSpacerPointIndex: number
    sliceSpacerPoint: number
  }
>

type ContextDataE<
  BaseContextData extends object,
  DepthContextData extends object,
  SliceContextData extends object
> = Data<
  ContextDataD<BaseContextData, DepthContextData, SliceContextData>,
  ReturnType<
    GetLoopsoidCellsApi<
      BaseContextData,
      DepthContextData,
      SliceContextData
    >['getSliceContextData']
  >
>

type ContextDataF<
  BaseContextData extends object,
  DepthContextData extends object,
  SliceContextData extends object
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
        [cellRadius, depthCellAngle, sliceAdjustedCellAngle]
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
