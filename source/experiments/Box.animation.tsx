import { AnimationModule } from 'clumsy-graphics'
import {
  AlignedSpacerStructure,
  loopCosine,
  loopPendulum,
  loopPoint,
  loopSine,
  LoopStructure,
  LOOP_ZERO,
  phasedSpacer,
  spacer,
  Spacer,
  spacerGroup,
  spacerIntervals,
  spacerLineage,
  SpacerPoint,
  SpacerSlotWeight,
  spacerSlotWeights,
  spacerSymmetricSlotWeights,
} from 'clumsy-math'
import React from 'react'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import { normalizedAngle } from '../library/miscellaneous'
import { Point3, reflectedPoint, sphericalToCartesian } from '../library/Point3'
import { normalizedVector, rotatedVector, Vector3 } from '../library/Vector3'

const BoxAnimationModule: AnimationModule = {
  moduleName: 'Box',
  getFrameDescription: getBoxFrameDescription,
  frameCount: 64 * 16,
  frameSize: {
    width: 1024 * 5,
    height: 1024 * 5,
  },
  animationSettings: {
    frameRate: 20,
    constantRateFactor: 1,
  },
}

export default BoxAnimationModule

interface GetBoxFrameDescriptionProps {
  frameCount: number
  frameIndex: number
}

