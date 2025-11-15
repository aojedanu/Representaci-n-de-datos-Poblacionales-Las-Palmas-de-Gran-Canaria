function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, renderer, camera, camcontrols;
let mapa,
  mapsx,
  mapsy,
  scale = 5;

let minlon = -14.509895;
let maxlon = -14.059258;
let minlat = 28.044433;
let maxlat = 28.405762;

let texturacargada = false;

// Datos
const datosGeograficos = [];
const datosPoblacion2010 = [];
const datosPoblacion2016 = [];
const datosPoblacion2022 = [];
let datosActuales = [];
let cubos = [];

// Control temporal
let anioActual = 2010;
const anios = [2010, 2016, 2022];
let indiceAnio = 0;

// Estadísticas
let poblacionMax = 0;
let densidadMax = 0;
let edadMax = 0;
let edadMin = 100;
let extranjerosMax = 0;

// Modos de visualización
let modoVisualizacion = "poblacion";

// UI Elements
let infoPanel, controlPanel, leyenda;

init();
animate();

function init() {
  infoPanel = document.createElement("div");
  infoPanel.style.position = "absolute";
  infoPanel.style.top = "20px";
  infoPanel.style.left = "50%";
  infoPanel.style.transform = "translateX(-50%)";
  infoPanel.style.color = "#fff";
  infoPanel.style.fontFamily = "Monospace";
  infoPanel.style.fontSize = "24px";
  infoPanel.style.fontWeight = "bold";
  infoPanel.style.textShadow = "2px 2px 4px rgba(0,0,0,0.8)";
  infoPanel.style.zIndex = "10";
  infoPanel.innerHTML = "AÑO: 2010";
  document.body.appendChild(infoPanel);

  controlPanel = document.createElement("div");
  controlPanel.style.position = "absolute";
  controlPanel.style.top = "70px";
  controlPanel.style.left = "20px";
  controlPanel.style.color = "#fff";
  controlPanel.style.fontFamily = "Monospace";
  controlPanel.style.backgroundColor = "rgba(0,0,0,0.8)";
  controlPanel.style.padding = "15px";
  controlPanel.style.borderRadius = "8px";
  controlPanel.style.zIndex = "10";
  controlPanel.style.maxWidth = "250px";
  document.body.appendChild(controlPanel);

  leyenda = document.createElement("div");
  leyenda.style.position = "absolute";
  leyenda.style.bottom = "20px";
  leyenda.style.right = "20px";
  leyenda.style.color = "#fff";
  leyenda.style.fontFamily = "Monospace";
  leyenda.style.fontSize = "11px";
  leyenda.style.backgroundColor = "rgba(0,0,0,0.8)";
  leyenda.style.padding = "10px";
  leyenda.style.borderRadius = "5px";
  leyenda.style.zIndex = "10";
  document.body.appendChild(leyenda);

  crearControles();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 6, 3);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camcontrols = new OrbitControls(camera, renderer.domElement);
  camcontrols.enableDamping = true;
  camcontrols.dampingFactor = 0.05;
  camcontrols.target.set(0, 0, 0);

  const luzAmbiental = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(luzAmbiental);

  const luzDireccional = new THREE.DirectionalLight(0xffffff, 0.8);
  luzDireccional.position.set(5, 10, 5);
  luzDireccional.castShadow = true;
  luzDireccional.shadow.camera.left = -10;
  luzDireccional.shadow.camera.right = 10;
  luzDireccional.shadow.camera.top = 10;
  luzDireccional.shadow.camera.bottom = -10;
  scene.add(luzDireccional);

  const luzPuntual = new THREE.PointLight(0x4488ff, 0.5);
  luzPuntual.position.set(-5, 5, 5);
  scene.add(luzPuntual);
  const tx1 = new THREE.TextureLoader().load(
    "src/mapaLPGC_2.png",
    function (texture) {
      const rangoLon = maxlon - minlon;
      const rangoLat = maxlat - minlat;

      mapsy = scale;
      mapsx = mapsy * (rangoLon / rangoLat);

      console.log("Dimensiones del mapa:", mapsx, "x", mapsy);
      crearPlano(mapsx, mapsy, texture);
      texturacargada = true;
      cargarDatos();
    },
    undefined,
    function (err) {
      console.warn("Textura no encontrada, usando plano simple");
      const rangoLon = maxlon - minlon;
      const rangoLat = maxlat - minlat;
      mapsy = scale;
      mapsx = mapsy * (rangoLon / rangoLat);
      crearPlano(mapsx, mapsy, null);
      texturacargada = true;
      cargarDatos();
    }
  );

  window.addEventListener("resize", onWindowResize);
}

