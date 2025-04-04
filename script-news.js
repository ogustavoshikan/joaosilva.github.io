document.addEventListener("DOMContentLoaded", function () {
  let currentPage = 1;
  const newsPerPage = 8;
  let allNews = []; // Armazena todas as notícias combinadas
  let allNewsFiltered = []; // Armazena notícias após filtragem/ordenação
  const loadingElement = document.getElementById('loading');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!menuToggle || !navLinks) {
    console.error('Elementos .menu-toggle ou .nav-links não encontrados!');
    return;
  }

  // Função para carregar dados dos dois arquivos JSON
  function loadData() {
    if (loadingElement) loadingElement.style.display = 'block';
    return Promise.all([
      fetch('data/news-cards.json').then(response => response.ok ? response.json() : Promise.reject('Falha ao carregar news-cards.json')),
      fetch('data/archived-news.json').then(response => response.ok ? response.json() : Promise.reject('Falha ao carregar archived-news.json'))
    ])
      .then(([recentData, archivedData]) => {
        // *** IMPORTANTE: Assumindo que archived-news.json TAMBÉM usa a NOVA estrutura ***
        const recentNews = recentData.news || [];
        const archivedNews = archivedData.archivedNews || [];

        allNews = [...recentNews, ...archivedNews]
          // Ordena usando isoDate para maior precisão, com fallback para date
          .sort((a, b) => {
             const dateA = a.isoDate || a.date;
             const dateB = b.isoDate || b.date;
             // Tenta converter para data; retorna 0 se inválido para não quebrar a ordenação
             const timeA = dateA ? new Date(dateA).getTime() : 0;
             const timeB = dateB ? new Date(dateB).getTime() : 0;
             // Ordena do mais recente para o mais antigo (descendente)
             return (timeB || 0) - (timeA || 0);
          });

        allNewsFiltered = [...allNews]; // Inicializa com todas as notícias ordenadas
        if (loadingElement) {
            setTimeout(() => { loadingElement.style.display = 'none'; }, 300); // Pequeno delay
        }
        loadNews(currentPage); // Carrega a primeira página
      })
      .catch(error => {
        console.error('Erro ao carregar ou processar os dados:', error);
        if (loadingElement) loadingElement.style.display = 'none';
         const container = document.querySelector('.tech-news-container');
         if(container) container.innerHTML = '<p class="error-fallback" role="alert">Erro ao carregar notícias.</p>';
      });
  }

  // Função para exibir notícias na página atual
  function loadNews(page) {
    if (loadingElement) loadingElement.style.display = 'block';
    const container = document.querySelector('.tech-news-container');
    if (!container) {
      console.error('Container .tech-news-container não encontrado!');
      if (loadingElement) loadingElement.style.display = 'none';
      return;
    }
    container.innerHTML = ''; // Limpa o container

    if (allNewsFiltered.length === 0) {
      container.innerHTML = '<p class="no-results">Nenhuma notícia encontrada.</p>';
      updatePaginationControls(page, 0); // Atualiza controles de paginação para estado vazio
      if (loadingElement) loadingElement.style.display = 'none';
      return;
    }

    const start = (page - 1) * newsPerPage;
    const end = start + newsPerPage;
    const paginatedNews = allNewsFiltered.slice(start, end);

    paginatedNews.forEach(news => {
      const article = document.createElement('article');
      article.classList.add('tech-news-card');

      // --- CORREÇÃO AQUI: Usa os novos campos do JSON ---
      const authorName = news.authorName || 'Autor desconhecido';
      const authorLink = news.authorLink || '#';
      const imageWidth = news.imageWidth ? `width="${news.imageWidth}"` : 'width="200"'; // Usa JSON ou fallback
      const imageHeight = news.imageHeight ? `height="${news.imageHeight}"` : 'height="100"'; // Usa JSON ou fallback
      const newsDate = news.date || ''; // Usa a data formatada do JSON
      const imageAlt = news.alt || `Imagem para ${news.title || 'notícia'}`;
      const newsLink = news.link || '#';

      // Monta o HTML do autor no formato desejado (similar ao original, mas com classes)
      const authorHtml = `
        <p class="tech-news-author">
          <span class="author-prefix">Por: </span>
          <a href="${authorLink}" class="author-link" title="Ver posts de ${authorName}" ${authorLink !== '#' ? 'target="_blank" rel="noopener noreferrer"' : ''}>${authorName}</a>
          <span class="tech-news-date"> - ${newsDate}</span>
        </p>
      `;
      // --- FIM DA CORREÇÃO ---

      article.innerHTML = `
        <div class="tech-news-image">
          <a href="${newsLink}" target="_blank" rel="noopener noreferrer">
            <img src="${news.image || 'assets/placeholder.jpg'}" alt="${imageAlt}" loading="lazy" ${imageWidth} ${imageHeight}>
          </a>
        </div>
        <div class="tech-news-content">
          <h3 class="tech-news-title">
            <a href="${newsLink}" target="_blank" rel="noopener noreferrer" aria-label="Leia sobre ${news.title || 'Notícia sem título'}" title="${news.title || ''}">
              ${news.title || 'Notícia sem título'}
            </a>
          </h3>
          <p class="tech-news-excerpt">${news.excerpt || ''}</p>
          ${authorHtml} {/* Insere o HTML do autor corrigido */}
          <div class="share-container">
            <div class="social-icon x" aria-label="Compartilhar no X"><i class="fab fa-x-twitter"></i></div>
            <div class="social-icon whatsapp" aria-label="Compartilhar no WhatsApp"><i class="fab fa-whatsapp"></i></div>
            <div class="social-icon facebook" aria-label="Compartilhar no Facebook"><i class="fab fa-facebook-f"></i></div>
            <div class="social-icon linkedin" aria-label="Compartilhar no LinkedIn"><i class="fab fa-linkedin-in"></i></div>
          </div>
        </div>
      `;
      container.appendChild(article);

      // Adiciona listeners de compartilhamento APÓS adicionar ao DOM
      const shareContainer = article.querySelector('.share-container');
      if(shareContainer) {
          const currentTitle = news.title || '';
          const currentUrl = newsLink;
          shareContainer.querySelector('.social-icon.x')?.addEventListener('click', () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(currentTitle)}&url=${encodeURIComponent(currentUrl)}`, '_blank'));
          shareContainer.querySelector('.social-icon.whatsapp')?.addEventListener('click', () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(currentTitle + ' ' + currentUrl)}`, '_blank'));
          shareContainer.querySelector('.social-icon.facebook')?.addEventListener('click', () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank'));
          shareContainer.querySelector('.social-icon.linkedin')?.addEventListener('click', () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank'));
      }
    });

    updatePaginationControls(page, allNewsFiltered.length); // Atualiza controles

    if (loadingElement) {
        setTimeout(() => { loadingElement.style.display = 'none'; }, 300);
    }
    // Rola suavemente para o topo após carregar novas notícias
    //window.scrollTo({ top: 0, behavior: 'smooth' }); // Descomente se desejar este comportamento
  }

  // Função auxiliar para atualizar controles de paginação
  function updatePaginationControls(currentPage, totalItems) {
     const pageNumberDisplay = document.querySelector('.page-number');
     const prevButton = document.querySelector('.prev-page');
     const nextButton = document.querySelector('.next-page');
     const totalPages = Math.ceil(totalItems / newsPerPage);

     if (pageNumberDisplay) {
         pageNumberDisplay.textContent = totalItems > 0 ? `Página ${currentPage} de ${totalPages}` : 'Página 1 de 1';
     }
     if (prevButton) {
         prevButton.disabled = currentPage === 1;
     }
     if (nextButton) {
        // Desabilita se não houver itens ou se for a última página
         nextButton.disabled = totalItems === 0 || currentPage >= totalPages;
     }
  }


  // Função para ordenar e re-renderizar
  function sortNews(order) {
    let sortedNews = [...allNewsFiltered]; // Ordena a partir dos já filtrados
    if (order === 'recent') {
      sortedNews.sort((a, b) => {
          const dateA = a.isoDate || a.date;
          const dateB = b.isoDate || b.date;
          const timeA = dateA ? new Date(dateA).getTime() : 0;
          const timeB = dateB ? new Date(dateB).getTime() : 0;
          return (timeB || 0) - (timeA || 0); // Mais recentes primeiro
      });
    } else if (order === 'oldest') {
      sortedNews.sort((a, b) => {
          const dateA = a.isoDate || a.date;
          const dateB = b.isoDate || b.date;
          const timeA = dateA ? new Date(dateA).getTime() : 0;
          const timeB = dateB ? new Date(dateB).getTime() : 0;
          return (timeA || 0) - (timeB || 0); // Mais antigas primeiro
      });
    }
    allNewsFiltered = sortedNews; // Atualiza a lista filtrada/ordenada
    currentPage = 1;
    loadNews(currentPage);
  }

  // Listener para o filtro de ordenação
  const sortSelect = document.getElementById('news-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      sortNews(sortSelect.value);
    });
  } else {
    console.warn('Elemento #news-sort não encontrado!');
  }

  // Listeners para a barra de pesquisa
  const searchInput = document.getElementById('news-search-input');
  const searchButton = document.getElementById('news-search-button');
  const clearButton = document.getElementById('news-clear-button');
  if (searchInput && searchButton && clearButton) {
    searchButton.addEventListener('click', () => filterNews(searchInput.value));
    searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') filterNews(searchInput.value); });
    searchInput.addEventListener('input', () => { clearButton.style.display = searchInput.value ? 'flex' : 'none'; });
    clearButton.addEventListener('click', () => {
      searchInput.value = '';
      clearButton.style.display = 'none';
      filterNews('');
    });
  } else {
    console.warn('Elementos de pesquisa ou botão de limpar não encontrados!');
  }

  // Função para filtrar notícias
  function filterNews(searchText) {
    const searchLower = searchText.trim().toLowerCase();
    if (!searchLower) {
        allNewsFiltered = [...allNews]; // Restaura todas se a busca estiver vazia
    } else {
        allNewsFiltered = allNews.filter(news =>
            (news.title?.toLowerCase() || '').includes(searchLower) ||
            (news.excerpt?.toLowerCase() || '').includes(searchLower) ||
            (news.authorName?.toLowerCase() || '').includes(searchLower) // Adiciona busca por autor
        );
    }
    currentPage = 1;
    loadNews(currentPage);
  }

  // Botão Voltar ao Topo
  const newsBackToTopButton = document.getElementById('news-back-to-top');
  if (newsBackToTopButton) {
    window.addEventListener('scroll', () => {
      newsBackToTopButton.classList.toggle('visible', window.scrollY > 600);
    });
    newsBackToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  } else {
    console.warn('Botão #news-back-to-top não encontrado!');
  }

  // Paginação
  const prevPageButton = document.querySelector('.prev-page');
  const nextPageButton = document.querySelector('.next-page');

  if (prevPageButton) {
      prevPageButton.addEventListener('click', () => {
          if (currentPage > 1) {
              currentPage--;
              loadNews(currentPage);
          }
      });
  }
   if (nextPageButton) {
      nextPageButton.addEventListener('click', () => {
          // Calcula o total de páginas ANTES de incrementar
          const totalPages = Math.ceil(allNewsFiltered.length / newsPerPage);
          if (currentPage < totalPages) {
              currentPage++;
              loadNews(currentPage);
          }
      });
  }

  // Menu Hamburger
  if(menuToggle && navLinks) {
      menuToggle.addEventListener('click', (e) => {
          e.stopPropagation(); // Evita que o clique feche o menu imediatamente
          navLinks.classList.toggle('active');
      });
      document.addEventListener('click', (e) => {
          if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
              navLinks.classList.remove('active');
          }
      });
      navLinks.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', () => {
              navLinks.classList.remove('active');
          });
      });
  }

  // Carrega os dados iniciais
  loadData();
});