import * as THREE from "three";

function textureFrom(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

export function makeFacadeTextures() {
  const width = 512;
  const height = 256;
  const albedo = document.createElement("canvas");
  const glow = document.createElement("canvas");
  albedo.width = glow.width = width;
  albedo.height = glow.height = height;
  const ga = albedo.getContext("2d");
  const ge = glow.getContext("2d");
  if (!ga || !ge) throw new Error("Canvas unavailable");

  ga.fillStyle = "#93aaba";
  ga.fillRect(0, 0, width, height);
  ge.fillStyle = "#000000";
  ge.fillRect(0, 0, width, height);

  const cols = 8;
  const rows = 3;
  const cw = width / cols;
  const ch = height / rows;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const lit = (x * 5 + y * 3) % 4 === 0;
      const px = x * cw + 7;
      const py = y * ch + 8;
      const pw = cw - 14;
      const ph = ch - 18;
      const gradient = ga.createLinearGradient(px, py, px + pw, py + ph);
      if (lit) {
        gradient.addColorStop(0, "#f6dcc2");
        gradient.addColorStop(1, "#d39268");
      } else if ((x + y) % 3 === 0) {
        gradient.addColorStop(0, "#e7eef3");
        gradient.addColorStop(1, "#8ea8ba");
      } else {
        gradient.addColorStop(0, "#d5e4ef");
        gradient.addColorStop(1, "#6f8fa6");
      }
      ga.fillStyle = gradient;
      ga.fillRect(px, py, pw, ph);
      if (!lit && x % 2 === 0) {
        ga.fillStyle = "rgba(255,255,255,0.16)";
        ga.fillRect(px + 5, py, 5, ph);
      }
      if (lit) {
        ge.fillStyle = "#ffc08a";
        ge.fillRect(px + 1, py + 1, pw - 2, ph - 2);
      }
    }
  }

  ga.fillStyle = "#171b20";
  ge.fillStyle = "#000000";
  for (let x = 0; x <= cols; x += 1) {
    ga.fillRect(x * cw - 2, 0, 4, height);
    ge.fillRect(x * cw - 2, 0, 4, height);
  }
  for (let y = 0; y <= rows; y += 1) {
    ga.fillRect(0, y * ch - 4, width, 8);
    ge.fillRect(0, y * ch - 4, width, 8);
  }

  return { map: textureFrom(albedo), emissive: textureFrom(glow) };
}

export function makeCityTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("Canvas unavailable");
  g.fillStyle = "#1a222c";
  g.fillRect(0, 0, 256, 256);
  for (let y = 8; y < 256; y += 16) {
    for (let x = 6; x < 256; x += 14) {
      const lit = (x * 3 + y * 5) % 17 < 7;
      g.fillStyle = lit ? "#f0c49a" : "#8aa4b8";
      g.fillRect(x, y, 7, 9);
    }
  }
  const map = textureFrom(canvas);
  const emissive = textureFrom(canvas);
  return { map, emissive };
}

function noiseFill(g: CanvasRenderingContext2D, width: number, height: number, alpha: number) {
  for (let i = 0; i < 1400; i += 1) {
    const x = (i * 97) % width;
    const y = (i * 57) % height;
    g.fillStyle = `rgba(255,255,255,${((i % 7) / 6) * alpha})`;
    g.fillRect(x, y, 2, 2);
  }
}

export function makeStoneTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("Canvas unavailable");
  g.fillStyle = "#e6e0d6";
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "rgba(90,80,70,0.28)";
  g.lineWidth = 2;
  for (let y = 0; y <= 256; y += 64) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(256, y);
    g.stroke();
  }
  for (let x = 0; x <= 256; x += 64) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 256);
    g.stroke();
  }
  noiseFill(g, 256, 256, 0.05);
  const texture = textureFrom(canvas);
  texture.repeat.set(2, 2);
  return texture;
}

export function makeWoodTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("Canvas unavailable");
  g.fillStyle = "#8d6a45";
  g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 1) {
    const shade = 110 + ((y * 13) % 40);
    g.strokeStyle = `rgba(${shade}, ${shade - 30}, ${shade - 55}, 0.25)`;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(256, y + ((y % 11) - 5));
    g.stroke();
  }
  const texture = textureFrom(canvas);
  texture.repeat.set(2, 2);
  return texture;
}

export function makeRugTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("Canvas unavailable");
  g.fillStyle = "#2c333b";
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = "#C5A46D";
  g.lineWidth = 6;
  g.strokeRect(14, 14, 228, 228);
  g.lineWidth = 1;
  g.strokeStyle = "rgba(197,164,109,0.45)";
  g.strokeRect(28, 28, 200, 200);
  const texture = textureFrom(canvas);
  return texture;
}

export function makeArtTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 320;
  const g = canvas.getContext("2d");
  if (!g) throw new Error("Canvas unavailable");
  g.fillStyle = "#14171c";
  g.fillRect(0, 0, 256, 320);
  g.strokeStyle = "#C5A46D";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(30, 260);
  g.bezierCurveTo(80, 40, 140, 300, 230, 70);
  g.stroke();
  g.globalAlpha = 0.7;
  g.beginPath();
  g.moveTo(40, 80);
  g.bezierCurveTo(120, 20, 150, 200, 220, 240);
  g.stroke();
  return textureFrom(canvas);
}
