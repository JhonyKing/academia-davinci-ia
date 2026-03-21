import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, Img, staticFile } from 'remotion';
import { GlowingText } from '../components/GlowingText';

// Warm background grid
const WarmGrid: React.FC = () => {
    const frame = useCurrentFrame();
    const offset = frame * 0.5;

    return (
        <AbsoluteFill style={{ backgroundColor: '#1a1308', overflow: 'hidden' }}>
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
                    transform: `translateY(${offset % 50}px)`,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at center, transparent 0%, #1a1308 95%)',
                }}
            />
        </AbsoluteFill>
    );
};

// Photos data
const FOTOS = [
    'Foto_Inteligencia_Artificial.jpg',
    'Foto_decoracion_globos.jpg',
    'Foto_dibujo.jpg',
    'Foto_guitarra_kids.jpg',
    'Foto_lettering.jpg',
    'Foto_maquuillaje.jpg',
    'Foto_violin.jpg',
];

const TALLERES = [
    'Taller_Dibujo.jpg',
    'Taller_amigurumi_crochet.jpg',
    'Taller_canto.jpg',
    'Taller_creacion_piñatas.jpg',
    'Taller_decoracion_globos.jpg',
    'Taller_dibujo_kids.jpg',
    'Taller_guitarra.jpg',
    'Taller_guitarra_kids.jpg',
    'Taller_juegos_mentales.jpg',
    'Taller_lettering.jpg',
    'Taller_marketing_con_Inteligencia_Artificial.jpg',
    'Taller_pintura.jpg',
    'Taller_super_kids.jpg',
    'Taller_teclado.jpg',
    'Taller_violin.jpg',
];

// Extract taller name from filename
const getTallerName = (filename: string) => {
    return filename
        .replace('Taller_', '')
        .replace('.jpg', '')
        .replace(/_/g, ' ')
        .toUpperCase();
};

// Quick photo component with zoom
const QuickPhoto: React.FC<{ src: string; delay: number }> = ({ src, delay }) => {
    const frame = useCurrentFrame();
    const localFrame = frame - delay;

    const scale = interpolate(localFrame, [0, 15], [1.2, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const opacity = interpolate(localFrame, [0, 2], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div
                style={{
                    width: '85%',
                    height: '75%',
                    borderRadius: 30,
                    overflow: 'hidden',
                    border: '4px solid #FFD700',
                    boxShadow: '0 0 40px rgba(255, 215, 0, 0.5)',
                }}
            >
                <Img
                    src={staticFile(`assets/cuarto_amarillo/${src}`)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: `scale(${scale})`,
                        opacity,
                    }}
                />
            </div>
        </AbsoluteFill>
    );
};

// Taller card with name overlay
const TallerCard: React.FC<{ src: string; delay: number }> = ({ src, delay }) => {
    const frame = useCurrentFrame();
    const localFrame = frame - delay;

    const scale = interpolate(localFrame, [0, 10], [0.9, 1.1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const opacity = interpolate(localFrame, [0, 2], [0, 1]);

    const tallerName = getTallerName(src);

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div
                style={{
                    position: 'relative',
                    width: '80%',
                    height: '70%',
                    borderRadius: 25,
                    overflow: 'hidden',
                    border: '3px solid #FF8C00',
                    boxShadow: '0 0 30px rgba(255, 140, 0, 0.4)',
                }}
            >
                <Img
                    src={staticFile(`assets/cuarto_amarillo/${src}`)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: `scale(${scale})`,
                        opacity,
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                        padding: '40px 20px 20px',
                    }}
                >
                    <h2
                        style={{
                            color: '#FFD700',
                            fontSize: 45,
                            fontFamily: 'sans-serif',
                            fontWeight: 'bold',
                            margin: 0,
                            textAlign: 'center',
                            textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                        }}
                    >
                        {tallerName}
                    </h2>
                </div>
            </div>
        </AbsoluteFill>
    );
};

export const PromoCuartoAmarilloGaleria: React.FC = () => {
    const frame = useCurrentFrame();

    // Timing:
    // Intro: 0-60 (2s)
    // Fotos: 60-270 (7 photos × 30 frames = 210 frames = 7s)
    // Talleres: 270-495 (15 talleres × 15 frames = 225 frames = 7.5s)
    // Outro: 495-600 (3.5s)
    // Total: 600 frames = 20s

    return (
        <AbsoluteFill style={{ backgroundColor: '#1a1308' }}>
            <WarmGrid />

            {/* INTRO (0-2s) */}
            <Sequence from={0} durationInFrames={60}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div
                        style={{
                            width: 400,
                            height: 400,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '10px solid #FFD700',
                            boxShadow: '0 0 50px rgba(255, 215, 0, 0.7)',
                            marginBottom: 50,
                            opacity: interpolate(frame, [0, 15], [0, 1]),
                            transform: `scale(${interpolate(frame, [0, 40], [0.5, 1.1])})`,
                        }}
                    >
                        <Img
                            src={staticFile('assets/cuarto_amarillo/logo.jpg')}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    <GlowingText
                        text="NUESTROS TALLERES"
                        fontSize={90}
                        color="#FFD700"
                        glowColor="#FF8C00"
                    />
                </AbsoluteFill>
            </Sequence>

            {/* FOTOS (2-9s) - 30 frames each */}
            {FOTOS.map((foto, i) => (
                <Sequence key={foto} from={60 + i * 30} durationInFrames={30}>
                    <QuickPhoto src={foto} delay={0} />
                </Sequence>
            ))}

            {/* TALLERES (9-16.5s) - 15 frames each */}
            {TALLERES.map((taller, i) => (
                <Sequence key={taller} from={270 + i * 15} durationInFrames={15}>
                    <TallerCard src={taller} delay={0} />
                </Sequence>
            ))}

            {/* OUTRO (16.5-20s) */}
            <Sequence from={495} durationInFrames={105}>
                <AbsoluteFill
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'linear-gradient(to bottom, #1a1308 0%, #2a1f0f 100%)',
                        transform: `scale(${interpolate(frame - 495, [0, 70], [0.9, 1.1])})`,
                    }}
                >
                    <div
                        style={{
                            width: 250,
                            height: 250,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            marginBottom: 50,
                            border: '6px solid #FFD700',
                            boxShadow: '0 0 40px rgba(255, 215, 0, 0.6)',
                        }}
                    >
                        <Img
                            src={staticFile('assets/cuarto_amarillo/logo.jpg')}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    <h1
                        style={{
                            color: '#FFD700',
                            fontSize: 100,
                            fontFamily: 'sans-serif',
                            fontWeight: 'bold',
                            margin: 0,
                            textAlign: 'center',
                            textShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
                        }}
                    >
                        ¡INSCRÍBETE!
                    </h1>

                    <div
                        style={{
                            marginTop: 40,
                            background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                            padding: '30px 90px',
                            borderRadius: 25,
                            border: '4px solid white',
                        }}
                    >
                        <h2
                            style={{
                                color: '#1a1308',
                                fontFamily: 'sans-serif',
                                fontSize: 55,
                                margin: 0,
                                fontWeight: 'bold',
                            }}
                        >
                            @elcuartoamarillonld
                        </h2>
                    </div>
                </AbsoluteFill>
                <AbsoluteFill
                    style={{
                        backgroundColor: 'black',
                        opacity: interpolate(frame - 495, [95, 105], [0, 1], {
                            extrapolateLeft: 'clamp',
                        }),
                    }}
                />
            </Sequence>
        </AbsoluteFill>
    );
};
