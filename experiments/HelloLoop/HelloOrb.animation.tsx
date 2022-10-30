import { AnimationModule } from "clumsy-graphics";
import {
  getLoopCosine,
  getLoopPendulum,
  getLoopPoint,
  getLoopSine,
  getPrimeContainer,
  LoopStructure,
} from "clumsy-math";
import getColormap from "colormap";
import React from "react";
import { CellGraphic, WorldCellPoint } from "./CellGraphic";

const HelloOrbAnimationModule: AnimationModule = {
  moduleName: "Hello-Orb",
  getFrameDescription: getOrbFrameDescription,
  frameCount: getPrimeContainer(4),
  frameSize: {
    width: 1080,
    height: 1080,
  },
  animationSettings: {
    frameRate: 15,
    constantRateFactor: 1,
  },
};

export default HelloOrbAnimationModule;

interface GetOrbFrameDescriptionApi {
  frameCount: number;
  frameIndex: number;
}

async function getOrbFrameDescription(api: GetOrbFrameDescriptionApi) {
  const { frameCount, frameIndex } = api;
  const frameStamp = frameIndex / frameCount;
  const layerCount = frameCount;
  const pointCount = 1024;
  const orbColormap = getColormap({
    nshades: layerCount,
    colormap: "warm",
    format: "hex",
    alpha: 1,
  });
  const baseLoopStructure: LoopStructure = {
    structureType: "initial",
    loopBase: {
      radius: 1,
      center: [0, 0],
    },
    loopRotation: 0,
    subStructure: {
      structureType: "terminal",
      relativeSubRadius: 0.8,
      relativeSubDepth: 1,
      subPhase: 2 * Math.PI * frameStamp + Math.PI / 2,
      subOrientation: 0,
    },
  };
  const rotationPoint = getLoopPoint({
    inputAngle: 2 * Math.PI * 0.125,
    someLoopStructure: baseLoopStructure,
  });
  const rotationX = getLoopCosine({
    someLoopPoint: rotationPoint,
  });
  const rotationY = getLoopSine({
    someLoopPoint: rotationPoint,
  });
  const rotationZ = getLoopPendulum({
    someLoopPoint: rotationPoint,
  });
  const rotationMagnitude = Math.sqrt(
    rotationX * rotationX + rotationY * rotationY + rotationZ * rotationZ
  );
  const unitRotationX = rotationX / rotationMagnitude;
  const unitRotationY = rotationY / rotationMagnitude;
  const unitRotationZ = rotationZ / rotationMagnitude;
  const rotationAmount = 2 * Math.PI * frameStamp;
  const rotationCos = Math.cos(rotationAmount);
  const rotationSin = Math.sin(rotationAmount);
  const rotationX0 =
    rotationCos + unitRotationX * unitRotationX * (1 - rotationCos);
  const rotationX1 =
    unitRotationX * unitRotationY * (1 - rotationCos) -
    unitRotationZ * rotationSin;
  const rotationX2 =
    unitRotationX * unitRotationZ * (1 - rotationCos) +
    unitRotationY * rotationSin;
  const rotationY0 =
    unitRotationX * unitRotationY * (1 - rotationCos) +
    unitRotationZ * rotationSin;
  const rotationY1 =
    rotationCos + unitRotationY * unitRotationY * (1 - rotationCos);
  const rotationY2 =
    unitRotationY * unitRotationZ * (1 - rotationCos) -
    unitRotationX * rotationSin;
  const rotationZ0 =
    unitRotationX * unitRotationZ * (1 - rotationCos) -
    unitRotationY * rotationSin;
  const rotationZ1 =
    unitRotationY * unitRotationZ * (1 - rotationCos) +
    unitRotationX * rotationSin;
  const rotationZ2 =
    rotationCos + unitRotationZ * unitRotationZ * (1 - rotationCos);
  const orbPoints: Array<WorldCellPoint> = [];
  for (let layerIndex = 0; layerIndex < layerCount; layerIndex++) {
    const layerStamp = layerIndex / layerCount;
    for (let pointIndex = 0; pointIndex < pointCount; pointIndex++) {
      const pointStamp = pointIndex / pointCount;
      const polarAngle = 2 * Math.PI * pointStamp;
      const zenithAngle = Math.PI * layerStamp;
      const polarPoint = getLoopPoint({
        inputAngle: polarAngle,
        someLoopStructure: baseLoopStructure,
      });
      const zenithPoint = getLoopPoint({
        inputAngle: zenithAngle,
        someLoopStructure: baseLoopStructure,
      });
      const pointRadius = 1;
      const baseX =
        pointRadius *
        getLoopCosine({
          someLoopPoint: polarPoint,
        }) *
        getLoopSine({
          someLoopPoint: zenithPoint,
        });
      const baseY =
        pointRadius *
        getLoopSine({
          someLoopPoint: polarPoint,
        }) *
        getLoopSine({
          someLoopPoint: zenithPoint,
        });
      const baseZ =
        pointRadius *
        getLoopCosine({
          someLoopPoint: zenithPoint,
        });
      const rotatedX =
        rotationX0 * baseX + rotationX1 * baseY + rotationX2 * baseZ;
      const rotatedY =
        rotationY0 * baseX + rotationY1 * baseY + rotationY2 * baseZ;
      const rotatedZ =
        rotationZ0 * baseX + rotationZ1 * baseY + rotationZ2 * baseZ;
      orbPoints.push([
        rotatedX,
        rotatedY,
        rotatedZ,
        0.02,
        orbColormap[layerIndex],
      ]);
    }
  }
  return (
    <CellGraphic
      cameraDepth={-2}
      lightDepth={5}
      perspectiveDepthFar={100}
      perspectiveDepthNear={0.1}
      perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
      worldCellPoints={orbPoints}
    />
  );
}
