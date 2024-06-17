function colorModeToggle() {
    function attr(defaultVal, attrVal) {
        const defaultValType = typeof defaultVal;
        if (typeof attrVal !== "string" || attrVal.trim() === "") return defaultVal;
        if (attrVal === "true" && defaultValType === "boolean") return true;
        if (attrVal === "false" && defaultValType === "boolean") return false;
        if (isNaN(attrVal) && defaultValType === "string") return attrVal;
        if (!isNaN(attrVal) && defaultValType === "number") return +attrVal;
        return defaultVal;
    }

    const htmlElement = document.documentElement;
    const computed = getComputedStyle(htmlElement);
    let toggleEl;
    let togglePressed = "false";

    const scriptTag = document.querySelector("[tr-color-vars]");
    if (!scriptTag) {
        console.warn("Script tag with tr-color-vars attribute not found");
        return;
    }

    let colorModeDuration = attr(0.5, scriptTag.getAttribute("duration"));
    let colorModeEase = attr("power1.out", scriptTag.getAttribute("ease"));

    const cssVariables = scriptTag.getAttribute("tr-color-vars");
    if (!cssVariables.length) {
        console.warn("Value of tr-color-vars attribute not found");
        return;
    }

    let lightColors = {};
    let darkColors = {};
    cssVariables.split(",").forEach(function (item) {
        let lightValue = computed.getPropertyValue(`--color--${item}`);
        let darkValue = computed.getPropertyValue(`--dark--${item}`);
        if (lightValue.length) {
            if (!darkValue.length) darkValue = lightValue;
            lightColors[`--color--${item}`] = lightValue;
            darkColors[`--dark--${item}`] = darkValue;
        }
    });

    if (!Object.keys(lightColors).length) {
        console.warn("No variables found matching tr-color-vars attribute value");
        return;
    }

    function setColors(colorObject, animate) {
        if (typeof gsap !== "undefined" && animate) {
            gsap.to(htmlElement, {
                ...colorObject,
                duration: colorModeDuration,
                ease: colorModeEase
            });
        } else {
            Object.keys(colorObject).forEach(function (key) {
                htmlElement.style.setProperty(key, colorObject[key]);
            });
        }
    }

    function setInvertFilter(dark) {
        const invertImages = document.querySelectorAll('.invert-color');
        invertImages.forEach(function (img) {
            if (dark) {
                img.style.filter = "invert(1)";
            } else {
                img.style.filter = "invert(0)";
            }
        });
    }

    function goDark(dark, animate) {
        if (dark) {
            localStorage.setItem("dark-mode", "true");
            htmlElement.classList.add("dark-mode");
            setColors(darkColors, animate);
            setInvertFilter(true);
            togglePressed = "true";
        } else {
            localStorage.setItem("dark-mode", "false");
            htmlElement.classList.remove("dark-mode");
            setColors(lightColors, animate);
            setInvertFilter(false);
            togglePressed = "false";
        }
        if (typeof toggleEl !== "undefined") {
            toggleEl.forEach(function (element) {
                element.setAttribute("aria-pressed", togglePressed);
            });
        }
    }

    function checkPreference(e) {
        goDark(e.matches, false);
    }

    const colorPreference = window.matchMedia("(prefers-color-scheme: dark)");
    colorPreference.addEventListener("change", (e) => {
        checkPreference(e);
    });

    let storagePreference = localStorage.getItem("dark-mode");
    if (storagePreference !== null) {
        storagePreference === "true" ? goDark(true, false) : goDark(false, false);
    } else {
        checkPreference(colorPreference);
    }

    window.addEventListener("DOMContentLoaded", (event) => {
        toggleEl = document.querySelectorAll("[tr-color-toggle]");
        toggleEl.forEach(function (element) {
            element.setAttribute("aria-label", "View Dark Mode");
            element.setAttribute("role", "button");
            element.setAttribute("aria-pressed", togglePressed);
        });
        toggleEl.forEach(function (element) {
            element.addEventListener("click", function () {
                let darkClass = htmlElement.classList.contains("dark-mode");
                darkClass ? goDark(true, true) : goDark(false, true);
            });
        });
    });
}

colorModeToggle();
