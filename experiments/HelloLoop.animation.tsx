import { AnimationModule } from "clumsy-graphics";
import Matrix from "ml-matrix";
import React, { ReactNode } from "react";
import Color from "color";

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
  const { modelSpherePoints } = getModelSpherePoints();
  const rotationAngle = ((2 * Math.PI) / frameCount) * frameIndex;
  const worldTransformMatrix = Matrix.eye(5, 5)
    .set(1, 1, Math.cos(rotationAngle))
    .set(1, 2, -Math.sin(rotationAngle))
    .set(2, 1, Math.sin(rotationAngle))
    .set(2, 2, Math.cos(rotationAngle));
  const cameraTransformMatrix = Matrix.eye(5, 5).set(2, 3, -1.5);
  const { perspectiveTransformMatrix } = getPerspectiveTransformMatrix();
  const targetTransformMatrix = perspectiveTransformMatrix
    .mmul(cameraTransformMatrix)
    .mmul(worldTransformMatrix);
  const targetSpherePoints = modelSpherePoints.map((someModelSpherePoint) =>
    targetTransformMatrix
      .mmul(Matrix.columnVector(someModelSpherePoint))
      .to1DArray()
  );
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
              fill={new Color("yellow").lighten(someTargetSpherePoint[2] / 4)}
            />
          );
        })}
    </Graphic>
  );
}

type SpherePoint = [
  x: number,
  y: number,
  z: number,
  w: number,
  rectSize: number
];

function getModelSpherePoints(): { modelSpherePoints: Array<SpherePoint> } {
  const modelSpherePoints: Array<SpherePoint> = [];
  const sliceCount = 48;
  const sliceStep = Math.PI / (sliceCount - 1);
  const slicePointCount = 48;
  const slicePointStep = (2 * Math.PI) / slicePointCount;
  for (let sliceIndex = 0; sliceIndex < sliceCount; sliceIndex++) {
    const sliceDepth = Math.cos(sliceIndex * sliceStep);
    const sliceRadius = Math.sin(sliceIndex * sliceStep);
    for (
      let slicePointIndex = 0;
      slicePointIndex < slicePointCount;
      slicePointIndex++
    ) {
      modelSpherePoints.push([
        sliceRadius * Math.cos(slicePointIndex * slicePointStep),
        sliceRadius * Math.sin(slicePointIndex * slicePointStep),
        sliceDepth,
        1,
        0.02,
      ]);
    }
  }
  // modelSpherePoints.push([0, 1, 0, 1, 0.05]);
  return { modelSpherePoints };
}

function getPerspectiveTransformMatrix() {
  const aspectRatio = 1;
  const verticalFieldOfViewAngle = (1.75 / 3) * Math.PI;
  // const verticalFieldOfViewAngle = (1 / 2) * Math.PI;
  const verticalFieldOfViewScalar = 1 / Math.tan(verticalFieldOfViewAngle / 2);
  const depthFar = 3.25;
  const depthNear = 0.75;
  // const depthNormalizationScalar = depthFar / (depthFar - depthNear);
  // const depthNormalizationThing = -1 * depthNormalizationScalar * depthNear;
  const perspectiveTransformMatrix = Matrix.zeros(5, 5)
    .set(0, 0, verticalFieldOfViewScalar / aspectRatio)
    .set(1, 1, verticalFieldOfViewScalar)
    .set(2, 2, -((depthFar + depthNear) / (depthNear - depthFar)))
    .set(2, 3, -((2 * depthFar * depthNear) / (depthNear - depthFar)))
    .set(3, 2, -1)
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
