// scripts/inicio.js

// =========================================================================
// FUNÇÕES AUXILIARES GERAIS
// =========================================================================

function formatForUrl(text) {
    if (!text) return '';
    return text.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9.]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function criarCardNoticiaHtml(cardData, tipoCard) {
    const article = document.createElement('article');
    article.classList.add('news-card', tipoCard);

    const linkNoticia = `noticia.html?artigo=${cardData.slug}`;
    const titulo = cardData.titulo || 'Sem Título';
    const resumo = cardData.resumo || '';
    const imagemSrc = cardData.imagemCard || 'assets/imagens/geral/placeholder.png';
    const altImagem = cardData.altImagem || `Imagem para ${titulo}`;
    const autorNome = cardData.autor?.nome || '';
    const autorLink = cardData.autor?.link || '#';
    const isoDateTimeString = cardData.dateTimeIso || cardData.isoDate;

    let dataHoraFormatada = '';
    let dateTimeAttr = '';

    if (cardData.dataPublicacao && cardData.horaPublicacao) {
        const parts = cardData.dataPublicacao.split('/');
        if (parts.length === 3) {
            const isoDateOnly = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            const isoDateTimeStringCombined = `${isoDateOnly}T${cardData.horaPublicacao}:00`;
            try {
                const dateObj = new Date(isoDateTimeStringCombined);
                if (!isNaN(dateObj.getTime())) {
                    dateTimeAttr = dateObj.toISOString();
                    const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
                    const timeOptions = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };
                    let formattedDate = dateObj.toLocaleDateString('pt-BR', dateOptions).replace('.', '');
                    formattedDate = formattedDate.replace(/ de /g, ' ');
                    formattedDate = formattedDate.replace(/ (\w)/, (match, p1) => ` ${p1.toUpperCase()}`);
                    const formattedTime = dateObj.toLocaleTimeString('pt-BR', timeOptions).replace(':', 'h');
                    dataHoraFormatada = `${formattedDate} às ${formattedTime}`;
                } else {
                    throw new Error('Data inválida criada a partir de data/hora');
                }
            } catch (e) {
                console.warn(`Erro ao formatar data/hora para notícia "${cardData.slug}". Usando fallback. Erro:`, e);
                dataHoraFormatada = cardData.dataPublicacao || '';
                dateTimeAttr = isoDateTimeString || '';
            }
        } else {
            dataHoraFormatada = cardData.dataPublicacao || '';
            dateTimeAttr = isoDateTimeString || '';
        }
    }
    else if (isoDateTimeString && isoDateTimeString.includes('-')) {
         try {
              const dateObjFallback = new Date(isoDateTimeString + 'T00:00:00Z');
              if (!isNaN(dateObjFallback.getTime())) {
                  let formattedDate = dateObjFallback.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).replace('.','');
                  formattedDate = formattedDate.replace(/ de /g, ' ');
                  formattedDate = formattedDate.replace(/ (\w)/, (match, p1) => ` ${p1.toUpperCase()}`);
                  dataHoraFormatada = formattedDate;
                  dateTimeAttr = isoDateTimeString;
              } else {
                  dataHoraFormatada = cardData.dataPublicacao || '';
                  dateTimeAttr = '';
              }
         } catch (e) {
             console.warn(`Erro ao formatar data (isoDate fallback) para notícia "${cardData.slug}". Erro:`, e);
             dataHoraFormatada = cardData.dataPublicacao || '';
             dateTimeAttr = '';
         }
    }
    else {
        dataHoraFormatada = cardData.data || '';
        dateTimeAttr = '';
    }

    const autorHtml = autorNome
        ? `<div class="news-author-info">
             <span class="author-prefix">Por: </span>
             <a href="${autorLink}" class="author-link" ${autorLink !== '#' ? 'target="_blank" rel="noopener noreferrer"' : ''}>${autorNome}</a>
           </div>`
        : '';

    const chapeuText = cardData.chapeu;
    const chapeuHtml = chapeuText ? `<span class="news-card-chapeu">${chapeuText}</span>` : '';
    const dataChapeuAttr = chapeuText ? `data-chapeu="${chapeuText}"` : '';

    if (tipoCard === 'featured' || tipoCard === 'side') {
        article.innerHTML = `
          <div class="news-image-top" ${dataChapeuAttr}>
            <a href="${linkNoticia}" aria-label="Leia sobre ${titulo}">
              <img src="${imagemSrc}" alt="${altImagem}" loading="lazy">
            </a>
            <a href="${linkNoticia}" class="title-link" aria-label="Leia sobre ${titulo}" title="Leia o artigo completo: ${titulo}">
              <span class="news-overlay-title">${titulo}</span>
            </a>
          </div>
          <div class="news-content">
            ${chapeuHtml}
            <time datetime="${dateTimeAttr}" class="news-date">${dataHoraFormatada}</time>
            <h3 class="news-title">
              <a href="${linkNoticia}" aria-label="Leia sobre ${titulo}" title="Leia o artigo completo: ${titulo}">
                ${titulo}
              </a>
            </h3>
            <p class="news-excerpt">${resumo}</p>
            ${autorHtml}
          </div>
        `;
    } else if (tipoCard === 'bottom') {
         article.innerHTML = `
          <div class="news-image" ${dataChapeuAttr}>
            <a href="${linkNoticia}" aria-label="Leia sobre ${titulo}">
              <img src="${imagemSrc}" alt="${altImagem}" loading="lazy">
            </a>
          </div>
          <div class="news-content">
             ${chapeuHtml}
            <time datetime="${dateTimeAttr}" class="news-date">${dataHoraFormatada}</time>
            <h3 class="news-title">
              <a href="${linkNoticia}" aria-label="Leia sobre ${titulo}" title="Leia o artigo completo: ${titulo}">
                ${titulo}
              </a>
            </h3>
            <p class="news-excerpt">${resumo}</p>
            ${autorHtml}
          </div>
        `;
    }

    return article;
}

