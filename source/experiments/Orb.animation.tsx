import { AnimationModule } from 'clumsy-graphics'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import React from 'react'
import { Vector3, getNormalizedVector } from '../library/Vector3'

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
  const radiusA = 5
  const inclineResolution = 16
  const sliceResolution = 16
  const spherePointsA: Array<WorldCellPoint> = []
  const inclineAngleStep = Math.PI / (inclineResolution - 1)
  const sliceAngleStep = (2 * Math.PI) / sliceResolution
  for (let inclineIndex = 0; inclineIndex < inclineResolution; inclineIndex++) {
    for (let sliceIndex = 0; sliceIndex < sliceResolution; sliceIndex++) {
      const basePoint = sphericalToCartesian([
        radiusA,
        inclineIndex * inclineAngleStep,
        sliceIndex * sliceAngleStep,
      ])
      const rotatedPoint = getRotatedCellVector(
        getNormalizedVector([1, 1, 0]),
        2 * Math.PI * frameStamp,
        basePoint
      )
      spherePointsA.push([...rotatedPoint, 0.1, 'white'])
    }
  }
  //   spherePointsA.push([
  //     ...sphericalToCartesian([
  //       radiusA,
  //       0 * inclineAngleStep,
  //       0 * sliceAngleStep,
  //     ]),
  //     0.25,
  //     'white',
  //   ])
  //   spherePointsA.push([
  //     ...sphericalToCartesian([
  //       radiusA,
  //       1 * inclineAngleStep,
  //       0 * sliceAngleStep,
  //     ]),
  //     0.25,
  //     'red',
  //   ])
  //   spherePointsA.push([
  //     ...sphericalToCartesian([
  //       radiusA,
  //       2 * inclineAngleStep,
  //       0 * sliceAngleStep,
  //     ]),
  //     0.25,
  //     'yellow',
  //   ])
  //   spherePointsA.push([
  //     ...sphericalToCartesian([
  //       radiusA,
  //       1 * inclineAngleStep,
  //       1 * sliceAngleStep - Math.PI,
  //     ]),
  //     0.25,
  //     'white',
  //   ])
  //   spherePointsA.push([
  //     ...sphericalToCartesian([
  //       radiusA,
  //       1 * inclineAngleStep,
  //       2 * sliceAngleStep - Math.PI,
  //     ]),
  //     0.25,
  //     'white',
  //   ])
  //   spherePointsA.push([
  //     ...sphericalToCartesian([
  //       radiusA,
  //       2 * inclineAngleStep,
  //       0 * sliceAngleStep - Math.PI,
  //     ]),
  //     0.25,
  //     'white',
  //   ])
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
  zInclineAngle: number,
  xyPlaneAngle: number
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

// // probably wrong
// function cartesianToSpherical(
//   someCartesian: CartesianCoordinate
// ): SphericalCoordinate {
//   const radius = Math.sqrt(
//     someCartesian[0] * someCartesian[0] +
//       someCartesian[1] * someCartesian[1] +
//       someCartesian[2] * someCartesian[2]
//   )
//   return [
//     radius,
//     Math.atan2(someCartesian[1], someCartesian[0]),
//     Math.acos(someCartesian[2] / radius),
//   ]
// }

// function sphericalDistance(
//   sphericalA: SphericalCoordinate,
//   sphericalB: SphericalCoordinate
// ): number {
//   return cartesianDistance(
//     sphericalToCartesian(sphericalA),
//     sphericalToCartesian(sphericalB)
//   )
// }

// function cartesianDistance(
//   cartesianA: CartesianCoordinate,
//   cartesianB: CartesianCoordinate
// ): number {
//   const deltaX = cartesianB[0] - cartesianA[0]
//   const deltaY = cartesianB[1] - cartesianA[1]
//   const deltaZ = cartesianB[2] - cartesianA[2]
//   return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ)
// }

// function angleBetweenSpherical(
//   sphericalA: SphericalCoordinate,
//   sphericalB: SphericalCoordinate
// ): number {
//   const deltaTheta = sphericalB[1] - sphericalA[1]
//   const deltaPhi = sphericalB[2] - sphericalA[2]
//   return Math.sqrt(deltaTheta * deltaTheta + deltaPhi * deltaPhi)
// }
