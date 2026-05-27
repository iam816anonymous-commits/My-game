import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Music } from 'lucide-react';

const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

export const EchoesGame: React.FC = () => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(0);
  const { setScene, addScore } = useStore();

  const tones = [
    { id: 0, color: 'var(--color-cyan)', freq: 261.63 }, // C4
    { id: 1, color: 'var(--color-violet)', freq: 293.66 }, // D4
    { id: 2, color: 'var(--color-gold)', freq: 329.63 }, // E4
    { id: 3, color: 'var(--color-rose)', freq: 349.23 }, // F4
  ];

  const playTone = (freq: number) => {
    if (audioContext.state === 'suspended') audioContext.resume();

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioContext.currentTime);

    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + 0.5);
  };

  const startNextRound = () => {
    const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
    setSequence(nextSeq);
    setUserSequence([]);
    setRound(r => r + 1);
    playSequence(nextSeq);
  };

  const playSequence = async (seq: number[]) => {
    setIsPlaying(true);
    for (const id of seq) {
      await new Promise(r => setTimeout(r, 600));
      playTone(tones[id].freq);
    }
    setIsPlaying(false);
  };

  const handleToneClick = (id: number) => {
    if (isPlaying) return;

    playTone(tones[id].freq);
    const nextUserSeq = [...userSequence, id];
    setUserSequence(nextUserSeq);

    if (nextUserSeq[nextUserSeq.length - 1] !== sequence[nextUserSeq.length - 1]) {
      // Game Over
      addScore('echoes', round * 5);
      setScene('hub');
      return;
    }

    if (nextUserSeq.length === sequence.length) {
      setTimeout(startNextRound, 1000);
    }
  };

  useEffect(() => {
    startNextRound();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(7, 11, 24, 0.9)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '40px'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h2 className="text-premium" style={{ color: 'var(--color-violet)', fontSize: '24px', marginBottom: '8px' }}>Harmonic Echoes</h2>
        <p style={{ opacity: 0.6, fontSize: '14px' }}>Listen closely and repeat the melody.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {tones.map((tone) => (
          <motion.button
            key={tone.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToneClick(tone.id)}
            disabled={isPlaying}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '24px',
              background: 'rgba(255,255,255,0.05)',
              border: `2px solid ${tone.color}`,
              boxShadow: isPlaying && sequence[userSequence.length] === tone.id ? `0 0 30px ${tone.color}` : 'none',
              transition: 'box-shadow 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Music color={tone.color} opacity={0.5} />
          </motion.button>
        ))}
      </div>

      <div className="text-premium" style={{ fontSize: '18px', opacity: 0.8 }}>
        Round {round}
      </div>

      <button
        onClick={() => setScene('hub')}
        className="premium-button"
        style={{ padding: '12px 30px' }}
      >
        Exit
      </button>
    </motion.div>
  );
};
