import { Vector3, getDotProduct } from './Vector3'

export type Point3 = [number, number, number]

export function getReflectedPoint(
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
    getDotProduct(reflectionDirection, lineStartToPointDirection) /
    getDotProduct(reflectionDirection, reflectionDirection)

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
