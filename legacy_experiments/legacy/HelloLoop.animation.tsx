import { AnimationModule } from "clumsy-graphics";
import React from "react";

const LoopAnimationModule: AnimationModule = {
  moduleName: "Hello-Loop",
  frameCount: 48,
  getFrameDescription: getLoopAnimationFrameDescription,
  frameSize: {
    width: 512 * 2,
    height: 512 * 2,
  },
  animationSettings: {
    frameRate: 9,
    constantRateFactor: 1,
  },
};

export default LoopAnimationModule;

interface GetLoopAnimationFrameDescriptionApi {
  frameCount: number;
  frameIndex: number;
}

async function getLoopAnimationFrameDescription(
  props: GetLoopAnimationFrameDescriptionApi
) {
  const { frameIndex, frameCount } = props;
  const frameStamp = frameIndex / frameCount;
  const baseCircle = {
    radius: 1,
    center: {
      x: 0,
      y: 0,
    },
  };
  const relativeSubCircle = {
    radius: 1 - 0.5,
    depth: 0.5,
    phase: Math.PI / 3,
  };
  const subCircleRadius = relativeSubCircle.radius * baseCircle.radius;
  const maxSubCircleDepth = baseCircle.radius - subCircleRadius;
  const subCircleDepth = relativeSubCircle.depth * maxSubCircleDepth;
  const subCircle = {
    radius: subCircleRadius,
    center: {
      x:
        subCircleDepth * Math.cos(relativeSubCircle.phase) +
        baseCircle.center.x,
      y:
        subCircleDepth * Math.sin(relativeSubCircle.phase) +
        baseCircle.center.y,
    },
  };
  const baseSubCenterDistance = getDistanceBetweenPoints({
    pointA: baseCircle.center,
    pointB: subCircle.center,
  });
  const subBaseMinBasePoint = getCirclePoint({
    someCircle: baseCircle,
    pointAngle: relativeSubCircle.phase,
  });
  const subBaseMinSubPoint = getCirclePoint({
    someCircle: subCircle,
    pointAngle: relativeSubCircle.phase,
  });
  const subBaseMinDistance = getDistanceBetweenPoints({
    pointA: subBaseMinBasePoint,
    pointB: subBaseMinSubPoint,
  });
  const minIntersectionRadius = subBaseMinDistance + subCircle.radius;
  const subBaseMaxBasePoint = getCirclePoint({
    someCircle: baseCircle,
    pointAngle: relativeSubCircle.phase + Math.PI,
  });
  const subBaseMaxSubPoint = getCirclePoint({
    someCircle: subCircle,
    pointAngle: relativeSubCircle.phase + Math.PI,
  });
  const subBaseMaxDistance = getDistanceBetweenPoints({
    pointA: subBaseMaxBasePoint,
    pointB: subBaseMaxSubPoint,
  });
  const maxIntersectionRadius = subBaseMaxDistance + subCircle.radius;
  const intersectionRadiusMinMaxDelta =
    maxIntersectionRadius - minIntersectionRadius;
  const intersectionCircleCount = 512;
  const loopPoints = new Array(intersectionCircleCount - 2)
    .fill(null)
    .reduce<Array<any>>(
      (loopPointsResult, _, circleIndex) => {
        const intersectionCircle = getIntersectionCircle({
          minIntersectionRadius,
          intersectionRadiusMinMaxDelta,
          subCircleCenter: subCircle.center,
          relativeIntersectionRadius: Math.sin(
            (Math.PI / 2) * ((circleIndex + 1) / intersectionCircleCount)
          ),
        });
        const intersectionBaseAngle = getIntersectionBaseAngle({
          baseSubCenterDistance,
          baseCircleRadius: baseCircle.radius,
          intersectionCircleRadius: intersectionCircle.radius,
        });
        const loopPointA = getLoopPoint({
          subCircle,
          intersectionCircle,
          intersectionAngle:
            Math.PI + relativeSubCircle.phase - intersectionBaseAngle,
        });
        const loopPointB = getLoopPoint({
          subCircle,
          intersectionCircle,
          intersectionAngle:
            Math.PI + relativeSubCircle.phase + intersectionBaseAngle,
        });
        loopPointsResult.unshift(loopPointA);
        loopPointsResult.push(loopPointB);
        return loopPointsResult;
      },
      [
        getLoopPoint({
          subCircle,
          intersectionCircle: {
            radius: minIntersectionRadius,
            center: subCircle.center,
          },
          intersectionAngle: relativeSubCircle.phase,
        }),
      ]
    );
  loopPoints.push(
    getLoopPoint({
      subCircle,
      intersectionCircle: {
        radius: maxIntersectionRadius,
        center: subCircle.center,
      },
      intersectionAngle: relativeSubCircle.phase + Math.PI,
    })
  );
  loopPoints.sort((a, b) => a.outputAngle - b.outputAngle);
  // const triangleWaveSample = Math.abs(((2 * frameStamp + 1) % 2) - 1);
  const triangleWaveSample = Math.sin(Math.PI * frameStamp);
  const traceIntersectionCircle = getIntersectionCircle({
    minIntersectionRadius,
    intersectionRadiusMinMaxDelta,
    subCircleCenter: subCircle.center,
    relativeIntersectionRadius: triangleWaveSample,
  });
  const traceIntersectionAngleBase = getIntersectionBaseAngle({
    baseSubCenterDistance,
    baseCircleRadius: baseCircle.radius,
    intersectionCircleRadius: traceIntersectionCircle.radius,
  });

  const traceIntersectionAngleA = getNormalizedAngle({
    someAngle:
      Math.PI +
      relativeSubCircle.phase -
      traceIntersectionAngleBase *
        (Math.sin(2 * Math.PI * frameStamp) >= 0 ? 1 : -1),
  });
  const traceIntersectionPointA = getCirclePoint({
    someCircle: traceIntersectionCircle,
    pointAngle: traceIntersectionAngleA,
  });
  const traceSubPointA = getCirclePoint({
    someCircle: subCircle,
    pointAngle: traceIntersectionAngleA,
  });
  const traceLoopPointA = {
    x: traceIntersectionPointA.x,
    y: traceSubPointA.y,
  };
  const inputTraceLoopPointA = getLoopTracePoint({
    baseCircle,
    subCircle,
    loopPoints,
    traceAngle: traceIntersectionAngleA,
  });
  // const traceIntersectionAngleB = getNormalizedAngle({
  //   someAngle: Math.PI + relativeSubCircle.phase + traceIntersectionAngleBase,
  // });
  // const intersectionPointB = getCirclePoint({
  //   someCircle: traceIntersectionCircle,
  //   pointAngle: traceIntersectionAngleB,
  // });
  // const traceSubPointB = getCirclePoint({
  //   someCircle: subCircle,
  //   pointAngle: traceIntersectionAngleB,
  // });
  // const traceLoopPointB = {
  //   x: intersectionPointB.x,
  //   y: traceSubPointB.y,
  // };
  // const inputTraceLoopPointB = getLoopTracePoint({
  //   baseCircle,
  //   subCircle,
  //   loopPoints,
  //   traceAngle: traceIntersectionAngleB,
  // });
  return (
    <svg viewBox={"-1.5 -1.5 3 3"} width={250} height={250}>
      <rect x={-1.5} y={-1.5} width={3} height={3} fill={"grey"} />
      <text
        fontFamily={"monospace"}
        fontSize={0.15}
        fontWeight={600}
        fill={"yellow"}
        x={-1.45}
        y={-1.325}
      >
        basic loop
      </text>
      <circle
        r={baseCircle.radius}
        cx={baseCircle.center.x}
        cy={baseCircle.center.y}
        fillOpacity={0}
        stroke={"darkorange"}
        strokeWidth={0.04}
      />
      <circle
        r={subCircle.radius}
        cx={subCircle.center.x}
        cy={subCircle.center.y}
        fillOpacity={0}
        stroke={"deeppink"}
        strokeWidth={0.04}
      />
      <circle
        r={traceIntersectionCircle.radius}
        cx={traceIntersectionCircle.center.x}
        cy={traceIntersectionCircle.center.y}
        fillOpacity={0}
        stroke={"deepskyblue"}
        strokeWidth={0.04}
      />
      <polygon
        points={loopPoints
          .map((somePoint) => `${somePoint.x},${somePoint.y}`)
          .join(" ")}
        fillOpacity={0}
        stroke={"yellow"}
        strokeWidth={0.04}
      />
      <circle
        cx={subCircle.center.x}
        cy={subCircle.center.y}
        r={0.05}
        fill={"lime"}
      />
      <circle
        cx={traceIntersectionPointA.x}
        cy={traceIntersectionPointA.y}
        r={0.05}
        fill={"lime"}
      />
      <circle
        cx={traceSubPointA.x}
        cy={traceSubPointA.y}
        r={0.05}
        fill={"lime"}
      />
      <circle
        cx={traceLoopPointA.x}
        cy={traceLoopPointA.y}
        r={0.05}
        fill={"black"}
      />
      <circle
        cx={inputTraceLoopPointA.x}
        cy={inputTraceLoopPointA.y}
        r={0.05}
        fill={"white"}
      />
    </svg>
  );
}

