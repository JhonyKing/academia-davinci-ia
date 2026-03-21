import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const ScannerPulse: React.FC = () => {
    const frame = useCurrentFrame();

    // Multiple rings
    const rings = [0, 15, 30];

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            {rings.map((delay, i) => {
                const age = frame - delay;
                // Loop every 60 frames
                const loopAge = age % 60;

                const scale = interpolate(loopAge, [0, 60], [0.5, 2], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp'
                });

                const opacity = interpolate(loopAge, [0, 50, 60], [0.8, 0, 0], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp'
                });

                if (age < 0) return null;

                return (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            width: '400px',
                            height: '400px',
                            borderRadius: '50%',
                            border: '4px solid #22D3EE',
                            transform: `scale(${scale})`,
                            opacity,
                            boxShadow: '0 0 20px rgba(34, 211, 238, 0.5)'
                        }}
                    />
                );
            })}
            {/* Crosshair lines */}
            <div style={{ position: 'absolute', width: '100%', height: '2px', background: 'rgba(34, 211, 238, 0.2)' }} />
            <div style={{ position: 'absolute', width: '2px', height: '100%', background: 'rgba(34, 211, 238, 0.2)' }} />
        </AbsoluteFill>
    );
};
