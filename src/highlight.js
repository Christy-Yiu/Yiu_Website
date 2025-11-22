(function () {
    // Sample artwork data
    const artworkHighlights = [
        { src: '/images/highlight_gallery/image1.jpg', alt: 'Forest Path', title: 'Mystic Forest Path' },
        { src: '/images/highlight_gallery/image2.jpg', alt: 'Beach Sunset', title: 'Golden Hour at the Beach' },
        { src: '/images/highlight_gallery/image3.jpg', alt: 'Mountain Lake', title: 'Serene Mountain Lake' },
        { src: '/images/highlight_gallery/image4.jpg', alt: 'Desert Landscape', title: 'Vast Desert Expanse' },
        { src: '/images/highlight_gallery/image5.jpg', alt: 'City Lights', title: 'Urban Night Glow' },
        { src: '/images/highlight_gallery/image6.jpg', alt: 'Abstract Painting', title: 'Dynamic Abstraction' },
        { src: '/images/highlight_gallery/image7.jpg', alt: 'Old Town Street', title: 'Cobblestone Charm' },
        { src: '/images/highlight_gallery/image8.jpg', alt: 'Starry Night', title: 'Cosmic Canvas' },
        { src: '/images/highlight_gallery/image9.jpg', alt: 'Sculpture', title: 'Modern Sculpture' },
        { src: '/images/highlight_gallery/image10.jpg', alt: 'Still Life', title: 'Classic Still Life' }
    ];

    // Select the highlight section
    const highlightSection = d3.select("#highlight");

    // Append the wrapper for the scrollable area
    const galleryWrapper = highlightSection.append("div")
        .attr("class", "highlight-wrapper");

    // Append the inner gallery container (flex container for items)
    const gallery = galleryWrapper.append("div")
        .attr("class", "highlight-gallery");

    // Bind data and create artwork items
    const items = gallery.selectAll(".highlight-item")
        .data(artworkHighlights)
        .enter()
        .append("div")
        .attr("class", "highlight-item");

    // Add image to each item
    items.append("img")
        .attr("src", d => d.src)
        .attr("alt", d => d.alt)
        .attr("class", "highlight-image");

    // Add title to each item
    items.append("p")
        .attr("class", "highlight-title")
        .text(d => d.title);

    // --- Automatic Scrolling Logic ---
    let scrollInterval;
    let autoScrollActive = true; // Flag to control auto-scrolling state
    const scrollSpeed = 1; // Pixels to scroll per interval
    const scrollIntervalTime = 20; // Milliseconds between scroll updates (50px/second)

    const galleryWrapperNode = galleryWrapper.node();
    const galleryNode = gallery.node();

    /**
     * Starts the automatic scrolling of the gallery.
     * Auto-scroll will loop back to the beginning when it reaches the end.
     */
    const startAutoScroll = () => {
        if (!autoScrollActive || galleryNode.scrollWidth <= galleryWrapperNode.clientWidth) {
            return;
        }

        scrollInterval = setInterval(() => {
            const currentScrollLeft = galleryWrapperNode.scrollLeft;
            const maxScrollLeft = galleryNode.scrollWidth - galleryWrapperNode.clientWidth;

            if (maxScrollLeft <= 0) {
                stopAutoScroll();
                return;
            }

            let newScrollLeft = currentScrollLeft + scrollSpeed;

            if (newScrollLeft >= maxScrollLeft) {
                newScrollLeft = 0;
            }
            galleryWrapperNode.scrollLeft = newScrollLeft;
        }, scrollIntervalTime);
    };

    /**
     * Stops the automatic scrolling and sets the autoScrollActive flag to false.
     */
    const stopAutoScroll = () => {
        clearInterval(scrollInterval);
        autoScrollActive = false; // User interaction stops auto-scroll permanently until refreshed
    };

    // Initial call to start automatic scrolling
    startAutoScroll();

    // --- User Dragging Logic (D3.js Drag Behavior) ---
    let isDragging = false;
    let startX; // Mouse X position when drag starts
    let scrollLeftStart; // Scroll position of the wrapper when drag starts

    const dragHandler = d3.drag()
        .on("start", function (event) {
            stopAutoScroll(); // Stop automatic scrolling when user starts dragging
            isDragging = true;
            startX = event.x;
            scrollLeftStart = galleryWrapperNode.scrollLeft;
            d3.select(this).style("cursor", "grabbing"); // Change cursor to 'grabbing'
        })
        .on("drag", function (event) {
            if (isDragging) {
                const dx = event.x - startX;
                galleryWrapperNode.scrollLeft = scrollLeftStart - dx; // Adjust scroll position
            }
        })
        .on("end", function () {
            isDragging = false;
            d3.select(this).style("cursor", "grab"); // Change cursor back to 'grab'
            autoScrollActive = true; // Resume auto-scroll after dragging
            startAutoScroll(); // Start auto scroll again
        });

    // Apply the drag behavior to the scrollable wrapper
    galleryWrapper.call(dragHandler);

    // Optional: Re-evaluate auto-scroll on window resize
    window.addEventListener('resize', () => {
        if (autoScrollActive) {
            stopAutoScroll();
            startAutoScroll();
        } else {
            if (galleryNode.scrollWidth <= galleryWrapperNode.clientWidth) {
                galleryWrapperNode.scrollLeft = 0; // Reset if no longer scrollable
            }
        }
    });
})();
