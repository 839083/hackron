let csvData = [];

// Function to Show Custom Alerts
function showAlert(message, type = "success") {
    const alertBox = document.getElementById("alertBox");
    alertBox.innerHTML = message;
    alertBox.className = `alert ${type} show`;

    setTimeout(() => {
        alertBox.classList.remove("show");
    }, 3000);
}

// Load CSV File (Only Reads File)
function loadCSVFile() {
    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];

    if (!file) {
        showAlert("Please select a CSV file first.", "error");
        return;
    }

    if (!file.name.endsWith(".csv")) {
        showAlert("Invalid file type! Please upload a .csv file.", "error");
        fileInput.value = ""; // Clear input
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        const fileContent = event.target.result;
        const rows = fileContent.split("\n").map(row => row.trim()).filter(row => row);
        csvData = rows.map(row => row.split(","));

        if (csvData.length > 1) {
            showAlert("File loaded successfully. Click 'Upload' to display the table.", "success");
        } else {
            showAlert("CSV file is empty or incorrectly formatted.", "error");
        }
    };

    reader.readAsText(file);
}

// Show Table and Populate Data (Only on Upload Click)
function uploadCSVData() {
    if (csvData.length === 0) {
        showAlert("No file loaded. Please select and load a CSV file first.", "error");
        return;
    }

    populateTable(csvData);
    const tableContainer = document.querySelector(".table-container");
    tableContainer.style.display = "block"; // Show table
    tableContainer.style.opacity = "0";
    
    setTimeout(() => {
        tableContainer.style.opacity = "1"; // Smooth fade-in effect
        tableContainer.style.transition = "opacity 0.5s ease-in-out";
    }, 100);
}

// Populate Table with CSV Data
function populateTable(data) {
    const tableBody = document.querySelector("#pricingTable tbody");
    tableBody.innerHTML = '';

    data.forEach((row, index) => {
        if (index === 0) return; // Skip header row

        const tr = document.createElement("tr");
        row.forEach((cell, i) => {
            const td = document.createElement("td");

            if (i === 12) {
                td.innerHTML = `<input type="number" step="0.01" value="${cell || 0}" />`; 
            } else if (i === 13) {
                td.innerHTML = `<input type="text" value="" readonly />`; // Final price column
            } else {
                td.innerHTML = `<input type="text" value="${cell || ''}" />`;
            }

            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

// Calculate Final Price Based on Various Factors
function calculateFinalPrice() {
    const rows = document.querySelectorAll("#pricingTable tbody tr");

    rows.forEach(row => {
        const inputs = row.querySelectorAll("input");

        const basePrice = parseFloat(inputs[12].value) || 0;
        const demand = inputs[3].value.trim();
        const stockLevel = parseFloat(inputs[6].value) || 0;
        const season = inputs[8].value.trim();
        const competitorPrice = parseFloat(inputs[10].value) || basePrice;
        const promotion = inputs[11].value.trim();

        let discountPercentage = 0;
        if (promotion.includes("10%")) discountPercentage = 0.10;
        else if (promotion.includes("5%")) discountPercentage = 0.05;
        else if (promotion.includes("15%")) discountPercentage = 0.15;
        else if (promotion.includes("20%")) discountPercentage = 0.20;

        let discountedPrice = basePrice * (1 - discountPercentage);

        let competitorAdjustment = 0;
        if (basePrice > competitorPrice * 1.2) {
            competitorAdjustment = -0.05 * basePrice;
        } else if (basePrice < competitorPrice * 0.8) {
            competitorAdjustment = 0.05 * basePrice;
        }

        let stockAdjustment = stockLevel < 20 ? 0.05 * basePrice : stockLevel > 70 ? -0.05 * basePrice : 0;

        let demandAdjustment = demand === "High" ? 0.10 * basePrice : demand === "Low" ? -0.05 * basePrice : 0;

        let seasonalAdjustment = season === "Peak" ? 0.07 * basePrice : season === "Off-Season" ? -0.05 * basePrice : 0;

        let finalPrice = discountedPrice + competitorAdjustment + stockAdjustment + demandAdjustment + seasonalAdjustment;

        inputs[13].value = finalPrice.toFixed(2); // Update Final Price Column
    });

    showAlert("Final prices calculated successfully!", "success");
}

// Download Updated CSV File
function downloadCSV() {
    let csvContent = "ProductID,ProductName,Category,Demand,TimeOfDay,WeatherCondition,StockLevel,Location,Season,PriceSensitivity,CompetitorPrice,Promotion,BasePrice,FinalPrice\n";

    document.querySelectorAll("#pricingTable tbody tr").forEach(row => {
        let rowData = [];
        row.querySelectorAll("input").forEach(input => {
            rowData.push(input.value);
        });
        csvContent += rowData.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "product_pricing.csv";
    link.click();

    showAlert("CSV file downloaded successfully!", "success");
}

// Hide Table Initially
document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".table-container").style.display = "none";
});



function showAlert(message, type) {
    const alertBox = document.createElement("div");
    alertBox.classList.add("custom-alert", type);
    alertBox.textContent = message;

    document.body.appendChild(alertBox);

    // Remove alert after 3 seconds
    setTimeout(() => {
        alertBox.remove();
    }, 3000);
}

