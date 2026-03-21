import React, { useMemo } from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';

export const SimpleParticles: React.FC = () => {
    const frame = useCurrentFrame();

    const particles = useMemo(() => {
        return new Array(30).fill(0).map((_, i) => {
            const x = random(`x-${i}`) * 100;
            const y = random(`y-${i}`) * 100;
            const size = random(`size-${i}`) * 3 + 1;
            const speed = random(`speed-${i}`) * 0.5 + 0.1;
            return { x, y, size, speed, key: i };
        });
    }, []);

    return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
            {particles.map((p) => {
                const yPos = (p.y + frame * p.speed) % 100;
                return (
                    <div
                        key={p.key}
                        style={{
                            position: 'absolute',
                            left: `${p.x}%`,
                            top: `${yPos}%`,
                            width: p.size,
                            height: p.size,
                            borderRadius: '50%',
                            backgroundColor: '#22D3EE',
                            opacity: 0.4,
                            boxShadow: '0 0 4px #22D3EE',
                        }}
                    />
                );
            })}
        </AbsoluteFill>
    );
};
