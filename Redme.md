# Step 1: User Input for Number of Locations
## Functionality
1. The user enters the number of locations in an input field.
2. Clicking the Next button triggers the generateInputFields() function.
3. This function dynamically creates input fields for the number of replications and treatments for each location.
```
# HTML

<label for="locationCount">Enter Number of Locations:</label>
<input type="number" id="locationCount" min="1" size="5" oninput="resetButtons()" />
<button id="nextBtn" onclick="generateInputFields()">Next</button>
<div id="inputFields"></div>
<button id="generateTablesBtn" style="display: none" onclick="generateTables()">Generate Tables</button>

```
```
#JS

function generateInputFields() {
    const locationCount = document.getElementById("locationCount").value;
    const inputFieldsDiv = document.getElementById("inputFields");
    inputFieldsDiv.innerHTML = ""; // Clear previous fields

    for (let i = 1; i <= locationCount; i++) {
        inputFieldsDiv.innerHTML += `
            <div>
                <h4>Location ${i}</h4>
                <label>Replication Count:</label>
                <input type="number" id="replicationCount${i}" min="1" size="5">
                <label>Treatment Count:</label>
                <input type="number" id="treatmentCount${i}" min="1" size="5">
            </div>
        `;
    }
    document.getElementById("nextBtn").disabled = true;
    document.getElementById("generateTablesBtn").style.display = "block";
}
```
## Explanation
1. The function reads the number of locations entered by the user.
2. It dynamically generates input fields for replication count and treatment count.
3. The "Next" button is disabled after clicking to prevent multiple clicks.
4. The "Generate Tables" button is displayed.

# Step 2: Generate Tables for Data Entry
## Functionality
1. Once replications and treatments are entered, clicking "Generate Tables" creates tables dynamically.
2. Each table consists of:
    -Treatments (rows)
    -Replications (columns)
    -Input fields for values
    -Columns for total and mean.

```
# HTML

<div class="container" id="tablesContainer"></div>
<button id="calculateBtn" style="display: none" onclick="calculateTotals()">Calculate</button>
```
```
# JS

function generateTables() {
    const locationCount = document.getElementById("locationCount").value;
    if (!locationCount || locationCount < 1) return;
    const tablesContainer = document.getElementById("tablesContainer");
    tablesContainer.innerHTML = ""; // Clear previous tables

    for (let i = 1; i <= locationCount; i++) {
        const repCount = document.getElementById(`replicationCount${i}`).value;
        const treatCount = document.getElementById(`treatmentCount${i}`).value;

        let tableHTML = `<div class="location-section">
            <h4>Location ${i}</h4>
            <table>
                <tr>
                    <th>Treatment</th>`;
        for (let j = 1; j <= repCount; j++) {
            tableHTML += `<th>R${j}</th>`;
        }
        tableHTML += `<th>Total</th><th>Mean</th></tr>`;

        for (let k = 1; k <= treatCount; k++) {
            tableHTML += `<tr>
                <td>Treatment ${k}</td>`;
            for (let j = 1; j <= repCount; j++) {
                tableHTML += `<td><input type="number" id="loc${i}treat${k}rep${j}" placeholder="0" size="5"></td>`;
            }
            tableHTML += `<td id="loc${i}treat${k}total">0</td>
                          <td id="loc${i}treat${k}mean">0</td>
            </tr>`;
        }
        tableHTML += `</table></div>`;
        tablesContainer.innerHTML += tableHTML;
    }

    document.getElementById("generateTablesBtn").disabled = true;
    document.getElementById("calculateBtn").style.display = "block";
}
```
## Explanation
1. It loops through the number of locations and dynamically generates tables.
2. Each table has:
    -A header row for replications.
    -Rows for treatments, each containing input fields for data.
    -Columns for total and mean calculations.

# Step 3: Calculate Totals and ANOVA Components

## Functionality
1. The "Calculate" button computes:
    -Treatment Total
    -Mean
    -Sum of Squares (Total, Treatment, Replication, Error)
    -Degrees of Freedom
    -F-statistics
    -Coefficient of Variance

```
# JS

function calculateTotals() {
    const locationCount = document.getElementById("locationCount").value;

    for (let i = 1; i <= locationCount; i++) {
        const repCount = parseInt(document.getElementById(`replicationCount${i}`).value);
        const treatCount = parseInt(document.getElementById(`treatmentCount${i}`).value);
        let grandTotal = 0;
        let sumOfSquares = 0;

        for (let k = 1; k <= treatCount; k++) {
            let total = 0;
            for (let j = 1; j <= repCount; j++) {
                let cellValue = Number(document.getElementById(`loc${i}treat${k}rep${j}`).value) || 0;
                total += cellValue;
                sumOfSquares += cellValue ** 2;
            }
            let mean = total / repCount;
            document.getElementById(`loc${i}treat${k}total`).innerText = total;
            document.getElementById(`loc${i}treat${k}mean`).innerText = mean.toFixed(2);
            grandTotal += total;
        }

        let N = treatCount * repCount; // Total number of observations
        let correctionFactor = grandTotal ** 2 / N; // Correction Factor

        let totalSumOfSquares = sumOfSquares - correctionFactor;

        let dfTreatment = treatCount - 1;
        let dfReplication = repCount - 1;
        let dfError = dfTreatment * dfReplication;

        let meanTreatmentSS = totalSumOfSquares / dfTreatment;
        let meanErrorSS = totalSumOfSquares / dfError;
        let fcalTreatment = meanTreatmentSS / meanErrorSS;

        console.log(`Location ${i}: TSS = ${totalSumOfSquares}, Fcal = ${fcalTreatment}`);
    }

    document.getElementById("calculateBtn").disabled = true;
}
```
## Explanation
1. Loops through locations to compute:
    -Total Sum of Squares (TSS).
    -Degrees of Freedom (df) for treatment, replication, and error.
    -Mean Square (MS) by dividing sum of squares by df.
    -F-statistic (Fcal).

# Step 4: Generate Summary Table

## Functionality
1. Creates an overall summary table for all locations.

```
# JS

function generateSummaryTable() {
    let summaryHTML = `<h3>Overall Summary Table</h3>
                       <table><tr><th>Treatment</th>`;

    for (let i = 1; i <= locationCount; i++) {
        summaryHTML += `<th>Location ${i}</th>`;
    }
    summaryHTML += `<th>Total</th></tr>`;

    for (let t = 1; t <= maxTreatments; t++) {
        summaryHTML += `<tr><td>Treatment ${t}</td>`;
        for (let i = 1; i <= locationCount; i++) {
            summaryHTML += `<td>${document.getElementById(`loc${i}treat${t}mean`).innerText}</td>`;
        }
        summaryHTML += `</tr>`;
    }

    document.getElementById("summaryTableContainer").innerHTML = summaryHTML;
}
```