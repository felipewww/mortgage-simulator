
// Pegar apenas cores do quadrante 2 (TOP - RIGHT) do Colorpicker
/*
* _________________
* |   1   |   2   |
* |-------|-------|
* |   4   |   3   |
* -----------------
*
* */
export function getRandomTopRightColor() {
  const hue = Math.floor(Math.random() * 360); // any hue
  const saturation = Math.floor(80 + Math.random() * 20); // 80% to 100%
  const lightness = Math.floor(60 + Math.random() * 20); // 60% to 80%

  return hslToRgb(hue, saturation, lightness);
}

function hslToRgb(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60)      [r, g, b] = [c, x, 0];
  else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
  else if (120 <= h && h < 180)[r, g, b] = [0, c, x];
  else if (180 <= h && h < 240)[r, g, b] = [0, x, c];
  else if (240 <= h && h < 300)[r, g, b] = [x, 0, c];
  else if (300 <= h && h < 360)[r, g, b] = [c, 0, x];

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `rgb(${r}, ${g}, ${b})`;
}
