import type { SetPiece3DRequest, SetPiece3DResult, SetPieceTrajectoryPoint } from "./types.ts";

export type ThreeSetPieceSceneOptions = {
  quality?: "low" | "medium" | "high";
  attackingColor?: string;
  defendingColor?: string;
  skinTone?: string;
  hairColor?: string;
};

export function isSetPieceWebGLAvailable(): boolean;

export class ThreeSetPieceScene {
  constructor(container: HTMLElement, request: SetPiece3DRequest, options?: ThreeSetPieceSceneOptions);
  setPreview(points: SetPieceTrajectoryPoint[]): void;
  play(points: SetPieceTrajectoryPoint[], result: SetPiece3DResult, onComplete?: () => void): void;
  resize(): void;
  render(): void;
  dispose(): void;
}
