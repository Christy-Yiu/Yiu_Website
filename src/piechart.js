// Sample Data: Type of Digital Art and Count
(function(){
        const digitalArtData = [
            { type: "Illustrations", count: 45 },
            { type: "Emojis", count: 25 },
            { type: "Animations", count: 4 },
            { type: "Celebration art", count: 25 },
        ];

        function drawPieChart() {
            // 1. Setup Dimensions
            const container = d3.select("#vis-piechart");
            const containerWidth = container.node().clientWidth / 2;
            
            // Define chart dimensions (Pie charts are often square)
            const width = containerWidth;
            const height = width * 0.75; // Maintain aspect ratio
            const margin = 50;

            // Radius calculation: Use the smaller dimension to fit the circle
            const radius = Math.min(width, height) / 2 - margin;

            // Clear any existing SVG
            container.select("svg").remove();

            // 2. Append SVG object
            const svg = container.append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                // Move the origin (0,0) to the center of the SVG for easier drawing
                .attr("transform", `translate(${width / 2},${height / 2})`);

            // 3. Define Scales and Generators

            // Color Scale (Ordinal)
            const color = d3.scaleOrdinal()
                .domain(digitalArtData.map(d => d.type))
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
            const dataReady = pie(digitalArtData);

            // 4. Draw the Slices
            svg.selectAll('g.slice')
                .data(dataReady)
                .join('g')
                .attr('class', 'slice');

            const pietooltip = d3.select("#tooltip-pie");


// Append the path (the actual pie slice)
svg.selectAll('g.slice')
    .append('path')
    .attr('d', arc)
    .attr('fill', d => color(d.data.type))
    .on("mouseover", function(event, d) {
        // Calculate percentage
        const total = d3.sum(digitalArtData, data => data.count);
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
    });

            // 5. Add Legend
            const legend = svg.append("g")
                .attr("transform", `translate(${-width / 2}, ${-height / 2 + 20})`); // Positioning the legend

            legend.selectAll('.legend-item')
                .data(digitalArtData)
                .join('g')
                .attr('class', 'legend-item')
                .attr('transform', (d, i) => `translate(0, ${i * 20})`); // Spacing between items

            legend.selectAll('.legend-item')
                .append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 18)
                .attr('height', 18)
                .style('fill', d => color(d.type));

            legend.selectAll('.legend-item')
                .append('text')
                .attr('x', 25)
                .attr('y', 12)
                .text(d => d.type)
                .attr('class', 'legend');
        }

        // Initial draw
        drawPieChart();

        // Handle responsiveness on window resize
        window.addEventListener('resize', drawPieChart);

    })();