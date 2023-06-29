import { AnimationModule } from 'clumsy-graphics'
import { CellGraphic } from '../library/CellGraphic'
import React from 'react'

const animationFrameCount = 64 * 1
const animationFrameRate = 20
const clipStartFrameIndex = 64 * 0
const clipFinishFrameIndex = animationFrameCount
const clipFrameCount = clipFinishFrameIndex - clipStartFrameIndex

const LoopsoidAnimationModule: AnimationModule = {
  moduleName: 'Loopsoid',
  getFrameDescription: getLoopsoidFrameDescription,
  frameCount: clipFrameCount,
  frameSize: {
    width: 1024 * 1,
    height: 1024 * 1,
  },
  animationSettings: {
    frameRate: animationFrameRate,
    constantRateFactor: 1,
  },
}

export default LoopsoidAnimationModule

interface GetLoopsoidFrameDescriptionProps {
  frameCount: number
  frameIndex: number
}

async function getLoopsoidFrameDescription(
  props: GetLoopsoidFrameDescriptionProps
) {
  const rootFrameData = getFrameData({
    frameCount: animationFrameCount,
    frameIndex: clipStartFrameIndex + props.frameIndex,
  })
  const cameraDepth = -10
  return (
    <CellGraphic
      cameraDepth={cameraDepth}
      lightDepth={500}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      backgroundColor={'black'}
      worldCellPoints={[]}
    />
  )
}

interface GetFrameDataApi {
  frameCount: number
  frameIndex: number
}

function getFrameData(api: GetFrameDataApi) {
  const { frameCount, frameIndex } = api
  const frameStamp = frameIndex / frameCount
  return {
    frameCount,
    frameIndex,
    frameStamp,
    frameAngle: 2 * Math.PI * frameStamp,
  }
}
