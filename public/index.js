// Event listeners for various elements on the page
document.getElementById("btnNavBlock").addEventListener("click", () => toggleClassesById("navBlock", "w3-show"));
document.getElementById("btnSearch").addEventListener("click", mouseEvent => searchText(mouseEvent.currentTarget));
document.getElementById("navBlock").querySelectorAll("a[href]").forEach(item => item.addEventListener("click", () => toggleClassesById("navBlock", "w3-show")));
document.getElementById("navBlock").querySelectorAll("a:not([href])").forEach(item => item.addEventListener("click", () => searchText(item)));
document.getElementById("productHero").querySelectorAll("button.open-download").forEach(item => item.addEventListener("click", () => toggleDisplayById("mdlDownload")));
document.getElementById("productHero").querySelectorAll("div.w3-display-right > div.w3-opacity-min > button.w3-button, button.w3-display-bottommiddle").forEach(item => item.addEventListener("click", () => plusSlides(1)));
document.getElementById("product").querySelectorAll("button.open-download").forEach(item => item.addEventListener("click", () => toggleDisplayById("mdlDownload")));
document.getElementById("enterprise").querySelectorAll("div.w3-row-padding > div.w3-col > div.w3-card > div.w3-container").forEach(item => item.lastElementChild.addEventListener("click", () => openModalContact(item.firstElementChild.textContent)));
document.getElementById("enterprise").querySelectorAll("div.w3-center > div.w3-third > ul.w3-ul").forEach(item => item.lastElementChild.firstElementChild.addEventListener("click", () => openModalSignUp(item.firstElementChild.textContent)));
document.getElementById("products").querySelectorAll("img").forEach(item => item.addEventListener("click", () => openModalImage(item)));
document.getElementById("products").querySelector("div.w3-center > button.w3-button").addEventListener("click", () => loadMore());
document.getElementById("products").querySelector("div.w3-center > div.w3-bar > button.w3-bar-item:first-of-type").addEventListener("click", () => showPage(pageIndex - 1));
document.getElementById("products").querySelectorAll("div.w3-center > div.w3-bar > button.w3-bar-item:not(:first-of-type):not(:last-of-type)").forEach((item, index) => item.addEventListener("click", () => showPage(index)));
document.getElementById("products").querySelector("div.w3-center > div.w3-bar > button.w3-bar-item:last-of-type").addEventListener("click", () => showPage(pageIndex + 1));
document.getElementById("about").querySelectorAll("div > div.w3-row-padding > div.w3-half > ul.w3-ul").forEach(item => item.lastElementChild.firstElementChild.addEventListener("click", () => openModalSignUp(item.firstElementChild.textContent)));
document.getElementById("contact").querySelector("form").addEventListener("submit", sendMessage);
document.getElementById("mdlDownload").querySelector("button").addEventListener("click", () => toggleDisplayById("mdlDownload"));
document.getElementById("mdlContact").querySelector("button").addEventListener("click", () => toggleDisplayById("mdlContact"));
document.getElementById("mdlImage").querySelector("button").addEventListener("click", () => toggleDisplayById("mdlImage"));

// Slideshow
const divHome = document.getElementById("productHero");
const downloadDivs = document.querySelectorAll("div#productHero > div.w3-display-left");
const takeTourDivs = document.querySelectorAll("div#productHero > div.w3-display-right");
let slideIndex = 0;
plusSlides(0);

// Load More
const gridImages1 = document.querySelectorAll("div#products > div.w3-row > div.w3-col");
const btnLoadMore = document.querySelector("div#products > div.w3-center > button.w3-button");
loadMore();

// Pagination
const pageSize = 4;
const gridImages2 = document.querySelectorAll("div#products > div.w3-row-padding > div.w3-col");
const barItems = document.querySelectorAll("div#products > div.w3-center > div.w3-bar > button.w3-bar-item:not(:first-of-type):not(:last-of-type)");
const totalPages = Math.ceil(gridImages2.length / pageSize);
let pageIndex = 0;
showPage(pageIndex);

/**
 * Moves the slideshow forward or backward by the specified number of slides. It updates the background image of the "productHero" div and displays the corresponding slide based on the current slide index.
 * @param {number} n - The number of slides to move forward (positive) or backward (negative) in the slideshow.
 */
function plusSlides(n) {
    slideIndex = (slideIndex + n) % downloadDivs.length;

    switch (slideIndex) {
        case 0:
            divHome.style.backgroundImage = "url('./img/product_hero_slider_tech_background_1.webp')";
            break;
        case 1:
            divHome.style.backgroundImage = "url('./img/product_hero_slider_tech_background_2.webp')";
            break;
        case 2:
            divHome.style.backgroundImage = "url('./img/product_hero_slider_tech_background_3.webp')";
            break;
        default:
            break;
    }

    for (const div of downloadDivs) {
        div.classList.remove("w3-show");
        div.classList.add("w3-hide");
    }
    downloadDivs[slideIndex].classList.remove("w3-hide");
    downloadDivs[slideIndex].classList.add("w3-show");

    for (const div of takeTourDivs) {
        div.classList.remove("w3-show");
        div.classList.add("w3-hide");
    }
    takeTourDivs[slideIndex].classList.remove("w3-hide");
    takeTourDivs[slideIndex].classList.add("w3-show");

    divHome.classList.remove("w3-animate-opacity");
    requestAnimationFrame(() => {
        // Trigger a reflow to restart the animation
        // void divHome.offsetWidth;
        divHome.classList.add("w3-animate-opacity");
    });
}