function crearPlano(sx, sy, texture) {
  const geometry = new THREE.PlaneGeometry(sx, sy);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });

  mapa = new THREE.Mesh(geometry, material);
  mapa.rotation.x = -Math.PI / 2;
  scene.add(mapa);

  const edges = new THREE.EdgesGeometry(geometry);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0xff0000 })
  );
  line.rotation.x = -Math.PI / 2;
  scene.add(line);
}

function crearControles() {
  let html = '<div style="margin-bottom: 15px;">';
  html += "<strong>MODO DE VISUALIZACIÓN</strong><br>";

  const modos = [
    { id: "poblacion", texto: "Población Total" },
    { id: "densidad", texto: "Densidad" },
    { id: "edad_media", texto: "Edad Media" },
    { id: "extranjeros", texto: "Extranjeros %" },
  ];

  modos.forEach((modo) => {
    html += `<label style="display: block; margin: 5px 0; cursor: pointer;">
      <input type="radio" name="modo" value="${modo.id}" ${
      modo.id === "poblacion" ? "checked" : ""
    } 
             onchange="window.cambiarModo('${modo.id}')"> ${modo.texto}
    </label>`;
  });

  html += "</div>";
  html += '<div style="border-top: 1px solid #444; padding-top: 10px;">';
  html += "<strong>SELECCIONAR AÑO</strong><br>";
  [2010, 2016, 2022].forEach((a) => {
    html += `<button onclick="window.seleccionarAnio(${a})" 
              style="margin: 5px 5px 0 0; padding: 6px 10px; cursor: pointer; width: 70px;">
              ${a}</button>`;
  });
  html += "</div>";
  html +=
    '<div id="stats" style="margin-top: 15px; font-size: 12px; line-height: 1.4em;">';
  html += "Población: -<br>Edad media: -<br>Extranjeros: -";
  html += "</div>";

  controlPanel.innerHTML = html;
}

window.seleccionarAnio = function (a) {
  anioActual = a;
  indiceAnio = anios.indexOf(a);
  cambiarAnio();
};

window.cambiarModo = function (modo) {
  modoVisualizacion = modo;
  visualizarDatos();
  actualizarLeyenda();
};

async function cargarDatos() {
  try {
    const respGeo = await fetch("src/csv_geografico.csv");
    const contentGeo = await respGeo.text();
    procesarCSVGeografico(contentGeo);

    const resp2010 = await fetch("src/poblacion_2010.csv");
    const content2010 = await resp2010.text();
    procesarCSVPoblacion(content2010, datosPoblacion2010);

    const resp2016 = await fetch("src/poblacion_2016.csv");
    const content2016 = await resp2016.text();
    procesarCSVPoblacion(content2016, datosPoblacion2016);

    const resp2022 = await fetch("src/poblacion_2022.csv");
    const content2022 = await resp2022.text();
    procesarCSVPoblacion(content2022, datosPoblacion2022);

    calcularMaximos();
    cambiarAnio();
    actualizarLeyenda();
  } catch (error) {
    console.error("Error cargando datos:", error);
  }
}

