(function () {
    // --- Configuration Parameters ---
    // How long a simulated visitor stays on the map (in milliseconds)
    const MAX_VISITOR_AGE_MS = 30 * 1000; // 30 seconds
    // How often a new simulated visitor is added (in milliseconds)
    const ADD_VISITOR_INTERVAL_MS = 500; // Every 0.5 second
    // How often the map and visitor dots are updated (in milliseconds)
    const MAP_UPDATE_INTERVAL_MS = 500; // Every 0.5 seconds
    // Radius of each individual visitor dot in pixels
    const VISITOR_DOT_RADIUS = 5;

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
     * Generates a random geographic point (longitude, latitude) anywhere on the globe.
     * In a real application, these coordinates would come from IP geolocation or user data.
     * @returns {Array<number>} - An array [longitude, latitude].
     */
    function generateRandomGeoPoint() {
        // Example ranges for land areas (these are not exhaustive)
        const landAreas = [
            { lonRange: [-80, -20], latRange: [20, 50] }, // Eastern USA
            { lonRange: [-30, 60], latRange: [-20, 50] },  // Africa and parts of Europe
            { lonRange: [-10, 80], latRange: [20, 50] },  // Middle East and parts of Asia
            { lonRange: [80, 180], latRange: [20, 60] }, // Eastern Asia and parts of Russia
            { lonRange: [-180, -80], latRange: [17, 71] }, // Parts of South America and Antarctica
            { lonRange: [110.0, 180.0],latRange: [-55.0, -10.0]}
        ];

        // Select a random land area
        const area = landAreas[Math.floor(Math.random() * landAreas.length)];
        const longitude = Math.random() * (area.lonRange[1] - area.lonRange[0]) + area.lonRange[0];
        const latitude = Math.random() * (area.latRange[1] - area.latRange[0]) + area.latRange[0];

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
     * Draws the base world map (country boundaries) onto the SVG container.
     * This function is called initially and whenever the window is resized.
     */
    function drawBaseMap() {
        const container = d3.select("#vis-visitormap");
        const containerWidth = container.node().clientWidth - 75;
        const containerHeight = container.node().clientHeight + 600;

        // Clear any existing SVG content to allow for redrawing
        container.select("svg").remove();

        // Append a new SVG element to the container
        svg = container.append("svg")
            .attr("width", containerWidth)
            .attr("height", containerHeight - 700);

        // Initialize a Mercator projection, which is suitable for a flat world map
        projection = d3.geoMercator()
            // Scale the projection to fit the world within the container width
            .scale((containerWidth / 2 / Math.PI))
            // Translate the projection to center the map in the SVG container
            .translate([containerWidth / 2, containerHeight / 2 - 250]);

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
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`<strong>${d.properties.name}</strong>`)
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

        // Update the total visitor count displayed in the H1 title
        d3.select("#visitorCount").text(activeVisitors.length);

        // Bind the `activeVisitors` array to SVG circle elements.
        // `d => d.id` is crucial for object constancy, ensuring D3 tracks individual visitors.
        const visitorDots = svg.selectAll(".visitormap-visitor-dot")
            .data(activeVisitors, d => d.id);

        // EXIT selection: Handle visitors that are no longer in `activeVisitors` (they "left").
        visitorDots.exit()
            .transition()
            .duration(MAP_UPDATE_INTERVAL_MS / 2) // Animate their disappearance
            .attr("r", 0) // Shrink radius to 0
            .style("opacity", 0) // Fade out
            .remove(); // Remove the circle from the DOM

        // ENTER selection: Handle new visitors (they "arrived").
        visitorDots.enter()
            .append("circle")
            .attr("class", "visitormap-visitor-dot")
            // Project geographic coordinates to screen coordinates (cx, cy)
            .attr("cx", d => projection([d.longitude, d.latitude])[0])
            .attr("cy", d => projection([d.longitude, d.latitude])[1])
            .attr("r", 0) // Start with radius 0 for an entry animation
            .style("opacity", 0) // Start with opacity 0 for an entry animation
            .transition()
            .duration(MAP_UPDATE_INTERVAL_MS / 2) // Animate their appearance
            .attr("r", VISITOR_DOT_RADIUS) // Grow to the target radius
            .style("opacity", 0.4); // Fade in to the target opacity

        // UPDATE selection: For existing visitors, no position update is needed in this simulation
        // as visitors are static once placed. If visitors moved, this is where you'd update their cx/cy.
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