// =========================================================================
// INICIALIZAÇÃO DOS COMPONENTES DA PÁGINA INICIAL
// =========================================================================

// -------------------------------------------------------------------------
// 1. Slider Médio (Seção "Comece por Aqui")
// -------------------------------------------------------------------------
function inicializarSliderMedio() {
    let covers = [];
    let currentIndex = 0;
    const mediumCardSlider = document.querySelector(".medium-card-slider");
    const mediumTitleLink = document.querySelector(".medium-title-link");
    const mediumDescription = document.querySelector(".medium-card-description");
    const mediumCardOverlay = document.querySelector(".medium-card-overlay");
    const prevButton = document.querySelector(".medium-nav-button.prev");
    const nextButton = document.querySelector(".medium-nav-button.next");
    const sliderIndicators = document.querySelector(".slider-indicators");
    const mediumCardContainer = document.querySelector(".medium-card-container");
    let autoSlideInterval = null;
    let touchStartX = 0;

    if (!mediumCardSlider || !mediumTitleLink || !mediumDescription || !mediumCardOverlay || !prevButton || !nextButton || !sliderIndicators || !mediumCardContainer) {
        console.error("Slider Médio: Elementos essenciais do DOM não encontrados!");
        return;
    }

    function loadMediumCards() {
        fetch('data/medium-cards.json')
            .then(response => response.ok ? response.json() : Promise.reject(`HTTP error! status: ${response.status}`))
            .then(data => {
                if (!data || !Array.isArray(data.mediumCards) || data.mediumCards.length === 0) {
                     throw new Error("Dados inválidos ou ausentes em medium-cards.json");
                }
                covers = data.mediumCards;
                mediumCardSlider.innerHTML = '';
                covers.forEach((cover) => {
                    const img = document.createElement("img");
                    img.src = cover.src;
                    img.alt = cover.alt || 'Imagem do card';
                    img.classList.add("medium-card-image");
                    img.setAttribute("data-link", cover.link || '#');
                    img.setAttribute("data-type", cover.type || 'default');
                    img.loading = "lazy";
                    mediumCardSlider.appendChild(img);
                });
                createIndicators();
                updateMediumCard("initial");
                startAutoSlide();
            })
            .catch(error => {
                console.error('Erro ao carregar os cards médios:', error);
                mediumCardContainer.innerHTML = '<p class="error-fallback">Erro ao carregar conteúdo.</p>';
            });
    }

    function createIndicators() {
        sliderIndicators.innerHTML = '';
        covers.forEach((_, index) => {
            const indicator = document.createElement("div");
            indicator.classList.add("slider-indicator");
            if (index === 0) indicator.classList.add("active");
            indicator.setAttribute('role', 'button');
            indicator.setAttribute('aria-label', `Ir para slide ${index + 1}`);
            indicator.addEventListener("click", () => {
                if (index === currentIndex) return;
                currentIndex = index;
                updateMediumCard("jump");
            });
            sliderIndicators.appendChild(indicator);
        });
    }

    function updateIndicators() {
        const indicators = sliderIndicators.querySelectorAll(".slider-indicator");
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle("active", index === currentIndex);
            indicator.setAttribute('aria-current', index === currentIndex ? 'true' : 'false');
        });
    }

    function updateMediumCard(direction) {
        if (covers.length === 0) return;

        mediumCardOverlay.style.opacity = 0;

        const offset = -currentIndex * 100;
        mediumCardSlider.style.transform = `translateX(${offset}%)`;

        setTimeout(() => {
            const currentCover = covers[currentIndex];
            const newTitle = currentCover.title || '';
            mediumTitleLink.href = currentCover.link || '#';
            mediumTitleLink.querySelector(".medium-card-title").textContent = newTitle;
            mediumTitleLink.title = `Acesse ${newTitle}`;
            mediumTitleLink.setAttribute("aria-label", `Acesse ${newTitle}`);
            mediumDescription.textContent = currentCover.description || '';

            mediumCardOverlay.style.opacity = 1;
            updateIndicators();
            resetAutoSlide();
        }, 300);
    }

    function startAutoSlide() {
        clearInterval(autoSlideInterval);
        if (covers.length > 1) {
             autoSlideInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % covers.length;
                updateMediumCard("auto");
            }, 7000);
        }
    }

    function resetAutoSlide() {
        startAutoSlide();
    }

    function pauseAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    prevButton.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + covers.length) % covers.length;
        updateMediumCard("prev");
    });

    nextButton.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % covers.length;
        updateMediumCard("next");
    });

    mediumCardSlider.addEventListener("click", (event) => {
        if (event.target.classList.contains("medium-card-image")) {
            const link = event.target.getAttribute("data-link");
            if (link && link !== '#') {
                window.open(link, "_blank", "noopener,noreferrer");
            }
        }
    });

    mediumCardContainer.addEventListener("mouseenter", pauseAutoSlide);
    mediumCardContainer.addEventListener("mouseleave", startAutoSlide);
    mediumCardContainer.addEventListener("focusin", pauseAutoSlide);
    mediumCardContainer.addEventListener("focusout", startAutoSlide);

    mediumCardSlider.addEventListener("touchstart", (event) => {
        touchStartX = event.touches[0].clientX;
        pauseAutoSlide();
    }, { passive: true });

    mediumCardSlider.addEventListener("touchend", (event) => {
        if (touchStartX === 0) return;
        let touchEndX = event.changedTouches[0].clientX;
        let diffX = touchEndX - touchStartX;
        const threshold = 50;

        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                currentIndex = (currentIndex - 1 + covers.length) % covers.length;
                updateMediumCard("swipe-right");
            } else {
                currentIndex = (currentIndex + 1) % covers.length;
                updateMediumCard("swipe-left");
            }
        } else {
             startAutoSlide();
        }
        touchStartX = 0;
    }, { passive: true });

    loadMediumCards();
}

