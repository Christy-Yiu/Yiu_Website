(function () {
    const categoryData = [
        {
            name: "Original Illustrations",
            folder: "1",
            images: ["Anathema.jpg","Blizzard2024.png", "Spirits2024.png", "Bonfire2024.jpg", "Heroes2024.jpg", "Blizzard2023.jpg"]
        },
        {
            name: "Misc. Illustrations",
            folder: "2",
            images: ["Finii_14.png", "Marin.png", "Tale_of_Takako.png", "emoticons.png"]
        },
        {
            name: "IRL Projects",
            folder: "3",
            images: ["Finii_14.png", "Marin.png", "Tale_of_Takako.png", "emoticons.png"]
        },
        {
            name: "Photography",
            folder: "4",
            images: ["origami.jpg", "Dragon_1.jpg", "Dragon_2.jpg", "Dragon_3.jpg", "Dragon_4.jpg", "home_1.jpg", "home_2.jpg", "home_3.jpg", "home_4.jpg", "misc_1.jpg"]
        },
    ];
    // determine current category based on page URL
    let currentCategoryIndex = 0;
    if (window.location.pathname.includes("art-1.html")) {
        currentCategoryIndex = 0; // Folder 1
    } else if (window.location.pathname.includes("art-2.html")) {
        currentCategoryIndex = 1; // Folder 2
    } else if (window.location.pathname.includes("art-3.html")) {
        currentCategoryIndex = 2; // Folder 3
    } else if (window.location.pathname.includes("art-4.html")) {
        currentCategoryIndex = 3; // Folder 4
    }
    let currentImageIndex = 0; // reset to first image of slideshow

    const categoryTitle = d3.select(".showart-category-title");
    const imageDisplay = d3.select(".showart-image-display");
    const prevButton = d3.select("#prev-button");
    const nextButton = d3.select("#next-button");

    // The script is also loaded on pages without a slideshow (video works,
    // graduation thesis documentation), so leave quietly when there is
    // nothing to animate instead of throwing on a missing category.
    if (imageDisplay.empty() || prevButton.empty() || nextButton.empty() || !categoryData[currentCategoryIndex]) {
        return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const SLIDE_DURATION = reduceMotion ? 0 : 460; // ms, keep in sync with style.css
    const SLIDE_DISTANCE = 8;                      // % of stage width the layers travel
    const SWIPE_THRESHOLD = 55;                    // px before a drag counts as a swipe

    /* ---------- build the animated stage ---------------------------------- */

    const stage = document.createElement("div");
    stage.className = "slideshow-stage";
    stage.tabIndex = 0;
    stage.setAttribute("role", "group");
    stage.setAttribute("aria-roledescription", "carousel");
    stage.setAttribute("aria-label", "Artwork slideshow - drag the image or use the arrow buttons");

    const baseImage = imageDisplay.node();
    baseImage.parentNode.insertBefore(stage, baseImage);
    stage.appendChild(baseImage); // the existing <img> becomes the first layer
    baseImage.draggable = false;

    const overlayImage = document.createElement("img");
    overlayImage.className = "showart-slide-layer";
    overlayImage.alt = "";
    overlayImage.draggable = false;
    stage.appendChild(overlayImage);

    // keep the controls above the artwork, centred on the image itself
    prevButton.attr("aria-label", "Previous image");
    nextButton.attr("aria-label", "Next image");
    stage.appendChild(prevButton.node());
    stage.appendChild(nextButton.node());

    const counter = document.createElement("div");
    counter.className = "showart-counter";
    counter.setAttribute("aria-live", "polite");
    stage.appendChild(counter);

    const dotsContainer = document.createElement("div");
    dotsContainer.className = "showart-dots";
    stage.appendChild(dotsContainer);

    let frontImage = baseImage;   // the layer the visitor currently sees
    let backImage = overlayImage; // the layer waiting underneath
    let isAnimating = false;
    let dots = [];

    /* ---------- helpers --------------------------------------------------- */

    function imageSource(index) {
        const category = categoryData[currentCategoryIndex];
        return `./../../images/gallery/${category.folder}/${category.images[index]}`;
    }

    function buildDots() {
        const category = categoryData[currentCategoryIndex];
        dotsContainer.innerHTML = "";
        dots = category.images.map((fileName, index) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "showart-dot";
            dot.setAttribute("aria-label", `Show image ${index + 1} of ${category.images.length}`);
            dot.addEventListener("click", () => {
                if (isAnimating || index === currentImageIndex) return;
                const direction = index > currentImageIndex ? 1 : -1;
                currentImageIndex = index;
                updateSlideshow(true, direction);
            });
            dotsContainer.appendChild(dot);
            return dot;
        });
    }

    function preloadCategory() {
        const category = categoryData[currentCategoryIndex];
        category.images.forEach((fileName) => {
            const preloaded = new Image();
            preloaded.src = `./../../images/gallery/${category.folder}/${fileName}`;
        });
    }

    function syncControls() {
        const category = categoryData[currentCategoryIndex];

        categoryTitle.text(category.name);
        counter.textContent = `${currentImageIndex + 1} / ${category.images.length}`;

        dots.forEach((dot, index) => {
            dot.classList.toggle("is-active", index === currentImageIndex);
            if (index === currentImageIndex) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });

        const atStart = currentImageIndex === 0;
        const atEnd = currentImageIndex === category.images.length - 1;
        prevButton.property("disabled", atStart).attr("aria-disabled", atStart);
        nextButton.property("disabled", atEnd).attr("aria-disabled", atEnd);
    }

    function showImage(index, direction, animate) {
        const category = categoryData[currentCategoryIndex];
        const source = imageSource(index);
        const alt = `${category.name} - image ${index + 1} of ${category.images.length}`;

        // first paint: no transition, just place the image
        if (!animate) {
            frontImage.src = source;
            frontImage.alt = alt;
            frontImage.style.transition = "none";
            frontImage.style.opacity = "1";
            frontImage.style.transform = "translateX(0) scale(1)";
            frontImage.style.zIndex = "2";

            backImage.style.transition = "none";
            backImage.style.opacity = "0";
            backImage.style.transform = "translateX(0) scale(1)";
            backImage.style.zIndex = "1";

            window.requestAnimationFrame(() => {
                frontImage.style.transition = "";
                backImage.style.transition = "";
            });
            return;
        }

        if (isAnimating) return;

        const step = direction < 0 ? -1 : 1;
        const incoming = backImage;
        const outgoing = frontImage;

        isAnimating = true;

        // park the incoming layer off-screen, on the side the visitor came from
        incoming.src = source;
        incoming.alt = alt;
        incoming.style.transition = "none";
        incoming.style.opacity = "0";
        incoming.style.transform = `translateX(${step * SLIDE_DISTANCE}%) scale(1.03)`;
        incoming.style.zIndex = "3";
        void incoming.offsetWidth; // flush the parked position before animating

        incoming.style.transition = "";

        window.requestAnimationFrame(() => {
            incoming.style.opacity = "1";
            incoming.style.transform = "translateX(0) scale(1)";

            outgoing.style.zIndex = "2";
            outgoing.style.opacity = "0";
            outgoing.style.transform = `translateX(${-step * SLIDE_DISTANCE}%) scale(0.98)`;
        });

        window.setTimeout(() => {
            // reset the layer that just left, then swap the roles for the next move
            outgoing.style.transition = "none";
            outgoing.style.opacity = "0";
            outgoing.style.transform = "translateX(0) scale(1)";
            outgoing.style.zIndex = "1";
            void outgoing.offsetWidth;
            outgoing.style.transition = "";

            frontImage = incoming;
            backImage = outgoing;
            isAnimating = false;
        }, SLIDE_DURATION + 60);
    }

    function updateSlideshow(animate, direction) {
        showImage(currentImageIndex, direction, animate !== false);
        syncControls();
    }

    function navigateSlideshow(direction) {
        if (isAnimating) return;

        const category = categoryData[currentCategoryIndex];
        const newImageIndex = currentImageIndex + direction;

        if (newImageIndex >= 0 && newImageIndex < category.images.length) {
            currentImageIndex = newImageIndex;
            updateSlideshow(true, direction);
        }
    }

    /* ---------- drag / swipe ---------------------------------------------- */

    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragOffset = 0;
    let axisLocked = false;

    function resetDragStyles() {
        frontImage.style.transition = "";
        frontImage.style.transform = "translateX(0) scale(1)";
        frontImage.style.opacity = "1";
    }

    stage.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        if (event.target.closest("button")) return; // let buttons and dots work normally
        if (isAnimating) return;

        dragging = true;
        axisLocked = false;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        dragOffset = 0;
        frontImage.style.transition = "none";
        stage.classList.add("is-dragging");

        if (stage.setPointerCapture) {
            try {
                stage.setPointerCapture(event.pointerId);
            } catch (error) {
                /* pointer capture is a nice-to-have */
            }
        }
    });

    stage.addEventListener("pointermove", (event) => {
        if (!dragging) return;

        const dx = event.clientX - dragStartX;
        const dy = event.clientY - dragStartY;

        if (!axisLocked) {
            if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
            axisLocked = true;
        }

        if (Math.abs(dy) > Math.abs(dx) * 1.3) {
            // vertical gesture: let the page scroll instead
            dragging = false;
            stage.classList.remove("is-dragging");
            resetDragStyles();
            return;
        }

        event.preventDefault();
        dragOffset = dx;

        const resisted = Math.max(-110, Math.min(110, dx * 0.45));
        const fade = (Math.min(Math.abs(dx), 320) / 320) * 0.4;
        frontImage.style.transform = `translateX(${resisted}px) scale(${1 - fade * 0.05})`;
        frontImage.style.opacity = String(1 - fade);
    });

    function endDrag(event) {
        if (!dragging) return;

        dragging = false;
        stage.classList.remove("is-dragging");

        if (stage.releasePointerCapture && event && event.pointerId !== undefined) {
            try {
                stage.releasePointerCapture(event.pointerId);
            } catch (error) {
                /* ignore */
            }
        }

        const category = categoryData[currentCategoryIndex];
        const direction = dragOffset < 0 ? 1 : -1;
        const targetIndex = currentImageIndex + direction;

        frontImage.style.transition = "";

        if (Math.abs(dragOffset) > SWIPE_THRESHOLD && targetIndex >= 0 && targetIndex < category.images.length) {
            currentImageIndex = targetIndex;
            updateSlideshow(true, direction);
        } else {
            resetDragStyles();
        }

        dragOffset = 0;
    }

    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    stage.addEventListener("lostpointercapture", endDrag);

    /* ---------- keyboard + buttons ---------------------------------------- */

    stage.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            navigateSlideshow(-1);
        } else if (event.key === "ArrowRight") {
            event.preventDefault();
            navigateSlideshow(1);
        }
    });

    prevButton.on("click", () => navigateSlideshow(-1));
    nextButton.on("click", () => navigateSlideshow(1));

    // Initial load
    buildDots();
    preloadCategory();
    updateSlideshow(false, 0); // show the first image without animating

})();