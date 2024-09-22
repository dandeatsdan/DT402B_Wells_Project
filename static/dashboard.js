// Function to get a CSS variable's value
function getCSSVariableValue(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

// Function to convert rem to pixels
function remToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

// Function to fetch data from the API and render a chart
async function fetchDataAndRenderChart(apiEndpoint, chartElementId, chartConfig) {
    try {
        // Fetch data from the API
        let response = await fetch(apiEndpoint);
        let data = await response.json();

        // Get the canvas context where the chart will be rendered
        const ctx = document.getElementById(chartElementId).getContext('2d');

        // Render the chart using the provided configuration
        new Chart(ctx, chartConfig(data));
    } catch (error) {
        // Log any errors
        console.error("Error fetching or rendering chart:", error);
    }
}

// Fetch and render the "Efficiency over time" chart
fetchDataAndRenderChart("/api/days_per_year", "wellcountsChart", (data) => ({
    type: "line",
    data: {
        labels: data.Year,
        datasets: [{
            label: 'Days per 1000m',
            data: data.avg_days,
            backgroundColor: getCSSVariableValue('--color-septenary') + '66', 
            borderColor: getCSSVariableValue('--color-septenary'),
            borderWidth: 4,  // Increase line width
            pointRadius: 8,  // Increase marker size
            pointHoverRadius: 10,  // Increase marker size on hover
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
                    text: "Days per 1000m",
                    font: {
                        size: remToPixels(0.8)  // Dynamic font size in rem
                    }
                }
            },
            x: {
                display: true
            }
        },
        plugins: {
            legend: {
                display: false  // Disable legend
            }
        }
    }
}));

// Fetch and render the "Efficiency by era" chart
fetchDataAndRenderChart("/api/days_per_era", "eracountsChart", (data) => ({
    type: "bar",  // Keep "bar" for both horizontal and vertical charts
    data: {
        labels: data.Era,
        datasets: [{
            label: 'Days per 1000m',
            data: data.avg_days,
            backgroundColor: [
                getCSSVariableValue('--color-primary') + 90,
                getCSSVariableValue('--color-secondary') +90,
                getCSSVariableValue('--color-tertiary') +90,
                getCSSVariableValue('--color-quaternary') +90,
            ],  // Array of colors for each bar
            borderColor: [
                getCSSVariableValue('--color-primary'),
                getCSSVariableValue('--color-secondary'),
                getCSSVariableValue('--color-tertiary'),
                getCSSVariableValue('--color-quaternary'),
            ],  // Array of border colors matching each bar
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
                    text: "Days per 1000m",
                    font: {
                        size: remToPixels(0.8)  // Dynamic font size in rem
                    }
                },
            },
            x: {
                beginAtZero: false,
                display: true
            }
        },
        plugins: {
            legend: {
                display: false  // Disable legend
            }
        }
    }
}));




// Fetch and render the "Efficiency by Region" chart
fetchDataAndRenderChart("/api/days_per_region", "regioncountsChart", (data) => ({
    type: "bar",
    data: {
        labels: data.Region,
        datasets: [{
            label: 'Days per 1000m',
            data: data.avg_days,
            backgroundColor: [
                getCSSVariableValue('--color-primary') + 90,
                getCSSVariableValue('--color-secondary') +90,
                getCSSVariableValue('--color-tertiary') +90,
                getCSSVariableValue('--color-quaternary') +90,
                getCSSVariableValue('--color-quinary') +90,
                getCSSVariableValue('--color-senary') +90
            ],  // Array of colors for each bar
            borderColor: [
                getCSSVariableValue('--color-primary'),
                getCSSVariableValue('--color-secondary'),
                getCSSVariableValue('--color-tertiary'),
                getCSSVariableValue('--color-quaternary'),
                getCSSVariableValue('--color-quinary'),
                getCSSVariableValue('--color-senary')
            ],  // Array of border colors matching each bar
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
                    text: "Days per 1000m",
                    font: {
                        size: remToPixels(0.8)  // Dynamic font size in rem
                    }
                },
            },
            x: {
                display: true
            }
        },
        plugins: {
            legend: {
                display: false  // Disable legend
            }
        }
    }
}));


// Fetch and render the "Efficiency by Well Type" chart
fetchDataAndRenderChart("/api/days_per_well_type", "welltypecountsChart", (data) => ({
    type: "bar",
    data: {
        labels: data.Well_Type,
        datasets: [{
            label: 'Days per 1000m',
            data: data.avg_days,
            backgroundColor: [
                getCSSVariableValue('--color-primary') + 90,
                getCSSVariableValue('--color-secondary') +90,
                getCSSVariableValue('--color-tertiary') +90,

            ],  // Array of colors for each bar
            borderColor: [
                getCSSVariableValue('--color-primary'),
                getCSSVariableValue('--color-secondary'),
                getCSSVariableValue('--color-tertiary'),
            ],  // Array of border colors matching each bar
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
                    text: "Days per 1000m",
                    font: {
                        size: remToPixels(0.8)  // Dynamic font size in rem
                    }
                },
            },
            x: {
                display: true
            }
        },
        plugins: {
            legend: {
                display: false  // Disable legend
            }
        }
    }
}));
