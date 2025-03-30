document.addEventListener("DOMContentLoaded", function () {
  // === 1. Toggle do Menu Mobile ===
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector("nav ul.nav-links");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("active");
      const isExpanded = navLinks.classList.contains("active");
      menuToggle.setAttribute("aria-expanded", isExpanded);
      console.log("Menu mobile toggled");
    });
  } else {
    console.warn("Elementos do menu mobile não encontrados.");
  }

  // === 2. Navegação do Card Médio na Seção "Comece por Aqui e Tópicos" ===
  let covers = [];
  let currentIndex = 0;
  const mediumCardSlider = document.querySelector(".medium-card-slider");
  const mediumTitleLink = document.querySelector(".medium-title-link");
  const mediumDescription = document.querySelector(".medium-card-description");
  const mediumCardOverlay = document.querySelector(".medium-card-overlay");
  const prevButton = document.querySelector(".medium-nav-button.prev");
  const nextButton = document.querySelector(".medium-nav-button.next");
  const sliderIndicators = document.querySelector(".slider-indicators");
  let autoSlideInterval = null; // Garantir que autoSlideInterval seja inicializado como null

  console.log("mediumCardSlider:", mediumCardSlider);
  console.log("mediumTitleLink:", mediumTitleLink);
  console.log("mediumDescription:", mediumDescription);
  console.log("mediumCardOverlay:", mediumCardOverlay);
  console.log("prevButton:", prevButton);
  console.log("nextButton:", nextButton);
  console.log("sliderIndicators:", sliderIndicators);

  if (!prevButton || !nextButton || !mediumCardSlider || !mediumTitleLink || !mediumDescription || !mediumCardOverlay || !sliderIndicators) {
    console.error("Erro: Alguns elementos do card médio não foram encontrados!");
    return;
  }

  function loadMediumCards() {
    fetch('data/medium-cards.json')
      .then(response => response.json())
      .then(data => {
        covers = data.mediumCards;
        mediumCardSlider.innerHTML = '';
        covers.forEach((cover, index) => {
          const img = document.createElement("img");
          img.src = cover.src;
          img.classList.add("medium-card-image");
          img.setAttribute("data-link", cover.link);
          img.setAttribute("data-type", cover.type);
          img.setAttribute("alt", cover.alt);
          img.setAttribute("loading", "lazy");
          mediumCardSlider.appendChild(img);
        });
        createIndicators();
        startAutoSlide(); // Iniciar o auto-slide apenas uma vez aqui
        updateMediumCard("initial");
      })
      .catch(error => {
        console.error('Erro ao carregar os cards médios:', error);
      });
  }

  function createIndicators() {
    sliderIndicators.innerHTML = '';
    covers.forEach((_, index) => {
      const indicator = document.createElement("div");
      indicator.classList.add("slider-indicator");
      if (index === 0) indicator.classList.add("active");
      indicator.addEventListener("click", () => {
        currentIndex = index;
        updateMediumCard("jump");
        updateIndicators();
        resetAutoSlide();
      });
      sliderIndicators.appendChild(indicator);
    });
  }

  function updateIndicators() {
    const indicators = document.querySelectorAll(".slider-indicator");
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === currentIndex);
    });
  }

  function updateMediumCard(direction) {
    console.log("Atualizando card médio para o índice:", currentIndex, "Direção:", direction);
    mediumCardOverlay.style.opacity = 0;
    const offset = -currentIndex * 100;
    mediumCardSlider.style.transform = `translateX(${offset}%)`;
    setTimeout(() => {
      mediumTitleLink.href = covers[currentIndex].link;
      const newTitle = covers[currentIndex].title;
      mediumTitleLink.querySelector(".medium-card-title").textContent = newTitle;
      mediumTitleLink.setAttribute("title", newTitle);
      mediumTitleLink.setAttribute("aria-label", `Acesse ${newTitle}`);
      mediumDescription.textContent = covers[currentIndex].description;
      mediumCardOverlay.style.opacity = 1;
      console.log("Card médio atualizado! Novo src:", mediumCardSlider.children[currentIndex].src);
      updateIndicators();
    }, 400);
  }

  function startAutoSlide() {
    // Garantir que qualquer intervalo anterior seja limpo antes de iniciar um novo
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
    }
    autoSlideInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % covers.length;
      updateMediumCard("auto");
    }, 7000); // 7 segundos
    console.log("Auto-slide iniciado com intervalo de 7 segundos");
  }

  function resetAutoSlide() {
    console.log("Reiniciando auto-slide");
    startAutoSlide(); // Já limpa o intervalo anterior dentro de startAutoSlide
  }

  function pauseAutoSlide() {
    console.log("Slider pausado (mouse sobre)");
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
      autoSlideInterval = null; // Garantir que o intervalo seja marcado como limpo
    }
  }

  function resumeAutoSlide() {
    console.log("Slider retomado (mouse saiu)");
    if (!autoSlideInterval) { // Só inicia se não houver um intervalo ativo
      startAutoSlide();
    }
  }

  prevButton.addEventListener("click", function () {
    console.log("Botão 'Anterior' clicado");
    currentIndex = (currentIndex - 1 + covers.length) % covers.length;
    updateMediumCard("left");
    resetAutoSlide();
  });

  nextButton.addEventListener("click", function () {
    console.log("Botão 'Próximo' clicado");
    currentIndex = (currentIndex + 1) % covers.length;
    updateMediumCard("right");
    resetAutoSlide();
  });

  mediumCardSlider.addEventListener("click", function (event) {
    if (event.target.classList.contains("medium-card-image")) {
      const link = event.target.getAttribute("data-link");
      const type = event.target.getAttribute("data-type");
      console.log("Imagem clicada - Link:", link, "Tipo:", type);
      if (type === "video" || type === "article") {
        window.open(link, "_blank");
      }
    }
  });

  const mediumCardContainer = document.querySelector(".medium-card-container") || mediumCardSlider.parentElement;
  console.log("mediumCardContainer:", mediumCardContainer);
  if (mediumCardContainer) {
    mediumCardContainer.addEventListener("mouseenter", pauseAutoSlide);
    mediumCardContainer.addEventListener("mouseleave", resumeAutoSlide);
  } else {
    console.warn("Elemento .medium-card-container não encontrado, usando mediumCardSlider como fallback.");
  }

  // Adicionar suporte a swipe (deslizar) no carrossel
  let touchStartX = 0;
  let touchEndX = 0;

  mediumCardSlider.addEventListener("touchstart", function (event) {
    touchStartX = event.touches[0].clientX;
    pauseAutoSlide(); // Pausar o auto-slide ao iniciar o toque
  });

  mediumCardSlider.addEventListener("touchmove", function (event) {
    touchEndX = event.touches[0].clientX;
  });

  mediumCardSlider.addEventListener("touchend", function () {
    const swipeDistance = touchEndX - touchStartX;
    const minSwipeDistance = 50; // Distância mínima para considerar um swipe

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Deslizar para a direita (anterior)
        currentIndex = (currentIndex - 1 + covers.length) % covers.length;
        updateMediumCard("swipe-left");
      } else {
        // Deslizar para a esquerda (próximo)
        currentIndex = (currentIndex + 1) % covers.length;
        updateMediumCard("swipe-right");
      }
      resetAutoSlide(); // Reiniciar o auto-slide após o swipe
    } else {
      resumeAutoSlide(); // Retomar o auto-slide se não houver swipe
    }
  });

  loadMediumCards();

  // === 3. Carregar os Cards da Seção "Tendência em IA" Dinamicamente ===
  function loadTrendsCards() {
    fetch('data/cards.json')
      .then(response => response.json())
      .then(data => {
        const container = document.querySelector('.trends-cards-container');
        container.innerHTML = '';
        data.trends.forEach(card => {
          const article = document.createElement('article');
          article.classList.add('trends-card');
          article.innerHTML = `
            <div class="card-image">
              <a href="${card.link}" target="_blank" rel="noopener noreferrer">
                <img src="${card.image}" alt="${card.alt}" loading="lazy">
              </a>
            </div>
            <div class="card-content">
              <time datetime="${card.date}" class="card-date">${new Date(card.date).toLocaleDateString('pt-BR')}</time>
              <h2 class="card-title">
                <a href="${card.link}" aria-label="Leia mais sobre ${card.title}">${card.title}</a>
              </h2>
              <p class="card-excerpt">${card.excerpt}</p>
              <span class="card-author">${card.author}</span>
            </div>
          `;
          container.appendChild(article);
        });
      })
      .catch(error => {
        console.error('Erro ao carregar os cards:', error);
      });
  }

  loadTrendsCards();

  // === 4. Carregar os Cards Menores da Seção "Comece por Aqui e Tópicos" ===
  function loadTopicsCards() {
    fetch('data/topics-cards.json')
      .then(response => response.json())
      .then(data => {
        const container = document.querySelector('.small-topics-container');
        container.innerHTML = '';
        let row = null;

        data.topics.forEach((item, index) => {
          if (index === 0 || index % 2 === 1) {
            row = document.createElement('div');
            row.classList.add('small-topic-row');
            container.appendChild(row);
          }

          if (item.type === 'sidebar') {
            const sidebarCard = document.createElement('article');
            sidebarCard.classList.add('sidebar-card', 'stats-card');
            sidebarCard.innerHTML = `
              <div class="sidebar-card-stats">
                <div class="stats-topics">
                  <div class="icon-newsletter-container">
                    <span class="icon-newsletter" aria-hidden="true"><i class="fas fa-newspaper"></i></span>
                    <span class="topics-count">${item.topicsCount}</span>
                  </div>
                  <p class="stats-label">TÓPICOS</p>
                </div>
                <div class="stats-comments">
                  <div class="icon-comments-container">
                    <span class="icon-comments" aria-hidden="true"><i class="fas fa-comments"></i></span>
                    <span class="comments-count">${item.commentsCount}</span>
                  </div>
                  <p class="stats-label">COMENTÁRIOS</p>
                </div>
              </div>
              <a href="${item.link}" class="topics-sidebar-button" target="_blank" aria-label="Veja mais detalhes sobre tópicos e comentários">
                <span class="topics-sidebar-button">Saiba Mais</span>
              </a>
            `;
            container.insertBefore(sidebarCard, container.firstChild);
          } else if (item.type === 'topic') {
            const topicCard = document.createElement('article');
            topicCard.classList.add('small-topic-card', `${item.title.toLowerCase().replace(/\s/g, '-')}-card`);
            topicCard.innerHTML = `
              <div class="small-card-link-container">
                <a href="${item.link}" class="small-card-image-link" target="_blank" aria-label="Veja mais sobre ${item.title}">
                  <img src="${item.image}" alt="${item.alt}" class="small-card-image" loading="lazy">
                </a>
                <div class="small-card-content">
                  <h4>
                    <a href="${item.link}" class="small-card-title-link" target="_blank" aria-label="Leia mais sobre ${item.title}" title="${item.title}">
                      <span class="small-card-title">${item.title}</span>
                    </a>
                  </h4>
                  <p class="small-card-description">${item.description}</p>
                </div>
              </div>
            `;
            row.appendChild(topicCard);
          } else if (item.type === 'stats') {
            const statsCard = document.createElement('article');
            statsCard.classList.add('small-topic-card', `stats-card-${index + 1}`);
            statsCard.innerHTML = `
              <div class="small-card-stats">
                <div class="stats-topics">
                  <div class="icon-newsletter-container">
                    <span class="icon-newsletter" aria-hidden="true"><i class="fas fa-newspaper"></i></span>
                    <span class="topics-count">${item.topicsCount}</span>
                  </div>
                  <p class="stats-label">TÓPICOS</p>
                </div>
                <div class="stats-comments">
                  <div class="icon-comments-container">
                    <span class="icon-comments" aria-hidden="true"><i class="fas fa-comments"></i></span>
                    <span class="comments-count">${item.commentsCount}</span>
                  </div>
                  <p class="stats-label">COMENTÁRIOS</p>
                </div>
                <a href="${item.link}" class="newsletter-link" target="_blank" aria-label="Assinar Newsletter para mais tópicos">
                  <span class="icon-newsletter-sign" aria-hidden="true"><i class="fas fa-envelope"></i></span>
                </a>
              </div>
            `;
            row.appendChild(statsCard);
          }
        });
      })
      .catch(error => {
        console.error('Erro ao carregar os cards de tópicos:', error);
      });
  }

  loadTopicsCards();

  // === 5. Carregar os Cards da Seção "Notícias em Destaque" Dinamicamente ===
  function loadNewsCards() {
    fetch('data/news-cards.json')
      .then(response => response.json())
      .then(data => {
        const topContainer = document.querySelector('.top-cards-container');
        const featuredCard = topContainer.querySelector('.news-card.featured');
        const sideCardsContainer = topContainer.querySelector('.side-cards');
        const bottomContainer = document.querySelector('.bottom-cards-container');

        // Limpar os fallbacks
        topContainer.querySelectorAll('.loading-fallback').forEach(el => el.remove());
        sideCardsContainer.querySelectorAll('.loading-fallback').forEach(el => el.remove());
        bottomContainer.querySelectorAll('.loading-fallback').forEach(el => el.remove());

        data.news.forEach((card, index) => {
          const article = document.createElement('article');
          article.classList.add('news-card', card.type);

          if (card.type === 'featured') {
            article.innerHTML = `
              <div class="news-image-top">
                <a href="${card.link}" target="_blank" rel="noopener noreferrer" aria-label="Leia sobre ${card.title}">
                  <img src="${card.image}" alt="${card.alt}" loading="lazy">
                </a>
                <a href="${card.link}" target="_blank" rel="noopener noreferrer" class="title-link" aria-label="Leia sobre ${card.title}" title="${card.title}">
                  <span class="news-overlay-title">${card.title}</span>
                </a>
              </div>
              <div class="news-content">
                <time datetime="${card.date}" class="news-date">${new Date(card.date).toLocaleDateString('pt-BR')}</time>
                <h3 class="news-title">
                  <a href="${card.link}" target="_blank" rel="noopener noreferrer" aria-label="Leia sobre ${card.title}" title="${card.title}">
                    ${card.title}
                  </a>
                </h3>
                <p class="news-excerpt">${card.excerpt}</p>
                <p class="news-author">${card.author}</p>
              </div>
            `;
            featuredCard.replaceWith(article);
          } else if (card.type === 'side') {
            article.innerHTML = `
              <div class="news-image-top">
                <a href="${card.link}" target="_blank" rel="noopener noreferrer" aria-label="Leia sobre ${card.title}">
                  <img src="${card.image}" alt="${card.alt}" loading="lazy">
                </a>
                <a href="${card.link}" target="_blank" rel="noopener noreferrer" class="title-link" aria-label="Leia sobre ${card.title}" title="${card.title}">
                  <span class="news-overlay-title">${card.title}</span>
                </a>
              </div>
              <div class="news-content">
                <time datetime="${card.date}" class="news-date">${new Date(card.date).toLocaleDateString('pt-BR')}</time>
                <h3 class="news-title">
                  <a href="${card.link}" target="_blank" rel="noopener noreferrer" aria-label="Leia sobre ${card.title}" title="${card.title}">
                    ${card.title}
                  </a>
                </h3>
                <p class="news-excerpt">${card.excerpt}</p>
                <p class="news-author">${card.author}</p>
              </div>
            `;
            sideCardsContainer.appendChild(article);
          } else if (card.type === 'bottom') {
            article.innerHTML = `
              <div class="news-image">
                <a href="${card.link}" target="_blank" rel="noopener noreferrer">
                  <img src="${card.image}" alt="${card.alt}" loading="lazy">
                </a>
              </div>
              <div class="news-content">
                <time datetime="${card.date}" class="news-date">${new Date(card.date).toLocaleDateString('pt-BR')}</time>
                <h3 class="news-title">
                  <a href="${card.link}" target="_blank" rel="noopener noreferrer" aria-label="Leia sobre ${card.title}" title="${card.title}">
                    ${card.title}
                  </a>
                </h3>
                <p class="news-excerpt">${card.excerpt}</p>
                <p class="news-author">${card.author}</p>
              </div>
            `;
            bottomContainer.appendChild(article);
          }
        });
      })
      .catch(error => {
        console.error('Erro ao carregar os cards de notícias:', error);
      });
  }

  loadNewsCards();

  // === 6. Rolagem Suave para Todos os Links Internos ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (event) {
      event.preventDefault(); // Impede o comportamento padrão do link
      const targetId = this.getAttribute('href').substring(1); // Obtém o ID do alvo (ex.: "news" ou "art")
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY; // Calcula a posição do elemento
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        console.log(`Rolagem suave para a seção: ${targetId}, posição: ${targetPosition}`);
      } else {
        console.warn(`Elemento com ID "${targetId}" não encontrado.`);
      }
    });
  });

  // === 7. Botão Voltar ao Topo (Página Inicial) ===
const homeBackToTopButton = document.getElementById('home-back-to-top');

if (homeBackToTopButton) {
  // Mostrar/esconder o botão com base no scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 1500) { // Mostra o botão após rolar 1500px
      homeBackToTopButton.classList.add('visible');
    } else {
      homeBackToTopButton.classList.remove('visible');
    }
  });

  // Rolar para o topo ao clicar no botão
  homeBackToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
} else {
  console.error('Botão #home-back-to-top não encontrado!');
}
});