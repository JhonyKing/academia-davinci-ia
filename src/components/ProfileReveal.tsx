import React from 'react';
import { Img, interpolate, staticFile, useCurrentFrame } from 'remotion';

export const ProfileReveal: React.FC = () => {
    const frame = useCurrentFrame();

    // Wipe effect using clip-path
    const progress = interpolate(frame, [0, 20], [0, 100], {
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
            }}
        >
            <div style={{
                position: 'relative',
                width: 300,
                height: 300,
                marginBottom: 40,
            }}>
                {/* Glow ring */}
                <div style={{
                    position: 'absolute',
                    inset: -10,
                    borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, #7C3AED, #22D3EE, #7C3AED)',
                    filter: 'blur(20px)',
                    opacity: 0.6,
                    zIndex: -1
                }} />

                <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '4px solid #22D3EE',
                    clipPath: `circle(${progress}% at 50% 50%)`,
                }}>
                    <Img
                        src={staticFile('assets/profile.png')}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                </div>
            </div>

            <h1 style={{
                color: 'white',
                fontFamily: 'sans-serif',
                fontSize: 60,
                fontWeight: 'bold',
                margin: 0,
                opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp' }),
                transform: `translateY(${interpolate(frame, [10, 30], [20, 0], { extrapolateRight: 'clamp' })}px)`
            }}>
                LOOMIN LAB
            </h1>
            <h2 style={{
                color: '#cccccc',
                fontFamily: 'sans-serif',
                fontSize: 24,
                fontWeight: 'normal',
                margin: '10px 0 0 0',
                opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' }),
            }}>
                Video con IA • Agentes • Automatización
            </h2>

        </div>
    );
};
