import { AnimationModule } from 'clumsy-graphics'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import React from 'react'
import { Vector3, getNormalizedVector } from '../library/Vector3'
import { getRotatedPoint } from 'clumsy-math'

const OrbAnimationModule: AnimationModule = {
  moduleName: 'Orb',
  getFrameDescription: getOrbFrameDescription,
  frameCount: 64,
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
  for (let depthIndex = 0; depthIndex < depthResolution; depthIndex++) {
    for (let polarIndex = 0; polarIndex < polarResolution; polarIndex++) {
      const basePoint = sphericalToCartesian([
        radiusA,
        depthIndex * depthAngleStep,
        polarIndex * polarAngleStep,
      ])
      const rotatedPoint = getRotatedCellVector(
        // getNormalizedVector([-1, 1, 0]),
        getNormalizedVector([
          Math.sin(8 * 2 * Math.PI * frameStamp) *
            Math.cos(4 * 2 * Math.PI * frameStamp),
          Math.sin(8 * 2 * Math.PI * frameStamp) *
            Math.sin(4 * 2 * Math.PI * frameStamp),
          Math.cos(8 * 2 * Math.PI * frameStamp),
        ]),
        2 * Math.PI * frameStamp,
        basePoint
      )
      spherePointsA.push([...rotatedPoint, 0.05, 'white'])
      spherePointsA.push([
        // ??? [0,1,0] => [1,0,0]
        ...getRotatedCellVector([1, 0, 0], Math.PI, rotatedPoint),
        0.05,
        'white',
      ])
    }
  }
  return (
    <CellGraphic
      cameraDepth={-10}
      lightDepth={30}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      worldCellPoints={[
        ...spherePointsA,
        // ...spherePointsA.map<WorldCellPoint>((somePoint) => {
        //   return [
        //     ...getRotatedCellVector([1, 0, 0], Math.PI, [
        //       somePoint[0],
        //       somePoint[1],
        //       somePoint[2],
        //     ]),
        //     somePoint[3],
        //     somePoint[4],
        //   ]
        // }),
      ]}
    />
  )
}

type SphericalCoordinate = [
  radius: number,
  depthAngle: number,
  polarAngle: number
]
type CartesianCoordinate = [x: number, y: number, z: number]

function sphericalToCartesian(
  someSpherical: SphericalCoordinate
): CartesianCoordinate {
  return [
    someSpherical[0] * Math.sin(someSpherical[1]) * Math.cos(someSpherical[2]),
    someSpherical[0] * Math.sin(someSpherical[1]) * Math.sin(someSpherical[2]),
    someSpherical[0] * Math.cos(someSpherical[1]),
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
