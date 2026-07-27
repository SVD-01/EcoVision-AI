import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import gsap from "gsap";
import Lenis from "lenis";
import ReactConfetti from "react-confetti";
import * as THREE from "three";
import { BatteryCharging, BottleWine, Cpu, Leaf, Recycle, Trees } from "lucide-react";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let frameId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };
    frameId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

export function CursorGlow() {
  const [position, setPosition] = useState({ x: -200, y: -200 });

  useEffect(() => {
    const pointer = (event: PointerEvent) => setPosition({ x: event.clientX, y: event.clientY });
    window.addEventListener("pointermove", pointer);
    return () => window.removeEventListener("pointermove", pointer);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-50 hidden h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/12 blur-3xl lg:block"
      style={{ left: position.x, top: position.y }}
    />
  );
}

export function ParticleField({ count = 70 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 6,
        duration: Math.random() * 8 + 8,
        size: Math.random() * 3 + 1,
      })),
    [count],
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute rounded-full bg-cyan-200/70 shadow-[0_0_18px_rgba(34,211,238,0.9)]"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
            animation: `float ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function RotatingEarth() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.12;
      group.current.position.y = Math.sin(clock.elapsedTime * 0.55) * 0.12;
    }
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[2.15, 96, 96]} />
        <meshStandardMaterial color="#0f766e" emissive="#062f2a" roughness={0.72} metalness={0.18} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.175, 48, 48]} />
        <meshBasicMaterial color="#67e8f9" wireframe transparent opacity={0.18} />
      </mesh>
      <mesh rotation={[0.5, 0.2, -0.35]}>
        <torusGeometry args={[2.55, 0.012, 16, 180]} />
        <meshBasicMaterial color="#34d399" transparent opacity={0.55} />
      </mesh>
      <mesh rotation={[-0.35, 0.85, 0.8]}>
        <torusGeometry args={[2.75, 0.008, 16, 180]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function StarPoints() {
  const positions = useMemo(() => {
    const array = new Float32Array(900);
    for (let index = 0; index < array.length; index += 3) {
      array[index] = (Math.random() - 0.5) * 80;
      array[index + 1] = (Math.random() - 0.5) * 80;
      array[index + 2] = (Math.random() - 0.5) * 80;
    }
    return array;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#dffcff" size={0.07} sizeAttenuation transparent opacity={0.65} />
    </points>
  );
}

export function ThreeEarth() {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 1.6]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[4, 3, 5]} intensity={4} color="#67e8f9" />
          <pointLight position={[-3, -2, 4]} intensity={2.4} color="#34d399" />
          <StarPoints />
          <RotatingEarth />
        </Suspense>
      </Canvas>
    </div>
  );
}

export function FloatingWasteIcons() {
  const icons = [Recycle, Leaf, Cpu, BottleWine, BatteryCharging, Trees];
  const positions = [
    "left-[8%] top-[24%]",
    "left-[18%] bottom-[18%]",
    "right-[12%] top-[24%]",
    "right-[24%] bottom-[14%]",
    "left-[44%] top-[14%]",
    "right-[42%] bottom-[24%]",
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
      {icons.map((Icon, index) => (
        <motion.div
          key={positions[index]}
          className={`absolute ${positions[index]} rounded-3xl border border-white/10 bg-white/8 p-4 text-emerald-200 backdrop-blur-2xl`}
          initial={{ opacity: 0, y: 24, scale: 0.8 }}
          animate={{ opacity: 1, y: [0, -18, 0], scale: 1 }}
          transition={{ duration: 6 + index, delay: index * 0.25, repeat: Infinity, repeatType: "mirror" }}
        >
          <Icon className="h-6 w-6" />
        </motion.div>
      ))}
    </div>
  );
}

const lottieOrbData = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 180,
  h: 180,
  nm: "ecovision-orb",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "pulse-ring",
      sr: 1,
      ks: {
        o: { a: 0, k: 80 },
        r: { a: 1, k: [{ t: 0, s: [0] }, { t: 90, s: [360] }] },
        p: { a: 0, k: [90, 90, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ t: 0, s: [80, 80, 100] }, { t: 45, s: [108, 108, 100] }, { t: 90, s: [80, 80, 100] }] },
      },
      shapes: [
        { ty: "el", p: { a: 0, k: [0, 0] }, s: { a: 0, k: [120, 120] } },
        { ty: "st", c: { a: 0, k: [0.2, 0.83, 0.62, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 6 } },
        { ty: "fl", c: { a: 0, k: [0.13, 0.82, 0.93, 0.18] }, o: { a: 0, k: 28 } },
      ],
      ip: 0,
      op: 90,
      st: 0,
      bm: 0,
    },
  ],
};

export function LottieOrb() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let animation: { destroy: () => void } | null = null;
    import("lottie-web/build/player/lottie_light").then(({ default: lottie }) => {
      if (!active || !container.current) return;
      animation = lottie.loadAnimation({ container: container.current, renderer: "svg", loop: true, autoplay: true, animationData: lottieOrbData });
    });
    return () => {
      active = false;
      animation?.destroy();
    };
  }, []);

  return (
    <div className="relative h-32 w-32 opacity-90" aria-label="Animated AI illustration">
      <div className="aurora-ring absolute inset-0 rounded-full" />
      <div className="absolute inset-5 rounded-full border border-emerald-200/50 bg-emerald-300/10 backdrop-blur-xl" />
      <div className="absolute inset-12 rounded-full bg-cyan-200 shadow-[0_0_34px_rgba(34,211,238,0.8)]" />
      <div ref={container} className="absolute inset-0" />
    </div>
  );
}

export function HolographicGrid() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-64 opacity-40"
      style={{
        backgroundImage:
          "linear-gradient(rgba(52,211,153,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.14) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        maskImage: "linear-gradient(transparent, black 35%, transparent)",
        transform: "perspective(500px) rotateX(62deg)",
        transformOrigin: "bottom",
      }}
    />
  );
}

export function useGsapReveal(selector: string) {
  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        selector,
        { opacity: 0, y: 28, filter: "blur(10px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.12, duration: 0.8, ease: "power3.out" },
      );
    });
    return () => context.revert();
  }, [selector]);
}

export function ConfettiBurst({ active }: { active: boolean }) {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const resize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  if (!active) return null;
  return <ReactConfetti width={size.width} height={size.height} recycle={false} numberOfPieces={180} />;
}