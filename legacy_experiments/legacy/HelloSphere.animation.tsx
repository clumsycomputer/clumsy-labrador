// import { AnimationModule } from "clumsy-graphics";
// import {
//   AlignedRhythmStructure,
//   getRhythmMap,
//   _getRhythmGroupMembers,
//   _getRhythmLineage,
//   _getRhythmSlotWeights,
// } from "clumsy-math";
// import getColormap from "colormap";
// import Matrix, { inverse } from "ml-matrix";
// import React from "react";

// const SphereAnimationModule: AnimationModule = {
//   moduleName: "Hello-Sphere",
//   frameCount: 128,
//   getFrameDescription: getSphereAnimationFrameDescription,
//   frameSize: {
//     width: 1024,
//     height: 1024,
//   },
//   animationSettings: {
//     frameRate: 9,
//     constantRateFactor: 1,
//   },
// };

// export default SphereAnimationModule;

// interface GetSphereAnimationFrameDescriptionApi {
//   frameCount: number;
//   frameIndex: number;
// }

// async function getSphereAnimationFrameDescription(
//   api: GetSphereAnimationFrameDescriptionApi
// ) {
//   const { frameCount, frameIndex } = api;
//   const sphereRhythmStructure: AlignedRhythmStructure = {
//     structureType: "initial",
//     rhythmResolution: frameCount,
//     subStructure: {
//       structureType: "interposed",
//       rhythmDensity: 61,
//       rhythmOrientation: 0,
//       subStructure: {
//         structureType: "interposed",
//         rhythmDensity: 29,
//         rhythmOrientation: 0,
//         subStructure: {
//           structureType: "terminal",
//           rhythmDensity: 17,
//           rhythmOrientation: 0,
//         },
//       },
//     },
//   };
//   const sphereRhythmMap = getRhythmMap(sphereRhythmStructure);
//   const rainbowColormap = getColormap({
//     nshades: frameCount,
//     colormap: "jet",
//     format: "hex",
//     alpha: 1,
//   });
//   const { sphereTransformMatrixA, sphereTransformMatrixB } =
//     getSphereTransformMatrix({
//       rotationAngle: ((2 * Math.PI) / frameCount) * frameIndex,
//     });
//   const sphereLayerCount = frameCount;
//   const layerRadiusAngleStep = Math.PI / (sphereLayerCount - 1);
//   const layerPointCount = frameCount;
//   const layerPointAngleStep = (2 * Math.PI) / layerPointCount;
//   const spherePoints: Array<Array<number>> = [];
//   sphereRhythmMap.rhythmPoints.map((someRhythmPoint) => {
//     const layerIndex =
//       (someRhythmPoint + frameIndex) % sphereRhythmMap.rhythmResolution;
//     const layerRhythmSlotWeights = _getRhythmSlotWeights({
//       someRhythmMaps: _getRhythmGroupMembers({
//         someRhythmGroupStructure: _getRhythmLineage({
//           someAlignedRhythmStructure: {
//             structureType: "initial",
//             rhythmResolution: frameCount,
//             subStructure: {
//               structureType: "interposed",
//               rhythmDensity: 61,
//               rhythmOrientation: layerIndex % 61,
//               subStructure: {
//                 structureType: "interposed",
//                 rhythmDensity: 29,
//                 rhythmOrientation: (layerIndex % 61) % 29,
//                 subStructure: {
//                   structureType: "terminal",
//                   rhythmDensity: 17,
//                   rhythmOrientation: ((layerIndex % 61) % 29) % 17,
//                 },
//               },
//             },
//           },
//         })[2],
//       }).map(getRhythmMap),
//     });
//     const layerRadius = 0.5 * Math.sin(layerRadiusAngleStep * layerIndex);
//     const layerDepth = 0.5 * Math.cos(layerRadiusAngleStep * layerIndex) + 0.75;
//     for (
//       let layerPointIndex = 0;
//       layerPointIndex < layerPointCount;
//       layerPointIndex++
//     ) {
//       const pointRadius = layerRhythmSlotWeights[layerPointIndex]! / 17;
//       const layerPointAngle = layerPointAngleStep * layerPointIndex;
//       spherePoints.push(
//         sphereTransformMatrixA
//           .mmul(
//             Matrix.columnVector([
//               pointRadius *
//                 layerRadius *
//                 Math.cos(layerPointAngle + Math.PI / 2),
//               pointRadius *
//                 layerRadius *
//                 Math.sin(layerPointAngle + Math.PI / 2),
//               layerDepth,
//               1,
//               layerIndex,
//             ])
//           )
//           .to1DArray()
//       );
//       // spherePoints.push(
//       //   sphereTransformMatrixA
//       //     .mmul(
//       //       Matrix.columnVector([
//       //         pointRadius *
//       //           layerRadius *
//       //           Math.cos(2 * Math.PI - layerPointAngle + Math.PI / 2),
//       //         pointRadius *
//       //           layerRadius *
//       //           Math.sin(2 * Math.PI - layerPointAngle + Math.PI / 2),
//       //         layerDepth,
//       //         1,
//       //         layerIndex,
//       //       ])
//       //     )
//       //     .to1DArray()
//       // );
//       // spherePoints.push(
//       //   sphereTransformMatrixB
//       //     .mmul(
//       //       Matrix.columnVector([
//       //         pointRadius *
//       //           layerRadius *
//       //           Math.cos(layerPointAngle + Math.PI / 2),
//       //         pointRadius *
//       //           layerRadius *
//       //           Math.sin(layerPointAngle + Math.PI / 2),
//       //         layerDepth,
//       //         1,
//       //         layerIndex,
//       //       ])
//       //     )
//       //     .to1DArray()
//       // );
//       spherePoints.push(
//         sphereTransformMatrixB
//           .mmul(
//             Matrix.columnVector([
//               pointRadius *
//                 layerRadius *
//                 Math.cos(2 * Math.PI - layerPointAngle + Math.PI / 2),
//               pointRadius *
//                 layerRadius *
//                 Math.sin(2 * Math.PI - layerPointAngle + Math.PI / 2),
//               layerDepth,
//               1,
//               layerIndex,
//             ])
//           )
//           .to1DArray()
//       );
//     }
//   });
//   // const fieldOfViewAngle = (1.75 / 3) * Math.PI;
//   const fieldOfViewAngle = (1 / 2) * Math.PI;
//   const fieldOfViewScalar = 1 / Math.tan(fieldOfViewAngle / 2);
//   const depthFar = 1;
//   const depthNear = 0;
//   const depthNormalizationScalar = depthFar / (depthFar - depthNear);
//   const depthNormalizationThing = -1 * depthNormalizationScalar * depthNear;
//   return (
//     <svg viewBox={`-1.25 -1.25 2.5 2.5`}>
//       <rect x={-1.25} y={-1.25} width={2.5} height={2.5} fill={"black"} />
//       {spherePoints
//         .sort((a, b) => a[2] - b[2])
//         .map((someSpherePoint) => {
//           const cellLength = 0.02;
//           const adjustedCellLength =
//             (fieldOfViewScalar * cellLength) / someSpherePoint[2];
//           const halfAdjustedCellLength = adjustedCellLength / 2;
//           const adjustedX =
//             (fieldOfViewScalar * someSpherePoint[0]) / someSpherePoint[2];
//           const adjustedY =
//             (fieldOfViewScalar * someSpherePoint[1]) / someSpherePoint[2];
//           const adjustedZ =
//             (depthNormalizationScalar * someSpherePoint[2] +
//               depthNormalizationThing) /
//             someSpherePoint[2];
//           return (
//             <rect
//               x={adjustedX - halfAdjustedCellLength}
//               y={adjustedY - halfAdjustedCellLength}
//               width={adjustedCellLength}
//               height={adjustedCellLength}
//               fill={colorShade(
//                 rainbowColormap[(someSpherePoint[4] + frameIndex) % frameCount],
//                 1 * Math.floor((someSpherePoint[2] / adjustedZ) * 100)
//               )}
//             />
//           );
//         })}
//     </svg>
//   );
// }

