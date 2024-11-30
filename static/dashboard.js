// Store references to charts globally so we can destroy them before creating new ones
let charts = {};

// Function to get a CSS variable's value
function getCSSVariableValue(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

// Function to convert rem to pixels
function remToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

// Track which column (Days or Cost) is currently selected
let selectedColumn = 'days';  // Default to 'days'

// Handle button toggling between 'Days' and 'Cost'
// if days
document.getElementById('days-btn').addEventListener('click', function () {
    selectedColumn = 'days';
    toggleButtons(this, document.getElementById('cost-btn'));
    refreshCharts();
    updateSubtitleWithStats(); 
});
// if costs
document.getElementById('cost-btn').addEventListener('click', function () {
    selectedColumn = 'cost';
    toggleButtons(this, document.getElementById('days-btn'));
    refreshCharts();
    updateSubtitleWithStats(); 
});

// Function to toggle button states
function toggleButtons(activeBtn, inactiveBtn) {
    activeBtn.classList.add('active');
    activeBtn.classList.remove('inactive');
    inactiveBtn.classList.add('inactive');
    inactiveBtn.classList.remove('active');
}

// Function to fetch data from the API and render a chart
async function fetchDataAndRenderChart(apiEndpoint, chartElementId, chartConfig) {
    try {
        let response = await fetch(apiEndpoint);
        let data = await response.json();

        const ctx = document.getElementById(chartElementId).getContext('2d');

        // Destroy the existing chart if it exists
        if (charts[chartElementId]) {
            charts[chartElementId].destroy();
        }

        // Create the new chart and store its reference
        charts[chartElementId] = new Chart(ctx, chartConfig(data));
    } catch (error) {
        console.error("Error fetching or rendering chart:", error);
    }
}

// Function to refresh all charts based on the selected column (Days or Cost)
function refreshCharts() {
    const apiEndpointPrefix = selectedColumn === 'days' ? "/api/days" : "/api/cost";
    
    // Configuration for the tooltip callback
    const tooltipCallback = {
        callbacks: {
            label: function (tooltipItem) {
                var value = tooltipItem.raw;
                // Format with comma separation and 1 decimal place
                return value.toLocaleString('en-UK', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
            }
        }
    };

    // Refresh the Efficiency by Year chart
    fetchDataAndRenderChart(`${apiEndpointPrefix}_per_year`, "wellcountsChart", (data) => ({
        type: "line",
        data: {
            labels: data.Year,
            datasets: [{
                label: selectedColumn === 'days' ? 'Days per 1000m' : 'Cost per 1000m',
                data: data[selectedColumn === 'days' ? 'avg_days' : 'avg_cost'],
                backgroundColor: getCSSVariableValue('--color-septenary') + '66', 
                borderColor: getCSSVariableValue('--color-septenary'),
                borderWidth: 4,
                pointRadius: 8,
                pointHoverRadius: 10,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: selectedColumn === 'days' ? "Days per 1000m" : "Cost per 1000m",
                        font: { size: remToPixels(0.8) }
                    }
                },
                x: { display: true }
            },
            plugins: { 
                tooltip: tooltipCallback,
                legend: { display: false } }
        }
    }));

    // Refresh the Efficiency by Era chart
    fetchDataAndRenderChart(`${apiEndpointPrefix}_per_era`, "eracountsChart", (data) => ({
        type: "bar",
        data: {
            labels: data.Era,
            datasets: [{
                label: selectedColumn === 'days' ? 'Days per 1000m' : 'Cost per 1000m',
                data: data[selectedColumn === 'days' ? 'avg_days' : 'avg_cost'],
                backgroundColor: [
                    getCSSVariableValue('--color-primary') + '90',
                    getCSSVariableValue('--color-secondary') + '90',
                    getCSSVariableValue('--color-tertiary') + '90',
                    getCSSVariableValue('--color-quaternary') + '90',
                ],
                borderColor: [
                    getCSSVariableValue('--color-primary'),
                    getCSSVariableValue('--color-secondary'),
                    getCSSVariableValue('--color-tertiary'),
                    getCSSVariableValue('--color-quaternary'),
                ],
                borderWidth: 6
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: selectedColumn === 'days' ? "Days per 1000m" : "Cost per 1000m",
                        font: { size: remToPixels(0.8) }
                    }
                },
                x: {
                    beginAtZero: false,
                    display: true }
            },
            plugins: { 
                tooltip: tooltipCallback,
                legend: { display: false } }
        }
    }));

    // Refresh the Efficiency by Region chart
    fetchDataAndRenderChart(`${apiEndpointPrefix}_per_region`, "regioncountsChart", (data) => ({
        type: "bar",
        data: {
            labels: data.Region,
            datasets: [{
                label: selectedColumn === 'days' ? 'Days per 1000m' : 'Cost per 1000m',
                data: data[selectedColumn === 'days' ? 'avg_days' : 'avg_cost'],
                backgroundColor: [
                    getCSSVariableValue('--color-primary') + '90',
                    getCSSVariableValue('--color-secondary') + '90',
                    getCSSVariableValue('--color-tertiary') + '90',
                    getCSSVariableValue('--color-quaternary') + '90',
                    getCSSVariableValue('--color-quinary') + '90',
                    getCSSVariableValue('--color-senary') + '90'
                ],
                borderColor: [
                    getCSSVariableValue('--color-primary'),
                    getCSSVariableValue('--color-secondary'),
                    getCSSVariableValue('--color-tertiary'),
                    getCSSVariableValue('--color-quaternary'),
                    getCSSVariableValue('--color-quinary'),
                    getCSSVariableValue('--color-senary')
                ],
                borderWidth: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: selectedColumn === 'days' ? "Days per 1000m" : "Cost per 1000m",
                        font: { size: remToPixels(0.8) }
                    }
                },
                x: { 
                    tooltip: tooltipCallback,
                    display: true },
            },
            plugins: { legend: { display: false } }
        }
    }));

    // Refresh the Efficiency by Well Type chart
    fetchDataAndRenderChart(`${apiEndpointPrefix}_per_well_type`, "welltypecountsChart", (data) => ({
        type: "bar",
        data: {
            labels: data.Well_Type,
            datasets: [{
                label: selectedColumn === 'days' ? 'Days per 1000m' : 'Cost per 1000m',
                data: data[selectedColumn === 'days' ? 'avg_days' : 'avg_cost'],
                backgroundColor: [
                    getCSSVariableValue('--color-primary') + '90',
                    getCSSVariableValue('--color-secondary') + '90',
                    getCSSVariableValue('--color-tertiary') + '90'
                ],
                borderColor: [
                    getCSSVariableValue('--color-primary'),
                    getCSSVariableValue('--color-secondary'),
                    getCSSVariableValue('--color-tertiary')
                ],
                borderWidth: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: selectedColumn === 'days' ? "Days per 1000m" : "Cost per 1000m",
                        font: { size: remToPixels(0.8) }
                    }
                },
                x: { display: true }
            },
            plugins: { 
                tooltip: tooltipCallback,
                legend: { display: false } }
        }
    }));
}

// Function to fetch and update the subtitle with summary statistics
async function updateSubtitleWithStats() {
    try {
        // Fetch the summary statistics from the API
        const response = await fetch("/api/summary_stats");
        const data = await response.json();

        // Conditionally format the output based on the selected column
        const formattedStats = `
        Number of Wells: ${data.total_wells.toLocaleString('en-US')} | 
        ${selectedColumn === 'days' 
            ? `Average Days per 1000m: ${(+data.avg_days.toFixed(1)).toLocaleString('en-US')}` 
            : `Average Cost per 1000m: ${(+data.avg_cost.toFixed(1)).toLocaleString('en-US')}`
        }
    `;
    

        // Update the subtitle element
        const subtitleElement = document.querySelector(".dashboard-subtitle");
        subtitleElement.textContent = formattedStats;
    } catch (error) {
        console.error("Error fetching or rendering subtitle stats:", error);
    }
}

// Ensure the subtitle is updated when the page loads
document.addEventListener("DOMContentLoaded", updateSubtitleWithStats);



// Initial fetch and render of charts using the default column
refreshCharts();
