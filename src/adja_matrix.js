(function(){
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

        function drawAdjacencyMatrix() {
            const container = d3.select("#vis-adja-matrix");
            const containerWidth = container.node().clientWidth;
            const containerHeight = container.node().clientHeight + 200;

            container.select("svg").remove();

            const matrixNodes = [...graphData.nodes].sort((a, b) => {
                if (a.type === b.type) {
                    return a.name.localeCompare(b.name);
                }
                return a.type === "course" ? -1 : 1;
            });

            const linkMap = new Map();
            graphData.links.forEach(link => {
                linkMap.set(`${link.source}-${link.target}`, true);
                linkMap.set(`${link.target}-${link.source}`, true);
            });

            const matrix = [];
            matrixNodes.forEach((sourceNode, i) => {
                matrixNodes.forEach((targetNode, j) => {
                    const isConnected = linkMap.has(`${sourceNode.id}-${targetNode.id}`);
                    matrix.push({
                        source: sourceNode,
                        target: targetNode,
                        x: j,
                        y: i,
                        value: isConnected ? 1 : 0
                    });
                });
            });

            const margin = { top: 120, right: 120, bottom: 200, left: 150 };
            const innerWidth = containerWidth - margin.left - margin.right;
            const innerHeight = containerHeight - margin.top - margin.bottom;

            const numNodes = matrixNodes.length;
            const cellSize = Math.min(
                Math.floor(innerWidth / numNodes),
                Math.floor((containerHeight - margin.top) / numNodes)
            );

            const svgWidth = cellSize * numNodes + margin.left + margin.right;
            const svgHeight = cellSize * numNodes + margin.top + margin.bottom;

            const svg = container.append("svg")
                .attr("width", svgWidth)
                .attr("height", svgHeight)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const x = d3.scaleBand()
                .range([0, cellSize * numNodes])
                .domain(matrixNodes.map(d => d.id))
                .paddingInner(0.05);

            const y = d3.scaleBand()
                .range([0, cellSize * numNodes])
                .domain(matrixNodes.map(d => d.id))
                .paddingInner(0.05);

            const tooltip = d3.select("#tooltip-adja-matrix");

            svg.selectAll(".adj-matrix-cell")
                .data(matrix)
                .join("rect")
                .attr("class", "adj-matrix-cell")
                .attr("x", d => x(d.target.id))
                .attr("y", d => y(d.source.id))
                .attr("width", x.bandwidth())
                .attr("height", y.bandwidth())
                .attr("fill", d => d.value ? "#2196f3" : "#e0f2f7")
                .on("mouseover", function(event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    const linkStatus = d.value ? "Linked" : "Not Linked";
                    tooltip.html(`<strong>${d.source.name}</strong><br>to <strong>${d.target.name}</strong><br>${linkStatus}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            svg.selectAll(".adj-matrix-label.row-label")
                .data(matrixNodes)
                .join("text")
                .attr("class", "adj-matrix-label row-label")
                .attr("x", -5)
                .attr("y", d => y(d.id) + y.bandwidth() / 2)
                .attr("dy", "0.35em")
                .text(d => d.name);

            svg.selectAll(".adj-matrix-label.col-label")
                .data(matrixNodes)
                .join("text")
                .attr("class", "adj-matrix-label col-label")
                .attr("x", d => x(d.id) + x.bandwidth() / 2)
                .attr("y", -5)
                .attr("dy", "0.35em")
                .text(d => d.name)
                .attr("transform", d => `rotate(-90, ${x(d.id) + x.bandwidth() / 2}, -5)`);
        }

        drawAdjacencyMatrix();

        window.addEventListener('resize', drawAdjacencyMatrix);
})();