function procesarCSVGeografico(content) {
  const filas = content.trim().split("\n");
  const encabezados = filas[0]
    .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
    .map((h) => h.replace(/"/g, "").trim().toLowerCase());

  const idxId = encabezados.findIndex(
    (h) => h.includes("geocode") || h.includes("gcd")
  );
  const idxLon = encabezados.findIndex(
    (h) => h.includes("longitud") || h.includes("lon")
  );
  const idxLat = encabezados.findIndex(
    (h) => h.includes("latitud") || h.includes("lat")
  );
  const idxSup = encabezados.findIndex(
    (h) => h.includes("superficie") || h.includes("area")
  );

  for (let i = 1; i < filas.length; i++) {
    const cols = filas[i]
      .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
      .map((c) => c.replace(/"/g, "").trim());

    const id = (cols[idxId] || "").toLowerCase();
    const lon = parseFloat(cols[idxLon]);
    const lat = parseFloat(cols[idxLat]);
    const superficie = parseFloat((cols[idxSup] || "0").replace(",", "."));

    if (!isNaN(lon) && !isNaN(lat) && id) {
      datosGeograficos.push({ id, lon, lat, superficie });
    }
  }
  console.log(`${datosGeograficos.length} ubicaciones cargadas`);
}

function procesarCSVPoblacion(content, arrayDestino) {
  const filas = content.split("\n");
  const encabezados = filas[0].toLowerCase().split(",");

  const idxId = encabezados.findIndex((h) => h.includes("geocode"));
  const idxPob = encabezados.findIndex(
    (h) =>
      h.includes("poblacion") && !h.includes("edad") && !h.includes("extranje")
  );
  const idxEdad = encabezados.findIndex(
    (h) => h.includes("edad_media") && !h.includes("_d")
  );
  const idxExt = encabezados.findIndex(
    (h) =>
      h.includes("poblacion_extranjera") &&
      !h.includes("_pc") &&
      !h.includes("_ds")
  );

  console.log("Índices CSV Población:", { idxId, idxPob, idxEdad, idxExt });

  for (let i = 1; i < filas.length; i++) {
    const cols = filas[i].split(",");
    if (cols.length > 2) {
      let id = (cols[idxId] || "").replace(/"/g, "").trim().toLowerCase();
      // Normalizar ID: remover espacios extras
      id = id.replace(/\s+/g, "");

      const poblacion =
        parseFloat((cols[idxPob] || "0").replace(/"/g, "").replace(",", ".")) ||
        0;
      const edadMedia =
        parseFloat(
          (cols[idxEdad] || "40").replace(/"/g, "").replace(",", ".")
        ) || 40;
      const extranjeros =
        parseFloat((cols[idxExt] || "0").replace(/"/g, "").replace(",", ".")) ||
        0;

      if (poblacion > 0 && id) {
        arrayDestino.push({
          id,
          poblacion,
          edadMedia,
          extranjeros,
        });
      }
    }
  }
  console.log(`${arrayDestino.length} registros poblacionales cargados`);
}
function calcularMaximos() {
  const todosLosDatos = [
    ...datosPoblacion2010,
    ...datosPoblacion2016,
    ...datosPoblacion2022,
  ];

  poblacionMax = 0;
  densidadMax = 0;
  edadMin = 100;
  edadMax = 0;
  extranjerosMax = 0;

  todosLosDatos.forEach((dato) => {
    poblacionMax = Math.max(poblacionMax, dato.poblacion || 0);
    edadMin = Math.min(edadMin, dato.edadMedia || 40);
    edadMax = Math.max(edadMax, dato.edadMedia || 40);
    extranjerosMax = Math.max(extranjerosMax, dato.extranjeros || 0);

    const geo = datosGeograficos.find((g) => g.id === dato.id);
    if (geo && geo.superficie > 0) {
      const dens = dato.poblacion / geo.superficie;
      if (!isNaN(dens) && dens > 0) {
        densidadMax = Math.max(densidadMax, dens);
      }
    }
  });

  console.log(
    `Máximos - Población: ${poblacionMax}, Densidad: ${densidadMax}, Edad: ${edadMin}-${edadMax}, Extranjeros: ${extranjerosMax}`
  );
}

function cambiarAnio() {
  switch (anioActual) {
    case 2010:
      datosActuales = datosPoblacion2010;
      break;
    case 2016:
      datosActuales = datosPoblacion2016;
      break;
    case 2022:
      datosActuales = datosPoblacion2022;
      break;
  }

  infoPanel.innerHTML = `AÑO: ${anioActual}`;
  visualizarDatos();
  actualizarEstadisticas();
}

function visualizarDatos() {
  cubos.forEach((cubo) => scene.remove(cubo));
  cubos = [];

  let cuboCount = 0;
  let cubosConDatos = 0;

  datosGeograficos.forEach((geo) => {
    const dato = datosActuales.find((d) => d.id === geo.id);
    if (!dato || !geo.lon || !geo.lat) {
      cuboCount++;
      return;
    }

    const x = map2Range(geo.lon, minlon, maxlon, -mapsx / 2, mapsx / 2);
    const z = map2Range(geo.lat, minlat, maxlat, mapsy / 2, -mapsy / 2);

    let valor, altura, color;
    const densidad = geo.superficie > 0 ? dato.poblacion / geo.superficie : 0;

    switch (modoVisualizacion) {
      case "poblacion":
        valor = dato.poblacion;
        altura = (valor / poblacionMax) * 3;
        color = getColorPoblacion(valor);
        break;
      case "densidad":
        valor = densidad;
        altura = (valor / densidadMax) * 3;
        color = getColorDensidad(valor);
        break;
      case "edad_media":
        valor = dato.edadMedia;
        altura = ((valor - edadMin) / (edadMax - edadMin)) * 2;
        color = getColorEdad(valor);
        break;
      case "extranjeros":
        valor = dato.extranjeros;
        altura = (valor / extranjerosMax) * 2;
        color = getColorExtranjeros(valor);
        break;
    }

    const tamanio = 0.2;
    const geometry = new THREE.BoxGeometry(tamanio, altura, tamanio);
    const material = new THREE.MeshPhongMaterial({
      color,
      transparent: false,
      emissive: color,
      emissiveIntensity: 0.3,
    });
    const cubo = new THREE.Mesh(geometry, material);

    cubo.position.set(x, altura / 2, z);
    cubo.userData = { ...dato, ...geo, valor, lon: geo.lon, lat: geo.lat };

    cubos.push(cubo);
    scene.add(cubo);
    cubosConDatos++;
  });
  console.log(
    `${cubosConDatos} cubos con datos visualizados (de ${cuboCount} totales)`
  );
}

function map2Range(val, vmin, vmax, dmin, dmax) {
  const clampedVal = Math.max(vmin, Math.min(vmax, val));
  const t = (clampedVal - vmin) / (vmax - vmin);
  return dmin + t * (dmax - dmin);
}

function getColorPoblacion(pob) {
  const t = Math.min(pob / poblacionMax, 1);
  if (t < 0.33) return new THREE.Color().setHSL(0.6, 1, 0.3 + t * 0.6);
  if (t < 0.66) return new THREE.Color().setHSL(0.5, 1, 0.5);
  return new THREE.Color().setHSL(0.15 - (t - 0.66) * 0.15, 1, 0.5);
}

function getColorDensidad(dens) {
  const t = Math.min(dens / densidadMax, 1);
  return new THREE.Color().setHSL(0.3 - t * 0.3, 0.9, 0.4 + t * 0.2);
}

function getColorEdad(edad) {
  const t = (edad - edadMin) / (edadMax - edadMin);
  const tClamped = Math.max(0, Math.min(t, 1));
  // Joven (azul) -> Adulto (púrpura) -> Maduro (rosa) -> Mayor (rojo)
  if (tClamped < 0.33) {
    return new THREE.Color().setHSL(0.65, 1, 0.5 + (0.33 - tClamped) * 0.15);
  } else if (tClamped < 0.66) {
    const t2 = (tClamped - 0.33) / 0.33;
    return new THREE.Color().setHSL(0.65 - t2 * 0.25, 0.9, 0.5);
  } else {
    const t2 = (tClamped - 0.66) / 0.34;
    return new THREE.Color().setHSL(0.4 - t2 * 0.4, 0.9, 0.5 - t2 * 0.1);
  }
}

function getColorExtranjeros(ext) {
  const t = Math.min(ext / extranjerosMax, 1);
  // Bajo (azul) -> Medio (cian) -> Alto (amarillo) -> Muy Alto (naranja)
  if (t < 0.33) {
    return new THREE.Color().setHSL(0.6, 0.9, 0.4 + t * 0.3);
  } else if (t < 0.66) {
    const t2 = (t - 0.33) / 0.33;
    return new THREE.Color().setHSL(0.6 - t2 * 0.25, 0.9, 0.5 + t2 * 0.2);
  } else {
    const t2 = (t - 0.66) / 0.34;
    return new THREE.Color().setHSL(0.35 - t2 * 0.1, 0.9, 0.6 + t2 * 0.1);
  }
}

function actualizarEstadisticas() {
  const total = datosActuales.reduce((sum, d) => sum + (d.poblacion || 0), 0);
  const edadPromedio =
    datosActuales.reduce((sum, d) => sum + (d.edadMedia || 0), 0) /
    datosActuales.length;
  const totalExtranjeros = datosActuales.reduce(
    (sum, d) => sum + (d.extranjeros || 0),
    0
  );

  document.getElementById("stats").innerHTML = `
    Población: ${total.toLocaleString()}<br>
    Edad media: ${edadPromedio.toFixed(1)} años<br>
    Extranjeros: ${totalExtranjeros.toLocaleString()} (${(
    (totalExtranjeros / total) *
    100
  ).toFixed(1)}%)
  `;
}

function actualizarLeyenda() {
  let html = "<strong>LEYENDA</strong><br>";

  const gradientes = {
    poblacion: ["#004080", "#0080ff", "#ffff00", "#ff4400"],
    densidad: ["#00ff00", "#ffff00", "#ff8800", "#ff0000"],
    edad_media: ["#4444ff", "#8844ff", "#ff4488", "#ff0000"],
    extranjeros: ["#0088ff", "#00ffff", "#ffff00", "#ff8800"],
  };

  const labels = {
    poblacion: ["Bajo", "Medio", "Alto", "Muy Alto"],
    densidad: ["Baja", "Media", "Alta", "Muy Alta"],
    edad_media: ["Joven", "Adulto", "Maduro", "Mayor"],
    extranjeros: ["Bajo", "Medio", "Alto", "Muy Alto"],
  };

  const colores = gradientes[modoVisualizacion];
  const etiquetas = labels[modoVisualizacion];

  colores.forEach((color, i) => {
    html += `<div style="display: flex; align-items: center; margin: 3px 0;">
      <div style="width: 20px; height: 12px; background: ${color}; margin-right: 8px;"></div>
      <span style="font-size: 10px;">${etiquetas[i]}</span>
    </div>`;
  });

  leyenda.innerHTML = html;
}

function animate() {
  requestAnimationFrame(animate);
  camcontrols.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
