import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from 'remotion';
import { VerticalGrid } from '../components/VerticalGrid';
import { SimpleParticles } from '../components/SimpleParticles';
import { GlowingText } from '../components/GlowingText';
import { ProgressBar } from '../components/ProgressBar';
import { ScannerPulse } from '../components/ScannerPulse';

// Custom component for "El Cuarto Amarillo" branding
const YellowOverlay = () => {
    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, transparent 100%)',
            mixBlendMode: 'overlay',
            pointerEvents: 'none'
        }} />
    );
};

export const PromoCuartoAmarillo: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    return (
        <AbsoluteFill style={{ backgroundColor: '#050510' }}>

            {/* Global Background Elements */}
            <VerticalGrid />
            <SimpleParticles />
            <YellowOverlay />

            {/* SCENE 1 (0-3s): Intro / Logo */}
            <Sequence from={0} durationInFrames={90}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '8px solid #FFD700',
                        boxShadow: '0 0 40px rgba(255, 215, 0, 0.5)',
                        marginBottom: 40,
                        opacity: interpolate(frame, [0, 20], [0, 1])
                    }}>
                        <Img
                            src={staticFile('assets/cuarto_amarillo/logo.jpg')}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                // Fallback if logo fails
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                        {/* Fallback Text if image fails or just as overlay */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: '#FFD700',
                            color: 'black',
                            fontWeight: 'bold',
                            fontSize: 40,
                            zIndex: -1
                        }}>
                            ECA
                        </div>
                    </div>

                    <GlowingText text="EL CUARTO" fontSize={80} color="#FFD700" glowColor="#FFA500" />
                    <GlowingText text="AMARILLO" fontSize={80} color="#FFFFFF" glowColor="#FFD700" delay={10} />
                </AbsoluteFill>
            </Sequence>

            {/* SCENE 2 (3-6s): Concepto */}
            <Sequence from={90} durationInFrames={90}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <ScannerPulse />
                    <GlowingText text="TU ESPACIO" fontSize={70} color="#ffffff" glowColor="#FFD700" />
                    <h3 style={{ color: '#FFD700', fontFamily: 'sans-serif', marginTop: 20, fontSize: 40, fontWeight: 300, textAlign: 'center' }}>
                        CREATIVO & VISUAL
                    </h3>
                </AbsoluteFill>
            </Sequence>

            {/* SCENE 3 (6-9s): Servicios */}
            <Sequence from={180} durationInFrames={90}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 60 }}>
                        {['FOTOGRAFÍA', 'DISEÑO', 'BRANDING'].map((item, i) => (
                            <div key={i} style={{
                                background: 'rgba(255, 215, 0, 0.1)',
                                padding: '20px 60px',
                                borderRadius: 20,
                                border: '2px solid #FFD700',
                                color: 'white',
                                fontFamily: 'sans-serif',
                                fontSize: 50,
                                textAlign: 'center',
                                transform: `translateX(${interpolate(frame - 180 - (i * 10), [0, 20], [-100, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
                                opacity: interpolate(frame - 180 - (i * 10), [0, 20], [0, 1])
                            }}>
                                {item}
                            </div>
                        ))}
                    </div>
                </AbsoluteFill>
            </Sequence>

            {/* SCENE 4 (9-12s): Showcasing */}
            <Sequence from={270} durationInFrames={90}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{
                        width: '80%',
                        height: '60%',
                        border: '4px solid #FFD700',
                        borderRadius: 30,
                        overflow: 'hidden',
                        boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
                        transform: `rotate(${Math.sin(frame / 20) * 2}deg)`
                    }}>
                        <Img
                            src={staticFile('assets/cuarto_amarillo/image1.jpg')}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transform: `scale(${interpolate(frame - 270, [0, 90], [1, 1.1])})`
                            }}
                        />
                    </div>
                    <h2 style={{
                        position: 'absolute',
                        bottom: 100,
                        background: '#FFD700',
                        color: 'black',
                        padding: '10px 40px',
                        borderRadius: 10,
                        fontSize: 40,
                        fontFamily: 'sans-serif',
                        fontWeight: 'bold'
                    }}>
                        CALIDAD PREMIUM
                    </h2>
                </AbsoluteFill>
            </Sequence>

            {/* SCENE 5 (12-15s): Detail / Art */}
            <Sequence from={360} durationInFrames={90}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    {/* Reuse Image 1 with filter or Image 2 if available */}
                    <Img
                        src={staticFile('assets/cuarto_amarillo/image1.jpg')}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: 0.3,
                            filter: 'grayscale(50%)'
                        }}
                    />
                    <GlowingText text="INNOVACIÓN" fontSize={90} color="#ffffff" glowColor="#FFD700" />
                    <GlowingText text="EN CADA PIXEL" fontSize={60} color="#FFD700" delay={10} />
                </AbsoluteFill>
            </Sequence>

            {/* SCENE 6 (15-18s): Intro / Outro */}
            <Sequence from={450} durationInFrames={90}>
                <AbsoluteFill style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(to bottom, #050510 0%, #1a1a2e 100%)'
                }}>
                    <div style={{
                        width: 200, height: 200,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        marginBottom: 40,
                        border: '4px solid white'
                    }}>
                        <Img
                            src={staticFile('assets/cuarto_amarillo/logo.jpg')}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    <h1 style={{
                        color: 'white',
                        fontSize: 80,
                        fontFamily: 'sans-serif',
                        margin: 0,
                        textAlign: 'center'
                    }}>
                        SÍGUENOS
                    </h1>
                    <h2 style={{ color: '#FFD700', fontFamily: 'sans-serif', fontSize: 40, marginTop: 20 }}>
                        @elcuartoamarillonld
                    </h2>

                    <div style={{ marginTop: 50 }}>
                        <ProgressBar durationInFrames={90} />
                    </div>
                </AbsoluteFill>
                <AbsoluteFill style={{
                    backgroundColor: 'black',
                    opacity: interpolate(frame - 450, [80, 90], [0, 1], { extrapolateLeft: 'clamp' })
                }} />
            </Sequence>

        </AbsoluteFill>
    );
};
