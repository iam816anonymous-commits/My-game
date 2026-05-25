import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { SpiritFox3D } from '../companion/SpiritFox3D';
import { Html } from '@react-three/drei';
import { useStore } from '../store/useStore';
import { useState, useEffect } from 'react';

const DialogueBubble = () => {
  const [msg, setMsg] = useState("");
  const emotion = useStore(state => state.companion.emotion);
  const age = useStore(state => state.world.age);

  useEffect(() => {
    const lines = [
      "The void feels warmer today.",
      "Do you remember the first light?",
      "Every shard tells a story...",
      "We are the architects of this dream.",
      "Sol " + age + " feels significant.",
      "I feel " + emotion + " in your presence.",
    ];
    setMsg(lines[Math.floor(Math.random() * lines.length)]);
    const timer = setInterval(() => {
      setMsg(lines[Math.floor(Math.random() * lines.length)]);
    }, 10000);
    return () => clearInterval(timer);
  }, [emotion, age]);

  return (
    <Html position={[0, 1.5, 0]} center>
      <div style={{
        padding: '12px 20px',
        background: 'rgba(7, 11, 24, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'white',
        fontSize: '11px',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        opacity: 0.8,
        letterSpacing: '1px',
        textTransform: 'uppercase'
      }}>
        {msg}
      </div>
    </Html>
  );
};

export const ThreeCanvas = () => {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 50
    }}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        <SpiritFox3D />
        <DialogueBubble />

        <EffectComposer>
          <Bloom
            luminanceThreshold={1}
            mipmapBlur
            intensity={1.5}
            radius={0.4}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