// -------------------------------------------------------------------------
// 2. Cards de Tópicos (Seção "Tópicos e Newsletter")
// -------------------------------------------------------------------------
function inicializarCardsTopicos() {
    const container = document.querySelector('.small-topics-container');
    if (!container) {
        console.error("Container .small-topics-container não encontrado no DOM.");
        return;
    }

    Promise.all([
        fetch('data/topics-cards.json?v=' + Date.now()).then(res => res.ok ? res.json() : Promise.reject('Falha ao carregar topics-cards.json')),
        fetch('data/noticias.json?v=' + Date.now()).then(res => res.ok ? res.json() : Promise.reject('Falha ao carregar noticias.json'))
    ])
    .then(([topicsData, newsData]) => {
        if (!topicsData || !Array.isArray(topicsData.topics)) throw new Error("Dados inválidos ou ausentes em topics-cards.json");
        if (!newsData || !Array.isArray(newsData.noticias)) throw new Error("Dados inválidos ou ausentes em noticias.json");

        const allNewsAndArticles = newsData.noticias;
        const topicArticleCounts = {};
        allNewsAndArticles.forEach(item => {
            if (item.tipoConteudo && item.tipoConteudo.startsWith('topico-')) {
                 const topicSlug = item.tipoConteudo.replace('topico-', '');
                topicArticleCounts[topicSlug] = (topicArticleCounts[topicSlug] || 0) + 1;
            }
        });

        container.innerHTML = '';
        let sidebarCardElement = null;
        const topicRowsContainer = document.createElement('div');
        topicRowsContainer.classList.add('topic-cards-grid');

        let currentRow = null;
        let itemsInCurrentRow = 0;
        const itemsPerRow = 2;

        topicsData.topics.forEach((item, index) => {
            let cardElement = null;

            if (item.type === 'sidebar') {
                sidebarCardElement = document.createElement('aside');
                sidebarCardElement.classList.add('sidebar-card', 'stats-card');
                const topicsDisplayCount = item.topicsCount || 0;
                const commentsDisplayCount = item.commentsCount || 0;

                sidebarCardElement.innerHTML = `
                  <div class="sidebar-card-stats">
                    <div class="stats-item stats-topics">
                      <div class="icon-count-wrapper">
                        <span class="icon-wrapper" aria-hidden="true"><i class="fas fa-newspaper"></i></span>
                        <span class="count topics-count">${topicsDisplayCount}</span>
                      </div>
                      <p class="stats-label">TÓPICOS</p>
                    </div>
                    <div class="stats-item stats-comments">
                      <div class="icon-count-wrapper">
                         <span class="icon-wrapper" aria-hidden="true"><i class="fas fa-comments"></i></span>
                        <span class="count comments-count">${commentsDisplayCount}</span>
                      </div>
                      <p class="stats-label">COMENTÁRIOS</p>
                    </div>
                  </div>
                  <a href="${item.link || '/noticias'}" class="topics-sidebar-button" target="_blank" rel="noopener noreferrer">
                    <span class="topics-sidebar-button-text">Saiba Mais</span>
                  </a>
                `;
                return;
            }

            if (!currentRow || itemsInCurrentRow >= itemsPerRow) {
                currentRow = document.createElement('div');
                currentRow.classList.add('small-topic-row');
                topicRowsContainer.appendChild(currentRow);
                itemsInCurrentRow = 0;
            }

            if (item.type === 'topic') {
                 cardElement = document.createElement('article');
                 const topicSlug = formatForUrl(item.title || `topic-${index}`);
                 cardElement.classList.add('small-topic-card', `${topicSlug}-card`);
                 cardElement.innerHTML = `
                   <div class="small-card-link-container">
                     <a href="${item.link || '#'}" class="small-card-image-link" aria-label="Veja mais sobre ${item.title || 'Tópico'}">
                       <img src="${item.image || 'assets/imagens/geral/placeholder.png'}" alt="${item.alt || ''}" class="small-card-image" loading="lazy">
                     </a>
                     <div class="small-card-content">
                       <h4>
                         <a href="${item.link || '#'}" class="small-card-title-link" title="Ver Tópico: ${item.title || ''}">
                           <span class="small-card-title">${item.title || 'Sem Título'}</span>
                         </a>
                       </h4>
                       <p class="small-card-description">${item.description || ''}</p>
                     </div>
                   </div>
                 `;
            }
            else if (item.type === 'stats') {
                 cardElement = document.createElement('div');
                 cardElement.classList.add('stats-card', 'small-stats-card');

                 const topicSlugForCount = item.topic || '';

                 const topicsDisplayCount = topicArticleCounts[topicSlugForCount] || 0;
                 const commentsDisplayCount = item.commentsCount || 0;

                 const whatsappLink = `https://wa.me/5561982006013?text=${encodeURIComponent('Quero Ficar por Dentro com a Newsletter da Technology AI')}`;

                 cardElement.innerHTML = `
                   <div class="small-card-stats">
                     <div class="stats-item stats-topics">
                        <div class="icon-count-wrapper">
                          <span class="icon-wrapper" aria-hidden="true"><i class="fas fa-newspaper"></i></span>
                          <span class="count topics-count">${topicsDisplayCount}</span>
                         </div>
                         <p class="stats-label">TÓPICOS</p>
                     </div>
                     <div class="stats-item stats-comments">
                         <div class="icon-count-wrapper">
                           <span class="icon-wrapper" aria-hidden="true"><i class="fas fa-comments"></i></span>
                           <span class="count comments-count">${commentsDisplayCount}</span>
                         </div>
                         <p class="stats-label">COMENTÁRIOS</p>
                     </div>
                      <a href="${whatsappLink}" class="newsletter-link whatsapp-join-link" target="_blank" rel="noopener noreferrer" aria-label="Inscrever-se na Newsletter via WhatsApp">
                        <span class="icon-newsletter-sign" aria-hidden="true"><i class="fas fa-envelope"></i></span>
                        <span class="sr-only">Inscrever-se na Newsletter</span>
                      </a>
                   </div>
                 `;
            }

            if (cardElement) {
                 currentRow.appendChild(cardElement);
                 itemsInCurrentRow++;
            }
        });

        if (sidebarCardElement) {
            container.appendChild(sidebarCardElement);
        }
        container.appendChild(topicRowsContainer);

    })
    .catch(error => {
        console.error('Erro ao carregar ou processar JSON para cards de tópicos:', error);
        container.innerHTML = '<p class="error-fallback" role="alert">Erro ao carregar tópicos. Tente novamente mais tarde.</p>';
     });
}

