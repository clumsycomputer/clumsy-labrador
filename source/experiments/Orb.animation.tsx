import { AnimationModule } from 'clumsy-graphics'
import React from 'react'
import { CellGraphic, WorldCellPoint } from '../library/CellGraphic'
import { Vector3 } from '../library/Vector3'

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
  const depthResolution = 256
  const depthAngleStep = Math.PI / depthResolution
  const spherePoints: Array<WorldCellPoint> = []
  for (let i = 0; i < depthResolution; i++) {
    const basePointA = sphericalToCartesian(
      Math.cos,
      Math.sin,
      Math.cos,
      Math.sin,
      [
        5,
        i * depthAngleStep + 2 * Math.PI * frameStamp,
        2 *
          Math.PI *
          frameStamp *
          Math.sin(1 * ((2 * Math.PI) / depthResolution) * i) *
          (Math.PI / 4) *
          Math.sin(1 * ((2 * Math.PI) / depthResolution) * i) +
          // (Math.PI / 16) * Math.sin(2 * Math.PI * frameStamp) +
          Math.PI / 2,
      ]
    )
    spherePoints.push([...basePointA, 0.05, 'white'])
  }
  return (
    <CellGraphic
      cameraDepth={-10}
      lightDepth={100}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      worldCellPoints={[...spherePoints]}
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
  return [
    someSpherical[0] *
      depthSine(someSpherical[1]) *
      sliceCosine(someSpherical[2]),
    someSpherical[0] *
      depthSine(someSpherical[1]) *
      sliceSine(someSpherical[2]),
    someSpherical[0] * depthCosine(someSpherical[1]),
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

// const { frameIndex, frameCount } = api
// const frameStamp = frameIndex / frameCount
// const radiusA = 5
// // const depthResolution = frameCount
// // const polarResolution = frameCount
// const spherePointsA: Array<WorldCellPoint> = []

// const depthCosine: PlaneComponentFunction = (someInputAngle) =>
//   Wave.cos(
//     Wave.point(
//       [[0.9, Wave.WAVE_ONE, 3 * 2 * Math.PI * frameStamp, 0, 0]],
//       someInputAngle
//     )
//   )
// const depthSine: PlaneComponentFunction = (someInputAngle) =>
//   Wave.sin(
//     Wave.point(
//       [[0.9, Wave.WAVE_ONE, 3 * 2 * Math.PI * frameStamp, 0, 0]],
//       someInputAngle
//     )
//   )
// const depthRhythmMap = rhythmGroupMapsA[frameIndex]
// const depthAngleStep = Math.PI / (depthRhythmMap.rhythmResolution - 1)
// const polarResolution = depthRhythmMap.rhythmResolution
// const polarAngleStep = (2 * Math.PI) / polarResolution
// for (let _depthIndex of depthRhythmMap.rhythmPoints) {
//   const depthIndex =
//     (_depthIndex + frameIndex) % depthRhythmMap.rhythmResolution
//   const depthStamp = depthIndex / depthRhythmMap.rhythmResolution
//   const sliceCosine: PlaneComponentFunction = (someInputAngle) =>
//     Wave.cos(
//       Wave.point(
//         [
//           [
//             0.9,
//             Wave.WAVE_ONE,
//             3 * 2 * Math.PI * frameStamp + Math.PI * depthStamp,
//             0,
//             0,
//           ],
//         ],
//         someInputAngle + Math.PI * depthStamp
//       )
//     )
//   const sliceSine: PlaneComponentFunction = (someInputAngle) =>
//     Wave.sin(
//       Wave.point(
//         [[0.9, Wave.WAVE_ONE, 3 * 2 * Math.PI * frameStamp, 0, 0]],
//         someInputAngle + Math.PI * depthStamp
//       )
//     )
//   for (let polarIndex = 0; polarIndex < polarResolution; polarIndex++) {
//     const basePoint = sphericalToCartesian(
//       depthCosine,
//       depthSine,
//       sliceCosine,
//       sliceSine,
//       [radiusA, depthIndex * depthAngleStep, polarIndex * polarAngleStep]
//     )
//     const rotatedPoint = getRotatedCellVector(
//       // getNormalizedVector([1, 1, 0]),
//       getNormalizedVector([
//         depthSine(6 * 2 * Math.PI * frameStamp) *
//           depthCosine(0.75 * 2 * Math.PI * frameStamp),
//         depthSine(6 * 2 * Math.PI * frameStamp) *
//           depthSine(0.75 * 2 * Math.PI * frameStamp),
//         depthCosine(6 * 2 * Math.PI * frameStamp),
//       ]),
//       2 * Math.PI * frameStamp,
//       basePoint
//     )
//     spherePointsA.push([...rotatedPoint, 0.04, 'white'])
//   }
// }
// return (
//   <CellGraphic
//     cameraDepth={-10}
//     lightDepth={30}
//     perspectiveDepthFar={100}
//     perspectiveDepthNear={0.1}
//     perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
//     worldCellPoints={[...spherePointsA]}
//   />
// )
