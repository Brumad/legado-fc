import type { MatchCoreState, Vector2 } from "./types.ts";

export type MatchViewport = {
  width: number;
  height: number;
  padding: number;
};

export type MatchRenderTheme = {
  pitch: string;
  pitchLine: string;
  homePlayer: string;
  awayPlayer: string;
  controlledPlayer: string;
  ball: string;
};

export const DEFAULT_MATCH_RENDER_THEME: MatchRenderTheme = {
  pitch: "#2d7d46",
  pitchLine: "rgba(255,255,255,.82)",
  homePlayer: "#ecf1f7",
  awayPlayer: "#202733",
  controlledPlayer: "#ffd54a",
  ball: "#ffffff",
};

export function pitchToCanvas(
  point: Vector2,
  state: Pick<MatchCoreState, "pitch">,
  viewport: MatchViewport,
): Vector2 {
  const drawableWidth = Math.max(1, viewport.width - viewport.padding * 2);
  const drawableHeight = Math.max(1, viewport.height - viewport.padding * 2);
  return {
    x: viewport.padding + (point.x / state.pitch.length) * drawableWidth,
    y: viewport.padding + (point.y / state.pitch.width) * drawableHeight,
  };
}

export function drawMatchFrame(
  context: CanvasRenderingContext2D,
  state: MatchCoreState,
  viewport: MatchViewport,
  theme: MatchRenderTheme = DEFAULT_MATCH_RENDER_THEME,
) {
  const { width, height, padding } = viewport;
  const pitchWidth = width - padding * 2;
  const pitchHeight = height - padding * 2;
  const centerX = padding + pitchWidth / 2;
  const centerY = padding + pitchHeight / 2;

  context.clearRect(0, 0, width, height);
  context.fillStyle = theme.pitch;
  context.fillRect(padding, padding, pitchWidth, pitchHeight);

  context.strokeStyle = theme.pitchLine;
  context.lineWidth = Math.max(1, Math.min(width, height) / 420);
  context.strokeRect(padding, padding, pitchWidth, pitchHeight);
  context.beginPath();
  context.moveTo(centerX, padding);
  context.lineTo(centerX, padding + pitchHeight);
  context.stroke();

  context.beginPath();
  context.arc(centerX, centerY, Math.min(pitchWidth, pitchHeight) * 0.11, 0, Math.PI * 2);
  context.stroke();

  const penaltyWidth = pitchWidth * (16.5 / state.pitch.length);
  const penaltyHeight = pitchHeight * (40.32 / state.pitch.width);
  context.strokeRect(padding, centerY - penaltyHeight / 2, penaltyWidth, penaltyHeight);
  context.strokeRect(padding + pitchWidth - penaltyWidth, centerY - penaltyHeight / 2, penaltyWidth, penaltyHeight);

  const playerRadius = Math.max(3, Math.min(width, height) * 0.012);
  for (const player of state.players) {
    if (!player.active) continue;
    const point = pitchToCanvas(player.position, state, viewport);
    context.beginPath();
    context.fillStyle = player.controlled
      ? theme.controlledPlayer
      : player.side === "home"
        ? theme.homePlayer
        : theme.awayPlayer;
    context.arc(point.x, point.y, player.controlled ? playerRadius * 1.25 : playerRadius, 0, Math.PI * 2);
    context.fill();

    if (player.controlled) {
      context.strokeStyle = theme.pitchLine;
      context.lineWidth = 2;
      context.stroke();
    }
  }

  const ball = pitchToCanvas(state.ball.position, state, viewport);
  context.beginPath();
  context.fillStyle = theme.ball;
  context.arc(ball.x, ball.y, Math.max(2, playerRadius * 0.45), 0, Math.PI * 2);
  context.fill();
}
