/* =====================================================
   TeaTime Café – script.js
   A. Data   B. Cart state   C. Renderers
   D. Router E. Events       F. Init
   ===================================================== */

/* ===== A. Data ===== */
// Category keys: hot, cold, tea, snacks. "best: true" shows the item in Best Sellers on Home.
const MENU = [
  {id:'cap',  cat:'hot',   name:'Cappuccino',         desc:'Rich espresso with steamed milk and creamy foam.', price:149, emoji:'☕', best:true},
  {id:'moc',  cat:'hot',   name:'Cafe Mocha',         desc:'Espresso blended with chocolate and steamed milk.', price:179, emoji:'🍫', best:true},
  {id:'ame',  cat:'hot',   name:'Americano',          desc:'Smooth espresso with hot water.', price:119, emoji:'☕'},
  {id:'icl',  cat:'cold',  name:'Iced Caramel Latte', desc:'Chilled coffee with milk and caramel.', price:189, emoji:'🧋'},
  {id:'frp',  cat:'cold',  name:'Chocolate Frappe',   desc:'Creamy blended chocolate coffee.', price:199, emoji:'🥤', best:true},
  {id:'chai', cat:'tea',   name:'Masala Chai',        desc:'Traditional Indian tea with aromatic spices.', price:49, emoji:'🍵', best:true},
  {id:'lgt',  cat:'tea',   name:'Lemon Green Tea',    desc:'Refreshing green tea with lemon.', price:99, emoji:'🍋'},
  {id:'brw',  cat:'snacks',name:'Chocolate Brownie',  desc:'Fudgy, rich and freshly baked.', price:99, emoji:'🍫'},
  {id:'muf',  cat:'snacks',name:'Blueberry Muffin',   desc:'Soft muffin packed with blueberries.', price:119, emoji:'🧁'},
  {id:'cro',  cat:'snacks',name:'Butter Croissant',   desc:'Flaky, golden and buttery.', price:129, emoji:'🥐'},
  {id:'chs',  cat:'snacks',name:'Cheese Sandwich',    desc:'Toasted with melted cheese.', price:149, emoji:'🥪'},
  {id:'fry',  cat:'snacks',name:'French Fries',       desc:'Crispy and lightly salted.', price:99, emoji:'🍟'},
  {id:'cke',  cat:'snacks',name:'Chocolate Cake',     desc:'A slice of classic chocolate cake.', price:159, emoji:'🍰'}
];

const CATEGORIES = [
  {key:'all',label:'All'},{key:'hot',label:'Hot Coffee'},{key:'cold',label:'Cold Coffee & Drinks'},
  {key:'tea',label:'Tea'},{key:'snacks',label:'Snacks & Desserts'}
];

// Offers (items with a price can also be added to the cart)
const OFFERS = [
  {id:'combo', name:'Coffee Combo',        desc:'Cappuccino + Chocolate Brownie. Save ₹49.', price:199, emoji:'🎁'},
  {id:'eve',   name:'Evening Tea Special', desc:'Masala Chai + Cookies.', price:79, emoji:'🍪'},
  {id:'bogo',  name:'Buy 1 Get 1',         desc:'Every Wednesday on selected cold coffees.', price:null, emoji:'🥂'}
];

const REVIEWS = [
  {n:'Rahul', t:'Amazing coffee and peaceful atmosphere!', r:5},
  {n:'Priya', t:'Loved their chocolate frappe.', r:5},
  {n:'Arjun', t:'Great place to hang out with friends.', r:4},
  {n:'Sneha', t:'Delicious snacks and friendly service.', r:5}
];

const WHY = [
  ['📶','Free Wi-Fi','Work or study as long as you like.'],
  ['🔌','Charging points','Plug in at most tables.'],
  ['🌳','Indoor and outdoor seating','Pick the spot that suits your mood.'],
  ['👨‍👩‍👧','Family-friendly','A relaxed space for all ages.'],
  ['🥡','Takeaway','Grab your order and go.'],
  ['🎂','Birthday celebrations','Celebrate with us.']
];

