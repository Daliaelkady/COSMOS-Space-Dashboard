const NASA_API_KEY = "DEMO_KEY";
const SPACEDEVS_API_URL =
  "https://lldev.thespacedevs.com/2.2.0/launch/upcoming/";
const SOLAR_SYSTEM_API_URL = "https://api.le-systeme-solaire.net/rest/bodies/";

const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".app-section");
const apodDateInput = document.getElementById("apod-date-input");
const loadDateBtn = document.getElementById("load-date-btn");
const todayApodBtn = document.getElementById("today-apod-btn");
const launchesGrid = document.getElementById("launches-grid");
const featuredLaunch = document.getElementById("featured-launch");
const planetCards = document.querySelectorAll(".planet-card");
const launchesCountEl = document.getElementById("launches-count");
const launchesCountMobileEl = document.getElementById("launches-count-mobile");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initSidebar();
  setMaxDate();
  initDatePicker();
  loadTodayInSpace();
  loadLaunches();
  loadPlanets();
});

function setMaxDate() {
  if (!apodDateInput) return;
  const today = new Date().toISOString().split("T")[0];
  apodDateInput.setAttribute("max", today);
  apodDateInput.value = today;
  updateDateInputDisplay(today);
}

function updateDateInputDisplay(dateString) {
  const date = new Date(dateString + "T00:00:00");
  const options = { month: "short", day: "numeric", year: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);
  const wrapper = apodDateInput.closest(".date-input-wrapper");
  const span = wrapper.querySelector("span");
  if (span) span.textContent = formattedDate;
}

function initNavigation() {
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetSection = link.getAttribute("data-section");
      showSection(targetSection);

      navLinks.forEach((nl) => {
        nl.classList.remove("bg-blue-500/10", "text-blue-400");
        nl.classList.add("text-slate-300");
      });
      link.classList.add("bg-blue-500/10", "text-blue-400");
      link.classList.remove("text-slate-300");

      if (window.innerWidth < 1024) {
        closeSidebar();
      }
    });
  });
}

function showSection(sectionId) {
  sections.forEach((section) => {
    if (section.getAttribute("data-section") === sectionId) {
      section.classList.remove("hidden");
    } else {
      section.classList.add("hidden");
    }
  });
}

function initSidebar() {
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("sidebar-open");

      let overlay = document.querySelector(".sidebar-overlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "sidebar-overlay";
        document.body.appendChild(overlay);
      }

      if (sidebar.classList.contains("sidebar-open")) {
        overlay.style.display = "block";
        setTimeout(() => (overlay.style.opacity = "1"), 10);
      } else {
        overlay.style.opacity = "0";
        setTimeout(() => (overlay.style.display = "none"), 300);
      }

      overlay.addEventListener("click", () => {
        closeSidebar();
      });
    });
  }
}

function closeSidebar() {
  sidebar.classList.remove("sidebar-open");
  const overlay = document.querySelector(".sidebar-overlay");
  if (overlay) {
    overlay.style.opacity = "0";
    setTimeout(() => (overlay.style.display = "none"), 300);
  }
}

function initDatePicker() {
  if (apodDateInput) {
    if (apodDateInput.value) {
      updateDateInputDisplay(apodDateInput.value);
    }

    apodDateInput.addEventListener("change", (e) => {
      updateDateInputDisplay(e.target.value);
    });
  }

  if (loadDateBtn) {
    loadDateBtn.addEventListener("click", () => {
      const selectedDate = apodDateInput.value;
      if (selectedDate) {
        loadAPODByDate(selectedDate);
      }
    });
  }

  if (todayApodBtn) {
    todayApodBtn.addEventListener("click", () => {
      const today = new Date().toISOString().split("T")[0];
      apodDateInput.value = today;
      updateDateInputDisplay(today);
      loadTodayInSpace();
    });
  }
}

// ==================== NASA APOD API ====================

async function loadTodayInSpace() {
  const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
  await loadAPOD(url);
}

