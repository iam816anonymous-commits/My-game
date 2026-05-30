import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiceProps {
    value: number;
    isRolling: boolean;
    onRoll: () => void;
    disabled: boolean;
}

const Dice: React.FC<DiceProps> = ({ value, isRolling, onRoll, disabled }) => {
    return (
        <motion.button
            whileTap={!disabled ? { scale: 0.9, rotate: 10 } : {}}
            whileHover={!disabled ? { scale: 1.05 } : {}}
            disabled={disabled}
            onClick={onRoll}
            className={`relative w-24 h-24 rounded-3xl border-2 flex items-center justify-center transition-all duration-300
                ${disabled
                    ? 'bg-white/5 border-white/5 cursor-not-allowed opacity-40'
                    : 'bg-accent-gold border-accent-gold shadow-[0_0_30px_rgba(250,204,21,0.3)] cursor-pointer'
                }`}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={value + (isRolling ? 'rolling' : 'static')}
                    initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                    className={`text-4xl font-black italic ${disabled ? 'text-white/20' : 'text-black'} ${isRolling ? 'animate-pulse' : ''}`}
                >
                    {isRolling ? '?' : value || '6'}
                </motion.div>
            </AnimatePresence>

            {/* Decorative corners */}
            {!disabled && (
                <>
                    <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-black/20 rounded-full" />
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-black/20 rounded-full" />
                    <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-black/20 rounded-full" />
                    <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-black/20 rounded-full" />
                </>
            )}
        </motion.button>
    );
};

export default Dice;
