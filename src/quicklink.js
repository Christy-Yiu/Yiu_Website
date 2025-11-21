(function () {
    // Define the data for your quick link buttons.
    // Each object in this array represents one button.
    const buttonData = [
        {
            id: 'instagram',
            imageSrc: 'https://via.placeholder.com/300x200/FF5733/FFFFFF?text=Project+Overview',
            caption: 'Instagram',
            description: 'My Soaical Media Account where I post my digital content.'
        },
        {
            id: 'portfolio',
            imageSrc: 'https://via.placeholder.com/300x200/33FF57/FFFFFF?text=Our+Services',
            caption: 'Portfolio',
            description: 'My Portfolio website, showcasing more of my work.'
        },
        {
            id: 'cv',
            imageSrc: 'https://via.placeholder.com/300x200/3357FF/FFFFFF?text=Latest+News',
            caption: 'CV',
            description: 'Link to my CV file.'
        }
    ];

        // 1. Select the container where buttons will be added
        const quicklinkSection = d3.select("#quicklink");

        // 2. Data join: Bind the `buttonData` array to the selection of `.quicklink-button` elements.
        //    `.data(buttonData, d => d.id)` tells D3 to use the `id` property for object constancy,
        //    which is useful if you were to update the data later.
        const buttons = quicklinkSection.selectAll(".quicklink-button")
            .data(buttonData, d => d.id)
            .enter() // For each new data item, create a new element
            .append("div") // Append a div for each button
            .attr("class", "quicklink-button"); // Assign the base class

        // 3. Append elements to each button container based on the data
        //    a. Image
        buttons.append("img")
            .attr("src", d => d.imageSrc) // Set image source from data
            .attr("alt", d => `Image for ${d.caption}`); // Set accessible alt text

        //    b. Bottom bar with caption
        const bottomBars = buttons.append("div")
            .attr("class", "bottom-bar");

        bottomBars.append("p")
            .text(d => d.caption) // Set caption text from data
            .style("color", "white"); // Explicitly set text color to white via D3.js

        //    c. Hover overlay with description
        const hoverOverlays = buttons.append("div")
            .attr("class", "hover-overlay");

        hoverOverlays.append("p")
            .text(d => d.description) // Set description text from data
            .style("color", "white"); // Explicitly set text color to white via D3.js

        // 4. Attach event listeners for hover animations using D3
        buttons
            .on("mouseover", function() {
                // When mouse hovers over a button:
                // Select the `.hover-overlay` element within the current button (`this`).
                d3.select(this).select(".hover-overlay")
                    .style("visibility", "visible") // Make it visible immediately
                    .transition() // Start a D3 transition
                    .duration(300) // Animation duration in milliseconds
                    .style("opacity", 1); // Fade in to full opacity
            })
            .on("mouseout", function() {
                // When mouse leaves a button:
                // Select the `.hover-overlay` element within the current button (`this`).
                d3.select(this).select(".hover-overlay")
                    .transition() // Start a D3 transition
                    .duration(300) // Animation duration
                    .style("opacity", 0) // Fade out to zero opacity
                    .on("end", function() { // After the fade-out transition ends
                        d3.select(this).style("visibility", "hidden"); // Hide it completely
                    });
            });
})();