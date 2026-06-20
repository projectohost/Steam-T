document.addEventListener("DOMContentLoaded", () => {

  const steamGames = [
    {id:730, name:"Counter-Strike 2", genre:"Шутер"},
    {id:271590, name:"GTA V", genre:"Экшен"},
    {id:252490, name:"Rust", genre:"Выживание"},
    {id:578080, name:"PUBG", genre:"Шутер"},
    {id:570, name:"Dota 2", genre:"MOBA"},
    {id:1245620, name:"Elden Ring", genre:"RPG"},
    {id:1091500, name:"Cyberpunk 2077", genre:"RPG"},
    {id:381210, name:"Dead by Daylight", genre:"Хоррор"},
    {id:1172470, name:"Apex Legends", genre:"Шутер"},
    {id:346110, name:"ARK", genre:"Выживание"},
    {id:739630, name:"Phasmophobia", genre:"Хоррор"},
    {id:252950, name:"Rocket League", genre:"Гонки"},
    {id:1086940, name:"Baldur's Gate 3", genre:"RPG"},
    {id:1174180, name:"RDR2", genre:"Экшен"}
  ];

  const games = [];

  for (let i = 0; i < steamGames.length; i++) {
    const g = steamGames[i];

    games.push({
      uid: i + 1,
      steamId: g.id,
      title: g.name,
      genre: g.genre,
      price: getPrice(i),
      img: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.id}/header.jpg`
    });
  }

  function getPrice(i){
    if(i % 13 === 0) return 0;
    if(i % 7 === 0) return 59;
    if(i % 4 === 0) return 39;
    return Math.floor(Math.random() * 60) + 5;
  }

  let balance = 230;
  let cart = [];
  let purchased = [];
  let fav = JSON.parse(localStorage.getItem("fav")) || [];

  const grid = document.querySelector(".game-grid");
  const popup = document.getElementById("popup");

  // ===== PAGE NAVIGATION =====
  // FIX: the HTML button calls openShop() on click, but this function
  // never existed in the original script, so clicking "Войти в мини магазин"
  // did nothing. This hides the home page and reveals the shop page.
  window.openShop = function(){
    const home = document.getElementById("homePage");
    const shop = document.getElementById("shopPage");

    if (home) home.style.display = "none";
    if (shop) shop.style.display = "block";
  }

  window.openHome = function(){
    const home = document.getElementById("homePage");
    const shop = document.getElementById("shopPage");

    if (shop) shop.style.display = "none";
    if (home) home.style.display = "block";
  }

  // ===== RENDER =====
  // FIX: previously used grid.innerHTML += templateString inside a forEach,
  // which re-parses the entire grid on every single card and destroys/recreates
  // every <img> tag each time. This caused images to flicker, fail to load,
  // or never finish loading from Steam's CDN, especially with 10+ cards.
  // Now we build the full HTML string once and set innerHTML a single time.
  function render(list = games){
    grid.innerHTML = list.map(g => `
      <div class="game-card" onclick="openGame(${g.uid})">
        <img src="${g.img}" loading="lazy" alt="${g.title}">
        <div class="game-info">
          <h3>${g.title}</h3>
          <p>${g.genre}</p>
          <p>$${g.price}</p>

          <div class="bottom">
            ${purchased.includes(g.uid)
              ? `<button disabled>✅ Куплено</button>`
              : `<button onclick="event.stopPropagation(); buy(${g.uid})">Купить</button>`
            }
            <button onclick="event.stopPropagation(); addFav(${g.uid})">❤️</button>
          </div>
        </div>
      </div>
    `).join("");
  }

  // Keep track of the current search filter so we can re-render
  // with the same filter applied after a purchase/favorite change.
  let currentFilter = "";

  function rerenderWithFilter(){
    if (!currentFilter) {
      render(games);
    } else {
      render(games.filter(g => g.title.toLowerCase().includes(currentFilter)));
    }
  }

  // ===== BUY =====
  window.buy = function(uid){
    const g = games.find(x => x.uid === uid);

    if(!g) return;

    if(purchased.includes(uid)){
      show("⚠️ Эта игра уже куплена");
      return;
    }

    if(g.price > balance){
      show("❌ Нет денег");
      return;
    }

    balance -= g.price;

    cart.push(g);
    purchased.push(uid);

    update();
    rerenderWithFilter(); // refresh card to show "Куплено" state
    show("Куплено: " + g.title);
  }

  // ===== FAVORITES =====
  window.addFav = function(uid){

    const g = games.find(x => x.uid === uid);

    if(!g) return;

    if(fav.some(x => x.uid === uid)){
      show("❤️ Уже в избранном");
      return;
    }

    fav.push(g);

    localStorage.setItem("fav", JSON.stringify(fav));

    update();
    show("❤️ Добавлено в избранное");
  }

  // ===== GAME MODAL =====
  window.openGame = function(uid){
    const g = games.find(x => x.uid === uid);

    if(!g) return;

    document.getElementById("modal").classList.remove("hidden");
    document.getElementById("mTitle").innerText = g.title;
    document.getElementById("mImg").src = g.img;
    document.getElementById("mDesc").innerText = `${g.genre} | $${g.price}`;
  }

  window.closeModal = function(){
    document.getElementById("modal").classList.add("hidden");
  }

  // ===== FAVORITES MODAL =====
  window.openFav = function(){

    const box = document.getElementById("favList");

    if(fav.length === 0){
      box.innerHTML = "<p>Пусто 😢</p>";
    } else {
      box.innerHTML = fav.map(g => `
        <p>
          ${g.title} - $${g.price}
          <button onclick="removeFav(${g.uid})">❌</button>
        </p>
      `).join("");
    }

    document.getElementById("favModal").classList.remove("hidden");
  }

  window.removeFav = function(uid){

    fav = fav.filter(g => g.uid !== uid);

    localStorage.setItem("fav", JSON.stringify(fav));

    update();
    openFav();
  }

  window.closeFav = function(){
    document.getElementById("favModal").classList.add("hidden");
  }

  // ===== CART =====
  window.openCart = function(){

    const box = document.getElementById("cartList");

    box.innerHTML = cart.length
      ? cart.map(g => `<p>${g.title} - $${g.price}</p>`).join("")
      : "<p>Корзина пустая 🛒</p>";

    document.getElementById("cartModal").classList.remove("hidden");
  }

  window.closeCart = function(){
    document.getElementById("cartModal").classList.add("hidden");
  }

  // ===== UI =====
  function update(){
    document.getElementById("balance").innerText = "💰 $" + balance;
    document.getElementById("cart").innerText = cart.length;
    document.getElementById("fav").innerText = fav.length;
  }

  function show(text){
    popup.innerText = text;
    popup.style.opacity = 1;

    setTimeout(() => {
      popup.style.opacity = 0;
    }, 1200);
  }

  // ===== SEARCH =====
  document.getElementById("search").addEventListener("input", (e)=>{
    currentFilter = e.target.value.toLowerCase();
    rerenderWithFilter();
  });

  // ===== MUSIC =====
  let musicOn = false;

  const music = document.getElementById("lobbyMusic");
  const btn = document.getElementById("musicBtn");

  window.toggleMusic = function () {

    if (!music) {
      alert("Музыка не найдена!");
      return;
    }

    if (!musicOn) {

      music.volume = 0.5;

      music.play().then(() => {

        musicOn = true;
        btn.innerText = "🎵 Музыка: ON";

      }).catch(err => {

        console.error(err);
        alert("Не удалось запустить музыку");

      });

    } else {

      music.pause();

      musicOn = false;

      btn.innerText = "🎵 Музыка: OFF";
    }
  };

  // ===== INITIAL RENDER =====
  // FIX: original code never called render() on load, so the grid
  // would stay empty until the user typed in the search box.
  render(games);
  update();

window.aboutGameHub = function() {

  alert(
`🎮 GameHub

Добро пожаловать в GameHub!

Здесь можно:
• Покупать игры
• Добавлять игры в избранное
• Искать игры через поиск

Спасибо за использование GameHub! ❤️`
  );

};

});