/**
 * Loads more images into the grid based on the current viewport width and the number of images already shown. It calculates the appropriate page size based on the screen width and displays additional hidden images accordingly. If there are no more hidden images to show, it disables the "Load More" button.
 */
function loadMore() {
    const shownImages = Array.from(gridImages1).filter(item => item.classList.contains("w3-show"));
    const hiddenImages = Array.from(gridImages1).filter(item => item.classList.contains("w3-hide"));
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    let pageSize;
    if (width <= 600) {
        pageSize = 2;
    } else if (width <= 992) {
        pageSize = 3;
    } else {
        pageSize = 4;
    }
    const imagesToShow = hiddenImages.slice(0, pageSize - shownImages.length % pageSize);

    imagesToShow.forEach(divImage => {
        divImage.classList.remove("w3-hide");
        divImage.classList.add("w3-show");
    });

    if (hiddenImages.length <= pageSize) {
        btnLoadMore.disabled = true;
    }
}

/**
 * Displays a specific page of images in the grid based on the provided index. It calculates the start and end indices for the images to display and updates their visibility accordingly. It also updates the pagination bar to highlight the current page.
 * @param {int} index - The index of the page to display. If the index is greater than 0, it will display the specified page. If the index is less than or equal to 0, it will calculate the page index based on the total number of pages and display the corresponding page.
 */
function showPage(index) {
    pageIndex = (index > 0 ? index : totalPages + index % totalPages) % totalPages;
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;

    gridImages2.forEach((divImage, index) => {
        if (index >= startIndex && index < endIndex) {
            divImage.classList.remove("w3-hide");
            divImage.classList.add("w3-show");
        } else {
            divImage.classList.remove("w3-show");
            divImage.classList.add("w3-hide");
        }
    });

    barItems.forEach(item => item.classList.remove("w3-theme-gradient"));
    barItems[pageIndex].classList.add("w3-theme-gradient");
}

/**
 * Toggles the display of an element with the specified ID. If the element is currently hidden (display: none), it will be shown (display: block), and vice versa.
 * @param {string} id - The ID of the element to toggle display for. If the element is currently hidden (display: none), it will be shown (display: block), and vice versa.
 */
function toggleDisplayById(id) {
    const element = document.getElementById(id);
    if (element.style.display === "" || element.style.display === "none") {
        element.style.display = "flex";
    } else {
        element.style.display = "none";
    }
}

/**
 * Toggles the specified classes on the element with the given ID. If the focus parameter is true, it will focus the element if the classes were added, or blur it if the classes were removed.
 * @param {string} id - The ID of the element to toggle classes on.
 * @param {string} classes - A space-separated string of class names to toggle on the element.
 * @param {boolean} [focus] - Optional parameter to determine if the element should be focused after toggling classes. Defaults to false.
 */
function toggleClassesById(id, classes, focus) {
    const element = document.getElementById(id);
    const classNames = classes.split(" ").filter(Boolean);
    const classNamesContains = classNames.every(className => element.classList.contains(className));
    classNames.forEach(className => {
        if (!element.classList.contains(className)) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
    });
    if (focus) {
        if (!classNamesContains) {
            element.focus();
        } else {
            element.blur();
        }
    }
}

/**
 * Opens a modal to display the contact name. The modal will show the contact name in a designated element.
 * @param {string} contact - The contact name to be displayed in the modal. The modal will show the contact name in a designated element.
 */
function openModalContact(contact) {
    document.getElementById("mdlContact").querySelector("span:not(.material-symbols-outlined)").lastChild.textContent = `${contact}`;
    toggleDisplayById("mdlContact");
}

/**
 * Opens a modal to display the clicked image and its alt text. The modal will show the image's source and alt text in designated elements.
 * @param {HTMLImageElement} image - The image element that was clicked to open the modal. The modal will display the image's source and alt text.
 */
function openModalImage(image) {
    document.getElementById("imgImage").src = image.src;
    document.getElementById("pImage").textContent = image.alt;
    toggleDisplayById("mdlImage");
}

/**
 * Search text functionality that toggles the visibility of the search input field and related buttons.
 * @param {HTMLAnchorElement} a - The anchor element that was clicked to trigger the search text functionality.
 */
