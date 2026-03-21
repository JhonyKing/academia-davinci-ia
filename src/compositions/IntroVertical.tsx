import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig, Audio, staticFile, Img } from 'remotion';
import { VerticalGrid } from '../components/VerticalGrid';
import { SimpleParticles } from '../components/SimpleParticles';
import { GlowingText } from '../components/GlowingText';
import { ProgressBar } from '../components/ProgressBar';
import { Card } from '../components/Card';
import { ScannerPulse } from '../components/ScannerPulse';
import { DataStreamVertical } from '../components/DataStreamVertical';
import { VerticalProfileReveal } from '../components/VerticalProfileReveal';

const VideoIcon = () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);
const ImageIcon = () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);
const AudioIcon = () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
    </svg>
);

export const IntroVertical: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    return (
        <AbsoluteFill style={{ backgroundColor: '#050510' }}>
            <Audio src={staticFile('audio/intro.wav')} volume={0.8} />

            <Sequence from={85}>
                <Audio src={staticFile('audio/whoosh.wav')} volume={0.5} />
            </Sequence>
            <Sequence from={175}>
                <Audio src={staticFile('audio/whoosh.wav')} volume={0.5} />
            </Sequence>
            <Sequence from={265}>
                <Audio src={staticFile('audio/whoosh.wav')} volume={0.5} />
            </Sequence>
            <Sequence from={355}>
                <Audio src={staticFile('audio/whoosh.wav')} volume={0.6} />
            </Sequence>
            <Sequence from={445}>
                <Audio src={staticFile('audio/whoosh.wav')} volume={0.5} />
            </Sequence>

            <VerticalGrid />
            <SimpleParticles />

            <Sequence from={0} durationInFrames={90}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Audio src={staticFile('audio/click.wav')} startFrom={0} endAt={10} volume={0.8} />
                    <GlowingText text="INICIANDO SISTEMA..." fontSize={50} color="#ffffff" glowColor="#22D3EE" />
                    <ProgressBar durationInFrames={60} />
                </AbsoluteFill>
            </Sequence>

            <Sequence from={90} durationInFrames={90}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <ScannerPulse />
                    <div style={{ zIndex: 10, textAlign: 'center' }}>
                        <GlowingText text="CONTENIDO CON IA" fontSize={80} delay={0} />
                        <h3 style={{ color: '#cccccc', fontFamily: 'sans-serif', marginTop: 20, fontSize: 30, fontWeight: 300 }}>
                            para marcas que quieren crecer
                        </h3>
                    </div>
                </AbsoluteFill>
            </Sequence>

            <Sequence from={180} durationInFrames={90}>
                <AbsoluteFill style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 30
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                        <Card title="Video" icon={<VideoIcon />} delay={0} />
                        <Card title="Imagen" icon={<ImageIcon />} delay={5} />
                        <Card title="Audio" icon={<AudioIcon />} delay={10} />
                    </div>
                    <h3 style={{ color: '#22D3EE', fontFamily: 'sans-serif', fontSize: 24, marginTop: 40 }}>
                        Producción rápida y consistente
                    </h3>
                </AbsoluteFill>
            </Sequence>

            <Sequence from={270} durationInFrames={90}>
                <DataStreamVertical />
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <GlowingText text="LISTO PARA" fontSize={60} delay={0} color="#cccccc" />
                    <GlowingText text="E-COMMERCE" fontSize={90} delay={10} color="#ffffff" glowColor="#7C3AED" />
                    <div style={{ marginTop: 40, display: 'flex', gap: 20 }}>
                        {['anuncios', 'catálogos', 'redes'].map((t, i) => (
                            <span key={i} style={{
                                color: '#22D3EE',
                                fontFamily: 'monospace',
                                fontSize: 30,
                                border: '1px solid #22D3EE',
                                padding: '5px 15px',
                                borderRadius: 5
                            }}>
                                {t.toUpperCase()}
                            </span>
                        ))}
                    </div>
                </AbsoluteFill>
            </Sequence>

            <Sequence from={360} durationInFrames={90}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <VerticalProfileReveal />
                </AbsoluteFill>
            </Sequence>

            <Sequence from={450} durationInFrames={90}>
                <AbsoluteFill style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(to bottom, #050510 0%, #1a1a2e 100%)'
                }}>
                    <Img
                        src={staticFile('assets/logoloomin.jpg')}
                        style={{
                            width: 150,
                            borderRadius: '50%',
                            marginBottom: 40,
                            boxShadow: '0 0 20px rgba(255,255,255,0.2)'
                        }}
                    />
                    <h1 style={{
                        color: 'white',
                        fontSize: 100,
                        fontFamily: 'sans-serif',
                        fontWeight: 'bold',
                        margin: 0,
                        transform: `scale(${spring({ frame: frame - 450, fps, config: { damping: 10 } })})`
                    }}>
                        SÍGUENOS
                    </h1>
                    <h2 style={{ color: '#7C3AED', fontFamily: 'sans-serif', fontSize: 40, marginBottom: 60 }}>
                        Suscríbete para ver casos reales
                    </h2>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 20,
                        alignItems: 'center',
                        borderTop: '2px solid rgba(255,255,255,0.1)',
                        paddingTop: 40,
                        width: '80%'
                    }}>
                        {['Tutoriales', 'Plantillas', 'Casos Reales'].map((t, i) => (
                            <span key={i} style={{ color: '#cccccc', fontFamily: 'sans-serif', fontSize: 30 }}>
                                • {t}
                            </span>
                        ))}
                    </div>
                </AbsoluteFill>
                <AbsoluteFill style={{
                    backgroundColor: 'black',
                    opacity: interpolate(frame - 450, [75, 90], [0, 1], { extrapolateLeft: 'clamp' })
                }} />
            </Sequence>

        </AbsoluteFill>
    );
};
