import { AnimationModule } from 'clumsy-graphics'
import {
  AlignedSpacerStructure,
  loopCosine,
  loopPoint,
  loopSine,
  LoopStructure,
  phasedSpacer,
  spacer,
  Spacer,
  spacerGroup,
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
  frameCount: 42 * 8,
  frameSize: {
    width: 1024 * 6,
    height: 1024 * 6,
  },
  animationSettings: {
    frameRate: 7,
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
  const cameraDepth = -10
  const ringSpacerA = spacer([12, [5, 0]])
  const ringColormap = [
    'rgb(212,214,174)',
    'rgb(216,179,189)',
    'rgb(174,222,191)',
    'rgb(61,218,183)',
    'rgb(4,183,192)',
  ]
  const ringCellPointsA = getRingCells({
    ringRadius: 2,
    ringDepth: -cameraDepth,
    ringSpacer: ringSpacerA,
    ringSymmetricWeights: spacerSymmetricSlotWeights(ringSpacerA),
    getDepthSpacer: ({ ringWeight, ringMaxWeight }) => {
      const depthDensity = 19
      const ringDepthSpacer = spacer([depthDensity, [ringMaxWeight!, 0]])
      return phasedSpacer(
        spacer([
          frameCount,
          [31, 0],
          [29, 0],
          [23, 0],
          [
            depthDensity,
            ringDepthSpacer[1][ringWeight! % ringDepthSpacer[1].length],
          ],
        ]),
        frameIndex
      )
    },
    getDepthWeights: ({ ringWeight, ringMaxWeight }) => {
      const depthDensity = 19
      const ringDepthSpacer = spacer([depthDensity, [ringMaxWeight!, 0]])
      return spacerTerminalSlotWeights([
        frameCount,
        [31, 0],
        [29, 0],
        [23, 0],
        [
          depthDensity,
          ringDepthSpacer[1][ringWeight! % ringDepthSpacer[1].length],
        ],
      ])
      //   return spacerTerminalSlotWeights([
      //     18,
      //     [17, 0],
      //     [13, 0],
      //     [11, 0],
      //     [7, 0],
      //     [5, 0],
      //   ])
    },
    getDepthLoopStructure: ({ ringAngle }) => [
      [0.95, 0.95, ringAngle!, 0, 0],
      [0.875, 0.875, normalizedAngle(-2 * ringAngle!), 0, 0],
      [0.75, 0.75, normalizedAngle(4 * ringAngle!), 0, 0],
    ],
    getSliceSpacerStructure: () => [30, [30, 0]],
    getSliceSymmetricWeights: ({ sliceSpacer }) =>
      spacerSymmetricSlotWeights(sliceSpacer!),
    getSliceLoopStructure: ({ ringAngle }) => [
      [0.95, 0.95, ringAngle!, normalizedAngle(-frameAngle), frameAngle],
      [
        0.875,
        0.875,
        normalizedAngle(-2 * ringAngle!),
        normalizedAngle(2 * frameAngle),
        0,
      ],
      [
        0.75,
        0.75,
        normalizedAngle(4 * ringAngle!),
        normalizedAngle(-4 * frameAngle),
        0,
      ],
    ],
    getSliceRadius: ({ depthRelativeWeight, ringRelativeWeight }) => {
      return ringRelativeWeight! + depthRelativeWeight! * 4 + 4
    },
    getSlicePhase: ({ depthSpacer, depthPoint }) =>
      (Math.PI / depthSpacer![0]) * depthPoint!,
    getOrientationPhase: ({ ringWeight, ringRelativeWeight }) =>
      ringWeight! * frameAngle + (1 - ringRelativeWeight!) * Math.PI,
    getCellSize: ({ ringRelativeWeight }) => ringRelativeWeight! * 0.45,
    getCellColor: ({ ringWeight }) => ringColormap[ringWeight! - 1],
    getTransformedCellPoint: (
      orientedCellPoint,
      {
        depthCosine,
        depthSine,
        sliceCosine,
        sliceSine,
        ringRelativeWeight,
        depthAngle,
        sliceAngle,
        depthSpacer,
        depthPoint,
        depthRelativeWeight,
        sliceLoopStructure,
      }
    ) =>
      rotatedVector(
        sphericalToCartesian(
          depthCosine!,
          depthSine!,
          sliceCosine!,
          sliceSine!,
          [
            ringRelativeWeight! + 0.125,
            depthAngle!,
            normalizedAngle(
              sliceAngle! + (Math.PI / depthSpacer![0]) * depthPoint!
            ),
          ]
        ),
        frameAngle,
        orientedCellPoint
      ),
  })
  const ringCellPointsB = getRingCells({
    ringRadius: 2,
    ringDepth: -cameraDepth,
    ringSpacer: ringSpacerA,
    ringSymmetricWeights: spacerSymmetricSlotWeights(ringSpacerA),
    getDepthSpacer: ({ ringWeight, ringMaxWeight }) => {
      const depthDensity = 19
      const ringDepthSpacer = spacer([depthDensity, [ringMaxWeight!, 0]])
      return phasedSpacer(
        spacer([
          frameCount,
          [31, 0],
          [29, 0],
          [23, 0],
          [
            depthDensity,
            ringDepthSpacer[1][ringWeight! % ringDepthSpacer[1].length],
          ],
        ]),
        frameIndex
      )
    },
    getDepthWeights: ({ ringWeight, ringMaxWeight }) => {
      const depthDensity = 19
      const ringDepthSpacer = spacer([depthDensity, [ringMaxWeight!, 0]])
      return spacerTerminalSlotWeights([
        frameCount,
        [31, 0],
        [29, 0],
        [23, 0],
        [
          depthDensity,
          ringDepthSpacer[1][ringWeight! % ringDepthSpacer[1].length],
        ],
      ])
      //   return spacerTerminalSlotWeights([
      //     18,
      //     [17, 0],
      //     [13, 0],
      //     [11, 0],
      //     [7, 0],
      //     [5, 0],
      //   ])
    },
    getDepthLoopStructure: ({ ringAngle }) => [
      [0.95, 0.95, ringAngle!, 0, 0],
      [0.875, 0.875, normalizedAngle(-2 * ringAngle!), 0, 0],
      [0.75, 0.75, normalizedAngle(4 * ringAngle!), 0, 0],
    ],
    getSliceSpacerStructure: () => [18, [18, 0]],
    getSliceSymmetricWeights: ({ sliceSpacer }) =>
      spacerSymmetricSlotWeights(sliceSpacer!),
    getSliceLoopStructure: ({ ringAngle }) => [
      [0.95, 0.95, ringAngle!, normalizedAngle(-frameAngle), frameAngle],
      [
        0.875,
        0.875,
        normalizedAngle(-2 * ringAngle!),
        normalizedAngle(2 * frameAngle),
        0,
      ],
      [
        0.75,
        0.75,
        normalizedAngle(4 * ringAngle!),
        normalizedAngle(-4 * frameAngle),
        0,
      ],
    ],
    getSliceRadius: ({ depthRelativeWeight, ringRelativeWeight }) => {
      return ringRelativeWeight! + depthRelativeWeight! * 4 + 4
    },
    getSlicePhase: ({ depthSpacer, depthPoint }) =>
      (Math.PI / depthSpacer![0]) * depthPoint!,
    getOrientationPhase: ({ ringWeight, ringRelativeWeight }) =>
      ringWeight! * frameAngle + (1 - ringRelativeWeight!) * Math.PI,
    getCellSize: ({ ringRelativeWeight }) => ringRelativeWeight! * 0.4,
    getCellColor: ({ ringWeight }) => 'black',
    getTransformedCellPoint: (
      orientedCellPoint,
      {
        depthCosine,
        depthSine,
        sliceCosine,
        sliceSine,
        ringRelativeWeight,
        depthAngle,
        sliceAngle,
        depthSpacer,
        depthPoint,
        depthRelativeWeight,
        sliceLoopStructure,
      }
    ) =>
      rotatedVector(
        sphericalToCartesian(
          depthCosine!,
          depthSine!,
          sliceCosine!,
          sliceSine!,
          [
            ringRelativeWeight! + 0.13,
            depthAngle!,
            normalizedAngle(
              sliceAngle! + (Math.PI / depthSpacer![0]) * depthPoint!
            ),
          ]
        ),
        frameAngle,
        orientedCellPoint
      ),
  })
  return (
    <CellGraphic
      lightDepth={100}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      cameraDepth={cameraDepth}
      worldCellPoints={[...ringCellPointsA, ...ringCellPointsB]}
    />
  )
}

interface GetRingCellsApi {
  ringDepth: number
  ringRadius: number
  ringSpacer: Spacer
  ringSymmetricWeights: Array<SpacerSlotWeight>
  getDepthSpacer: (ringData: RingData) => Spacer
  getDepthWeights: (ringData: RingData) => Array<SpacerSlotWeight>
  getDepthLoopStructure: (ringData: RingData) => LoopStructure
  getSliceSpacerStructure: (ringData: RingData) => AlignedSpacerStructure
  getSliceSymmetricWeights: (ringData: RingData) => Array<SpacerSlotWeight>
  getSliceLoopStructure: (ringData: RingData) => LoopStructure
  getSliceRadius: (ringData: RingData) => number
  getSlicePhase: (ringData: RingData) => number
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
    getDepthSpacer,
    getDepthWeights,
    getDepthLoopStructure,
    getSliceSpacerStructure,
    getSliceSymmetricWeights,
    getSliceLoopStructure,
    getSliceRadius,
    getSlicePhase,
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
    ringData.depthSpacer = getDepthSpacer(ringData)
    ringData.depthWeights = getDepthWeights(ringData)
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
      const sliceAngleStep = (2 * Math.PI) / ringData.sliceSpacer[0]
      ringData.sliceLoopStructure = getSliceLoopStructure(ringData)
      ringData.sliceCosine = (cellAngle: number) =>
        loopCosine(loopPoint(ringData.sliceLoopStructure!, cellAngle))
      ringData.sliceSine = (cellAngle: number) =>
        loopSine(loopPoint(ringData.sliceLoopStructure!, cellAngle))
      for (
        let sliceIndex = 0;
        sliceIndex < ringData.sliceSpacer[0];
        sliceIndex++
      ) {
        ringData.sliceAngle = sliceIndex * sliceAngleStep
        // sliceWeight = ringData.sliceSymmetricWeights[sliceIndex]

        const cellBasePoint = sphericalToCartesian(
          ringData.depthCosine,
          ringData.depthSine,
          ringData.sliceCosine,
          ringData.sliceSine,
          [
            getSliceRadius(ringData),
            ringData.depthAngle,
            normalizedAngle(ringData.sliceAngle + getSlicePhase(ringData)),
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
