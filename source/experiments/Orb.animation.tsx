import { AnimationModule } from 'clumsy-graphics'
import {
  AlignedSpacerStructure,
  loopCosine,
  loopPoint,
  loopSine,
  LoopStructure,
  phasedSpacer,
  spacer,
  spacerGroup,
  spacerLineage,
  spacerSlotWeights,
  spacerSymmetricSlotWeights,
} from 'clumsy-math'
import React from 'react'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import { reflectedPoint } from '../library/Point3'
import { normalizedVector, Vector3 } from '../library/Vector3'
// import colormap from 'colormap'

const OrbAnimationModule: AnimationModule = {
  moduleName: 'Orb',
  getFrameDescription: getOrbFrameDescription,
  frameCount: 64 * 8,
  frameSize: {
    width: 1024 * 3,
    height: 1024 * 3,
  },
  animationSettings: {
    frameRate: 60,
    constantRateFactor: 1,
  },
}

export default OrbAnimationModule

interface GetOrbFrameDescriptionApi {
  frameCount: number
  frameIndex: number
}

async function getOrbFrameDescription(api: GetOrbFrameDescriptionApi) {
  const { frameIndex, frameCount } = api
  const frameStamp = frameIndex / frameCount
  const frameAngle = 2 * Math.PI * frameStamp
  const cameraDepth = 10 // 10 * Math.sin(frameAngle) + 10
  const orbResolution = 30
  // const orbFrameSpacer = spacer([frameCount, [orbResolution, 0]])
  const depthAngleStep = Math.PI / orbResolution
  const sliceAngleStep = (2 * Math.PI) / orbResolution
  const ringResolution = 12
  const ringResolutionHalf = ringResolution / 2
  const ringSpacer = spacer([ringResolution, [5, 0]])
  const ringRadius = 2.5 // 12
  const ringAngleStep = (2 * Math.PI) / ringSpacer[0]
  const ringFullSlotWeights = spacerSymmetricSlotWeights(ringSpacer)
  const depthDensity = 19
  const ringDepthSpacer = spacer([depthDensity, [ringFullSlotWeights[0], 0]])
  // const ringColormap = [
  //   'rgb(215,117,62)',
  //   'rgb(226,138,90)',
  //   'rgb(237,164,113)',
  //   'rgb(247,187,139)',
  //   'rgb(255,217,178)',
  // ]
  const ringColormap = [
    'rgb(212,214,174)',
    'rgb(216,179,189)',
    'rgb(174,222,191)',
    'rgb(61,218,183)',
    'rgb(4,183,192)',
  ]
  const ringPoints = ringFullSlotWeights
    .slice(0, ringResolutionHalf)
    .reduce<Array<WorldCellPoint>>(
      (resultRingPoints, someSlotWeight, slotIndex) => {
        if (someSlotWeight === 0) return resultRingPoints
        const baseRingPointAngle = slotIndex * ringAngleStep
        const ringPointAngle = baseRingPointAngle + Math.PI / 2
        const slotRotationAxis = normalizedVector(
          rotatedCellVector([0, 0, 1], baseRingPointAngle, [1, 0, 0])
        )
        const pointOriginY = ringRadius * Math.sin(ringPointAngle)
        const pointOriginX = ringRadius * Math.cos(ringPointAngle)
        const depthLoopStructure: LoopStructure = [
          [0.95, 0.95, baseRingPointAngle, 0, 0],
          [0.875, 0.875, normalizedAngle(-2 * baseRingPointAngle), 0, 0],
          [0.75, 0.75, normalizedAngle(4 * baseRingPointAngle), 0, 0],
        ]
        const depthCosine = (angle: number) =>
          loopCosine(loopPoint(depthLoopStructure, angle))
        const depthSine = (angle: number) =>
          loopSine(loopPoint(depthLoopStructure, angle))
        const baseDepthStructure: AlignedSpacerStructure = [
          frameCount,
          [orbResolution, 0],
          [29, 0],
          [23, 0],
          [
            depthDensity,
            ringDepthSpacer[1][someSlotWeight % ringDepthSpacer[1].length],
          ],
        ]
        const baseDepthLineage = spacerLineage(baseDepthStructure)
        const terminalGroup = spacerGroup(
          baseDepthLineage[baseDepthLineage.length - 1]
        )
        const terminalWeights = spacerSlotWeights(
          terminalGroup.map((someTerminalStructure) =>
            spacer(someTerminalStructure)
          )
        )
        const baseDepthSpacer = spacer(baseDepthStructure)
        const depthSpacer = phasedSpacer(baseDepthSpacer, frameIndex)
        const depthSymmetricWeights =
          spacerSymmetricSlotWeights(baseDepthSpacer)
        for (const depthIndex of depthSpacer[1]) {
          const depthWeight = terminalWeights[depthIndex]!
          const sliceLoopStructure: LoopStructure = [
            [
              0.95,
              0.95,
              baseRingPointAngle,
              normalizedAngle(-frameAngle),
              frameAngle,
            ],
            [
              0.875,
              0.875,
              normalizedAngle(-2 * baseRingPointAngle),
              normalizedAngle(2 * frameAngle),
              0, // normalizedAngle(((2 * Math.PI) / someSlotWeight) * depthIndex),
            ],
            [
              0.75,
              0.75,
              normalizedAngle(4 * baseRingPointAngle),
              normalizedAngle(-4 * frameAngle),
              0, // normalizedAngle(((2 * Math.PI) / someSlotWeight) * depthIndex),
            ],
          ]
          const sliceCosine = (angle: number) =>
            loopCosine(loopPoint(sliceLoopStructure, angle))
          const sliceSine = (angle: number) =>
            loopSine(loopPoint(sliceLoopStructure, angle))
          // const depthColormap = colormap({
          //   colormap: 'rainbow-soft',
          //   nshades: depthSymmetricWeights[0],
          //   format: 'hex',
          //   alpha: 1,
          // })
          for (let sliceIndex = 0; sliceIndex < orbResolution; sliceIndex++) {
            const relativeSliceWeight =
              depthSymmetricWeights[sliceIndex] / depthSymmetricWeights[0]
            const basePoint = sphericalToCartesian(
              depthCosine,
              depthSine,
              sliceCosine,
              sliceSine,
              [
                someSlotWeight / ringFullSlotWeights[0]! +
                  (depthWeight / terminalWeights[0]) * 4 +
                  4,
                depthIndex * depthAngleStep,
                normalizedAngle(
                  sliceIndex * sliceAngleStep +
                    (Math.PI / orbResolution) * depthIndex
                ),
              ]
            )
            const orientedPoint = rotatedCellVector(
              slotRotationAxis,
              Math.atan2(
                Math.sqrt(
                  pointOriginX * pointOriginX + pointOriginY * pointOriginY
                ),
                cameraDepth
              ) +
                someSlotWeight * 2 * Math.PI * frameStamp +
                ((ringFullSlotWeights[0] - someSlotWeight) /
                  ringFullSlotWeights[0]) *
                  Math.PI,
              basePoint
            )
            const rotatedPoint = rotatedCellVector(
              sphericalToCartesian(
                depthCosine,
                depthSine,
                sliceCosine,
                sliceSine,
                [
                  someSlotWeight / ringFullSlotWeights[0]! + 0.25,
                  depthIndex * depthAngleStep,
                  normalizedAngle(
                    sliceIndex * sliceAngleStep +
                      (Math.PI / orbResolution) * depthIndex
                  ),
                ]
              ),
              2 * Math.PI * frameStamp,
              orientedPoint
            )
            // const rotatedPoint = basePoint
            const translatedPoint: Vector3 = [
              rotatedPoint[0] + pointOriginX,
              rotatedPoint[1] + pointOriginY,
              rotatedPoint[2],
            ]
            resultRingPoints.push([
              ...translatedPoint,
              (someSlotWeight / ringFullSlotWeights[0]!) * 0.15,
              ringColormap[someSlotWeight - 1],
            ])
            resultRingPoints.push([
              ...reflectedPoint(
                [
                  [0, 0, translatedPoint[2]],
                  [0, 1, translatedPoint[2]],
                ],
                translatedPoint
              ),
              (someSlotWeight / ringFullSlotWeights[0]!) * 0.15,
              ringColormap[someSlotWeight - 1],
            ])
          }
        }
        return resultRingPoints
      },
      []
    )
  return (
    <CellGraphic
      cameraDepth={-cameraDepth}
      lightDepth={100}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      worldCellPoints={ringPoints}
    />
  )
}