interface GetLoopTracePointApi {
  baseCircle: Circle;
  subCircle: Circle;
  loopPoints: Array<any>;
  traceAngle: number;
}

function getLoopTracePoint(api: GetLoopTracePointApi) {
  const { loopPoints, traceAngle, subCircle, baseCircle } = api;
  const loopPointIndexA = loopPoints.findIndex((_, loopPointIndex) => {
    if (loopPointIndex + 1 === loopPoints.length) return false;
    const loopPointA = loopPoints[loopPointIndex];
    const loopPointB = loopPoints[loopPointIndex + 1];
    return (
      traceAngle >= loopPointA.outputAngle &&
      traceAngle <= loopPointB.outputAngle
    );
  });
  const loopPointA = loopPoints[loopPointIndexA];
  const loopPointB = loopPoints[(loopPointIndexA + 1) % loopPoints.length];
  return getIntersectionPoint({
    lineA: [loopPointA, loopPointB],
    lineB: [
      subCircle.center,
      {
        x: baseCircle.radius * Math.cos(traceAngle) + subCircle.center.x,
        y: baseCircle.radius * Math.sin(traceAngle) + subCircle.center.y,
      },
    ],
  });
}

interface GetLoopPointApi {
  subCircle: Circle;
  intersectionCircle: Circle;
  intersectionAngle: number;
}

