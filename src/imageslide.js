(function () {
    const categoryData = [
        {
            name: "Original Illustrations",
            folder: "1",
            images: ["Blizzard2024.png", "Spirits2024.png", "Bonfire2024.jpg", "Heroes2024.jpg", "Blizzard2023.jpg", "devil.png", "ISP_Share.png"]
        },
        {
            name: "Fanart Illustrations",
            folder: "2",
            images: ["Finii_14.png", "XiaoContest.png", "ScaraModern.png", "Neuvilette.jpg"]
        },
        {
            name: "Misc. Illustrations",
            folder: "3",
            images: ["Marin.png", "Tale_of_Takako.png", "emoticons.png"]
        },
        {
            name: "Photography",
            folder: "4",
            images: ["origami.jpg", "photo_02.jpg"]
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
    // determine current category based on page URL
    if (window.location.pathname.includes("art-1.html")) {
        currentCategoryIndex = 0; // Folder 1
    } else if (window.location.pathname.includes("art-2.html")) {
        currentCategoryIndex = 1; // Folder 2
    } else if (window.location.pathname.includes("art-3.html")) {
        currentCategoryIndex = 2; // Folder 3
    } else if (window.location.pathname.includes("art-4.html")) {
        currentCategoryIndex = 3; // Folder 4
    } else if (window.location.pathname.includes("art-5.html")) {
        currentCategoryIndex = 4; // Folder 5
    } else if (window.location.pathname.includes("art-6.html")) {
        currentCategoryIndex = 5; // Folder 6
    }
    let currentImageIndex = 0; // reset to 0

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