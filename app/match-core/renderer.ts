import type { MatchCoreState, Vector2 } from "./types.ts";

export type MatchCamera = {
  center: Vector2;
  worldWidth: number;
  worldHeight: number;
};

export type MatchViewport = {
  width: number;
  height: number;
  padding: number;
  camera?: MatchCamera;
};

export type MatchRenderTheme = {
  pitch: string;
  pitchAlt: string;
  pitchLine: string;
  homePlayer: string;
  awayPlayer: string;
  controlledPlayer: string;
  ball: string;
  shadow: string;
};

export const DEFAULT_MATCH_RENDER_THEME: MatchRenderTheme = {
  pitch: "#2c7b45",
  pitchAlt: "#297440",
  pitchLine: "rgba(255,255,255,.78)",
  homePlayer: "#f4f7fb",
  awayPlayer: "#202733",
  controlledPlayer: "#d4ff63",
  ball: "#ffffff",
  shadow: "rgba(0,0,0,.2)",
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function createFollowCamera(
  state: MatchCoreState,
  viewport: Pick<MatchViewport, "width" | "height" | "padding">,
): MatchCamera {
  const controlled = state.players.find((player) => player.controlled && player.active);
  const ballOwner = state.ball.possessionPlayerId
    ? state.players.find((player) => player.id === state.ball.possessionPlayerId)
    : null;
  const focus = controlled ?? ballOwner ?? { position: state.ball.position };
  const drawableWidth = Math.max(1, viewport.width - viewport.padding * 2);
  const drawableHeight = Math.max(1, viewport.height - viewport.padding * 2);
  const aspect = drawableWidth / drawableHeight;
  const worldHeight = 42;
  const worldWidth = Math.max(58, Math.min(74, worldHeight * aspect));
  const halfWidth = worldWidth / 2;
  const halfHeight = worldHeight / 2;

  return {
    center: {
      x: clamp(focus.position.x, halfWidth, state.pitch.length - halfWidth),
      y: clamp(focus.position.y, halfHeight, state.pitch.width - halfHeight),
    },
    worldWidth,
    worldHeight,
  };
}

function cameraBounds(state: Pick<MatchCoreState, "pitch">, viewport: MatchViewport) {
  if (!viewport.camera) {
    return { left: 0, top: 0, width: state.pitch.length, height: state.pitch.width };
  }
  return {
    left: viewport.camera.center.x - viewport.camera.worldWidth / 2,
    top: viewport.camera.center.y - viewport.camera.worldHeight / 2,
    width: viewport.camera.worldWidth,
    height: viewport.camera.worldHeight,
  };
}

export function pitchToCanvas(
  point: Vector2,
  state: Pick<MatchCoreState, "pitch">,
  viewport: MatchViewport,
): Vector2 {
  const drawableWidth = Math.max(1, viewport.width - viewport.padding * 2);
  const drawableHeight = Math.max(1, viewport.height - viewport.padding * 2);
  const bounds = cameraBounds(state, viewport);
  return {
    x: viewport.padding + ((point.x - bounds.left) / bounds.width) * drawableWidth,
    y: viewport.padding + ((point.y - bounds.top) / bounds.height) * drawableHeight,
  };
}

function drawPitchLine(
  context: CanvasRenderingContext2D,
  from: Vector2,
  to: Vector2,
  state: MatchCoreState,
  viewport: MatchViewport,
) {
  const a = pitchToCanvas(from, state, viewport);
  const b = pitchToCanvas(to, state, viewport);
  context.beginPath();
  context.moveTo(a.x, a.y);
  context.lineTo(b.x, b.y);
  context.stroke();
}

function drawPitchRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  state: MatchCoreState,
  viewport: MatchViewport,
) {
  const a = pitchToCanvas({ x, y }, state, viewport);
  const b = pitchToCanvas({ x: x + width, y: y + height }, state, viewport);
  context.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
}

