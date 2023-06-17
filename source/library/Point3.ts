import { Vector3, dotProduct } from './Vector3'

export type Point3 = [x: number, y: number, z: number]

export function reflectedPoint(
  reflectionLine: [Point3, Point3],
  basePoint: Point3
): Point3 {
  const [lineStartPoint, lineEndPoint] = reflectionLine
  const reflectionDirection: Vector3 = [
    lineEndPoint[0] - lineStartPoint[0],
    lineEndPoint[1] - lineStartPoint[1],
    lineEndPoint[2] - lineStartPoint[2],
  ]
  const lineStartToPointDirection: Vector3 = [
    basePoint[0] - lineStartPoint[0],
    basePoint[1] - lineStartPoint[1],
    basePoint[2] - lineStartPoint[2],
  ]
  // a scalar value representing the ratio between the dot product
  // of reflectionDirection and lineStartToPointDirection
  // and the dot product of reflectionDirection with itself.
  // it helps to determine how much of reflectionDirection
  // should be added to lineStartPoint to get projectedBasePoint.
  const baseProjectionScalar =
    dotProduct(reflectionDirection, lineStartToPointDirection) /
    dotProduct(reflectionDirection, reflectionDirection)
  const projectedBasePoint: Point3 = [
    lineStartPoint[0] + baseProjectionScalar * reflectionDirection[0],
    lineStartPoint[1] + baseProjectionScalar * reflectionDirection[1],
    lineStartPoint[2] + baseProjectionScalar * reflectionDirection[2],
  ]
  return [
    2 * projectedBasePoint[0] - basePoint[0],
    2 * projectedBasePoint[1] - basePoint[1],
    2 * projectedBasePoint[2] - basePoint[2],
  ]
}

export type SphericalCoordinate = [
  radius: number,
  depthPlaneAngle: number,
  slicePlaneAngle: number
]

export type PlaneComponentFunction = (someAngle: number) => number

export function sphericalToCartesian(
  depthCosine: PlaneComponentFunction,
  depthSine: PlaneComponentFunction,
  sliceCosine: PlaneComponentFunction,
  sliceSine: PlaneComponentFunction,
  someSpherical: SphericalCoordinate
): Point3 {
  const currentDepthSine = depthSine(someSpherical[1])
  return [
    someSpherical[0] * currentDepthSine * sliceCosine(someSpherical[2]),
    someSpherical[0] * currentDepthSine * sliceSine(someSpherical[2]),
    someSpherical[0] * depthCosine(someSpherical[1]),
  ]}