async function getBoxFrameDescription(props: GetBoxFrameDescriptionProps) {
  const { frameIndex, frameCount } = props
  const frameStamp = frameIndex / frameCount
  const frameAngle = 2 * Math.PI * frameStamp
  const cameraDepth = -7.5
  // const ringColormap = [
  //   'rgb(212,214,174)',
  //   'rgb(216,179,189)',
  //   'rgb(174,222,191)',
  //   'rgb(61,218,183)',
  //   'rgb(4,183,192)',
  // ]
  const ringColormap = [
    'rgb(188,44,6)',
    'rgb(192,92,21)',
    'rgb(255,160,75)',
    'rgb(255,210,109)',
    'rgb(253,245,192)',
  ]
  const colorPhaseMap = spacerResolutionMap(
    frameCount,
    frameCount - (frameCount % ringColormap.length)
  )
  const depthResolution = 60
  const beeCellsA = getBeeCells({
    renderOverlay: true,
    ringRadius: 4,
    baseSliceResolution: 30,
    overlaySliceResolution: 18,
    ringDepth: -cameraDepth,
    rotationAngle: normalizedAngle(1 * frameAngle),
    ringSpacer: phasedSpacer(
      spacer([
        12,
        [11, spacerResolutionMap(frameCount, 11)[frameIndex]],
        [7, spacerResolutionMap(frameCount, 7)[frameIndex]],
        [5, spacerResolutionMap(frameCount, 5)[frameIndex]],
        [3, spacerResolutionMap(frameCount, 3)[frameIndex]],
      ]),
      spacerResolutionMap(frameCount, 12)[frameIndex]
    ),
    ringSymmetricWeights: spacerSymmetricSlotWeights(
      spacer([
        12,
        [11, spacerResolutionMap(frameCount, 11)[frameIndex]],
        [7, spacerResolutionMap(frameCount, 7)[frameIndex]],
        [5, spacerResolutionMap(frameCount, 5)[frameIndex]],
      ])
    ),
    getDepthSpacerStructure: () => [
      depthResolution,
      [31, spacerResolutionMap(frameCount, 31)[frameIndex]],
      [29, spacerResolutionMap(frameCount, 29)[frameIndex]],
      [23, spacerResolutionMap(frameCount, 23)[frameIndex]],
      [19, spacerResolutionMap(frameCount, 19)[frameIndex]],
    ],
    getDepthSpacerPhase: () =>
      spacerResolutionMap(frameCount, depthResolution)[frameIndex],
    getDepthLoopStructure: ({ ringAngle }) => {
      const relativeRingAngle = (ringAngle! / 2) * Math.PI
      const baseDepthRange = 0.1
      return [
        [
          0.95,
          baseDepthRange * relativeRingAngle + LOOP_ZERO,
          ringAngle!,
          0,
          0,
        ],
        [
          0.9,
          baseDepthRange * relativeRingAngle +
            1 * baseDepthRange * relativeRingAngle +
            LOOP_ZERO,
          normalizedAngle(-2 * ringAngle!),
          0,
          0,
        ],
        [
          0.825,
          baseDepthRange * relativeRingAngle +
            1 * baseDepthRange * relativeRingAngle +
            LOOP_ZERO,
          normalizedAngle(4 * ringAngle!),
          0,
          0,
        ],
      ]
    },
    getSliceLoopStructure: ({ ringAngle }) => {
      const relativeRingAngle = (ringAngle! / 2) * Math.PI
      const baseDepthRange = 0.1
      return [
        [
          0.95,
          baseDepthRange * relativeRingAngle + LOOP_ZERO,
          ringAngle!,
          frameAngle,
          0,
        ],
        [
          0.9,
          baseDepthRange * relativeRingAngle +
            1 * baseDepthRange * relativeRingAngle +
            LOOP_ZERO,
          normalizedAngle(-2 * ringAngle!),
          normalizedAngle(2 * frameAngle),
          0,
        ],
        [
          0.825,
          baseDepthRange * relativeRingAngle +
            1 * baseDepthRange * relativeRingAngle +
            LOOP_ZERO,
          normalizedAngle(4 * ringAngle!),
          normalizedAngle(-4 * frameAngle),
          0,
        ],
      ]
    },
    getSliceRadius: ({ depthRelativeWeight }) => 2 * depthRelativeWeight! + 2,
    getSliceTransformedAngle: ({ sliceAngle, depthSpacer, depthPoint }) =>
      noteFrequency(440, 12, 0) * sliceAngle! +
      (Math.PI / depthSpacer![0]) * depthPoint!,
    getBaseCellColor: () => ringColormap[4],
    getBaseCellSize: () => 0.03,
    getOverlayCellSize: () => 0.0275,
    getBaseRotationRadius: () => 1,
    getOverlayRotationRadius: () => 1.01,
  })
  const beeCellsB = getBeeCells({
    renderOverlay: true,
    ringRadius: 4,
    baseSliceResolution: 30,
    overlaySliceResolution: 18,
    ringDepth: -cameraDepth,
    ringSpacer: phasedSpacer(
      spacer([
        12,
        [
          11,
          spacerResolutionMap(frameCount, 11)[(2 * frameIndex) % frameCount],
        ],
        [7, spacerResolutionMap(frameCount, 7)[(2 * frameIndex) % frameCount]],
        [5, spacerResolutionMap(frameCount, 5)[(2 * frameIndex) % frameCount]],
        [3, spacerResolutionMap(frameCount, 3)[(2 * frameIndex) % frameCount]],
      ]),
      spacerResolutionMap(frameCount, 12)[frameIndex]
    ),
    rotationAngle: normalizedAngle(1 * frameAngle),
    ringSymmetricWeights: spacerSymmetricSlotWeights(
      spacer([
        12,
        [
          11,
          spacerResolutionMap(frameCount, 11)[(2 * frameIndex) % frameCount],
        ],
        [7, spacerResolutionMap(frameCount, 7)[(2 * frameIndex) % frameCount]],
        [5, spacerResolutionMap(frameCount, 5)[(2 * frameIndex) % frameCount]],
      ])
    ),
    getDepthSpacerStructure: () => [
      depthResolution,
      [31, spacerResolutionMap(frameCount, 31)[(2 * frameIndex) % frameCount]],
      [29, spacerResolutionMap(frameCount, 29)[(2 * frameIndex) % frameCount]],
      [23, spacerResolutionMap(frameCount, 23)[(2 * frameIndex) % frameCount]],
      [19, spacerResolutionMap(frameCount, 19)[(2 * frameIndex) % frameCount]],
    ],
    getDepthSpacerPhase: () =>
      spacerResolutionMap(frameCount, depthResolution)[frameIndex],
    getDepthLoopStructure: ({ ringAngle }) => {
      const relativeRingAngle = (ringAngle! / 2) * Math.PI
      const baseDepthRange = 0.1
      return [
        [
          0.95,
          baseDepthRange * relativeRingAngle + LOOP_ZERO,
          ringAngle!,
          0,
          0,
        ],
        [
          0.9,
          baseDepthRange * relativeRingAngle +
            1 * baseDepthRange * relativeRingAngle +
            LOOP_ZERO,
          normalizedAngle(-2 * ringAngle!),
          0,
          0,
        ],
        [
          0.825,
          baseDepthRange * relativeRingAngle +
            1 * baseDepthRange * relativeRingAngle +
            LOOP_ZERO,
          normalizedAngle(4 * ringAngle!),
          0,
          0,
        ],
      ]
    },
    getSliceLoopStructure: ({ ringAngle }) => {
      const relativeRingAngle = (ringAngle! / 2) * Math.PI
      const baseDepthRange = 0.1
      return [
        [
          0.95,
          baseDepthRange * relativeRingAngle + LOOP_ZERO,
          ringAngle!,
          frameAngle,
          0,
        ],
        [
          0.9,
          baseDepthRange * relativeRingAngle +
            1 * baseDepthRange * relativeRingAngle +
            LOOP_ZERO,
          normalizedAngle(-2 * ringAngle!),
          normalizedAngle(2 * frameAngle),
          0,
        ],
        [
          0.825,
          baseDepthRange * relativeRingAngle +
            1 * baseDepthRange * relativeRingAngle +
            LOOP_ZERO,
          normalizedAngle(4 * ringAngle!),
          normalizedAngle(-4 * frameAngle),
          0,
        ],
      ]
    },
    getSliceRadius: ({ depthRelativeWeight }) => 2 * depthRelativeWeight! + 2,
    getSliceTransformedAngle: ({ sliceAngle, depthSpacer, depthPoint }) =>
      noteFrequency(440, 12, 6) * sliceAngle! +
      (Math.PI / depthSpacer![0]) * depthPoint!,
    getBaseCellColor: () => ringColormap[3],
    getBaseCellSize: () => 0.03,
    getOverlayCellSize: () => 0.0275,
    getBaseRotationRadius: () => 1,
    getOverlayRotationRadius: () => 1.01,
  })
  const beeCellsC = getBeeCells({
    renderOverlay: true,
    ringRadius: 4,
    baseSliceResolution: 30,
    overlaySliceResolution: 18,
    ringDepth: -cameraDepth,
    ringSpacer: phasedSpacer(
      spacer([
        12,
        [
          11,
          spacerResolutionMap(frameCount, 11)[(3 * frameIndex) % frameCount],
        ],
        [7, spacerResolutionMap(frameCount, 7)[(3 * frameIndex) % frameCount]],
        [5, spacerResolutionMap(frameCount, 5)[(3 * frameIndex) % frameCount]],
        [3, spacerResolutionMap(frameCount, 3)[(3 * frameIndex) % frameCount]],
      ]),
      spacerResolutionMap(frameCount, 12)[frameIndex]
    ),
    rotationAngle: normalizedAngle(1 * frameAngle),
    ringSymmetricWeights: spacerSymmetricSlotWeights(
      spacer([
        12,
        [
          11,
          spacerResolutionMap(frameCount, 11)[(3 * frameIndex) % frameCount],
        ],
        [7, spacerResolutionMap(frameCount, 7)[(3 * frameIndex) % frameCount]],
        [5, spacerResolutionMap(frameCount, 5)[(3 * frameIndex) % frameCount]],
      ])
    ),
    getDepthSpacerStructure: () => [
      depthResolution,
      [31, spacerResolutionMap(frameCount, 31)[(3 * frameIndex) % frameCount]],
      [29, spacerResolutionMap(frameCount, 29)[(3 * frameIndex) % frameCount]],
      [23, spacerResolutionMap(frameCount, 23)[(3 * frameIndex) % frameCount]],
      [19, spacerResolutionMap(frameCount, 19)[(3 * frameIndex) % frameCount]],
    ],
    getDepthSpacerPhase: () =>
      spacerResolutionMap(frameCount, depthResolution)[frameIndex],
    getDepthLoopStructure: ({ ringAngle }) => {
      const relativeRingAngle = (ringAngle! / 2) * Math.PI
      const baseDepthRange = 0.1
      return [
        [
          0.95,
          baseDepthRange * relativeRingAngle + LOOP_ZERO,
          ringAngle!,
          0,
          0,
        ],
        [
          0.9,
          baseDepthRange * relativeRingAngle +
            1 * baseDepthRange * relativeRingAngle +
            LOOP_ZERO,
          normalizedAngle(-2 * ringAngle!),
          0,
          0,
        ],
        [
          0.825,
          baseDepthRange * relativeRingAngle +
            1 * baseDepthRange * relativeRingAngle +
            LOOP_ZERO,
          normalizedAngle(4 * ringAngle!),
          0,
          0,
        ],
      ]
    },
    getSliceLoopStructure: ({ ringAngle }) => {
      const relativeRingAngle = (ringAngle! / 2) * Math.PI
      const baseDepthRange = 0.1
      return [
        [
          0.95,
          baseDepthRange * relativeRingAngle + LOOP_ZERO,
          ringAngle!,
          frameAngle,
          0,
        ],
        [
          0.9,
          baseDepthRange * relativeRingAngle +
            1 * baseDepthRange * relativeRingAngle +
            LOOP_ZERO,
          normalizedAngle(-2 * ringAngle!),
          normalizedAngle(2 * frameAngle),
          0,
        ],
        [
          0.825,
          baseDepthRange * relativeRingAngle +
            1 * baseDepthRange * relativeRingAngle +
            LOOP_ZERO,
          normalizedAngle(4 * ringAngle!),
          normalizedAngle(-4 * frameAngle),
          0,
        ],
      ]
    },
    getSliceRadius: ({ depthRelativeWeight }) => 2 * depthRelativeWeight! + 2,
    getSliceTransformedAngle: ({ sliceAngle, depthSpacer, depthPoint }) =>
      noteFrequency(440, 12, 2) * sliceAngle! +
      (Math.PI / depthSpacer![0]) * depthPoint!,
    getBaseCellColor: () => ringColormap[2],
    getBaseCellSize: () => 0.03,
    getOverlayCellSize: () => 0.0275,
    getBaseRotationRadius: () => 1,
    getOverlayRotationRadius: () => 1.01,
  })
  const beeCellsD = getBeeCells({
    renderOverlay: true,
    ringRadius: 4,
    baseSliceResolution: 30,
    overlaySliceResolution: 18,
    ringDepth: -cameraDepth,
    ringSpacer: phasedSpacer(
      spacer([
        12,
        [
          11,
          spacerResolutionMap(frameCount, 11)[(4 * frameIndex) % frameCount],
        ],
        [7, spacerResolutionMap(frameCount, 7)[(4 * frameIndex) % frameCount]],
        [5, spacerResolutionMap(frameCount, 5)[(4 * frameIndex) % frameCount]],
        [3, spacerResolutionMap(frameCount, 3)[(4 * frameIndex) % frameCount]],
      ]),
      spacerResolutionMap(frameCount, 12)[frameIndex]
    ),
    rotationAngle: normalizedAngle(1 * frameAngle),
    ringSymmetricWeights: spacerSymmetricSlotWeights(
      spacer([
        12,
        [
          11,
          spacerResolutionMap(frameCount, 11)[(4 * frameIndex) % frameCount],
        ],
        [7, spacerResolutionMap(frameCount, 7)[(4 * frameIndex) % frameCount]],
        [5, spacerResolutionMap(frameCount, 5)[(4 * frameIndex) % frameCount]],
      ])
    ),
    getDepthSpacerStructure: () => [
      depthResolution,
      [31, spacerResolutionMap(frameCount, 31)[(4 * frameIndex) % frameCount]],
      [29, spacerResolutionMap(frameCount, 29)[(4 * frameIndex) % frameCount]],
      [23, spacerResolutionMap(frameCount, 23)[(4 * frameIndex) % frameCount]],
      [19, spacerResolutionMap(frameCount, 19)[(4 * frameIndex) % frameCount]],
    ],
    getDepthSpacerPhase: () =>
      spacerResolutionMap(frameCount, depthResolution)[frameIndex],
    getDepthLoopStructure: ({ ringAngle }) => {
      const relativeRingAngle = (ringAngle! / 2) * Math.PI
      const baseDepthRange = 0.1
      return [
        [
          0.95,
          baseDepthRange * relativeRingAngle + LOOP_ZERO,
          ringAngle!,
          0,
          0,
        ],
        [
          0.9,
          baseDepthRange * relativeRingAngle +
            1 * baseDepthRange * relativeRingAngle +
            LOOP_ZERO,
          normalizedAngle(-2 * ringAngle!),
          0,
          0,
        ],
        [
          0.825,
          baseDepthRange * relativeRingAngle +
            1 * baseDepthRange * relativeRingAngle +
            LOOP_ZERO,
          normalizedAngle(4 * ringAngle!),
          0,
          0,
        ],
      ]
    },
    getSliceLoopStructure: ({ ringAngle }) => {
      const relativeRingAngle = (ringAngle! / 2) * Math.PI
      const baseDepthRange = 0.1
      return [
        [
          0.95,
          baseDepthRange * relativeRingAngle + LOOP_ZERO,
          ringAngle!,
          frameAngle,
          0,
        ],
        [
          0.9,
          baseDepthRange * relativeRingAngle +
            1 * baseDepthRange * relativeRingAngle +
            LOOP_ZERO,
          normalizedAngle(-2 * ringAngle!),
          normalizedAngle(2 * frameAngle),
          0,
        ],
        [
          0.825,
          baseDepthRange * relativeRingAngle +
            1 * baseDepthRange * relativeRingAngle +
            LOOP_ZERO,
          normalizedAngle(4 * ringAngle!),
          normalizedAngle(-4 * frameAngle),
          0,
        ],
      ]
    },
    getSliceRadius: ({ depthRelativeWeight }) => 2 * depthRelativeWeight! + 2,
    getSliceTransformedAngle: ({ sliceAngle, depthSpacer, depthPoint }) =>
      noteFrequency(440, 12, 9) * sliceAngle! +
      (Math.PI / depthSpacer![0]) * depthPoint!,
    getBaseCellColor: () => ringColormap[1],
    getBaseCellSize: () => 0.03,
    getOverlayCellSize: () => 0.0275,
    getBaseRotationRadius: () => 1,
    getOverlayRotationRadius: () => 1.01,
  })
  return (
    <CellGraphic
      lightDepth={100}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      cameraDepth={cameraDepth}
      worldCellPoints={[...beeCellsA, ...beeCellsB, ...beeCellsC, ...beeCellsD]}
    />
  )
}

