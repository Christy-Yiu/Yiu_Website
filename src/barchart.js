(function () {
    // 1. Chart Dimensions and Margins
    const margin = { top: 40, right: 30, bottom: 60, left: 70 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const buttonColors = {
        "Illustration": {
            base: "#89c7baff",
            hover: "#a6e1d8ff",
            active: "#67a49eff"
        },
        "Photography": {
            base: "#5f82b3ff",
            hover: "#84a8d1ff",
            active: "#475e8eff"
        },
        "Animation": {
            base: "#565e99ff",
            hover: "#98a9e3ff",
            active: "#424a6fff"
        },
        "Video Work": {
            base: "#534368ff",
            hover: "#977eb4ff",
            active: "#2d1d36ff"
        }
    };

    const artworkData = [
        { year: 2022, type: "Illustration", count: 34 },
        { year: 2022, type: "Photography", count: 0 },
        { year: 2022, type: "Animation", count: 1 },
        { year: 2022, type: "Video Work", count: 5 },

        { year: 2023, type: "Illustration", count: 13 },
        { year: 2023, type: "Photography", count: 1 },
        { year: 2023, type: "Animation", count: 1 },
        { year: 2023, type: "Video Work", count: 5 },

        { year: 2024, type: "Illustration", count: 12 },
        { year: 2024, type: "Photography", count: 3 },
        { year: 2024, type: "Animation", count: 1 },
        { year: 2024, type: "Video Work", count: 17 },

        { year: 2025, type: "Illustration", count: 6 },
        { year: 2025, type: "Photography", count: 1 },
        { year: 2025, type: "Animation", count: 5 },
        { year: 2025, type: "Video Work", count: 7 },

    ];
    const allTypes = Array.from(new Set(artworkData.map(d => d.type)));
    const allYears = Array.from(new Set(artworkData.map(d => d.year)));

    // 3. Create SVG element
    const svg = d3.select("#chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 4. Scales
    const x0 = d3.scaleBand()
        .domain(allYears)
        .rangeRound([0, width])
        .paddingInner(0.1);

    const x1 = d3.scaleBand()
        .domain(allTypes)
        .rangeRound([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(artworkData, d => d.count) + 5])
        .rangeRound([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(allTypes)
        .range(["#89c7baff", "#5f82b3ff", "#565e99ff", "#534368ff"]);

    // 5. Axes
    const xAxis = d3.axisBottom(x0).tickSizeOuter(0);
    const yAxis = d3.axisLeft(y).tickFormat(d3.format("d"));

    svg.append("g")
        .attr("class", "bar-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "bar-axis")
        .call(yAxis)
        .append("text")
        .attr("x", -margin.left + 10)
        .attr("y", -10)
        .attr("fill", "#333")
        .attr("text-anchor", "start")
        .text("Number of Artworks");

    svg.append("g")
        .attr("class", "bar-grid")
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(""));

    // 6. Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "bar-tooltip");

    // 7. Drawing Function
    function drawChart(filteredData, selectedType = null) {
        const yearsGroupedData = Array.from(d3.group(filteredData, d => d.year), ([key, value]) => ({
            year: key,
            types: value
        }));

        const yearGroups = svg.selectAll(".year-group")
            .data(yearsGroupedData, d => d.year);

        yearGroups.exit().remove();

        const yearGroupsEnter = yearGroups.enter().append("g")
            .attr("class", "year-group")
            .attr("transform", d => `translate(${x0(d.year)},0)`);

        const yearGroupsUpdate = yearGroupsEnter.merge(yearGroups);

        yearGroupsUpdate.transition().duration(500)
            .attr("transform", d => `translate(${x0(d.year)},0)`);

        const bars = yearGroupsUpdate.selectAll(".bar")
            .data(d => d.types, d => d.type);

        bars.exit()
            .transition()
            .duration(300)
            .attr("y", height)
            .attr("height", 0)
            .style("opacity", 0)
            .remove();

        bars.enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x1(d.type))
            .attr("y", height)
            .attr("width", x1.bandwidth())
            .attr("height", 0)
            .attr("fill", d => color(d.type))
            .style("opacity", 0)
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`<strong>${d.type}</strong><br>Year: ${d.year}<br>Count: ${d.count}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
                d3.select(this).style("filter", "brightness(1.2)");
            })
            .on("mouseout", function () {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
                d3.select(this).style("filter", "none");
            })
            .transition()
            .duration(750)
            .delay((d, i) => i * 50)
            .attr("y", d => y(d.count))
            .attr("height", d => height - y(d.count))
            .style("opacity", 1);

        bars.transition()
            .duration(750)
            .delay((d, i) => i * 50)
            .attr("x", d => x1(d.type))
            .attr("y", d => y(d.count))
            .attr("height", d => height - y(d.count))
            .attr("fill", d => color(d.type))
            .style("opacity", d => (selectedType === null || d.type === selectedType) ? 1 : 0);
    }

    // 8. Create Filter Buttons
    const buttonsContainer = d3.select("#filter-buttons");
    let currentlySelectedType = null;

    allTypes.forEach(type => {
        buttonsContainer.append("button")
            .attr("class", "bar-filter-button")
            .attr("data-type", type)
            .style("background-color", buttonColors[type].base) // Set button base color
            .text(type)
            .on("mouseover", function () {
                d3.select(this).style("background-color", buttonColors[type].hover); // Set hover color
            })
            .on("mouseout", function () {
                if (!d3.select(this).classed("active")) {
                    d3.select(this).style("background-color", buttonColors[type].base); // Reset to base color
                }
            })
            .on("click", function () {
                const typeClicked = d3.select(this).attr("data-type");

                // Check if the clicked type is the currently selected one
                if (currentlySelectedType === typeClicked) {
                    // If the same button is clicked again, reset to show all
                    d3.selectAll(".bar-filter-button").classed("active", false);
                    currentlySelectedType = null; // Reset selection
                    drawChart(artworkData, null); // Show all data
                } else {
                    // If a different button is clicked, update the filter
                    d3.selectAll(".bar-filter-button").classed("active", false);
                    d3.select(this).classed("active", true);
                    currentlySelectedType = typeClicked; // Update selection
                    const filteredData = artworkData.filter(d => d.type === typeClicked);
                    // Set the active color for the clicked button
                    d3.select(this).style("background-color", buttonColors[type].active);
                    drawChart(filteredData, typeClicked);
                }
            });
    });

    // Initial chart draw
    drawChart(artworkData, null);

})();