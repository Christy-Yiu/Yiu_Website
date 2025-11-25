(function () {
    const categoryData = [
        {
            name: "Original Illustrations",
            folder: "1",
            images: ["Blizzard2024.png", "Spirits2024.png", "Bonfire2024.jpg", "Heroes2024.jpg", "Blizzard2023.jpg"]
        },
        {
            name: "Fanart Illustrations",
            folder: "2",
            images: ["fanart_01.jpg", "fanart_02.png", "fanart_03.jpg"]
        },
        {
            name: "Misc. Illustrations",
            folder: "3",
            images: ["misc_01.jpg", "misc_02.png"]
        },
        {
            name: "Photography",
            folder: "4",
            images: ["photo_01.jpg", "photo_02.jpg"]
        },
        {
            name: "Animation",
            folder: "5",
            images: ["animation_01.gif"]
        },
        {
            name: "Video Works",
            folder: "6",
            images: ["video_01.mp4"]
        }
    ];

    let currentCategoryIndex = 0;
    let currentImageIndex = 0;

    const categoryTitle = d3.select(".showart-category-title");
    const imageDisplay = d3.select(".showart-image-display");
    const prevButton = d3.select("#prev-button");
    const nextButton = d3.select("#next-button");

    function updateSlideshow() {
        const currentCategory = categoryData[currentCategoryIndex];
        const currentImageFileName = currentCategory.images[currentImageIndex];
        const imagePath = `./../../images/gallery/${currentCategory.folder}/${currentImageFileName}`;

        categoryTitle.text(currentCategory.name);
        imageDisplay.attr("src", imagePath);
        imageDisplay.attr("alt", `Image ${currentImageIndex + 1} of ${currentCategory.name}`);
    }

    function navigateSlideshow(direction) {
        const currentCategory = categoryData[currentCategoryIndex];
        let newImageIndex = currentImageIndex + direction;

        if (newImageIndex >= 0 && newImageIndex < currentCategory.images.length) {
            currentImageIndex = newImageIndex;
            updateSlideshow();
        }
    }

    prevButton.on("click", () => {
        console.log("Previous button clicked");
        navigateSlideshow(-1);
    });

    nextButton.on("click", () => {
        console.log("Next button clicked");
        navigateSlideshow(1);
    });


    // Initial load
    updateSlideshow(); // Load the first image of the first category

})();