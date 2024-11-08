// Global variables
let marsData = {};
let currentSolIndex = 0;

// Function to handle smooth scrolling
function smoothScroll(target, duration) {
  var targetElement = document.querySelector(target);
  var targetPosition =
    targetElement.getBoundingClientRect().top + window.pageYOffset;
  var startPosition = window.pageYOffset;
  var distance = targetPosition - startPosition;
  var startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    var timeElapsed = currentTime - startTime;
    var run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animation);
}

// Wait for the DOM to be fully loaded before executing the script
document.addEventListener("DOMContentLoaded", function () {
  var exploreBtn = document.getElementById("explore-btn");
  if (exploreBtn) {
    exploreBtn.addEventListener("click", function () {
      smoothScroll("#weather-guide", 1000); // Scroll to weather-guide section over 1 second
    });
  }

  // Mobile menu toggle functionality
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  navToggle.addEventListener("click", function () {
    navLinks.classList.toggle("show");
    this.classList.toggle("active");
  });

  // Close mobile menu when a link is clicked
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("show");
      navToggle.classList.remove("active");
    });
  });

  // Highlight active nav link based on scroll position
  window.addEventListener("scroll", highlightNavLink);

  // Guide item animation
  animateGuideItems();

  // Fetch Mars weather data
  fetchMarsWeather();
});

// Function to highlight the active navigation link based on scroll position
function highlightNavLink() {
  const sections = document.querySelectorAll("section");
  let scrollPosition = window.pageYOffset;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.clientHeight;
    const sectionId = section.getAttribute("id");

    if (
      scrollPosition >= sectionTop &&
      scrollPosition < sectionTop + sectionHeight
    ) {
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${sectionId}`) {
          link.classList.add("active");
        }
      });
    }
  });
}

// Function to animate guide items as they come into view
function animateGuideItems() {
  const guideItems = document.querySelectorAll(".guide-item");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    { threshold: 0.1 }
  );

  guideItems.forEach((item) => {
    item.style.opacity = 0;
    item.style.transform = "translateY(20px)";
    item.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    observer.observe(item);
  });
}

// Function to fetch Mars weather data from the NASA API
function fetchMarsWeather() {
  const apiKey = "h1O7lGc0UAandqSvS1XuYv5jw2ISo4VSPaNzQd07";
  const apiUrl = `https://api.nasa.gov/insight_weather/?api_key=${apiKey}&feedtype=json&ver=1.0`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      console.log("Data received:", data);
      marsData = data;
      currentSolIndex = data.sol_keys.length - 1;
      displayDashboard();
    })
    .catch((error) => {
      console.error("Error fetching Mars weather data:", error);
      document.getElementById("loading").style.display = "none";
      document.getElementById("weather-error").style.display = "block";
    });
}

// Function to display the weather dashboard
function displayDashboard() {
  document.getElementById("loading").style.display = "none";
  document.getElementById("weather-dashboard").style.display = "block";
  updateDashboard();
}

// Function to update the dashboard with current sol data
function updateDashboard() {
  const solKey = marsData.sol_keys[currentSolIndex];
  const solData = marsData[solKey];

  if (!solData) return;

  document.getElementById("current-sol").textContent = `Sol ${solKey}`;

  const date = new Date(solData.First_UTC);
  document.getElementById("current-earth-date").textContent =
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  document.getElementById("current-season").textContent = `Season: ${
    solData.Season || "N/A"
  }`;

  // Update temperatures
  if (solData.AT) {
    document.getElementById("avg-temp").textContent = `${solData.AT.av.toFixed(
      1
    )}°C`;
    document.getElementById(
      "min-temp"
    ).textContent = `Min: ${solData.AT.mn.toFixed(1)}°C`;
    document.getElementById(
      "max-temp"
    ).textContent = `Max: ${solData.AT.mx.toFixed(1)}°C`;
  }

  // Update wind
  if (solData.HWS) {
    document.getElementById(
      "wind-speed"
    ).textContent = `${solData.HWS.av.toFixed(1)} m/s`;
  }

  // Update pressure
  if (solData.PRE) {
    document.getElementById("pressure").textContent = `${solData.PRE.av.toFixed(
      0
    )} Pa`;
  }

  // Update charts
  updateTemperatureChart(solData);
  updateWindSpeedChart(solData);
  updatePressureChart(solData);

  // Enable/disable navigation buttons
  document.getElementById("prev-sol").disabled = currentSolIndex === 0;
  document.getElementById("next-sol").disabled =
    currentSolIndex === marsData.sol_keys.length - 1;
}

// Update navigation button handlers
document.getElementById("prev-sol").addEventListener("click", function () {
  if (currentSolIndex > 0) {
    currentSolIndex--;
    updateDashboard();
  }
});

