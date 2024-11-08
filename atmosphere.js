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
    this.threshold = 1;
    this.chart = null;
    this.selectedGas = null;

    this.width = 400;
    this.height = 400;
    this.radius = Math.min(this.width, this.height) / 2;

    this.initialize();
  }

  initialize() {
    this.setupEventListeners();
    this.createChart();
    this.updateGasList();
  }

  setupEventListeners() {
    // Setup view buttons from your existing view-controls div
    const viewButtons = document.querySelectorAll(".view-controls button");
    viewButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.setView(btn.textContent.trim().toLowerCase().replace(" ", "-"));
      });
    });

    // Setup filter control
    const filterValue = document.querySelector(".filter-value");
    const filter = document.createElement("input");
    filter.type = "range";
    filter.min = "0";
    filter.max = "100";
    filter.value = "1";
    filter.step = "0.1";

    // Insert the range input after the filter value text
    filterValue.parentNode.insertBefore(filter, filterValue.nextSibling);

    filter.addEventListener("input", (e) => {
      this.threshold = parseFloat(e.target.value);
      filterValue.textContent = this.threshold + "%";
      this.updateVisualization();
    });
  }

  setView(view) {
    this.currentView = view;
    document.querySelectorAll(".view-controls button").forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.textContent.trim().toLowerCase().replace(" ", "-") === view
      );
    });
    this.updateVisualization();
  }

  createChart() {
    // Clear existing chart
    const chartContainer = document.getElementById("composition-chart");
    chartContainer.innerHTML = "";

    // Create SVG
    const svg = d3
      .select("#composition-chart")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g")
      .attr("transform", `translate(${this.width / 2},${this.height / 2})`);

    // Create pie layout
    const pie = d3
      .pie()
      .value((d) => this.getDisplayValue(d))
      .sort(null);

    // Create arc generator
    const arc = d3.arc().innerRadius(0).outerRadius(this.radius);

    // Add paths
    const paths = svg
      .selectAll("path")
      .data(pie(this.getFilteredData()))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Add interactivity
    paths
      .on("mouseover", (event, d) => {
        this.showTooltip(event, d);
        this.selectGas(d.data);
      })
      .on("mouseout", () => {
        this.hideTooltip();
      })
      .on("click", (event, d) => {
        this.selectGas(d.data);
      });

    // Add labels
    const labels = svg
      .selectAll("text")
      .data(pie(this.getFilteredData()))
      .enter()
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .text((d) => `${d.data.name}: ${this.getDisplayValue(d.data)}%`);
  }

  getDisplayValue(d) {
    switch (this.currentView) {
      case "earth-comparison":
        return d.earthValue;
      case "seasonal-variation":
        return d.seasonalVariation === "High"
          ? 3
          : d.seasonalVariation === "Medium"
          ? 2
          : 1;
      default:
        return d.value;
    }
  }

  getFilteredData() {
    return this.data.filter((gas) => gas.value > this.threshold);
  }

  updateVisualization() {
    // Remove existing chart and create new one
    this.createChart();
    this.updateGasList();
  }

  updateGasList() {
    const gasListContainer = document.querySelector(".gas-list");
    gasListContainer.innerHTML = "";

    this.getFilteredData().forEach((gas) => {
      const gasItem = document.createElement("div");
      gasItem.className = "gas-item";
      gasItem.innerHTML = `
                <span class="gas-color" style="background-color: ${gas.color}"></span>
                <span class="gas-name">${gas.name}</span>
            `;
      gasItem.addEventListener("click", () => this.selectGas(gas));
      gasListContainer.appendChild(gasItem);
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

  showTooltip(event, d) {
    const tooltip = document.createElement("div");
    tooltip.id = "tooltip";
    tooltip.style.position = "absolute";
    tooltip.style.padding = "10px";
    tooltip.style.background = "rgba(255, 255, 255, 0.9)";
    tooltip.style.border = "1px solid #ddd";
    tooltip.style.borderRadius = "4px";
    tooltip.style.pointerEvents = "none";
    tooltip.style.opacity = "0";
    tooltip.style.transition = "opacity 0.2s";

    tooltip.innerHTML = `
            <strong>${d.data.name}</strong><br/>
            Value: ${this.getDisplayValue(d.data)}%
        `;

    document.body.appendChild(tooltip);

    const tooltipElement = document.getElementById("tooltip");
    tooltipElement.style.left = event.pageX + 10 + "px";
    tooltipElement.style.top = event.pageY - 10 + "px";
    tooltipElement.style.opacity = "1";
  }

  hideTooltip() {
    const tooltip = document.getElementById("tooltip");
    if (tooltip) {
      tooltip.remove();
    }
  }
}

// Initialize the visualization when the document is loaded
document.addEventListener("DOMContentLoaded", () => {
  new AtmosphereVisualization();
});
