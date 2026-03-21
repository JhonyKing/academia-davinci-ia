import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface GlowingTextProps {
    text: string;
    fontSize?: number;
    color?: string;
    glowColor?: string;
    delay?: number;
}

export const GlowingText: React.FC<GlowingTextProps> = ({
    text,
    fontSize = 60,
    color = '#ffffff',
    glowColor = '#7C3AED',
    delay = 0,
}) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const blur = interpolate(frame - delay, [0, 10], [10, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <h1
            style={{
                fontFamily: 'sans-serif',
                fontWeight: 'bold',
                fontSize,
                color,
                textShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor}`,
                opacity,
                filter: `blur(${blur}px)`,
                margin: 0,
                textAlign: 'center',
                letterSpacing: '2px',
            }}
        >
            {text}
        </h1>
    );
};
