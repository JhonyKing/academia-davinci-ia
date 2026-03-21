import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, Img, staticFile } from 'remotion';
import { GlowingText } from '../components/GlowingText';

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

const FOTOS = [
    { src: 'Foto_decoracion_globos.jpg', copy: 'TALLERES LLENOS' },
    { src: 'Foto_dibujo.jpg', copy: 'CREATIVIDAD SIN LÍMITES' },
    { src: 'Foto_Inteligencia_Artificial.jpg', copy: 'TECNOLOGÍA + ARTE' },
    { src: 'Foto_guitarra_kids.jpg', copy: 'MÚSICA PARA TODOS' },
    { src: 'Foto_lettering.jpg', copy: 'DISEÑO Y ESTILO' },
    { src: 'Foto_maquuillaje.jpg', copy: 'EXPRESA TU ARTE' },
    { src: 'Foto_violin.jpg', copy: 'CURSOS EN ACCIÓN' },
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

const getTallerName = (filename: string) => {
    return filename
        .replace('Taller_', '')
        .replace('.jpg', '')
        .replace(/_/g, ' ')
        .toUpperCase();
};

const Photo3D: React.FC<{ src: string; copy: string; delay: number }> = ({ src, copy, delay }) => {
    const frame = useCurrentFrame();
    const localFrame = frame - delay;

    const rotateY = interpolate(localFrame, [0, 30], [-15, 5], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const rotateX = interpolate(localFrame, [0, 30], [10, -3], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const scale = interpolate(localFrame, [0, 20], [0.8, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const opacity = interpolate(localFrame, [0, 5], [0, 1]);

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', perspective: '1000px' }}>
            <div
                style={{
                    width: '75%',
                    height: '65%',
                    position: 'relative',
                    transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`,
                    transformStyle: 'preserve-3d',
                    opacity,
                }}
            >
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 30,
                        overflow: 'hidden',
                        border: '6px solid #FFD700',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255, 215, 0, 0.6)',
                    }}
                >
                    <Img
                        src={staticFile(`assets/cuarto_amarillo/${src}`)}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                </div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
                        padding: '80px 40px 40px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                            padding: '25px 60px',
                            borderRadius: 50,
                            border: '4px solid white',
                            boxShadow: '0 0 30px rgba(255, 215, 0, 0.9), 0 10px 30px rgba(0,0,0,0.5)',
                            transform: `scale(${interpolate(localFrame, [10, 25], [0.9, 1.05], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
                        }}
                    >
                        <h2
                            style={{
                                color: '#1a1308',
                                fontSize: 55,
                                fontFamily: 'sans-serif',
                                fontWeight: '900',
                                margin: 0,
                                textAlign: 'center',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                            }}
                        >
                            {copy}
                        </h2>
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};

const TallerCardV2: React.FC<{ src: string; delay: number }> = ({ src, delay }) => {
    const frame = useCurrentFrame();
    const localFrame = frame - delay;

    const scale = interpolate(localFrame, [0, 12], [1.3, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const opacity = interpolate(localFrame, [0, 3], [0, 1]);

    const tallerName = getTallerName(src);

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div
                style={{
                    position: 'relative',
                    width: '85%',
                    height: '75%',
                    borderRadius: 35,
                    overflow: 'hidden',
                    border: '5px solid #FF8C00',
                    boxShadow: '0 0 40px rgba(255, 140, 0, 0.6), 0 15px 50px rgba(0,0,0,0.5)',
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
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) scale(${interpolate(localFrame, [3, 10], [0.8, 1.1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
                        zIndex: 10,
                    }}
                >
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                            padding: '35px 80px',
                            borderRadius: 60,
                            border: '6px solid white',
                            boxShadow: `
								0 0 50px rgba(255, 215, 0, 1),
								0 0 100px rgba(255, 215, 0, 0.8),
								0 15px 40px rgba(0,0,0,0.6),
								inset 0 -5px 20px rgba(0,0,0,0.2)
							`,
                            position: 'relative',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                inset: -3,
                                borderRadius: 60,
                                background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.5), transparent)',
                                opacity: 0.6,
                                pointerEvents: 'none',
                            }}
                        />
                        <h1
                            style={{
                                color: '#1a1308',
                                fontSize: 70,
                                fontFamily: 'sans-serif',
                                fontWeight: '900',
                                margin: 0,
                                textAlign: 'center',
                                textTransform: 'uppercase',
                                letterSpacing: '3px',
                                textShadow: '0 2px 4px rgba(255,255,255,0.5)',
                                position: 'relative',
                                zIndex: 1,
                            }}
                        >
                            {tallerName}
                        </h1>
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};

const PhotoCollage: React.FC = () => {
    const frame = useCurrentFrame();

    const photos = [
        { src: FOTOS[0].src, rotation: -12, x: -200, y: -150, scale: 0.7 },
        { src: FOTOS[1].src, rotation: 8, x: 180, y: -180, scale: 0.65 },
        { src: FOTOS[2].src, rotation: -5, x: -150, y: 120, scale: 0.7 },
        { src: FOTOS[3].src, rotation: 15, x: 200, y: 150, scale: 0.6 },
    ];

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '90%', height: '80%' }}>
                {photos.map((photo, i) => {
                    const delay = i * 5;
                    const localFrame = frame - delay;

                    const opacity = interpolate(localFrame, [0, 10], [0, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                    });

                    const translateY = interpolate(localFrame, [0, 15], [50, 0], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                    });

                    return (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: '50%',
                                height: '45%',
                                transform: `translate(-50%, -50%) translate(${photo.x}px, ${photo.y + translateY}px) rotate(${photo.rotation}deg) scale(${photo.scale})`,
                                opacity,
                                zIndex: 4 - i,
                            }}
                        >
                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 20,
                                    overflow: 'hidden',
                                    border: '4px solid #FFD700',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.4), 0 0 20px rgba(255, 215, 0, 0.5)',
                                }}
                            >
                                <Img
                                    src={staticFile(`assets/cuarto_amarillo/${photo.src}`)}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div
                style={{
                    position: 'absolute',
                    bottom: 100,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                    padding: '30px 80px',
                    borderRadius: 50,
                    border: '5px solid white',
                    boxShadow: '0 0 40px rgba(255, 215, 0, 0.9), 0 10px 30px rgba(0,0,0,0.5)',
                }}
            >
                <h2
                    style={{
                        color: '#1a1308',
                        fontSize: 60,
                        fontFamily: 'sans-serif',
                        fontWeight: '900',
                        margin: 0,
                        textAlign: 'center',
                    }}
                >
                    ¡ÚNETE HOY!
                </h2>
            </div>
        </AbsoluteFill>
    );
};

export const PromoCuartoAmarilloGaleriaV2: React.FC = () => {
    const frame = useCurrentFrame();

    return (
        <AbsoluteFill style={{ backgroundColor: '#1a1308' }}>
            <WarmGrid />

            <Sequence from={0} durationInFrames={60}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div
                        style={{
                            width: 400,
                            height: 400,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '10px solid #FFD700',
                            boxShadow: '0 0 60px rgba(255, 215, 0, 0.9)',
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
                        text="DESCUBRE"
                        fontSize={90}
                        color="#FFD700"
                        glowColor="#FF8C00"
                    />
                    <GlowingText
                        text="NUESTROS TALLERES"
                        fontSize={75}
                        color="#FFFFFF"
                        glowColor="#FFD700"
                        delay={10}
                    />
                </AbsoluteFill>
            </Sequence>

            {FOTOS.map((foto, i) => (
                <Sequence key={foto.src} from={60 + i * 30} durationInFrames={30}>
                    <Photo3D src={foto.src} copy={foto.copy} delay={0} />
                </Sequence>
            ))}

            <Sequence from={270} durationInFrames={60}>
                <PhotoCollage />
            </Sequence>

            {TALLERES.map((taller, i) => (
                <Sequence key={taller} from={330 + i * 15} durationInFrames={15}>
                    <TallerCardV2 src={taller} delay={0} />
                </Sequence>
            ))}

            <Sequence from={555} durationInFrames={105}>
                <AbsoluteFill
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'linear-gradient(to bottom, #1a1308 0%, #2a1f0f 100%)',
                        transform: `scale(${interpolate(frame - 555, [0, 70], [0.9, 1.1])})`,
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
                            boxShadow: '0 0 50px rgba(255, 215, 0, 0.8)',
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
                            fontSize: 110,
                            fontFamily: 'sans-serif',
                            fontWeight: 'bold',
                            margin: 0,
                            textAlign: 'center',
                            textShadow: '0 0 40px rgba(255, 215, 0, 0.9)',
                        }}
                    >
                        ¡INSCRÍBETE!
                    </h1>

                    <div
                        style={{
                            marginTop: 40,
                            background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                            padding: '30px 90px',
                            borderRadius: 30,
                            border: '5px solid white',
                            boxShadow: '0 0 40px rgba(255, 215, 0, 0.8)',
                        }}
                    >
                        <h2
                            style={{
                                color: '#1a1308',
                                fontFamily: 'sans-serif',
                                fontSize: 60,
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
                        opacity: interpolate(frame - 555, [95, 105], [0, 1], {
                            extrapolateLeft: 'clamp',
                        }),
                    }}
                />
            </Sequence>
        </AbsoluteFill>
    );
};
