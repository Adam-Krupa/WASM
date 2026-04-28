const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const nav = document.querySelector('.nav');

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    nav.classList.toggle('nav-open');
    mobileMenuBtn.classList.toggle('menu-open');
  });
}

// Search functionality
const searchInput = document.getElementById('searchInput');
const searchBtn = document.querySelector('.search-btn');

function handleSearch() {
  const query = searchInput.value.trim();
  if (query) {
    console.log('Searching for:', query);
    // Tu mozesz dodac logike wyszukiwania
  }
}

if (searchBtn) {
  searchBtn.addEventListener('click', handleSearch);
}

if (searchInput) {
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });
}

// Quick filter buttons
const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all buttons
    filterBtns.forEach(b => b.classList.remove('filter-active'));
    // Add active class to clicked button
    btn.classList.add('filter-active');
    // Set search input value
    searchInput.value = btn.textContent;
  });
});

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 50) {
    header.classList.add('header-scrolled');
  } else {
    header.classList.remove('header-scrolled');
  }
  
  lastScroll = currentScroll;
});