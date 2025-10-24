(function(){
// Data structure for nodes and links
        const graphData = {
            nodes: [
                // Courses (type: 'course')
                { id: "C1", name: "Music for Film", type: "course" },
                { id: "C2", name: "Sound Objects", type: "course" },
                { id: "C3", name: "Sonic Art & History of Noise", type: "course" },
                { id: "C4", name: "Fundamentals of Animation", type: "course" },
                { id: "C5", name: "Introduction to Photography", type: "course" },
                { id: "C6", name: "Digital Photography", type: "course" },
                { id: "C7", name: "Spec. Topics in Creative Media", type: "course" },
                { id: "C8", name: "Media Computing", type: "course" },
                { id: "C9", name: "Creative Coding", type: "course" },
                { id: "C10", name: "Creative Media Studio I", type: "course" },
                { id: "C11", name: "Creative Media Studio II", type: "course" },
                { id: "C12", name: "Narrative Strg & Aesthetics", type: "course" },

                // Artworks (type: 'artwork')
                { id: "A1", name: "Stationery Tidying ASMR", type: "artwork" },
                { id: "A2", name: "Personal Website", type: "artwork" },
                { id: "A3", name: "Short Animation: Fluffy weather forecast", type: "artwork" },
                { id: "A4", name: "Short film: Be my Digital Friend", type: "artwork" },
                { id: "A5", name: "Game Concept: Last Dawn", type: "artwork" },
                { id: "A6", name: "Digital Illustrations", type: "artwork" },
                { id: "A7", name: "Processing.org MV: Infinity Heaven", type: "artwork" },
            ],
            links: [
                { source: "A1", target: "C1" },
                { source: "A1", target: "C2" },
                { source: "A1", target: "C3" },
                { source: "A1", target: "C6" },
                { source: "A1", target: "C5" },
                { source: "A2", target: "C7" },
                { source: "A2", target: "C8" },
                { source: "A2", target: "C9" },
                { source: "A3", target: "C4" },
                { source: "A3", target: "C10" },
                { source: "A3", target: "C6" },
                { source: "A4", target: "C6" },
                { source: "A4", target: "C11" },
                { source: "A4", target: "C5" },
                { source: "A4", target: "C12" },
                { source: "A4", target: "C1" },
                { source: "A5", target: "C12" },
                { source: "A5", target: "A6" },
                { source: "A6", target: "C10" },
                { source: "A6", target: "C6" },
                { source: "C5", target: "C6"},
                { source: "A7", target: "C1"},
                { source: "A7", target: "C8"},
                { source: "A7", target: "C9"},
            ]
        };

  function drawNodeLinkDiagram() {
            const container = d3.select("#vis-nodelink");
            const containerWidth = container.node().clientWidth - 100;
            const containerHeight = container.node().clientHeight + 600;

            // Clear any existing SVG
            container.select("svg").remove();

            // Setup SVG dimensions
            const width = containerWidth;
            const height = containerHeight;
            const nodeRadius = 20; // Define node radius here for boundary checks

            const svg = container.append("svg")
                .attr("width", width)
                .attr("height", height);

            // Define colors
            const courseColor = "#66c2a5"; // A single color for all course nodes
            const artworkColorScale = d3.scaleOrdinal(d3.schemeCategory10); // Different colors for artwork nodes

            // Initialize the force simulation
            // Forces:
            // 1. Many-body force: Attracts or repels nodes.
            // 2. Link force: Attracts connected nodes and repels unconnected nodes.
            // 3. Center force: Pulls all nodes towards the center of the SVG.
            // 4. X/Y forces: Keep nodes roughly centered on their respective axes.
            const simulation = d3.forceSimulation(graphData.nodes)
                .force("link", d3.forceLink(graphData.links).id(d => d.id).distance(100)) // Link distance
                .force("charge", d3.forceManyBody().strength(-900)) // Node repulsion strength
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("x", d3.forceX(width / 2).strength(0.1)) // Gentle pull towards center X
                .force("y", d3.forceY(height / 2).strength(0.1)); // Gentle pull towards center Y

            // Select the tooltip div
            const tooltip = d3.select("#tooltip-nodelink");

            // Draw links
            const link = svg.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(graphData.links)
                .join("line")
                .attr("class", "link");

            // Draw nodes
            const node = svg.append("g")
                .attr("class", "nodelink-nodes") // Updated from "nodes"
                .selectAll("g")
                .data(graphData.nodes)
                .join("g")
                .attr("class", "nodelink-node") // Updated from "node"
                .call(d3.drag() // Add drag functionality to nodes
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            node.append("circle")
                .attr("class", "node-circle-element") // This was already specific
                .attr("r", nodeRadius) // Use nodeRadius for consistency
                .attr("fill", d => d.type === "course" ? courseColor : artworkColorScale(d.id))
                .on("mouseover", function(event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`<strong>${d.name}</strong><br>Type: ${d.type}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mousemove", function(event) {
                    tooltip.style("left", (event.pageX + 10) + "px")
                           .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function(d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            node.append("text")
                .attr("dy", "0.35em") // Vertical alignment
                .text(d => d.name);

            // Update positions of nodes and links on each tick of the simulation
            simulation.on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node.each(d => {
                    // Clamp node's x-coordinate within bounds, considering its radius
                    d.x = Math.max(nodeRadius, Math.min(width - nodeRadius, d.x));
                    // Clamp node's y-coordinate within bounds, considering its radius
                    d.y = Math.max(nodeRadius, Math.min(height - nodeRadius, d.y));
                });

                node
                    .attr("transform", d => `translate(${d.x},${d.y})`);
            });

            // Drag functions
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(event, d) {
                // Clamp the fixed position (fx, fy) during drag, considering node radius
                d.fx = Math.max(nodeRadius, Math.min(width - nodeRadius, event.x));
                d.fy = Math.max(nodeRadius, Math.min(height - nodeRadius, event.y));
            }

            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                // Optionally fix node position after drag, or let forces take over
                // d.fx = null;
                // d.fy = null;
            }
        }

        // Initial draw
        drawNodeLinkDiagram();

        // Handle responsiveness on window resize
        window.addEventListener('resize', drawNodeLinkDiagram);


})();