const sharp = require("sharp");

(async () => {
  const img = sharp("Aincrad/Map/floor1.png");
  const { width, height } = await img.metadata();
  console.log("size", width, height);

  // Read the alpha channel of the full image in strips.
  const raw = await img.ensureAlpha().raw().toBuffer();
  const alpha = (x, y) => raw[(y * width + x) * 4 + 3];

  // Scan several rows to find the left/right circle edges precisely.
  const rows = [2500, 1250, 3750, 500, 4500, 100, 4900, 2500 + 1250, 2500 - 1250];
  const edgePoints = [];
  for (const y of rows) {
    let left = -1, right = -1;
    for (let x = 0; x < width; x++) {
      if (alpha(x, y) > 128) { left = x; break; }
    }
    for (let x = width - 1; x >= 0; x--) {
      if (alpha(x, y) > 128) { right = x; break; }
    }
    if (left >= 0) {
      edgePoints.push({ x: left, y });
      edgePoints.push({ x: right, y });
      console.log(`row y=${y}: left=${left} right=${right} cx=${(left + right) / 2}`);
    }
  }
  const cols = [2500, 1250, 3750, 500, 4500, 100, 4900];
  for (const x of cols) {
    let top = -1, bottom = -1;
    for (let y = 0; y < height; y++) {
      if (alpha(x, y) > 128) { top = y; break; }
    }
    for (let y = height - 1; y >= 0; y--) {
      if (alpha(x, y) > 128) { bottom = y; break; }
    }
    if (top >= 0) {
      edgePoints.push({ x, y: top });
      edgePoints.push({ x, y: bottom });
      console.log(`col x=${x}: top=${top} bottom=${bottom} cy=${(top + bottom) / 2}`);
    }
  }

  // Least-squares circle fit: minimize sum of (sqrt((x-cx)^2+(y-cy)^2) - r)^2 using
  // algebraic fit (Kasa method) then refine with Gauss-Newton.
  const n = edgePoints.length;
  // Kasa: minimize sum ((x^2+y^2) + D x + E y + F)^2
  let Sxx = 0, Syy = 0, Sxy = 0, Sx = 0, Sy = 0, Sx3 = 0, Sy3 = 0, Sxy2 = 0, Sx2y = 0, Sx2 = 0, Sy2 = 0;
  const z = edgePoints.map((p) => p.x * p.x + p.y * p.y);
  for (let i = 0; i < n; i++) {
    const { x, y } = edgePoints[i];
    Sxx += x * x; Syy += y * y; Sxy += x * y; Sx += x; Sy += y;
    Sx3 += x * x * x; Sy3 += y * y * y; Sxy2 += x * y * y; Sx2y += x * x * y;
    Sx2 += x * x; Sy2 += y * y;
  }
  // Solve for D, E, F via normal equations
  const M = [
    [Sxx, Sxy, Sx],
    [Sxy, Syy, Sy],
    [Sx, Sy, n]
  ];
  const b = [-Sx3 - Sxy2, -Sx2y - Sy3, -Sx2 - Sy2];
  // Gauss elimination
  const A = M.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < 3; col++) {
    let piv = col;
    for (let r = col + 1; r < 3; r++) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
    [A[col], A[piv]] = [A[piv], A[col]];
    for (let r = col + 1; r < 3; r++) {
      const f = A[r][col] / A[col][col];
      for (let c = col; c < 4; c++) A[r][c] -= f * A[col][c];
    }
  }
  const sol = [0, 0, 0];
  for (let r = 2; r >= 0; r--) {
    let acc = A[r][3];
    for (let c = r + 1; c < 3; c++) acc -= A[r][c] * sol[c];
    sol[r] = acc / A[r][r];
  }
  const [D, E, F] = sol;
  const cx = -D / 2, cy = -E / 2, r = Math.sqrt(Math.max(0, (D * D + E * E) / 4 - F));
  console.log("Kasa fit: center", { cx, cy }, "radius", r);

  // Gauss-Newton refinement on center+radius
  let c = { x: cx, y: cy, r };
  for (let iter = 0; iter < 40; iter++) {
    let g = [0, 0, 0], H = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (const p of edgePoints) {
      const dx = p.x - c.x, dy = p.y - c.y;
      const d = Math.hypot(dx, dy);
      const res = d - c.r;
      const jx = -dx / d, jy = -dy / d, jr = -1;
      const J = [jx, jy, jr];
      g[0] += J[0] * res; g[1] += J[1] * res; g[2] += J[2] * res;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) H[i][j] += J[i] * J[j];
    }
    // solve H d = -g
    const A2 = H.map((row, i) => [...row, -g[i]]);
    for (let col = 0; col < 3; col++) {
      let piv = col;
      for (let rr = col + 1; rr < 3; rr++) if (Math.abs(A2[rr][col]) > Math.abs(A2[piv][col])) piv = rr;
      [A2[col], A2[piv]] = [A2[piv], A2[col]];
      if (Math.abs(A2[col][col]) < 1e-12) continue;
      for (let rr = col + 1; rr < 3; rr++) {
        const f = A2[rr][col] / A2[col][col];
        for (let cc = col; cc < 4; cc++) A2[rr][cc] -= f * A2[col][cc];
      }
    }
    const ds = [0, 0, 0];
    for (let rr = 2; rr >= 0; rr--) {
      let acc = A2[rr][3];
      for (let cc = rr + 1; cc < 3; cc++) acc -= A2[rr][cc] * ds[cc];
      ds[rr] = A2[rr][rr] === 0 ? 0 : acc / A2[rr][rr];
    }
    c = { x: c.x + ds[0], y: c.y + ds[1], r: c.r + ds[2] };
    if (Math.hypot(ds[0], ds[1], ds[2]) < 1e-9) break;
  }
  console.log("GN fit: center", { x: c.x, y: c.y }, "radius", c.r);
  let maxRes = 0;
  for (const p of edgePoints) {
    const res = Math.abs(Math.hypot(p.x - c.x, p.y - c.y) - c.r);
    if (res > maxRes) maxRes = res;
  }
  console.log("max residual", maxRes, "over", n, "points");
})();