interface GetBeeCellsApi
  extends Pick<
    GetRingCellsApi,
    | 'ringDepth'
    | 'ringRadius'
    | 'ringSpacer'
    | 'ringSymmetricWeights'
    | 'getDepthSpacerStructure'
    | 'getDepthSpacerPhase'
    | 'getDepthLoopStructure'
    | 'getSliceRadius'
    | 'getSliceTransformedAngle'
    | 'getSliceLoopStructure'
  > {
  renderOverlay: boolean
  baseSliceResolution: number
  overlaySliceResolution: number
  rotationAngle: number
  getBaseRotationRadius: (ringData: RingData) => number
  getOverlayRotationRadius: (ringData: RingData) => number
  getBaseCellColor: (ringData: RingData) => string
  getBaseCellSize: (ringData: RingData) => number
  getOverlayCellSize: (ringData: RingData) => number
}

function getBeeCells(api: GetBeeCellsApi): Array<WorldCellPoint> {
  const {
    ringRadius,
    ringDepth,
    ringSpacer,
    ringSymmetricWeights,
    getDepthSpacerStructure,
    getDepthSpacerPhase,
    getDepthLoopStructure,
    getSliceLoopStructure,
    getSliceRadius,
    getSliceTransformedAngle,
    baseSliceResolution,
    getBaseRotationRadius,
    getBaseCellColor,
    getBaseCellSize,
    rotationAngle,
    renderOverlay,
    overlaySliceResolution,
    getOverlayRotationRadius,
    getOverlayCellSize,
  } = api
  const baseCells = getRingCells({
    ringRadius,
    ringDepth,
    ringSpacer,
    ringSymmetricWeights,
    getDepthSpacerStructure,
    getDepthSpacerPhase,
    getDepthLoopStructure,
    getSliceLoopStructure,
    getSliceRadius,
    getSliceTransformedAngle,
    getCellSize: getBaseCellSize,
    getCellColor: getBaseCellColor,
    getSliceSpacerStructure: () => [
      baseSliceResolution,
      [baseSliceResolution, 0],
    ],
    getSliceSymmetricWeights: ({ sliceSpacer }) =>
      spacerSymmetricSlotWeights(sliceSpacer!),
    getOrientationPhase: ({ ringWeight, ringRelativeWeight }) =>
      ringWeight! * rotationAngle + (1 - ringRelativeWeight!) * Math.PI,
    getTransformedCellPoint: (orientedCellPoint, ringData) => {
      const {
        depthCosine,
        depthSine,
        sliceCosine,
        sliceSine,
        depthAngle,
        sliceAngle,
      } = ringData
      return rotatedVector(
        sphericalToCartesian(
          depthCosine!,
          depthSine!,
          sliceCosine!,
          sliceSine!,
          [getBaseRotationRadius(ringData), depthAngle!, sliceAngle!]
        ),
        rotationAngle,
        orientedCellPoint
      )
    },
  })
  let overlayCells: Array<WorldCellPoint> = []
  if (renderOverlay) {
    overlayCells = getRingCells({
      ringRadius,
      ringDepth,
      ringSpacer,
      ringSymmetricWeights,
      getDepthSpacerStructure,
      getDepthSpacerPhase,
      getDepthLoopStructure,
      getSliceLoopStructure,
      getSliceRadius,
      getSliceTransformedAngle,
      getCellSize: getOverlayCellSize,
      getCellColor: () => 'black',
      getSliceSpacerStructure: () => [
        overlaySliceResolution,
        [overlaySliceResolution, 0],
      ],
      getSliceSymmetricWeights: ({ sliceSpacer }) =>
        spacerSymmetricSlotWeights(sliceSpacer!),
      getOrientationPhase: ({ ringWeight, ringRelativeWeight }) =>
        ringWeight! * rotationAngle + (1 - ringRelativeWeight!) * Math.PI,
      getTransformedCellPoint: (orientedCellPoint, ringData) => {
        const {
          depthCosine,
          depthSine,
          sliceCosine,
          sliceSine,
          depthAngle,
          sliceAngle,
        } = ringData
        return rotatedVector(
          sphericalToCartesian(
            depthCosine!,
            depthSine!,
            sliceCosine!,
            sliceSine!,
            [getOverlayRotationRadius(ringData), depthAngle!, sliceAngle!]
          ),
          rotationAngle,
          orientedCellPoint
        )
      },
    })
  }
  return [...baseCells, ...overlayCells]
}

