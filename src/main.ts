const canvas = document.getElementById("pond") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

if (ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
