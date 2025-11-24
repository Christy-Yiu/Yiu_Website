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
                imageUrl: "https://via.placeholder.com/600x400/33FF57/000000?text=Artwork+Two",
                caption: "Fanart Illustrations",
                linkUrl: "./art_detail/art-2.html" 
            },
            {
                id: 3,
                imageUrl: "https://via.placeholder.com/600x400/3357FF/FFFFFF?text=Artwork+Three",
                caption: "Misc. Illustrations",
                linkUrl: "./art_detail/art-3.html" 
            },
            {
                id: 4,
                imageUrl: "https://via.placeholder.com/600x400/FFFF33/000000?text=Artwork+Four",
                caption: "Photography",
                linkUrl: "./art_detail/art-4.html" 
            },
            {
                id: 5,
                imageUrl: "https://via.placeholder.com/600x400/FF33FF/FFFFFF?text=Artwork+Five",
                caption: "Animation Works",
                linkUrl: "./art_detail/art-5.html" 
            },
            {
                id: 6,
                imageUrl: "https://via.placeholder.com/600x400/33FFFF/000000?text=Artwork+Six",
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