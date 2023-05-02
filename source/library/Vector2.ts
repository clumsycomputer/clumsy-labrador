export type Vector2 = [number, number]

export function getVectorMagnitude(someVector: Vector2) {
  return Math.sqrt(
    someVector[0] * someVector[0] + someVector[1] * someVector[1]
  )
}
