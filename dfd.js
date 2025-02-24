function generateSummaryTable() {
    const locationCount = document.getElementById("locationCount").value;
    let maxTreatments = 0;

    // Find max treatments across locations
    for (let i = 1; i <= locationCount; i++) {
      let treatCount = parseInt(
        document.getElementById(`treatmentCount${i}`).value
      );
      if (treatCount > maxTreatments) {
        maxTreatments = treatCount;
      }
    }

    let summaryHTML = `<h3>Overall Summary Table</h3>
                 <table border="1">
                 <tr>
                   <th>Treatment</th>`;

    // Add column headers for each location
    for (let i = 1; i <= locationCount; i++) {
      summaryHTML += `<th>Location ${i}</th>`;
    }
    summaryHTML += `<th>Total</th></tr>`; // Total Column

    let grandTotal = 0;
    let locationTotals = new Array(parseInt(locationCount)).fill(0); // Store total for each location

    // Iterate through treatments (rows)
    for (let t = 1; t <= maxTreatments; t++) {
      let rowTotal = 0;
      summaryHTML += `<tr><td><strong>Treatment ${t}</strong></td>`;

      // Iterate through locations (columns)
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

        summaryHTML += `<td>${meanValue.toFixed(2)}</td>`;
        rowTotal += meanValue;
        locationTotals[i - 1] += meanValue; // Correctly storing total for each location
      }

      summaryHTML += `<td><strong>${rowTotal.toFixed(
        2
      )}</strong></td></tr>`;
      grandTotal += rowTotal;
    }

    // Add Total Row (Sum of each column)
    summaryHTML += `<tr><td><strong>Total</strong></td>`;
    for (let i = 0; i < locationCount; i++) {
      summaryHTML += `<td><strong>${locationTotals[i].toFixed(
        2
      )}</strong></td>`;
    }
    summaryHTML += `<td><strong>${grandTotal.toFixed(
      2
    )}</strong></td></tr>`;

    summaryHTML += `</table>`;

    // Display Summary Table
    document.getElementById("summaryBtn").disabled = true;
    document.getElementById("summaryTableContainer").innerHTML =
      summaryHTML;
  }