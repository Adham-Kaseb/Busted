// Theme Toggle Logic
const themeToggleBtn = document.getElementById("theme-toggle");
const htmlEl = document.documentElement;

// Check local storage or system preference
const currentTheme = localStorage.getItem("theme")
  ? localStorage.getItem("theme")
  : null;
const systemPrefersDark = window.matchMedia(
  "(prefers-color-scheme: dark)",
).matches;

if (currentTheme) {
  htmlEl.setAttribute("data-theme", currentTheme);
  updateToggleIcon(currentTheme);
} else if (systemPrefersDark) {
  htmlEl.setAttribute("data-theme", "dark");
  updateToggleIcon("dark");
}

if (themeToggleBtn) {
  // Safety check as busted page might not have the right id toggle but let's assume it does.
  themeToggleBtn.addEventListener("click", () => {
    let theme = htmlEl.getAttribute("data-theme");
    if (theme === "dark") {
      htmlEl.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
      updateToggleIcon("light");
    } else {
      htmlEl.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      updateToggleIcon("dark");
    }
  });
}

function updateToggleIcon(theme) {
  if (!themeToggleBtn) return;
  const icon = themeToggleBtn.querySelector("i");
  if (theme === "dark") {
    icon.classList.remove("bx-moon");
    icon.classList.add("bx-sun");
  } else {
    icon.classList.remove("bx-sun");
    icon.classList.add("bx-moon");
  }
}

// Active Nav Link on Scroll
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-links li a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;

    if (pageYOffset >= sectionTop - 200) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// Hamburger Menu Toggle
const hamburger = document.querySelector(".hamburger");
const navLinksContainer = document.querySelector(".nav-links");

if (hamburger && navLinksContainer) {
  hamburger.addEventListener("click", () => {
    navLinksContainer.classList.toggle("active");
  });

  // Close menu when a link is clicked
  const navItems = navLinksContainer.querySelectorAll("a");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navLinksContainer.classList.remove("active");
    });
  });
}

// Global Data
let bustedData = JSON.parse(localStorage.getItem("bustedData")) || [];

// Mock Data & LocalStorage Logic for Busted people
const bustedListContainer = document.getElementById("full-busted-list");
const addForm = document.getElementById("add-busted-form");