interface GetRingCellsApi {
  ringDepth: number
  ringRadius: number
  ringSpacer: Spacer
  ringSymmetricWeights: Array<SpacerSlotWeight>
  getDepthSpacerStructure: (ringData: RingData) => AlignedSpacerStructure
  getDepthSpacerPhase: (ringData: RingData) => number
  getDepthLoopStructure: (ringData: RingData) => LoopStructure
  getSliceSpacerStructure: (ringData: RingData) => AlignedSpacerStructure
  getSliceSymmetricWeights: (ringData: RingData) => Array<SpacerSlotWeight>
  getSliceLoopStructure: (ringData: RingData) => LoopStructure
  getSliceRadius: (ringData: RingData) => number
  getSliceTransformedAngle: (ringData: RingData) => number
  getOrientationPhase: (ringData: RingData) => number
  getTransformedCellPoint: (
    orientedCellPoint: Point3,
    ringData: RingData
  ) => Point3
  getCellSize: (ringData: RingData) => number
  getCellColor: (ringData: RingData) => string
}

interface RingData {
  ringRadius?: number
  ringSpacer?: Spacer
  ringMaxWeight?: SpacerSlotWeight
  ringPoint?: SpacerPoint
  ringWeight?: SpacerSlotWeight
  ringRelativeWeight?: number
  ringAngle?: number
  ringOrientationAxis?: Vector3
  depthSpacerStructure?: AlignedSpacerStructure
  depthSpacerPhase?: number
  depthSpacer?: Spacer
  depthWeights?: Array<SpacerSlotWeight>
  depthMaxWeight?: SpacerSlotWeight
  depthLoopStructure?: LoopStructure
  depthCosine?: (inputAngle: number) => number
  depthSine?: (inputAngle: number) => number
  depthPoint?: number
  depthAngle?: number
  depthWeight?: SpacerSlotWeight
  depthRelativeWeight?: number
  sliceAngle?: number
  sliceTransformedAngle?: number
  sliceMaxWeight?: number
  sliceWeight?: number
  sliceRelativeWeight?: number
  sliceSpacerStructure?: AlignedSpacerStructure
  sliceSpacer?: Spacer
  sliceSymmetricWeights?: Array<SpacerSlotWeight>
  sliceLoopStructure?: LoopStructure
  sliceCosine?: (inputAngle: number) => number
  sliceSine?: (inputAngle: number) => number
}

