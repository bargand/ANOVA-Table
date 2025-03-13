function calculateSummaryStats() {
  const locationCount = document.getElementById("locationCount").value;
  let maxTreatments = 0;
  let grandTotal = 0;
  let treatmentTotals = [];
  let sumOfSquares = 0;

  let locationErrorDF = [];
  let locationESS = [];

  // Find max treatments and calculate grand total
  for (let t = 1; t <= locationCount; t++) {
    let treatCount = parseInt(
      document.getElementById(`treatmentCount${t}`).value
    );
    maxTreatments = Math.max(maxTreatments, treatCount);
  }

  // Compute Treatment Totals and Sum of Squares
  for (let t = 1; t <= maxTreatments; t++) {
    let rowTotal = 0;
    for (let i = 1; i <= locationCount; i++) {
      let treatCount = parseInt(
        document.getElementById(`treatmentCount${i}`).value
      );
      let meanValue =
        t <= treatCount
          ? parseFloat(
              document.getElementById(`loc${i}treat${t}mean`).innerText
            ) || 0
          : 0;
      rowTotal += meanValue;
      sumOfSquares += meanValue ** 2;
    }
    treatmentTotals.push(rowTotal);
    grandTotal += rowTotal;
  }

  let N = maxTreatments * locationCount; // Total number of observations
  let correctionFactor = grandTotal ** 2 / N; // CF Calculation

  // Total Sum of Squares (TSS)
  let totalSumOfSquares = sumOfSquares - correctionFactor;

  // Treatment Sum of Squares (TrSS)
  let treatmentSquaresSum = treatmentTotals.reduce(
    (sum, value) => sum + value ** 2,
    0
  );
  let treatmentSumOfSquares =
    treatmentSquaresSum / locationCount - correctionFactor;

  // Replication Sum of Squares (RSS)
  let replicationTotals = new Array(locationCount).fill(0);
  for (let i = 1; i <= locationCount; i++) {
    let colTotal = 0;
    for (let t = 1; t <= maxTreatments; t++) {
      let treatCount = parseInt(
        document.getElementById(`treatmentCount${i}`).value
      );
      let meanValue =
        t <= treatCount
          ? parseFloat(
              document.getElementById(`loc${i}treat${t}mean`).innerText
            ) || 0
          : 0;
      colTotal += meanValue;
    }
    replicationTotals[i - 1] = colTotal;
  }
  let replicationSquaresSum = replicationTotals.reduce(
    (sum, value) => sum + value ** 2,
    0
  );
  let replicationSumOfSquares =
    replicationSquaresSum / maxTreatments - correctionFactor;

  // Error Sum of Squares (ESS)
  let errorSumOfSquares =
    totalSumOfSquares - (treatmentSumOfSquares + replicationSumOfSquares);

  // **📌 Individual Location-wise Error DF and ESS Calculation**
  for (let i = 1; i <= locationCount; i++) {
    let treatCount = parseInt(
      document.getElementById(`treatmentCount${i}`).value
    );
    let repCount = parseInt(
      document.getElementById(`replicationCount${i}`).value
    );

    // Error df for each location
    let df_Error = (treatCount - 1) * (repCount - 1);
    locationErrorDF.push(df_Error);

    // Compute Individual Location-wise TSS, TrSS, RSS
    let sumOfSquares_Location = 0;
    let treatmentTotals_Location = [];
    let replicationTotals_Location = new Array(repCount).fill(0);
    let grandTotal_Location = 0;

    for (let t = 1; t <= treatCount; t++) {
      let rowTotal = 0;
      for (let r = 1; r <= repCount; r++) {
        let value =
          parseFloat(
            document.getElementById(`loc${i}treat${t}rep${r}`).value
          ) || 0;
        rowTotal += value;
        sumOfSquares_Location += value ** 2;
        replicationTotals_Location[r - 1] += value;
      }
      treatmentTotals_Location.push(rowTotal);
      grandTotal_Location += rowTotal;
    }

    let CF_Location = grandTotal_Location ** 2 / (treatCount * repCount);
    let TSS_Location = sumOfSquares_Location - CF_Location;
    let TrSS_Location =
      treatmentTotals_Location.reduce((sum, val) => sum + val ** 2, 0) /
        repCount -
      CF_Location;
    let RSS_Location =
      replicationTotals_Location.reduce((sum, val) => sum + val ** 2, 0) /
        treatCount -
      CF_Location;

    // Individual ESS for each location
    let ESS_Location = TSS_Location - (TrSS_Location + RSS_Location);
    locationESS.push(ESS_Location);
  }

  // Display Results
  let summaryStatsHTML = `
  <h3>Summary Table Calculations</h3>
  <div class="formula-box">
      <p><strong>Correction Factor (CF):</strong> (${grandTotal}² / ${N}) = <b>${correctionFactor.toFixed(
    2
  )}</b></p>
      <p><strong>Total Sum of Squares (TSS):</strong> (Sum of Squares of all values - CF) = <b>${totalSumOfSquares.toFixed(
        2
      )}</b></p>
      <p><strong>Treatment Sum of Squares (TrSS):</strong> ((Sum of Squares of Treatment Totals / Locations) - CF) = <b>${treatmentSumOfSquares.toFixed(
        2
      )}</b></p>
      <p><strong>Replication Sum of Squares (RSS):</strong> ((Sum of Squares of Replication Totals / Treatments) - CF) = <b>${replicationSumOfSquares.toFixed(
        2
      )}</b></p>
      <p><strong>Error Sum of Squares (ESS):</strong> (TSS - (TrSS + RSS)) = <b>${errorSumOfSquares.toFixed(
        2
      )}</b></p>
  </div>`;

  summaryStatsHTML += `<h3>Individual Location-wise Error df & ESS</h3>
  <table border="1">
  <tr>
      <th>Location</th>
      <th>Error df</th>
      <th>Error Sum of Squares (ESS)</th>
  </tr>`;

  for (let i = 0; i < locationCount; i++) {
    summaryStatsHTML += `<tr>
      <td>Location ${i + 1}</td>
      <td>${locationErrorDF[i]}</td>
      <td>${locationESS[i].toFixed(2)}</td>
      </tr>`;
  }

  summaryStatsHTML += `</table>`;

  document.getElementById("summaryStatsContainer").innerHTML = summaryStatsHTML;
  document.getElementById("calculateSummaryBtn").disabled = true; // Disable the button after calculation
}
