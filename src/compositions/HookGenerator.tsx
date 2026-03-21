import { AbsoluteFill, Img, OffthreadVideo, Sequence, spring, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import React from "react";
import { SubtitleOverlay } from "../components/SubtitleOverlay";

interface WordSegment {
  word: string;
  start: number;
  end: number;
}

export type HookVideoProps = {
  id: string;
  artist: string;
  videoPath: string;
  imageLocalUrl: string;
  startFromSeconds: number;
  durationSeconds: number;
  words?: WordSegment[];
  customScale?: number;
};

export const HookGenerator: React.FC<HookVideoProps> = ({ videoPath, imageLocalUrl, startFromSeconds, words, customScale = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const startFrame = Math.round(startFromSeconds * fps);

  // Artist photo: enter at frame 0, exit at frame 60 (~2s total)
  const showStart = 0;
  const hideStart = 60;

  const scaleEntrance = spring({
    fps,
    frame: frame - showStart,
    config: { damping: 14, stiffness: 180 },
  });

  const scaleExit = spring({
    fps,
    frame: frame - hideStart,
    config: { damping: 14, stiffness: 180 },
  });

  const scale = scaleEntrance - scaleExit;

  // Vignette opacity: always visible
  const vignetteOpacity = 0.55;

  return (
    <AbsoluteFill className="bg-black">
      {/* Video — colorimetría cálida cinematográfica */}
      <OffthreadVideo
        src={staticFile(videoPath)}
        startFrom={startFrame}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "contrast(1.28) saturate(1.25) brightness(0.92) sepia(0.08)",
        }}
      />

      {/* Vignette overlay */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.72) 100%)",
          opacity: vignetteOpacity,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Artist photo — quick flash anchored to bottom */}
      <Sequence from={showStart}>
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 0, zIndex: 10 }}>
          {imageLocalUrl && (
            <Img
              src={staticFile(imageLocalUrl)}
              style={{
                transform: `scale(${scale * customScale})`,
                transformOrigin: "bottom center",
                height: "70%",
                width: "auto",
                maxWidth: "100%",
                filter: "drop-shadow(0px 20px 40px rgba(0,0,0,0.8)) drop-shadow(0px 0px 15px rgba(255,255,255,0.2))",
                objectFit: "contain",
                objectPosition: "bottom",
              }}
            />
          )}
        </AbsoluteFill>
      </Sequence>

      {/* Subtítulos estilo Malos Habitos: blanco con contorno rojo, centrado, glitch */}
      {words && words.length > 0 && (
        <SubtitleOverlay words={words} startFromSeconds={startFromSeconds} />
      )}
    </AbsoluteFill>
  );
};
