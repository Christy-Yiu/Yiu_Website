(function () {
        // --- Configuration Parameters ---
        // How long a simulated visitor stays on the map (in milliseconds)
        const MAX_VISITOR_AGE_MS = 30 * 1000; // 30 seconds
        // How often a new simulated visitor is added (in milliseconds)
        const ADD_VISITOR_INTERVAL_MS = 250; // Every 1 second
        // How often the map and visitor dots are updated (in milliseconds)
        const MAP_UPDATE_INTERVAL_MS = 250; // Every 0.5 seconds

        // Clustering Parameters
        const CLUSTER_DISTANCE_PX = 60; // Max pixel distance for dots to form a cluster
        const MIN_CLUSTER_RADIUS_PX = 4; // Base radius for a single visitor or small cluster
        const MAX_CLUSTER_RADIUS_PX = 50; // Maximum radius a cluster dot can grow to
        const CLUSTER_RADIUS_SCALE_FACTOR = 8; // Adjusts how quickly radius increases with cluster size (logarithmic scale)

        // --- Global State Variables ---
        // Array to store active visitor objects: { id, longitude, latitude, arrivalTime }
        let activeVisitors = [];
        // Counter for assigning unique IDs to new visitors
        let nextVisitorId = 0;
        // Stores the loaded world GeoJSON data to avoid re-loading
        let worldGeoJson = null;
        // D3 projection function
        let projection = null;
        // D3 path generator function
        let path = null;
        // D3 selection for the SVG element
        let svg = null;
        // D3 selection for the tooltip element
        let tooltip = null;

        /**
         * Generates a random geographic point (longitude, latitude) within North America or Oceania.
         * @returns {Array<number>} - An array [longitude, latitude].
         */
        function generateRandomGeoPoint() {
            // Define ranges for different regions

        const landAreas = [
            { lonRange: [-80, -20], latRange: [20, 50] }, // Eastern USA
            { lonRange: [-30, 60], latRange: [-20, 50] },  // Africa and parts of Europe
            { lonRange: [-10, 80], latRange: [20, 50] },  // Middle East and parts of Asia
            { lonRange: [80, 180], latRange: [20, 60] }, // Eastern Asia and parts of Russia
            { lonRange: [-180, -80], latRange: [17, 71] }, // Parts of South America and Antarctica
            { lonRange: [110.0, 180.0], latRange: [-55.0, -10.0] }
        ];

            // Select a random region
            const region = landAreas[Math.floor(Math.random() * landAreas.length)];
            const longitude = Math.random() * (region.lonRange[1] - region.lonRange[0]) + region.lonRange[0];
            const latitude = Math.random() * (region.latRange[1] - region.latRange[0]) + region.latRange[0];

            return [longitude, latitude];
        }

        /**
         * Adds a new simulated visitor to the `activeVisitors` list.
         * Each visitor gets a unique ID, random coordinates, and an arrival timestamp.
         */
        function addVisitor() {
            const [lon, lat] = generateRandomGeoPoint();
            activeVisitors.push({
                id: nextVisitorId++,
                longitude: lon,
                latitude: lat,
                arrivalTime: Date.now()
            });
        }

        /**
         * Removes visitors from the `activeVisitors` list that have exceeded their
         * `MAX_VISITOR_AGE_MS`. This simulates visitors leaving the website.
         */
        function removeOldVisitors() {
            const currentTime = Date.now();
            activeVisitors = activeVisitors.filter(v => (currentTime - v.arrivalTime) < MAX_VISITOR_AGE_MS);
        }

        /**
         * Calculates the radius for a cluster based on the number of visitors it contains.
         * Uses a logarithmic scale to prevent very large circles.
         * @param {number} count - The number of visitors in the cluster.
         * @returns {number} The calculated radius in pixels.
         */
        function getClusterRadius(count) {
            let radius = MIN_CLUSTER_RADIUS_PX;
            if (count > 1) {
                // Logarithmic scale for radius growth
                radius = MIN_CLUSTER_RADIUS_PX + Math.log(count) * CLUSTER_RADIUS_SCALE_FACTOR;
            }
            return Math.min(radius, MAX_CLUSTER_RADIUS_PX); // Cap the radius
        }

        /**
         * Aggregates individual visitor points into clusters based on proximity.
         * @param {Array<Object>} visitors - The array of individual active visitor objects.
         * @param {number} clusterDistancePx - The maximum pixel distance for points to be clustered.
         * @returns {Array<Object>} An array of clustered visitor objects, each with {id, longitude, latitude, count}.
         */
        function aggregateVisitors(visitors, clusterDistancePx) {
            if (!projection || !visitors.length) {
                return []; // Cannot cluster without a projection or if no visitors
            }

            const clustered = [];
            const processedVisitorIds = new Set();
            let clusterIdCounter = 0;

            // Create a temporary array of visitors with their projected screen coordinates
            const visitorsWithPx = visitors.map(v => {
                const px = projection([v.longitude, v.latitude]);
                return {
                    ...v,
                    px: px // Store projected coordinates
                };
            }).filter(v => v.px && !isNaN(v.px[0]) && !isNaN(v.px[1])); // Filter out invalid projections

            for (const visitor of visitorsWithPx) {
                if (processedVisitorIds.has(visitor.id)) {
                    continue; // Already part of a cluster
                }

                const currentClusterMembers = [];
                let sumLon = 0;
                let sumLat = 0;

                // Add the current visitor to the cluster
                currentClusterMembers.push(visitor);
                processedVisitorIds.add(visitor.id);
                sumLon += visitor.longitude;
                sumLat += visitor.latitude;

                // Find other visitors within range
                for (const otherVisitor of visitorsWithPx) {
                    if (visitor.id === otherVisitor.id || processedVisitorIds.has(otherVisitor.id)) {
                        continue;
                    }

                    const distance = Math.sqrt(
                        Math.pow(visitor.px[0] - otherVisitor.px[0], 2) +
                        Math.pow(visitor.px[1] - otherVisitor.px[1], 2)
                    );

                    if (distance < clusterDistancePx) {
                        currentClusterMembers.push(otherVisitor);
                        processedVisitorIds.add(otherVisitor.id);
                        sumLon += otherVisitor.longitude;
                        sumLat += otherVisitor.latitude;
                    }
                }

                // Calculate centroid and create aggregated object
                const count = currentClusterMembers.length;
                const centroidLon = sumLon / count;
                const centroidLat = sumLat / count;

                clustered.push({
                    id: `cluster-${clusterIdCounter++}`, // Unique ID for D3's key function
                    longitude: centroidLon,
                    latitude: centroidLat,
                    count: count,
                    // You might want to store the original visitor IDs here if needed for tooltips etc.
                    // members: currentClusterMembers.map(v => v.id)
                });
            }
            return clustered;
        }


        /**
         * Draws the base world map (country boundaries) onto the SVG container.
         * This function is called initially and whenever the window is resized.
         */
        function drawBaseMap() {
            const container = d3.select("#vis-visitormap");
            const containerWidth = container.node().clientWidth;
            const containerHeight = container.node().clientHeight;

            // Clear any existing SVG content to allow for redrawing
            container.select("svg").remove();

            // Append a new SVG element to the container
            svg = container.append("svg")
                .attr("width", containerWidth - 120)
                .attr("height", containerHeight - 150);

            // Initialize a Mercator projection, which is suitable for a flat world map
            projection = d3.geoMercator()
                // Scale the projection to fit the world within the container width
                .scale((containerWidth / 2 / Math.PI))
                // Translate the projection to center the map in the SVG container
                .translate([containerWidth / 2, containerHeight / 2]);

            // Create a D3 path generator using the defined projection
            path = d3.geoPath().projection(projection);

            // Select the tooltip element for later use
            tooltip = d3.select("#visitormap-tooltip");

            // Check if world geographical data is already loaded
            if (worldGeoJson) {
                // If yes, render countries immediately
                renderCountries();
            } else {
                // If not, load the world data from TopoJSON
                d3.json("https://unpkg.com/world-atlas@2.0.2/countries-110m.json").then(world => {
                    // Convert TopoJSON to GeoJSON features
                    worldGeoJson = topojson.feature(world, world.objects.countries);
                    renderCountries(); // Render countries once data is ready
                }).catch(error => {
                    // Log any errors during data loading
                    console.error("Error loading geographical data:", error);
                    container.append("p").text("Failed to load map data. Please check your internet connection or try again later.");
                });
            }
        }

        /**
         * Renders the country boundaries on the SVG using the loaded world GeoJSON data.
         * Includes basic mouseover/mouseout functionality for country names.
         */
        function renderCountries() {
            svg.append("g")
                .attr("class", "visitormap-countries")
                .selectAll("path")
                .data(worldGeoJson.features) // Bind country features to path elements
                .join("path")
                .attr("class", "visitormap-country-boundary")
                .attr("d", path) // Use the path generator to draw country shapes
                // Add mouseover event for tooltips showing country names
                .on("mouseover", function(event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`<strong>${d.properties.name}</strong>`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                // Add mouseout event to hide tooltips
                .on("mouseout", function() {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                // Add mousemove event to update tooltip position
                .on("mousemove", function(event) {
                    tooltip.style("left", (event.pageX + 10) + "px")
                           .style("top", (event.pageY - 28) + "px");
                });
        }

        /**
         * Updates the visitor dots on the map and the total visitor count in the title.
         * This function uses D3's enter/update/exit pattern for efficient DOM manipulation.
         */
        function updateVisitorMap() {
            // Ensure map components are initialized before attempting to update
            if (!svg || !projection || !path) {
                return;
            }

            removeOldVisitors(); // First, remove any visitors that have "left"

            // Aggregate active visitors into clusters
            const clusteredVisitors = aggregateVisitors(activeVisitors, CLUSTER_DISTANCE_PX);

            // Update the total visitor count displayed in the H1 title
            d3.select("#visitorCount").text(activeVisitors.length);

            // Bind the `clusteredVisitors` array to SVG circle elements.
            // `d => d.id` is crucial for object constancy, ensuring D3 tracks individual clusters.
            const visitorDots = svg.selectAll(".visitormap-visitor-dot")
                .data(clusteredVisitors, d => d.id);

            // EXIT selection: Handle clusters that are no longer present.
            visitorDots.exit()
                .transition()
                .duration(MAP_UPDATE_INTERVAL_MS / 2) // Animate their disappearance
                .attr("r", 0) // Shrink radius to 0
                .style("opacity", 0) // Fade out
                .remove(); // Remove the circle from the DOM

            // ENTER selection: Handle new clusters (they "appear").
            visitorDots.enter()
                .append("circle")
                .attr("class", "visitormap-visitor-dot")
                // Project geographic coordinates of the cluster centroid to screen coordinates (cx, cy)
                .attr("cx", d => projection([d.longitude, d.latitude])[0])
                .attr("cy", d => projection([d.longitude, d.latitude])[1])
                .attr("r", 0) // Start with radius 0 for an entry animation
                .style("opacity", 0) // Start with opacity 0 for an entry animation
                .transition()
                .duration(MAP_UPDATE_INTERVAL_MS / 2) // Animate their appearance
                .attr("r", d => getClusterRadius(d.count)) // Grow to the calculated cluster radius
                .style("opacity", 0.4); // Fade in to the target opacity

            // UPDATE selection: For existing clusters, update their radius if the count changed
            visitorDots
                .transition()
                .duration(MAP_UPDATE_INTERVAL_MS / 2)
                .attr("r", d => getClusterRadius(d.count)); // Update radius based on new count
        }

        // --- Initialization Sequence ---
        // 1. Draw the initial base world map
        drawBaseMap();

        // 2. Set up intervals for the real-time simulation:
        //    - Add a new visitor periodically
        //    - Update the map and visitor dots periodically
        setInterval(addVisitor, ADD_VISITOR_INTERVAL_MS);
        setInterval(updateVisitorMap, MAP_UPDATE_INTERVAL_MS);

        // 3. Add an event listener to redraw the map and reposition dots when the window is resized.
        window.addEventListener('resize', () => {
            drawBaseMap();      // Redraw the base map and re-calculate projection
            updateVisitorMap(); // Re-project and draw existing visitor dots
        });

})();

(function () {
    const domain = encodeURIComponent(window.location.hostname);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const page_path = window.location.pathname;
    const page_title = document.title;
    const referrer = document.referrer;

    // Extract search query if coming from a search engine
    let search_query = '';
    if (referrer) {
        try {
            const url = new URL(referrer);
            if (url.hostname.includes('google.com')) {
                search_query = url.searchParams.get('q') || '';
            } else if (url.hostname.includes('bing.com')) {
                search_query = url.searchParams.get('q') || '';
            } else if (url.hostname.includes('yahoo.com')) {
                search_query = url.searchParams.get('p') || '';
            } else if (url.hostname.includes('duckduckgo.com')) {
                search_query = url.searchParams.get('q') || '';
            }
        } catch (e) {
            // Invalid URL, ignore
        }
    }

    fetch('https://visitor.6developer.com/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            domain,
            timezone,
            page_path,
            page_title,
            referrer,
            search_query
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Visitor count:', data);
            // You can display the count on your page
            if (document.getElementById('visitor-count')) {
                document.getElementById('visitor-count').textContent = data.totalCount;
            }
        })
        .catch(error => console.error('Error:', error));
})();
