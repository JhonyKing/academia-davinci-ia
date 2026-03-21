import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { BackgroundGrid } from '../components/BackgroundGrid';
import { SimpleParticles } from '../components/SimpleParticles';
import { GlowingText } from '../components/GlowingText';
import { ProgressBar } from '../components/ProgressBar';
import { Card } from '../components/Card';
import { ProfileReveal } from '../components/ProfileReveal';

// SVGs for cards
const AgentIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8" y2="16" />
        <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
);

const VideoIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);

const AutoIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4" />
        <path d="M12 18v4" />
        <path d="M4.93 4.93l2.83 2.83" />
        <path d="M16.24 16.24l2.83 2.83" />
        <path d="M2 12h4" />
        <path d="M18 12h4" />
        <path d="M4.93 19.07l2.83-2.83" />
        <path d="M16.24 7.76l2.83-2.83" />
    </svg>
);

export const IntroComposition: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    return (
        <AbsoluteFill style={{ backgroundColor: '#050510' }}>
            {/* Global Background */}
            <BackgroundGrid />
            <SimpleParticles />

            {/* SCENE 1: Arranque / Sistema en línea (0-5s) */}
            <Sequence from={0} durationInFrames={150}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <GlowingText text="INICIANDO SISTEMA..." fontSize={40} color="#ffffff" glowColor="#22D3EE" />
                    <ProgressBar durationInFrames={100} />
                </AbsoluteFill>
            </Sequence>

            {/* SCENE 2: Pulso IA (5-10s) */}
            <Sequence from={150} durationInFrames={150}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    {/* Pulse Effect */}
                    <div style={{
                        position: 'absolute',
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        border: '2px solid rgba(34, 211, 238, 0.3)',
                        transform: `scale(${interpolate((frame - 150) % 60, [0, 60], [0.5, 1.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
                        opacity: interpolate((frame - 150) % 60, [0, 60], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                    }} />
                    <GlowingText text="FLUJOS GENERATIVOS" fontSize={70} delay={10} />
                </AbsoluteFill>
            </Sequence>

            {/* SCENE 3: Habilidades (10-15s) */}
            <Sequence from={300} durationInFrames={150}>
                <AbsoluteFill style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 20
                }}>
                    <Card title="Agentes" icon={<AgentIcon />} delay={0} />
                    <Card title="Video" icon={<VideoIcon />} delay={10} />
                    <Card title="Auto" icon={<AutoIcon />} delay={20} />
                </AbsoluteFill>
            </Sequence>

            {/* SCENE 4: Flujo de datos (15-20s) */}
            <Sequence from={450} durationInFrames={150}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    {/* Fake Data Stream */}
                    <div style={{
                        position: 'absolute',
                        top: '20%',
                        fontFamily: 'monospace',
                        color: 'rgba(34, 211, 238, 0.2)',
                        fontSize: 20,
                        textAlign: 'center'
                    }}>
                        {new Array(10).fill(0).map((_, i) => (
                            <div key={i} style={{ transform: `translateX(${Math.sin(i + frame * 0.1) * 20}px)` }}>
                                0x{((frame + i) * 12345).toString(16).substring(0, 8)}...
                            </div>
                        ))}
                    </div>
                    <GlowingText text="CREA." fontSize={60} delay={0} />
                    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', top: 80 }}>
                        <GlowingText text="PRUEBA." fontSize={60} delay={15} />
                    </AbsoluteFill>
                    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', top: 160 }}>
                        <GlowingText text="DESPLIEGA." fontSize={60} delay={30} />
                    </AbsoluteFill>
                </AbsoluteFill>
            </Sequence>

            {/* SCENE 5: Profile Reveal (20-25s) */}
            <Sequence from={600} durationInFrames={150}>
                <ProfileReveal />
            </Sequence>

            {/* SCENE 6: CTA (25-30s) */}
            <Sequence from={750} durationInFrames={150}>
                <AbsoluteFill style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: `rgba(5, 5, 16, ${interpolate(frame - 750, [0, 20], [0, 0.8])})`
                }}>
                    <h2 style={{ color: '#7C3AED', fontFamily: 'sans-serif', margin: 0, opacity: 0.8 }}>LOOMIN LAB</h2>
                    <h1 style={{
                        color: 'white',
                        fontSize: 100,
                        fontFamily: 'sans-serif',
                        margin: '20px 0',
                        transform: `scale(${spring({ frame: frame - 750, fps, config: { damping: 10 } })})`
                    }}>
                        SUSCRÍBETE
                    </h1>
                    <div style={{
                        display: 'flex',
                        gap: 40,
                        marginTop: 40,
                        borderTop: '1px solid rgba(255,255,255,0.2)',
                        paddingTop: 20
                    }}>
                        {['Tutoriales', 'Plantillas', 'Casos Reales'].map((t, i) => (
                            <span key={i} style={{ color: '#cccccc', fontFamily: 'sans-serif', fontSize: 24 }}>
                                • {t}
                            </span>
                        ))}
                    </div>
                </AbsoluteFill>
                {/* Fade out at very end */}
                <AbsoluteFill style={{
                    backgroundColor: 'black',
                    opacity: interpolate(frame - 750, [120, 150], [0, 1], { extrapolateLeft: 'clamp' })
                }} />
            </Sequence>

        </AbsoluteFill>
    );
};
