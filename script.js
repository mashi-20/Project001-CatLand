const cats = [];
let mouseX = 0, mouseY = 0;
let pendingCatSrc = "", pendingCatType = "";
let isRenaming = false;
let renamingIndex = -1;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function openModal() {
  document.getElementById("catModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("catModal").style.display = "none";
}

function closeNameModal() {
  document.getElementById("nameModal").style.display = "none";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function selectCat(src) {
  isRenaming = false;
  pendingCatSrc = src;
  pendingCatType = src.split('_')[0];
  document.getElementById("catTypeName").innerText = pendingCatType;
  document.getElementById("catNameInput").value = "";
  closeModal();
  document.getElementById("nameModal").style.display = "flex";
}

function confirmName() {
  const name = document.getElementById("catNameInput").value || "Unnamed";

  if (isRenaming) {
    cats[renamingIndex].name = name;
    cats[renamingIndex].tag.innerText = name;
    updateDashboard();
    closeNameModal();
    return;
  }

  closeNameModal();

  const cat = document.createElement("img");
  cat.src = pendingCatSrc;
  cat.classList.add("cat");
  cat.style.left = Math.random() * (window.innerWidth - 100) + "px";
  cat.style.top = Math.random() * (window.innerHeight - 100) + "px";

  const nameTag = document.createElement("div");
  nameTag.className = "cat-name";
  nameTag.innerText = name;
  document.body.appendChild(nameTag);

  makeDraggable(cat, nameTag);

  cat.addEventListener("click", () => {
    const catObj = getCatObj(cat);
    if (!catObj.pause) {
      catObj.pause = true;
      showHeartAbove(cat);
      setTimeout(() => catObj.pause = false, 1000);
    }
  });

  document.body.appendChild(cat);
  cats.push({ element: cat, pause: false, name, type: pendingCatType, tag: nameTag });
  updateDashboard();
  document.querySelector('.open-btn').textContent = "Another Cat?";

  setInterval(() => {
    const catObj = getCatObj(cat);
    if (!catObj.pause) {
      if (!followOtherCats(cat)) {
        if (!followCursor(cat)) {
          moveCatRandomly(cat);
        }
      }
    }
    checkInteractions();
  }, 2000);
}

function toggleDashboard() {
  const dashboard = document.getElementById("dashboard");
  const toggleBtn = document.getElementById("toggleDashboardBtn");

  dashboard.classList.toggle("minimized");

  if (dashboard.classList.contains("minimized")) {
    toggleBtn.innerText = "⮞";
    toggleBtn.style.right = "0";
  } else {
    toggleBtn.innerText = "⮜";
    toggleBtn.style.right = "220px";
  }
}

function getCatObj(cat) {
  return cats.find(c => c.element === cat);
}

function renameCat(index) {
  isRenaming = true;
  renamingIndex = index;
  document.getElementById("catTypeName").innerText = cats[index].type;
  document.getElementById("catNameInput").value = cats[index].name;
  document.getElementById("nameModal").style.display = "flex";
}

function updateDashboard() {
  const list = document.getElementById("catList");
  list.innerHTML = "";
  cats.forEach((c, index) => {
    const item = document.createElement("li");
    item.innerHTML = `
      ${capitalize(c.type)} - ${c.name}
      <button onclick="renameCat(${index})">✏️</button>
    `;
    list.appendChild(item);
  });
}

function moveCatRandomly(cat) {
  const maxX = window.innerWidth - 100;
  const maxY = window.innerHeight - 100;
  const newX = Math.random() * maxX;
  const newY = Math.random() * maxY;
  const currentX = parseFloat(cat.style.left) || 0;

  cat.style.transform = newX > currentX ? "scaleX(-1)" : "scaleX(1)";
  cat.style.left = newX + "px";
  cat.style.top = newY + "px";
}

function checkInteractions() {
  for (let i = 0; i < cats.length; i++) {
    const cat1 = cats[i];
    for (let j = i + 1; j < cats.length; j++) {
      const cat2 = cats[j];
      const dx = getCenterX(cat1.element) - getCenterX(cat2.element);
      const dy = getCenterY(cat1.element) - getCenterY(cat2.element);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const loveChance = Math.random();
        if (loveChance < 0.05) {
          showHeartAbove(cat1.element);
          showHeartAbove(cat2.element);
        } else if (loveChance < 0.1) {
          showHeartAbove(Math.random() < 0.5 ? cat1.element : cat2.element);
        }
        cat1.pause = true;
        cat2.pause = true;
        setTimeout(() => {
          cat1.pause = false;
          cat2.pause = false;
        }, 3000);
      }
    }
  }
}

function followCursor(cat) {
  const cx = getCenterX(cat);
  const cy = getCenterY(cat);
  const dx = mouseX - cx;
  const dy = mouseY - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 120) {
    cat.style.left = (mouseX - 40) + "px";
    cat.style.top = (mouseY - 40) + "px";
    cat.style.transform = dx > 0 ? "scaleX(-1)" : "scaleX(1)";
    getCatObj(cat).pause = true;
    setTimeout(() => getCatObj(cat).pause = false, 2000);
    return true;
  }
  return false;
}

function followOtherCats(cat) {
  const self = getCatObj(cat);
  for (let other of cats) {
    if (other.element !== cat) {
      const dx = getCenterX(cat) - getCenterX(other.element);
      const dy = getCenterY(cat) - getCenterY(other.element);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 100 && dist < 200) {
        cat.style.left = other.element.style.left;
        cat.style.top = other.element.style.top;
        cat.style.transform = dx > 0 ? "scaleX(1)" : "scaleX(-1)";
        self.pause = true;
        setTimeout(() => self.pause = false, 3000);
        return true;
      }
    }
  }
  return false;
}

function showHeartAbove(cat) {
  const heart = document.createElement("img");
  heart.src = "cat_heart.png";
  heart.className = "heart";
  heart.style.left = getCenterX(cat) - 12 + "px";
  heart.style.top = getCenterY(cat) - 50 + "px";
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 1000);
}

function getCenterX(el) {
  return parseFloat(el.style.left || 0) + 40;
}

function getCenterY(el) {
  return parseFloat(el.style.top || 0) + 40;
}

function positionNameTag(cat, tag) {
  const rect = cat.getBoundingClientRect();
  tag.style.left = rect.left + "px";
  tag.style.top = (rect.top - 20) + "px";
}

function updateAllNameTags() {
  cats.forEach(c => positionNameTag(c.element, c.tag));
  requestAnimationFrame(updateAllNameTags);
}

function makeDraggable(cat, tag) {
  let offsetX = 0, offsetY = 0, isDragging = false;

  cat.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - cat.getBoundingClientRect().left;
    offsetY = e.clientY - cat.getBoundingClientRect().top;
    cat.style.transition = "none";
    tag.style.transition = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      cat.style.left = `${x}px`;
      cat.style.top = `${y}px`;
      positionNameTag(cat, tag);
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      cat.style.transition = "";
      tag.style.transition = "";
    }
  });
}

setTimeout(() => {
  document.querySelector("h1").style.display = "none";
}, 5000);

updateAllNameTags();