document.getElementById("next-sol").addEventListener("click", function () {
  if (currentSolIndex < marsData.sol_keys.length - 1) {
    currentSolIndex++;
    updateDashboard();
  }
});

// Function to update temperature data and chart
function updateTemperature(solData) {
  const tempCard = document.getElementById("temperature-card");
  if (solData.AT) {
    tempCard.querySelector("#avg-temp").textContent = `${solData.AT.av.toFixed(
      1
    )}°C`;
    tempCard.querySelector(
      "#min-temp"
    ).textContent = `Min: ${solData.AT.mn.toFixed(1)}°C`;
    tempCard.querySelector(
      "#max-temp"
    ).textContent = `Max: ${solData.AT.mx.toFixed(1)}°C`;
    updateTemperatureChart();
  } else {
    tempCard.querySelector("#avg-temp").textContent = "N/A";
    tempCard.querySelector("#min-temp").textContent = "Min: N/A";
    tempCard.querySelector("#max-temp").textContent = "Max: N/A";
  }
}

// Function to update wind data and chart
function updateWind(solData) {
  const windCard = document.getElementById("wind-card");
  if (solData.HWS) {
    windCard.querySelector(
      "#wind-speed"
    ).textContent = `${solData.HWS.av.toFixed(1)} m/s`;
    updateWindSpeedChart();
  } else {
    windCard.querySelector("#wind-speed").textContent = "N/A";
  }
}

// Function to update pressure data and chart
function updatePressure(solData) {
  const pressureCard = document.getElementById("pressure-card");
  if (solData.PRE) {
    pressureCard.querySelector(
      "#pressure"
    ).textContent = `${solData.PRE.av.toFixed(0)} Pa`;
    updatePressureChart();
  } else {
    pressureCard.querySelector("#pressure").textContent = "N/A";
  }
}

// Function to update the info card with animation
function updateInfoCard() {
  const infoItems = document.querySelectorAll(".info-item");
  infoItems.forEach((item) => {
    item.addEventListener("click", () => {
      item.classList.add("active");
      setTimeout(() => item.classList.remove("active"), 300);
    });
  });
}

function updateTemperatureChart() {
  const chartData = marsData.sol_keys
    .map((sol) => ({
      sol: sol,
      avg: marsData[sol].AT ? marsData[sol].AT.av : null,
      min: marsData[sol].AT ? marsData[sol].AT.mn : null,
      max: marsData[sol].AT ? marsData[sol].AT.mx : null,
    }))
    .filter((d) => d.avg !== null);

  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 300 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;

  d3.select("#temp-chart").selectAll("*").remove();

  const svg = d3
    .select("#temp-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().range([0, width]).padding(0.1);

  const y = d3.scaleLinear().range([height, 0]);

  x.domain(chartData.map((d) => d.sol));
  y.domain([
    d3.min(chartData, (d) => d.min) - 5,
    d3.max(chartData, (d) => d.max) + 5,
  ]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickValues(x.domain().filter((d, i) => !(i % 2))));

  svg.append("g").call(d3.axisLeft(y));

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  svg
    .selectAll(".bar-avg")
    .data(chartData)
    .enter()
    .append("rect")
    .attr("class", "bar-avg")
    .attr("x", (d) => x(d.sol))
    .attr("width", x.bandwidth())
    .attr("y", (d) => y(d.avg))
    .attr("height", (d) => height - y(d.avg))
    .attr("fill", "#ff6b6b")
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `Sol: ${d.sol}<br/>Avg: ${d.avg.toFixed(
            1
          )}°C<br/>Min: ${d.min.toFixed(1)}°C<br/>Max: ${d.max.toFixed(1)}°C`
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  svg
    .selectAll(".error-bar")
    .data(chartData)
    .enter()
    .append("line")
    .attr("class", "error-bar")
    .attr("x1", (d) => x(d.sol) + x.bandwidth() / 2)
    .attr("x2", (d) => x(d.sol) + x.bandwidth() / 2)
    .attr("y1", (d) => y(d.min))
    .attr("y2", (d) => y(d.max))
    .attr("stroke", "white")
    .attr("stroke-width", 2);
}

function updateWindSpeedChart() {
  const chartData = marsData.sol_keys
    .map((sol) => ({
      sol: sol,
      speed: marsData[sol].HWS ? marsData[sol].HWS.av : null,
    }))
    .filter((d) => d.speed !== null);

  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 300 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;

  d3.select("#wind-speed-chart").selectAll("*").remove();

  const svg = d3
    .select("#wind-speed-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().range([0, width]).padding(0.1);

  const y = d3.scaleLinear().range([height, 0]);

  x.domain(chartData.map((d) => d.sol));
  y.domain([0, d3.max(chartData, (d) => d.speed) * 1.2]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickValues(x.domain().filter((d, i) => !(i % 2))));

  svg.append("g").call(d3.axisLeft(y));

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  svg
    .append("path")
    .datum(chartData)
    .attr("fill", "none")
    .attr("stroke", "#4ecdc4")
    .attr("stroke-width", 2)
    .attr(
      "d",
      d3
        .line()
        .x((d) => x(d.sol) + x.bandwidth() / 2)
        .y((d) => y(d.speed))
    );

  svg
    .selectAll(".dot")
    .data(chartData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => x(d.sol) + x.bandwidth() / 2)
    .attr("cy", (d) => y(d.speed))
    .attr("r", 4)
    .attr("fill", "#4ecdc4")
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(`Sol: ${d.sol}<br/>Wind Speed: ${d.speed.toFixed(1)} m/s`)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(500).style("opacity", 0);
    });
}

