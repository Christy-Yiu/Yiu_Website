// treechart.js
    
(function(){

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
                                { name: "Original characters and scenes"},
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
                                { name: "Short Film 'Stationery Tidying ASMR'"},
                                { name: "Software: Premiere Pro, Reaper" }
                            ]
                        },
                        {
                            name: "Editing & Animation",
                            children: [
                                { name: "Game-related videos (Genshin Impact, Minecraft, Call of Duty" },
                                { name: "Music-related videos (find the light, letter)"},
                                { name: "Software: Premiere Pro, Power Director 14(Legacy)" }
                            ]
                        }
                    ]
                },
                {
                    name: "Coding (3 years)",
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
                                { name: "Learnt in: Media Computing Class" },
                                { name: "Product: Interactive Music Video" }
                            ]
                        }
                    ]
                }
            ]
        };

        function drawTreeDiagram() {
            const container = d3.select("#vis-tree");
            
            // Define fixed dimensions for the SVG canvas. 
            // We use a fixed height and dynamically calculate width based on content depth.
            const margin = { top: 30, right: 90, bottom: 30, left: 90 };
            const containerWidth = container.node().clientWidth;
            
            // Set a base height. Since we have few nodes, 500px is sufficient.
            const height = 600 - margin.top - margin.bottom; 

            // Calculate the total number of nodes to estimate the required width
            // A simple estimate: 200px per depth level + container width for initial view
            const maxDepth = d3.hierarchy(treeData).height;
            const dynamicWidth = Math.max(containerWidth, maxDepth * 150) / 2;
            const width = dynamicWidth - margin.left - margin.right;

            // Clear existing content
            container.select("svg").remove();

            // Append SVG to the container
            const svg = container.append("svg")
                .attr("width", width + margin.left + margin.right + 300)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // 1. Create the D3 Hierarchy
            const root = d3.hierarchy(treeData);

            // 2. Define the Tree Layout
            // Size is (height, width) for a horizontal layout
            const treeLayout = d3.tree().size([height, width]);

            // 3. Apply the layout to the hierarchy data
            const treeNodes = treeLayout(root);
            const nodes = treeNodes.descendants();
            const links = treeNodes.links();

            // 4. Define the Link (Path) Generator for horizontal links
            const linkPathGenerator = d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x);

            // 5. Draw the Links
            svg.selectAll('.link')
                .data(links)
                .join('path')
                .attr('class', 'link')
                .attr('d', linkPathGenerator);

            // 6. Draw the Nodes
            const node = svg.selectAll('.node')
                .data(nodes)
                .join('g')
                .attr('class', d => `node ${d.depth === 0 ? 'node--root' : ''}`)
                .attr('transform', d => `translate(${d.y},${d.x})`);

            // Append Circles to Nodes
            node.append('circle')
                .attr('r', 6);

            // Append Text Labels to Nodes
            node.append('text')
                .attr('dy', '0.31em')
                // Position text to the right for non-root nodes, and center for the root
                .attr('x', d => d.depth === 0 ? 0 : d.children ? -10 : 10)
                .attr('text-anchor', d => d.depth === 0 ? 'middle' : d.children ? 'end' : 'start')
                .text(d => d.data.name)
                // Offset the root node text vertically if centered
                .attr('y', d => d.depth === 0 ? -15 : 0);
        }

        // Initial draw
        drawTreeDiagram();

        // Handle responsiveness (though tree layout responsiveness is tricky,
        // this ensures it redraws if the container width changes significantly)
        window.addEventListener('resize', drawTreeDiagram);

    })();
