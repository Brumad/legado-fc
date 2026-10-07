import * as THREE from "three";
import type { SetPieceContext, SetPieceRuntimeState, Vector3 } from "./types.ts";

export type SetPieceSceneVisuals = {
  homeKit: string;
  awayKit: string;
  skinTone: string;
  hairColor: string;
  shirtNumber: number;
};

export type SetPieceSceneController = {
  update: (state: SetPieceRuntimeState) => void;
  resize: () => void;
  dispose: () => void;
};

type SceneLike = {
  add: (object: unknown) => void;
};

type PositionLike = {
  copy: (value: unknown) => void;
};

type DisposableLike = {
  dispose?: () => void;
};

type TraversedObject = {
  geometry?: DisposableLike;
  material?: DisposableLike | DisposableLike[];
};

function material(color: string, roughness = 0.78) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.02 });
}

function worldPosition(value: Vector3) {
  return new THREE.Vector3(value.x, value.y, value.z);
}

function addLine(scene: SceneLike, points: Vector3[], color = "#e8f4e8") {
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map(worldPosition));
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 }));
  scene.add(line);
  return line;
}

function addPitch(scene: SceneLike, context: SetPieceContext) {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(105, 68, 1, 1),
    new THREE.MeshStandardMaterial({ color: "#2d8147", roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(52.5, 0, 34);
  ground.receiveShadow = true;
  scene.add(ground);

  const stripeMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.035 });
  for (let index = 0; index < 14; index += 2) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(105 / 14, 68), stripeMaterial);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set((index + 0.5) * 105 / 14, 0.004, 34);
    scene.add(stripe);
  }

  const y = 0.018;
  addLine(scene, [
    { x: 0, y, z: 0 }, { x: 105, y, z: 0 }, { x: 105, y, z: 68 },
    { x: 0, y, z: 68 }, { x: 0, y, z: 0 },
  ]);
  addLine(scene, [{ x: 52.5, y, z: 0 }, { x: 52.5, y, z: 68 }]);

  const goalX = context.goalX;
  const sign = context.attackingSide === "home" ? 1 : -1;
  const penaltyX = goalX - sign * 16.5;
  const sixX = goalX - sign * 5.5;
  const pz0 = 34 - 20.16, pz1 = 34 + 20.16;
  const sz0 = 34 - 9.16, sz1 = 34 + 9.16;
  addLine(scene, [
    { x: goalX, y, z: pz0 }, { x: penaltyX, y, z: pz0 },
    { x: penaltyX, y, z: pz1 }, { x: goalX, y, z: pz1 },
  ]);
  addLine(scene, [
    { x: goalX, y, z: sz0 }, { x: sixX, y, z: sz0 },
    { x: sixX, y, z: sz1 }, { x: goalX, y, z: sz1 },
  ]);
}

function addGoal(scene: SceneLike, context: SetPieceContext) {
  const post = material("#f7fff6", 0.45);
  const depth = 2.1;
  const x = context.goalX;
  const z0 = context.goalCenterZ - context.goalWidth / 2;
  const z1 = context.goalCenterZ + context.goalWidth / 2;
  const postGeometry = new THREE.CylinderGeometry(0.055, 0.055, context.goalHeight, 8);
  for (const z of [z0, z1]) {
    const mesh = new THREE.Mesh(postGeometry, post);
    mesh.position.set(x, context.goalHeight / 2, z);
    mesh.castShadow = true;
    scene.add(mesh);
  }
  const crossbar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, context.goalWidth, 8),
    post,
  );
  crossbar.rotation.x = Math.PI / 2;
  crossbar.position.set(x, context.goalHeight, context.goalCenterZ);
  scene.add(crossbar);

  const sign = context.attackingSide === "home" ? 1 : -1;
  const backX = x + sign * depth;
  const netMaterial = new THREE.LineBasicMaterial({ color: "#d9eadb", transparent: true, opacity: 0.27 });
  for (let index = 0; index <= 8; index += 1) {
    const z = z0 + context.goalWidth * index / 8;
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, 0, z),
      new THREE.Vector3(backX, 0, z),
      new THREE.Vector3(backX, context.goalHeight, z),
      new THREE.Vector3(x, context.goalHeight, z),
    ]);
    scene.add(new THREE.Line(geometry, netMaterial));
  }
  for (let index = 0; index <= 5; index += 1) {
    const height = context.goalHeight * index / 5;
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, height, z0),
      new THREE.Vector3(backX, height, z0),
      new THREE.Vector3(backX, height, z1),
      new THREE.Vector3(x, height, z1),
    ]);
    scene.add(new THREE.Line(geometry, netMaterial));
  }
}

