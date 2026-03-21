/* ============================================================
   TERMOLAND – map.js
   Renders an animated world map on #worldMap canvas showing:
   · Simplified continent outlines
   · Istanbul origin marker
   · 16 export country dots with pulse rings
   · Animated dashed lines from Istanbul to each country
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     Continent polygon data
     Coordinate system: 1000 × 500 Mercator projection
     x = (lon + 180) / 360 * 1000
     y = (90 - lat)  / 180 * 500
     ---------------------------------------------------------- */
  const CONTINENTS = [
    // North America
    { pts: [[80,90],[110,68],[140,50],[178,40],[215,42],[246,56],[268,78],[282,104],[284,134],[278,162],[262,190],[240,215],[210,234],[182,243],[154,238],[126,222],[106,202],[88,178],[76,152],[72,124]] },
    // Greenland
    { pts: [[218,18],[262,8],[305,14],[335,30],[336,52],[315,72],[282,84],[250,82],[220,66],[208,44]] },
    // South America
    { pts: [[162,260],[200,248],[238,250],[268,264],[290,282],[304,310],[310,342],[306,378],[294,410],[272,438],[244,452],[215,452],[185,438],[162,415],[144,386],[138,355],[140,322],[148,292],[154,272]] },
    // Europe
    { pts: [[426,78],[446,64],[468,58],[492,60],[514,66],[534,76],[552,88],[562,106],[558,126],[546,142],[526,154],[506,162],[484,164],[462,158],[442,146],[428,130],[420,112],[422,94]] },
    // Africa
    { pts: [[432,164],[458,158],[488,156],[516,160],[540,166],[562,178],[578,196],[590,220],[596,248],[596,278],[588,308],[572,336],[550,360],[526,384],[500,400],[474,408],[448,402],[424,382],[408,354],[400,320],[398,286],[402,254],[410,222],[420,196],[428,178]] },
    // Arabian Peninsula
    { pts: [[560,146],[578,140],[600,142],[622,150],[638,164],[644,182],[638,202],[624,220],[604,232],[582,238],[562,232],[548,218],[542,200],[544,180],[548,164]] },
    // Russia / North Asia
    { pts: [[544,64],[598,46],[660,36],[728,30],[804,32],[875,38],[936,50],[978,68],[992,90],[986,116],[965,138],[935,154],[896,164],[852,168],[808,164],[764,158],[718,152],[676,148],[638,146],[604,146],[574,140],[554,130],[543,112],[540,88]] },
    // Central / South Asia
    { pts: [[616,148],[656,140],[698,136],[740,136],[778,142],[808,152],[828,166],[832,184],[820,202],[800,218],[775,232],[748,240],[720,245],[694,242],[668,236],[646,224],[631,208],[626,190],[626,170]] },
    // East Asia
    { pts: [[778,142],[828,136],[876,138],[916,148],[948,162],[965,182],[960,205],[940,225],[910,242],[878,255],[845,262],[812,260],[782,252],[758,238],[746,220],[745,200],[752,180],[762,162]] },
    // Southeast Asia
    { pts: [[758,238],[790,244],[820,250],[850,256],[876,265],[890,282],[888,300],[872,315],[848,325],[820,328],[795,320],[775,308],[762,292],[757,272]] },
    // Australia
    { pts: [[742,318],[800,306],[856,308],[900,322],[920,348],[916,376],[895,400],[858,416],[820,420],[784,410],[754,390],[736,364],[734,338]] },
    // Japan
    { pts: [[882,130],[900,120],[918,124],[922,142],[908,158],[888,162],[876,150]] },
    // UK / Ireland
    { pts: [[428,76],[442,66],[452,70],[450,86],[436,92],[425,88]] },
    // Iceland
    { pts: [[378,40],[400,30],[420,36],[426,52],[412,64],[388,68],[372,58]] },
    // New Zealand
    { pts: [[940,398],[952,386],[964,390],[964,408],[950,418],[938,410]] },
    // Madagascar
    { pts: [[593,340],[602,325],[614,330],[618,352],[610,372],[596,368]] },
  ];

  /* ----------------------------------------------------------
     Origin & Export countries
     x = (lon + 180) / 360 * 1000
     y = (90 - lat)  / 180 * 500
     ---------------------------------------------------------- */
  const ORIGIN = { name: 'İstanbul', x: 580, y: 136 };

  const COUNTRIES = [
    { name: 'Tunus',        x: 522, y: 156 },
    { name: 'Fas',          x: 486, y: 161 },
    { name: 'Cezayir',      x: 508, y: 172 },
    { name: 'Mısır',        x: 583, y: 178 },
    { name: 'Libya',        x: 546, y: 178 },
    { name: 'Lübnan',       x: 600, y: 156 },
    { name: 'Suriye',       x: 606, y: 153 },
    { name: 'Ermenistan',   x: 625, y: 139 },
    { name: 'Azerbaycan',   x: 631, y: 139 },
    { name: 'Rusya',        x: 603, y:  97 },
    { name: 'Ukrayna',      x: 586, y: 114 },
    { name: 'Özbekistan',   x: 675, y: 136 },
    { name: 'Sırbistan',    x: 558, y: 128 },
    { name: 'Bosna',        x: 547, y: 128 },
    { name: 'Arnavutluk',   x: 555, y: 136 },
    { name: 'K. Makedonya', x: 562, y: 136 },
  ];

  /* ----------------------------------------------------------
     Colours
     ---------------------------------------------------------- */
  const C = {
    bg:         '#FDF5F5',
    land:       '#EDD5D5',
    landStroke: '#C8A0A0',
    grid:       'rgba(107,0,0,0.06)',
    origin:     '#6B0000',
    dot:        '#8B1010',
    dotGlow:    'rgba(139,16,16,0.4)',
    line:       'rgba(107,0,0,0.45)',
    label:      'rgba(74,0,0,0.9)',
  };

  /* ----------------------------------------------------------
     Canvas setup
     ---------------------------------------------------------- */
  const canvas = document.getElementById('worldMap');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, scale = 1;
  let animFrame = 0;
  let lineProgress = Array(COUNTRIES.length).fill(0);

  function setSize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const w    = rect.width || 900;
    const h    = Math.min(Math.round(w * 0.48), 460);
    const dpr  = window.devicePixelRatio || 1;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
    W = w; H = h;
    scale = w / 1000;
  }

  function sx(x) { return x * scale; }
  function sy(y) { return y * scale * (H / (500 * scale)); }

  /* ----------------------------------------------------------
     Drawing helpers
     ---------------------------------------------------------- */
  function drawContinent(pts) {
    ctx.beginPath();
    ctx.moveTo(sx(pts[0][0]), sy(pts[0][1]));
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(sx(pts[i][0]), sy(pts[i][1]));
    }
    ctx.closePath();
  }

  function drawGrid() {
    ctx.strokeStyle = C.grid;
    ctx.lineWidth   = 0.5;
    // Horizontal lines every 30° lat
    for (let lat = -90; lat <= 90; lat += 30) {
      const y = (90 - lat) / 180 * 1000;
      ctx.beginPath();
      ctx.moveTo(0,    sy(y));
      ctx.lineTo(W,    sy(y));
      ctx.stroke();
    }
    // Vertical lines every 30° lon
    for (let lon = -180; lon <= 180; lon += 30) {
      const x = (lon + 180) / 360 * 1000;
      ctx.beginPath();
      ctx.moveTo(sx(x), 0);
      ctx.lineTo(sx(x), H);
      ctx.stroke();
    }
  }

  function drawLine(from, to, progress, dashed) {
    if (progress <= 0) return;
    const tx = from.x + (to.x - from.x) * progress;
    const ty = from.y + (to.y - from.y) * progress;
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2 - 25;

    ctx.beginPath();
    ctx.moveTo(sx(from.x), sy(from.y));
    ctx.quadraticCurveTo(sx(midX), sy(midY), sx(tx), sy(ty));
    if (dashed) ctx.setLineDash([4 * scale, 4 * scale]);
    ctx.strokeStyle = C.line;
    ctx.lineWidth   = 1 * scale;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawDot(x, y, t, isOrigin) {
    const r  = isOrigin ? 5 * scale : 3.5 * scale;
    const pr = isOrigin ? 12 * scale : 9 * scale;

    // Pulse ring
    const pulse = (t % 120) / 120;
    ctx.beginPath();
    ctx.arc(sx(x), sy(y), r + pr * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = isOrigin
      ? `rgba(107,0,0,${0.65 * (1 - pulse)})`
      : `rgba(139,16,16,${0.5 * (1 - pulse)})`;
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    // Glow
    const grd = ctx.createRadialGradient(sx(x), sy(y), 0, sx(x), sy(y), r * 3);
    grd.addColorStop(0, isOrigin ? 'rgba(255,80,80,0.5)' : C.dotGlow);
    grd.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(sx(x), sy(y), r * 3, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // Core dot
    ctx.beginPath();
    ctx.arc(sx(x), sy(y), r, 0, Math.PI * 2);
    ctx.fillStyle = isOrigin ? '#6B0000' : C.dot;
    ctx.fill();
  }

  /* ----------------------------------------------------------
     Main render loop
     ---------------------------------------------------------- */
  function render() {
    animFrame++;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    // Grid
    drawGrid();

    // Continents
    CONTINENTS.forEach(c => {
      drawContinent(c.pts);
      ctx.fillStyle   = C.land;
      ctx.fill();
      ctx.strokeStyle = C.landStroke;
      ctx.lineWidth   = 0.8 * scale;
      ctx.stroke();
    });

    // Advance line progress
    COUNTRIES.forEach((_, i) => {
      if (lineProgress[i] < 1) {
        lineProgress[i] = Math.min(lineProgress[i] + 0.008, 1);
      }
    });

    // Lines from Istanbul
    COUNTRIES.forEach((c, i) => {
      drawLine(ORIGIN, c, lineProgress[i], true);
    });

    // Country dots
    COUNTRIES.forEach(c => {
      if (lineProgress[COUNTRIES.indexOf(c)] > 0.9) {
        drawDot(c.x, c.y, animFrame + COUNTRIES.indexOf(c) * 8, false);
      }
    });

    // Origin dot (Istanbul) – always visible
    drawDot(ORIGIN.x, ORIGIN.y, animFrame, true);

    // Origin label
    ctx.font        = `bold ${Math.round(9 * scale)}px Montserrat, sans-serif`;
    ctx.fillStyle   = C.label;
    ctx.textAlign   = 'center';
    ctx.fillText('İstanbul', sx(ORIGIN.x), sy(ORIGIN.y) - 10 * scale);

    requestAnimationFrame(render);
  }

  /* ----------------------------------------------------------
     Init: observe when section enters viewport then start
     ---------------------------------------------------------- */
  function startMap() {
    setSize();
    window.addEventListener('resize', function () {
      setSize();
    }, { passive: true });
    render();
  }

  const section = document.getElementById('export');
  if (section) {
    const obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        startMap();
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(section);
  } else {
    startMap();
  }

})();
