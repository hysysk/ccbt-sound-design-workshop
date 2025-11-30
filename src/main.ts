import "./style.css";
import p5 from "p5";
import * as Tone from "tone";
import AudioBank from "./AudioBank.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="sketch">
  </div>
`;

const startButton: HTMLButtonElement | null = document.querySelector("button");
const WINDOW_WIDTH: number = 600;
const WINDOW_HEIGHT: number = 745;

startButton?.addEventListener("click", async () => {
  startButton.remove();

  await Tone.start();
  const sketch: HTMLDivElement =
    document.querySelector<HTMLDivElement>("#sketch")!;
  let audios: Array<AudioBank> = [];
  let mic: Tone.UserMedia;
  let recorder: Tone.Recorder;
  let analyser: Tone.Analyser;
  let visualiserY: number = 345;
  let visualiserH: number = 400;

  new p5((p: p5) => {
    p.setup = () => {
      const base = import.meta.env.BASE_URL;
      
      // Create hidden img elements for SVGs
      const recImg = p.createImg(base + "rec.svg", "rec");
      const playImg = p.createImg(base + "play.svg", "play");
      const downloadImg = p.createImg(base + "download.svg", "download");
      const loopImg = p.createImg(base + "loop.svg", "loop");
      
      // Hide the images (they'll be drawn manually)
      recImg.hide();
      playImg.hide();
      downloadImg.hide();
      loopImg.hide();

      // Wait for all images to load
      let loadedCount = 0;
      const totalImages = 4;
      
      const checkAllLoaded = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          // All images loaded, create AudioBank instances
          for (let i = 0; i < 6; i++) {
            audios.push(
              new AudioBank(
                p,
                25 + i * 100,
                25,
                i,
                recImg,
                playImg,
                downloadImg,
                loopImg
              )
            );
          }
        }
      };
      
      recImg.elt.onload = checkAllLoaded;
      playImg.elt.onload = checkAllLoaded;
      downloadImg.elt.onload = checkAllLoaded;
      loopImg.elt.onload = checkAllLoaded;

      p.createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);

      mic = new Tone.UserMedia();
      mic.open();
      // Use audio/mp4 for iOS Safari compatibility
      recorder = new Tone.Recorder({ mimeType: "audio/mp4" });
      mic.connect(recorder);
      analyser = new Tone.Analyser("waveform", 512);
      Tone.Destination.connect(analyser);
    };

    p.draw = () => {
      p.background(165, 170, 168);

      p.stroke(230);
      for (let i = 0; i < 5; i++) {
        p.line(100 + i * 100, 25, 100 + i * 100, 315);
      }

      if (!analyser) return;

      audios.forEach((audio) => {
        audio.display();
      });

      const values = analyser.getValue();
      p.noStroke();
      p.fill(0);
      p.rect(0, visualiserY, WINDOW_WIDTH, visualiserH);
      p.noFill();
      p.stroke(0, 255, 0);
      p.beginShape();
      for (let i = 0; i < values.length; i++) {
        const amplitude: number | Float32Array = values[i];
        const x: number = p.map(i, 0, values.length - 1, 0, WINDOW_WIDTH);
        const y: number =
          visualiserY +
          visualiserH / 2 +
          p.constrain(
            (amplitude as number) * visualiserH,
            -visualiserH / 2,
            visualiserH / 2
          );
        p.vertex(x, y);
      }
      p.endShape();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p as any).touchStarted = () => {
      audios.forEach((audio) => {
        audio.contains(p.mouseX, p.mouseY, recorder);
      });
    };

    p.mousePressed = () => {
      audios.forEach((audio) => {
        audio.contains(p.mouseX, p.mouseY, recorder);
      });
    };
  }, sketch);
});
