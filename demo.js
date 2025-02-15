function calculateTotals() {
    let treatments = parseInt(document.getElementById("treatmentCount").value);
    let replications = parseInt(document.getElementById("replicationCount").value);
    
    if (isNaN(treatments) || treatments < 2 || isNaN(replications) || replications < 2) {
        alert("Invalid treatment or replication count. Please enter valid numbers.");
        return;
    }

    let grandTotal = 0;
    let colTotals = new Array(replications).fill(0);
    let sumOfSquares = 0;
    let sumOfSquaresFormula = "";
    let treatmentSums = [];
    let treatmentSquaresFormula = "";

    for (let i = 1; i <= treatments; i++) {
        let rowTotal = 0;
        for (let j = 1; j <= replications; j++) {
            let cell = document.getElementById(`V${i}R${j}`);
            let val = parseFloat(cell.value);

            // Validate input (should be a number and non-negative)
            if (isNaN(val) || val < 0) {
                alert(`Invalid value in V${i}R${j}. Please enter a non-negative number.`);
                cell.value = "";
                return;
            }

            rowTotal += val;
            colTotals[j - 1] += val;
            sumOfSquares += val * val;
            sumOfSquaresFormula += (sumOfSquaresFormula ? " + " : "") + `${val}²`;
        }
        treatmentSums.push(rowTotal);
        treatmentSquaresFormula += (treatmentSquaresFormula ? " + " : "") + `${rowTotal}²`;
        document.getElementById(`V${i}Total`).innerText = rowTotal;
        grandTotal += rowTotal;
    }

    // Continue calculations as normal...
}
