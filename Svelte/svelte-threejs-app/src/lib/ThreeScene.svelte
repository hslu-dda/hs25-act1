<script>
  // Svelte Lifecycle-Funktion importieren
  import { onMount } from "svelte";
  // Three.js Hauptbibliothek importieren
  import * as THREE from "three";
  // OrbitControls für Kamera-Steuerung importieren
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  //  Linien-Module für dickere Kanten importieren
  import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
  import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
  import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

  // Variable für den DOM-Container
  let container;

  // onMount wird ausgeführt, wenn die Komponente im DOM geladen ist
  onMount(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0e0e0);

    // === ISOMETRISCHE KAMERA ===
    // Seitenverhältnis des Browserfensters berechnen
    const aspect = window.innerWidth / window.innerHeight;
    // Größe des sichtbaren Bereichs definieren
    const frustumSize = 30;

    // Orthographische Kamera für isometrische Ansicht erstellen
    // (keine Perspektive, parallele Linien bleiben parallel)
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2, // linke Grenze
      (frustumSize * aspect) / 2, // rechte Grenze
      frustumSize / 2, // obere Grenze
      frustumSize / -2, // untere Grenze
      0.1, // Near-Clipping-Ebene
      1000 // Far-Clipping-Ebene
    );

    // Kamera positionieren (isometrischer Winkel: 45°)
    camera.position.set(20, 20, 20);
    // Kamera auf den Ursprung ausrichten
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Maus-/Touch-Steuerung für die Kamera
    const controls = new OrbitControls(camera, renderer.domElement);
    // Sanfte Bewegungen aktivieren
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Steuerungsoptionen aktivieren/deaktivieren
    controls.enableRotate = true; // Rotation erlauben
    controls.enableZoom = true; // Zoom erlauben
    controls.enablePan = false; // Verschieben deaktivieren

    // Vertikale Rotation begrenzen für isometrische Ansicht
    controls.minPolarAngle = Math.PI / 4; // 45 Grad (gesperrt)
    controls.maxPolarAngle = Math.PI / 4; // 45 Grad (gesperrt)

    // Zoom-Bereich begrenzen
    controls.minDistance = 20; // Minimale Entfernung
    controls.maxDistance = 60; // Maximale Entfernung

    // Event-Handler für Pfeiltasten
    const handleKeyPress = (e) => {
      // do something
    };

    // Tastatur-Listener hinzufügen
    window.addEventListener("keydown", handleKeyPress);

    // === BELEUCHTUNG ===
    // Umgebungslicht (beleuchtet alles gleichmäßig)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    // Gerichtetes Licht (simuliert Sonnenlicht)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 20, 0); // Von oben
    directionalLight.castShadow = true; // Wirft Schatten
    scene.add(directionalLight);

    const cubes = [];
    // Geometrie für alle Würfel (2x2x2 Einheiten)
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    // Gittergröße (10x10 Würfel)
    const gridSize = 10;

    // Doppelte Schleife für X- und Z-Koordinaten
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const colorValue = (x + z) / (gridSize * 2);
        const color = new THREE.Color();
        // Verlauf von Cyan zu Blau
        color.setHSL(
          map(colorValue, 0, 1, 0.5, 0.7), // Hue: 0.5 (cyan) bis 0.7 (blau)
          0.7, // Sättigung konstant
          map(colorValue, 0, 1, 0.4, 0.5) // Helligkeit: 0.4 bis 0.5
        );

        // Material mit berechneter Farbe erstellen
        const material = new THREE.MeshLambertMaterial({
          color: color,
          flatShading: true, // Flache Schattierung (Low-Poly-Look)
        });

        // Würfel-Mesh erstellen
        const cube = new THREE.Mesh(geometry, material);
        // Position im Gitter berechnen (zentriert um Ursprung)
        cube.position.x = (x - gridSize / 2) * 2.1;
        cube.position.z = (z - gridSize / 2) * 2.1;
        cube.position.y = 0;

        // Würfel wirft Schatten
        cube.castShadow = true;

        // === DICKE KANTEN HINZUFÜGEN ===
        // Kanten der Box-Geometrie extrahieren
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const positions = edgesGeometry.attributes.position.array;

        // Spezielle Linien-Geometrie für dickere Linien
        const lineSegmentsGeometry = new LineSegmentsGeometry();
        lineSegmentsGeometry.setPositions(Array.from(positions));

        // Material für Linien (schwarz, 4 Pixel dick)
        const lineMaterial = new LineMaterial({
          color: 0x222222,
          linewidth: 2, // Breite in Pixeln
          resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
        });
        // Linien-Objekt erstellen
        const line = new LineSegments2(lineSegmentsGeometry, lineMaterial);
        // Linien als Kind des Würfels hinzufügen
        cube.add(line);

        cube.userData = {
          gridX: x, // X-Position im Gitter
          gridZ: z, // Z-Position im Gitter
          lineGeometry: lineSegmentsGeometry, // Für Cleanup
          lineMaterial: lineMaterial, // Für Cleanup und Updates
        };

        // Würfel zur Szene hinzufügen
        scene.add(cube);
        // Würfel im Array speichern
        cubes.push(cube);
      }
    }

    // === ANIMATIONS-SCHLEIFE ===
    let time = 0; // Zeitvariable für Animation
    let animationId; // ID für requestAnimationFrame

    const animate = () => {
      // Nächsten Frame anfordern
      animationId = requestAnimationFrame(animate);

      // Zeit erhöhen (Animationsgeschwindigkeit)
      time += 0.03;
      // === WÜRFEL ANIMIEREN ===
      cubes.forEach((cube) => {
        const { gridX, gridZ } = cube.userData;
        // Entfernung vom Ursprung berechnen
        const distance = Math.sqrt(gridX * gridX + gridZ * gridZ);
        // Sinuswelle basierend auf Entfernung und Zeit
        const wave = Math.sin(distance * 0.6 - time);
        // Skalierung von 0.2 bis 3.0 berechnen mit map()
        const scale = map(wave, -1, 1, 0.2, 2.0);
        // Würfel nur in Y-Richtung skalieren (Höhe)
        cube.scale.set(1, scale, 1);
        // Würfel nach oben verschieben, damit er vom Boden wächst
        cube.position.y = scale;
      });
      // Controls aktualisieren (für Damping)
      controls.update();
      // Szene rendern
      renderer.render(scene, camera);
    };

    // Animation starten
    animate();

    // === FENSTER-RESIZE HANDLER ===
    const handleResize = () => {
      // Neues Seitenverhältnis berechnen
      const aspect = window.innerWidth / window.innerHeight;

      // Kamera-Grenzen aktualisieren
      camera.left = (frustumSize * aspect) / -2;
      camera.right = (frustumSize * aspect) / 2;
      camera.top = frustumSize / 2;
      camera.bottom = frustumSize / -2;
      camera.updateProjectionMatrix();

      // Renderer-Größe anpassen
      renderer.setSize(window.innerWidth, window.innerHeight);

      // Linien-Material-Auflösung für korrekte Dicke aktualisieren
      cubes.forEach((cube) => {
        if (cube.userData.lineMaterial) {
          cube.userData.lineMaterial.resolution.set(window.innerWidth, window.innerHeight);
        }
      });
    };

    // Resize-Listener hinzufügen
    window.addEventListener("resize", handleResize);

    // === CLEANUP (WICHTIG!) ===
    // Diese Funktion wird aufgerufen, wenn die Komponente zerstört wird
    return () => {
      // Animation stoppen
      cancelAnimationFrame(animationId);
      // Controls aufräumen
      controls.dispose();
      // Event-Listener entfernen
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyPress);
      // Canvas aus DOM entfernen
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      // Geometrie aufräumen (Speicher freigeben)
      geometry.dispose();
      // Materialien und Linien-Ressourcen aufräumen
      cubes.forEach((cube) => {
        cube.material.dispose();
        // Kanten-Linien aufräumen
        if (cube.userData.lineGeometry) {
          cube.userData.lineGeometry.dispose();
        }
        if (cube.userData.lineMaterial) {
          cube.userData.lineMaterial.dispose();
        }
      });
      // Renderer aufräumen
      renderer.dispose();
    };
  });

  // helper
  // Map function (add this at the top of your file)
  function map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
  }
</script>

<!-- Template: Bindet den Container an die Variable -->
<div bind:this={container} class="scene-container"></div>

<style>
  /* Container nimmt gesamten Viewport ein */
  .scene-container {
    width: 100vw; /* 100% der Viewport-Breite */
    height: 100vh; /* 100% der Viewport-Höhe */
  }
</style>