export function drawMatchFrame(
  context: CanvasRenderingContext2D,
  state: MatchCoreState,
  viewport: MatchViewport,
  theme: MatchRenderTheme = DEFAULT_MATCH_RENDER_THEME,
) {
  const { width, height, padding } = viewport;
  const pitchTopLeft = pitchToCanvas({ x: 0, y: 0 }, state, viewport);
  const pitchBottomRight = pitchToCanvas({ x: state.pitch.length, y: state.pitch.width }, state, viewport);
  const stripeCount = 12;

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#102217";
  context.fillRect(0, 0, width, height);

  for (let stripe = 0; stripe < stripeCount; stripe += 1) {
    const x0 = state.pitch.length / stripeCount * stripe;
    const x1 = state.pitch.length / stripeCount * (stripe + 1);
    const a = pitchToCanvas({ x: x0, y: 0 }, state, viewport);
    const b = pitchToCanvas({ x: x1, y: state.pitch.width }, state, viewport);
    context.fillStyle = stripe % 2 ? theme.pitchAlt : theme.pitch;
    context.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
  }

  context.strokeStyle = theme.pitchLine;
  context.lineWidth = Math.max(1.3, Math.min(width, height) / 430);
  context.strokeRect(
    pitchTopLeft.x,
    pitchTopLeft.y,
    pitchBottomRight.x - pitchTopLeft.x,
    pitchBottomRight.y - pitchTopLeft.y,
  );

  drawPitchLine(context, { x: state.pitch.length / 2, y: 0 }, { x: state.pitch.length / 2, y: state.pitch.width }, state, viewport);

  const center = pitchToCanvas({ x: state.pitch.length / 2, y: state.pitch.width / 2 }, state, viewport);
  const centerRadiusWorld = 9.15;
  const radiusPoint = pitchToCanvas({ x: state.pitch.length / 2 + centerRadiusWorld, y: state.pitch.width / 2 }, state, viewport);
  context.beginPath();
  context.arc(center.x, center.y, Math.abs(radiusPoint.x - center.x), 0, Math.PI * 2);
  context.stroke();

  const penaltyHeight = 40.32;
  drawPitchRect(context, 0, (state.pitch.width - penaltyHeight) / 2, 16.5, penaltyHeight, state, viewport);
  drawPitchRect(context, state.pitch.length - 16.5, (state.pitch.width - penaltyHeight) / 2, 16.5, penaltyHeight, state, viewport);
  drawPitchRect(context, 0, (state.pitch.width - 18.32) / 2, 5.5, 18.32, state, viewport);
  drawPitchRect(context, state.pitch.length - 5.5, (state.pitch.width - 18.32) / 2, 5.5, 18.32, state, viewport);

  // Goals.
  drawPitchRect(context, -2.2, (state.pitch.width - 7.32) / 2, 2.2, 7.32, state, viewport);
  drawPitchRect(context, state.pitch.length, (state.pitch.width - 7.32) / 2, 2.2, 7.32, state, viewport);

  const playerRadius = Math.max(4, Math.min(width, height) * 0.014);
  for (const player of state.players) {
    if (!player.active) continue;
    const point = pitchToCanvas(player.position, state, viewport);
    if (point.x < -playerRadius || point.x > width + playerRadius || point.y < -playerRadius || point.y > height + playerRadius) continue;

    context.beginPath();
    context.fillStyle = theme.shadow;
    context.ellipse(point.x + 2, point.y + playerRadius * 0.8, playerRadius * 0.9, playerRadius * 0.45, 0, 0, Math.PI * 2);
    context.fill();

    if (player.controlled) {
      context.beginPath();
      context.strokeStyle = theme.controlledPlayer;
      context.lineWidth = Math.max(2, playerRadius * 0.3);
      context.arc(point.x, point.y, playerRadius * 1.45, 0, Math.PI * 2);
      context.stroke();
    }

    context.beginPath();
    context.fillStyle = player.side === "home" ? theme.homePlayer : theme.awayPlayer;
    context.arc(point.x, point.y, playerRadius, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = player.side === "home" ? "#102217" : "rgba(255,255,255,.65)";
    context.lineWidth = Math.max(1, playerRadius * 0.16);
    context.stroke();

    if (state.ball.possessionPlayerId === player.id) {
      context.beginPath();
      context.fillStyle = theme.controlledPlayer;
      context.moveTo(point.x, point.y - playerRadius * 1.8);
      context.lineTo(point.x - playerRadius * 0.45, point.y - playerRadius * 2.5);
      context.lineTo(point.x + playerRadius * 0.45, point.y - playerRadius * 2.5);
      context.closePath();
      context.fill();
    }
  }

  const ball = pitchToCanvas(state.ball.position, state, viewport);
  const ballRadius = Math.max(3, playerRadius * 0.47);
  context.beginPath();
  context.fillStyle = theme.shadow;
  context.ellipse(ball.x + 2, ball.y + ballRadius * 0.8, ballRadius * 0.9, ballRadius * 0.4, 0, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.fillStyle = theme.ball;
  context.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "#111";
  context.lineWidth = 1;
  context.stroke();

  if (state.restart) {
    const marker = pitchToCanvas(state.restart.position, state, viewport);
    context.beginPath();
    context.strokeStyle = theme.controlledPlayer;
    context.lineWidth = 2;
    context.arc(marker.x, marker.y, playerRadius * 2.1, 0, Math.PI * 2);
    context.stroke();
  }

  // Viewport border hides content outside the playable window.
  context.strokeStyle = "rgba(255,255,255,.12)";
  context.lineWidth = 2;
  context.strokeRect(padding, padding, width - padding * 2, height - padding * 2);
}
