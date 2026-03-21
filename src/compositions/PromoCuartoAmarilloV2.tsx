import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, Img, staticFile } from 'remotion';
import { GlowingText } from '../components/GlowingText';
import { ProgressBar } from '../components/ProgressBar';
import { ScannerPulse } from '../components/ScannerPulse';

// Warm background grid for yellow/orange branding
const WarmGrid: React.FC = () => {
    const frame = useCurrentFrame();
    const offset = frame * 0.5;

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#1a1308',
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
						linear-gradient(to right, rgba(255, 140, 0, 0.15) 1px, transparent 1px),
						linear-gradient(to bottom, rgba(255, 140, 0, 0.15) 1px, transparent 1px)
					`,
                    backgroundSize: '50px 50px',
                    transform: `translateY(${offset % 50}px) translateX(${offset % 50 * 0.2}px)`,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background:
                        'radial-gradient(circle at center, transparent 0%, #1a1308 95%)',
                }}
            />
        </AbsoluteFill>
    );
};

// Warm particles
const WarmParticles: React.FC = () => {
    const frame = useCurrentFrame();

    const particles = React.useMemo(() => {
        return new Array(25).fill(0).map((_, i) => {
            const x = (Math.random() * 100);
            const y = (Math.random() * 100);
            const size = Math.random() * 4 + 2;
            const speed = Math.random() * 0.6 + 0.2;
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
                            backgroundColor: '#FF8C00',
                            opacity: 0.5,
                            boxShadow: '0 0 6px #FF8C00',
                        }}
                    />
                );
            })}
        </AbsoluteFill>
    );
};

export const PromoCuartoAmarilloV2: React.FC = () => {
    const frame = useCurrentFrame();

    return (
        <AbsoluteFill style={{ backgroundColor: '#1a1308' }}>

            <WarmGrid />
            <WarmParticles />

            {/* SCENE 1 (0-3s): Intro / Logo con ZOOM IN */}
            <Sequence from={0} durationInFrames={90}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{
                        width: 450,
                        height: 450,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '10px solid #FFD700',
                        boxShadow: '0 0 50px rgba(255, 215, 0, 0.7), 0 0 100px rgba(255, 140, 0, 0.4)',
                        marginBottom: 60,
                        opacity: interpolate(frame, [0, 20], [0, 1]),
                        transform: `scale(${interpolate(frame, [0, 60], [0.5, 1.1], { extrapolateRight: 'clamp' })})`
                    }}>
                        <Img
                            src={staticFile('assets/cuarto_amarillo/logo.jpg')}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    <GlowingText text="EL CUARTO" fontSize={100} color="#FFD700" glowColor="#FF8C00" />
                    <GlowingText text="AMARILLO" fontSize={100} color="#FFFFFF" glowColor="#FFD700" delay={10} />

                    <h3 style={{
                        color: '#FF8C00',
                        fontFamily: 'sans-serif',
                        fontSize: 45,
                        marginTop: 30,
                        opacity: interpolate(frame, [30, 50], [0, 1])
                    }}>
                        NUEVO LAREDO
                    </h3>
                </AbsoluteFill>
            </Sequence>

            {/* SCENE 2 (3-6s): Concepto con ZOOM OUT */}
            <Sequence from={90} durationInFrames={90}>
                <AbsoluteFill style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: `scale(${interpolate(frame - 90, [0, 90], [1.3, 1], { extrapolateRight: 'clamp' })})`
                }}>
                    <ScannerPulse />
                    <GlowingText text="TALLERES" fontSize={90} color="#ffffff" glowColor="#FFD700" />
                    <GlowingText text="CREATIVOS" fontSize={90} color="#FFD700" glowColor="#FF8C00" delay={10} />
                    <h3 style={{
                        color: '#FF8C00',
                        fontFamily: 'sans-serif',
                        marginTop: 40,
                        fontSize: 50,
                        fontWeight: 300,
                        textAlign: 'center',
                        opacity: interpolate(frame - 90, [20, 40], [0, 1])
                    }}>
                        PINTURA • MÚSICA • FOTOGRAFÍA
                    </h3>
                </AbsoluteFill>
            </Sequence>

            {/* SCENE 3 (6-9s): Servicios con botones GRANDES y ZOOM */}
            <Sequence from={180} durationInFrames={90}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 70 }}>
                        {['ENMARCADO', 'ARTE', 'DISEÑO'].map((item, i) => (
                            <div key={i} style={{
                                background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                                padding: '35px 100px',
                                borderRadius: 30,
                                border: '4px solid #FFFFFF',
                                color: '#1a1308',
                                fontFamily: 'sans-serif',
                                fontSize: 65,
                                fontWeight: 'bold',
                                textAlign: 'center',
                                boxShadow: '0 10px 40px rgba(255, 215, 0, 0.5)',
                                transform: `translateX(${interpolate(frame - 180 - (i * 10), [0, 20], [-150, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px) scale(${interpolate(frame - 180 - (i * 10), [0, 30], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
                                opacity: interpolate(frame - 180 - (i * 10), [0, 20], [0, 1])
                            }}>
                                {item}
                            </div>
                        ))}
                    </div>
                </AbsoluteFill>
            </Sequence>

            {/* SCENE 4 (9-12s): Imagen Workshop con ZOOM IN lento */}
            <Sequence from={270} durationInFrames={90}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{
                        width: '85%',
                        height: '70%',
                        border: '6px solid #FFD700',
                        borderRadius: 40,
                        overflow: 'hidden',
                        boxShadow: '0 0 40px rgba(255, 215, 0, 0.5), 0 0 80px rgba(255, 140, 0, 0.3)',
                    }}>
                        <Img
                            src={staticFile('assets/cuarto_amarillo/workshop.png')}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transform: `scale(${interpolate(frame - 270, [0, 90], [1, 1.2])})`
                            }}
                        />
                    </div>
                    <h2 style={{
                        position: 'absolute',
                        bottom: 120,
                        background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                        color: '#1a1308',
                        padding: '25px 80px',
                        borderRadius: 20,
                        fontSize: 60,
                        fontFamily: 'sans-serif',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        transform: `scale(${interpolate(frame - 270, [40, 70], [0.9, 1.1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`
                    }}>
                        ESPACIO CREATIVO
                    </h2>
                </AbsoluteFill>
            </Sequence>

            {/* SCENE 5 (12-15s): Imagen Art con ZOOM OUT */}
            <Sequence from={360} durationInFrames={90}>
                <AbsoluteFill style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: `scale(${interpolate(frame - 360, [0, 90], [1.4, 1])})`
                }}>
                    <Img
                        src={staticFile('assets/cuarto_amarillo/art.png')}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: 0.4,
                            filter: 'brightness(0.7)'
                        }}
                    />
                    <div style={{
                        background: 'rgba(26, 19, 8, 0.7)',
                        padding: '60px 80px',
                        borderRadius: 40,
                        border: '4px solid #FFD700',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <GlowingText text="100% HECHO" fontSize={80} color="#ffffff" glowColor="#FFD700" />
                        <GlowingText text="A MANO" fontSize={100} color="#FFD700" delay={10} />
                    </div>
                </AbsoluteFill>
            </Sequence>

            {/* SCENE 6 (15-18s): CTA con ZOOM IN final */}
            <Sequence from={450} durationInFrames={90}>
                <AbsoluteFill style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(to bottom, #1a1308 0%, #2a1f0f 100%)',
                    transform: `scale(${interpolate(frame - 450, [0, 70], [0.9, 1.1], { extrapolateRight: 'clamp' })})`
                }}>
                    <div style={{
                        width: 250,
                        height: 250,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        marginBottom: 50,
                        border: '6px solid #FFD700',
                        boxShadow: '0 0 40px rgba(255, 215, 0, 0.6)'
                    }}>
                        <Img
                            src={staticFile('assets/cuarto_amarillo/logo.jpg')}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    <h1 style={{
                        color: '#FFD700',
                        fontSize: 110,
                        fontFamily: 'sans-serif',
                        fontWeight: 'bold',
                        margin: 0,
                        textAlign: 'center',
                        textShadow: '0 0 30px rgba(255, 215, 0, 0.8)'
                    }}>
                        VISÍTANOS
                    </h1>

                    <div style={{
                        marginTop: 40,
                        background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                        padding: '30px 90px',
                        borderRadius: 25,
                        border: '4px solid white'
                    }}>
                        <h2 style={{
                            color: '#1a1308',
                            fontFamily: 'sans-serif',
                            fontSize: 55,
                            margin: 0,
                            fontWeight: 'bold'
                        }}>
                            @elcuartoamarillonld
                        </h2>
                    </div>

                    <div style={{ marginTop: 60, width: '60%' }}>
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
