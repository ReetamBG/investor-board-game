import { useEffect, useRef, useState } from "react";
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
  const shown = value ?? 1;
  const [spins, setSpins] = useState(0);
  const prevValue = useRef(value);

  // Extra full turns so consecutive equal rolls still animate
  useEffect(() => {
    if (value !== null && value !== prevValue.current) {
      setSpins((s) => s + 1);
    }
    prevValue.current = value;
  }, [value]);

  const r = FACE_ROTATIONS[shown];
  const transform = `rotateX(${r.x + 360 * spins}deg) rotateY(${r.y}deg) rotateZ(${r.z + 360 * spins}deg)`;

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