function getLoopPoint(api: GetLoopPointApi) {
  const { intersectionCircle, intersectionAngle, subCircle } = api;
  const loopPointBase = {
    x:
      intersectionCircle.radius * Math.cos(intersectionAngle) +
      intersectionCircle.center.x,
    y: subCircle.radius * Math.sin(intersectionAngle) + subCircle.center.y,
  };
  return {
    ...loopPointBase,
    outputAngle: getNormalizedAngle({
      someAngle: Math.atan2(
        loopPointBase.y - subCircle.center.y,
        loopPointBase.x - subCircle.center.x
      ),
    }),
  };
}

interface GetIntersectionBaseAngleApi {
  baseCircleRadius: number;
  baseSubCenterDistance: number;
  intersectionCircleRadius: number;
}

function getIntersectionBaseAngle(api: GetIntersectionBaseAngleApi) {
  const { baseCircleRadius, baseSubCenterDistance, intersectionCircleRadius } =
    api;
  return Math.acos(
    (Math.pow(baseCircleRadius, 2) -
      Math.pow(baseSubCenterDistance, 2) -
      Math.pow(intersectionCircleRadius, 2)) /
      (-2 * baseSubCenterDistance * intersectionCircleRadius)
  );
}

interface GetIntersectionCircleApi {
  subCircleCenter: Point;
  minIntersectionRadius: number;
  relativeIntersectionRadius: number;
  intersectionRadiusMinMaxDelta: number;
}

function getIntersectionCircle(api: GetIntersectionCircleApi) {
  const {
    subCircleCenter,
    relativeIntersectionRadius,
    intersectionRadiusMinMaxDelta,
    minIntersectionRadius,
  } = api;
  return {
    center: subCircleCenter,
    radius:
      relativeIntersectionRadius * intersectionRadiusMinMaxDelta +
      minIntersectionRadius,
  };
}

interface Circle {
  radius: number;
  center: Point;
}

interface Point {
  x: number;
  y: number;
}

interface GetDistanceBetweenPointsApi {
  pointA: Point;
  pointB: Point;
}

function getDistanceBetweenPoints(api: GetDistanceBetweenPointsApi) {
  const { pointA, pointB } = api;
  const deltaX = pointB.x - pointA.x;
  const deltaY = pointB.y - pointA.y;
  return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
}

interface GetCirclePointApi {
  someCircle: Circle;
  pointAngle: number;
}

function getCirclePoint(api: GetCirclePointApi): Point {
  const { pointAngle, someCircle } = api;
  const circlePoint = {
    x: Math.cos(pointAngle) * someCircle.radius + someCircle.center.x,
    y: Math.sin(pointAngle) * someCircle.radius + someCircle.center.y,
  };
  return circlePoint;
}

interface GetNormalizedAngleApi {
  someAngle: number;
}

function getNormalizedAngle(api: GetNormalizedAngleApi) {
  const { someAngle } = api;
  return (someAngle + 2 * Math.PI) % (2 * Math.PI);
}

export interface GetIntersectionPointApi {
  lineA: [Point, Point];
  lineB: [Point, Point];
}

// adjusted & optimized implementation of http://paulbourke.net/geometry/pointlineplane/
export function getIntersectionPoint(api: GetIntersectionPointApi): Point {
  const { lineB, lineA } = api;
  const deltaYB = lineB[1].y - lineB[0].y;
  const deltaXA = lineA[1].x - lineA[0].x;
  const deltaXB = lineB[1].x - lineB[0].x;
  const deltaYA = lineA[1].y - lineA[0].y;
  const slopeA =
    (deltaXB * (lineA[0].y - lineB[0].y) -
      deltaYB * (lineA[0].x - lineB[0].x)) /
    (deltaYB * deltaXA - deltaXB * deltaYA);
  return {
    x: lineA[0].x + slopeA * deltaXA,
    y: lineA[0].y + slopeA * deltaYA,
  };
}
