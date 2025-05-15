document.addEventListener("DOMContentLoaded", function () {
  const analyzeBtn = document.getElementById("analyze-btn");
  const dataInput = document.getElementById("data-input");
  const designType = document.getElementById("design-type");
  const dataInfoSection = document.getElementById("data-info");
  const anovaResults = document.getElementById("anova-results");
  const errorMessage = document.getElementById("error-message");

  analyzeBtn.addEventListener("click", function () {
    // Hide previous results and errors
    dataInfoSection.classList.add("hidden");
    anovaResults.classList.add("hidden");
    errorMessage.classList.add("hidden");

    try {
      // Parse input data
      const rawData = dataInput.value.trim();
      if (!rawData) throw new Error("Please enter data to analyze");

      const data = parseData(rawData);
      const design = designType.value;
      const result = performANOVA(data, design);

      // Display data information
      document.getElementById("treatment-count").textContent = result.genotypes;
      document.getElementById("replication-count").textContent =
        result.replications;
      document.getElementById("total-obs").textContent =
        result.totalObservations;
      dataInfoSection.classList.remove("hidden");

      // Display ANOVA table
      displayANOVATable(result);
      anovaResults.classList.remove("hidden");
    } catch (error) {
      errorMessage.textContent = error.message;
      errorMessage.classList.remove("hidden");
    }
  });

  function parseData(rawData) {
    const lines = rawData.split("\n").filter((line) => line.trim() !== "");
    return lines.map((line) => {
      const values = line.split(/[\s,]+/).filter((val) => val !== "");
      return values.map((val) => {
        const num = parseFloat(val);
        if (isNaN(num)) throw new Error(`Invalid number: ${val}`);
        return num;
      });
    });
  }

  function performANOVA(data, design) {
    const genotypes = data.length;
    if (genotypes === 0) throw new Error("No genotypes found in data");

    const replications = data[0].length;
    if (!data.every((row) => row.length === replications)) {
      throw new Error("All genotypes must have equal replications");
    }

    // Check LSD square requirement
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
    let SSE, dfGenotype, dfReplication, dfError;

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
      const n = genotypes; // n x n design

      // Calculate column totals (for LSD)
      let SSC = 0;
      const columnTotals = [];
      for (let j = 0; j < n; j++) {
        let colTotal = 0;
        for (let i = 0; i < n; i++) {
          colTotal += data[i][j];
        }
        columnTotals.push(colTotal);
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

    // Calculate mean squares
    const MSG = SSG / dfGenotype;
    const MSR = design === "CRD" ? 0 : SSR / dfReplication;
    const MSE = SSE / dfError;

    // Calculate F-values
    const FGenotype = MSG / MSE;
    const FReplication = design === "CRD" ? 0 : MSR / MSE;

    // Calculate p-values
    const pValueGenotype = fDistribution(FGenotype, dfGenotype, dfError);
    const pValueReplication =
      design === "CRD"
        ? 0
        : fDistribution(FReplication, dfReplication, dfError);

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

  function displayANOVATable(result) {
    const tableBody = document.querySelector("#anova-table tbody");
    tableBody.innerHTML = "";

    // Genotype row (always present)
    addTableRow(
      tableBody,
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
        tableBody,
        label,
        result.dfReplication,
        result.SSR,
        result.MSR,
        result.FReplication,
        result.pValueReplication
      );
    }

    // Error row (always present)
    addTableRow(
      tableBody,
      "Error",
      result.dfError,
      result.SSE,
      result.MSE,
      "",
      ""
    );

    // Total row (always present)
    addTableRow(tableBody, "Total", result.dfTotal, result.SST, "", "", "");
  }

  function addTableRow(tableBody, source, df, SS, MS, F, pValue) {
    const row = document.createElement("tr");

    const cells = [
      source,
      df.toFixed(df % 1 === 0 ? 0 : 2),
      SS.toFixed(4),
      MS ? MS.toFixed(4) : "",
      F ? F.toFixed(4) : "",
      pValue ? pValue.toFixed(6) : "",
    ];

    cells.forEach((text) => {
      const cell = document.createElement("td");
      cell.textContent = text;
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  }

  // F-distribution p-value approximation
  function fDistribution(F, df1, df2) {
    if (F <= 0) return 1;

    // Simplified approximation using beta distribution
    const x = df2 / (df2 + df1 * F);
    return 1 - incompleteBeta(x, df2 / 2, df1 / 2);
  }

  // Incomplete beta function approximation
  function incompleteBeta(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    const beta = (math.gamma(a) * math.gamma(b)) / math.gamma(a + b);
    const term = Math.pow(x, a) * Math.pow(1 - x, b);
    return term / (a * beta);
  }

  // Gamma function using math.js library (would need to include math.js)
  // Fallback simple gamma approximation if math.js not available
  const math = {
    gamma: function (z) {
      // Simple Stirling approximation
      return (
        Math.sqrt((2 * Math.PI) / z) *
        Math.pow((1 / Math.E) * (z + 1 / (12 * z - 1 / (10 * z))), z)
      );
    },
  };
});
