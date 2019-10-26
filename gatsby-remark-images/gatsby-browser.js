const {
  DEFAULT_OPTIONS,
  imageClass,
  imageBackgroundClass,
} = require("./constants");

exports.onInitialClientRender = function onInitialClientRender(apiCallbackContext, pluginOptions) {
  // const options = Object.assign({}, DEFAULT_OPTIONS, pluginOptions);
  document.addEventListener('load', event => {
    if (event.target instanceof HTMLImageElement && event.target.classList.contains(imageClass)) {
      fadeOutBackground(event.target);
    }
  }, true);

  document.querySelectorAll(`img.${imageClass}`).forEach(img => {
    if (img.complete) {
      fadeOutBackground(img);
    }
  });
}

function fadeOutBackground(imageElement) {
  const backgroundElement = imageElement.previousElementSibling;
  imageElement.style.opacity = 0;
  imageElement.style.transition = "opacity 0.5s";
  if (backgroundElement && backgroundElement.classList.contains(imageBackgroundClass)) {
    backgroundElement.style.transition = "opacity 0.5s 0.5s";
    backgroundElement.style.opacity = 0;
  }

  imageElement.style.opacity = 1;
  imageElement.style.color = "inherit";
}
