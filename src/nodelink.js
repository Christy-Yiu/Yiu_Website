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

    // --- Node Descriptions ---
const nodeDescriptions = {
        "C1": "<strong>Music for Film:</strong> Explores how music acts as a strong part of movies, editing sound elements into films.",
        "C2": "<strong>Sound Objects:</strong> Explores sonic art in terms of ASMR and sound",
        "C3": "<strong>Sonic Art & History of Noise:</strong> A theoretical course examining the historical development of sound art and the role of noise in contemporary art forms.",
        "C4": "<strong>Fundamentals of Animation:</strong> Covers the basic principles and techniques of animation, including traditional, stop-motion, and digital methods.",
        "C5": "<strong>Introduction to Photography:</strong> An introductory course to photographic principles, composition, lighting, and basic camera operation.",
        "C6": "<strong>Digital Photography:</strong> Builds upon introductory concepts, focusing on digital image capture, editing, and post-processing techniques.",
        "C7": "<strong>Spec. Topics in Creative Media:</strong> An advanced course exploring emerging trends and specialized areas within creative media, often project-based.",
        "C8": "<strong>Media Computing:</strong> Introduces computational concepts relevant to media creation, including programming for interactive art and data visualization.",
        "C9": "<strong>Creative Coding:</strong> Focuses on using programming languages (like Processing or p5.js) to create generative art, interactive installations, and visual effects.",
        "C10": "<strong>Creative Media Studio I:</strong> The first part of a capstone studio series, where students develop and execute a significant creative media project.",
        "C11": "<strong>Creative Media Studio II:</strong> The second part of the capstone series, involving further development, refinement, and presentation of a major project.",
        "C12": "<strong>Narrative Strg & Aesthetics:</strong> Examines storytelling structures and aesthetic principles across various media, from film to interactive experiences.",

        "A1": "<strong>Stationery Tidying ASMR:</strong> An artwork exploring auditory sensory experiences through everyday sounds, specifically focused on the meticulous arrangement of stationery items.",
        "A2": "<strong>Personal Website:</strong> A digital portfolio showcasing various creative projects, built using web development technologies learned in media computing courses.",
        "A3": "<strong>Short Animation: Fluffy weather forecast:</strong> A whimsical animated short film depicting a weather forecast delivered by fluffy, cloud-like characters.",
        "A4": "<strong>Short film: Be my Digital Friend:</strong> A narrative short film exploring themes of loneliness and connection in the digital age, utilizing various visual and sound design techniques.",
        "A5": "<strong>Game Concept: Last Dawn:</strong> A conceptual design for a video game, outlining its narrative, mechanics, and visual style, drawing inspiration from storytelling and animation principles.",
        "A6": "<strong>Digital Illustrations:</strong> A collection of digital artworks created using various software, demonstrating skills in visual composition and digital painting.",
        "A7": "<strong>Processing.org MV: Infinity Heaven:</strong> A generative music video created using Processing.org, featuring abstract visual patterns that react to an original music track."
    };

    // --- Global State Variables ---
    let focusedNodeId = null;
    const originalNodeRadius = 20;
    const originalLinkStrokeWidth = 2; // Default stroke width for links
    // Removed unused zoom/scale constants as they are now directly calculated or used in transitions.
    const animationDuration = 300; // Duration for all transitions in milliseconds

    function drawNodeLinkDiagram() {
        const container = d3.select("#vis-nodelink");
        const containerWidth = container.node().clientWidth - 200;
        const svgWidth = containerWidth - 50; // Adjusted to leave space for the description panel
        const containerHeight = 800; // Fixed height for the container

        // Clear any existing SVG and description panel content
        container.select("svg").remove();
        d3.select("#nodelink-description-panel").classed("nodelink-hidden", true);
        d3.select("#nodelink-back-button").classed("nodelink-hidden", true);

        // Setup SVG dimensions
        const svg = container.append("svg")
            .attr("width", svgWidth)
            .attr("height", containerHeight);

        // Define colors
        const courseColor = "#66c2a5"; // A single color for all course nodes
        const artworkColorScale = d3.scaleOrdinal(d3.schemeCategory10); // Different colors for artwork nodes

        // Initialize the force simulation
        const simulation = d3.forceSimulation(graphData.nodes)
            .force("link", d3.forceLink(graphData.links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-900))
            .force("center", d3.forceCenter(svgWidth / 2, containerHeight / 2))
            .force("x", d3.forceX(svgWidth / 2).strength(0.1))
            .force("y", d3.forceY(containerHeight / 2).strength(0.1));

        // Select the tooltip div
        const tooltip = d3.select("#tooltip-nodelink");

        // Draw links
        const link = svg.append("g")
            .attr("class", "nodelink-links")
            .selectAll("line")
            .data(graphData.links)
            .join("line")
            .attr("class", "nodelink-link")
            .attr("stroke", "#333") // Changed link color to dark gray for visibility
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", originalLinkStrokeWidth); // Set default stroke width

        // Draw nodes
        const node = svg.append("g")
            .attr("class", "nodelink-nodes")
            .selectAll("g")
            .data(graphData.nodes)
            .join("g")
            .attr("class", "nodelink-node")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        node.append("circle")
            .attr("class", "nodelink-node-circle")
            .attr("r", originalNodeRadius)
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
            })
            .on("click", function(event, d) {
                event.stopPropagation();
                toggleNodeFocus(d.id);
            });

        node.append("text")
            .attr("class", "nodelink-node-text")
            .attr("dy", "0.35em")
            .text(d => d.name);

        // Update positions of nodes and links on each tick of the simulation
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node.each(d => {
                d.x = Math.max(originalNodeRadius, Math.min(svgWidth - originalNodeRadius, d.x));
                d.y = Math.max(originalNodeRadius, Math.min(containerHeight - originalNodeRadius, d.y));
            });

            node
                .attr("transform", d => `translate(${d.x},${d.y})`);

            // Apply visual updates after positions are calculated
            // updateVisualization(); // Do not call here, only on focus/unfocus
        });

        // --- Interaction Functions ---
        function toggleNodeFocus(clickedNodeId) {
            if (focusedNodeId === clickedNodeId) {
                focusedNodeId = null; // Unfocus if clicked again
            } else {
                focusedNodeId = clickedNodeId; // Focus on new node
            }
            updateVisualization(); // Re-apply visual state with animation
        }

        function updateVisualization() {
            const allLinks = svg.selectAll(".nodelink-link");
            const allNodes = svg.selectAll(".nodelink-node");
            const descriptionPanel = d3.select("#nodelink-description-panel");
            const backButton = d3.select("#nodelink-back-button");
            const panelTitle = d3.select("#nodelink-panel-title");
            const panelContent = d3.select("#nodelink-panel-content");

            if (focusedNodeId) {
                descriptionPanel.classed("nodelink-hidden", false);
                backButton.classed("nodelink-hidden", false);

                const focusedNodeData = graphData.nodes.find(n => n.id === focusedNodeId);
                panelTitle.text(focusedNodeData ? focusedNodeData.name : "N/A");
                panelContent.html(nodeDescriptions[focusedNodeId] || "No description available.");

                // Determine connected nodes and links
                const connectedNodeIds = new Set();
                graphData.links.forEach(l => {
                    if (l.source.id === focusedNodeId) connectedNodeIds.add(l.target.id);
                    if (l.target.id === focusedNodeId) connectedNodeIds.add(l.source.id);
                });
                connectedNodeIds.add(focusedNodeId); // Add the focused node itself

                // Update nodes with transitions
                allNodes.each(function(d) {
                    const circle = d3.select(this).select(".nodelink-node-circle");
                    const text = d3.select(this).select(".nodelink-node-text");

                    if (d.id === focusedNodeId) {
                        circle.transition().duration(animationDuration).attr("r", originalNodeRadius * 2).style("opacity", 1);
                        text.transition().duration(animationDuration).style("opacity", 1).style("font-weight", "bold");
                    } else if (connectedNodeIds.has(d.id)) {
                        circle.transition().duration(animationDuration).attr("r", originalNodeRadius * 1.2).style("opacity", 1);
                        text.transition().duration(animationDuration).style("opacity", 1).style("font-weight", "normal");
                    } else {
                        circle.transition().duration(animationDuration).attr("r", originalNodeRadius * 0.5).style("opacity", 0.2);
                        text.transition().duration(animationDuration).style("opacity", 0.3).style("font-weight", "normal");
                    }
                });

                // Update links with transitions
                allLinks.each(function(d) {
                    const linkSelection = d3.select(this);
                    if (d.source.id === focusedNodeId || d.target.id === focusedNodeId) {
                        linkSelection.transition().duration(animationDuration).attr("stroke-width", originalLinkStrokeWidth * 1.5).attr("stroke-opacity", 1);
                    } else {
                        linkSelection.transition().duration(animationDuration).attr("stroke-width", originalLinkStrokeWidth * 0.5).attr("stroke-opacity", 0.2);
                    }
                });

            } else { // No node is focused (unfocus state)
                descriptionPanel.classed("nodelink-hidden", true);
                backButton.classed("nodelink-hidden", true);

                // Reset all nodes to original state with transitions
                allNodes.each(function(d) {
                    d3.select(this).select(".nodelink-node-circle").transition().duration(animationDuration).attr("r", originalNodeRadius).style("opacity", 1);
                    d3.select(this).select(".nodelink-node-text").transition().duration(animationDuration).style("opacity", 1).style("font-weight", "normal");
                });
                // Reset all links to original state with transitions
                allLinks.transition().duration(animationDuration).attr("stroke-width", originalLinkStrokeWidth).attr("stroke-opacity", 0.6);
            }
        }

        // Back button handler
        d3.select("#nodelink-back-button").on("click", () => {
            focusedNodeId = null;
            updateVisualization();
        });

        // Allow clicking on SVG background to unfocus
        svg.on("click", () => {
            if (focusedNodeId) {
                focusedNodeId = null;
                updateVisualization();
            }
        });

        // Drag functions
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = Math.max(originalNodeRadius, Math.min(svgWidth - originalNodeRadius, event.x));
            d.fy = Math.max(originalNodeRadius, Math.min(containerHeight - originalNodeRadius, event.y));
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        // Initial call to updateVisualization to set default styles
        updateVisualization();
    }

    // Initial draw
    drawNodeLinkDiagram();

    // Handle responsiveness on window resize
    window.addEventListener('resize', drawNodeLinkDiagram);
})();