function getRingCells(api: GetRingCellsApi): Array<WorldCellPoint> {
  const {
    ringSpacer,
    ringSymmetricWeights,
    ringRadius,
    getDepthSpacerStructure,
    getDepthSpacerPhase,
    getDepthLoopStructure,
    getSliceSpacerStructure,
    getSliceSymmetricWeights,
    getSliceLoopStructure,
    getSliceTransformedAngle,
    getSliceRadius,
    ringDepth,
    getOrientationPhase,
    getTransformedCellPoint,
    getCellSize,
    getCellColor,
  } = api
  const ringData: RingData = {}
  ringData.ringRadius = ringRadius
  ringData.ringSpacer = ringSpacer
  ringData.ringMaxWeight = ringSymmetricWeights[0]
  const ringAngleStep = (2 * Math.PI) / ringData.ringSpacer[0]
  const { culledRingPoints } = getCulledRingPoints({
    ringSpacer,
  })
  const resultRingCells: Array<WorldCellPoint> = []
  for (const ringPoint of culledRingPoints) {
    ringData.ringPoint = ringPoint
    ringData.ringWeight = ringSymmetricWeights[ringData.ringPoint]
    if (!(ringData.ringWeight > 0)) continue
    ringData.ringRelativeWeight = ringData.ringWeight / ringData.ringMaxWeight
    ringData.ringAngle = ringPoint * ringAngleStep
    const translatedRingAngle = ringData.ringAngle + Math.PI / 2
    const ringOriginX = ringRadius * Math.cos(translatedRingAngle)
    const ringOriginY = ringRadius * Math.sin(translatedRingAngle)
    ringData.ringOrientationAxis = normalizedVector(
      rotatedVector([0, 0, 1], ringData.ringAngle, [1, 0, 0])
    )
    ringData.depthSpacerStructure = getDepthSpacerStructure(ringData)
    ringData.depthSpacerPhase = getDepthSpacerPhase(ringData)
    ringData.depthSpacer = phasedSpacer(
      spacer(ringData.depthSpacerStructure),
      ringData.depthSpacerPhase
    )
    ringData.depthWeights = spacerTerminalSlotWeights(
      ringData.depthSpacerStructure
    )
    ringData.depthMaxWeight = ringData.depthWeights[0]
    const depthAngleStep = Math.PI / ringData.depthSpacer[0]
    ringData.depthLoopStructure = getDepthLoopStructure(ringData)
    ringData.depthCosine = (cellAngle: number) =>
      loopCosine(loopPoint(ringData.depthLoopStructure!, cellAngle))
    ringData.depthSine = (cellAngle: number) =>
      loopSine(loopPoint(ringData.depthLoopStructure!, cellAngle))
    for (const depthPoint of ringData.depthSpacer[1]) {
      ringData.depthPoint = depthPoint
      ringData.depthAngle = ringData.depthPoint * depthAngleStep
      ringData.depthWeight = ringData.depthWeights[ringData.depthPoint]
      ringData.depthRelativeWeight =
        ringData.depthWeight / ringData.depthMaxWeight
      ringData.sliceSpacerStructure = getSliceSpacerStructure(ringData)
      ringData.sliceSpacer = spacer(ringData.sliceSpacerStructure)
      ringData.sliceSymmetricWeights = getSliceSymmetricWeights(ringData)
      ringData.sliceMaxWeight = ringData.sliceSymmetricWeights[0]
      const sliceAngleStep = (2 * Math.PI) / ringData.sliceSpacer[0]
      ringData.sliceLoopStructure = getSliceLoopStructure(ringData)
      ringData.sliceCosine = (angle) =>
        loopCosine(loopPoint(ringData.sliceLoopStructure!, angle))
      ringData.sliceSine = (angle) =>
        loopSine(loopPoint(ringData.sliceLoopStructure!, angle))
      for (
        let sliceIndex = 0;
        sliceIndex < ringData.sliceSpacer[0];
        sliceIndex++
      ) {
        ringData.sliceWeight = ringData.sliceSymmetricWeights[sliceIndex]
        ringData.sliceRelativeWeight =
          ringData.sliceWeight / ringData.sliceMaxWeight
        ringData.sliceAngle = sliceIndex * sliceAngleStep
        ringData.sliceTransformedAngle = normalizedAngle(
          getSliceTransformedAngle(ringData)
        )
        const cellBasePoint = sphericalToCartesian(
          ringData.depthCosine,
          ringData.depthSine,
          ringData.sliceCosine,
          ringData.sliceSine,
          [
            getSliceRadius(ringData),
            ringData.depthAngle,
            ringData.sliceTransformedAngle,
          ]
        )
        const cellOrientedPoint = rotatedVector(
          ringData.ringOrientationAxis,
          Math.atan2(
            Math.sqrt(ringOriginX * ringOriginX + ringOriginY * ringOriginY),
            ringDepth
          ) + getOrientationPhase(ringData),
          cellBasePoint
        )
        const cellTransformedPoint = getTransformedCellPoint(
          cellOrientedPoint,
          ringData
        )
        const sliceTranslatedPoint: Point3 = [
          cellTransformedPoint[0] + ringOriginX,
          cellTransformedPoint[1] + ringOriginY,
          cellTransformedPoint[2],
        ]
        const sliceMirroredPoint = reflectedPoint(
          [
            [0, 0, sliceTranslatedPoint[2]],
            [0, 1, sliceTranslatedPoint[2]],
          ],
          sliceTranslatedPoint
        )
        const cellSize = getCellSize(ringData)
        const cellColor = getCellColor(ringData)
        resultRingCells.push([...sliceTranslatedPoint, cellSize, cellColor])
        resultRingCells.push([...sliceMirroredPoint, cellSize, cellColor])
      }
    }
  }
  return resultRingCells
}

