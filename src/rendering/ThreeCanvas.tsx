import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { SpiritFox3D } from '../companion/SpiritFox3D';

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
