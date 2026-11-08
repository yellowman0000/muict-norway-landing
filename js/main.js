/* ============================================================
   Faculty of ICT, Mahidol University — Week 14 landing page
   main.js
   - Fixed nav, mobile menu, scroll reveals, animated rankings
   - Signature feature: a stylised low-poly THREE.js model of the
     Faculty of ICT building (white slabs, cantilever, louvre fins,
     glass, podium steps) with a particle field and studio light.
   No frameworks, no network requests. Defensive throughout.
   ============================================================ */
(function () {
  'use strict';

  var doc = document;
  var body = doc.body;
  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (err) {
    reduceMotion = false;
  }

  body.classList.remove('no-js');
  body.classList.add('js-ready');

  /* ---------------------------------------------------------
     1. Nav: compact on scroll
     --------------------------------------------------------- */
  var nav = doc.getElementById('site-nav');
  var ticking = false;

  function onScrollNav() {
    if (!nav) return;
    var y = window.pageYOffset || doc.documentElement.scrollTop;
    nav.classList.toggle('is-scrolled', y > 24);
    var applyEl = doc.getElementById('apply');
    var inApply = applyEl && applyEl.getBoundingClientRect().top < window.innerHeight * 0.55;
    var stageEl = doc.getElementById('hero-stage');
    var inHero = stageEl
      ? stageEl.getBoundingClientRect().bottom > window.innerHeight * 0.5
      : y < 420;
    if (inHero || inApply) {
      Array.prototype.forEach.call(doc.querySelectorAll('[data-nav]'), function (link) {
        link.removeAttribute('aria-current');
      });
    }
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(onScrollNav);
      }
    },
    { passive: true }
  );
  onScrollNav();

  /* ---------------------------------------------------------
     2. Mobile menu
     --------------------------------------------------------- */
  var toggle = doc.getElementById('menu-toggle');
  var menu = doc.getElementById('mobile-menu');

  function menuIsOpen() {
    return !!menu && menu.classList.contains('is-open');
  }

  function setMenu(open, returnFocus) {
    if (!menu || !toggle) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) {
      menu.removeAttribute('inert');
    } else {
      menu.setAttribute('inert', '');
    }
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    body.classList.toggle('menu-open', open);
    if (open) {
      var first = menu.querySelector('a, button');
      if (first) {
        window.setTimeout(function () {
          try {
            first.focus();
          } catch (err) {}
        }, 140);
      }
    } else if (returnFocus) {
      try {
        toggle.focus();
      } catch (err) {}
    }
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setMenu(!menuIsOpen(), false);
    });
  }

  if (menu) {
    menu.addEventListener('click', function (event) {
      var target = event.target;
      if (target && target.closest && target.closest('a')) setMenu(false, false);
    });

    menu.addEventListener('keydown', function (event) {
      if (event.key === 'Tab' && menuIsOpen()) {
        var focusable = menu.querySelectorAll('a[href], button:not([disabled])');
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && doc.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && doc.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  doc.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menuIsOpen()) setMenu(false, true);
  });

  window.addEventListener(
    'resize',
    function () {
      if (menuIsOpen() && window.innerWidth > 1180) setMenu(false, false);
    },
    { passive: true }
  );

  /* ---------------------------------------------------------
     3. Scroll reveals
     --------------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(doc.querySelectorAll('[data-reveal]'));

  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.01 }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-in');
    });
  }

  /* ---------------------------------------------------------
     4. Ranking counters
     --------------------------------------------------------- */
  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    if (reduceMotion) {
      el.textContent = String(target);
      return;
    }
    var start = null;
    var duration = 1700;
    function frame(now) {
      if (start === null) start = now;
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  var counterEls = Array.prototype.slice.call(doc.querySelectorAll('[data-count]'));
  if ('IntersectionObserver' in window && !reduceMotion) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counterEls.forEach(function (el) {
      counterObserver.observe(el);
    });
  } else {
    counterEls.forEach(runCounter);
  }

  /* ---------------------------------------------------------
     5. Scroll spy for nav links
     --------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll('[data-nav]'));
  var spySections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href');
      return id && id.charAt(0) === '#' ? doc.querySelector(id) : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && spySections.length) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = '#' + entry.target.id;
          navLinks.forEach(function (link) {
            if (link.getAttribute('href') === id) {
              link.setAttribute('aria-current', 'true');
            } else {
              link.removeAttribute('aria-current');
            }
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    spySections.forEach(function (section) {
      spyObserver.observe(section);
    });
  }

  /* ---------------------------------------------------------
     6. Mobile sticky CTA visibility
     --------------------------------------------------------- */
  var mobileCta = doc.querySelector('.mobile-cta');
  var heroSection = doc.getElementById('top');
  var applySection = doc.getElementById('apply');

  if (mobileCta && heroSection && applySection && 'IntersectionObserver' in window) {
    var heroPast = false;
    var applyVisible = false;

    function syncMobileCta() {
      mobileCta.classList.toggle('is-visible', heroPast && !applyVisible && !menuIsOpen());
    }

    var heroObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          heroPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        });
        syncMobileCta();
      },
      { threshold: 0 }
    );
    heroObserver.observe(heroSection);

    var applyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          applyVisible = entry.isIntersecting;
        });
        syncMobileCta();
      },
      { threshold: 0.15 }
    );
    applyObserver.observe(applySection);
  }

  /* ---------------------------------------------------------
     7. Signature 3D scene
     --------------------------------------------------------- */
  function initHero3D() {
    var canvas = doc.getElementById('hero-canvas');
    var hero = doc.getElementById('top');
    var heroStage = doc.getElementById('hero-stage');
    if (!canvas || !hero) return;

    if (typeof window.THREE === 'undefined' || !window.THREE.WebGLRenderer) {
      body.classList.add('no-webgl');
      body.setAttribute('data-3d', 'no-three');
      return;
    }
    var THREE = window.THREE;

    /* WebGL capability probe on a throw-away canvas. */
    var probe = doc.createElement('canvas');
    var probeGl = null;
    try {
      probeGl = probe.getContext('webgl') || probe.getContext('experimental-webgl');
    } catch (err) {
      probeGl = null;
    }
    if (!probeGl) {
      body.classList.add('no-webgl');
      body.setAttribute('data-3d', 'no-webgl');
      return;
    }

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch (err) {
      body.classList.add('no-webgl');
      body.setAttribute('data-3d', 'renderer-failed');
      return;
    }

    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07080c, 0.021);

    var camera = new THREE.PerspectiveCamera(33, 1, 0.5, 160);

    /* ---- procedural gradient environment for reflections ---- */
    function radial(ctx, x, y, r, color) {
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    var envTexture = null;
    try {
      var envCanvas = doc.createElement('canvas');
      envCanvas.width = 1024;
      envCanvas.height = 512;
      var envCtx = envCanvas.getContext('2d');
      var grad = envCtx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#1d2f4f');
      grad.addColorStop(0.4, '#0c1526');
      grad.addColorStop(1, '#04060a');
      envCtx.fillStyle = grad;
      envCtx.fillRect(0, 0, 1024, 512);
      radial(envCtx, 240, 110, 360, 'rgba(190,215,250,0.6)');
      radial(envCtx, 810, 180, 290, 'rgba(91,155,255,0.4)');
      radial(envCtx, 520, 470, 420, 'rgba(255,255,255,0.06)');

      envTexture = new THREE.CanvasTexture(envCanvas);
      envTexture.mapping = THREE.EquirectangularReflectionMapping;
      envTexture.encoding = THREE.sRGBEncoding;

      if (THREE.PMREMGenerator) {
        var pmrem = new THREE.PMREMGenerator(renderer);
        pmrem.compileEquirectangularShader();
        var envRT = pmrem.fromEquirectangular(envTexture);
        scene.environment = envRT.texture;
        envTexture.dispose();
        pmrem.dispose();
        envTexture = null;
      }
    } catch (err) {
      envTexture = null;
    }

    /* ---- lights ---- */
    var hemi = new THREE.HemisphereLight(0xd6e4ff, 0x0a101c, 0.85);
    scene.add(hemi);

    var key = new THREE.DirectionalLight(0xffffff, 2.6);
    key.position.set(-12, 21, 16);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -22;
    key.shadow.camera.right = 22;
    key.shadow.camera.top = 22;
    key.shadow.camera.bottom = -22;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 90;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.035;
    scene.add(key);

    var rim = new THREE.DirectionalLight(0x5b9bff, 1.75);
    rim.position.set(14, 6, -12);
    scene.add(rim);

    var fill = new THREE.DirectionalLight(0xbfd4ff, 0.5);
    fill.position.set(4, 3, 16);
    scene.add(fill);

    var warm = new THREE.PointLight(0xffc98a, 0.5, 26, 2);
    warm.position.set(3.4, 1.6, 6.4);
    scene.add(warm);

    /* ---- procedural textures (generated locally, no files) ---- */
    function makeWindowsTexture(cols, rows) {
      var c = doc.createElement('canvas');
      c.width = 512;
      c.height = 256;
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#050b13';
      ctx.fillRect(0, 0, 512, 256);
      var cw = 512 / cols;
      var ch = 256 / rows;
      for (var row = 0; row < rows; row++) {
        for (var col = 0; col < cols; col++) {
          if (Math.random() > 0.62) continue;
          var warm = Math.random() < 0.55;
          var a = 0.16 + Math.random() * 0.5;
          ctx.fillStyle = warm
            ? 'rgba(255, 214, 160, ' + a.toFixed(2) + ')'
            : 'rgba(150, 190, 255, ' + a.toFixed(2) + ')';
          ctx.fillRect(col * cw + 2, row * ch + 3, cw - 4, ch - 6);
        }
      }
      ctx.strokeStyle = 'rgba(4, 8, 14, 0.9)';
      ctx.lineWidth = 2;
      for (var line = 0; line <= rows; line++) {
        ctx.beginPath();
        ctx.moveTo(0, line * ch);
        ctx.lineTo(512, line * ch);
        ctx.stroke();
      }
      var texture = new THREE.CanvasTexture(c);
      texture.encoding = THREE.sRGBEncoding;
      return texture;
    }

    function makePavingTexture() {
      var c = doc.createElement('canvas');
      c.width = 256;
      c.height = 256;
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#b9bec6';
      ctx.fillRect(0, 0, 256, 256);
      for (var i = 0; i < 1200; i++) {
        ctx.fillStyle = 'rgba(84, 90, 102, ' + (Math.random() * 0.07).toFixed(3) + ')';
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
      }
      ctx.strokeStyle = 'rgba(78, 84, 96, 0.2)';
      ctx.lineWidth = 1;
      for (var g = 0; g <= 256; g += 32) {
        ctx.beginPath();
        ctx.moveTo(g, 0);
        ctx.lineTo(g, 256);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, g);
        ctx.lineTo(256, g);
        ctx.stroke();
      }
      var texture = new THREE.CanvasTexture(c);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(9, 4);
      texture.encoding = THREE.sRGBEncoding;
      return texture;
    }

    function makeLawnTexture() {
      var c = doc.createElement('canvas');
      c.width = 256;
      c.height = 256;
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#1a2b1f';
      ctx.fillRect(0, 0, 256, 256);
      for (var i = 0; i < 2600; i++) {
        var g = 30 + Math.random() * 42;
        ctx.fillStyle =
          'rgba(' + Math.round(g * 0.55) + ',' + Math.round(g) + ',' + Math.round(g * 0.6) + ',0.35)';
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
      }
      var texture = new THREE.CanvasTexture(c);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(16, 8);
      texture.encoding = THREE.sRGBEncoding;
      return texture;
    }

    var windowTex = makeWindowsTexture(16, 8);
    var windowTexGround = makeWindowsTexture(10, 3);
    var pavingTex = makePavingTexture();
    var lawnTex = makeLawnTexture();

    /* ---- materials: white/silver fins, blue glass, teal + cream mark ---- */
    var matWhite = new THREE.MeshStandardMaterial({
      color: 0xe6e9ee,
      roughness: 0.5,
      metalness: 0.05,
      envMapIntensity: 0.9
    });
    var matWhiteEdge = new THREE.MeshStandardMaterial({
      color: 0xf3f5f8,
      roughness: 0.32,
      metalness: 0.08,
      envMapIntensity: 1.15
    });
    var matFin = new THREE.MeshStandardMaterial({
      color: 0xf2f4f7,
      roughness: 0.4,
      metalness: 0.2,
      envMapIntensity: 1.15,
      side: THREE.DoubleSide
    });
    var matGlass = new THREE.MeshStandardMaterial({
      color: 0x8fb0cc,
      roughness: 0.12,
      metalness: 0.85,
      envMapIntensity: 1.6,
      emissive: 0xffffff,
      emissiveMap: windowTex,
      emissiveIntensity: 0.65
    });
    var matGlassDark = new THREE.MeshStandardMaterial({
      color: 0x22303c,
      roughness: 0.15,
      metalness: 0.85,
      envMapIntensity: 1.5,
      emissive: 0xffffff,
      emissiveMap: windowTexGround,
      emissiveIntensity: 0.85
    });
    var matMullion = new THREE.MeshStandardMaterial({
      color: 0xf6f7f9,
      roughness: 0.3,
      metalness: 0.2,
      envMapIntensity: 1.2
    });
    var matColumn = new THREE.MeshStandardMaterial({
      color: 0x171b21,
      roughness: 0.4,
      metalness: 0.55,
      envMapIntensity: 0.9
    });
    var matStone = new THREE.MeshStandardMaterial({
      color: 0xc9cdd4,
      roughness: 0.82,
      metalness: 0.04,
      envMapIntensity: 0.6,
      map: pavingTex
    });
    var matTeal = new THREE.MeshStandardMaterial({
      color: 0x0e8f82,
      emissive: 0x0e8f82,
      emissiveIntensity: 0.4,
      roughness: 0.4,
      metalness: 0.25
    });
    var matCream = new THREE.MeshStandardMaterial({
      color: 0xf4ecdf,
      emissive: 0xf4ecdf,
      emissiveIntensity: 0.2,
      roughness: 0.5
    });
    var matLawn = new THREE.MeshStandardMaterial({
      color: 0x27412f,
      roughness: 0.96,
      metalness: 0,
      map: lawnTex
    });
    var matGlow = new THREE.MeshStandardMaterial({
      color: 0x0a1018,
      emissive: 0xcfe2ff,
      emissiveIntensity: 1.2,
      roughness: 1
    });
    var matWarmGlow = new THREE.MeshStandardMaterial({
      color: 0x0a1018,
      emissive: 0xffca8f,
      emissiveIntensity: 1.3,
      roughness: 1
    });

    /* ---- building group ---- */
    var group = new THREE.Group();
    group.rotation.y = -0.28;
    scene.add(group);

    function addBox(w, h, d, mat, x, y, z) {
      var mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    }

    /* A screen of vertical white fins that undulate like the real facade.
       Fins are distributed along a wall and wave in depth as they rise. */
    function buildFinWall(cfg) {
      var count = cfg.count;
      var spacing = cfg.spacing;
      var segs = 8;
      var width = cfg.width;
      var depth = cfg.depth;
      var height = cfg.height;
      var amp = cfg.amp;
      var waves = cfg.waves;
      var phaseStep = cfg.phaseStep || 0.42;
      var rotY = cfg.rotY || 0;
      var cos = Math.cos(rotY);
      var sin = Math.sin(rotY);
      var positions = [];
      var indices = [];
      for (var i = 0; i < count; i++) {
        var base = positions.length / 3;
        var phase = i * phaseStep + (cfg.phaseOffset || 0);
        var cx = (i - (count - 1) / 2) * spacing;
        for (var j = 0; j <= segs; j++) {
          var t = j / segs;
          var y = t * height;
          var zOff = amp * Math.sin(t * Math.PI * 2 * waves + phase);
          var corners = [
            [-width / 2, zOff - depth / 2],
            [width / 2, zOff - depth / 2],
            [width / 2, zOff + depth / 2],
            [-width / 2, zOff + depth / 2]
          ];
          for (var k = 0; k < 4; k++) {
            var lx = cx + corners[k][0];
            var lz = corners[k][1];
            positions.push(
              cfg.x + lx * cos + lz * sin,
              cfg.y + y,
              cfg.z - lx * sin + lz * cos
            );
          }
        }
        for (var step = 0; step < segs; step++) {
          var a = base + step * 4;
          var b = base + (step + 1) * 4;
          indices.push(a, a + 1, b + 1, a, b + 1, b);
          indices.push(a + 2, a + 3, b + 3, a + 2, b + 3, b + 2);
          indices.push(a + 3, a, b, a + 3, b, b + 3);
          indices.push(a + 1, a + 2, b + 2, a + 1, b + 2, b + 1);
        }
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      var mesh = new THREE.Mesh(geo, matFin);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }

    /* ================= Faculty of ICT building =================
       Inspired by the official render: a long white complex with
       undulating vertical-fin facades, a recessed glazed atrium grid,
       a cantilevered right wing on dark columns, a silver core
       cylinder, stone podium steps and the teal ICT mark. */

    /* Podium and steps. */
    addBox(17.6, 0.5, 6.2, matStone, 0, 0.25, 0.2);
    addBox(16.8, 0.36, 1.3, matStone, 0, 0.18, 4.0);
    addBox(16.2, 0.24, 1.3, matStone, 0, 0.12, 5.3);
    addBox(15.6, 0.12, 1.3, matStone, 0, 0.06, 6.6);
    addBox(16.82, 0.05, 0.06, matWhiteEdge, 0, 0.36, 4.66);
    addBox(16.22, 0.05, 0.06, matWhiteEdge, 0, 0.24, 5.96);
    addBox(15.62, 0.05, 0.06, matWhiteEdge, 0, 0.12, 7.26);

    /* Left wing: body, full-height glazing, wavy fin screens. */
    addBox(6.1, 6.9, 4.6, matWhite, -5.3, 3.95, -0.1);
    addBox(5.9, 6.8, 0.12, matGlass, -5.3, 3.9, 2.21);
    addBox(0.12, 6.8, 4.4, matGlass, -8.32, 3.9, -0.1);
    addBox(5.9, 1.6, 0.14, matGlassDark, -5.3, 1.3, 2.24);
    addBox(6.0, 0.16, 4.7, matWhiteEdge, -5.3, 7.44, -0.1);
    addBox(7.2, 0.24, 4.2, matWhiteEdge, -4.75, 7.58, 1.5);

    buildFinWall({ count: 16, spacing: 0.4, x: -5.3, y: 0.5, z: 2.38, width: 0.16, depth: 0.5, height: 6.85, amp: 0.24, waves: 1.3, phaseStep: 0.42 });
    buildFinWall({ count: 12, spacing: 0.4, x: -8.42, y: 0.5, z: -0.1, width: 0.16, depth: 0.5, height: 6.85, amp: 0.24, waves: 1.3, phaseStep: 0.42, rotY: -Math.PI / 2 });
    buildFinWall({ count: 12, spacing: 0.4, x: -5.3, y: 0.5, z: -2.52, width: 0.16, depth: 0.5, height: 6.85, amp: 0.24, waves: 1.3, phaseStep: 0.42, rotY: Math.PI });

    /* Right wing: cantilevered white volume over a dark glazed base. */
    addBox(5.7, 5.9, 4.9, matWhite, 5.5, 6.35, 0.05);
    addBox(5.5, 5.85, 0.12, matGlass, 5.5, 6.32, 2.52);
    addBox(0.12, 5.85, 4.5, matGlass, 8.32, 6.32, 0.05);
    addBox(5.9, 0.18, 5.1, matWhiteEdge, 5.5, 3.42, 0.05);
    addBox(5.9, 0.2, 5.1, matWhiteEdge, 5.5, 9.42, 0.05);
    addBox(5.3, 2.9, 0.14, matGlassDark, 5.55, 1.95, 2.14);
    addBox(0.14, 2.9, 4.1, matGlassDark, 8.32, 1.95, -0.1);
    addBox(0.22, 2.95, 0.22, matColumn, 3.5, 1.95, 2.36);
    addBox(0.22, 2.95, 0.22, matColumn, 4.9, 1.95, 2.36);
    addBox(0.22, 2.95, 0.22, matColumn, 6.3, 1.95, 2.36);
    addBox(0.22, 2.95, 0.22, matColumn, 7.8, 1.95, 2.36);

    buildFinWall({ count: 15, spacing: 0.4, x: 5.5, y: 3.4, z: 2.78, width: 0.16, depth: 0.5, height: 5.85, amp: 0.27, waves: 1.6, phaseStep: 0.42 });
    buildFinWall({ count: 12, spacing: 0.38, x: 8.46, y: 3.4, z: 0.05, width: 0.16, depth: 0.5, height: 5.85, amp: 0.27, waves: 1.6, phaseStep: 0.42, rotY: Math.PI / 2 });
    buildFinWall({ count: 15, spacing: 0.4, x: 5.5, y: 3.4, z: -2.52, width: 0.16, depth: 0.5, height: 5.85, amp: 0.27, waves: 1.6, phaseStep: 0.42, rotY: Math.PI });

    /* Central glazed atrium with its white grid. */
    addBox(4.9, 8.0, 0.12, matGlass, 0.25, 4.5, 0.95);
    addBox(0.18, 8.3, 0.34, matWhiteEdge, -2.2, 4.45, 1.0);
    addBox(0.18, 8.3, 0.34, matWhiteEdge, 2.7, 4.45, 1.0);
    addBox(5.2, 0.22, 0.34, matWhiteEdge, 0.25, 8.53, 1.0);
    addBox(5.2, 0.18, 0.5, matWhiteEdge, 0.25, 0.55, 1.1);
    for (var mx = 0; mx < 9; mx++) {
      addBox(0.06, 7.9, 0.12, matMullion, -2.05 + mx * 0.575, 4.5, 1.03);
    }
    for (var my = 0; my < 9; my++) {
      addBox(4.75, 0.06, 0.12, matMullion, 0.25, 0.62 + my * 0.97, 1.03);
    }
    addBox(5.6, 0.32, 2.6, matWhiteEdge, 0.25, 8.74, 0.35);

    /* Back facade: glazed bands and a closed atrium rear. */
    addBox(5.9, 6.8, 0.12, matGlass, -5.3, 3.9, -2.38);
    addBox(5.5, 5.85, 0.12, matGlass, 5.5, 6.32, -2.68);
    addBox(5.9, 1.6, 0.14, matGlassDark, -5.3, 1.3, -2.4);
    addBox(5.3, 2.9, 0.14, matGlassDark, 5.55, 1.95, -2.38);
    addBox(4.9, 8.0, 0.12, matGlass, 0.25, 4.5, -1.7);
    addBox(0.18, 8.3, 0.34, matWhiteEdge, -2.2, 4.45, -1.68);
    addBox(0.18, 8.3, 0.34, matWhiteEdge, 2.7, 4.45, -1.68);
    addBox(5.2, 0.22, 0.34, matWhiteEdge, 0.25, 8.53, -1.68);
    addBox(5.2, 0.18, 0.4, matWhiteEdge, 0.25, 0.55, -1.72);
    for (var bx = 0; bx < 5; bx++) {
      addBox(0.07, 7.9, 0.1, matMullion, -1.65 + bx * 0.95, 4.5, -1.75);
    }

    /* Silver core cylinder between the left wing and the atrium. */
    var coreCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 7.9, 18), matWhiteEdge);
    coreCylinder.position.set(-1.95, 4.5, 1.95);
    coreCylinder.castShadow = true;
    coreCylinder.receiveShadow = true;
    group.add(coreCylinder);

    /* Entrance canopy and warm interior bands. */
    addBox(3.6, 0.16, 1.1, matWhiteEdge, 0.25, 3.0, 1.9);
    addBox(2.9, 0.05, 0.05, matWarmGlow, 0.25, 2.9, 2.42);
    addBox(5.7, 0.03, 0.03, matGlow, 5.5, 3.3, 2.72);
    addBox(7.0, 0.03, 0.03, matGlow, -4.75, 7.44, 3.55);
    addBox(4.8, 0.03, 0.03, matGlow, 0.25, 8.5, 1.68);

    /* ICT hexagon mark on the top-right of the right wing. */
    function addHexMark(x, y, r) {
      var hex = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.06, 6), matTeal);
      hex.rotation.x = Math.PI / 2;
      hex.position.set(x, y, 3.44);
      group.add(hex);
      var inner = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.42, r * 0.42, 0.08, 6), matCream);
      inner.rotation.x = Math.PI / 2;
      inner.position.set(x, y, 3.48);
      group.add(inner);
    }
    addHexMark(7.32, 8.72, 0.4);
    addHexMark(6.96, 8.22, 0.4);
    addHexMark(7.68, 8.22, 0.4);

    /* Landscaped lawn in front of the podium. */
    var lawn = new THREE.Mesh(new THREE.PlaneGeometry(70, 22), matLawn);
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.set(0.5, 0.02, 16.5);
    lawn.receiveShadow = true;
    scene.add(lawn);

    /* Warm interior spill lights for the glazed ground floors. */
    var entranceLight = new THREE.PointLight(0xffc98a, 1.2, 15, 2);
    entranceLight.position.set(0.4, 1.7, 3.2);
    scene.add(entranceLight);
    var rightSpill = new THREE.PointLight(0xffc98a, 1.0, 14, 2);
    rightSpill.position.set(5.8, 1.9, 3.4);
    scene.add(rightSpill);
    var leftSpill = new THREE.PointLight(0xffc98a, 0.9, 14, 2);
    leftSpill.position.set(-5.2, 1.7, 3.3);
    scene.add(leftSpill);

    /* ---- ground, light pool, grid ---- */
    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 160),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.6 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    /* Soft radial pool of light baked to a canvas texture. */
    var poolCanvas = doc.createElement('canvas');
    poolCanvas.width = 256;
    poolCanvas.height = 256;
    var poolCtx = poolCanvas.getContext('2d');
    var poolGrad = poolCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
    poolGrad.addColorStop(0, 'rgba(70,120,200,0.4)');
    poolGrad.addColorStop(0.45, 'rgba(40,75,140,0.16)');
    poolGrad.addColorStop(1, 'rgba(0,0,0,0)');
    poolCtx.fillStyle = poolGrad;
    poolCtx.fillRect(0, 0, 256, 256);
    var poolTex = new THREE.CanvasTexture(poolCanvas);
    var pool = new THREE.Mesh(
      new THREE.PlaneGeometry(44, 44),
      new THREE.MeshBasicMaterial({
        map: poolTex,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(0.3, 0.03, 1.6);
    scene.add(pool);

    /* Soft contact shadow beneath the podium. */
    var contactCanvas = doc.createElement('canvas');
    contactCanvas.width = 256;
    contactCanvas.height = 256;
    var contactCtx = contactCanvas.getContext('2d');
    var contactGrad = contactCtx.createRadialGradient(128, 128, 10, 128, 128, 126);
    contactGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
    contactGrad.addColorStop(0.55, 'rgba(0,0,0,0.35)');
    contactGrad.addColorStop(1, 'rgba(0,0,0,0)');
    contactCtx.fillStyle = contactGrad;
    contactCtx.fillRect(0, 0, 256, 256);
    var contact = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 26),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(contactCanvas),
        transparent: true,
        opacity: 0.8,
        depthWrite: false
      })
    );
    contact.rotation.x = -Math.PI / 2;
    contact.position.set(0, 0.045, 1.4);
    scene.add(contact);

    var grid = new THREE.GridHelper(70, 70, 0x17325c, 0x0d1a2e);
    grid.position.y = 0.03;
    if (grid.material) {
      grid.material.transparent = true;
      grid.material.opacity = 0.42;
      grid.material.depthWrite = false;
    }
    scene.add(grid);

    /* Faint turntable ring under the building. */
    var ring = new THREE.Mesh(
      new THREE.RingGeometry(10.6, 10.68, 96),
      new THREE.MeshBasicMaterial({
        color: 0x5b9bff,
        transparent: true,
        opacity: 0.28,
        depthWrite: false
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    scene.add(ring);

    /* ---- particle field ---- */
    var isSmall = window.innerWidth < 760;
    var particleCount = isSmall ? 380 : 720;
    var positions = new Float32Array(particleCount * 3);
    var speeds = new Float32Array(particleCount);

    for (var p = 0; p < particleCount; p++) {
      var angle = Math.random() * Math.PI * 2;
      var radius = 7 + Math.random() * 15;
      positions[p * 3] = Math.cos(angle) * radius;
      positions[p * 3 + 1] = 0.6 + Math.random() * 15;
      positions[p * 3 + 2] = Math.sin(angle) * radius + 1;
      speeds[p] = 0.14 + Math.random() * 0.45;
    }

    var particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    var particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        color: 0x7fb2ff,
        size: 0.09,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    scene.add(particles);

    /* A sparse layer of larger, softer motes for depth. */
    var moteCount = isSmall ? 26 : 52;
    var motePositions = new Float32Array(moteCount * 3);
    for (var m = 0; m < moteCount; m++) {
      var mAngle = Math.random() * Math.PI * 2;
      var mRadius = 9 + Math.random() * 12;
      motePositions[m * 3] = Math.cos(mAngle) * mRadius;
      motePositions[m * 3 + 1] = 1 + Math.random() * 11;
      motePositions[m * 3 + 2] = Math.sin(mAngle) * mRadius + 1;
    }
    var moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
    var motes = new THREE.Points(
      moteGeo,
      new THREE.PointsMaterial({
        color: 0x9cc4ff,
        size: 0.34,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    scene.add(motes);

    /* ---- framing ---- */
    var BASE = { x: 20.2, y: 9.0, z: 29.4 };
    var TARGET = { x: 0.3, y: 4.4, z: 0.3 };
    var camPos = { x: BASE.x, y: BASE.y, z: BASE.z };
    var lookAt = { x: TARGET.x, y: TARGET.y, z: TARGET.z };
    var cameraDolly = 0;
    var viewShift = 0.165;
    var pointerX = 0;
    var pointerY = 0;
    var autoSpin = -0.28;
    var scrollProgress = 0;
    var dragAngle = 0;
    var dragTilt = 0;
    var spinImpulse = 0;
    var dragging = false;
    var dragMoved = false;
    var dragStartX = 0;
    var dragStartY = 0;
    var dragStartAngle = 0;
    var dragStartTilt = 0;

    function isMobileLayout() {
      return window.innerWidth < 760;
    }

    function isPinnedLayout() {
      if (!heroStage || window.innerWidth < 900) return false;
      if (reduceMotion) return false;
      if (body.classList.contains('no-webgl')) return false;
      return true;
    }

    function frameScene() {
      var w = canvas.clientWidth || 1;
      var h = canvas.clientHeight || 1;
      var mobile = isMobileLayout();
      if (mobile) {
        camera.fov = 42;
        camera.clearViewOffset();
        viewShift = 0;
      } else {
        camera.fov = 33;
        if (camera.setViewOffset) {
          camera.setViewOffset(w, h, -w * viewShift, 0, w, h);
        }
      }
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
    }

    function updateCamera(dt) {
      var mobile = isMobileLayout();
      var aspectFactor = camera.aspect > 1.6 ? 1 : Math.min(1.28, 1.6 / (camera.aspect || 1.6));
      var scale = mobile ? 0.82 : aspectFactor;
      var dolly = 1 - scrollProgress * 0.07;
      var targetX = BASE.x * scale * dolly + pointerX * (mobile ? 0.6 : 1.5);
      var targetY = BASE.y * scale * dolly - pointerY * (mobile ? 0.35 : 0.9) - scrollProgress * 0.9;
      var targetZ = BASE.z * scale * dolly;
      var damping = 1 - Math.exp(-dt * 3.4);
      camPos.x += (targetX - camPos.x) * damping;
      camPos.y += (targetY - camPos.y) * damping;
      camPos.z += (targetZ - camPos.z) * damping;

      var lookX = TARGET.x + pointerX * (mobile ? 0.25 : 0.5);
      var lookY = TARGET.y - pointerY * (mobile ? 0.15 : 0.3) - scrollProgress * 0.35;
      lookAt.x += (lookX - lookAt.x) * damping;
      lookAt.y += (lookY - lookAt.y) * damping;
      lookAt.z += (TARGET.z - lookAt.z) * damping;

      camera.position.set(camPos.x, camPos.y, camPos.z);
      camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
    }

    /* ---- animation ---- */
    var clock = new THREE.Clock();
    var elapsed = 0;
    var rafId = null;
    var running = false;
    var visible = true;
    var firstFrameDone = false;
    var failed = false;

    function readScroll() {
      var progress = 0;
      if (isPinnedLayout()) {
        var stageRect = heroStage.getBoundingClientRect();
        var travel = heroStage.offsetHeight - window.innerHeight;
        progress = travel > 0 ? -stageRect.top / travel : 0;
      } else {
        var rect = hero.getBoundingClientRect();
        progress = -rect.top / (rect.height || 1);
      }
      scrollProgress = Math.max(0, Math.min(1, progress));
    }

    function onPointerMove(event) {
      if (reduceMotion || isMobileLayout()) return;
      var w = window.innerWidth || 1;
      var h = window.innerHeight || 1;
      pointerX = (event.clientX / w - 0.5) * 2;
      pointerY = (event.clientY / h - 0.5) * 2;
    }

    function onPointerLeave() {
      pointerX = 0;
      pointerY = 0;
    }

    function addSpin(amount) {
      spinImpulse = Math.min(spinImpulse + amount, 11);
      if (!running) start();
    }

    function ensureLoop() {
      if (!running && visible && !failed) start();
    }

    function onCanvasPointerDown(event) {
      ensureLoop();
      dragging = true;
      dragMoved = false;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      dragStartAngle = dragAngle;
      dragStartTilt = dragTilt;
      canvas.classList.add('is-dragging');
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch (err) {}
    }

    function onCanvasPointerMove(event) {
      if (!dragging) return;
      var dx = event.clientX - dragStartX;
      var dy = event.clientY - dragStartY;
      if (Math.abs(dx) + Math.abs(dy) > 4) dragMoved = true;
      dragAngle = dragStartAngle + dx * 0.0075;
      dragTilt = Math.max(-0.38, Math.min(0.38, dragStartTilt + dy * 0.0026));
    }

    function endCanvasDrag(event) {
      if (!dragging) return;
      dragging = false;
      canvas.classList.remove('is-dragging');
      try {
        if (event && event.pointerId !== undefined) canvas.releasePointerCapture(event.pointerId);
      } catch (err) {}
      if (!dragMoved) addSpin(5.5);
      if (reduceMotion) spinImpulse = Math.max(spinImpulse, 0.4);
    }


    function animateParticles(dt) {
      var arr = particleGeo.attributes.position.array;
      for (var i = 0; i < particleCount; i++) {
        arr[i * 3 + 1] += speeds[i] * dt;
        if (arr[i * 3 + 1] > 16) arr[i * 3 + 1] = 0.4;
      }
      particleGeo.attributes.position.needsUpdate = true;
      particles.rotation.y += dt * 0.012;
    }

    function renderFrame() {
      if (failed) return;
      try {
        renderer.render(scene, camera);
      } catch (err) {
        failed = true;
        running = false;
        if (rafId) window.cancelAnimationFrame(rafId);
        rafId = null;
        body.classList.add('no-webgl');
        body.setAttribute('data-3d', 'render-failed');
        return;
      }
      if (!firstFrameDone) {
        firstFrameDone = true;
        body.classList.add('has-webgl');
        body.setAttribute('data-3d', 'ok');
        body.setAttribute('data-3d-layout', isMobileLayout() ? 'mobile' : 'desktop');
      }
    }

    function tick() {
      rafId = null;
      if (!running) return;
      var dt = Math.min(clock.getDelta(), 0.05);
      elapsed += dt;

      if (reduceMotion) {
        /* User-initiated motion only: no auto-spin, no scroll spin, no parallax.
           Clicking or dragging still turns the model (an explicit request), and the
           loop stops again as soon as the model settles. */
        autoSpin += spinImpulse * dt;
        spinImpulse *= Math.exp(-dt * 1.15);
        var stillTargetY = autoSpin + dragAngle;
        var stillTargetX = dragTilt;
        var stillDamping = 1 - Math.exp(-dt * 6);
        group.rotation.y += (stillTargetY - group.rotation.y) * stillDamping;
        group.rotation.x += (stillTargetX - group.rotation.x) * stillDamping;
        renderFrame();
        if (dragging || spinImpulse > 0.03) {
          rafId = window.requestAnimationFrame(tick);
        } else {
          running = false;
        }
        return;
      }

      autoSpin += (0.2 + spinImpulse) * dt;
      spinImpulse *= Math.exp(-dt * 1.15);
      var easedScroll = scrollProgress * scrollProgress * (3 - 2 * scrollProgress);
      var scrollSpin = easedScroll * (isPinnedLayout() ? Math.PI * 2.0 : 1.25);
      var targetRotY = autoSpin + scrollSpin + pointerX * 0.16 + dragAngle;
      var targetRotX = Math.sin(elapsed * 0.35) * 0.012 + pointerY * 0.02 + dragTilt;
      var damping = 1 - Math.exp(-dt * 4.2);
      group.rotation.y += (targetRotY - group.rotation.y) * damping;
      group.rotation.x += (targetRotX - group.rotation.x) * damping;
      group.position.y = Math.sin(elapsed * 0.6) * 0.045;

      updateCamera(dt);
      animateParticles(dt);
      motes.rotation.y -= dt * 0.02;
      ring.rotation.z += dt * 0.05;
      particles.material.opacity = 0.5 + Math.sin(elapsed * 0.8) * 0.1;

      renderFrame();
      if (running) rafId = window.requestAnimationFrame(tick);
    }

    function start() {
      if (running || failed) return;
      running = true;
      clock.getDelta();
      rafId = window.requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    /* ---- listeners ---- */
    var resizeTimer = null;
    window.addEventListener(
      'resize',
      function () {
        if (resizeTimer) window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function () {
          frameScene();
          readScroll();
          if (!running && visible) {
            renderFrame();
            if (!reduceMotion) start();
          }
        }, 140);
      },
      { passive: true }
    );

    window.addEventListener('scroll', readScroll, { passive: true });
    document.addEventListener('mousemove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave, { passive: true });

    canvas.addEventListener('pointerdown', onCanvasPointerDown);
    canvas.addEventListener('pointermove', onCanvasPointerMove, { passive: true });
    canvas.addEventListener('pointerup', endCanvasDrag);
    canvas.addEventListener('pointercancel', endCanvasDrag);
    canvas.addEventListener('pointerleave', function () {
      if (dragging) endCanvasDrag();
    });

    function onVisibilityChange() {
      if (doc.hidden) {
        stop();
      } else if (visible && !reduceMotion) {
        start();
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    if ('IntersectionObserver' in window) {
      var sceneObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            visible = entry.isIntersecting;
            if (visible && !reduceMotion) {
              start();
            } else if (!visible) {
              stop();
            }
          });
        },
        { threshold: 0 }
      );
      sceneObserver.observe(hero);
    }

    /* ---- boot ---- */
    try {
      frameScene();
      readScroll();
      camera.position.set(camPos.x, camPos.y, camPos.z);
      camera.lookAt(lookAt.x, lookAt.y, lookAt.z);

      if (reduceMotion) {
        /* One composed still frame; no motion, no loop. */
        renderFrame();
      } else {
        renderFrame();
        start();
      }
    } catch (err) {
      failed = true;
      body.classList.add('no-webgl');
      body.setAttribute('data-3d', 'init-failed');
    }
  }

  try {
    initHero3D();
  } catch (err) {
    body.classList.add('no-webgl');
    body.setAttribute('data-3d', 'exception');
  }
})();