function createActorMesh(
  kitColor: string,
  skinTone: string,
  hairColor: string,
  keeper = false,
  controlled = false,
) {
  const group = new THREE.Group();
  const kit = material(keeper ? "#e3c84e" : kitColor);
  const shorts = material(keeper ? "#2b302d" : controlled ? "#102419" : "#1b2520");
  const skin = material(skinTone);
  const hair = material(hairColor);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.54, 3, 7), kit);
  torso.position.y = 1.12;
  torso.castShadow = true;
  group.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 9), skin);
  head.position.y = 1.78;
  head.castShadow = true;
  group.add(head);

  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.225, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), hair);
  cap.position.y = 1.84;
  group.add(cap);

  const legGeometry = new THREE.CapsuleGeometry(0.09, 0.48, 2, 6);
  for (const x of [-0.13, 0.13]) {
    const leg = new THREE.Mesh(legGeometry, shorts);
    leg.position.set(x, 0.42, 0);
    leg.castShadow = true;
    group.add(leg);
  }

  const armGeometry = new THREE.CapsuleGeometry(0.065, keeper ? 0.5 : 0.42, 2, 5);
  for (const x of [-0.36, 0.36]) {
    const arm = new THREE.Mesh(armGeometry, keeper ? kit : skin);
    arm.position.set(x, 1.16, 0);
    arm.rotation.z = x < 0 ? 0.22 : -0.22;
    group.add(arm);
  }

  if (controlled) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.43, 0.49, 24),
      new THREE.MeshBasicMaterial({ color: "#d4ff63", side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.025;
    group.add(ring);
  }
  return group;
}

function addCrowd(scene: SceneLike, quality = 1) {
  const standMat = material("#0c2016");
  for (const z of [-4.5, 72.5]) {
    const stand = new THREE.Mesh(new THREE.BoxGeometry(105, 5.5, 6), standMat);
    stand.position.set(52.5, 2.2, z);
    scene.add(stand);
  }
  const colors = ["#cce9c5","#e0b35e","#a6bac8","#cf695d","#5fa87a"];
  const amount = Math.round(90 * quality);
  for (let index = 0; index < amount; index += 1) {
    const top = index % 2 === 0;
    const person = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 5, 4),
      new THREE.MeshBasicMaterial({ color: colors[index % colors.length] }),
    );
    person.position.set((index * 7.13) % 104 + 0.5, 1.1 + (index % 4) * 0.55, top ? -1.8 : 69.8);
    scene.add(person);
  }
}