// interface GetSphereTransformMatrixApi {
//   rotationAngle: number;
// }

// function getSphereTransformMatrix(api: GetSphereTransformMatrixApi) {
//   const { rotationAngle } = api;
//   const translatePointsToZ = Matrix.eye(5, 5).set(2, 3, -0.75);
//   const translatePointsFromZ = inverse(translatePointsToZ);
//   const rotatePointsOverX = Matrix.eye(5, 5)
//     .set(1, 1, Math.cos(rotationAngle))
//     .set(1, 2, -Math.sin(rotationAngle))
//     .set(2, 1, Math.sin(rotationAngle))
//     .set(2, 2, Math.cos(rotationAngle));
//   const rotatePointsOverY = Matrix.eye(5, 5)
//     .set(0, 0, Math.cos(rotationAngle))
//     .set(0, 2, -Math.sin(rotationAngle))
//     .set(2, 0, Math.sin(rotationAngle))
//     .set(2, 2, Math.cos(rotationAngle));
//   const rotatePointsOverZ = Matrix.eye(5, 5)
//     .set(0, 0, Math.cos(rotationAngle))
//     .set(0, 1, -Math.sin(rotationAngle))
//     .set(1, 0, Math.sin(rotationAngle))
//     .set(1, 1, Math.cos(rotationAngle));
//   const rotatePointsOverX_B = Matrix.eye(5, 5)
//     .set(1, 1, Math.cos(-rotationAngle))
//     .set(1, 2, -Math.sin(-rotationAngle))
//     .set(2, 1, Math.sin(-rotationAngle))
//     .set(2, 2, Math.cos(-rotationAngle));
//   const rotatePointsOverY_B = Matrix.eye(5, 5)
//     .set(0, 0, Math.cos(-rotationAngle))
//     .set(0, 2, -Math.sin(-rotationAngle))
//     .set(2, 0, Math.sin(-rotationAngle))
//     .set(2, 2, Math.cos(-rotationAngle));
//   const rotatePointsOverZ_B = Matrix.eye(5, 5)
//     .set(0, 0, Math.cos(-rotationAngle))
//     .set(0, 1, -Math.sin(-rotationAngle))
//     .set(1, 0, Math.sin(-rotationAngle))
//     .set(1, 1, Math.cos(-rotationAngle));
//   return {
//     sphereTransformMatrixA: translatePointsFromZ
//       .mmul(rotatePointsOverY)
//       .mmul(rotatePointsOverZ)
//       .mmul(rotatePointsOverX)
//       .mmul(translatePointsToZ),
//     sphereTransformMatrixB: translatePointsFromZ
//       .mmul(rotatePointsOverY_B)
//       .mmul(rotatePointsOverZ_B)
//       .mmul(rotatePointsOverX)
//       .mmul(translatePointsToZ),
//   };
// }

// // https://stackoverflow.com/a/62640342
// const colorShade = (col, amt) => {
//   col = col.replace(/^#/, "");
//   if (col.length === 3)
//     col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2];

//   let [r, g, b] = col.match(/.{2}/g);
//   [r, g, b] = [
//     parseInt(r, 16) + amt,
//     parseInt(g, 16) + amt,
//     parseInt(b, 16) + amt,
//   ];

//   r = Math.max(Math.min(255, r), 0).toString(16);
//   g = Math.max(Math.min(255, g), 0).toString(16);
//   b = Math.max(Math.min(255, b), 0).toString(16);

//   const rr = (r.length < 2 ? "0" : "") + r;
//   const gg = (g.length < 2 ? "0" : "") + g;
//   const bb = (b.length < 2 ? "0" : "") + b;

//   return `#${rr}${gg}${bb}`;
// };