type SphericalCoordinate = [
  radius: number,
  depthPlaneAngle: number,
  slicePlaneAngle: number
]

type CartesianCoordinate = [x: number, y: number, z: number]

type PlaneComponentFunction = (someAngle: number) => number

function sphericalToCartesian(
  depthCosine: PlaneComponentFunction,
  depthSine: PlaneComponentFunction,
  sliceCosine: PlaneComponentFunction,
  sliceSine: PlaneComponentFunction,
  someSpherical: SphericalCoordinate
): CartesianCoordinate {
  const currentDepthSine = depthSine(someSpherical[1])
  return [
    someSpherical[0] * currentDepthSine * sliceCosine(someSpherical[2]),
    someSpherical[0] * currentDepthSine * sliceSine(someSpherical[2]),
    someSpherical[0] * depthCosine(someSpherical[1]),
  ]
}

// function translatedVector()

function rotatedCellVector(
  unitRotationAxis: Vector3,
  rotationAngle: number,
  baseVector: Vector3
): Vector3 {
  const rotationCosine = Math.cos(rotationAngle)
  const rotationSine = Math.sin(rotationAngle)
  const oneMinusRotationCosine = 1 - rotationCosine
  return [
    (unitRotationAxis[0] * unitRotationAxis[0] * oneMinusRotationCosine +
      rotationCosine) *
      baseVector[0] +
      (unitRotationAxis[0] * unitRotationAxis[1] * oneMinusRotationCosine -
        unitRotationAxis[2] * rotationSine) *
        baseVector[1] +
      (unitRotationAxis[0] * unitRotationAxis[2] * oneMinusRotationCosine +
        unitRotationAxis[1] * rotationSine) *
        baseVector[2],
    (unitRotationAxis[0] * unitRotationAxis[1] * oneMinusRotationCosine +
      unitRotationAxis[2] * rotationSine) *
      baseVector[0] +
      (unitRotationAxis[1] * unitRotationAxis[1] * oneMinusRotationCosine +
        rotationCosine) *
        baseVector[1] +
      (unitRotationAxis[1] * unitRotationAxis[2] * oneMinusRotationCosine -
        unitRotationAxis[0] * rotationSine) *
        baseVector[2],
    (unitRotationAxis[0] * unitRotationAxis[2] * oneMinusRotationCosine -
      unitRotationAxis[1] * rotationSine) *
      baseVector[0] +
      (unitRotationAxis[1] * unitRotationAxis[2] * oneMinusRotationCosine +
        unitRotationAxis[0] * rotationSine) *
        baseVector[1] +
      (unitRotationAxis[2] * unitRotationAxis[2] * oneMinusRotationCosine +
        rotationCosine) *
        baseVector[2],
  ]
}

function normalizedAngle(someAngle: number) {
  return ((someAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
}