function searchText(a) {
    const textSearchShow = document.getElementById("txtSearch").classList.contains("w3-show");
    const aHideSmall = a.classList.contains("w3-hide-small");

    if (a.id !== "btnSearch" || !aHideSmall) {
        toggleClassesById("btnNavBlock", "w3-hide-small");
        toggleClassesById("btnSearch", "w3-hide-small");
    }
    toggleClassesById("txtSearch", "w3-show", true);

    if (a.id !== "btnSearch" && !aHideSmall) {
        toggleClassesById("navBlock", "w3-show");
    } else if (textSearchShow) {
        console.log("Search button clicked, searchAction().");
    }
}

/**
 * Handles the form submission event for sending a message. It prevents the default form submission behavior, collects the form data, appends additional information (current date and time, contact), and sends the data to the server asynchronously using the Fetch API. It also provides feedback to the user by disabling the submit button and updating its text while the message is being sent.
 * @param {Event} event - The event object representing the form submission event. It is used to prevent the default form submission behavior and handle the form data asynchronously.
 */
async function sendMessage(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const button = form.querySelector("button[type='submit']");

    formData.append("FechaHora", new Date().toISOString().slice(0, 19));
    formData.append("Contact", "Webmaster");
    button.classList.add("w3-disabled");
    button.innerHTML = button.innerHTML.replace("Send Message", "Sending message...");

    try {
        const response = await fetch("/send/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(formData.entries()))
            // body: formData
            // body: new URLSearchParams(formData)
        });
        if (!response.ok) {
            const data = await response.text();
            const error = data ? `\n${data}` : '';
            // console.log(data);
            throw new Error(`Failed to get a successful response from endpoint with: ${response.status} ${response.statusText}. ${error}`);
        }

        form.reset();
    } catch (error) {
        error.message = `Error processing the '/send/message' endpoint: ${error.message} \nTry again later or report this issue to the admin.`;
        console.error(error);
        alert(`${error.message}`);
    } finally {
        button.classList.remove("w3-disabled");
        button.innerHTML = button.innerHTML.replace("Sending message...", "Send Message");
    }
}

/**
 * Event listener to close the navBlock when clicking outside of it.
 */
document.addEventListener("click", event => {
    const navBlock = document.getElementById("navBlock");
    const btnNavBlock = document.getElementById("btnNavBlock");
    if (navBlock && navBlock !== event.target && !navBlock.contains(event.target) &&
        btnNavBlock && btnNavBlock !== event.target && !btnNavBlock.contains(event.target) &&
        navBlock.classList.contains("w3-show")) {
            toggleClassesById("navBlock", "w3-show");
    }
});

/**
 * Event listener to observe sections and highlight corresponding navigation links when they are in view.
 */
document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll("body > div.w3-display-container, body > div.w3-container");
    const navBarLinks = document.querySelectorAll("div#navBar a[href]");
    const navBlockLinks = document.querySelectorAll("div#navBlock a[href]");

    const options = {
        root: null, // Observ the browser viewport
        rootMargin: "0px",
        threshold: 0.1 // Trigger when 10% of the section is visible
    };

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove 'active' class from all nav links
                navBarLinks.forEach(item => item.classList.remove("w3-theme-gradient"));
                navBlockLinks.forEach(item => item.classList.remove("w3-theme-gradient"));

                // Get the ID of the currently visible section and find the corresponding nav link
                const id = entry.target.getAttribute("id").replace("Hero", "");
                const navBarLink = document.querySelector(`div#navBar a[href="#${id}"]`);
                const navBlockLink = document.querySelector(`div#navBlock a[href="#${id}"]`);

                // Add 'active' class to the corresponding nav link
                navBarLink?.classList.add("w3-theme-gradient");
                navBlockLink?.classList.add("w3-theme-gradient");
            }
        });
    }, options);

    // Enable the observer for each section
    sections.forEach(item => observer.observe(item));
});

/**
 * Event listener for scroll events to toggle the visibility of the navigation bar and "Go to Top" button based on the scroll position.
 */
const navBar = document.getElementById("navBar");
const btnGoToTop = document.getElementById("btnGoToTop");
window.onscroll = () => {
    requestAnimationFrame(() => {
        const h = window.innerHeight - navBar.offsetHeight;
        // Check if the scroll position is greater than the height of the viewport minus the navBar height
        if (document.documentElement.scrollTop > h || document.body.scrollTop > h) {
            // document.documentElement.scrollTop for Chrome, Firefox, IE and Opera and document.body.scrollTop for Safari
            if (!navBar.classList.contains("w3-card") && !btnGoToTop.classList.contains("w3-show")) {
                toggleClassesById("navBar", "w3-card w3-animate-top w3-white");
                toggleClassesById("btnGoToTop", "w3-show");
            }
        } else {
            if (navBar.classList.contains("w3-card") && btnGoToTop.classList.contains("w3-show")) {
                toggleClassesById("navBar", "w3-card w3-animate-top w3-white");
                toggleClassesById("btnGoToTop", "w3-show");
            }
        }
    });
};