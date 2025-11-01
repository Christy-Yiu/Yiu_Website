(function () {
    // Data for visited places and their visit counts
    const visitedPlaces = [
        { name: "China", count: 3 }, // Shenzhen is in China
        { name: "Hong Kong", count: 8 }, // "Most times" interpreted as 8
        { name: "Japan", count: 2 },
        { name: "Taiwan", count: 1 },
        { name: "South Korea", count: 1 },
        { name: "Thailand", count: 2 },
        { name: "Malaysia", count: 2 }
    ];

    // List of Asian countries to filter from the world TopoJSON
    const asianCountriesList = [
        "Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan",
        "Brunei", "Cambodia", "China", "Cyprus", "Georgia", "India", "Indonesia",
        "Iran", "Iraq", "Israel", "Japan", "Jordan", "Kazakhstan", "Kuwait",
        "Kyrgyzstan", "Laos", "Lebanon", "Malaysia", "Maldives", "Mongolia",
        "Myanmar", "Nepal", "North Korea", "Oman", "Pakistan", "Palestine",
        "Philippines", "Qatar", "Russia", // Part of Russia is in Asia
        "Saudi Arabia", "Singapore", "South Korea", "Sri Lanka", "Syria",
        "Taiwan", "Tajikistan", "Thailand", "Timor-Leste", "Turkey", // Part of Turkey is in Asia
        "Turkmenistan", "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen",
        "Hong Kong", "Macau" // Specific regions often included
    ];

    /**
     * Generates a random point within a given GeoJSON polygon.
     * Attempts to find a point within the polygon's bounding box that is also contained by the polygon.
     * If unsuccessful after maxAttempts, returns the polygon's centroid.
     * @param {object} polygon - The GeoJSON polygon feature.
     * @param {number} maxAttempts - Maximum number of attempts to find a random point.
     * @returns {Array<number>} - An array [longitude, latitude] representing the random point.
     */
    function getRandomPointInPolygon(polygon, maxAttempts = 1000) {
        const bounds = d3.geoBounds(polygon);
        const [x0, y0] = bounds[0]; // Min longitude, min latitude
        const [x1, y1] = bounds[1]; // Max longitude, max latitude

        for (let i = 0; i < maxAttempts; i++) {
            const randomLon = x0 + Math.random() * (x1 - x0);
            const randomLat = y0 + Math.random() * (y1 - y0);
            const point = [randomLon, randomLat];

            if (d3.geoContains(polygon, point)) {
                return point;
            }
        }
        console.warn(`Could not find random point in polygon for ${polygon.properties.name} after ${maxAttempts} attempts. Returning centroid.`);
        return d3.geoCentroid(polygon);
    }

    /**
     * Draws the dot density map of visited places in Asia.
     * This function is called initially and on window resize for responsiveness.
     */
    function drawDotDensityMap() {
        const container = d3.select("#vis-dotmap");
        const containerWidth = container.node().clientWidth;
        const containerHeight = container.node().clientHeight;

        // Clear any existing SVG to redraw the map
        container.select("svg").remove();

        // Append a new SVG element to the container
        const svg = container.append("svg")
            .attr("width", containerWidth - 75)
            .attr("height", containerHeight - 100);

        // Initialize a Mercator projection
        const projection = d3.geoMercator();
        // Create a path generator using the projection
        const path = d3.geoPath().projection(projection);

        // Select the tooltip element
        const tooltip = d3.select("#map-tooltip");

        // Load world geographical data
        d3.json("https://unpkg.com/world-atlas@2.0.2/countries-110m.json").then(world => {
            // Convert TopoJSON to GeoJSON features
            const countries = topojson.feature(world, world.objects.countries);
            // Filter to include only Asian countries from our predefined list
            const asiaGeoJson = {
                type: "FeatureCollection",
                features: countries.features.filter(d => asianCountriesList.includes(d.properties.name))
            };

            // --- Projection Adjustment for Focusing on China Side ---
            // Remove projection.fitSize() as it overrides manual settings.
            // Manually set center, scale, and translate to focus on East Asia/China.
            projection
                .center([115, 25]) // Approximate geographic center for East Asia (longitude, latitude)
                .scale(500) // Adjust scale for desired zoom level. Experiment with this value.
                .translate([containerWidth / 2, containerHeight / 2]); // Center the projected map in the SVG container

            // Append a group for countries and draw each country boundary
            svg.append("g")
                .attr("class", "countries")
                .selectAll("path")
                .data(asiaGeoJson.features)
                .join("path")
                .attr("class", "dotmap-country-boundary")
                .attr("d", path) // Use the path generator to draw country shapes
                // Add mouseover event for tooltips
                .on("mouseover", function (event, d) {
                    const place = visitedPlaces.find(p => p.name === d.properties.name);
                    const visitCount = place ? place.count : 0;
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`<strong>${d.properties.name}</strong><br>Visits: ${visitCount}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                // Add mouseout event to hide tooltips
                .on("mouseout", function () {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                // Add mousemove event to update tooltip position
                .on("mousemove", function (event) {
                    tooltip.style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                });

            // Add dots for visited places
            visitedPlaces.forEach(place => {
                const countryFeature = asiaGeoJson.features.find(f => f.properties.name === place.name);

                if (countryFeature) {
                    for (let i = 0; i < place.count; i++) {
                        // Generate a random point within the country's polygon
                        const randomPoint = getRandomPointInPolygon(countryFeature);
                        // Project the geographic point to SVG coordinates
                        const [x, y] = projection(randomPoint);

                        // Append a circle (dot) for each visit
                        svg.append("circle")
                            .attr("class", "dotmap-dot")
                            .attr("cx", x)
                            .attr("cy", y)
                            .attr("r", 10); // Radius of the dot
                    }
                } else {
                    console.warn(`Country feature not found for: ${place.name}`);
                }
            });
        }).catch(error => {
            console.error("Error loading or processing geographical data:", error);
            container.append("p").text("Failed to load map data. Please check your internet connection or try again later.");
        });
    }

    // Initial drawing of the map
    drawDotDensityMap();
    // Redraw map on window resize for responsiveness
    window.addEventListener('resize', drawDotDensityMap);
})();