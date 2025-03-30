document.addEventListener("DOMContentLoaded", function () {
  let currentPage = 1;
  const newsPerPage = 8;
  let allNews = []; // Variável global para armazenar todas as notícias
  let allNewsFiltered = allNews; // Variável para armazenar as notícias filtradas
  const loadingElement = document.getElementById('loading');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  // Verificação de elementos antes de prosseguir
  if (!menuToggle || !navLinks) {
    console.error('Elementos .menu-toggle ou .nav-links não encontrados!');
    return;
  }

  // Função para carregar os dados uma única vez
  function loadData() {
    loadingElement.style.display = 'block';
    return Promise.all([
      fetch('data/news-cards.json').then(response => response.json()),
      fetch('data/archived-news.json').then(response => response.json())
    ])
      .then(([recentData, archivedData]) => {
        const recentNews = recentData.news;
        const archivedNews = archivedData.archivedNews;
        allNews = [...recentNews, ...archivedNews].sort((a, b) => new Date(b.date) - new Date(a.date));
        allNewsFiltered = [...allNews]; // Inicializa allNewsFiltered com todas as notícias
        setTimeout(() => {
          loadingElement.style.display = 'none';
        }, 500);
        loadNews(currentPage);
      })
      .catch(error => {
        console.error('Erro ao carregar os dados:', error);
        loadingElement.style.display = 'none';
      });
  }

  // Função para carregar as notícias com base na página
  function loadNews(page) {
    loadingElement.style.display = 'block';
    const container = document.querySelector('.tech-news-container');
    container.innerHTML = '';

    // Verifica se há notícias filtradas
    if (allNewsFiltered.length === 0) {
      container.innerHTML = '<p class="no-results">Nenhuma notícia encontrada.</p>';
      document.querySelector('.page-number').textContent = `Página ${page}`;
      document.querySelector('.prev-page').disabled = true; // Desabilita o botão "Anterior"
      document.querySelector('.next-page').disabled = true; // Desabilita o botão "Próxima"
      loadingElement.style.display = 'none';
      return;
    }

    const start = (page - 1) * newsPerPage;
    const end = start + newsPerPage;
    const paginatedNews = allNewsFiltered.slice(start, end);

    paginatedNews.forEach(news => {
      const article = document.createElement('article');
      article.classList.add('tech-news-card');
      article.innerHTML = `
        <div class="tech-news-image">
          <a href="${news.link || '#'}" target="_blank" rel="noopener noreferrer">
            <img src="${news.image || 'assets/placeholder.jpg'}" alt="${news.alt || 'Imagem da notícia'}" loading="lazy" width="200" height="100">
          </a>
        </div>
        <div class="tech-news-content">
          <h3 class="tech-news-title">
            <a href="${news.link || '#'}" target="_blank" rel="noopener noreferrer" aria-label="Leia sobre ${news.title}" title="${news.title}">
              ${news.title}
            </a>
          </h3>
          <p class="tech-news-excerpt">${news.excerpt}</p>
          <p class="tech-news-author">
            <span>Por </span><a href="#" target="_blank" rel="noopener noreferrer">${news.author.replace('Por ', '') || 'Autor desconhecido'}</a>
            <span class="tech-news-date"> - ${news.date || ''}</span>
          </p>
          <div class="share-container">
            <div class="social-icon x"><i class="fab fa-x-twitter"></i></div>
            <div class="social-icon whatsapp"><i class="fab fa-whatsapp"></i></div>
            <div class="social-icon facebook"><i class="fab fa-facebook-f"></i></div>
            <div class="social-icon linkedin"><i class="fab fa-linkedin-in"></i></div>
          </div>
        </div>
      `;
      container.appendChild(article);
    });

    document.querySelector('.page-number').textContent = `Página ${page}`;
    document.querySelector('.prev-page').disabled = page === 1;
    document.querySelector('.next-page').disabled = end >= allNewsFiltered.length;

    document.querySelectorAll('.tech-news-card').forEach(card => {
      const title = card.querySelector('.tech-news-title a').textContent;
      const url = card.querySelector('.tech-news-image a').href;
      card.querySelector('.social-icon.x').addEventListener('click', () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank'));
      card.querySelector('.social-icon.whatsapp').addEventListener('click', () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`, '_blank'));
      card.querySelector('.social-icon.facebook').addEventListener('click', () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank'));
      card.querySelector('.social-icon.linkedin').addEventListener('click', () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank'));
    });

    setTimeout(() => {
      loadingElement.style.display = 'none';
    }, 300);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Função para ordenar e re-renderizar as notícias
  function sortNews(order) {
    let sortedNews = [...allNewsFiltered];
    if (order === 'recent') {
      sortedNews.sort((a, b) => new Date(b.date) - new Date(a.date)); // Mais recentes primeiro
    } else if (order === 'oldest') {
      sortedNews.sort((a, b) => new Date(a.date) - new Date(b.date)); // Mais antigas primeiro
    }
    allNewsFiltered = sortedNews; // Atualiza a variável global filtrada
    currentPage = 1; // Reseta para a primeira página
    loadNews(currentPage); // Re-renderiza as notícias
  }

  // Listener para o filtro
  const sortSelect = document.getElementById('news-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      sortNews(sortSelect.value);
    });
  } else {
    console.error('Elemento #news-sort não encontrado!');
  }

  // Listener para a barra de pesquisa
  const searchInput = document.getElementById('news-search-input');
  const searchButton = document.getElementById('news-search-button');
  const clearButton = document.getElementById('news-clear-button');
  if (searchInput && searchButton && clearButton) {
    // Pesquisa ao clicar no botão
    searchButton.addEventListener('click', () => {
      const searchText = searchInput.value.trim();
      filterNews(searchText);
    });

    // Pesquisa ao pressionar Enter
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const searchText = searchInput.value.trim();
        filterNews(searchText);
      }
    });

    // Mostrar/esconder o botão "Limpar" com base no texto no input
    searchInput.addEventListener('input', () => {
      clearButton.style.display = searchInput.value ? 'flex' : 'none';
    });

    // Limpar a pesquisa ao clicar no botão "Limpar"
    clearButton.addEventListener('click', () => {
      searchInput.value = '';
      clearButton.style.display = 'none';
      filterNews(''); // Restaura a lista completa de notícias
    });
  } else {
    console.error('Elementos de pesquisa ou botão de limpar não encontrados!');
  }

  // Função para filtrar notícias com base no texto de pesquisa
  function filterNews(searchText) {
    const filteredNews = allNews.filter(news => {
      const searchLower = searchText.toLowerCase();
      return (
        news.title.toLowerCase().includes(searchLower) ||
        news.excerpt.toLowerCase().includes(searchLower)
      );
    });
    allNewsFiltered = filteredNews; // Armazena as notícias filtradas
    currentPage = 1; // Reseta para a primeira página
    loadNews(currentPage); // Re-renderiza as notícias
  }

  // === Botão Voltar ao Topo - Página de Notícias ===
  const newsBackToTopButton = document.getElementById('news-back-to-top');

  if (newsBackToTopButton) {
    // Mostrar/esconder o botão com base no scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) { // Mostra o botão após rolar 600px
        newsBackToTopButton.classList.add('visible');
      } else {
        newsBackToTopButton.classList.remove('visible');
      }
    });

    // Rolar para o topo ao clicar no botão
    newsBackToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  } else {
    console.error('Botão #news-back-to-top não encontrado!');
  }

  // Carrega os dados ao iniciar a página
  loadData();

  document.querySelector('.prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadNews(currentPage);
    }
  });

  document.querySelector('.next-page').addEventListener('click', () => {
    currentPage++;
    loadNews(currentPage);
  });

  // Script para o menu hamburger
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // Fechar o menu ao clicar fora
  document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('active');
    }
  });

  // Fechar o menu ao clicar em um link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });
});