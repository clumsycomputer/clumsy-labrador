import { AnimationModule } from "clumsy-graphics";
import React from "react";
import { CellGraphic } from "./CellGraphic";

const HelloLoopAnimationModule: AnimationModule = {
  moduleName: "Hello-Loop",
  getFrameDescription: getLoopFrameDescription,
  frameCount: 32,
  frameSize: {
    width: 1024,
    height: 1024,
  },
  animationSettings: {
    frameRate: 9,
    constantRateFactor: 1,
  },
};

export default HelloLoopAnimationModule;

interface GetLoopFrameDescriptionApi {
  frameCount: number;
  frameIndex: number;
}

async function getLoopFrameDescription(api: GetLoopFrameDescriptionApi) {
  const { frameCount, frameIndex } = api;
  const frameStamp = frameIndex / frameCount;
  return (
    <CellGraphic
      cameraDepth={-0.5}
      lightDepth={10}
      perspectiveDepthFar={3}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      worldCellPoints={[[0, 0, 0, 0.05, "yellow"]]}
    />
  );
}
