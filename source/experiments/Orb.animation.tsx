import { AnimationModule } from 'clumsy-graphics'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import React from 'react'
import { Vector3, getNormalizedVector } from '../library/Vector3'
import * as Wave from '../library/Wave'

const OrbAnimationModule: AnimationModule = {
  moduleName: 'Orb',
  getFrameDescription: getOrbFrameDescription,
  frameCount: 48 * 3,
  frameSize: {
    width: 1024,
    height: 1024,
  },
  animationSettings: {
    frameRate: 10,
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
  const radiusA = 5
  const depthResolution = 64
  const polarResolution = 64
  const spherePointsA: Array<WorldCellPoint> = []
  const depthAngleStep = Math.PI / (depthResolution - 1)
  const polarAngleStep = (2 * Math.PI) / polarResolution
  const depthFunctions: PlaneFunctions = [
    (someInputAngle) =>
      Wave.cos(
        Wave.point(
          [
            [0.875, Wave.WAVE_ONE, 0, 0, 0],
            [0.75, Wave.WAVE_ONE, 0, 0, 0],
          ],
          someInputAngle
        )
      ),
    (someInputAngle) =>
      Wave.sin(
        Wave.point(
          [
            [0.875, Wave.WAVE_ONE, 0, 0, 0],
            [0.75, Wave.WAVE_ONE, 0, 0, 0],
          ],
          someInputAngle
        )
      ),
  ]
  for (let depthIndex = 0; depthIndex < depthResolution; depthIndex++) {
    const depthStamp = depthIndex / depthResolution
    const sliceFunctions: PlaneFunctions = [
      (someInputAngle) =>
        Wave.cos(
          Wave.point(
            [
              [
                0.875,
                Wave.WAVE_ONE,
                2 * Math.PI * frameStamp,
                -2 * 2 * Math.PI * frameStamp,
                0,
              ],
              [
                0.75,
                Wave.WAVE_ONE,
                2 * 2 * Math.PI * frameStamp,
                -2 * Math.PI * frameStamp,
                0,
              ],
            ],
            someInputAngle
          )
        ),
      (someInputAngle) =>
        Wave.sin(
          Wave.point(
            [
              [
                0.875,
                Wave.WAVE_ONE,
                2 * Math.PI * frameStamp,
                -2 * 2 * Math.PI * frameStamp,
                0,
              ],
              [
                0.75,
                Wave.WAVE_ONE,
                2 * 2 * Math.PI * frameStamp,
                -2 * Math.PI * frameStamp,
                0,
              ],
            ],
            someInputAngle
          )
        ),
    ]
    for (let polarIndex = 0; polarIndex < polarResolution; polarIndex++) {
      const basePoint = sphericalToCartesian(depthFunctions, sliceFunctions, [
        radiusA,
        depthIndex * depthAngleStep,
        polarIndex * polarAngleStep,
      ])
      const rotatedPoint = getRotatedCellVector(
        // getNormalizedVector([1, 0, 0]),
        getNormalizedVector([
          depthFunctions[1](8 * 2 * Math.PI * frameStamp) *
            sliceFunctions[0](4 * 2 * Math.PI * frameStamp),
          depthFunctions[1](8 * 2 * Math.PI * frameStamp) *
            sliceFunctions[1](4 * 2 * Math.PI * frameStamp),
          depthFunctions[0](8 * 2 * Math.PI * frameStamp),
        ]),
        2 * Math.PI * frameStamp,
        basePoint
      )
      spherePointsA.push([...rotatedPoint, 0.04, 'white'])
    }
  }
  return (
    <CellGraphic
      cameraDepth={-10}
      lightDepth={30}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      worldCellPoints={[...spherePointsA]}
    />
  )
}

type SphericalCoordinate = [
  radius: number,
  depthPlaneAngle: number,
  slicePlaneAngle: number
]

type CartesianCoordinate = [x: number, y: number, z: number]

type PlaneFunctions = [
  cosine: PlaneComponentFunction,
  sine: PlaneComponentFunction
]

type PlaneComponentFunction = (someAngle: number) => number

function sphericalToCartesian(
  depthFunctions: PlaneFunctions,
  sliceFunctions: PlaneFunctions,
  someSpherical: SphericalCoordinate
): CartesianCoordinate {
  return [
    someSpherical[0] *
      depthFunctions[1](someSpherical[1]) *
      sliceFunctions[0](someSpherical[2]),
    someSpherical[0] *
      depthFunctions[1](someSpherical[1]) *
      sliceFunctions[1](someSpherical[2]),
    someSpherical[0] * depthFunctions[0](someSpherical[1]),
  ]
}

function getRotatedCellVector(
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
