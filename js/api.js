// Wrist Wonders - Frontend API & Cart Client

const API_BASE = '';

// ==========================================
// 1. AUTH MANAGEMENT
// ==========================================
const Auth = {
  getUser() {
    try {
      const user = localStorage.getItem('ww_user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },
  getToken() {
    return localStorage.getItem('ww_token') || (this.getUser() ? 'logged_in' : null);
  },
  saveSession(token, user) {
    localStorage.setItem('ww_token', token || 'active_token');
    localStorage.setItem('ww_user', JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem('ww_token');
    localStorage.removeItem('ww_user');
    window.location.reload();
  },
  isLoggedIn() {
    return !!this.getUser();
  }
};

// ==========================================
// 2. SHOPPING CART MANAGEMENT
// ==========================================
const Cart = {
  getItems() {
    try {
      const items = localStorage.getItem('ww_cart');
      return items ? JSON.parse(items) : [];
    } catch (e) {
      return [];
    }
  },
  saveItems(items) {
    localStorage.setItem('ww_cart', JSON.stringify(items));
    this.updateBadges();
  },
  add(product) {
    const items = this.getItems();
    const existingIndex = items.findIndex(item => item.name.toLowerCase() === product.name.toLowerCase());

    if (existingIndex > -1) {
      items[existingIndex].quantity = (items[existingIndex].quantity || 1) + 1;
    } else {
      items.push({
        id: product.id || 'p_' + Date.now(),
        name: product.name,
        price: Number(product.price) || 0,
        image: product.image || 'logo.png',
        quantity: 1
      });
    }

    this.saveItems(items);
    showToast(`🛒 "${product.name}" added to Cart!`);
  },
  remove(index) {
    const items = this.getItems();
    items.splice(index, 1);
    this.saveItems(items);
    CartUI.render();
  },
  updateQty(index, delta) {
    const items = this.getItems();
    if (!items[index]) return;
    items[index].quantity = (items[index].quantity || 1) + delta;
    if (items[index].quantity <= 0) {
      items.splice(index, 1);
    }
    this.saveItems(items);
    CartUI.render();
  },
  clear() {
    localStorage.removeItem('ww_cart');
    this.updateBadges();
  },
  getCount() {
    return this.getItems().reduce((sum, item) => sum + (item.quantity || 1), 0);
  },
  getTotal() {
    return this.getItems().reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);
  },
  updateBadges() {
    const count = this.getCount();
    document.querySelectorAll('.cart-count-badge').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'inline-block';
    });
  }
};

// ==========================================
// 3. CART MODAL UI & CHECKOUT
// ==========================================
const CartUI = {
  modalInstance: null,

  initModal() {
    if (document.getElementById('cartModal')) return;

    const modalHtml = `
      <div class="modal fade" id="cartModal" tabindex="-1" aria-hidden="true" style="z-index: 1060;">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content shadow-lg border-0" style="border-radius: 16px; overflow: hidden;">
            <div class="modal-header bg-dark text-white border-0 py-3">
              <h5 class="modal-title fw-bold">
                <i class="fa-solid fa-cart-shopping text-warning me-2"></i> Your Shopping Cart
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4" id="cart-modal-body">
              <!-- Dynamically populated -->
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  open() {
    this.initModal();
    this.render();
    const modalEl = document.getElementById('cartModal');
    if (!this.modalInstance) {
      this.modalInstance = new bootstrap.Modal(modalEl);
    }
    this.modalInstance.show();
  },

  render() {
    const body = document.getElementById('cart-modal-body');
    if (!body) return;

    const items = Cart.getItems();
    const total = Cart.getTotal();
    const user = Auth.getUser();

    if (items.length === 0) {
      body.innerHTML = `
        <div class="text-center py-5">
          <i class="fa-solid fa-cart-arrow-down fa-4x text-muted mb-3"></i>
          <h4 class="fw-bold text-dark">Your Cart is Empty</h4>
          <p class="text-muted">Browse our collection of luxury, smart, and analog watches and add your favorites!</p>
          <button class="btn btn-danger px-4 py-2 mt-2" data-bs-dismiss="modal">
            Continue Shopping
          </button>
        </div>
      `;
      return;
    }

    const itemsHtml = items.map((item, index) => `
      <div class="d-flex align-items-center py-3 border-bottom">
        <img src="${item.image}" alt="${escapeHtml(item.name)}" style="width: 65px; height: 65px; object-fit: cover; border-radius: 8px;" class="border me-3" onerror="this.src='logo.png'">
        <div class="flex-grow-1">
          <h6 class="fw-bold mb-1 text-dark">${escapeHtml(item.name)}</h6>
          <div class="text-muted small">Rs. ${Number(item.price).toLocaleString()} each</div>
        </div>
        <div class="d-flex align-items-center me-3">
          <button class="btn btn-sm btn-outline-secondary px-2 py-0" onclick="Cart.updateQty(${index}, -1)">-</button>
          <span class="mx-2 fw-bold">${item.quantity || 1}</span>
          <button class="btn btn-sm btn-outline-secondary px-2 py-0" onclick="Cart.updateQty(${index}, 1)">+</button>
        </div>
        <div class="fw-bold me-3 text-dark text-end" style="min-width: 80px;">
          Rs. ${(Number(item.price) * (item.quantity || 1)).toLocaleString()}
        </div>
        <button class="btn btn-sm btn-outline-danger" onclick="Cart.remove(${index})" title="Remove item">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `).join('');

    let checkoutSection = '';

    if (!user) {
      // USER MUST SIGN UP OR LOGIN BEFORE CONFIRMING ORDER
      checkoutSection = `
        <div class="alert alert-warning border-warning mt-4 p-3 rounded-3">
          <div class="d-flex align-items-center">
            <i class="fa-solid fa-circle-exclamation fa-2x text-warning me-3"></i>
            <div>
              <h6 class="fw-bold mb-1 text-dark">Sign In Required to Place Order</h6>
              <p class="mb-0 text-muted small">You must be logged in so we can confirm your order and save it to your order history.</p>
            </div>
          </div>
          <div class="d-flex gap-2 mt-3">
            <a href="log-in.html" class="btn btn-primary flex-fill fw-bold py-2">
              <i class="fa-solid fa-right-to-bracket me-1"></i> Login to Confirm Order
            </a>
            <a href="sign up.html" class="btn btn-outline-dark flex-fill fw-bold py-2">
              <i class="fa-solid fa-user-plus me-1"></i> Sign Up
            </a>
          </div>
        </div>
      `;
    } else {
      // USER IS LOGGED IN -> CAN CONFIRM AND PLACE ORDER
      checkoutSection = `
        <div class="bg-light p-3 rounded-3 mt-4 border">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <div class="small text-muted">Ordering as:</div>
              <strong class="text-dark"><i class="fa-solid fa-user-check text-success me-1"></i> ${escapeHtml(user.name)}</strong> 
              <span class="text-muted small">(${escapeHtml(user.email)})</span>
            </div>
            <a href="orders.html" class="btn btn-sm btn-outline-secondary">
              <i class="fa-solid fa-receipt me-1"></i> View Past Orders
            </a>
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold small text-dark mb-1">
              <i class="fa-solid fa-location-dot text-danger me-1"></i> Delivery Address *
            </label>
            <textarea class="form-control form-control-sm" id="cart-delivery-address" rows="2" placeholder="Enter your full shipping address (House/Flat, Street, City, Pincode)" required></textarea>
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold small text-dark mb-1">
              <i class="fa-solid fa-phone text-primary me-1"></i> Contact Phone Number
            </label>
            <input type="tel" class="form-control form-control-sm" id="cart-phone-number" placeholder="e.g. +91 98765 43210">
          </div>

          <div id="checkout-alert"></div>

          <button class="btn btn-success btn-lg w-100 fw-bold py-3 shadow-sm" onclick="CartUI.confirmOrder()">
            <i class="fa-solid fa-shield-check me-2"></i> Confirm & Place Order (Rs. ${total.toLocaleString()})
          </button>
        </div>
      `;
    }

    body.innerHTML = `
      <div>
        <div class="cart-items-list mb-3" style="max-height: 280px; overflow-y: auto;">
          ${itemsHtml}
        </div>

        <div class="d-flex justify-content-between align-items-center pt-3 border-top">
          <div class="text-muted">Total Amount:</div>
          <div class="fs-4 fw-bolder text-danger">Rs. ${total.toLocaleString()}</div>
        </div>

        ${checkoutSection}
      </div>
    `;
  },

  async confirmOrder() {
    const user = Auth.getUser();
    if (!user) {
      alert('Please login or signup to confirm your order!');
      window.location.href = 'log-in.html';
      return;
    }

    const items = Cart.getItems();
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const address = document.getElementById('cart-delivery-address')?.value.trim();
    const phone = document.getElementById('cart-phone-number')?.value.trim();
    const alertBox = document.getElementById('checkout-alert');

    if (!address) {
      if (alertBox) {
        alertBox.innerHTML = '<div class="alert alert-danger py-2 small mb-2">Please enter your delivery address.</div>';
      } else {
        alert('Please enter your delivery address.');
      }
      return;
    }

    const totalAmount = Cart.getTotal();

    if (alertBox) {
      alertBox.innerHTML = '<div class="alert alert-info py-2 small mb-2"><i class="fa-solid fa-spinner fa-spin me-1"></i> Processing and saving your order in MongoDB...</div>';
    }

    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: user.name,
          customerEmail: user.email,
          items,
          totalAmount,
          shippingAddress: address,
          phone: phone || ''
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        Cart.clear();
        const body = document.getElementById('cart-modal-body');
        body.innerHTML = `
          <div class="text-center py-4">
            <div class="mb-3">
              <i class="fa-solid fa-circle-check fa-4x text-success"></i>
            </div>
            <h3 class="fw-bold text-dark">Order Confirmed!</h3>
            <p class="text-muted">Your order #${data.order._id ? data.order._id.substring(data.order._id.length - 8) : ''} has been placed successfully and stored in MongoDB.</p>
            <div class="p-3 bg-light rounded text-start my-3 border">
              <div><strong>Delivery To:</strong> ${escapeHtml(address)}</div>
              <div><strong>Total Paid:</strong> Rs. ${totalAmount.toLocaleString()}</div>
              <div><strong>Status:</strong> <span class="badge bg-success">Confirmed</span></div>
            </div>
            <div class="d-flex justify-content-center gap-2 mt-4">
              <a href="orders.html" class="btn btn-primary px-4 py-2">
                <i class="fa-solid fa-receipt me-1"></i> View Order History
              </a>
              <button class="btn btn-outline-dark px-4 py-2" data-bs-dismiss="modal">
                Continue Shopping
              </button>
            </div>
          </div>
        `;
      } else {
        if (alertBox) {
          alertBox.innerHTML = `<div class="alert alert-danger py-2 small mb-2">${data.message || 'Failed to place order.'}</div>`;
        } else {
          alert(data.message || 'Failed to place order.');
        }
      }
    } catch (err) {
      if (alertBox) {
        alertBox.innerHTML = `<div class="alert alert-danger py-2 small mb-2">Error connecting to server: ${err.message}</div>`;
      } else {
        alert('Error placing order: ' + err.message);
      }
    }
  }
};

// ==========================================
// 4. NAVBAR CUSTOMIZATION & PORTAL REMOVAL
// ==========================================
function updateNavbar() {
  // 1. REMOVE ANY PORTAL LINKS COMPLETELY
  document.querySelectorAll('a[href*="dashboard.html"]').forEach(el => {
    const parentLi = el.closest('.nav-item') || el.closest('li');
    if (parentLi) {
      parentLi.remove();
    } else {
      el.remove();
    }
  });

  // 2. INJECT CART BUTTON IN NAVBAR IF NOT PRESENT
  const navList = document.querySelector('.navbar-nav');
  if (navList && !document.getElementById('nav-cart-btn-item')) {
    const cartLi = document.createElement('li');
    cartLi.className = 'nav-item ms-lg-2 my-1 my-lg-0';
    cartLi.id = 'nav-cart-btn-item';
    cartLi.innerHTML = `
      <a class="btn btn-warning text-dark fw-bold d-flex align-items-center" href="cart.html">
        <i class="fa-solid fa-cart-shopping me-1"></i> Cart
        <span class="badge bg-danger ms-2 cart-count-badge">${Cart.getCount()}</span>
      </a>
    `;
    // Insert before the last nav item (user login/signup)
    navList.appendChild(cartLi);
  }

  // 3. RENDER USER AUTH DROPDOWN (OR LOGIN LINK)
  const user = Auth.getUser();
  const navUserLinks = document.querySelectorAll('a[href="sign up.html"], a[href="log-in.html"], a[href*="sign%20up.html"]');

  if (user) {
    navUserLinks.forEach(link => {
      const parent = link.closest('.nav-item') || link.parentElement;
      if (parent) {
        parent.innerHTML = `
          <div class="dropdown d-inline-block">
            <button class="btn btn-sm btn-outline-warning dropdown-toggle fw-bold text-white px-3 py-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fa-solid fa-user-check me-1 text-warning"></i> Hi, ${escapeHtml(user.name.split(' ')[0])}
            </button>
            <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow">
              <li><h6 class="dropdown-header text-muted">${escapeHtml(user.email)}</h6></li>
              <li><a class="dropdown-item text-white" href="orders.html"><i class="fa-solid fa-receipt me-2 text-warning"></i>My Orders</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-danger" href="#" onclick="Auth.logout(); return false;"><i class="fa-solid fa-right-from-bracket me-2"></i>Logout</a></li>
            </ul>
          </div>
        `;
      }
    });

    // Also add "My Orders" link directly in navbar if not already there
    if (navList && !document.getElementById('nav-orders-link')) {
      const ordersLi = document.createElement('li');
      ordersLi.className = 'nav-item';
      ordersLi.id = 'nav-orders-link';
      ordersLi.innerHTML = `<a class="nav-link text-white" href="orders.html">My Orders</a>`;
      const queryLi = Array.from(navList.children).find(child => child.textContent.includes('Query'));
      if (queryLi) {
        queryLi.after(ordersLi);
      } else {
        navList.prepend(ordersLi);
      }
    }
  }

  Cart.updateBadges();
}

// ==========================================
// 5. UNIVERSAL "ADD TO CART" HANDLER
// ==========================================
function setupAddToCartButtons() {
  // Find all cards and buttons that say "Add To Cart"
  const buttons = document.querySelectorAll('a, button');

  buttons.forEach(btn => {
    const text = (btn.textContent || '').trim().toLowerCase();
    const hasCartIcon = btn.querySelector('.fa-cart-plus, .fa-cart-shopping');

    if (text.includes('add to cart') || hasCartIcon) {
      btn.onclick = function (e) {
        e.preventDefault();

        // Find surrounding card
        const card = btn.closest('.card') || btn.closest('.col-12, .col-md-4, .col-lg-3, div[style*="width"]');
        let title = 'Wrist Wonders Watch';
        let price = 2500;
        let image = 'logo.png';

        if (card) {
          const titleEl = card.querySelector('.card-title, h2, h3, h4, h5');
          if (titleEl) title = titleEl.textContent.trim();

          const cardText = card.querySelector('.card-text, p')?.textContent || card.textContent;
          const priceMatch = cardText.match(/Rs\.?\s*([0-9,]+)/i);
          if (priceMatch && priceMatch[1]) {
            price = Number(priceMatch[1].replace(/,/g, ''));
          }

          const imgEl = card.querySelector('img');
          if (imgEl && imgEl.src) {
            image = imgEl.src;
          }
        }

        Cart.add({ name: title, price: price, image: image });
        window.location.href = 'cart.html';
        return false;
      };
    }
  });
}

// ==========================================
// 6. FORM HANDLERS (SIGN UP, LOGIN, QUERY)
// ==========================================
function setupForms() {
  const form = document.querySelector('form[name="myform"]');
  const path = window.location.pathname.toLowerCase();
  const heading = document.querySelector('h1')?.textContent.toLowerCase() || '';

  const isSignup = path.includes('sign') || heading.includes('sign up');
  const isLogin = path.includes('log-in') || heading.includes('login');
  const isQuery = path.includes('query') || heading.includes('query');

  // 1. Sign Up
  if (form && isSignup) {
    form.onsubmit = async function (e) {
      e.preventDefault();
      const name = form.fname?.value.trim();
      const email = form.fgmail?.value.trim();
      const password = form.fpass?.value.trim();

      const errorSpan = document.getElementById('error');
      const emailErrorSpan = document.getElementById('emailerror');
      const passErrorSpan = document.getElementById('p');

      if (errorSpan) errorSpan.textContent = '';
      if (emailErrorSpan) emailErrorSpan.textContent = '';
      if (passErrorSpan) passErrorSpan.textContent = '';

      if (!name) {
        if (errorSpan) errorSpan.textContent = 'Name is required';
        return false;
      }
      if (!email) {
        if (emailErrorSpan) emailErrorSpan.textContent = 'Email is required';
        return false;
      }
      if (!password || password.length < 6) {
        if (passErrorSpan) passErrorSpan.textContent = 'Password must be at least 6 characters';
        return false;
      }

      showBanner(form, 'info', 'Creating your account in MongoDB...');

      try {
        const res = await fetch(`${API_BASE}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          Auth.saveSession(data.token, data.user);
          showBanner(form, 'success', 'Account created successfully! Redirecting...');
          setTimeout(() => {
            // If user has cart items, send them back to home with cart open
            window.location.href = 'home.html';
          }, 1000);
        } else {
          showBanner(form, 'danger', data.message || 'Registration failed');
        }
      } catch (err) {
        showBanner(form, 'danger', 'Connection error: ' + err.message);
      }
      return false;
    };
  }

  // 2. Login
  if (form && isLogin) {
    form.onsubmit = async function (e) {
      e.preventDefault();
      const fname = form.fname?.value.trim();
      const fpass = form.fpass?.value.trim();

      const errorSpan = document.getElementById('error');
      const passErrorSpan = document.getElementById('p');

      if (errorSpan) errorSpan.textContent = '';
      if (passErrorSpan) passErrorSpan.textContent = '';

      if (!fname) {
        if (errorSpan) errorSpan.textContent = 'Username or Email is required';
        return false;
      }
      if (!fpass) {
        if (passErrorSpan) passErrorSpan.textContent = 'Password is required';
        return false;
      }

      showBanner(form, 'info', 'Checking credentials...');

      try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fname, fpass })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          Auth.saveSession(data.token, data.user);
          showBanner(form, 'success', `Welcome back, ${data.user.name}! Redirecting...`);
          setTimeout(() => {
            window.location.href = 'home.html';
          }, 800);
        } else {
          showBanner(form, 'danger', data.message || 'Invalid username or password');
        }
      } catch (err) {
        showBanner(form, 'danger', 'Connection error: ' + err.message);
      }
      return false;
    };
  }

  // 3. Query Form
  if (form && isQuery) {
    form.onsubmit = async function (e) {
      e.preventDefault();
      const email = form.fgmail?.value.trim();
      const message = form.message?.value.trim();

      if (!email || !message) {
        alert('Please fill out email and message.');
        return false;
      }

      showBanner(form, 'info', 'Submitting feedback to MongoDB...');

      try {
        const user = Auth.getUser();
        const res = await fetch(`${API_BASE}/api/queries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user ? user.name : 'Customer',
            email,
            message
          })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          showBanner(form, 'success', 'Your query has been saved to the database! We will contact you soon.');
          form.reset();
        } else {
          showBanner(form, 'danger', data.message || 'Failed to submit query');
        }
      } catch (err) {
        showBanner(form, 'danger', 'Error connecting to backend: ' + err.message);
      }
      return false;
    };
  }
}

// Toast helper
function showToast(message) {
  let toast = document.getElementById('ww-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ww-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.backgroundColor = '#1e293b';
    toast.style.color = '#ffffff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '10px';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    toast.style.zIndex = '9999';
    toast.style.fontWeight = '600';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    document.body.appendChild(toast);
  }
  toast.innerHTML = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 2500);
}

function showBanner(formEl, type, msg) {
  let banner = formEl.querySelector('.api-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.className = `alert alert-${type} mt-3 mb-2 api-banner text-center fw-semibold`;
    formEl.prepend(banner);
  } else {
    banner.className = `alert alert-${type} mt-3 mb-2 api-banner text-center fw-semibold`;
  }
  banner.innerHTML = msg;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  setupAddToCartButtons();
  setupForms();
});
