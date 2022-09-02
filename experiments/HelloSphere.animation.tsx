import React from "react";
import { AnimationModule } from "clumsy-graphics";
import getColormap from "colormap";
import { mat, vec } from "@josh-brown/vector";

const SphereAnimationModule: AnimationModule = {
  moduleName: "Hello-Sphere",
  frameCount: 48,
  getFrameDescription: getSphereAnimationFrameDescription,
  frameSize: {
    width: 1024,
    height: 1024,
  },
  animationSettings: {
    frameRate: 9,
    constantRateFactor: 1,
  },
};

export default SphereAnimationModule;

interface GetSphereAnimationFrameDescriptionApi {
  frameCount: number;
  frameIndex: number;
}

async function getSphereAnimationFrameDescription(
  api: GetSphereAnimationFrameDescriptionApi
) {
  const { frameCount, frameIndex } = api;
  const rainbowColormap = getColormap({
    colormap: "rainbow-soft",
    nshades: frameCount,
    format: "hex",
    alpha: 1,
  });
  const { sphereTransformMatrix } = getSphereTransformMatrix({
    rotationAngle: ((2 * Math.PI) / frameCount) * frameIndex,
  });
  const sphereLayerCount = frameCount;
  const layerRadiusAngleStep = Math.PI / (sphereLayerCount - 1);
  const layerPointCount = frameCount;
  const layerPointAngleStep = (2 * Math.PI) / layerPointCount;
  const spherePoints: Array<Array<number>> = [];
  for (let layerIndex = 0; layerIndex < sphereLayerCount; layerIndex++) {
    const layerRadius = 0.5 * Math.sin(layerRadiusAngleStep * layerIndex);
    const layerDepth = 0.5 * Math.cos(layerRadiusAngleStep * layerIndex) + 0.75;
    for (
      let layerPointIndex = 0;
      layerPointIndex < layerPointCount;
      layerPointIndex++
    ) {
      const layerPointAngle = layerPointAngleStep * layerPointIndex;
      spherePoints.push(
        sphereTransformMatrix
          .apply(
            vec([
              layerRadius * Math.cos(layerPointAngle),
              layerRadius * Math.sin(layerPointAngle),
              layerDepth,
              1,
              layerIndex,
            ])
          )
          .toArray()
      );
    }
  }
  const fieldOfViewAngle = (1.75 / 3) * Math.PI;
  const fieldOfViewScalar = 1 / Math.tan(fieldOfViewAngle / 2);
  const depthFar = 1;
  const depthNear = 0;
  const depthNormalizationScalar = depthFar / (depthFar - depthNear);
  const depthNormalizationThing = -1 * depthNormalizationScalar * depthNear;
  return (
    <svg viewBox={`-1.25 -1.25 2.5 2.5`}>
      <rect x={-1.25} y={-1.25} width={2.5} height={2.5} fill={"black"} />
      {spherePoints
        .sort((a, b) => b[2] - a[2])
        .map((someSpherePoint) => {
          const cellLength = 0.02;
          const adjustedCellLength =
            (fieldOfViewScalar * cellLength) / someSpherePoint[2];
          const halfAdjustedCellLength = adjustedCellLength / 2;
          const adjustedX =
            (fieldOfViewScalar * someSpherePoint[0]) / someSpherePoint[2];
          const adjustedY =
            (fieldOfViewScalar * someSpherePoint[1]) / someSpherePoint[2];
          const adjustedZ =
            (depthNormalizationScalar * someSpherePoint[2] +
              depthNormalizationThing) /
            someSpherePoint[2];
          return (
            <rect
              x={adjustedX - halfAdjustedCellLength}
              y={adjustedY - halfAdjustedCellLength}
              width={adjustedCellLength}
              height={adjustedCellLength}
              fill={colorShade(
                rainbowColormap[(someSpherePoint[4] + frameIndex) % frameCount],
                -1 * Math.floor((someSpherePoint[2] / adjustedZ) * 100)
              )}
            />
          );
        })}
    </svg>
  );
}

interface GetSphereTransformMatrixApi {
  rotationAngle: number;
}

function getSphereTransformMatrix(api: GetSphereTransformMatrixApi) {
  const { rotationAngle } = api;
  const translatePointsToZ = mat([
    [1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 0, 1, -0.75, 0],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 0, 1],
  ]);
  const rotatePointsOverX = mat([
    [1, 0, 0, 0, 0],
    [0, Math.cos(rotationAngle), -Math.sin(rotationAngle), 0, 0],
    [0, Math.sin(rotationAngle), Math.cos(rotationAngle), 0, 0],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 0, 1],
  ]);
  const rotatePointsOverY = mat([
    [Math.cos(rotationAngle), 0, -Math.sin(rotationAngle), 0, 0],
    [0, 1, 0, 0, 0],
    [Math.sin(rotationAngle), 0, Math.cos(rotationAngle), 0, 0],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 0, 1],
  ]);
  const rotatePointsOverZ = mat([
    [Math.cos(rotationAngle), -Math.sin(rotationAngle), 0, 0, 0],
    [Math.sin(rotationAngle), Math.cos(rotationAngle), 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 0, 1],
  ]);
  const translatePointsFromZ = mat([
    [1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 0, 1, 0.75, 0],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 0, 1],
  ]);
  return {
    sphereTransformMatrix: translatePointsFromZ
      .multiply(rotatePointsOverY)
      .multiply(rotatePointsOverZ)
      .multiply(rotatePointsOverX)
      .multiply(translatePointsToZ),
  };
}

// https://stackoverflow.com/a/62640342
const colorShade = (col, amt) => {
  col = col.replace(/^#/, "");
  if (col.length === 3)
    col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2];

  let [r, g, b] = col.match(/.{2}/g);
  [r, g, b] = [
    parseInt(r, 16) + amt,
    parseInt(g, 16) + amt,
    parseInt(b, 16) + amt,
  ];

  r = Math.max(Math.min(255, r), 0).toString(16);
  g = Math.max(Math.min(255, g), 0).toString(16);
  b = Math.max(Math.min(255, b), 0).toString(16);

  const rr = (r.length < 2 ? "0" : "") + r;
  const gg = (g.length < 2 ? "0" : "") + g;
  const bb = (b.length < 2 ? "0" : "") + b;

  return `#${rr}${gg}${bb}`;
};