async function loadAPODByDate(date) {
  const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${date}`;
  await loadAPOD(url);
}

async function loadAPOD(url) {
  const loadingEl = document.getElementById("apod-loading");
  const imageEl = document.getElementById("apod-image");
  const containerEl = document.getElementById("apod-image-container");

  try {
    if (loadingEl) loadingEl.classList.remove("hidden");
    if (imageEl) imageEl.style.display = "none";

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch APOD");

    const data = await response.json();

    if (imageEl) {
      if (data.media_type === "video") {
        imageEl.style.display = "none";
        const videoEl = document.createElement("iframe");
        videoEl.src = data.url;
        videoEl.className = "w-full h-full";
        videoEl.style.display = "block";
        containerEl.innerHTML = "";
        containerEl.appendChild(videoEl);
      } else {
        imageEl.src =
          data.url || data.hdurl || "./assets/images/placeholder.webp";
        imageEl.alt = data.title || "Astronomy Picture of the Day";
        imageEl.style.display = "block";
        if (containerEl.querySelector("iframe")) {
          containerEl.innerHTML = "";
          containerEl.appendChild(imageEl);
        }
      }
    }

    const titleEl = document.getElementById("apod-title");
    if (titleEl) titleEl.textContent = data.title || "No title available";

    const dateEl = document.getElementById("apod-date");
    const dateDetailEl = document.getElementById("apod-date-detail");
    const dateInfoEl = document.getElementById("apod-date-info");
    if (data.date) {
      const date = new Date(data.date + "T00:00:00");
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      if (dateEl)
        dateEl.textContent = `Astronomy Picture of the Day - ${formattedDate}`;
      if (dateDetailEl)
        dateDetailEl.innerHTML = `<i class="far fa-calendar mr-2"></i>${data.date}`;
      if (dateInfoEl) dateInfoEl.textContent = data.date;
    }

    const explanationEl = document.getElementById("apod-explanation");
    if (explanationEl)
      explanationEl.textContent =
        data.explanation || "No explanation available.";

    const copyrightEl = document.getElementById("apod-copyright");
    if (copyrightEl) {
      copyrightEl.textContent = data.copyright
        ? `© ${data.copyright}`
        : "© NASA/JPL";
    }

    const mediaTypeEl = document.getElementById("apod-media-type");
    if (mediaTypeEl)
      mediaTypeEl.textContent = data.media_type === "video" ? "Video" : "Image";
  } catch (error) {
    console.error("Error fetching APOD:", error);
    if (imageEl) {
      imageEl.src = "./assets/images/placeholder.webp";
      imageEl.style.display = "block";
    }
  } finally {
    if (loadingEl) loadingEl.classList.add("hidden");
  }
}

// ==================== SpaceDevs Launches API ====================

async function loadLaunches() {
  try {
    const response = await fetch(`${SPACEDEVS_API_URL}?limit=10&ordering=net`);
    if (!response.ok) throw new Error("Failed to fetch launches");

    const data = await response.json();
    const launches = data.results || [];

    if (launchesCountEl)
      launchesCountEl.textContent = `${launches.length} Launches`;
    if (launchesCountMobileEl)
      launchesCountMobileEl.textContent = launches.length;

    if (launches.length > 0 && featuredLaunch) {
      displayFeaturedLaunch(launches[0]);
    }

    if (launchesGrid) {
      launchesGrid.innerHTML = "";
      launches.slice(1).forEach((launch) => {
        const launchCard = createLaunchCard(launch);
        launchesGrid.appendChild(launchCard);
      });
    }
  } catch (error) {
    console.error("Error fetching launches:", error);
    if (launchesGrid) {
      launchesGrid.innerHTML =
        '<p class="text-slate-400 col-span-full text-center">Failed to load launches. Please try again later.</p>';
    }
  }
}

function displayFeaturedLaunch(launch) {
  const container = featuredLaunch;
  if (!container) return;

  const name = launch.name || "Unknown Launch";
  const agency = launch.launch_service_provider?.name || "Unknown Agency";
  const rocket = launch.rocket?.configuration?.name || "Unknown Rocket";
  const net = launch.net || "";
  const pad = launch.pad || {};
  const location = pad.location || {};
  const country = location.country_code || "Unknown";

  let daysUntil = "";
  if (net) {
    const launchDate = new Date(net);
    const today = new Date();
    const diffTime = launchDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    daysUntil = diffDays >= 0 ? diffDays : 0;
  }

  const status = launch.status?.abbrev || "TBD";
  const statusClass =
    status === "Go"
      ? "bg-green-500/20 text-green-400"
      : status === "TBC"
      ? "bg-yellow-500/20 text-yellow-400"
      : "bg-blue-500/20 text-blue-400";

  let formattedDate = "TBD";
  let formattedTime = "TBD";
  if (net) {
    const date = new Date(net);
    formattedDate = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  }

  container.innerHTML = `
    <div class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all">
      <div class="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
        <div class="flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold flex items-center gap-2">
                <i class="fas fa-star"></i>
                Featured Launch
              </span>
              <span class="px-4 py-1.5 ${statusClass} rounded-full text-sm font-semibold">
                ${status}
              </span>
            </div>
            <h3 class="text-3xl font-bold mb-3 leading-tight">${name}</h3>
            <div class="flex flex-col xl:flex-row xl:items-center gap-4 mb-6 text-slate-400">
              <div class="flex items-center gap-2">
                <i class="fas fa-building"></i>
                <span>${agency}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fas fa-rocket"></i>
                <span>${rocket}</span>
              </div>
            </div>
            ${
              daysUntil !== ""
                ? `
            <div class="inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-xl mb-6">
              <i class="fas fa-clock text-2xl text-blue-400"></i>
              <div>
                <p class="text-2xl font-bold text-blue-400">${daysUntil}</p>
                <p class="text-xs text-slate-400">Days Until Launch</p>
              </div>
            </div>
            `
                : ""
            }
            <div class="grid xl:grid-cols-2 gap-4 mb-6">
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-calendar"></i>
                  Launch Date
                </p>
                <p class="font-semibold">${formattedDate}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-clock"></i>
                  Launch Time
                </p>
                <p class="font-semibold">${formattedTime}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-map-marker-alt"></i>
                  Location
                </p>
                <p class="font-semibold text-sm">${pad.name || "TBD"}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                  <i class="fas fa-globe"></i>
                  Country
                </p>
                <p class="font-semibold">${country}</p>
              </div>
            </div>
            <p class="text-slate-300 leading-relaxed mb-6">
              ${
                launch.mission?.description ||
                launch.description ||
                "No description available."
              }
            </p>
          </div>
          <div class="flex flex-col md:flex-row gap-3">
            <button class="flex-1 self-start md:self-center px-6 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2">
              <i class="fas fa-info-circle"></i>
              View Full Details
            </button>
            <div class="icons self-end md:self-center flex gap-2">
              <button class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">
                <i class="far fa-heart"></i>
              </button>
              <button class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">
                <i class="fas fa-bell"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="relative">
          <div class="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50">
            <div class="flex items-center justify-center h-full min-h-[400px] bg-slate-800">
              <i class="fas fa-rocket text-9xl text-slate-700/50"></i>
            </div>
            <div class="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function createLaunchCard(launch) {
  const card = document.createElement("div");
  card.className =
    "bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer";

  const name = launch.name || "Unknown Launch";
  const agency = launch.launch_service_provider?.name || "Unknown Agency";
  const rocket = launch.rocket?.configuration?.name || "Unknown Rocket";
  const net = launch.net || "";
  const pad = launch.pad || {};
  const status = launch.status?.abbrev || "TBD";

  const statusClass =
    status === "Go"
      ? "bg-green-500/90 text-white"
      : status === "TBC"
      ? "bg-yellow-500/90 text-white"
      : "bg-blue-500/90 text-white";

  let formattedDate = "TBD";
  let formattedTime = "TBD";
  if (net) {
    const date = new Date(net);
    formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  }

  const iconClass = rocket.toLowerCase().includes("falcon")
    ? "fa-space-shuttle"
    : rocket.toLowerCase().includes("starship")
    ? "fa-rocket"
    : "fa-satellite-dish";

  card.innerHTML = `
    <div class="relative h-48 bg-slate-900/50 flex items-center justify-center">
      <i class="fas ${iconClass} text-5xl text-slate-700"></i>
      <div class="absolute top-3 right-3">
        <span class="px-3 py-1 ${statusClass} backdrop-blur-sm rounded-full text-xs font-semibold">
          ${status}
        </span>
      </div>
    </div>
    <div class="p-5">
      <div class="mb-3">
        <h4 class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">${name}</h4>
        <p class="text-sm text-slate-400 flex items-center gap-2">
          <i class="fas fa-building text-xs"></i>
          ${agency}
        </p>
      </div>
      <div class="space-y-2 mb-4">
        <div class="flex items-center gap-2 text-sm">
          <i class="fas fa-calendar text-slate-500 w-4"></i>
          <span class="text-slate-300">${formattedDate}</span>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <i class="fas fa-clock text-slate-500 w-4"></i>
          <span class="text-slate-300">${formattedTime}</span>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <i class="fas fa-rocket text-slate-500 w-4"></i>
          <span class="text-slate-300">${rocket}</span>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <i class="fas fa-map-marker-alt text-slate-500 w-4"></i>
          <span class="text-slate-300 line-clamp-1">${pad.name || "TBD"}</span>
        </div>
      </div>
      <div class="flex items-center gap-2 pt-4 border-t border-slate-700">
        <button class="flex-1 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-sm font-semibold">
          Details
        </button>
        <button class="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
          <i class="far fa-heart"></i>
        </button>
      </div>
    </div>
  `;

  return card;
}