// -------------------------------------------------------------------------
// 3. Notícias em Destaque (Seções Topo e Inferior)
// -------------------------------------------------------------------------
function carregarNoticiasDestaque() {
    const topContainer = document.querySelector('.top-cards-container');
    const bottomContainer = document.querySelector('.bottom-cards-container');

    if (!topContainer || !bottomContainer) {
        console.error("Erro: Containers principais de notícias (.top-cards-container ou .bottom-cards-container) não encontrados no DOM.");
        return;
    }

    const featuredCardPlaceholder = topContainer.querySelector('.news-card.featured');
    const sideCardsContainer = topContainer.querySelector('.side-cards');

    if (!sideCardsContainer) {
        console.error("Erro: Container de notícias laterais (.side-cards) não encontrado dentro de .top-cards-container.");
    }
     if(sideCardsContainer) sideCardsContainer.innerHTML = '';
     bottomContainer.innerHTML = '';


    fetch('data/noticias.json?v=' + Date.now())
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data || !Array.isArray(data.noticias)) {
                 throw new Error("Formato inválido ou dados ausentes em data/noticias.json");
            }

            const todasNoticias = data.noticias;

            const noticiaFeatured = todasNoticias.find(n => n.destaqueHome === 'featured');
            let featuredArticleElement = null;

            if (noticiaFeatured) {
                featuredArticleElement = criarCardNoticiaHtml(noticiaFeatured, 'featured');
            } else {
                 console.warn("Nenhuma notícia marcada como 'featured' encontrada em noticias.json.");
             }

             if (featuredCardPlaceholder) {
                if (featuredArticleElement) {
                    featuredCardPlaceholder.replaceWith(featuredArticleElement);
                } else {
                    featuredCardPlaceholder.remove();
                }
            } else if (featuredArticleElement) {
                 console.warn("Placeholder original para 'featured' card não encontrado. Inserindo no início de .top-cards-container.");
                 topContainer.insertBefore(featuredArticleElement, sideCardsContainer || topContainer.firstChild);
            }


            if (sideCardsContainer) {
                const noticiasSide = todasNoticias
                    .filter(n => n.destaqueHome === 'side')
                    .sort((a, b) => new Date(b.dateTimeIso || b.isoDate) - new Date(a.dateTimeIso || a.isoDate))
                    .slice(0, 2);

                noticiasSide.forEach(noticia => {
                    const articleElement = criarCardNoticiaHtml(noticia, 'side');
                    sideCardsContainer.appendChild(articleElement);
                });
            }

            const noticiasBottom = todasNoticias
                .filter(n => n.destaqueHome === 'bottom')
                .sort((a, b) => new Date(b.dateTimeIso || b.isoDate) - new Date(a.dateTimeIso || a.isoDate));

            noticiasBottom.forEach(noticia => {
                const articleElement = criarCardNoticiaHtml(noticia, 'bottom');
                bottomContainer.appendChild(articleElement);
            });

        })
        .catch(error => {
            console.error('Erro fatal ao carregar ou processar data/noticias.json:', error);
            const errorMessage = '<p class="error-fallback" role="alert">Não foi possível carregar as notícias. Tente novamente mais tarde.</p>';
             if(topContainer) topContainer.innerHTML = errorMessage;
             if(bottomContainer) bottomContainer.innerHTML = errorMessage;
        });
}

