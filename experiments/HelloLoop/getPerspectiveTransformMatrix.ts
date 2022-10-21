import Matrix from "ml-matrix";

export interface GetPerspectiveTransformMatrixApi {
  aspectRatio: number;
  verticalFieldOfViewAngle: number;
}

export function getPerspectiveTransformMatrix(
  api: GetPerspectiveTransformMatrixApi
) {
  const { verticalFieldOfViewAngle, aspectRatio } = api;
  const verticalFieldOfViewScalar = 1 / Math.tan(verticalFieldOfViewAngle / 2);
  const depthFar = 3.25;
  const depthNear = 0.75;
  const perspectiveTransformMatrix = Matrix.zeros(6, 6)
    .set(0, 0, verticalFieldOfViewScalar / aspectRatio)
    .set(1, 1, verticalFieldOfViewScalar)
    .set(2, 2, -((depthFar + depthNear) / (depthNear - depthFar)))
    .set(2, 3, -((2 * depthFar * depthNear) / (depthNear - depthFar)))
    .set(3, 2, -1)
    .set(5, 5, 1)
    .set(
      4,
      4,
      verticalFieldOfViewScalar // will somewhat break if aspect ratio isnt one
    );
  return { perspectiveTransformMatrix };
}
