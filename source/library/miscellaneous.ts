export function throwInvalidPathError(errorPath: string): never {
  throw new Error(`invalid path reached: ${errorPath}`)
}

export function normalizedAngle(someAngle: number) {
  return ((someAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
}
