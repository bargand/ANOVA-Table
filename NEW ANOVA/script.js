document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const analyzeBtn = document.getElementById("analyze-btn");
  const dataInput = document.getElementById("data-input");
  const designBtns = document.querySelectorAll(".design-btn");
  const designRequirements = document.getElementById("design-requirements");
  const errorMessage = document.getElementById("error-message");

  // Output elements
  const dataInfoSection = document.getElementById("data-info");
  const anovaResults = document.getElementById("anova-results");
  const designTypeOutput = document.getElementById("design-type-output");
  const genotypeCount = document.getElementById("genotype-count");
  const replicationCount = document.getElementById("replication-count");
  const anovaTableBody = document.querySelector("#anova-table tbody");

  // Current design type (default: CRD)
  let currentDesign = "CRD";

  // Set up design type buttonsf
  designBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      designBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      currentDesign = this.dataset.design;
      updateDesignRequirements();
    });
  });

  function updateDesignRequirements() {
    if (currentDesign === "LSD") {
      designRequirements.textContent =
        "For LSD: Must have equal genotypes and replications (square design).";
    } else {
      designRequirements.textContent = `For ${currentDesign}: Each treatment must have equal replications.`;
    }
  }

  // Analyze button click handler
  analyzeBtn.addEventListener("click", function () {
    dataInfoSection.classList.add("hidden");
    anovaResults.classList.add("hidden");
    errorMessage.classList.add("hidden");

    try {
      const rawData = dataInput.value.trim();
      if (!rawData) throw new Error("Please enter data to analyze");

      const data = parseData(rawData);
      const result = performANOVA(data, currentDesign);

      displayDataInfo(result);
      displayANOVATable(result);
    } catch (error) {
      showError(error.message);
    }
  });

  function parseData(rawData) {
    const lines = rawData.split("\n").filter((line) => line.trim() !== "");
    if (lines.length === 0) throw new Error("No data entered");

    return lines.map((line) => {
      const values = line.split(/[\s,]+/).filter((val) => val !== "");
      if (values.length === 0) throw new Error("Empty row detected");

      return values.map((val) => {
        const num = parseFloat(val);
        if (isNaN(num)) throw new Error(`Invalid number: "${val}"`);
        return num;
      });
    });
  }

  function performANOVA(data, design) {
    const genotypes = data.length;
    if (genotypes < 2) throw new Error("At least 2 genotypes required");

    const replications = data[0].length;
    if (!data.every((row) => row.length === replications)) {
      throw new Error(
        "All genotypes must have the same number of replications"
      );
    }

    if (design === "LSD" && genotypes !== replications) {
      throw new Error(
        "Latin Square Design requires equal genotypes and replications (square design)"
      );
    }

    const totalObservations = genotypes * replications;
    let grandTotal = 0;

    // Calculate grand total and means
    data.forEach((row) => row.forEach((value) => (grandTotal += value)));
    const grandMean = grandTotal / totalObservations;

    // Genotype calculations
    const genotypeTotals = data.map((row) =>
      row.reduce((sum, val) => sum + val, 0)
    );
    const genotypeMeans = genotypeTotals.map((total) => total / replications);

    // Replication calculations
    const replicationTotals = [];
    for (let i = 0; i < replications; i++) {
      let repTotal = 0;
      data.forEach((row) => (repTotal += row[i]));
      replicationTotals.push(repTotal);
    }
    const replicationMeans = replicationTotals.map(
      (total) => total / genotypes
    );

    // Total SS
    let SST = 0;
    data.forEach((row) =>
      row.forEach((value) => {
        SST += Math.pow(value - grandMean, 2);
      })
    );

    // Genotype SS
    let SSG = 0;
    genotypeMeans.forEach((mean) => {
      SSG += replications * Math.pow(mean - grandMean, 2);
    });

    // Replication SS
    let SSR = 0;
    replicationMeans.forEach((mean) => {
      SSR += genotypes * Math.pow(mean - grandMean, 2);
    });

    // Design-specific calculations
    let SSE,
      dfGenotype,
      dfReplication,
      dfError,
      SSC = 0;

    if (design === "CRD") {
      // Completely Randomized Design
      SSE = SST - SSG;
      dfGenotype = genotypes - 1;
      dfReplication = 0; // Not used in CRD
      dfError = totalObservations - genotypes;
    } else if (design === "RBD") {
      // Randomized Block Design
      SSE = SST - SSG - SSR;
      dfGenotype = genotypes - 1;
      dfReplication = replications - 1;
      dfError = (genotypes - 1) * (replications - 1);
    } else if (design === "LSD") {
      // Latin Square Design
      const n = genotypes;

      // Calculate column SS
      SSC = 0;
      for (let j = 0; j < n; j++) {
        let colTotal = 0;
        for (let i = 0; i < n; i++) {
          colTotal += data[i][j];
        }
        const colMean = colTotal / n;
        SSC += n * Math.pow(colMean - grandMean, 2);
      }

      // Adjust SS terms for LSD
      SSR = SSR + SSC; // Combine row and column SS
      SSE = SST - SSG - SSR;

      dfGenotype = n - 1;
      dfReplication = 2 * (n - 1); // Combined rows + columns
      dfError = (n - 1) * (n - 2);
    }

    // Calculate mean squares with validation
    const MSG = dfGenotype > 0 ? SSG / dfGenotype : 0;
    const MSR = design !== "CRD" && dfReplication > 0 ? SSR / dfReplication : 0;
    const MSE = dfError > 0 ? SSE / dfError : 0;

    // Calculate F-values with validation
    const FGenotype = MSE > 0 && dfGenotype > 0 ? MSG / MSE : 0;
    const FReplication =
      design !== "CRD" && MSE > 0 && dfReplication > 0 ? MSR / MSE : 0;

    // Calculate p-values with proper validation
    const pValueGenotype =
      dfGenotype > 0 && dfError > 0
        ? calculatePValue(FGenotype, dfGenotype, dfError)
        : 1;
    const pValueReplication =
      design !== "CRD" && dfReplication > 0 && dfError > 0
        ? calculatePValue(FReplication, dfReplication, dfError)
        : 1;

    return {
      design: design,
      genotypes: genotypes,
      replications: replications,
      totalObservations: totalObservations,
      SST: SST,
      SSG: SSG,
      SSR: SSR,
      SSE: SSE,
      dfTotal: totalObservations - 1,
      dfGenotype: dfGenotype,
      dfReplication: design === "CRD" ? 0 : dfReplication,
      dfError: dfError,
      MSG: MSG,
      MSR: MSR,
      MSE: MSE,
      FGenotype: FGenotype,
      FReplication: FReplication,
      pValueGenotype: pValueGenotype,
      pValueReplication: pValueReplication,
    };
  }

  // Robust p-value calculation using F-distribution
  function calculatePValue(F, df1, df2) {
    if (F <= 0 || df1 <= 0 || df2 <= 0 || !isFinite(F)) return 1;

    // Using the relationship between F-distribution and beta distribution
    const x = df2 / (df2 + df1 * F);
    try {
      return incompleteBeta(x, df2 / 2, df1 / 2);
    } catch (e) {
      console.error("P-value calculation error:", e);
      return 1;
    }
  }

  // Incomplete beta function implementation
  function incompleteBeta(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    if (a <= 0 || b <= 0) return 1;

    const beta = (gamma(a) * gamma(b)) / gamma(a + b);
    const epsilon = 1e-10;
    let result = 0;
    let m = 0;
    let current = 0;
    let prev = 0;

    do {
      const m2 = 2 * m;
      const numerator = m * (b - m) * x;
      const denominator1 = (a + m2 - 1) * (a + m2);
      const A = denominator1 !== 0 ? numerator / denominator1 : 0;

      const B = denominator1 !== 0 ? m + (m * (b - m) * x) / (a + m2 - 1) : 0;
      const denominator2 = (a + m2) * (a + m2 + 1);
      const D =
        denominator2 !== 0 ? ((a + m) * (a + b + m) * x) / denominator2 : 0;

      current = m === 0 ? 1 : (prev * (1 + A)) / (1 + B);
      result += current * D;
      prev = current * (1 - D);
      m++;
    } while (m < 1000 && Math.abs(current * D) > epsilon);

    const prefix = (Math.pow(x, a) * Math.pow(1 - x, b)) / (a * beta);
    return Math.min(1, Math.max(0, prefix * (1 + result)));
  }

  // Gamma function implementation using Lanczos approximation
  function gamma(z) {
    // Handle negative integers and zero
    if (z <= 0 && z % 1 === 0) return Infinity;

    // Reflection formula for z < 0.5
    if (z < 0.5) {
      return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    }

    // Lanczos approximation coefficients
    const p = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
    ];

    z -= 1;
    let x = p[0];
    for (let i = 1; i < p.length; i++) {
      x += p[i] / (z + i);
    }
    const t = z + p.length - 1.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }

  function displayDataInfo(result) {
    designTypeOutput.textContent = result.design;
    genotypeCount.textContent = result.genotypes;
    replicationCount.textContent = result.replications;
    dataInfoSection.classList.remove("hidden");
  }

  function displayANOVATable(result) {
    anovaTableBody.innerHTML = "";

    // Genotype row (always present)
    addTableRow(
      "Genotype",
      result.dfGenotype,
      result.SSG,
      result.MSG,
      result.FGenotype,
      result.pValueGenotype
    );

    // Replication/Block row (present for RBD and LSD)
    if (result.design !== "CRD") {
      const label = result.design === "LSD" ? "Row+Column" : "Replication";
      addTableRow(
        label,
        result.dfReplication,
        result.SSR,
        result.MSR,
        result.FReplication,
        result.pValueReplication
      );
    }

    // Error row (always present)
    addTableRow("Error", result.dfError, result.SSE, result.MSE, null, null);

    // Total row (always present)
    addTableRow("Total", result.dfTotal, result.SST, null, null, null);

    anovaResults.classList.remove("hidden");
  }

  function addTableRow(source, df, SS, MS, F, pValue) {
    const row = document.createElement("tr");

    // Source
    const sourceCell = document.createElement("td");
    sourceCell.textContent = source;
    row.appendChild(sourceCell);

    // Degrees of Freedom
    const dfCell = document.createElement("td");
    dfCell.textContent = df.toFixed(df % 1 === 0 ? 0 : 2);
    row.appendChild(dfCell);

    // Sum of Squares
    const SSCell = document.createElement("td");
    SSCell.textContent = SS.toFixed(4);
    row.appendChild(SSCell);

    // Mean Square
    const MSCell = document.createElement("td");
    MSCell.textContent = MS ? MS.toFixed(4) : "";
    row.appendChild(MSCell);

    // F-value
    const FCell = document.createElement("td");
    FCell.textContent = F ? F.toFixed(4) : "";
    row.appendChild(FCell);

    // p-value
    const pCell = document.createElement("td");
    if (pValue) {
      pCell.textContent = pValue < 0.0001 ? "<0.0001" : pValue.toFixed(6);
    }
    row.appendChild(pCell);

    // Significance
    const sigCell = document.createElement("td");
    if (pValue) {
      const sigClass = getSignificanceClass(pValue);
      const sigText = getSignificanceStars(pValue);
      sigCell.innerHTML = `<span class="significance ${sigClass}">${sigText}</span>`;
    }
    row.appendChild(sigCell);

    anovaTableBody.appendChild(row);
  }

  function getSignificanceStars(pValue) {
    if (!pValue) return "";
    if (pValue < 0.001) return "***";
    if (pValue < 0.01) return "**";
    if (pValue < 0.05) return "*";
    return "ns";
  }

  function getSignificanceClass(pValue) {
    if (!pValue) return "";
    if (pValue < 0.001) return "sig-0";
    if (pValue < 0.01) return "sig-1";
    if (pValue < 0.05) return "sig-2";
    return "";
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
  }

  // Initialize
  updateDesignRequirements();
});
