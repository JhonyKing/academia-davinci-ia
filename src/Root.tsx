import "./index.css";
import { Composition } from "remotion";
import { IntroComposition } from "./compositions/IntroComposition";
import { IntroVertical } from "./compositions/IntroVertical";
import { PromoCuartoAmarillo } from "./compositions/PromoCuartoAmarillo";
import { PromoCuartoAmarilloV2 } from "./compositions/PromoCuartoAmarilloV2";
import { PromoCuartoAmarilloGaleria } from "./compositions/PromoCuartoAmarilloGaleria";
import { PromoCuartoAmarilloGaleriaV2 } from "./compositions/PromoCuartoAmarilloGaleriaV2";
import { PromoCuartoAmarilloGaleriaV3 } from "./compositions/PromoCuartoAmarilloGaleriaV3";
import { EjemploConAudio } from "./compositions/EjemploConAudio";
import { HookGenerator, HookVideoProps } from './compositions/HookGenerator';

// Intentar cargar la configuración si existe. Si no, poner un dummy.
let hooksData: HookVideoProps[] = [];
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  hooksData = require('../public/hooks-data.json');
} catch (e) {
  hooksData = [
    {
      id: "DUMMY",
      artist: "Ejemplo",
      videoPath: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      imageLocalUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
      startFromSeconds: 0,
      durationSeconds: 4
    }
  ];
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {hooksData.map((hook) => {
        let validStart = hook.startFromSeconds;
        let validDuration = hook.durationSeconds - validStart;
        
        // Failsafe: if silence detection failed and returned the end of the video
        if (validStart >= hook.durationSeconds - 0.5) {
          validStart = 0;
          validDuration = hook.durationSeconds;
        }

        const frames = Math.round(validDuration * 30);
        const finalDurationInFrames = frames > 0 ? frames : 120; // fallback a 4s

        return (
          <Composition
            key={hook.id}
            id={hook.id}
            component={HookGenerator}
            durationInFrames={finalDurationInFrames}
            fps={30}
            width={1080}
            height={1920}
            defaultProps={{ ...hook, startFromSeconds: validStart }}
          />
        );
      })}

      <Composition
        id="Intro-IA-YT-30s"
        component={IntroComposition}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Intro-LoominLab-9x16-18s"
        component={IntroVertical}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Promo-CuartoAmarillo-18s"
        component={PromoCuartoAmarillo}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Promo-CuartoAmarillo-V2-18s"
        component={PromoCuartoAmarilloV2}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Promo-CuartoAmarillo-Galeria-20s"
        component={PromoCuartoAmarilloGaleria}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Promo-CuartoAmarillo-Galeria-V2-22s"
        component={PromoCuartoAmarilloGaleriaV2}
        durationInFrames={660}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Promo-CuartoAmarillo-Galeria-V3-37s"
        component={PromoCuartoAmarilloGaleriaV3}
        durationInFrames={1095}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Ejemplo-Con-Audio-10s"
        component={EjemploConAudio}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
