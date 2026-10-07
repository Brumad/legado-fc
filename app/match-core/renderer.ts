import type { MatchCoreEvent, MatchCoreState, MatchPlayerState, Vector2 } from "./types.ts";

export type MatchCamera = {
  center: Vector2;
  worldWidth: number;
  worldHeight: number;
};

export type MatchCameraMode = "follow" | "broadcast" | "wide";
export type MatchVisualQuality = "low" | "medium" | "high";

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
  homeTrim: string;
  awayTrim: string;
  controlledPlayer: string;
  ball: string;
  shadow: string;
  stadium: string;
};

export type MatchPresentationOptions = {
  quality: MatchVisualQuality;
  effects: boolean;
  crowd: boolean;
};

export const DEFAULT_MATCH_RENDER_THEME: MatchRenderTheme = {
  pitch: "#2f8448",
  pitchAlt: "#2b7942",
  pitchLine: "rgba(245,255,244,.88)",
  homePlayer: "#f4f7fb",
  awayPlayer: "#222b36",
  homeTrim: "#122019",
  awayTrim: "#f1f5f2",
  controlledPlayer: "#d4ff63",
  ball: "#ffffff",
  shadow: "rgba(0,0,0,.24)",
  stadium: "#07150e",
};

export const DEFAULT_MATCH_PRESENTATION: MatchPresentationOptions = {
  quality: "high",
  effects: true,
  crowd: true,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function hexToRgb(hex: string) {
  const value = hex.trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function tone(hex: string, amount: number) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const target = amount >= 0 ? 255 : 0;
  const mix = Math.abs(amount);
  const channel = (value: number) => Math.round(value + (target - value) * mix);
  return `rgb(${channel(rgb.r)},${channel(rgb.g)},${channel(rgb.b)})`;
}

function playerColor(player: MatchPlayerState, theme: MatchRenderTheme) {
  return player.side === "home" ? theme.homePlayer : theme.awayPlayer;
}

function playerTrim(player: MatchPlayerState, theme: MatchRenderTheme) {
  return player.side === "home" ? theme.homeTrim : theme.awayTrim;
}

function recentPlayerEvent(state: MatchCoreState, playerId: string): MatchCoreEvent | null {
  for (let index = state.events.length - 1; index >= 0; index -= 1) {
    const event = state.events[index];
    if (state.tick - event.tick > 36) break;
    if ("playerId" in event && event.playerId === playerId) return event;
    if (event.type === "goal" && event.scorerId === playerId) return event;
  }
  return null;
}

export function createMatchCamera(
  state: MatchCoreState,
  viewport: Pick<MatchViewport, "width" | "height" | "padding">,
  mode: MatchCameraMode = "follow",
): MatchCamera {
  const controlled = state.players.find((player) => player.controlled && player.active);
  const ballOwner = state.ball.possessionPlayerId
    ? state.players.find((player) => player.id === state.ball.possessionPlayerId)
    : null;
  const focus = controlled ?? ballOwner ?? { position: state.ball.position };
  const drawableWidth = Math.max(1, viewport.width - viewport.padding * 2);
  const drawableHeight = Math.max(1, viewport.height - viewport.padding * 2);
  const aspect = drawableWidth / drawableHeight;

  const worldHeight = mode === "wide" ? 68 : mode === "broadcast" ? 52 : 42;
  const minWidth = mode === "wide" ? 96 : mode === "broadcast" ? 76 : 58;
  const maxWidth = mode === "wide" ? 112 : mode === "broadcast" ? 92 : 74;
  const worldWidth = Math.max(minWidth, Math.min(maxWidth, worldHeight * aspect));
  const halfWidth = worldWidth / 2;
  const halfHeight = worldHeight / 2;

  const lead = mode === "follow"
    ? {
        x: clamp((state.ball.position.x - focus.position.x) * 0.18, -4.5, 4.5),
        y: clamp((state.ball.position.y - focus.position.y) * 0.14, -2.8, 2.8),
      }
    : { x: 0, y: 0 };

  return {
    center: {
      x: clamp(focus.position.x + lead.x, halfWidth, state.pitch.length - halfWidth),
      y: clamp(focus.position.y + lead.y, halfHeight, state.pitch.width - halfHeight),
    },
    worldWidth,
    worldHeight,
  };
}

export function createFollowCamera(
  state: MatchCoreState,
  viewport: Pick<MatchViewport, "width" | "height" | "padding">,
): MatchCamera {
  return createMatchCamera(state, viewport, "follow");
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

function drawStadium(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  padding: number,
  theme: MatchRenderTheme,
  options: MatchPresentationOptions,
) {
  context.fillStyle = theme.stadium;
  context.fillRect(0, 0, width, height);
  if (!options.crowd) return;

  const stand = Math.max(8, padding * 0.9);
  context.fillStyle = "#0c2418";
  context.fillRect(0, 0, width, stand);
  context.fillRect(0, height - stand, width, stand);

  const spacing = options.quality === "high" ? 7 : options.quality === "medium" ? 11 : 18;
  const colors = ["#d7efc2", "#87b99b", "#f0c36b", "#b8c5d0", "#d36f62"];
  for (let x = spacing; x < width; x += spacing) {
    const seed = stableHash(`crowd:${x}`);
    const radius = options.quality === "high" ? 1.8 : 1.4;
    context.fillStyle = colors[seed % colors.length];
    context.globalAlpha = 0.48 + (seed % 30) / 100;
    context.beginPath();
    context.arc(x, stand * 0.45, radius, 0, Math.PI * 2);
    context.arc(x + spacing * 0.35, height - stand * 0.45, radius, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
}

function drawPitchTexture(
  context: CanvasRenderingContext2D,
  state: MatchCoreState,
  viewport: MatchViewport,
  theme: MatchRenderTheme,
  quality: MatchVisualQuality,
) {
  const stripeCount = quality === "low" ? 10 : 14;
  for (let stripe = 0; stripe < stripeCount; stripe += 1) {
    const x0 = state.pitch.length / stripeCount * stripe;
    const x1 = state.pitch.length / stripeCount * (stripe + 1);
    const a = pitchToCanvas({ x: x0, y: 0 }, state, viewport);
    const b = pitchToCanvas({ x: x1, y: state.pitch.width }, state, viewport);
    context.fillStyle = stripe % 2 ? theme.pitchAlt : theme.pitch;
    context.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
  }

  if (quality === "high") {
    context.globalAlpha = 0.07;
    context.strokeStyle = "#ffffff";
    context.lineWidth = 1;
    for (let y = 3; y < state.pitch.width; y += 4) {
      drawPitchLine(context, { x: 0, y }, { x: state.pitch.length, y }, state, viewport);
    }
    context.globalAlpha = 1;
  }
}

function drawGoalNet(
  context: CanvasRenderingContext2D,
  side: "left" | "right",
  state: MatchCoreState,
  viewport: MatchViewport,
  theme: MatchRenderTheme,
  quality: MatchVisualQuality,
) {
  const x = side === "left" ? -2.2 : state.pitch.length;
  const top = (state.pitch.width - 7.32) / 2;
  const a = pitchToCanvas({ x, y: top }, state, viewport);
  const b = pitchToCanvas({ x: x + 2.2, y: top + 7.32 }, state, viewport);
  context.save();
  context.strokeStyle = theme.pitchLine;
  context.lineWidth = 1;
  context.globalAlpha = 0.66;
  context.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
  if (quality !== "low") {
    const steps = quality === "high" ? 5 : 3;
    for (let i = 1; i < steps; i += 1) {
      const t = i / steps;
      context.beginPath();
      context.moveTo(a.x + (b.x - a.x) * t, a.y);
      context.lineTo(a.x + (b.x - a.x) * t, b.y);
      context.stroke();
      context.beginPath();
      context.moveTo(a.x, a.y + (b.y - a.y) * t);
      context.lineTo(b.x, a.y + (b.y - a.y) * t);
      context.stroke();
    }
  }
  context.restore();
}

function drawActionPulse(
  context: CanvasRenderingContext2D,
  point: Vector2,
  radius: number,
  event: MatchCoreEvent | null,
  state: MatchCoreState,
  theme: MatchRenderTheme,
  effects: boolean,
) {
  if (!effects || !event) return;
  const age = Math.max(0, state.tick - event.tick);
  if (age > 30) return;
  const strength = 1 - age / 30;
  const color = event.type === "shot"
    ? "#ffca65"
    : event.type === "tackle"
      ? "#ff8168"
      : event.type === "goal"
        ? theme.controlledPlayer
        : "#8ed7ff";
  context.save();
  context.strokeStyle = color;
  context.globalAlpha = strength * 0.75;
  context.lineWidth = Math.max(1.5, radius * 0.18);
  context.beginPath();
  context.arc(point.x, point.y, radius * (1.5 + (1 - strength) * 1.3), 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function drawRetroPlayer(
  context: CanvasRenderingContext2D,
  state: MatchCoreState,
  player: MatchPlayerState,
  point: Vector2,
  scale: number,
  theme: MatchRenderTheme,
  options: MatchPresentationOptions,
) {
  const velocity = Math.hypot(player.velocity.x, player.velocity.y);
  const facing = player.facing ?? { x: player.side === "home" ? 1 : -1, y: 0 };
  const angle = Math.atan2(facing.y, facing.x) + Math.PI / 2;
  const event = recentPlayerEvent(state, player.id);
  const seed = stableHash(player.id) % 100;
  const run = Math.sin(state.tick * 0.5 + seed) * Math.min(1, velocity / 4.5);
  const isPass = event?.type === "pass" || event?.type === "through-ball";
  const isShot = event?.type === "shot";
  const isTackle = event?.type === "tackle" || event?.type === "foul";
  const isGoal = event?.type === "goal";
  const isKeeper = player.role === "GOL";

  context.save();
  context.translate(point.x, point.y);
  context.rotate(angle);

  // Ground contact shadow.
  context.fillStyle = theme.shadow;
  context.beginPath();
  context.ellipse(2, scale * 0.72, scale * 0.75, scale * 0.34, 0, 0, Math.PI * 2);
  context.fill();

  const kit = playerColor(player, theme);
  const trim = playerTrim(player, theme);
  const skin = player.side === "home" ? "#c98b63" : "#b87552";
  const bodyWidth = scale * (isKeeper ? 1.05 : 0.92);
  const bodyHeight = scale * 1.1;

  // Motion streaks stay cosmetic.
  if (options.effects && velocity > 5.5) {
    context.strokeStyle = tone(kit, 0.35);
    context.globalAlpha = 0.28;
    context.lineWidth = Math.max(1, scale * 0.12);
    for (let index = -1; index <= 1; index += 1) {
      context.beginPath();
      context.moveTo(index * scale * 0.3, scale * 0.8);
      context.lineTo(index * scale * 0.3, scale * 1.55);
      context.stroke();
    }
    context.globalAlpha = 1;
  }

  // Legs.
  context.strokeStyle = trim;
  context.lineCap = "round";
  context.lineWidth = Math.max(2, scale * 0.28);
  const legSwing = isShot ? 0.95 : isPass ? 0.62 : isTackle ? 1.15 : run * 0.62;
  context.beginPath();
  context.moveTo(-scale * 0.22, scale * 0.34);
  context.lineTo(-scale * 0.27 + legSwing * scale * 0.25, scale * (isTackle ? 1.2 : 0.95));
  context.stroke();
  context.beginPath();
  context.moveTo(scale * 0.22, scale * 0.34);
  context.lineTo(scale * 0.27 - legSwing * scale * 0.24, scale * (isShot ? 1.25 : 0.95));
  context.stroke();

  // Torso / kit.
  context.fillStyle = kit;
  context.strokeStyle = tone(kit, -0.38);
  context.lineWidth = Math.max(1, scale * 0.1);
  context.beginPath();
  context.roundRect(-bodyWidth / 2, -bodyHeight * 0.35, bodyWidth, bodyHeight, scale * 0.25);
  context.fill();
  context.stroke();

  // Procedural kit variants keep home, away and goalkeeper silhouettes distinct.
  context.fillStyle = tone(kit, player.side === "home" ? -0.16 : 0.2);
  if (isKeeper) {
    context.fillRect(-bodyWidth * 0.34, -bodyHeight * 0.16, bodyWidth * 0.68, bodyHeight * 0.42);
    context.strokeStyle = theme.controlledPlayer;
    context.lineWidth = Math.max(1, scale * 0.08);
    context.strokeRect(-bodyWidth * 0.34, -bodyHeight * 0.16, bodyWidth * 0.68, bodyHeight * 0.42);
  } else if (player.side === "home") {
    context.fillRect(-scale * 0.09, -bodyHeight * 0.28, scale * 0.18, bodyHeight * 0.74);
  } else {
    context.save();
    context.rotate(-0.42);
    context.fillRect(-bodyWidth * 0.7, -scale * 0.09, bodyWidth * 1.4, scale * 0.18);
    context.restore();
  }

  // Tiny chest mark reinforces side readability at low zoom.
  context.fillStyle = player.side === "home" ? theme.homeTrim : theme.awayTrim;
  context.fillRect(-bodyWidth * 0.31, -bodyHeight * 0.17, scale * 0.12, scale * 0.12);

  // Arms; keepers and celebrations have distinct silhouettes.
  context.strokeStyle = skin;
  context.lineWidth = Math.max(2, scale * 0.24);
  const armRaise = isGoal ? -1.15 : isKeeper ? -0.55 : isTackle ? 0.7 : run * 0.22;
  context.beginPath();
  context.moveTo(-bodyWidth * 0.44, -scale * 0.08);
  context.lineTo(-scale * (isGoal ? 0.9 : 0.7), scale * armRaise);
  context.stroke();
  context.beginPath();
  context.moveTo(bodyWidth * 0.44, -scale * 0.08);
  context.lineTo(scale * (isGoal ? 0.9 : 0.7), scale * armRaise);
  context.stroke();

  // Head + hair cap.
  context.fillStyle = skin;
  context.beginPath();
  context.arc(0, -scale * 0.82, scale * 0.38, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#1d211d";
  context.beginPath();
  context.arc(0, -scale * 0.91, scale * 0.35, Math.PI, Math.PI * 2);
  context.fill();

  if (isKeeper) {
    context.strokeStyle = theme.controlledPlayer;
    context.lineWidth = Math.max(1.5, scale * 0.12);
    context.strokeRect(-bodyWidth * 0.38, -bodyHeight * 0.2, bodyWidth * 0.76, bodyHeight * 0.52);
  }

  context.restore();

  if (player.controlled) {
    context.save();
    context.strokeStyle = theme.controlledPlayer;
    context.lineWidth = Math.max(2, scale * 0.18);
    context.beginPath();
    context.arc(point.x, point.y, scale * 1.35, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = theme.controlledPlayer;
    context.beginPath();
    context.moveTo(point.x, point.y - scale * 1.95);
    context.lineTo(point.x - scale * 0.42, point.y - scale * 2.65);
    context.lineTo(point.x + scale * 0.42, point.y - scale * 2.65);
    context.closePath();
    context.fill();
    context.restore();
  }

  drawActionPulse(context, point, scale, event, state, theme, options.effects);

  if (state.ball.possessionPlayerId === player.id) {
    context.save();
    context.fillStyle = "#ffffff";
    context.strokeStyle = theme.controlledPlayer;
    context.lineWidth = 1;
    context.beginPath();
    context.arc(point.x + scale * 0.95, point.y - scale * 0.9, scale * 0.18, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.restore();
  }
}

function drawRetroBall(
  context: CanvasRenderingContext2D,
  state: MatchCoreState,
  viewport: MatchViewport,
  scale: number,
  theme: MatchRenderTheme,
  effects: boolean,
) {
  const ball = pitchToCanvas(state.ball.position, state, viewport);
  const speed = Math.hypot(state.ball.velocity.x, state.ball.velocity.y);
  if (effects && speed > 8) {
    const trail = Math.min(20, speed * 0.7);
    const direction = speed > 0
      ? { x: state.ball.velocity.x / speed, y: state.ball.velocity.y / speed }
      : { x: 0, y: 0 };
    context.save();
    context.strokeStyle = "rgba(255,255,255,.28)";
    context.lineWidth = Math.max(1, scale * 0.22);
    context.beginPath();
    context.moveTo(ball.x, ball.y);
    context.lineTo(ball.x - direction.x * trail, ball.y - direction.y * trail);
    context.stroke();
    context.restore();
  }

  const radius = Math.max(3.2, scale * 0.43);
  context.fillStyle = theme.shadow;
  context.beginPath();
  context.ellipse(ball.x + 2, ball.y + radius * 0.95, radius * 0.95, radius * 0.38, 0, 0, Math.PI * 2);
  context.fill();

  context.save();
  context.translate(ball.x, ball.y);
  context.rotate(state.tick * 0.08 + speed * 0.02);
  context.fillStyle = theme.ball;
  context.strokeStyle = "#111a14";
  context.lineWidth = Math.max(1, radius * 0.18);
  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.fillStyle = "#1a211c";
  context.beginPath();
  context.moveTo(0, -radius * 0.52);
  context.lineTo(radius * 0.48, -radius * 0.12);
  context.lineTo(radius * 0.3, radius * 0.45);
  context.lineTo(-radius * 0.3, radius * 0.45);
  context.lineTo(-radius * 0.48, -radius * 0.12);
  context.closePath();
  context.fill();
  context.restore();
}

function drawGoalEffect(
  context: CanvasRenderingContext2D,
  state: MatchCoreState,
  width: number,
  height: number,
  theme: MatchRenderTheme,
  options: MatchPresentationOptions,
) {
  if (!options.effects) return;
  const goal = [...state.events].reverse().find((event) => event.type === "goal");
  if (!goal || state.tick - goal.tick > 150) return;
  const age = state.tick - goal.tick;
  const opacity = clamp(1 - age / 150, 0, 1);
  context.save();
  context.globalAlpha = opacity * 0.88;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "rgba(3,17,10,.74)";
  context.fillRect(width * 0.32, height * 0.39, width * 0.36, height * 0.16);
  context.strokeStyle = theme.controlledPlayer;
  context.lineWidth = 2;
  context.strokeRect(width * 0.32, height * 0.39, width * 0.36, height * 0.16);
  context.fillStyle = theme.controlledPlayer;
  context.font = `900 ${Math.max(18, Math.min(42, width * 0.045))}px monospace`;
  context.fillText("GOOOL!", width / 2, height * 0.47);
  context.restore();
}

export function drawMatchFrame(
  context: CanvasRenderingContext2D,
  state: MatchCoreState,
  viewport: MatchViewport,
  theme: MatchRenderTheme = DEFAULT_MATCH_RENDER_THEME,
  options: MatchPresentationOptions = DEFAULT_MATCH_PRESENTATION,
) {
  const { width, height, padding } = viewport;
  const pitchTopLeft = pitchToCanvas({ x: 0, y: 0 }, state, viewport);
  const pitchBottomRight = pitchToCanvas({ x: state.pitch.length, y: state.pitch.width }, state, viewport);

  context.clearRect(0, 0, width, height);
  drawStadium(context, width, height, padding, theme, options);
  drawPitchTexture(context, state, viewport, theme, options.quality);

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
  const radiusPoint = pitchToCanvas({ x: state.pitch.length / 2 + 9.15, y: state.pitch.width / 2 }, state, viewport);
  context.beginPath();
  context.arc(center.x, center.y, Math.abs(radiusPoint.x - center.x), 0, Math.PI * 2);
  context.stroke();

  const penaltyHeight = 40.32;
  drawPitchRect(context, 0, (state.pitch.width - penaltyHeight) / 2, 16.5, penaltyHeight, state, viewport);
  drawPitchRect(context, state.pitch.length - 16.5, (state.pitch.width - penaltyHeight) / 2, 16.5, penaltyHeight, state, viewport);
  drawPitchRect(context, 0, (state.pitch.width - 18.32) / 2, 5.5, 18.32, state, viewport);
  drawPitchRect(context, state.pitch.length - 5.5, (state.pitch.width - 18.32) / 2, 5.5, 18.32, state, viewport);
  drawGoalNet(context, "left", state, viewport, theme, options.quality);
  drawGoalNet(context, "right", state, viewport, theme, options.quality);

  const scale = Math.max(4.5, Math.min(width, height) * 0.0145);
  const players = [...state.players]
    .filter((player) => player.active)
    .sort((a, b) => a.position.y - b.position.y);
  for (const player of players) {
    const point = pitchToCanvas(player.position, state, viewport);
    if (point.x < -scale * 3 || point.x > width + scale * 3 || point.y < -scale * 3 || point.y > height + scale * 3) continue;
    drawRetroPlayer(context, state, player, point, scale, theme, options);
  }

  drawRetroBall(context, state, viewport, scale, theme, options.effects);

  if (state.restart) {
    const marker = pitchToCanvas(state.restart.position, state, viewport);
    context.beginPath();
    context.setLineDash(options.quality === "low" ? [] : [5, 4]);
    context.strokeStyle = theme.controlledPlayer;
    context.lineWidth = 2;
    context.arc(marker.x, marker.y, scale * 2.1, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([]);
  }

  drawGoalEffect(context, state, width, height, theme, options);

  context.strokeStyle = "rgba(255,255,255,.12)";
  context.lineWidth = 2;
  context.strokeRect(padding, padding, width - padding * 2, height - padding * 2);
}