// [emoji, caption, background colour] – replace with real <img> tags when you have photos
const GALLERY = [
  ['☕','Fresh brews','#6b4a3a'],['🍰','Cake counter','#8a5a44'],['🪴','Outdoor seating','#687653'],
  ['🛋️','Cozy corner','#a47c5b'],['🥐','Morning bakes','#b8895a'],['🍵','Chai hour','#566244']
];

/* ----- Small helpers ----- */
const fmt  = n => '₹' + n;                                        // price formatter
const $    = (sel, el = document) => el.querySelector(sel);       // shorthand for querySelector
const byId = id => [...MENU, ...OFFERS].find(i => i.id === id);   // find any item by id

/* ===== B. Cart state (saved in the browser so a refresh keeps it) ===== */
let cart = {};                                                    // { itemId: quantity }
try { cart = JSON.parse(localStorage.getItem('tt-cart') || '{}') || {}; } catch (e) { cart = {}; }

function saveCart(){
  try { localStorage.setItem('tt-cart', JSON.stringify(cart)); } catch (e) { /* storage may be blocked */ }
}

function addToCart(id){
  cart[id] = (cart[id] || 0) + 1;
  saveCart(); updateCartCount(); renderCart();
  toast(byId(id).name + ' added to cart');
}

function changeQty(id, delta){
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];                             // remove item when quantity hits zero
  saveCart(); updateCartCount(); renderCart();
}

function updateCartCount(){
  $('#cartCount').textContent = Object.values(cart).reduce((a, b) => a + b, 0);
}

/* ===== C. Renderers ===== */
// Reusable product card (menu, best sellers, offers)
function productCard(i){
  return `<article class="card">
    <div class="emoji" aria-hidden="true">${i.emoji}</div>
    <h3>${i.name}</h3><p>${i.desc}</p>
    <div class="card-foot">
      <span class="price">${i.price ? fmt(i.price) : 'Wednesdays'}</span>
      ${i.price ? `<button class="btn small" data-add="${i.id}">Add to cart</button>` : ''}
    </div></article>`;
}

// Menu filter chips + product grid
let activeCat = 'all';

function renderFilters(){
  $('#filters').innerHTML = CATEGORIES.map(c =>
    `<button class="chip" data-cat="${c.key}" aria-pressed="${c.key === activeCat}">${c.label}</button>`).join('');
}

function renderMenu(){
  // Show only the items that belong to the selected category
  const list = activeCat === 'all' ? MENU : MENU.filter(i => i.cat === activeCat);
  $('#menuGrid').innerHTML = list.map(productCard).join('');
}

// Cart page: rows, quantity controls and total
function renderCart(){
  const ids = Object.keys(cart);

  if (!ids.length){                                               // empty state
    $('#cartBox').innerHTML = `<div class="empty"><h2>Your cart is empty</h2><p>Add a drink or snack from the menu.</p><a class="btn" href="#menu">Browse the menu</a></div>`;
    return;
  }

  const total = ids.reduce((sum, id) => sum + byId(id).price * cart[id], 0);

  $('#cartBox').innerHTML = ids.map(id => {
    const i = byId(id);
    return `<div class="cart-row">
      <span style="font-size:1.8rem" aria-hidden="true">${i.emoji}</span>
      <div><strong>${i.name}</strong><div class="muted">${fmt(i.price)} each</div></div>
      <div class="qty">
        <button data-qty="${id}" data-d="-1" aria-label="Decrease ${i.name}">−</button>
        <span>${cart[id]}</span>
        <button data-qty="${id}" data-d="1" aria-label="Increase ${i.name}">+</button>
      </div>
      <strong>${fmt(i.price * cart[id])}</strong></div>`;
  }).join('') +
  `<div class="total"><span>Total</span><span>${fmt(total)}</span></div>
   <button class="btn" id="checkout">Place order</button>`;
}

