import axios from 'axios';
import Pagination from 'tui-pagination';
import 'tui-pagination/dist/tui-pagination.css';
import { createMarkup, setCartButtonEventListeners, updateCartButtonIcons } from './carts.js';

const productsListContainer = document.getElementById('products-container');
let pagination;

function getProducts(page, limit) {
  return axios.get('https://food-boutique.b.goit.study/api/products', {
    params: {
      page: page,
      limit: limit,
    },
  });
}

function getFilters() {
    const savedFilters = localStorage.getItem('productFilters');
    return savedFilters ? JSON.parse(savedFilters) : { keyword: null, category: null, page: 1, limit: 6 };
}

function updateFilter(key, value) {
    const filters = getFilters();
    filters[key] = value;
    saveFilters(filters);
}

window.addEventListener('resize', updatePageSize);

function updatePageSize() {
  let limit;
  if (window.innerWidth >= 1440) {
    limit = 9;
  } else if (window.innerWidth >= 768) {
    limit = 8;
  } else {
    limit = 6;
  }
  const currentFilters = getFilters();
  if (currentFilters.limit !== limit) {
    updateFilter('limit', limit);
    renderProducts();
  }
}

async function renderProducts() {
  const filters = getFilters();
  let page = filters.page || 1;
  let limit = filters.limit || 6;

  try {
    const { data } = await getProducts(page, limit);
    const { perPage, totalPages, results } = data;
    const totalItems = perPage * totalPages;

    productsListContainer.innerHTML = createMarkup(results);
    setCartButtonEventListeners(results);

    const container = document.getElementById('tui-pagination-container');

    if (!pagination) {
      pagination = new Pagination(container, {
        totalItems: totalItems,
        itemsPerPage: limit,
        visiblePages: 4,
        centerAlign: true,
        page: page,
      });

      pagination.on('beforeMove', event => {
        const currentPage = event.page;
        const currentFilters = getFilters();
        const newLimit = currentFilters.limit || 6;
        if (currentPage !== currentFilters.page || newLimit !== currentFilters.limit) {
          updateFilter('page', currentPage);
          updateFilter('limit', newLimit);
          renderProducts();
        }
      });
    } else {
      pagination.reset(totalItems);
      pagination.movePageTo(page);
    }

    updateCartButtonIcons();
  } catch (error) {
    console.error('Error fetching products', error);
  }
}

renderProducts();

