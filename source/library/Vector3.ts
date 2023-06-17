export type Vector3 = [number, number, number]

export function crossProduct(vectorA: Vector3, vectorB: Vector3): Vector3 {
  return [
    vectorA[1] * vectorB[2] - vectorA[2] * vectorB[1],
    vectorA[2] * vectorB[0] - vectorA[0] * vectorB[2],
    vectorA[0] * vectorB[1] - vectorA[1] * vectorB[0],
  ]
}

export function dotProduct(vectorA: Vector3, vectorB: Vector3): number {
  return (
    vectorA[0] * vectorB[0] + vectorA[1] * vectorB[1] + vectorA[2] * vectorB[2]
  )
}

export function vectorMagnitude(someVector: Vector3): number {
  return Math.sqrt(
    someVector[0] * someVector[0] +
      someVector[1] * someVector[1] +
      someVector[2] * someVector[2]
  )
}

export function normalizedVector(someVector: Vector3): Vector3 {
  const magnitudeA = vectorMagnitude(someVector)
  return [
    someVector[0] / magnitudeA,
    someVector[1] / magnitudeA,
    someVector[2] / magnitudeA,
  ]
}

export function scaledVector(
  someVector: Vector3,
  vectorScalar: number
): Vector3 {
  return [
    vectorScalar * someVector[0],
    vectorScalar * someVector[1],
    vectorScalar * someVector[2],
  ]
}

export function rotatedVector(
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
