// Credenciais do Supabase
const SUPABASE_URL = "https://eruqmvgdjactbefhammr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FNv0l4ymo_ELn5Ul5GpxeA_KvwKDIdu";
const NUMBER_WHATSAPP = "5511995862589"; // Número de contato no WhatsApp

// Inicialização única usando a janela global
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let cart = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  setupCartEvents();
});

// Buscar Produtos no Supabase
async function fetchProducts() {
  const grid = document.getElementById("products-grid");
  
  if (!grid) return;

  const { data: products, error } = await supabaseClient
    .from('produtos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    grid.innerHTML = "<p>Erro ao carregar o catálogo de produtos.</p>";
    console.error("Erro na busca do Supabase:", error);
    return;
  }

  if (!products || products.length === 0) {
    grid.innerHTML = "<p>Nenhum produto cadastrado no momento.</p>";
    return;
  }

  grid.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${product.image_url || 'placeholder.jpg'}" alt="${product.name}" class="product-img">
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-desc">${product.description || ''}</p>
        <div class="product-price">R$ ${parseFloat(product.price).toFixed(2)}</div>
        <button class="btn-add-cart" onclick="addToCart('${product.id}', '${product.name.replace(/'/g, "\\'")}', ${product.price})">
          <i class="fa-solid fa-cart-plus"></i> Adicionar
        </button>
      </div>
    </div>
  `).join('');
}

// Lógica do Carrinho (Expostas globalmente no window para funcionar no onclick do HTML)
window.addToCart = function(id, name, price) {
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  updateCartUI();
};

window.removeFromCart = function(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
};

function updateCartUI() {
  const cartCount = document.getElementById("cart-count");
  const cartItemsContainer = document.getElementById("cart-items");
  const totalPriceElem = document.getElementById("cart-total-price");

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) cartCount.innerText = totalItems;

  if (!cartItemsContainer || !totalPriceElem) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Seu carrinho está vazio.</p>';
    totalPriceElem.innerText = 'R$ 0,00';
    return;
  }

  let total = 0;
  cartItemsContainer.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>${item.quantity}x R$ ${item.price.toFixed(2)}</p>
        </div>
        <button class="remove-item-btn" onclick="removeFromCart('${item.id}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
  }).join('');

  totalPriceElem.innerText = `R$ ${total.toFixed(2)}`;
}

// Eventos do Modal
function setupCartEvents() {
  const modal = document.getElementById("cart-modal");
  const cartBtn = document.getElementById("cart-btn");
  const closeCartBtn = document.getElementById("close-cart");
  const checkoutBtn = document.getElementById("checkout-btn");

  if (cartBtn && modal) cartBtn.onclick = () => modal.style.display = "flex";
  if (closeCartBtn && modal) closeCartBtn.onclick = () => modal.style.display = "none";
  
  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
  };

  // Finalizar Pedido no WhatsApp
  if (checkoutBtn) {
    checkoutBtn.onclick = () => {
      if (cart.length === 0) {
        alert("Adicione pelo menos um produto ao carrinho!");
        return;
      }

      let message = "Olá, Sublimagic! Gostaria de fazer o seguinte pedido:\n\n";
      let total = 0;

      cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        message += `• *${item.name}* (${item.quantity}x) - R$ ${subtotal.toFixed(2)}\n`;
      });

      message += `\n*Total:* R$ ${total.toFixed(2)}`;

      const whatsappUrl = `https://wa.me/${NUMBER_WHATSAPP}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    };
  }
} 