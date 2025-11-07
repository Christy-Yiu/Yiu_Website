(function(){
    // Main category data
    const digitalArtData = [
        { type: "Illustrations", count: 45 },
        { type: "Emojis", count: 25 },
        { type: "Animations", count: 4 },
        { type: "Celebration art", count: 25 },
    ];

    // Sub-category data for drill-down
    const subCategoryData = {
        "Illustrations": [
            { type: "Wynncraft", count: 20 },
            { type: "Original", count: 15 },
            { type: "Omega Strikers", count: 10 },
        ],
        "Emojis": [
            { type: "Discord", count: 15 },
            { type: "Twitch", count: 10 },
        ],
        "Animations": [
            { type: "Looping Gifs", count: 1 },
            { type: "Short Clips", count: 2 },
        ],
        "Celebration art": [
            { type: "Birthday", count: 10 },
            { type: "Anniversary", count: 8 },
            { type: "Holiday", count: 7 },
        ]
    };

    // Global state variables for drill-down
    let currentChartData = digitalArtData;
    let chartHistory = []; // Stack to store previous chart data for the back button

    function drawPieChart(dataToDraw = currentChartData) {
        // 1. Setup Dimensions
        const container = d3.select("#vis-piechart");
        const containerWidth = container.node().clientWidth / 2; // Use half of container width as before
        
        // Define chart dimensions (Pie charts are often square)
        const width = containerWidth;
        const height = width * 0.75; // Maintain aspect ratio
        const margin = 50;

        // Radius calculation: Use the smaller dimension to fit the circle
        const radius = Math.min(width, height) / 2 - margin;

        // Clear any existing SVG and back button
        container.select("svg.pie-chart-svg").remove();
        container.select(".pie-back-button").remove();

        // 2. Append SVG object
        const svg = container.append("svg")
            .attr("class", "pie-chart-svg") // Add a class for easier selection/removal
            .attr("width", width)
            .attr("height", height)
            .append("g")
            // Move the origin (0,0) to the center of the SVG for easier drawing
            .attr("transform", `translate(${width / 2},${height / 2})`);

        // 3. Define Scales and Generators

        // Color Scale (Ordinal) - domain should be based on the current data
        const color = d3.scaleOrdinal()
            .domain(dataToDraw.map(d => d.type))
            .range(d3.schemeSet2); // A pleasant set of colors

        // Pie Generator: Converts raw data into data suitable for arcs (startAngle, endAngle)
        const pie = d3.pie()
            .value(d => d.count)
            .sort(null); // Keep the data order as is

        // Arc Generator: Converts arc data into SVG path strings
        const arc = d3.arc()
            .innerRadius(0) // Solid pie chart (not a donut)
            .outerRadius(radius);

        // Process the data
        const dataReady = pie(dataToDraw);

        // Select the tooltip element
        const pietooltip = d3.select("#tooltip-pie");

        // 4. Draw the Slices with Animations
        const slices = svg.selectAll('g.pie-slice')
            .data(dataReady, d => d.data.type); // Use data.type as key for transitions

        // EXIT selection: Remove old slices with animation
        slices.exit()
            .transition()
            .duration(750)
            .attrTween("d", function(d) {
                // Animate slices shrinking to a point
                const interpolate = d3.interpolate(d, { startAngle: d.endAngle, endAngle: d.endAngle });
                return t => arc(interpolate(t));
            })
            .style("opacity", 0)
            .remove();

        // ENTER selection: Add new slices with animation
        const enteringSlices = slices.enter()
            .append('g')
            .attr('class', 'pie-slice');

        enteringSlices.append('path')
            .attr('fill', d => color(d.data.type))
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .each(function(d) { this._current = d; }) // Store the initial angle for future transitions
            .on("mouseover", function(event, d) {
                // Calculate percentage based on the current data being displayed
                const total = d3.sum(dataToDraw, data => data.count);
                const percentage = ((d.data.count / total) * 100).toFixed(1);

                d3.select(this).attr('stroke-width', 3).attr('stroke', '#333');
                pietooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                pietooltip.html(`
                    <strong>${d.data.type}</strong><br>
                    Count: ${d.data.count}<br>
                    Share: ${percentage}%
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", function(event) {
                pietooltip.style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                d3.select(this).attr('stroke-width', 1).attr('stroke', 'white');
                pietooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", function(event, d) {
                // Check if there are sub-categories for this type
                if (subCategoryData[d.data.type]) {
                    chartHistory.push(currentChartData); // Save current state
                    currentChartData = subCategoryData[d.data.type]; // Set new data
                    drawPieChart(currentChartData); // Redraw with sub-categories
                } else {
                    // Optionally, provide feedback if no drill-down is available
                    console.log(`No sub-categories for "${d.data.type}".`);
                }
            });

        // Animate new slices appearing from the center
        enteringSlices.select('path')
            .transition()
            .duration(750)
            .attrTween("d", function(d) {
                const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d); // Start from center
                return t => arc(interpolate(t));
            });

        // UPDATE selection: Update existing slices (if any, for data changes)
        slices.select('path')
            .transition()
            .duration(750)
            .attrTween("d", function(d) {
                // Animate to new arc positions
                const interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(1); // Update for next transition
                return t => arc(interpolate(t));
            });

        // 5. Add Legend
        const legend = svg.append("g")
            .attr("class", "pie-legend")
            .attr("transform", `translate(${-width / 2}, ${-height / 2 + 20})`); // Positioning the legend

        const legendItems = legend.selectAll('.pie-legend-item')
            .data(dataToDraw, d => d.type) // Use data.type as key for transitions
            .join(
                enter => enter.append('g')
                    .attr('class', 'pie-legend-item')
                    .attr('transform', (d, i) => `translate(0, ${i * 20})`)
                    .style("opacity", 0) // Start invisible for enter animation
                    .call(enter => {
                        enter.append('rect')
                            .attr('x', 0)
                            .attr('y', 0)
                            .attr('width', 18)
                            .attr('height', 18)
                            .style('fill', d => color(d.type));
                        enter.append('text')
                            .attr('x', 25)
                            .attr('y', 12)
                            .text(d => d.type)
                            .attr('class', 'pie-legend-text');
                    })
                    .transition()
                    .duration(750)
                    .style("opacity", 1), // Fade in
                update => update.transition().duration(750) // Animate legend position
                    .attr('transform', (d, i) => `translate(0, ${i * 20})`),
                exit => exit.transition().duration(750).style("opacity", 0).remove() // Fade out and remove
            );

        // 6. Add Back Button (visible only when drilled down)
        if (chartHistory.length > 0) {
            const backButton = container.append("button")
                .attr("class", "pie-back-button")
                .style("position", "absolute")
                .style("top", "10px")
                .style("right", "50px")
                .style("padding", "8px 15px")
                .style("background-color", "#f0f0f0")
                .style("border", "1px solid #ccc")
                .style("border-radius", "5px")
                .style("cursor", "pointer")
                .style("font-family", "sans-serif")
                .style("font-size", "14px")
                .text("Back")
                .on("click", function() {
                    currentChartData = chartHistory.pop(); // Get previous state
                    drawPieChart(currentChartData); // Redraw
                });
        }
    }

    // Initial draw
    drawPieChart();

    // Handle responsiveness on window resize
    window.addEventListener('resize', drawPieChart);

})();