// Função para formatar data relativa (simplificada)
// **IMPORTANTE**: Verifique se já tem uma função melhor em global.js!
// Se tiver, use-a. Senão, pode usar esta como ponto de partida.
function formatRelativeTime(isoDateString) {
    if (!isoDateString) return '';
    try {
        const date = new Date(isoDateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

        if (isNaN(date.getTime())) {
             throw new Error('Data inválida para formatRelativeTime');
        }

        if (diffDays <= 1 && now.getDate() === date.getDate()) {
             if (diffHours <= 1) return 'agora mesmo';
             if (diffHours < 24) return `há ${diffHours} horas`;
             return 'hoje'; // Fallback caso as horas falhem
        } else if (diffDays === 1 || (diffDays <= 2 && now.getDate() === date.getDate() + 1) ) {
            return 'ontem';
        } else if (diffDays <= 7) {
            return `há ${diffDays} dias`;
        } else {
            // Para datas mais antigas, retorna formato DD Mês AAAA
            const options = { day: '2-digit', month: 'short', year: 'numeric' };
            let formattedDate = date.toLocaleDateString('pt-BR', options).replace('.', '');
            formattedDate = formattedDate.replace(/ de /g, ' ');
            // Capitaliza o mês
            formattedDate = formattedDate.replace(/ (\w)/, (match, p1) => ` ${p1.toUpperCase()}`);
            return formattedDate;
        }
    } catch (e) {
        console.warn(`Erro ao formatar data relativa para "${isoDateString}":`, e);
        // Tenta extrair pelo menos a data DD/MM/AAAA do isoDate (YYYY-MM-DD)
        const parts = isoDateString.split('T')[0].split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return ''; // Retorna vazio se tudo falhar
    }
}


// Função para criar o HTML de um card da seção "Últimas Notícias" (Layout Novo)
function criarCardUltimaNoticiaHtml(cardData) {
    const article = document.createElement('article');
    article.classList.add('latest-news-card');

    const linkNoticia = `noticia.html?artigo=${cardData.slug}`;
    const titulo = cardData.titulo || 'Sem Título'; // Usando titulo principal
    const resumo = cardData.resumo || '';
    const imagemSrc = cardData.imagemCard || 'assets/imagens/geral/placeholder.png';
    const altImagem = cardData.altImagem || `Imagem para ${titulo}`;
    const chapeu = cardData.chapeu || ''; // Usando chapeu
    const isoDateString = cardData.isoDate; // Usando isoDate do novo JSON

    const dataRelativa = formatRelativeTime(isoDateString); // Usar a função de data relativa

    const chapeuHtml = chapeu ? `<span class="latest-news-chapeu">${chapeu}</span>` : ''; // Mudança de classe para clareza

    // Nova estrutura HTML com imagem à esquerda e conteúdo à direita
    article.innerHTML = `
        <div class="latest-news-image-wrapper">
            <a href="${linkNoticia}" aria-label="Leia mais sobre ${titulo}">
                <img src="${imagemSrc}" alt="${altImagem}" loading="lazy">
            </a>
        </div>
        <div class="latest-news-content-wrapper">
            ${chapeuHtml}
            <h3 class="latest-news-title">
                <a href="${linkNoticia}" title="Leia o artigo completo: ${titulo}">
                    ${titulo}
                </a>
            </h3>
            <time class="latest-news-date" datetime="${isoDateString || ''}">${dataRelativa}</time>
            <p class="latest-news-excerpt">${resumo}</p>
        </div>
    `;
    return article;
}

// -------------------------------------------------------------------------
// 4. Últimas Notícias (Nova Seção - Carregando de ultimas-noticias.json)
// -------------------------------------------------------------------------
function carregarUltimasNoticias() {
    const gridContainer = document.querySelector('.latest-news-grid');

    if (!gridContainer) {
        console.error("Container .latest-news-grid não encontrado no DOM.");
        return;
    }

    // Busca do novo arquivo JSON dedicado
    fetch('data/ultimas-noticias.json?v=' + Date.now())
        .then(response => {
            if (!response.ok) {
                // Tenta buscar noticias.json como fallback ou apenas mostra erro
                 console.warn(`Falha ao carregar ultimas-noticias.json (status: ${response.status}). Verifique se o arquivo existe e está correto.`);
                 throw new Error(`HTTP error! status: ${response.status}`);
                 // Alternativa: return fetch('data/noticias.json?v=' + Date.now()); // Para carregar os 4 mais recentes do geral como fallback
            }
            return response.json();
        })
        .then(data => {
            // Verifica se o array esperado existe dentro do JSON
            if (!data || !Array.isArray(data.ultimasNoticias)) {
                throw new Error("Formato inválido ou array 'ultimasNoticias' ausente em data/ultimas-noticias.json");
            }

            // Pega diretamente o array do JSON (sem filtro, sort ou slice)
            const ultimasNoticias = data.ultimasNoticias;

            gridContainer.innerHTML = ''; // Limpa a mensagem de "carregando"
            gridContainer.classList.remove('loading');

            if (ultimasNoticias.length > 0) {
                ultimasNoticias.forEach(noticia => {
                    // Verifica se o item tem os campos minimos esperados
                    if(noticia && noticia.slug && noticia.titulo && noticia.imagemCard) {
                       const cardElement = criarCardUltimaNoticiaHtml(noticia);
                       gridContainer.appendChild(cardElement);
                    } else {
                        console.warn("Item inválido encontrado em ultimas-noticias.json:", noticia);
                    }
                });
            } else {
                gridContainer.innerHTML = '<p class="no-news-fallback">Nenhuma notícia para exibir nesta seção.</p>';
            }
        })
        .catch(error => {
            console.error('Erro ao carregar as últimas notícias:', error);
            gridContainer.innerHTML = '<p class="error-fallback" role="alert">Erro ao carregar notícias. Tente novamente.</p>';
            gridContainer.classList.remove('loading');
        });
}

// =========================================================================
// FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO E EVENT LISTENER
// =========================================================================

function inicializarPaginaInicial() {
    console.log("DOM pronto. Iniciando scripts da página inicial...");
    inicializarSliderMedio();
    inicializarCardsTopicos();
    carregarNoticiasDestaque();
    carregarUltimasNoticias();
}

document.addEventListener('DOMContentLoaded', inicializarPaginaInicial);