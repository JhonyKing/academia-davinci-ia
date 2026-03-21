import React, { ReactNode } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface CardProps {
    title: string;
    icon: ReactNode;
    delay?: number;
}

export const Card: React.FC<CardProps> = ({ title, icon, delay = 0 }) => {
    const frame = useCurrentFrame();


    // Animate over 0.5s (approx 15 frames)
    const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const translateY = interpolate(frame - delay, [0, 15], [50, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: 250,
                height: 300,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: 20,
                border: '1px solid rgba(124, 58, 237, 0.3)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                opacity,
                transform: `translateY(${translateY}px)`,
                margin: '0 20px',
            }}
        >
            <div style={{ marginBottom: 20, color: '#22D3EE' }}>
                {icon}
            </div>
            <h3
                style={{
                    color: 'white',
                    fontFamily: 'sans-serif',
                    fontSize: 24,
                    margin: 0,
                    fontWeight: 300,
                }}
            >
                {title}
            </h3>
        </div>
    );
};
