export function cos(wavePoint: WavePoint) {
  return wavePoint[0] - wavePoint[6]
}

export function sin(wavePoint: WavePoint) {
  return wavePoint[1] - wavePoint[7]
}

// function pen(wavePoint: WavePoint) {}

export function point(
  waveStructure: WaveStructure,
  inputAngle: number
): WavePoint {
  let subCircleDepth: number,
    subCircleX: number,
    subCircleY: number,
    subPointX: number,
    subPointY: number,
    originX: number,
    originY: number,
    terminalPointX: number,
    terminalPointY: number,
    basePointX: number,
    basePointY: number,
    deltaX: number,
    deltaY: number,
    squaredDeltaAdded: number,
    exprA: number,
    exprB: number,
    exprC: number,
    orientationCos: number,
    orientationSin: number,
    rotationCos: number,
    rotationSin: number,
    rotateDeltaX: number,
    rotateDeltaY: number = NaN
  const pointResult: WavePoint = [NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN]
  const lastLayerIndex = waveStructure.length - 1
  const inputCos = Math.cos(inputAngle)
  const inputSin = Math.sin(inputAngle)
  for (let layerIndex = lastLayerIndex; layerIndex > -1; --layerIndex) {
    subCircleDepth =
      waveStructure[layerIndex][1] * (1 - waveStructure[layerIndex][0])
    subCircleX = subCircleDepth * Math.cos(waveStructure[layerIndex][2])
    subCircleY = subCircleDepth * Math.sin(waveStructure[layerIndex][2])
    if (layerIndex === lastLayerIndex) {
      subPointX = waveStructure[layerIndex][0] * inputCos + subCircleX
      subPointY = waveStructure[layerIndex][0] * inputSin + subCircleY
      terminalPointX = subPointX
      terminalPointY = subPointY
      originX = subCircleX
      originY = subCircleY
    } else {
      subPointX = waveStructure[layerIndex][0] * pointResult[0] + subCircleX
      subPointY = waveStructure[layerIndex][0] * pointResult[1] + subCircleY
      terminalPointX =
        waveStructure[layerIndex][0] * pointResult[4] + subCircleX
      terminalPointY =
        waveStructure[layerIndex][0] * pointResult[5] + subCircleY
      originX = waveStructure[layerIndex][0] * pointResult[6] + subCircleX
      originY = waveStructure[layerIndex][0] * pointResult[7] + subCircleY
    }
    deltaX = originX - subPointX
    deltaY = originY - subPointY
    squaredDeltaAdded = deltaX * deltaX + deltaY * deltaY
    exprA =
      (originX * originX - originX * subPointX + originY * deltaY) /
      squaredDeltaAdded
    exprB = originY * subPointX - originX * subPointY
    exprC =
      Math.sqrt(1 - (exprB * exprB) / squaredDeltaAdded) /
      Math.sqrt(squaredDeltaAdded)
    basePointX = originX - deltaX * exprA - deltaX * exprC
    basePointY = originY - deltaY * exprA - deltaY * exprC
    orientationCos = Math.cos(waveStructure[layerIndex][3])
    orientationSin = Math.sin(waveStructure[layerIndex][3])
    pointResult[0] = basePointX * orientationCos - subPointY * orientationSin
    pointResult[1] = basePointX * orientationSin + subPointY * orientationCos
    pointResult[2] = basePointX * orientationCos - basePointY * orientationSin
    pointResult[3] = basePointX * orientationSin + basePointY * orientationCos
    pointResult[4] =
      terminalPointX * orientationCos - terminalPointY * orientationSin
    pointResult[5] =
      terminalPointX * orientationSin + terminalPointY * orientationCos
    pointResult[6] = originX * orientationCos - originY * orientationSin
    pointResult[7] = originX * orientationSin + originY * orientationCos
    rotationCos = Math.cos(waveStructure[layerIndex][4])
    rotationSin = Math.sin(waveStructure[layerIndex][4])
    rotateDeltaX = pointResult[0] - pointResult[6]
    rotateDeltaY = pointResult[1] - pointResult[7]
    pointResult[0] =
      rotateDeltaX * rotationCos - rotateDeltaY * rotationSin + pointResult[6]
    pointResult[1] =
      rotateDeltaX * rotationSin + rotateDeltaY * rotationCos + pointResult[7]
    rotateDeltaX = pointResult[2] - pointResult[6]
    rotateDeltaY = pointResult[3] - pointResult[7]
    pointResult[2] =
      rotateDeltaX * rotationCos - rotateDeltaY * rotationSin + pointResult[6]
    pointResult[3] =
      rotateDeltaX * rotationSin + rotateDeltaY * rotationCos + pointResult[7]
    rotateDeltaX = pointResult[4] - pointResult[6]
    rotateDeltaY = pointResult[5] - pointResult[7]
    pointResult[4] =
      rotateDeltaX * rotationCos - rotateDeltaY * rotationSin + pointResult[6]
    pointResult[5] =
      rotateDeltaX * rotationSin + rotateDeltaY * rotationCos + pointResult[7]
  }
  return pointResult
}

export const WAVE_ONE = 0.999999999999

export const WAVE_ZERO = 0.000000000001

export type WaveStructure = Array<WaveLayer>

export type WaveLayer = [
  relativeSubRadius: number,
  relativeSubDepth: number,
  subPhase: number,
  subOrientation: number,
  loopRotation: number
]

export type WavePoint = [
  x: number,
  y: number,
  baseX: number,
  baseY: number,
  terminalX: number,
  terminalY: number,
  originX: number,
  originY: number
]
