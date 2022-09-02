import React from "react";
import { AnimationModule } from "clumsy-graphics";
import getColormap from "colormap";

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
  const rotationAngle = ((2 * Math.PI) / frameCount) * frameIndex;
  const fieldOfViewAngle = (1.75 / 3) * Math.PI;
  const fieldOfViewScalar = 1 / Math.tan(fieldOfViewAngle / 2);
  const depthFar = 1;
  const depthNear = 0;
  const depthNormalizationScalar = depthFar / (depthFar - depthNear);
  const depthNormalizationThing = -1 * depthNormalizationScalar * depthNear;
  const sphereLayerCount = 48;
  const layerRadiusAngleStep = Math.PI / (sphereLayerCount - 1);
  const layerPointCount = 48;
  const layerPointAngleStep = (2 * Math.PI) / layerPointCount;
  const spherePoints = new Array(sphereLayerCount)
    .fill(undefined)
    .map((_, layerIndex) => {
      const layerRadius = 0.5 * Math.sin(layerRadiusAngleStep * layerIndex);
      const layerDepth =
        0.5 * Math.cos(layerRadiusAngleStep * layerIndex) + 0.75;
      const layerColor = rainbowColormap[layerIndex];
      return (
        new Array(layerPointCount)
          .fill(undefined)
          .map((_, layerPointIndex) => {
            const layerPointAngle = layerPointAngleStep * layerPointIndex;
            return [
              layerRadius * Math.cos(layerPointAngle),
              layerRadius * Math.sin(layerPointAngle),
              layerDepth,
            ];
          })
          .map((somePoint) => {
            return [somePoint[0], somePoint[1], somePoint[2] - 0.75];
          })
          // .map((somePoint) => {
          //   return [
          //     somePoint[0],
          //     Math.cos(rotationAngle) * somePoint[1] +
          //       -1 * Math.sin(rotationAngle) * somePoint[2],
          //     Math.sin(rotationAngle) * somePoint[1] +
          //       Math.cos(rotationAngle) * somePoint[2],
          //   ];
          // })
          .map((somePoint) => {
            return [
              Math.cos(rotationAngle) * somePoint[0] +
                -1 * Math.sin(rotationAngle) * somePoint[2],
              somePoint[1],
              Math.sin(rotationAngle) * somePoint[0] +
                Math.cos(rotationAngle) * somePoint[2],
            ];
          })
          .map((somePoint) => {
            return [
              Math.cos(rotationAngle) * somePoint[0] +
                -1 * Math.sin(rotationAngle) * somePoint[1],
              Math.sin(rotationAngle) * somePoint[0] +
                Math.cos(rotationAngle) * somePoint[1],
              somePoint[2],
            ];
          })
          .map((somePoint) => {
            return [somePoint[0], somePoint[1], somePoint[2] + 0.75];
          })
          // .map((somePoint) => {
          //   return [somePoint[0], somePoint[1], somePoint[2] - 0.75];
          // })
          // .map((somePoint) => {
          //   return [
          //     somePoint[0],
          //     Math.cos(rotationAngle) * somePoint[1] +
          //       -1 * Math.sin(rotationAngle) * somePoint[2],
          //     Math.sin(rotationAngle) * somePoint[1] +
          //       Math.cos(rotationAngle) * somePoint[2],
          //   ];
          // })
          // .map((somePoint) => {
          //   return [somePoint[0], somePoint[1], somePoint[2] + 0.75];
          // })
          .map((someSpherePoint) => {
            const sphereCellLength = 0.02;
            const halfSphereCellLength = sphereCellLength / 2;
            const unadjustedCellDepth = someSpherePoint[2];
            return {
              cellColor: layerColor,
              unadjustedCellDepth,
              adjustedCellDepth:
                (depthNormalizationScalar * unadjustedCellDepth +
                  depthNormalizationThing) /
                unadjustedCellDepth,
              cellPoints: [
                [
                  someSpherePoint[0] - halfSphereCellLength,
                  someSpherePoint[1] - halfSphereCellLength,
                ],
                [
                  someSpherePoint[0] + halfSphereCellLength,
                  someSpherePoint[1] - halfSphereCellLength,
                ],
                [
                  someSpherePoint[0] + halfSphereCellLength,
                  someSpherePoint[1] + halfSphereCellLength,
                ],
                [
                  someSpherePoint[0] - halfSphereCellLength,
                  someSpherePoint[1] + halfSphereCellLength,
                ],
              ].map((somePoint) => {
                return [
                  (fieldOfViewScalar * somePoint[0]) / unadjustedCellDepth,
                  (fieldOfViewScalar * somePoint[1]) / unadjustedCellDepth,
                ];
              }),
            };
          })
      );
    })
    .flat()
    .sort((a, b) => b.unadjustedCellDepth - a.unadjustedCellDepth);
  return (
    <svg viewBox={`-1.25 -1.25 2.5 2.5`}>
      <rect x={-1.25} y={-1.25} width={2.5} height={2.5} fill={"black"} />
      {spherePoints.map((someSpherePointData) => {
        return (
          <polygon
            points={someSpherePointData.cellPoints
              .map((somePoint) => `${somePoint[0]},${somePoint[1]}`)
              .join(",")}
            fill={colorShade(
              someSpherePointData.cellColor,
              -1 *
                Math.floor(
                  (someSpherePointData.unadjustedCellDepth /
                    someSpherePointData.adjustedCellDepth) *
                    100
                )
            )}
          />
        );
      })}
    </svg>
  );
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