// Sections that never change after load
function renderStatic(){
  $('#bestSellers').innerHTML = MENU.filter(i => i.best).map(productCard).join('');

  $('#homeOffers').innerHTML = OFFERS.map(o => productCard(o).replace('class="card"', 'class="card offer"')).join('');
  $('#offersGrid').innerHTML = $('#homeOffers').innerHTML;       // same cards on the Offers page

  $('#categoryCards').innerHTML = CATEGORIES.slice(1).map(c =>
    `<a class="card" href="#menu" data-go-cat="${c.key}" style="text-decoration:none">
       <h3>${c.label}</h3><p>${MENU.filter(i => i.cat === c.key).length} items</p><span class="price">View</span></a>`).join('');

  $('#whyUs').innerHTML = WHY.map(w =>
    `<div class="card"><div style="font-size:1.8rem">${w[0]}</div><h3>${w[1]}</h3><p>${w[2]}</p></div>`).join('');

  $('#reviews').innerHTML = REVIEWS.map(r =>
    `<div class="card"><div class="stars" aria-label="${r.r} out of 5 stars">${'★'.repeat(r.r)}${'☆'.repeat(5 - r.r)}</div>
       <p>“${r.t}”</p><strong>${r.n}</strong></div>`).join('');

  $('#galleryGrid').innerHTML = GALLERY.map(g =>
    `<div class="tile" style="background:${g[2]}">${g[0]}<span>${g[1]}</span></div>`).join('');
}

/* ===== D. Router (hash-based: #home, #menu, #cart ...) ===== */
const PAGES = ['home','about','menu','offers','gallery','contact','login','cart'];

function route(){
  const hash = location.hash.slice(1);
  const page = PAGES.includes(hash) ? hash : 'home';

  // Show the active page, highlight the active nav link
  document.querySelectorAll('[data-page]').forEach(p => p.classList.toggle('active', p.dataset.page === page));
  document.querySelectorAll('[data-link]').forEach(a => a.classList.toggle('active', a.dataset.link === page));

  // Close the mobile menu after navigating
  $('#navLinks').classList.remove('open');
  $('#menuToggle').setAttribute('aria-expanded', 'false');

  if (page === 'cart') renderCart();
  window.scrollTo(0, 0);
}

/* ===== E. Events ===== */
// One delegated click handler for all buttons and links with data-* attributes
document.addEventListener('click', e => {
  const t = e.target.closest('button, a');
  if (!t) return;

  if (t.dataset.add)   addToCart(t.dataset.add);                  // Add to cart
  if (t.dataset.qty)   changeQty(t.dataset.qty, +t.dataset.d);    // + / − quantity
  if (t.dataset.cat)   { activeCat = t.dataset.cat;   renderFilters(); renderMenu(); }   // menu filter chip
  if (t.dataset.goCat) { activeCat = t.dataset.goCat; renderFilters(); renderMenu(); }   // category card on Home

  if (t.id === 'checkout'){                                       // demo checkout: clears the cart
    cart = {}; saveCart(); updateCartCount(); renderCart();
    toast('Order placed. Thank you!');
  }
  if (t.id === 'tabLogin' || t.id === 'tabRegister') setAuthMode(t.id === 'tabRegister');
});

// Mobile navbar toggle
$('#menuToggle').addEventListener('click', () => {
  const open = $('#navLinks').classList.toggle('open');
  $('#menuToggle').setAttribute('aria-expanded', open);
});

// Newsletter + auth forms (front-end demo only)
$('#newsletter').addEventListener('submit', e => {
  e.preventDefault(); e.target.reset(); toast('Subscribed. Welcome to TeaTime!');
});
$('#authForm').addEventListener('submit', e => {
  e.preventDefault(); toast('Demo only: no account was created');
});

// Switch between Login and Register
function setAuthMode(isRegister){
  $('#nameField').hidden = !isRegister;
  $('#tabLogin').setAttribute('aria-pressed', !isRegister);
  $('#tabRegister').setAttribute('aria-pressed', isRegister);
  $('#authSubmit').textContent = isRegister ? 'Create account' : 'Login';
}

// Small confirmation message at the bottom of the screen
let toastTimer;
function toast(msg){
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
}

/* ===== F. Init ===== */
renderStatic();
renderFilters();
renderMenu();
updateCartCount();
route();
window.addEventListener('hashchange', route);