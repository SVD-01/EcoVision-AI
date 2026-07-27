import { useEffect, useState } from "react";

export function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const frames = Math.max(1, Math.round(duration / 16));
    const tick = () => {
      frame += 1;
      const progress = 1 - Math.pow(1 - frame / frames, 3);
      setValue(Math.round(target * Math.min(progress, 1)));
      if (frame < frames) requestAnimationFrame(tick);
    };
    tick();
  }, [duration, target]);

  return value;
}