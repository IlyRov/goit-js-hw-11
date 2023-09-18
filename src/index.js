import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const API_KEY = '39426809-bb4d69a7739220f87b2287adb';
const BASE_URL = 'https://pixabay.com/api/';
const perPage = 40; // Кількість зображень на сторінку

let currentPage = 1;
let currentQuery = '';

// Ініціалізація SimpleLightbox
const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  currentPage = 1; // Скидаємо сторінку при новому пошуку
  currentQuery = e.target.elements.searchQuery.value.trim();

  if (currentQuery === '') {
    Notiflix.Notify.warning('Введіть ключове слово для пошуку.');
    return;
  }

  clearGallery();
  loadImages();
});

loadMoreBtn.addEventListener('click', () => {
  loadImages();
});

async function loadImages() {
  loadMoreBtn.disabled = true;
  loadMoreBtn.textContent = 'Завантаження...';

  try {
    const response = await axios.get(
      `${BASE_URL}?key=${API_KEY}&q=${currentQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=${perPage}`
    );

    const { data } = response;

    if (data.hits.length === 0) {
      Notiflix.Notify.failure('Нажаль, за вашим запитом нічого не знайдено.');
      loadMoreBtn.style.display = 'none'; // Ховаємо кнопку завантажити
      return;
    }

    appendImages(data.hits);

    if (data.hits.length < perPage) {
      loadMoreBtn.style.display = 'none'; // Ховаємо кнопку завантажити, якщо досягнуто кінця колекції
    } else {
      loadMoreBtn.style.display = 'block';
    }

    currentPage += 1;
  } catch (error) {
    console.error('Помилка запиту:', error);
    Notiflix.Notify.failure('Щось пішло не так. Спробуйте ще раз.');

  } finally {
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = 'Завантажити ще';
    
    // Прокручування сторінки вниз для плавної анімації завантаження зображень
    const cardHeight = gallery.lastElementChild.clientHeight;
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
}

function appendImages(images) {
  const imageElements = images.map((image) => createImageCard(image));
  gallery.insertAdjacentHTML('beforeend', imageElements.join(''));
  lightbox.refresh(); // Оновлення SimpleLightbox для нових елементів галереї
}

function clearGallery() {
  gallery.innerHTML = '';
  loadMoreBtn.style.display = 'none';
}

function createImageCard({ webformatURL, likes, views, comments, downloads, largeImageURL }) {
  return `
    <div class="photo-card">
      <a href="${largeImageURL}">
        <img src="${webformatURL}" alt="Фото" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${likes}</p>
        <p class="info-item"><b>Views:</b> ${views}</p>
        <p class="info-item"><b>Comments:</b> ${comments}</p>
        <p class="info-item"><b>Downloads:</b> ${downloads}</p>
      </div>
    </div>
  `;
}