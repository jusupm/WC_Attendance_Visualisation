//map
var margin = { top: 10, right: 10, bottom: 0, left: 10 }; // Increased bottom margin for the legend
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;
var projection = d3
  .geoNaturalEarth1()
  .center([0, 15])
  .rotate([-9, 0])
  .scale([1300 / (2 * Math.PI)])
  .translate([450, 300]);
var path = d3.geoPath().projection(projection);
var svg = d3.select("svg").append("g").attr("width", width).attr("height", height);
var tooltip = d3.select("div.tooltip");
var details = d3.select("#details");

//map legend
var legendWidth = 10;
var legendHeight = 10;
var legendMargin = { top: 10, right: 10, bottom: 0, left: 10 };
var legendX = width - legendWidth - legendMargin.right;
var legendY = height + 40;

var legend = svg
  .append("g")
  .attr("class", "legend")
  .attr("transform", "translate(" + legendX + "," + legendY + ")");

legend
  .append("text")
  .attr("x", 15)
  .attr("y", 15)
  .text("Hosts")
  .attr("font-size", "12px")
  .attr("font-weight", "bold");

legend
  .append("rect")
  .attr("class", "legend-square")
  .attr("x", 0)
  .attr("y", 5)
  .attr("width", 12)
  .attr("height", 12)
  .style("fill", "#a8324c");

// Fetch the JSON file
d3.queue()
  .defer(d3.json, "world-110m.json")
  .defer(d3.csv, "world-country-names.csv")
  .await(ready);

function ready(error, world, names) {
  if (error) throw error;

  fetch("data.json")
    .then(response => response.json())
    .then(data => {
      var countries1 = topojson.feature(world, world.objects.countries).features;
      var countries = countries1.filter(function (d) {
        return names.some(function (n) {
          if (d.id == n.id) return (d.name = n.name);
        });
      });

      var hosts = data.map(item => item.Hosts);

      svg
        .selectAll("path")
        .data(countries)
        .enter()
        .append("path")
        .attr("stroke", "black")
        .attr("stroke-width", 0.7)
        .attr("fill", function (d) {
          var countryId = d.id;
          var matchingName = names.find(function (n) {
            return n.id === countryId;
          });

          if (hosts.includes(matchingName.name)) {
            return "#a8324c";
          } else {
            return "#1ca631";
          }
        })
        .attr("d", path)
        .on("mouseover", function (d, i) {
          var countryId = d.id;
          var matchingName = names.find(function (n) {
            return n.id === countryId;
          });
          if (hosts.includes(matchingName.name)) {
            tooltip
              .classed("hidden", false)
              .style("top", d3.event.pageY + "px")
              .style("left", d3.event.pageX + 10 + "px")
              .html(matchingName.name);
              
            var countryData = data.find(function(item) {
              return item.Hosts === matchingName.name;
            });
            
            if (countryData) {
              details
                .selectAll("ul")
                .remove();
              
              var ul = details
                .append("ul")
                .attr("class", "country-details");
            
              ul.append("li")
                .text("Host country: " + countryData.Hosts);
              
              ul.append("li")
                .text("Year: " + countryData.Year);
              ul.append("li")
                .text("Total attendance: " + countryData.Total_Attendance);
              ul.append("li")
                .text("Average attendance: " + countryData.Average_Attendance);
                
              ul.append("li")
                .text("Venue: " + countryData.Venue);
            }
          }
        })
        .on("mouseout", function () {
          tooltip.classed("hidden", true);
          details.selectAll("ul").remove();
        });
    });
}





//charts
let selectedChartType = 'total'; // Default chart type

        // Fetch the JSON file
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                // Extracting relevant data for the charts
                const years = data.map(item => item.Year);
                const totalAttendance = data.map(item => item.Total_Attendance);
                const averageAttendance = data.map(item => item.Average_Attendance);

                // Function to update the chart based on the selected option
                function updateChart() {
                    const chartData = selectedChartType === 'total' ? totalAttendance : averageAttendance;
                    chart.data.datasets[0].data = chartData;
                    chart.update();
                }

                // Bar Chart
                const chart = new Chart(document.getElementById("barChart"), {
                    type: 'bar',
                    data: {
                        labels: years,
                        datasets: [{
                            label: 'Attendance',
                            data: totalAttendance,
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });

                // Function to update the chart type when the selection changes
                document.getElementById("chartType").addEventListener("change", function() {
                    selectedChartType = this.value;
                    updateChart();
                });

                //polar area
                const polarAreaChart = new Chart(document.getElementById("polarAreaChart"), {
                    type: 'polarArea',
                    data: {
                        labels: years,
                        datasets: [{
                            label: 'Attendance',
                            data: totalAttendance,
                            borderWidth: 1
                        }]
                    },
                    options: {}
                });
            });

    
function showMap() {
    d3.select("#svg").style("display", "block");
    d3.select("#barChart").style("display", "none");
    d3.select("#polarAreaChart").style("display", "none");

    d3.select(".chart-container").style("display", "none");
}

// Function to show the bar chart and hide the map and polar area chart
function showBarChart() {
    d3.select("#svg").style("display", "none");
    d3.select("#barChart").style("display", "block");
    d3.select("#polarAreaChart").style("display", "none");
    d3.select(".chart-container").style("display", "block");
}

// Function to show the polar area chart and hide the map and bar chart
function showPolarAreaChart() {
    d3.select("#svg").style("display", "none");
    d3.select("#barChart").style("display", "none");
    d3.select("#polarAreaChart").style("display", "block");
    d3.select(".chart-container").style("display", "none");
    
    d3.select("#polarAreaChart").style("display", "block");
}

// Event listeners for navbar buttons
document.getElementById("showMap").addEventListener("click", showMap);
document.getElementById("showBarChart").addEventListener("click", showBarChart);
document.getElementById("showPolarAreaChart").addEventListener("click", showPolarAreaChart);

// Initialize with the world map visible
showMap();
