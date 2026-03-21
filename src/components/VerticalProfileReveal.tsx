import React from 'react';
import { Img, interpolate, staticFile, useCurrentFrame } from 'remotion';

export const VerticalProfileReveal: React.FC = () => {
    const frame = useCurrentFrame();

    const scale = interpolate(frame, [0, 20], [0.8, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: (t) => t * (2 - t) // easeOutQuad
    });

    const opacity = interpolate(frame, [0, 10], [0, 1]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${scale})`,
                opacity
            }}
        >
            {/* Picture Container */}
            <div style={{
                position: 'relative',
                width: 400,
                height: 400,
                marginBottom: 60,
            }}>
                {/* Glow */}
                <div style={{
                    position: 'absolute',
                    inset: -20,
                    borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, #7C3AED, #22D3EE, #7C3AED)',
                    filter: 'blur(30px)',
                    opacity: 0.8,
                    zIndex: -1,
                    animation: 'spin 4s linear infinite' // Note: CSS animation might not sync perfectly with Remotion frame, but good for visual
                }} />

                <Img
                    src={staticFile('assets/profile.png')}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '6px solid white',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }}
                />

                {/* Logo Overlay Badge */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 120,
                    height: 120,
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    padding: 10,
                    boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Img
                        src={staticFile('assets/logoloomin.jpg')}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            borderRadius: '50%'
                        }}
                    />
                </div>
            </div>

            <h1 style={{
                color: 'white',
                fontFamily: 'sans-serif',
                fontSize: 80,
                fontWeight: '900',
                margin: 0,
                textShadow: '0 0 20px rgba(124, 58, 237, 0.8)',
                textAlign: 'center',
                lineHeight: 1
            }}>
                LOOMIN LAB
            </h1>
            <h2 style={{
                color: '#22D3EE',
                fontFamily: 'sans-serif',
                fontSize: 40,
                fontWeight: 'lighter',
                margin: '20px 0 0 0',
                letterSpacing: '4px',
                textAlign: 'center'
            }}>
                AGENCIA MULTIMEDIA
            </h2>

        </div>
    );
};
