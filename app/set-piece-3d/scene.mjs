import * as THREE from "three";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function disposeObject(root) {
  root.traverse((child) => {
    if (child.geometry?.dispose) child.geometry.dispose();
    if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose?.());
    else child.material?.dispose?.();
  });
}

function hexColor(value, fallback) {
  try {
    return new THREE.Color(value || fallback);
  } catch {
    return new THREE.Color(fallback);
  }
}

function createPlayerMesh(color, skin, hair, keeper = false) {
  const group = new THREE.Group();
  const kit = new THREE.MeshStandardMaterial({
    color: hexColor(color, keeper ? "#d4ff63" : "#ffffff"),
    roughness: 0.74,
    metalness: 0.02,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: keeper ? "#173d28" : hexColor(color, "#23302a").multiplyScalar(0.48),
    roughness: 0.82,
  });
  const skinMaterial = new THREE.MeshStandardMaterial({
    color: hexColor(skin, "#b97850"),
    roughness: 0.86,
  });
  const hairMaterial = new THREE.MeshStandardMaterial({
    color: hexColor(hair, "#171917"),
    roughness: 0.9,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.92, 0.34), kit);
  body.position.y = 1.18;
  body.castShadow = true;
  group.add(body);

  const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.34, 0.36), dark);
  shorts.position.y = 0.68;
  shorts.castShadow = true;
  group.add(shorts);

  for (const sign of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.11, 0.72, 8), skinMaterial);
    leg.position.set(sign * 0.18, 0.24, 0);
    leg.castShadow = true;
    group.add(leg);

    const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.1, 0.34, 8), dark);
    sock.position.set(sign * 0.18, -0.08, 0);
    sock.castShadow = true;
    group.add(sock);

    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.09, 0.76, 8), skinMaterial);
    arm.position.set(sign * 0.42, 1.14, 0);
    arm.rotation.z = sign * 0.2;
    arm.castShadow = true;
    group.add(arm);
  }

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), skinMaterial);
  head.position.y = 1.91;
  head.castShadow = true;
  group.add(head);

  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.286, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.48),
    hairMaterial,
  );
  hairCap.position.y = 2.0;
  hairCap.castShadow = true;
  group.add(hairCap);

  if (keeper) {
    const gloveMaterial = new THREE.MeshStandardMaterial({ color: 0xe6f3d7, roughness: 0.72 });
    for (const sign of [-1, 1]) {
      const glove = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), gloveMaterial);
      glove.position.set(sign * 0.49, 0.94, 0);
      group.add(glove);
    }
  }
  return group;
}

function addPitchLines(scene, goalZ, goalX) {
  const material = new THREE.LineBasicMaterial({ color: 0xd8eedb, transparent: true, opacity: 0.72 });
  const lines = [];
  const add = (points) => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points.map(([x, z]) => new THREE.Vector3(x, 0.012, z)));
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    lines.push(line);
  };
  add([[-22, -8], [22, -8], [22, goalZ + 5], [-22, goalZ + 5], [-22, -8]]);
  add([[-20.16 + goalX, goalZ - 16.5], [20.16 + goalX, goalZ - 16.5]]);
  add([[goalX - 9.16, goalZ - 5.5], [goalX + 9.16, goalZ - 5.5]]);
  return lines;
}

function createGoal(goalX, goalZ) {
  const group = new THREE.Group();
  group.position.set(goalX, 0, goalZ);
  const postMaterial = new THREE.MeshStandardMaterial({ color: 0xf3f7ef, roughness: 0.58 });
  const netMaterial = new THREE.LineBasicMaterial({ color: 0xbcd5c1, transparent: true, opacity: 0.45 });
  const post = (x, y, z, sx, sy, sz) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), postMaterial);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    group.add(mesh);
  };
  post(-3.66, 1.22, 0, 0.09, 2.44, 0.09);
  post(3.66, 1.22, 0, 0.09, 2.44, 0.09);
  post(0, 2.44, 0, 7.41, 0.09, 0.09);

  for (let index = 0; index <= 8; index += 1) {
    const x = -3.66 + 7.32 * (index / 8);
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, 0, 0),
      new THREE.Vector3(x, 2.44, 0),
      new THREE.Vector3(x, 2.44, 1.6),
      new THREE.Vector3(x, 0, 1.6),
    ]);
    group.add(new THREE.Line(geometry, netMaterial));
  }
  for (let index = 0; index <= 4; index += 1) {
    const y = 2.44 * (index / 4);
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-3.66, y, 0),
      new THREE.Vector3(3.66, y, 0),
      new THREE.Vector3(3.66, y, 1.6),
    ]);
    group.add(new THREE.Line(geometry, netMaterial));
  }
  return group;
}

