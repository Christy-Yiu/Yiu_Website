// scatterplot.js
        const creativeData = [
            { year: 2018, type: "Video Edits", count: 5 },
            { year: 2018, type: "Digital Art", count: 20 },

            { year: 2019, type: "Video Edits", count: 1 },
            { year: 2019, type: "Digital Art", count: 15 },

            { year: 2020, type: "Short Stories", count: 5 },
            { year: 2020, type: "Digital Art", count: 25 },

            { year: 2021, type: "Video Edits", count: 6 },
            { year: 2021, type: "Digital Art", count: 15 },

            { year: 2022, type: "Short Stories", count: 7 },
            { year: 2022, type: "Digital Art", count: 30 },

            { year: 2023, type: "Video Edits", count: 6 },
            { year: 2023, type: "Animation", count: 2 },
            { year: 2023, type: "Digital Art", count: 12 },

            { year: 2024, type: "Digital Art", count: 35 },
            { year: 2024, type: "Animation", count: 2 },
            { year: 2024, type: "Video Edits", count: 8 },
            
            { year: 2025, type: "Video Edits", count: 6 },
            { year: 2025, type: "Digital Art", count: 12 },
            { year: 2025, type: "Animation", count: 2 },

        ];

        function drawScatterplot() {
            // 1. Setup Dimensions and Margins
            const container = d3.select("#vis-scatterplot");
            // Use the container's width for responsiveness
            const containerWidth = container.node().clientWidth;
            
            const margin = { top: 30, right: 350, bottom: 60, left: 350 };
            const width = containerWidth - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            // Clear any existing SVG before redrawing (useful for responsiveness)
            container.select("svg").remove();

            // 2. Append SVG object
            const svg = container.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // 3. Define Scales

            // X Scale (Year - Linear/Time)
            const allYears = creativeData.map(d => d.year);
            const minYear = d3.min(allYears);
            const maxYear = d3.max(allYears);
            
            // We use a linear scale for years, ensuring padding for the circles
            const xScale = d3.scaleLinear()
                .domain([minYear - 0.5, maxYear + 0.5]) // Add padding for aesthetics
                .range([0, width]);

            // Y Scale (Work Type - Band/Categorical)
            const workTypes = Array.from(new Set(creativeData.map(d => d.type))).sort();
            const yScale = d3.scaleBand()
                .domain(workTypes)
                .range([height, 0])
                .padding(1); // Padding ensures circles are centered on the band line

            // Radius Scale (Count - Size of the dot)
            const maxCount = d3.max(creativeData, d => d.count);
            const radiusScale = d3.scaleSqrt() // Use sqrt scale for better visual perception of area
                .domain([0, maxCount])
                .range([3, 25]); // Minimum radius 3px, Maximum radius 25px

            // Color Scale (Optional: based on work type)
            const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
                .domain(workTypes);

            // 4. Draw Axes

            // X Axis (Bottom)
            // Use d3.format("d") to ensure years are displayed as integers
            svg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(maxYear - minYear + 1))
                .attr("class", "axis x-axis");

            // X Axis Label
            svg.append("text")
                .attr("class", "x label")
                .attr("text-anchor", "middle")
                .attr("x", width / 2)
                .attr("y", height + margin.bottom - 10)
                .text("Year");

            // Y Axis (Left)
            svg.append("g")
                .call(d3.axisLeft(yScale))
                .attr("class", "axis y-axis");

            // Y Axis Label
            svg.append("text")
                .attr("class", "y label")
                .attr("text-anchor", "middle")
                .attr("y", -margin.left + 150)
                .attr("x", -height / 2)
                .attr("transform", "rotate(-90)")
                .text("Type of Creative Work");

            // 5. Draw the Scatterplot Points (Bubbles)
            
            const tooltip = d3.select("#tooltip");

            svg.selectAll(".dot")
                .data(creativeData)
                .join("circle")
                .attr("class", "dot")
                .attr("cx", d => xScale(d.year))
                .attr("cy", d => yScale(d.type))
                .attr("r", d => radiusScale(d.count))
                .style("fill", d => colorScale(d.type))
                .on("mouseover", function(event, d) {
                    d3.select(this).style("stroke-width", 3);
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`
                        <strong>${d.type}</strong><br>
                        Year: ${d.year}<br>
                        Count: ${d.count}
                    `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    d3.select(this).style("stroke-width", 1);
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        }

        // Initial draw
        drawScatterplot();

        // Handle responsiveness on window resize
        window.addEventListener('resize', drawScatterplot);

