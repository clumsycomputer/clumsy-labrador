export type Vector3 = [number, number, number]

export function getCrossProduct(vectorA: Vector3, vectorB: Vector3): Vector3 {
  return [
    vectorA[1] * vectorB[2] - vectorA[2] * vectorB[1],
    vectorA[2] * vectorB[0] - vectorA[0] * vectorB[2],
    vectorA[0] * vectorB[1] - vectorA[1] * vectorB[0],
  ]
}

export function getDotProduct(vectorA: Vector3, vectorB: Vector3): number {
  return (
    vectorA[0] * vectorB[0] + vectorA[1] * vectorB[1] + vectorA[2] * vectorB[2]
  )
}

export function getVectorMagnitude(someVector: Vector3): number {
  return Math.sqrt(
    someVector[0] * someVector[0] +
      someVector[1] * someVector[1] +
      someVector[2] * someVector[2]
  )
}

export function getNormalizedVector(someVector: Vector3): Vector3 {
  const vectorMagnitude = getVectorMagnitude(someVector)
  return [
    someVector[0] / vectorMagnitude,
    someVector[1] / vectorMagnitude,
    someVector[2] / vectorMagnitude,
  ]
}
