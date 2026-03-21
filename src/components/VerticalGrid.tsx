import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

export const VerticalGrid: React.FC = () => {
    const frame = useCurrentFrame();
    const offset = frame * 0.5;

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#050510',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `
						linear-gradient(to right, rgba(124, 58, 237, 0.1) 1px, transparent 1px),
						linear-gradient(to bottom, rgba(124, 58, 237, 0.1) 1px, transparent 1px)
					`,
                    backgroundSize: '50px 50px',
                    // Diagonal movement for dynamism
                    transform: `translateY(${offset % 50}px) translateX(${offset % 50 * 0.2}px)`,
                }}
            />
            {/* Vignette */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background:
                        'radial-gradient(circle at center, transparent 0%, #050510 90%)',
                }}
            />
        </AbsoluteFill>
    );
};
