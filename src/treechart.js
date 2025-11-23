(function() {
    // Data structure representing skills hierarchy
    const treeData = {
        name: "Skills",
        children: [
            {
                name: "Drawing (8 Years)",
                children: [
                    {
                        name: "Digital Painting",
                        children: [
                            { name: "Fanart illustrations: Wynncraft, Omega Strikers, Hollow Knight" },
                            { name: "Original characters and scenes" },
                            { name: "Software: CLIP Studio Paint, Photoshop, Medibang Paint" }
                        ]
                    },
                    {
                        name: "2D animation",
                        children: [
                            { name: "The Most Localized Fluffy Weather Forecast" },
                            { name: "Software: CLIP Studio Paint" }
                        ]
                    }
                ]
            },
            {
                name: "Video Work (5 Years)",
                children: [
                    {
                        name: "Real-life films",
                        children: [
                            { name: "Short Film 'Be my Digital Friend'" },
                            { name: "Short Film 'Stationery Tidying ASMR'" },
                            { name: "Software: Premiere Pro, Reaper" }
                        ]
                    },
                    {
                        name: "Editing & Animation",
                        children: [
                            { name: "Game-related videos (Genshin Impact, Minecraft, Call of Duty)" },
                            { name: "Music-related videos (find the light, letter)" },
                            { name: "Software: Premiere Pro, Power Director 14(Legacy)" }
                        ]
                    }
                ]
            },
            {
                name: "Coding (3 Years)",
                children: [
                    {
                        name: "HTML/CSS/JS",
                        children: [
                            { name: "Personal Website (The one you are at!)" },
                            { name: "Software: Visual Studio Pro" }
                        ]
                    },
                    {
                        name: "P5.js / Processing.org",
                        children: [
                            { name: "Interactive Music Video Infinity Heaven'" },
                            { name: "Software: Processing.org" }
                        ]
                    }
                ]
            }
        ]
    };

    function drawTreeDiagram() {
        const container = d3.select("#vis-tree");
        const margin = { top: 30, right: 30, bottom: 30, left: 30 };
        const containerWidth = container.node().clientWidth - 100;

        const height = 600 - margin.top - margin.bottom;
        const dynamicWidth = Math.max(containerWidth, 500) - margin.left - margin.right;

        container.select("svg").remove();

        const svg = container.append("svg")
            .attr("width", dynamicWidth + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const root = d3.hierarchy(treeData);
        const treeLayout = d3.tree().size([height, dynamicWidth]);
        const treeNodes = treeLayout(root);
        const nodes = treeNodes.descendants();
        const links = treeNodes.links();

        const linkPathGenerator = d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x);

        const svgGroup = svg.append("g");

        svgGroup.selectAll('.link')
            .data(links)
            .join('path')
            .attr('class', 'link')
            .attr('d', linkPathGenerator);

        const nodeGroup = svgGroup.selectAll('.node')
            .data(nodes)
            .join('g')
            .attr('class', d => `node ${d.depth === 0 ? 'node--root' : ''}`)
            .attr('transform', d => `translate(${d.y},${d.x})`);

        nodeGroup.append('circle')
            .attr('r', 10);

        nodeGroup.append('text')
            .attr('dy', '0.31em')
            .attr('x', d => d.depth === 0 ? 0 : d.children ? -10 : 10)
            .attr('text-anchor', d => d.depth === 0 ? 'middle' : d.children ? 'end' : 'start')
            .text(d => d.data.name)
            .attr('y', d => d.depth === 0 ? -15 : 0);

        // Initialize zoom and pan
        const zoomHandler = d3.zoom()
            .scaleExtent([0.5, 2]) // Zoom limits
            .on("zoom", (event) => {
                svgGroup.attr("transform", event.transform);
            });

        svg.call(zoomHandler);

    }

    drawTreeDiagram();
    window.addEventListener('resize', drawTreeDiagram);

})();