interface GetCulledRingPointsApi extends Pick<GetRingCellsApi, 'ringSpacer'> {}

function getCulledRingPoints(api: GetCulledRingPointsApi) {
  const { ringSpacer } = api
  const culledRingPoints = Array.from(
    ringSpacer[1].reduce((resultPointSet, someRingPoint) => {
      const zeroDistance = someRingPoint
      const resolutionDistance = ringSpacer[0] - someRingPoint
      const mirrorPoint =
        zeroDistance === resolutionDistance
          ? someRingPoint
          : zeroDistance < resolutionDistance
          ? ringSpacer[0] - zeroDistance
          : resolutionDistance
      if (!resultPointSet.has(mirrorPoint)) {
        resultPointSet.add(someRingPoint)
      }
      return resultPointSet
    }, new Set<number>())
  )
  return { culledRingPoints }
}

function spacerTerminalSlotWeights(
  someAlignedStructure: AlignedSpacerStructure
): Array<SpacerSlotWeight> {
  const depthLineage = spacerLineage(someAlignedStructure)
  const depthTerminalGroup = spacerGroup(depthLineage[depthLineage.length - 1])
  const depthTerminalSpacers = depthTerminalGroup.map((someTerminalStructure) =>
    spacer(someTerminalStructure)
  )
  return spacerSlotWeights(depthTerminalSpacers)
}

function spacerResolutionMap(
  maxResolution: number,
  minResolution: number,
  minResolutionOrientation: number = 0
): Array<number> {
  return spacerIntervals(
    spacer([maxResolution, [minResolution, minResolutionOrientation]])
  ).reduce<Array<number>>((result, currentPointInterval, pointIndex) => {
    for (let i = 0; i < currentPointInterval; i++) {
      result.push(pointIndex)
    }
    return result
  }, [])
}

function spacerFoo(
  maxResolution: number,
  minResolution: number,
  frameIndex: number
) {
  return spacerResolutionMap(
    maxResolution,
    minResolution,
    spacerResolutionMap(
      maxResolution,
      maxResolution - (maxResolution % minResolution)
    )[frameIndex] % minResolution
  )[frameIndex]
}

function noteFrequency(
  baseFrequency: number,
  octaveResolution: number,
  noteIndex: number
) {
  return Math.pow(2, noteIndex / octaveResolution) * baseFrequency
}