// ==================== Solar System OpenData API ====================

const planetIds = {
  mercury: "mercure",
  venus: "venus",
  earth: "terre",
  mars: "mars",
  jupiter: "jupiter",
  saturn: "saturne",
  uranus: "uranus",
  neptune: "neptune",
};

async function loadPlanets() {
  const planetPromises = Object.keys(planetIds).map((planetKey) =>
    loadPlanetData(planetKey, planetIds[planetKey])
  );

  await Promise.all(planetPromises);

  displayPlanetDetails("earth");
}

async function loadPlanetData(planetKey, planetId) {
  try {
    const response = await fetch(`${SOLAR_SYSTEM_API_URL}${planetId}`);
    if (!response.ok) throw new Error(`Failed to fetch ${planetKey}`);

    const data = await response.json();

    const card = document.querySelector(`[data-planet-id="${planetKey}"]`);
    if (card) {
      card.dataset.planetData = JSON.stringify(data);

      card.addEventListener("click", () => {
        displayPlanetDetails(planetKey);
      });
    }
  } catch (error) {
    console.error(`Error fetching ${planetKey}:`, error);
  }
}

function displayPlanetDetails(planetKey) {
  const card = document.querySelector(`[data-planet-id="${planetKey}"]`);
  if (!card) return;

  const planetData = JSON.parse(card.dataset.planetData || "{}");
  if (!planetData || Object.keys(planetData).length === 0) return;

  const imageEl = document.getElementById("planet-detail-image");
  if (imageEl) {
    imageEl.src = `./assets/images/${planetKey}.png`;
    imageEl.alt = `${planetKey} planet`;
  }

  const nameEl = document.getElementById("planet-detail-name");
  if (nameEl)
    nameEl.textContent =
      planetData.englishName ||
      planetKey.charAt(0).toUpperCase() + planetKey.slice(1);

  const descEl = document.getElementById("planet-detail-description");
  if (descEl) {
    descEl.textContent =
      planetData.discoveredBy && planetData.discoveryDate
        ? `${planetData.englishName} is a ${
            planetData.bodyType || "planet"
          } in our solar system.`
        : `${planetData.englishName} is a ${
            planetData.bodyType || "planet"
          } in our solar system.`;
  }

  const formatNumber = (num) => {
    if (!num && num !== 0) return "N/A";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toLocaleString();
  };

  const formatMass = (mass) => {
    if (!mass) return "N/A";
    if (mass >= 1e24) return (mass / 1e24).toFixed(2) + " × 10²⁴ kg";
    return mass.toLocaleString() + " kg";
  };

  const formatDistance = (dist) => {
    if (!dist && dist !== 0) return "N/A";
    return (dist / 1e6).toFixed(1) + "M km";
  };

  const formatDays = (days) => {
    if (!days) return "N/A";
    return days.toFixed(2) + " days";
  };

  const formatHours = (hours) => {
    if (!hours) return "N/A";
    if (hours >= 24) return (hours / 24).toFixed(1) + " hours";
    return hours.toFixed(1) + " hours";
  };

  const fields = {
    "planet-distance": formatDistance(planetData.semimajorAxis),
    "planet-radius": planetData.meanRadius
      ? (planetData.meanRadius / 1000).toFixed(0) + " km"
      : "N/A",
    "planet-mass": formatMass(
      planetData.mass?.massValue
        ? planetData.mass.massValue * Math.pow(10, planetData.mass.massExponent)
        : null
    ),
    "planet-density": planetData.density
      ? planetData.density.toFixed(2) + " g/cm³"
      : "N/A",
    "planet-orbital-period": formatDays(planetData.sideralOrbit),
    "planet-rotation": formatHours(planetData.sideralRotation),
    "planet-moons": planetData.moons ? planetData.moons.length : 0,
    "planet-gravity": planetData.gravity
      ? planetData.gravity.toFixed(1) + " m/s²"
      : "N/A",
    "planet-discoverer": planetData.discoveredBy || "Known since antiquity",
    "planet-discovery-date": planetData.discoveryDate || "Ancient",
    "planet-body-type": planetData.bodyType || "Planet",
    "planet-volume": planetData.vol
      ? formatNumber(
          planetData.vol.volValue * Math.pow(10, planetData.vol.volExponent)
        )
      : "N/A",
    "planet-perihelion": formatDistance(planetData.perihelion),
    "planet-aphelion": formatDistance(planetData.aphelion),
    "planet-eccentricity": planetData.eccentricity
      ? planetData.eccentricity.toFixed(4)
      : "N/A",
    "planet-inclination": planetData.inclination
      ? planetData.inclination.toFixed(2) + "°"
      : "N/A",
    "planet-axial-tilt": planetData.axialTilt
      ? planetData.axialTilt.toFixed(2) + "°"
      : "N/A",
    "planet-temp": planetData.avgTemp ? planetData.avgTemp + "K" : "N/A",
    "planet-escape": planetData.escape
      ? (planetData.escape / 1000).toFixed(1) + " km/s"
      : "N/A",
  };

  Object.entries(fields).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });

  const factsEl = document.getElementById("planet-facts");
  if (factsEl) {
    const facts = [];
    if (planetData.moons && planetData.moons.length > 0) {
      facts.push(
        `${planetData.moons.length} known moon${
          planetData.moons.length > 1 ? "s" : ""
        }`
      );
    }
    if (planetData.isPlanet) {
      facts.push("Official planet in our solar system");
    }
    if (planetData.gravity) {
      facts.push(`Surface gravity: ${planetData.gravity.toFixed(1)} m/s²`);
    }
    if (planetData.aroundPlanet) {
      facts.push(`Orbits around ${planetData.aroundPlanet.planet}`);
    }

    if (facts.length === 0) {
      facts.push("Explore this celestial body in our solar system");
    }

    factsEl.innerHTML = facts
      .map(
        (fact) => `
      <li class="flex items-start">
        <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
        <span class="text-slate-300">${fact}</span>
      </li>
    `
      )
      .join("");
  }

  planetCards.forEach((planetCard) => {
    planetCard.style.borderColor = "";
  });
  if (card) {
    const planetColor =
      getComputedStyle(card).getPropertyValue("--planet-color") || "#3b82f6";
    card.style.borderColor = planetColor + "80";
  }
}
