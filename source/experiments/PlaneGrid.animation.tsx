import { AnimationModule } from "clumsy-graphics";
import React from "react";
import { CellGraphic } from "../library/CellGraphic";

const PlaneGridAnimationModule: AnimationModule = {
  moduleName: "Plane-Grid",
  getFrameDescription: getPlaneGridFrameDescription,
  frameCount: 24,
  frameSize: {
    width: 1024,
    height: 1024,
  },
  animationSettings: {
    frameRate: 10,
    constantRateFactor: 1,
  },
};

export default PlaneGridAnimationModule;

interface GetPlaneGridFrameDescriptionApi {
  frameCount: number;
  frameIndex: number;
}

async function getPlaneGridFrameDescription(
  api: GetPlaneGridFrameDescriptionApi
) {
  const { frameCount, frameIndex } = api;
  return (
    <CellGraphic
      cameraDepth={-5}
      lightDepth={30}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      worldCellPoints={[]}
    />
  );
}