export function supportsSetPieceWebGL() {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function createSetPieceThreeScene(
  container: HTMLElement,
  context: SetPieceContext,
  visuals: SetPieceSceneVisuals,
): SetPieceSceneController {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#08160f");
  scene.fog = new THREE.Fog("#08160f", 62, 125);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 180);
  const renderer = new THREE.WebGLRenderer({
    antialias: window.devicePixelRatio <= 1.7,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.replaceChildren(renderer.domElement);

  const hemisphere = new THREE.HemisphereLight("#d7f4e1", "#102319", 2.1);
  scene.add(hemisphere);
  const sun = new THREE.DirectionalLight("#fff8df", 2.4);
  sun.position.set(context.origin.x - 12, 32, context.origin.z - 22);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);

  addPitch(scene, context);
  addGoal(scene, context);
  addCrowd(scene, window.innerWidth < 700 ? 0.45 : 1);

  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 18, 12),
    new THREE.MeshStandardMaterial({ color: "#f6f6ed", roughness: 0.48 }),
  );
  ball.castShadow = true;
  scene.add(ball);

  const homeKit = visuals.homeKit || "#f5f5f5";
  const awayKit = visuals.awayKit || "#1b2730";
  const actorMeshes = new Map<string, { position: PositionLike }>();
  const createActor = (actor: { playerId: string; side: "home" | "away"; position: Vector3; role?: string }, controlled = false) => {
    const mesh = createActorMesh(
      actor.side === "home" ? homeKit : awayKit,
      controlled ? visuals.skinTone : "#b97850",
      controlled ? visuals.hairColor : "#181d19",
      actor.role === "GOL",
      controlled,
    );
    mesh.position.copy(worldPosition(actor.position));
    const goalDirection = actor.side === "home" ? 1 : -1;
    mesh.rotation.y = goalDirection > 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(mesh);
    actorMeshes.set(actor.playerId, mesh);
  };

  createActor({
    playerId: context.takerId,
    side: context.attackingSide,
    position: {
      x: context.origin.x + (context.attackingSide === "home" ? -1.15 : 1.15),
      y: 0,
      z: context.origin.z,
    },
    role: "MEI",
  }, true);
  for (const actor of context.wall) createActor(actor);
  for (const actor of context.attackers.slice(0, 6)) createActor(actor);
  for (const actor of context.defenders.slice(0, 6)) createActor(actor);
  createActor({
    playerId: context.keeper.playerId,
    side: context.defendingSide,
    position: context.keeper.position,
    role: "GOL",
  });

  const trajectoryGeometry = new THREE.BufferGeometry();
  const trajectoryMaterial = new THREE.LineBasicMaterial({ color: "#d4ff63", transparent: true, opacity: 0.42 });
  const trajectory = new THREE.Line(trajectoryGeometry, trajectoryMaterial);
  scene.add(trajectory);

  const goalTarget = new THREE.Vector3(context.goalX, 1.15, context.goalCenterZ);
  function setCamera() {
    const sign = context.attackingSide === "home" ? 1 : -1;
    if (context.kind === "corner") {
      const outside = context.cornerSide === "top" ? -1 : 1;
      camera.position.set(
        context.origin.x - sign * 5.8,
        5.4,
        context.origin.z + outside * 7.2,
      );
      camera.lookAt(context.goalX - sign * 7.5, 1.5, context.goalCenterZ);
    } else {
      camera.position.set(
        context.origin.x - sign * 6.6,
        3.5,
        context.origin.z + (context.origin.z - context.goalCenterZ) * 0.1,
      );
      camera.lookAt(goalTarget);
    }
  }
  setCamera();

  function resize() {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function update(state: SetPieceRuntimeState) {
    ball.position.copy(worldPosition(state.ball.position));
    ball.rotation.x += Math.hypot(state.ball.velocity.x, state.ball.velocity.z) * 0.004;
    ball.rotation.z += state.ball.spin * 0.018;

    const keeperMesh = actorMeshes.get(context.keeper.playerId);
    if (keeperMesh) keeperMesh.position.copy(worldPosition(state.keeper.position));

    if (state.samples.length > 1) {
      trajectoryGeometry.setFromPoints(state.samples.slice(-55).map(worldPosition));
      trajectoryGeometry.computeBoundingSphere();
    }
    renderer.render(scene, camera);
  }

  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  return {
    update,
    resize,
    dispose() {
      resizeObserver.disconnect();
      scene.traverse((object: TraversedObject) => {
        object.geometry?.dispose?.();
        const mats = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : [];
        for (const item of mats) item.dispose?.();
      });
      renderer.dispose();
      container.replaceChildren();
    },
  };
}