function updatePressureChart() {
  const chartData = marsData.sol_keys
    .map((sol) => ({
      sol: sol,
      pressure: marsData[sol].PRE ? marsData[sol].PRE.av : null,
    }))
    .filter((d) => d.pressure !== null);

  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 300 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;

  d3.select("#pressure-chart").selectAll("*").remove();

  const svg = d3
    .select("#pressure-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().range([0, width]).padding(0.1);

  const y = d3.scaleLinear().range([height, 0]);

  x.domain(chartData.map((d) => d.sol));
  y.domain([
    d3.min(chartData, (d) => d.pressure) - 10,
    d3.max(chartData, (d) => d.pressure) + 10,
  ]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickValues(x.domain().filter((d, i) => !(i % 2))));

  svg.append("g").call(d3.axisLeft(y));

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  svg
    .append("path")
    .datum(chartData)
    .attr("fill", "none")
    .attr("stroke", "#ff6b6b")
    .attr("stroke-width", 1.5)
    .attr(
      "d",
      d3
        .line()
        .x((d) => x(d.sol) + x.bandwidth() / 2)
        .y((d) => y(d.pressure))
    );

  svg
    .selectAll(".dot")
    .data(chartData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => x(d.sol) + x.bandwidth() / 2)
    .attr("cy", (d) => y(d.pressure))
    .attr("r", 3)
    .attr("fill", "#ff6b6b")
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(`Sol: ${d.sol}<br/>Pressure: ${d.pressure.toFixed(0)} Pa`)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(500).style("opacity", 0);
    });
}

document.getElementById("prev-sol").addEventListener("click", () => {
  if (currentSolIndex > 0) {
    currentSolIndex--;
    updateDashboard();
  }
});

document.getElementById("next-sol").addEventListener("click", () => {
  if (currentSolIndex < marsData.sol_keys.length - 1) {
    currentSolIndex++;
    updateDashboard();
  }
});

fetchMarsWeather();

// atmosphere.js
class AtmosphereVisualization {
  constructor() {
    this.data = [
      {
        name: "Carbon Dioxide",
        value: 95,
        color: "#FF4D4D",
        earthValue: 0.04,
        seasonalVariation: "High",
        details: {
          formula: "CO₂",
          description:
            "Primary component that creates the greenhouse effect on Mars",
          effects: "Contributes to seasonal polar ice cap changes",
          seasonalBehavior: "Freezes and sublimates at poles seasonally",
          significance: "Critical for potential terraforming efforts",
        },
      },
      {
        name: "Nitrogen",
        value: 2.7,
        color: "#4D79FF",
        earthValue: 78,
        seasonalVariation: "Low",
        details: {
          formula: "N₂",
          description: "Second most abundant gas in Mars atmosphere",
          effects: "Important for potential future terraforming",
          seasonalBehavior: "Remains relatively constant",
          significance: "Essential for potential biological processes",
        },
      },
      {
        name: "Argon",
        value: 1.6,
        color: "#7B61FF",
        earthValue: 0.93,
        seasonalVariation: "Low",
        details: {
          formula: "Ar",
          description: "Noble gas that doesn't react with other elements",
          effects: "Used as an indicator of atmospheric evolution",
          seasonalBehavior: "Constant throughout Martian year",
          significance: "Helps trace atmospheric loss over time",
        },
      },
      {
        name: "Oxygen",
        value: 0.13,
        color: "#49B3FF",
        earthValue: 21,
        seasonalVariation: "Medium",
        details: {
          formula: "O₂",
          description: "Essential for potential human habitation",
          effects: "Produced seasonally by surface interactions",
          seasonalBehavior: "Varies with UV radiation levels",
          significance: "Critical for human exploration",
        },
      },
      {
        name: "Other Trace Gases",
        value: 0.57,
        color: "#8C8C8C",
        earthValue: 0.03,
        seasonalVariation: "High",
        details: {
          description:
            "Including water vapor, carbon monoxide, and other trace elements",
          effects: "Contribute to Mars' unique atmospheric chemistry",
          seasonalBehavior: "Highly variable throughout the year",
          significance: "Indicators of geological activity",
        },
      },
    ];

    this.currentView = "composition";
    this.threshold = 0;
    this.chart = null;
    this.selectedGas = null;

    this.initialize();
  }

