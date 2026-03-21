import React from 'react';
import { AbsoluteFill, Audio, staticFile, Sequence, useCurrentFrame, interpolate } from 'remotion';
import { GlowingText } from '../components/GlowingText';

/**
 * Ejemplo de Composition con Audio de ElevenLabs
 * 
 * Este ejemplo muestra cómo integrar audio generado con ElevenLabs TTS
 * en un video de Remotion.
 * 
 * Para generar el audio, ejecuta:
 * node scripts/eleven_tts.mjs --text "Hola, bienvenidos a Loomin Lab" --voice "pNInz6obpgDQGcFmaJgB" --out "public/audio/intro_loomin.mp3"
 */
export const EjemploConAudio: React.FC = () => {
    const frame = useCurrentFrame();

    const opacity = interpolate(frame, [0, 30], [0, 1], {
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#050510',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {/* Audio de fondo generado con ElevenLabs */}
            <Audio src={staticFile('audio/intro_loomin.mp3')} volume={0.9} />

            {/* Contenido visual sincronizado */}
            <div
                style={{
                    opacity,
                    textAlign: 'center',
                }}
            >
                <GlowingText
                    text="LOOMIN LAB"
                    fontSize={120}
                    color="#FFD700"
                    glowColor="#FF8C00"
                />

                <h2
                    style={{
                        color: 'white',
                        fontSize: 50,
                        fontFamily: 'sans-serif',
                        marginTop: 40,
                        opacity: interpolate(frame, [30, 60], [0, 1]),
                    }}
                >
                    Contenido con IA
                </h2>
            </div>
        </AbsoluteFill>
    );
};

/**
 * Ejemplo Avanzado: Múltiples Audios en Secuencia
 * 
 * Muestra cómo usar diferentes audios en diferentes partes del video
 */
export const EjemploMultiplesAudios: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#050510' }}>
            {/* Intro (0-3s) con primer audio */}
            <Sequence from={0} durationInFrames={90}>
                <Audio src={staticFile('audio/intro_loomin.mp3')} volume={0.9} />
                <AbsoluteFill
                    style={{ justifyContent: 'center', alignItems: 'center' }}
                >
                    <GlowingText text="INTRO" fontSize={100} color="#FFD700" />
                </AbsoluteFill>
            </Sequence>

            {/* Sección principal (3-8s) con segundo audio
			<Sequence from={90} durationInFrames={150}>
				<Audio src={staticFile('audio/seccion1.mp3')} volume={0.9} />
				<AbsoluteFill
					style={{justifyContent: 'center', alignItems: 'center'}}
				>
					<GlowingText text="CONTENIDO" fontSize={100} color="#22D3EE" />
				</AbsoluteFill>
			</Sequence>
			*/}

            {/* Outro (8-10s) con tercer audio
			<Sequence from={240} durationInFrames={60}>
				<Audio src={staticFile('audio/outro.mp3')} volume={0.9} />
				<AbsoluteFill
					style={{justifyContent: 'center', alignItems: 'center'}}
				>
					<GlowingText text="GRACIAS" fontSize={100} color="#7C3AED" />
				</AbsoluteFill>
			</Sequence>
			*/}
        </AbsoluteFill>
    );
};
