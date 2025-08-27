// ====== Global Variables ======
let shortURLsWrapper = document.querySelector(".url-shorten-results");
let shortUrlForm = document.querySelector("#url-shorten-form");
let submitButton = shortUrlForm.querySelector("button");
let input = shortUrlForm.querySelector(".url-input");
let alertMessage = shortUrlForm.querySelector(".alert");
let savedURLs = JSON.parse(localStorage.getItem("saved")) || [];

// ====== Bitly Token ======
const BITLY_TOKEN = "4a319b9a995d653a7dea5746dc7cb17490ae58ba"; // <-- Replace with your token

// ====== Build Short URL HTML Structure ======
function generatedShortUrlHtml(id, originalURL, shortUrl) {
  shortURLsWrapper.insertAdjacentHTML(
    "beforeend",
    `
  <div class="url-shorten-result" id='${id}'>
    <div class="old-url">
      <p><a href="${originalURL}" target="_blank">${originalURL}</a></p>
    </div>
    <div class="new-url">
      <p><a href="${shortUrl}" target="_blank">${shortUrl}</a></p>
      <div class="options">
        <button type="button" class="copy-new-url btn btn-sm scale-effect">copy</button>
        <button type="button" class="delete-url scale-effect">
          <i class="fa-regular fa-trash-can icon"></i>
        </button>
      </div>
    </div>
  </div>`
  );
  removeURL();
  copyURL();
  removeAllGeneratedURLs();
}

// ====== Insert After Helper ======
function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

// ====== Delete All URLs Button ======
function removeAllGeneratedURLs() {
  if (shortURLsWrapper.querySelectorAll(".url-shorten-result").length >= 2) {
    if (shortURLsWrapper.querySelector(".delete-all-urls")) {
      shortURLsWrapper.querySelector(".delete-all-urls").remove();
    }
    let button = document.createElement("button");
    button.type = "button";
    button.classList = "btn btn-sm delete-all-urls scale-effect";
    button.textContent = "delete all";
    insertAfter(button, shortURLsWrapper.lastElementChild);
    let deleteAll = shortURLsWrapper.querySelector(".delete-all-urls");
    deleteAll.addEventListener("click", () => {
      shortURLsWrapper.innerHTML = "";
      savedURLs = [];
      localStorage.removeItem("saved");
    });
  } else {
    if (shortURLsWrapper.querySelector(".delete-all-urls")) {
      shortURLsWrapper.querySelector(".delete-all-urls").remove();
    }
  }
}

// ====== Remove Single URL ======
function removeURL() {
  let deleteURLButton = shortURLsWrapper.querySelectorAll(".delete-url");
  deleteURLButton.forEach((button) => {
    button.addEventListener("click", () => {
      let linkId = button.closest(".url-shorten-result").id;
      button.closest(".url-shorten-result").remove();
      const index = savedURLs.findIndex((url) => url.id == linkId);
      savedURLs.splice(index, 1);
      localStorage.setItem("saved", JSON.stringify(savedURLs));
      removeAllGeneratedURLs();
    });
  });
}

// ====== Copy URL ======
function copyURL() {
  let copyButtons = shortURLsWrapper.querySelectorAll(".copy-new-url");
  copyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      let urlText = button.closest(".url-shorten-result").querySelector(".new-url p").textContent;
      const area = document.createElement("textarea");
      document.body.appendChild(area);
      area.value = urlText;
      area.select();
      document.execCommand("copy");
      button.classList.add("copied");
      button.innerHTML = "copied!";
      setTimeout(() => {
        button.classList.remove("copied");
        button.innerHTML = "copy";
      }, 1500);
      document.body.removeChild(area);
    });
  });
}

// ====== Generate Random IDs ======
function reandomIds() {
  let currentTime = Date.now();
  let currentTimeString = currentTime.toString(32).slice(0, 8);
  let reandomNumber = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString().slice(0, 4);
  return `${currentTimeString}-${reandomNumber}`;
}

// ====== Bitly API Call ======
const makeShortURL = async (userUrl) => {
  try {
    let response = await fetch("https://api-ssl.bitly.com/v4/shorten", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${BITLY_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ long_url: userUrl })
    });

    let data = await response.json();

    if (data.link) {
      let originalURL = userUrl;
      let shortUrl = data.link;

      let generatedURL = {
        id: reandomIds(),
        originalURL,
        shortUrl
      };

      shortUrlForm.classList.add("success");
      submitButton.innerHTML = `<i class="fa-solid fa-check icon"></i> shortened!`;
      setTimeout(() => {
        shortUrlForm.classList.remove("success");
        submitButton.innerHTML = "shorten it!";
      }, 1700);

      generatedShortUrlHtml(reandomIds(), originalURL, shortUrl);
      savedURLs.push(generatedURL);
      localStorage.setItem("saved", JSON.stringify(savedURLs));
    } else {
      alerts(data.message || "Error shortening URL");
    }
  } catch (error) {
    alerts("Sorry, unknown error happened please try again later.");
  }
};

// ====== Form Submission ======
shortUrlForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let inputValue = input.value.trim().replace(" ", "");
  submitButton.innerHTML = `<i class="fa-solid fa-spinner icon fa-spin"></i> Generating...`;
  makeShortURL(inputValue);
  shortUrlForm.reset();
});

// ====== Show Alerts ======
function alerts(message) {
  shortUrlForm.classList.add("empty");
  alertMessage.textContent = message;
  setTimeout(() => {
    shortUrlForm.classList.remove("empty");
  }, 5000);
}

// ====== Header Navigation Expand ======
function expandNavgation() {
  let navgation = document.querySelector(".header .main-navgation");
  let toggleMenu = document.querySelector(".header .burger-menu");
  let icon = toggleMenu.querySelector(".icon");
  let closed = true;

  toggleMenu.addEventListener("click", () => {
    if (icon.classList.contains("fa-bars")) {
      icon.className = "fa-regular fa-xmark icon";
    } else {
      icon.className = "fa-regular fa-bars icon";
    }

    let navgationHeight = navgation.scrollHeight;
    if (closed) {
      navgation.style.height = `${navgationHeight}px`;
    } else {
      navgation.style.height = "";
    }
    closed = !closed;
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 992) {
      icon.className = "fa-regular fa-bars icon";
      navgation.style.height = "";
      closed = true;
    }
  });
}
expandNavgation();

// ====== Load saved URLs on page load ======
savedURLs.forEach(url => {
  generatedShortUrlHtml(url.id, url.originalURL, url.shortUrl);
});
