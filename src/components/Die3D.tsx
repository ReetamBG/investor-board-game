import { useState } from "react";
import "./Die3D.css";

type Die3DProps = {
  value: number | null;
};

export const DIE_ROLL_MS = 1000;

/** Base rotation (in deg) that brings each face to the front. */
const FACE_ROTATIONS: Record<number, { x: number; y: number; z: number }> = {
  1: { x: 720, y: 0, z: -720 },
  2: { x: 450, y: 0, z: -720 },
  3: { x: 0, y: -450, z: -1440 },
  4: { x: 0, y: 810, z: 720 },
  5: { x: -810, y: 0, z: -1080 },
  6: { x: -900, y: 0, z: 1080 },
};

const FACES: { dots: string[] }[] = [
  { dots: ["one-1"] },
  { dots: ["two-1", "two-2"] },
  { dots: ["three-1", "three-2", "three-3"] },
  { dots: ["four-1", "four-2", "four-3", "four-4"] },
  { dots: ["five-1", "five-2", "five-3", "five-4", "five-5"] },
  { dots: ["six-1", "six-2", "six-3", "six-4", "six-5", "six-6"] },
];

const Die3D = ({ value }: Die3DProps) => {
  const [state, setState] = useState<{ value: number | null; spins: number }>({
    value,
    spins: 0,
  });

  // Adjust state during render so each roll is a SINGLE commit with a
  // guaranteed-different transform -> CSS transition fires reliably
  // in both dev and production.
  if (value !== state.value) {
    setState({
      value,
      spins: value === null ? state.spins : state.spins + 1,
    });
  }

  const shown = state.value ?? 1;
  const r = FACE_ROTATIONS[shown];
  const s = 360 * state.spins;
  const transform = `rotateX(${r.x + s}deg) rotateY(${r.y}deg) rotateZ(${r.z + s}deg)`;

  return (
    <div className="die3d-scene">
      <div className="die3d" style={{ transform }}>
        {FACES.map((face, i) => (
          <div key={i + 1} className="die3d-side">
            {face.dots.map((dot) => (
              <div key={dot} className={`die3d-dot ${dot}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Die3D;