function localPlayerPosition(request, player) {
  const attackingForward = request.attackingSide === "home" ? 1 : -1;
  return {
    x: player.position.y - request.origin2D.y,
    z: (player.position.x - request.origin2D.x) * attackingForward,
  };
}

export function isSetPieceWebGLAvailable() {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export class ThreeSetPieceScene {
  constructor(container, request, options = {}) {
    this.container = container;
    this.request = request;
    this.options = options;
    this.raf = 0;
    this.previewLine = null;
    this.disposed = false;
    this.goalZ = request.kind === "free-kick-direct"
      ? clamp(request.distanceToGoal, 14, 38)
      : request.kind === "corner" ? 28 : clamp(request.distanceToGoal * 0.72, 24, 32);
    this.goalX = request.kind === "free-kick-direct" ? request.goalOffsetX : 0;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07150e);
    this.scene.fog = new THREE.Fog(0x07150e, 38, 78);

    this.camera = new THREE.PerspectiveCamera(49, 1, 0.1, 140);
    if (request.kind === "corner") {
      const cornerSign = request.cornerEdge === "top" ? -1 : 1;
      this.camera.position.set(cornerSign * 6.8, 4.5, -7.5);
    } else {
      this.camera.position.set(0, 3.2, -7.2);
    }
    this.camera.lookAt(this.goalX * 0.42, 1.1, this.goalZ * 0.6);

    this.renderer = new THREE.WebGLRenderer({
      antialias: options.quality !== "low",
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.quality === "high" ? 1.75 : 1.25));
    this.renderer.shadowMap.enabled = options.quality !== "low";
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.className = "set-piece-three-canvas";
    this.renderer.domElement.setAttribute("aria-label", "Cena 3D de bola parada");
    container.appendChild(this.renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xcce9d2, 0x07120b, 2.25);
    this.scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 2.35);
    sun.position.set(-9, 18, -7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    this.scene.add(sun);

    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(46, 58, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x277b43, roughness: 0.96 }),
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.z = this.goalZ * 0.52;
    grass.receiveShadow = true;
    this.scene.add(grass);
    addPitchLines(this.scene, this.goalZ, this.goalX);

    const stadium = new THREE.Mesh(
      new THREE.BoxGeometry(49, 4.2, 4.5),
      new THREE.MeshStandardMaterial({ color: 0x0b281b, roughness: 1 }),
    );
    stadium.position.set(0, 2, this.goalZ + 6.5);
    this.scene.add(stadium);

    const goal = createGoal(this.goalX, this.goalZ);
    this.scene.add(goal);

    this.ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.115, options.quality === "low" ? 10 : 18, options.quality === "low" ? 8 : 14),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 }),
    );
    this.ball.position.set(0, 0.115, 0);
    this.ball.castShadow = true;
    this.scene.add(this.ball);

    const attackColor = options.attackingColor || "#f4f7fb";
    const defenseColor = options.defendingColor || "#222b36";
    const skin = options.skinTone || "#b97850";
    const hair = options.hairColor || "#171917";

    this.taker = createPlayerMesh(attackColor, skin, hair, false);
    this.taker.position.set(0, 0, -2.1);
    this.taker.rotation.y = 0;
    this.scene.add(this.taker);

    this.keeper = createPlayerMesh("#d4ff63", "#b97850", "#171917", true);
    this.keeper.position.set(this.goalX, 0, this.goalZ - 0.5);
    this.keeper.rotation.y = Math.PI;
    this.scene.add(this.keeper);

    this.wall = [];
    if (request.kind === "free-kick-direct") {
      const wallZ = Math.min(9.15, request.distanceToGoal * 0.47);
      const wallX = request.goalOffsetX * (wallZ / Math.max(1, request.distanceToGoal));
      for (let index = 0; index < request.wallCount; index += 1) {
        const mesh = createPlayerMesh(defenseColor, "#a96f50", "#201a16", false);
        mesh.position.set(wallX + (index - (request.wallCount - 1) / 2) * 0.72, 0, wallZ);
        mesh.rotation.y = Math.PI;
        this.scene.add(mesh);
        this.wall.push(mesh);
      }
    }

    this.areaMeshes = [];
    if (request.kind !== "free-kick-direct") {
      const candidates = request.areaPlayers
        .filter((player) => player.role !== "GOL" && player.id !== request.takerId)
        .map((player) => ({ player, local: localPlayerPosition(request, player) }))
        .filter(({ local }) => local.z > 6 && local.z < this.goalZ + 7)
        .sort((a, b) => b.local.z - a.local.z)
        .slice(0, 12);
      for (const { player, local } of candidates) {
        const mesh = createPlayerMesh(
          player.side === request.attackingSide ? attackColor : defenseColor,
          "#aa7354",
          "#1e1b17",
          false,
        );
        mesh.position.set(clamp(local.x, -12, 12), 0, clamp(local.z, 8, this.goalZ - 1.8));
        mesh.rotation.y = player.side === request.attackingSide ? 0 : Math.PI;
        this.scene.add(mesh);
        this.areaMeshes.push({ mesh, side: player.side, id: player.id });
      }
    }

    this.previewMaterial = new THREE.LineBasicMaterial({
      color: 0xd4ff63,
      transparent: true,
      opacity: 0.64,
    });

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
    this.render();
  }

  resize() {
    if (this.disposed) return;
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.render();
  }

  setPreview(points) {
    if (this.previewLine) {
      this.scene.remove(this.previewLine);
      this.previewLine.geometry.dispose();
      this.previewLine = null;
    }
    const sampled = points.filter((_, index) => index % 9 === 0).slice(0, 80);
    if (sampled.length < 2) return;
    const geometry = new THREE.BufferGeometry().setFromPoints(
      sampled.map((point) => new THREE.Vector3(point.x, Math.max(0.1, point.y), point.z)),
    );
    this.previewLine = new THREE.Line(geometry, this.previewMaterial);
    this.scene.add(this.previewLine);
    this.render();
  }

  play(points, result, onComplete) {
    if (this.disposed || !points.length) {
      onComplete?.();
      return;
    }
    if (this.previewLine) {
      this.scene.remove(this.previewLine);
      this.previewLine.geometry.dispose();
      this.previewLine = null;
    }
    const start = performance.now();
    const duration = Math.min(2800, Math.max(900, (points.at(-1)?.t || 1.4) * 820));
    const keeperStartX = this.keeper.position.x;
    const keeperTargetX = clamp(result.keeper.targetX, this.goalX - 3.4, this.goalX + 3.4);
    const keeperTargetY = clamp(result.keeper.targetY * 0.52, 0, 1.35);

    const animate = (now) => {
      if (this.disposed) return;
      const progress = clamp((now - start) / duration, 0, 1);
      const pointIndex = Math.min(points.length - 1, Math.floor(progress * (points.length - 1)));
      const point = points[pointIndex];
      this.ball.position.set(point.x, Math.max(0.115, point.y), point.z);
      this.ball.rotation.x += 0.16;
      this.ball.rotation.z += 0.12;

      const reactionProgress = clamp((point.t - result.keeper.reactionSeconds) / 0.55, 0, 1);
      if (reactionProgress > 0) {
        this.keeper.position.x = THREE.MathUtils.lerp(keeperStartX, keeperTargetX, reactionProgress);
        this.keeper.position.y = THREE.MathUtils.lerp(0, keeperTargetY, reactionProgress);
        this.keeper.rotation.z = THREE.MathUtils.lerp(0, (keeperTargetX - keeperStartX) * -0.13, reactionProgress);
      }

      const kickProgress = clamp(progress / 0.18, 0, 1);
      this.taker.rotation.x = -Math.sin(kickProgress * Math.PI) * 0.12;
      for (let index = 0; index < this.wall.length; index += 1) {
        const jump = Math.sin(clamp((progress - 0.08) / 0.18, 0, 1) * Math.PI);
        this.wall[index].position.y = jump * 0.38;
      }
      for (const item of this.areaMeshes) {
        const jump = result.winnerPlayerId === item.id
          ? Math.sin(clamp((progress - 0.58) / 0.2, 0, 1) * Math.PI) * 0.48
          : 0;
        item.mesh.position.y = jump;
      }

      this.render();
      if (progress < 1) {
        this.raf = requestAnimationFrame(animate);
      } else {
        this.raf = 0;
        window.setTimeout(() => onComplete?.(), 380);
      }
    };
    this.raf = requestAnimationFrame(animate);
  }

  render() {
    if (!this.disposed) this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.resizeObserver?.disconnect();
    if (this.previewLine) this.previewLine.geometry.dispose();
    this.previewMaterial?.dispose();
    disposeObject(this.scene);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
