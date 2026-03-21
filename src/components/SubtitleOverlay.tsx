import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface WordSegment {
  word: string;
  start: number;
  end: number;
}

interface SubtitleOverlayProps {
  words: WordSegment[];
  wordsPerGroup?: number;
  startFromSeconds?: number;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  words = [],
  wordsPerGroup = 3,
  startFromSeconds = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // currentTime mapped back to original video timestamp
  const currentTime = frame / fps + startFromSeconds;

  if (!words || words.length === 0) return null;

  // Group words into lines of N
  const groups: WordSegment[][] = [];
  for (let i = 0; i < words.length; i += wordsPerGroup) {
    groups.push(words.slice(i, i + wordsPerGroup));
  }

  // Find the active group
  const currentGroupIdx = groups.findIndex((group) => {
    const start = group[0].start;
    const end = group[group.length - 1].end;
    return currentTime >= start - 0.05 && currentTime <= end + 0.4;
  });

  if (currentGroupIdx === -1) return null;
  const currentGroup = groups[currentGroupIdx];

  const groupStart = currentGroup[0].start;
  const groupEnd = currentGroup[currentGroup.length - 1].end;
  const groupStartFrame = (groupStart - startFromSeconds) * fps;
  const groupEndFrame = (groupEnd - startFromSeconds) * fps;

  // --- Entry animation: quick spring pop-in ---
  const entrySpring = spring({
    fps,
    frame: frame - groupStartFrame,
    config: { damping: 16, stiffness: 300, mass: 0.7 },
  });
  const entryScale = interpolate(entrySpring, [0, 1], [0.65, 1]);
  const entryOpacity = interpolate(
    frame,
    [groupStartFrame, groupStartFrame + 4],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // --- Exit animation: glitch scatter ---
  const glitchStart = groupEndFrame - 2;
  const glitchEnd = groupEndFrame + 5;
  const glitchProgress = interpolate(
    frame,
    [glitchStart, glitchEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const isGlitching = glitchProgress > 0;
  // Jitter: oscillate horizontally at high frequency
  const glitchX = isGlitching
    ? Math.sin(frame * 53) * glitchProgress * 18
    : 0;
  const glitchY = isGlitching
    ? Math.cos(frame * 37) * glitchProgress * 8
    : 0;
  const glitchBlur = glitchProgress * 10;
  const glitchScale = isGlitching
    ? interpolate(glitchProgress, [0, 1], [1, 1.12])
    : entryScale;
  const glitchOpacity = interpolate(
    frame,
    [glitchStart + 1, glitchEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const finalScale = isGlitching ? glitchScale : entryScale;
  const finalOpacity = isGlitching
    ? Math.min(entryOpacity, glitchOpacity)
    : entryOpacity;
  const finalTranslateX = glitchX;
  const finalTranslateY = glitchY;
  const finalFilter = isGlitching ? `blur(${glitchBlur}px)` : "none";

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: 0,
        right: 0,
        transform: `translateY(-50%) translateX(${finalTranslateX}px) translateY(${finalTranslateY}px) scale(${finalScale})`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 32px",
        opacity: finalOpacity,
        filter: finalFilter,
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: '"Anton", Impact, "Arial Black", Arial, sans-serif',
          fontSize: 90,
          fontWeight: 900,
          color: "#FFFFFF",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          WebkitTextStroke: "5px #CC0000" as any,
          // paintOrder ensures stroke renders behind fill
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          paintOrder: "stroke fill" as any,
          textTransform: "uppercase",
          textAlign: "center",
          lineHeight: 1.15,
          letterSpacing: 2,
          textShadow:
            "4px 4px 12px rgba(0,0,0,0.75), 0px 0px 20px rgba(200,0,0,0.3)",
          wordBreak: "keep-all",
          whiteSpace: "pre-wrap",
        }}
      >
        {currentGroup.map((w) => w.word).join(" ")}
      </div>
    </div>
  );
};
