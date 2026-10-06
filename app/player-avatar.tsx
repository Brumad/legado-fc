"use client";

import type { CareerState } from "./game-engine.ts";

const hairClasses: Record<string, string> = {
  Curto: "hair-short",
  Raspado: "hair-shaved",
  Cacheado: "hair-curly",
  Tranças: "hair-braids",
  Moicano: "hair-mohawk",
  Ondulado: "hair-wavy",
};

const faceClasses: Record<string, string> = {
  Oval: "face-oval",
  Quadrado: "face-square",
  Angular: "face-angular",
};

const beardClasses: Record<string, string> = {
  "Sem barba": "beard-none",
  "Barba curta": "beard-short",
  Bigode: "beard-moustache",
};

export function PlayerAvatar({ career, large = false }: { career: CareerState; large?: boolean }) {
  const hair = career.hairColor ?? "#171917";
  return (
    <div
      className={`player-avatar player-avatar-v053 ${large ? "is-large" : ""} ${faceClasses[career.faceShape ?? "Oval"] ?? "face-oval"}`}
      style={{
        "--skin": career.skinTone,
        "--kit": career.clubColor,
        "--hair": hair,
      } as React.CSSProperties}
      aria-label={`Avatar de ${career.name}`}
    >
      <span className="avatar-ear is-left" />
      <span className="avatar-ear is-right" />
      <span className="avatar-neck" />
      <span className="avatar-head">
        <i className="avatar-brow is-left" />
        <i className="avatar-brow is-right" />
        <i className="avatar-eye is-left" />
        <i className="avatar-eye is-right" />
        <i className="avatar-nose" />
        <i className="avatar-mouth" />
        <i className={`avatar-beard ${beardClasses[career.facialHair ?? "Sem barba"] ?? "beard-none"}`} />
      </span>
      <span className={`avatar-hair ${hairClasses[career.hairStyle] ?? "hair-short"}`} />
      <span className="avatar-body">
        <i className="avatar-kit-collar" />
        <i className="avatar-kit-stripe" />
        <b>{career.shirtNumber}</b>
      </span>
    </div>
  );
}