  initialize() {
    this.setupEventListeners();
    this.createChart();
    this.updateGasList();
  }

  setupEventListeners() {
    // View buttons
    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.setView(btn.dataset.view);
      });
    });

    // Threshold filter
    document.getElementById("threshold").addEventListener("input", (e) => {
      this.threshold = parseFloat(e.target.value);
      this.updateVisualization();
    });
  }

  setView(view) {
    this.currentView = view;
    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === view);
    });
    this.updateVisualization();
  }

  getFilteredData() {
    return this.data.filter((gas) => gas.value > this.threshold);
  }

  getTransformedData() {
    const filtered = this.getFilteredData();
    switch (this.currentView) {
      case "earth-comparison":
        return filtered.map((gas) => ({
          ...gas,
          displayValue: gas.earthValue,
        }));
      case "seasonal":
        return filtered.map((gas) => ({
          ...gas,
          displayValue:
            gas.seasonalVariation === "High"
              ? 3
              : gas.seasonalVariation === "Medium"
              ? 2
              : 1,
        }));
      default:
        return filtered.map((gas) => ({
          ...gas,
          displayValue: gas.value,
        }));
    }
  }

  createChart() {
    const ctx = document.getElementById("atmosphereChart").getContext("2d");
    this.chart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            this.selectGas(this.getTransformedData()[index]);
          }
        },
      },
    });
    this.updateVisualization();
  }

  updateVisualization() {
    const transformedData = this.getTransformedData();
    this.chart.data.labels = transformedData.map((gas) => gas.name);
    this.chart.data.datasets[0].data = transformedData.map(
      (gas) => gas.displayValue
    );
    this.chart.data.datasets[0].backgroundColor = transformedData.map(
      (gas) => gas.color
    );
    this.chart.update();
    this.updateGasList();
  }

  updateGasList() {
    const gasListElement = document.getElementById("gas-list");
    gasListElement.innerHTML = "";

    this.getFilteredData().forEach((gas) => {
      const button = document.createElement("button");
      button.className = "gas-button";
      button.innerHTML = `
                <span class="color-indicator" style="background-color: ${gas.color}"></span>
                <span>${gas.name}</span>
            `;
      button.addEventListener("click", () => this.selectGas(gas));
      gasListElement.appendChild(button);
    });
  }

  selectGas(gas) {
    this.selectedGas = gas;
    const gasInfo = document.getElementById("gasInfo");
    gasInfo.innerHTML = `
            <h3>${gas.name} ${
      gas.details.formula ? `(${gas.details.formula})` : ""
    }</h3>
            <p>${gas.details.description}</p>
            <p><strong>Effects:</strong> ${gas.details.effects}</p>
            <p><strong>Seasonal Behavior:</strong> ${
              gas.details.seasonalBehavior
            }</p>
            <p><strong>Significance:</strong> ${gas.details.significance}</p>
            <p><strong>Current Percentage:</strong> ${gas.value}%</p>
            <p><strong>Earth Percentage:</strong> ${gas.earthValue}%</p>
            <p><strong>Seasonal Variation:</strong> ${gas.seasonalVariation}</p>
        `;
  }
}

// Initialize the visualization when the document is loaded
document.addEventListener("DOMContentLoaded", () => {
  new AtmosphereVisualization();
});

//Image Pop Up
// Get all the gallery images
const galleryImages = document.querySelectorAll(".gallery-image");

// Add click event listener to each image
galleryImages.forEach((image) => {
  image.addEventListener("click", () => {
    // Create a modal element
    const modal = document.createElement("div");
    modal.classList.add("modal");

    // Create an image element inside the modal
    const modalImage = document.createElement("img");
    modalImage.src = image.src;
    modalImage.alt = image.alt;
    modalImage.classList.add("modal-image");

    // Append the image to the modal
    modal.appendChild(modalImage);

    // Append the modal to the body
    document.body.appendChild(modal);

    // Add a click event listener to the modal to close it
    modal.addEventListener("click", () => {
      document.body.removeChild(modal);
    });
  });
});