if (bustedListContainer) {
  // Initial render
  renderBustedList(bustedData);

  function renderBustedList(data) {
    if (data.length === 0) {
      bustedListContainer.innerHTML = `
        <div class="empty-state">
          <i class='bx bx-ghost'></i>
          <h3>لا يوجد أي سجلات مطابقة</h3>
          <p>السجل الجنائي نظيف حالياً، قم بإضافة مجرم جديد.</p>
          <button class="btn btn-outline" onclick="document.getElementById('busted-name').focus()">إضافة سجل جديد</button>
        </div>
      `;
      return;
    }

    bustedListContainer.innerHTML = data
      .map((person) => {
        let imageHtml = "";
        if (person.images && person.images.length > 0) {
          const slidesHtml = person.images
            .map(
              (img, idx) => `
              <div class="slide" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: ${idx === 0 ? 1 : 0}; transition: opacity 0.3s; z-index: ${idx === 0 ? 1 : 0};">
                  <img src="${img}" alt="Evidence" onclick="openLightboxFromId(${person.id}, ${idx})" style="width: 100%; height: 100%; object-fit: contain; cursor: pointer; background: #080c16; border-top-left-radius: 16px; border-top-right-radius: 16px; border-bottom: 2px solid var(--accent-red);" />
                  <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.6); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: bold; font-family: inherit; z-index: 10;">صورة ${idx + 1} من ${person.images.length}</div>
              </div>`,
            )
            .join("");
          const arrowsHtml =
            person.images.length > 1
              ? `
              <button onclick="changeSlide(${person.id}, -1)" style="position: absolute; top: 50%; right: 10px; transform: translateY(-50%); background: rgba(0,0,0,0.6); color: white; border: none; cursor: pointer; border-radius: 50%; width: 30px; height: 30px; z-index: 20; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: background 0.3s;"><i class='bx bx-chevron-right'></i></button>
              <button onclick="changeSlide(${person.id}, 1)" style="position: absolute; top: 50%; left: 10px; transform: translateY(-50%); background: rgba(0,0,0,0.6); color: white; border: none; cursor: pointer; border-radius: 50%; width: 30px; height: 30px; z-index: 20; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: background 0.3s;"><i class='bx bx-chevron-left'></i></button>
          `
              : "";
          imageHtml = `<div class="busted-evidence slider-container" id="slider-${person.id}" data-current-index="0" style="position: relative; width: 100%; height: 300px; background: #080c16; border-top-left-radius: 16px; border-top-right-radius: 16px; overflow: hidden;">${slidesHtml}${arrowsHtml}</div>`;
        } else if (person.image) {
          imageHtml = `<div class="busted-evidence" style="background: #080c16; border-top-left-radius: 16px; border-top-right-radius: 16px;"><img src="${person.image}" alt="Evidence" onclick="openLightboxFromId(${person.id}, 0)" style="width: 100%; height: 300px; object-fit: contain; cursor: pointer; border-bottom: 2px solid var(--accent-red);" /></div>`;
        }
        // Define tags based on platform/class
        let tagsHtml = `<span class="platform ${person.pClass}">#${person.platform}</span>`;
        if (person.pClass === "linkedin")
          tagsHtml += `<span class="platform" style="background:var(--bg-color); color:var(--text-main); border:1px solid var(--border-color)">#احتراف_وهمي</span>`;
        if (person.pClass === "haram")
          tagsHtml += `<span class="platform" style="background:var(--bg-color); color:var(--text-main); border:1px solid var(--border-color)">#هرم_بلير</span>`;
        if (person.pClass === "almdrasa")
          tagsHtml += `<span class="platform" style="background:var(--bg-color); color:var(--text-main); border:1px solid var(--border-color)">#سبوبة_المدرسة</span>`;

        return `
          <div class="bust-card caution-tape-bg" id="card-${person.id}">
              ${imageHtml}
              <div class="bust-info card-actions-container" style="padding-top: 2rem;">
                  <div class="card-actions" style="top: 1rem; right: 1rem;">
                      <button onclick="toggleEdit(${person.id})" title="تعديل السجل" class="action-btn edit-btn" id="edit-btn-${person.id}">
                         <i class='bx bx-edit-alt'></i>
                      </button>
                      <button onclick="deleteBusted(${person.id})" title="حذف السجل" class="action-btn delete-btn">
                         <i class='bx bx-trash'></i>
                      </button>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <h3 class="editable-field" id="name-${person.id}" onblur="updateBusted(${person.id}, 'name', this.innerText)" style="font-size: 1.5rem; color: var(--accent-red); margin: 0;">${person.name}</h3>
                    <div class="busted-stamp" style="position: static; transform: rotate(0); padding: 0.2rem 0.8rem; font-size: 0.9rem;">مقفوش</div>
                  </div>
                  
                  <div class="tags-container" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
                    ${tagsHtml}
                  </div>
                  
                  <div style="background: var(--bg-color); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); min-height: 80px;">
                    <p class="editable-field" id="desc-${person.id}" onblur="updateBusted(${person.id}, 'desc', this.innerText)" style="margin: 0; line-height: 1.6;">${person.desc}</p>
                  </div>
              </div>
          </div>
          `;
      })
      .join("");
  }

  renderBustedList(bustedData);

  // Expose delete to global scope
  window.deleteBusted = function (id) {
    if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      bustedData = bustedData.filter((p) => p.id !== id);
      localStorage.setItem("bustedData", JSON.stringify(bustedData));
      renderBustedList(bustedData);
    }
  };

  // Expose update to global scope for contenteditable
  window.updateBusted = function (id, field, value) {
    const person = bustedData.find((p) => p.id === id);
    if (person && person[field] !== value.trim()) {
      person[field] = value.trim();
      localStorage.setItem("bustedData", JSON.stringify(bustedData));
    }
  };

  // Toggle Edit Mode Logic
  window.toggleEdit = function (id) {
    const nameEl = document.getElementById(`name-${id}`);
    const descEl = document.getElementById(`desc-${id}`);
    const editBtn = document.getElementById(`edit-btn-${id}`);
    const cardEl = document.getElementById(`card-${id}`);

    const isEditing = nameEl.getAttribute("contenteditable") === "true";

    if (isEditing) {
      // Save changes
      nameEl.setAttribute("contenteditable", "false");
      descEl.setAttribute("contenteditable", "false");
      nameEl.classList.remove("editing");
      descEl.classList.remove("editing");
      cardEl.classList.remove("is-editing");

      // Update icon to edit
      editBtn.innerHTML = "<i class='bx bx-edit-alt'></i>";
      editBtn.classList.remove("save-btn");

      // Save to localStorage
      window.updateBusted(id, "name", nameEl.innerText);
      window.updateBusted(id, "desc", descEl.innerText);
    } else {
      // Start editing
      nameEl.setAttribute("contenteditable", "true");
      descEl.setAttribute("contenteditable", "true");
      nameEl.classList.add("editing");
      descEl.classList.add("editing");
      cardEl.classList.add("is-editing");

      // Focus name first
      nameEl.focus();

      // Select all text in name element to make Editing easier
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(nameEl);
      selection.removeAllRanges();
      selection.addRange(range);

      // Update icon to save
      editBtn.innerHTML = "<i class='bx bx-check'></i>";
      editBtn.classList.add("save-btn");
    }
  };

  // Slider Logic
  window.changeSlide = function (id, direction) {
    const container = document.getElementById(`slider-${id}`);
    if (!container) return;
    const slides = container.querySelectorAll(".slide");
    if (slides.length <= 1) return;

    let currentIndex = parseInt(
      container.getAttribute("data-current-index") || "0",
    );

    // Hide current
    slides[currentIndex].style.opacity = "0";
    slides[currentIndex].style.zIndex = "0";

    // Calculate next
    currentIndex = (currentIndex + direction + slides.length) % slides.length;

    // Show next
    slides[currentIndex].style.opacity = "1";
    slides[currentIndex].style.zIndex = "1";

    container.setAttribute("data-current-index", currentIndex);
  };

  // Drag and Drop Logic
  let uploadedImagesBase64 = [];
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("busted-image");
  const previewContainer = document.getElementById("image-preview-container");

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.style.borderColor = "var(--primary)";
      dropzone.style.background = "rgba(59, 130, 246, 0.1)";
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.style.borderColor = "var(--border-color)";
      dropzone.style.background = "var(--bg-alt)";
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.style.borderColor = "var(--border-color)";
      dropzone.style.background = "var(--bg-alt)";
      handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener("change", (e) => {
      handleFiles(e.target.files);
    });
  }

  function handleFiles(files) {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target.result;
          uploadedImagesBase64.push(base64);

          // Create preview
          const img = document.createElement("img");
          img.src = base64;
          img.style.width = "60px";
          img.style.height = "60px";
          img.style.objectFit = "cover";
          img.style.borderRadius = "6px";
          img.style.border = "1px solid var(--border-color)";
          previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (addForm) {
    addForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("busted-name").value;
      const platformVal = document.getElementById("busted-platform").value;
      const desc = document.getElementById("busted-desc").value;

      if (name && platformVal && desc) {
        const [platformDisplay, pClass] = platformVal.split("|");

        const newRecord = {
          id: Date.now(),
          name: name,
          platform: platformDisplay,
          pClass: pClass,
          desc: desc,
          images:
            uploadedImagesBase64.length > 0 ? [...uploadedImagesBase64] : null,
        };

        bustedData.unshift(newRecord);
        localStorage.setItem("bustedData", JSON.stringify(bustedData));
        renderBustedList(bustedData);

        // Reset form and previews
        addForm.reset();
        uploadedImagesBase64 = [];
        if (previewContainer) previewContainer.innerHTML = "";
      }
    });
  }

  // Search Functionality
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = bustedData.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.platform.toLowerCase().includes(query) ||
          p.desc.toLowerCase().includes(query),
      );
      renderBustedList(filtered);
    });
  }
}

