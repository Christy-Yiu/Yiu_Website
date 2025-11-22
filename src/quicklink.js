(function () {
    const buttonData = [
        {
            id: 'instagram',
            imageSrc: 'https://i.imgur.com/SpjpyJZ.jpeg',
            caption: 'Instagram',
            description: 'Link to my art instagram account.',
            url: 'https://www.instagram.com/0911_nozomi/'
        },
        {
            id: 'Portfolio',
            imageSrc: 'https://i.imgur.com/gBswTwK.jpeg',
            caption: 'Portfolio Website',
            description: 'To my portfolio website showcasing my projects.',
            url: 'https://christyyiu911.wixsite.com/christy-portfolio' // Added URL for navigation
        },
        {
            id: 'cv',
            imageSrc: 'https://i.imgur.com/MpYali2.jpeg',
            caption: 'cv',
            description: 'Link to my CV document for easy reference.',
            url: 'https://docs.google.com/document/d/1rr0ovCMOCspKG-bNweyGonhS5CIS9lI3NPVXDCO-H6Q/edit?usp=sharing' // Added URL for navigation
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
        .attr("class", "bottom-bar")
        .style("color", "white"); // Set text color to white

    bottomBars.append("p")
        .text(d => d.caption); // Set caption text from data
        

    //    c. Hover overlay with description
    const hoverOverlays = buttons.append("div")
        .attr("class", "hover-overlay");

    hoverOverlays.append("p")
        .text(d => d.description); // Set description text from data

    // 4. Attach event listeners for hover animations and click navigation using D3
    buttons
        .on("mouseover", function () {
            // When mouse hovers over a button:
            // Select the `.hover-overlay` element within the current button (`this`).
            d3.select(this).select(".hover-overlay")
                .style("visibility", "visible") // Make it visible immediately
                .transition() // Start a D3 transition
                .duration(300) // Animation duration in milliseconds
                .style("opacity", 1); // Fade in to full opacity
        })
        .on("mouseout", function () {
            // When mouse leaves a button:
            // Select the `.hover-overlay` element within the current button (`this`).
            d3.select(this).select(".hover-overlay")
                .transition() // Start a D3 transition
                .duration(300) // Animation duration
                .style("opacity", 0) // Fade out to zero opacity
                .on("end", function () { // After the fade-out transition ends
                    d3.select(this).style("visibility", "hidden"); // Hide it completely
                });
        })
        .on("click", function (event, d) { // Attach a click event listener
            // 'd' here is the data object bound to the current button
            if (d.url) { // Check if a URL is defined for this button
                window.open(d.url, '_blank'); // Open the URL in a new tab
                // Alternatively, to open in the same tab:
                // window.location.href = d.url;
            }
        });
})();