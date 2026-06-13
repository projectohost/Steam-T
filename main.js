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

  // ===== RENDER =====
  function render(list = games){
    grid.innerHTML = "";

    list.forEach(g => {
      grid.innerHTML += `
        <div class="game-card" onclick="openGame(${g.uid})">
          <img src="${g.img}">
          <div class="game-info">
            <h3>${g.title}</h3>
            <p>${g.genre}</p>
            <p>$${g.price}</p>

            <div class="bottom">
              <button onclick="event.stopPropagation(); buy(${g.uid})">Купить</button>
              <button onclick="event.stopPropagation(); addFav(${g.uid})">❤️</button>
            </div>
          </div>
        </div>
      `;
    });
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
    const v = e.target.value.toLowerCase();

    render(
      games.filter(g =>
        g.title.toLowerCase().includes(v)
      )
    );
  });

  // ===== MUSIC =====
  let musicOn = false;

  const music = document.getElementById("lobbyMusic");
  const btn = document.getElementById("musicBtn");

  window.toggleMusic = function(){

    if(!music) return;

    if(!musicOn){
      music.play();
      musicOn = true;
      btn.innerText = "🎵 Музыка: ON";
    } else {
      music.pause();
      musicOn = false;
      btn.innerText = "🎵 Музыка: OFF";
    }
  };

  update();
  render();

});