// Landing Page: Render Recent Busts
const recentBustsGrid = document.getElementById("recent-busts-grid");
if (recentBustsGrid) {
  if (bustedData.length === 0) {
    recentBustsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; background: transparent; border: 1px dashed rgba(255,255,255,0.2);">
                <i class='bx bx-search-alt-2'></i>
                <h3>أدهم لسه بيبدأ الرصد</h3>
                <p>مفيش حد اتقفش لسه.. خليك أول واحد يبلغ عن نصاب!</p>
            </div>
        `;
  } else {
    // Get top 3 latest
    const recentData = bustedData.slice(0, 3);

    recentBustsGrid.innerHTML = recentData
      .map((person) => {
        let imageHtml = "";
        if (person.images && person.images.length > 0) {
          // Pick the first image to show on the landing page as a thumbnail
          imageHtml = `<div class="busted-evidence" style="background: #080c16; border-top-left-radius: 16px; border-top-right-radius: 16px;"><img src="${person.images[0]}" alt="Evidence" onclick="openLightboxFromId(${person.id}, 0)" style="width: 100%; height: 300px; object-fit: contain; cursor: pointer; border-bottom: 2px solid var(--accent-red);" /></div>`;
        } else if (person.image) {
          imageHtml = `<div class="busted-evidence" style="background: #080c16; border-top-left-radius: 16px; border-top-right-radius: 16px;"><img src="${person.image}" alt="Evidence" onclick="openLightboxFromId(${person.id}, 0)" style="width: 100%; height: 300px; object-fit: contain; cursor: pointer; border-bottom: 2px solid var(--accent-red);" /></div>`;
        }

        // Define tags based on platform/class
        let tagsHtml = `<span class="platform ${person.pClass}">#${person.platform}</span>`;

        return `
            <div class="bust-card caution-tape-bg">
              ${imageHtml}
              <div class="bust-info" style="padding-top: 2rem;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <h3 style="font-size: 1.5rem; color: var(--accent-red); margin: 0;">${person.name}</h3>
                    <div class="busted-stamp" style="position: static; transform: rotate(0); padding: 0.2rem 0.8rem; font-size: 0.9rem;">مقفوش</div>
                  </div>
                  
                  <div class="tags-container" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
                    ${tagsHtml}
                  </div>
                  
                  <div style="background: var(--bg-color); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); min-height: 80px;">
                    <p style="margin: 0; line-height: 1.6;">${person.desc}</p>
                  </div>
              </div>
            </div>
            `;
      })
      .join("");
  }
}

