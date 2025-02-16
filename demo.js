document.getElementById("FmssTreatment").innerHTML = meanTreatmentSS.toFixed(2);
document.getElementById("FmssError").innerHTML = meanErrorSS.toFixed(2);

let genotype = ((meanTreatmentSS - meanErrorSS) / replications).toFixed(2);
document.getElementById(
  "FmssGenotype"
).innerHTML = `(${meanTreatmentSS.toFixed(2)} - ${meanErrorSS.toFixed(2)}) / ${replications} = ${genotype}`;

let phenotype = (parseFloat(genotype) + meanErrorSS).toFixed(2);
document.getElementById(
  "FmssPhenotype"
).innerHTML = `${genotype} + ${meanErrorSS.toFixed(2)} = ${phenotype}`;
