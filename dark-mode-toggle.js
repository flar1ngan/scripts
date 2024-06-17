function colorModeToggle() {
  const htmlElement = document.documentElement;
  const computed = getComputedStyle(htmlElement);
  let toggleEl;
  let togglePressed = "false";  // Default to 'color' palette not pressed

  const scriptTag = document.querySelector("[tr-color-vars]");
  if (!scriptTag) {
    console.warn("Script tag with tr-color-vars attribute not found");
    return;
  }

  function attr(defaultVal, attrVal) {
    const defaultValType = typeof defaultVal;
    if (typeof attrVal !== "string" || attrVal.trim() === "") return defaultVal;
    if (attrVal === "true" && defaultValType === "boolean") return true;
    if (attrVal === "false" && defaultValType === "boolean") return false;
    if (isNaN(attrVal) && defaultValType === "string") return attrVal;
    if (!isNaN(attrVal) && defaultValType === "number") return +attrVal;
    return defaultVal;
  }

  let colorModeDuration = attr(0.5, scriptTag.getAttribute("duration"));
  let colorModeEase = attr("power1.out", scriptTag.getAttribute("ease"));

  const cssVariables = scriptTag.getAttribute("tr-color-vars");
  if (!cssVariables.length) {
    console.warn("Value of tr-color-vars attribute not found");
    return;
  }

  let lightColors = {};
  cssVariables.split(",").forEach(function (item) {
    let lightValue = computed.getPropertyValue(`--color--${item}`);
    if (lightValue.length) {
      lightColors[`--color--${item}`] = lightValue;
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

  function goLight(light, animate) {
    if (light) {
      localStorage.setItem("dark-mode", "false");
      htmlElement.classList.remove("dark-mode");
      setColors(lightColors, animate);
      togglePressed = "false";
    } else {
      localStorage.setItem("dark-mode", "true");
      htmlElement.classList.add("dark-mode");
      setColors({}, animate);
      togglePressed = "true";
    }
    if (typeof toggleEl !== "undefined") {
      toggleEl.forEach(function (element) {
        element.setAttribute("aria-pressed", togglePressed);
      });
    }
  }

  goLight(true, false);  // Always start with 'color' palette

  window.addEventListener("DOMContentLoaded", (event) => {
    toggleEl = document.querySelectorAll("[tr-color-toggle]");
    toggleEl.forEach(function (element) {
      element.setAttribute("aria-label", "View Light Mode");
      element.setAttribute("role", "button");
      element.setAttribute("aria-pressed", togglePressed);
    });
    toggleEl.forEach(function (element) {
      element.addEventListener("click", function () {
        let darkClass = htmlElement.classList.contains("dark-mode");
        darkClass ? goLight(true, true) : goLight(false, true);
      });
    });
  });
}

colorModeToggle();
