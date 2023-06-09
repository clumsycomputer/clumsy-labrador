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
