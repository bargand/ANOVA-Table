// Declare global variables to store pooled values
let totalErrorsSumPooled = 0;
let totalESSumPooled = 0;
let totalMSSumPooled = 0;

function calculateTotals() {
    const locationCount = document.getElementById("locationCount").value;

    // Reset pooled values before calculation
    totalErrorsSumPooled = 0;
    totalESSumPooled = 0;
    totalMSSumPooled = 0;

    for (let i = 1; i <= locationCount; i++) {
        const repCount = parseInt(document.getElementById(`replicationCount${i}`).value);
        const treatCount = parseInt(document.getElementById(`treatmentCount${i}`).value);
        let grandTotal = 0;
        let columnTotals = new Array(repCount).fill(0);
        let treatmentSums = [];
        let sumOfSquares = 0;

        for (let k = 1; k <= treatCount; k++) {
            let total = 0;
            for (let j = 1; j <= repCount; j++) {
                let cellValue = Number(document.getElementById(`loc${i}treat${k}rep${j}`).value) || 0;
                total += cellValue;
                columnTotals[j - 1] += cellValue;
                sumOfSquares += cellValue ** 2;
            }
            let mean = total / repCount;
            document.getElementById(`loc${i}treat${k}total`).innerText = total;
            document.getElementById(`loc${i}treat${k}mean`).innerText = mean.toFixed(2);
            grandTotal += total;
            treatmentSums.push(total);
        }

        let N = treatCount * repCount;
        let correctionFactor = grandTotal ** 2 / N;
        let totalSumOfSquares = sumOfSquares - correctionFactor;
        let treatmentSumOfSquares = treatmentSums.reduce((sum, value) => sum + value ** 2, 0);
        let finalTreatmentSum = treatmentSumOfSquares / repCount - correctionFactor;
        let replicationSumOfSquares = columnTotals.reduce((sum, value) => sum + value ** 2, 0);
        let finalReplicationSum = replicationSumOfSquares / treatCount - correctionFactor;
        let errorSumOfSquares = totalSumOfSquares - (finalTreatmentSum + finalReplicationSum);

        let dfTreatment = treatCount - 1;
        let dfReplication = repCount - 1;
        let dfError = dfTreatment * dfReplication;
        totalErrorsSumPooled += dfError;
        totalESSumPooled += errorSumOfSquares;

        let meanErrorSS = errorSumOfSquares / dfError;
        totalMSSumPooled += meanErrorSS;
    }

    console.log(`Total Error Sum Across All Locations: ${totalErrorsSumPooled}`);
    console.log(`Total Error Sum of Squares (ESS) Across All Locations: ${totalESSumPooled.toFixed(2)}`);
    console.log(`Total Mean Sum of Squares (MSS) Across All Locations: ${totalMSSumPooled.toFixed(2)}`);
}

function calculateSummaryStats() {
    const locationCount = document.getElementById("locationCount").value;
    let maxTreatments = 0;
    let grandTotal = 0;
    let treatmentTotals = [];
    let sumOfSquares = 0;

    for (let t = 1; t <= locationCount; t++) {
        let treatCount = parseInt(document.getElementById(`treatmentCount${t}`).value);
        maxTreatments = Math.max(maxTreatments, treatCount);
    }

    for (let t = 1; t <= maxTreatments; t++) {
        let rowTotal = 0;
        for (let i = 1; i <= locationCount; i++) {
            let treatCount = parseInt(document.getElementById(`treatmentCount${i}`).value);
            let meanValue =
                t <= treatCount
                    ? parseFloat(document.getElementById(`loc${i}treat${t}mean`).innerText) || 0
                    : 0;
            rowTotal += meanValue;
            sumOfSquares += meanValue ** 2;
        }
        treatmentTotals.push(rowTotal);
        grandTotal += rowTotal;
    }

    let N = maxTreatments * locationCount;
    let correctionFactor = grandTotal ** 2 / N;
    let totalSumOfSquares = sumOfSquares - correctionFactor;
    let treatmentSquaresSum = treatmentTotals.reduce((sum, value) => sum + value ** 2, 0);
    let treatmentSumOfSquares = treatmentSquaresSum / locationCount - correctionFactor;
    let replicationTotals = new Array(locationCount).fill(0);

    for (let i = 1; i <= locationCount; i++) {
        let colTotal = 0;
        for (let t = 1; t <= maxTreatments; t++) {
            let treatCount = parseInt(document.getElementById(`treatmentCount${i}`).value);
            let meanValue =
                t <= treatCount
                    ? parseFloat(document.getElementById(`loc${i}treat${t}mean`).innerText) || 0
                    : 0;
            colTotal += meanValue;
        }
        replicationTotals[i - 1] = colTotal;
    }

    let replicationSquaresSum = replicationTotals.reduce((sum, value) => sum + value ** 2, 0);
    let replicationSumOfSquares = replicationSquaresSum / maxTreatments - correctionFactor;
    let errorSumOfSquares = totalSumOfSquares - (treatmentSumOfSquares + replicationSumOfSquares);
    let Z = (maxTreatments - 1) * (locationCount - 1);
    let A = treatmentSumOfSquares.toFixed(2) / (maxTreatments - 1);
    let B = replicationSumOfSquares.toFixed(2) / (locationCount - 1);
    let C = errorSumOfSquares.toFixed(2) / Z;
    let I = (A / C).toFixed(2);
    let J = (B / C).toFixed(2);

    let SummaryAnovaTableHTML = `
        <table>
            <tr>
                <th>Source of Variation</th>
                <th>Degree of Freedom (d.f)</th>
                <th>Sum of Square (SS)</th>
                <th>Mean Sum of Square (MSS)</th>
                <th>F<sub>cal</sub></th>
                <th>E<sub>MSS</sub></th>
            </tr>
            <tr>
                <td><b>Pooled Error</b></td>
                <td>Sum of individual locations<br><br>${totalErrorsSumPooled}</td>
                <td>Sum of individual locations SS<br><br><b>${totalESSumPooled.toFixed(2)}</b></td>
                <td><b>Sum of individual locations MSS</b><br><br>${totalMSSumPooled.toFixed(2)}</td>
                <td>-</td>
                <td>σ²e=<br><br><b>${totalMSSumPooled.toFixed(2)}</b></td>
            </tr>
        </table>
    `;

    document.getElementById("SummaryAnovaResults").innerHTML = SummaryAnovaTableHTML;
}