// Admin Mode Toggle (Press 'd' for 1 second)
let dKeyPressTimer;
let isDKeyPressed = false;

document.addEventListener("keydown", (e) => {
  // Only trigger if not focused in an input/textarea
  if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

  if (e.key.toLowerCase() === "d" && !isDKeyPressed) {
    isDKeyPressed = true;
    dKeyPressTimer = setTimeout(() => {
      document.body.classList.toggle("admin-mode");
    }, 1000);
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key.toLowerCase() === "d") {
    isDKeyPressed = false;
    clearTimeout(dKeyPressTimer);
  }
});

// Lightbox State
let currentLightboxImages = [];
let currentLightboxIndex = 0;
let lightboxStartX = 0;
let lightboxEndX = 0;

window.openLightboxFromId = function (id, index) {
  const person = bustedData.find((p) => p.id === id);
  if (!person) return;

  if (person.images && person.images.length > 0) {
    currentLightboxImages = person.images;
  } else if (person.image) {
    currentLightboxImages = [person.image];
  } else {
    return;
  }

  currentLightboxIndex = index || 0;
  updateLightboxView();

  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    lightbox.style.display = "flex";
    setTimeout(() => {
      lightbox.classList.add("active");
    }, 10);
    document.body.style.overflow = "hidden";
  }
};

window.updateLightboxView = function () {
  const lightboxImg = document.getElementById("lightbox-img");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");
  const counter = document.getElementById("lightbox-counter");

  if (lightboxImg && currentLightboxImages.length > 0) {
    lightboxImg.src = currentLightboxImages[currentLightboxIndex];

    if (currentLightboxImages.length > 1) {
      if (prevBtn) prevBtn.style.display = "flex";
      if (nextBtn) nextBtn.style.display = "flex";
      if (counter) {
        counter.style.display = "block";
        counter.innerText = `صورة ${currentLightboxIndex + 1} من ${currentLightboxImages.length}`;
      }
    } else {
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
      if (counter) counter.style.display = "none";
    }
  }
};

window.changeLightboxSlide = function (direction) {
  if (currentLightboxImages.length <= 1) return;

  currentLightboxIndex += direction;
  if (currentLightboxIndex < 0) {
    currentLightboxIndex = currentLightboxImages.length - 1;
  } else if (currentLightboxIndex >= currentLightboxImages.length) {
    currentLightboxIndex = 0;
  }

  updateLightboxView();
};

window.closeLightbox = function (event) {
  const lightbox = document.getElementById("lightbox");
  if (
    event &&
    event.target !== lightbox &&
    !event.target.classList.contains("lightbox-close")
  ) {
    return;
  }

  if (lightbox) {
    lightbox.classList.remove("active");
    setTimeout(() => {
      lightbox.style.display = "none";
      document.body.style.overflow = "auto";
    }, 300);
  }
};

// Swiping Logic for Lightbox
const lightboxImgEl = document.getElementById("lightbox-img");
if (lightboxImgEl) {
  lightboxImgEl.addEventListener("touchstart", (e) => {
    lightboxStartX = e.changedTouches[0].screenX;
  });

  lightboxImgEl.addEventListener("touchend", (e) => {
    lightboxEndX = e.changedTouches[0].screenX;
    handleLightboxSwipe();
  });
}

function handleLightboxSwipe() {
  if (currentLightboxImages.length <= 1) return;

  const swipeThreshold = 50;
  if (lightboxEndX < lightboxStartX - swipeThreshold) {
    // Swipe left -> Next image (RTL convention)
    changeLightboxSlide(-1);
  } else if (lightboxEndX > lightboxStartX + swipeThreshold) {
    // Swipe right -> Prev image
    changeLightboxSlide(1);
  }
}
