import { AnimationModule } from "clumsy-graphics";
import {
  getLoopCosine,
  getLoopPendulum,
  getLoopPoint,
  getLoopSine,
} from "clumsy-math";
import Color from "color";
import Matrix from "ml-matrix";
import React, { ReactNode } from "react";
import getColormap from "colormap";

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
  const loopsoidLayerCount = 13;
  const { modelLoopsoidPoints } = getModelLoopsoidPoints({
    frameStamp,
    layerCount: loopsoidLayerCount,
  });
  const rotationAngle = 2 * Math.PI * frameStamp;
  const worldTransformMatrix = Matrix.eye(6, 6)
    .set(1, 1, Math.cos(rotationAngle))
    .set(1, 2, -Math.sin(rotationAngle))
    .set(2, 1, Math.sin(rotationAngle))
    .set(2, 2, Math.cos(rotationAngle))
    .set(2, 3, -0.25);
  const cameraTransformMatrix = Matrix.eye(6, 6).set(2, 3, -1.5);
  const { perspectiveTransformMatrix } = getPerspectiveTransformMatrix();
  const targetTransformMatrix = perspectiveTransformMatrix
    .mmul(cameraTransformMatrix)
    .mmul(worldTransformMatrix);
  const targetSpherePoints = modelLoopsoidPoints.map((someModelSpherePoint) =>
    targetTransformMatrix
      .mmul(Matrix.columnVector(someModelSpherePoint))
      .to1DArray()
  );
  const rainbowColormap = getColormap({
    nshades: loopsoidLayerCount,
    colormap: "warm",
    format: "hex",
    alpha: 1,
  });
  return (
    <Graphic
      graphicRectangle={{
        x: -1.25,
        y: -1.25,
        width: 2.5,
        height: 2.5,
      }}
    >
      {targetSpherePoints
        .sort((a, b) => a[2] - b[2])
        .map((someTargetSpherePoint) => {
          const graphicRectSize =
            someTargetSpherePoint[4] / someTargetSpherePoint[3];
          const halfGraphicRectSize = graphicRectSize / 2;
          return (
            <rect
              x={
                someTargetSpherePoint[0] / someTargetSpherePoint[3] -
                halfGraphicRectSize
              }
              y={
                someTargetSpherePoint[1] / someTargetSpherePoint[3] -
                halfGraphicRectSize
              }
              width={graphicRectSize}
              height={graphicRectSize}
              fill={new Color(
                rainbowColormap[someTargetSpherePoint[5]]
              ).lighten(someTargetSpherePoint[2] / 4)}
            />
          );
        })}
    </Graphic>
  );
}

type LoopsoidPoint = [
  x: number,
  y: number,
  z: number,
  w: number,
  rectSize: number,
  layerIndex: number
];

interface GetModelLoopsoidPointsApi {
  frameStamp: number;
  layerCount: number;
}

