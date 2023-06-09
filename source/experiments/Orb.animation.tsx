import { AnimationModule } from 'clumsy-graphics'
import {
  LOOP_ONE,
  LoopStructure,
  loopCosine,
  loopPendulum,
  loopPoint,
  loopSine,
} from 'clumsy-math'
import React from 'react'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import { Vector3, normalizedVector } from '../library/Vector3'

const OrbAnimationModule: AnimationModule = {
  moduleName: 'Orb',
  getFrameDescription: getOrbFrameDescription,
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

export default OrbAnimationModule

interface GetOrbFrameDescriptionApi {
  frameCount: number
  frameIndex: number
}

async function getOrbFrameDescription(api: GetOrbFrameDescriptionApi) {
  const { frameIndex, frameCount } = api
  const frameStamp = frameIndex / frameCount
  const orbPoints: Array<WorldCellPoint> = []
  const orbResolution = 128
  const rotationAngle = 2 * Math.PI * frameStamp
  const depthAngleStep = Math.PI / orbResolution
  const sliceDepthPhaseStep = Math.PI / orbResolution
  const sliceAngleStep = (2 * Math.PI) / orbResolution
  const loopStructureA: LoopStructure = [
    [0.9, LOOP_ONE, rotationAngle, 0, 0],
    [0.9, LOOP_ONE, normalizedAngle(-2 * rotationAngle), 0, 0],
  ]
  const depthCosine = (inputAngle: number) =>
    10 * loopPendulum(loopPoint(loopStructureA, inputAngle))
  const depthSine = (inputAngle: number) =>
    10 *
    loopPendulum(loopPoint(loopStructureA, normalizedAngle(2 * inputAngle)))
  const sliceCosine = (inputAngle: number) =>
    loopCosine(loopPoint(loopStructureA, inputAngle))
  const sliceSine = (inputAngle: number) =>
    loopSine(loopPoint(loopStructureA, inputAngle))
  for (let depthIndex = 0; depthIndex < orbResolution; depthIndex++) {
    for (let sliceIndex = 0; sliceIndex < orbResolution; sliceIndex++) {
      orbPoints.push([
        ...rotatedCellVector(
          normalizedVector([1, 0, 0]),
          normalizedAngle(2 * rotationAngle),
          sphericalToCartesian(depthCosine, depthSine, sliceCosine, sliceSine, [
            8,
            depthIndex * depthAngleStep,
            (sliceIndex * sliceAngleStep +
              (Math.PI / orbResolution) * depthIndex) %
              (2 * Math.PI),
          ])
        ),
        0.1,
        'white',
      ])
    }
  }
  return (
    <CellGraphic
      cameraDepth={-15}
      lightDepth={100}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      worldCellPoints={[...orbPoints]}
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
