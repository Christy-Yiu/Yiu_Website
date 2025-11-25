(function () {
const artworkData = [
            {
                id: 1,
                imageUrl: "./../images/gallery_thumbnails/thumb_1.jpg",
                caption: "Original Illustrations",
                linkUrl: "./art_detail/art-1.html" 
            },
            {
                id: 2,
                imageUrl: "./../images/gallery_thumbnails/thumb_2.jpg",
                caption: "Fanart Illustrations",
                linkUrl: "./art_detail/art-2.html" 
            },
            {
                id: 3,
                imageUrl: "./../images/gallery_thumbnails/thumb_3.jpg",
                caption: "Misc. Illustrations",
                linkUrl: "./art_detail/art-3.html" 
            },
            {
                id: 4,
                imageUrl: "./../images/gallery_thumbnails/thumb_4.jpg",
                caption: "Photography",
                linkUrl: "./art_detail/art-4.html" 
            },
            {
                id: 5,
                imageUrl: "./../images/gallery_thumbnails/thumb_5.jpg",
                caption: "Animation Works",
                linkUrl: "./art_detail/art-5.html" 
            },
            {
                id: 6,
                imageUrl: "./../images/gallery_thumbnails/thumb_6.jpg",
                caption: "Video works",
                linkUrl: "./art_detail/art-6.html" 
            }
        ];

        // Select the gallery container
        const galleryContainer = d3.select("#gallery");

        // Bind data and create artwork elements
        const artworkLinks = galleryContainer.selectAll(".artwork-link")
            .data(artworkData)
            .enter()
            .append("a") // Append an anchor tag for the clickable link
            .attr("class", "artwork-link")
            .attr("href", d => d.linkUrl); // Set the link URL

        // Append the artwork item div inside each link
        const artworkItems = artworkLinks.append("div")
            .attr("class", "artwork-item");

        // Append the image inside the artwork item
        artworkItems.append("img")
            .attr("src", d => d.imageUrl)
            .attr("alt", d => d.caption); // Use caption as alt text for accessibility

        // Append the overlay div
        const artworkOverlays = artworkItems.append("div")
            .attr("class", "artwork-overlay");

        // Append the caption text div inside the overlay
        artworkOverlays.append("div")
            .attr("class", "artwork-caption")
            .text(d => d.caption); // Set the caption text
})();