function getModelLoopsoidPoints(api: GetModelLoopsoidPointsApi) {
  const { layerCount, frameStamp } = api;
  const modelLoopsoidPoints: Array<LoopsoidPoint> = [];
  const layerAngleStep = (2 * Math.PI) / layerCount;
  const layerPointCount = 1024;
  const layerPointAngleStep = (2 * Math.PI) / layerPointCount;
  for (let layerIndex = 1; layerIndex < layerCount; layerIndex++) {
    const layerAngle = layerIndex * layerAngleStep;
    const layerDepth = getLoopCosine({
      someLoopPoint: getLoopPoint({
        inputAngle: layerAngle,
        someLoopStructure: {
          structureType: "initial",
          loopBase: {
            radius: 1,
            center: [0, 0],
          },
          loopRotation: 0,
          subStructure: {
            structureType: "terminal",
            relativeSubRadius: 1,
            relativeSubDepth: 0,
            subPhase: 0,
            subOrientation: 0,
          },
        },
      }),
    });
    const layerRadius = getLoopSine({
      someLoopPoint: getLoopPoint({
        inputAngle: layerAngle,
        someLoopStructure: {
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
            subPhase: 2 * Math.PI * frameStamp + Math.PI / 4,
            subOrientation: layerAngle,
            // subOrientation: 2 * Math.PI * frameStamp + Math.PI / 4,
          },
        },
      }),
    });
    for (
      let layerPointIndex = 0;
      layerPointIndex < layerPointCount;
      layerPointIndex++
    ) {
      const pointAngle =
        layerPointIndex * layerPointAngleStep + Math.PI * frameStamp;
      const loopsoidX = getLoopCosine({
        someLoopPoint: getLoopPoint({
          inputAngle: pointAngle,
          someLoopStructure: {
            structureType: "initial",
            loopBase: {
              radius: layerRadius,
              center: [0, 0],
            },
            loopRotation: 0,
            subStructure: {
              structureType: "terminal",
              relativeSubRadius: 0.9,
              relativeSubDepth: 1,
              subPhase: 4 * 2 * Math.PI * frameStamp + Math.PI / 3,
              subOrientation: layerAngle,
              // subOrientation: 2 * Math.PI * frameStamp + Math.PI / 3,
            },
          },
        }),
      });
      const loopsoidY = getLoopSine({
        someLoopPoint: getLoopPoint({
          inputAngle: pointAngle,
          someLoopStructure: {
            structureType: "initial",
            loopBase: {
              radius: layerRadius,
              center: [0, 0],
            },
            loopRotation: 0,
            subStructure: {
              structureType: "terminal",
              relativeSubRadius: 0.8,
              relativeSubDepth: 1,
              subPhase: 4 * 2 * Math.PI * frameStamp + Math.PI / 4,
              subOrientation: 0,
              // subOrientation: 2 * Math.PI * frameStamp + Math.PI / 4,
            },
          },
        }),
      });
      const loopsoidZ = getLoopPendulum({
        someLoopPoint: getLoopPoint({
          inputAngle: pointAngle,
          someLoopStructure: {
            structureType: "initial",
            loopBase: {
              radius: layerRadius,
              center: [0, 0],
            },
            loopRotation: 0,
            subStructure: {
              structureType: "terminal",
              relativeSubRadius: 0.7,
              relativeSubDepth: 1,
              subPhase: 4 * 2 * Math.PI * frameStamp + Math.PI / 5,
              subOrientation: 0,
            },
          },
        }),
      });
      modelLoopsoidPoints.push([
        loopsoidX,
        loopsoidY,
        loopsoidZ + layerDepth,
        1,
        0.05,
        layerIndex,
      ]);
    }
  }
  return { modelLoopsoidPoints };
}

function getPerspectiveTransformMatrix() {
  const aspectRatio = 1;
  const verticalFieldOfViewAngle = (1.75 / 3) * Math.PI;
  // const verticalFieldOfViewAngle = (1 / 2) * Math.PI;
  const verticalFieldOfViewScalar = 1 / Math.tan(verticalFieldOfViewAngle / 2);
  const depthFar = 3.25;
  const depthNear = 0.75;
  const perspectiveTransformMatrix = Matrix.zeros(6, 6)
    .set(0, 0, verticalFieldOfViewScalar / aspectRatio)
    .set(1, 1, verticalFieldOfViewScalar)
    .set(2, 2, -((depthFar + depthNear) / (depthNear - depthFar)))
    .set(2, 3, -((2 * depthFar * depthNear) / (depthNear - depthFar)))
    .set(3, 2, -1)
    .set(
      5,
      5,
      1 // will break if aspect ratio isnt one
    )
    .set(
      4,
      4,
      verticalFieldOfViewScalar // will break if aspect ratio isnt one
    );
  return { perspectiveTransformMatrix };
}

interface GraphicProps {
  graphicRectangle: Rectangle;
  children: ReactNode;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

function Graphic(props: GraphicProps) {
  const { graphicRectangle, children } = props;
  return (
    <svg
      viewBox={`${graphicRectangle.x} ${graphicRectangle.y} ${graphicRectangle.width} ${graphicRectangle.height}`}
    >
      <g transform="scale(1,-1)">
        <rect
          x={graphicRectangle.x}
          y={graphicRectangle.y}
          width={graphicRectangle.width}
          height={graphicRectangle.height}
          fill={"black"}
        />
        {children}
      </g>
    </svg>
  );
}
