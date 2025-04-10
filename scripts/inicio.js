// scripts/inicio.js

// Função Principal - Será chamada quando o DOM estiver pronto
function inicializarPaginaInicial() {
    console.log("DOM pronto. Iniciando scripts da página inicial...");
    inicializarSliderMedio(); // Mantém a lógica do card médio
    inicializarCardsTopicos(); // Mantém a lógica dos cards de tópicos
    carregarNoticiasDestaque(); // <<< NOVA função para notícias da home
}

// === 2. Navegação do Card Médio (Seção "Comece por Aqui") ===
// Mantemos essa lógica como está, pois usa 'medium-cards.json'
// (Apenas colocamos dentro de uma função para organização)
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
    let autoSlideInterval = null;

    // Checagem de elementos essenciais
    if (!mediumCardSlider || !mediumTitleLink || !mediumDescription || !mediumCardOverlay || !prevButton || !nextButton || !sliderIndicators) {
        console.error("Slider Médio: Elementos essenciais não encontrados!");
        return; // Não continua se elementos faltarem
    }

    function loadMediumCards() {
        fetch('data/medium-cards.json') // Continua usando este JSON específico
            .then(response => response.ok ? response.json() : Promise.reject(`HTTP error! status: ${response.status}`))
            .then(data => {
                if (!data || !Array.isArray(data.mediumCards)) {
                     throw new Error("Dados inválidos ou ausentes em medium-cards.json");
                }
                covers = data.mediumCards;
                mediumCardSlider.innerHTML = ''; // Limpa antes de adicionar
                covers.forEach((cover, index) => {
                    const img = document.createElement("img");
                    img.src = cover.src;
                    img.classList.add("medium-card-image");
                    img.setAttribute("data-link", cover.link || '#');
                    img.setAttribute("data-type", cover.type || 'default');
                    img.setAttribute("alt", cover.alt || 'Imagem do card');
                    img.setAttribute("loading", "lazy");
                    mediumCardSlider.appendChild(img);
                });
                createIndicators();
                startAutoSlide(); // Iniciar auto-slide após carregar
                updateMediumCard("initial"); // Atualiza para o primeiro card
            })
            .catch(error => {
                console.error('Erro ao carregar os cards médios:', error);
                // Adicionar feedback visual ao usuário aqui, se desejado
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
                // resetAutoSlide() é chamado dentro de updateMediumCard
            });
            sliderIndicators.appendChild(indicator);
        });
    }

    function updateIndicators() {
        const indicators = sliderIndicators.querySelectorAll(".slider-indicator");
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle("active", index === currentIndex);
        });
    }

    function updateMediumCard(direction) {
        if (covers.length === 0) return; // Não faz nada se não houver cards

        console.log("Atualizando card médio para índice:", currentIndex, "Direção:", direction);
        mediumCardOverlay.style.opacity = 0; // Começa a transição de saída

        // Atualiza o slider
        const offset = -currentIndex * 100;
        mediumCardSlider.style.transform = `translateX(${offset}%)`;

        // Atualiza o conteúdo após a transição visual começar
        // Usamos um pequeno timeout para dar tempo da opacidade diminuir
        setTimeout(() => {
            const currentCover = covers[currentIndex];
            mediumTitleLink.href = currentCover.link || '#';
            const newTitle = currentCover.title || '';
            mediumTitleLink.querySelector(".medium-card-title").textContent = newTitle;
            mediumTitleLink.setAttribute("title", `Acesse ${newTitle}`);
            mediumTitleLink.setAttribute("aria-label", `Acesse ${newTitle}`);
            mediumDescription.textContent = currentCover.description || '';
            mediumCardOverlay.style.opacity = 1; // Inicia a transição de entrada
            updateIndicators(); // Atualiza os indicadores
            resetAutoSlide(); // Reinicia o timer do auto-slide
            console.log("Card médio atualizado!", currentCover.src);
        }, 300); // Ajuste o tempo conforme a duração da sua transição CSS
    }

    function startAutoSlide() {
        clearInterval(autoSlideInterval); // Limpa qualquer intervalo anterior
        if (covers.length > 1) { // Só inicia se houver mais de um card
             autoSlideInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % covers.length;
                updateMediumCard("auto");
            }, 7000); // 7 segundos
            console.log("Auto-slide iniciado.");
        }
    }

    function resetAutoSlide() {
        console.log("Reiniciando auto-slide timer.");
        startAutoSlide(); // Limpa e reinicia
    }

    function pauseAutoSlide() {
        console.log("Auto-slide pausado.");
        clearInterval(autoSlideInterval);
    }

    // --- Event Listeners do Slider Médio ---
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
            console.log("Imagem clicada - Link:", link);
            if (link && link !== '#') {
                window.open(link, "_blank", "noopener,noreferrer");
            }
        }
    });

    const mediumCardContainer = document.querySelector(".medium-card-container");
    if(mediumCardContainer) {
        mediumCardContainer.addEventListener("mouseenter", pauseAutoSlide);
        mediumCardContainer.addEventListener("mouseleave", startAutoSlide); // Retoma ao sair
    }

    // Suporte a Swipe (simplificado)
    let touchStartX = 0;
    mediumCardSlider.addEventListener("touchstart", (event) => {
        touchStartX = event.touches[0].clientX;
        pauseAutoSlide();
    }, { passive: true });

    mediumCardSlider.addEventListener("touchend", (event) => {
        if (touchStartX === 0) return;
        let touchEndX = event.changedTouches[0].clientX;
        let diffX = touchEndX - touchStartX;
        if (Math.abs(diffX) > 50) { // Swipe significativo
            if (diffX > 0) { // Direita (Anterior)
                currentIndex = (currentIndex - 1 + covers.length) % covers.length;
                updateMediumCard("swipe-right");
            } else { // Esquerda (Próximo)
                currentIndex = (currentIndex + 1) % covers.length;
                updateMediumCard("swipe-left");
            }
        } else {
             startAutoSlide(); // Retoma se não foi swipe
        }
        touchStartX = 0; // Reseta
    }, { passive: true });


    loadMediumCards(); // Inicia o carregamento
}


// === 4. Carregar os Cards Menores da Seção "Tópicos" ===
// Mantemos essa lógica como está, pois usa 'topics-cards.json'
function inicializarCardsTopicos() {
     fetch('data/topics-cards.json')
        .then(response => response.ok ? response.json() : Promise.reject(`HTTP error! status: ${response.status}`))
        .then(data => {
            const container = document.querySelector('.small-topics-container');
            if(!container) {
                 console.error("Container de tópicos (.small-topics-container) não encontrado.");
                 return;
            }
             if (!data || !Array.isArray(data.topics)) {
                throw new Error("Dados inválidos ou ausentes em topics-cards.json");
            }

            container.innerHTML = ''; // Limpa o container

            // Adiciona o card da sidebar primeiro, se existir
            const sidebarData = data.topics.find(item => item.type === 'sidebar');
            if (sidebarData) {
                const sidebarCard = document.createElement('article');
                sidebarCard.classList.add('sidebar-card', 'stats-card');
                 sidebarCard.innerHTML = `
                  <div class="sidebar-card-stats">
                    <div class="stats-topics">
                      <div class="icon-newsletter-container">
                        <span class="icon-newsletter" aria-hidden="true"><i class="fas fa-newspaper"></i></span>
                        <span class="topics-count">${sidebarData.topicsCount || 0}</span>
                      </div>
                      <p class="stats-label">TÓPICOS</p>
                    </div>
                    <div class="stats-comments">
                      <div class="icon-comments-container">
                        <span class="icon-comments" aria-hidden="true"><i class="fas fa-comments"></i></span>
                        <span class="comments-count">${sidebarData.commentsCount || 0}</span>
                      </div>
                      <p class="stats-label">COMENTÁRIOS</p>
                    </div>
                  </div>
                  <a href="${sidebarData.link || '#'}" class="topics-sidebar-button" target="_blank" rel="noopener noreferrer" aria-label="Veja mais detalhes sobre tópicos e comentários">
                    <span class="topics-sidebar-button-text">Saiba Mais</span> <!-- Adicionado texto dentro do span -->
                  </a>
                `;
                container.appendChild(sidebarCard);
            }

            // Cria as linhas para os cards de tópicos
             let row = document.createElement('div');
             row.classList.add('small-topic-row');
             container.appendChild(row);
             let itemsInRow = 0;

             data.topics.forEach(item => {
                // Ignora o tipo sidebar aqui, já foi adicionado
                if (item.type === 'sidebar') return;

                 // Adiciona uma nova linha a cada 2 cards de tópico/stats
                 if (itemsInRow > 0 && itemsInRow % 2 === 0) {
                    row = document.createElement('div');
                    row.classList.add('small-topic-row');
                    container.appendChild(row);
                 }

                let topicCard = document.createElement('article');
                topicCard.classList.add('small-topic-card');

                 if (item.type === 'topic') {
                     topicCard.classList.add(`${(item.title || 'default').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-card`); // Gera classe baseada no título
                     topicCard.innerHTML = `
                       <div class="small-card-link-container">
                         <a href="${item.link || '#'}" class="small-card-image-link" target="_blank" rel="noopener noreferrer" aria-label="Veja mais sobre ${item.title || 'Tópico'}">
                           <img src="${item.image || 'assets/imagens/geral/placeholder.png'}" alt="${item.alt || `Imagem ${item.title || 'Tópico'}`}" class="small-card-image" loading="lazy">
                         </a>
                         <div class="small-card-content">
                           <h4>
                             <a href="${item.link || '#'}" class="small-card-title-link" target="_blank" rel="noopener noreferrer" aria-label="Leia mais sobre ${item.title || 'Tópico'}" title="${item.title || 'Tópico'}">
                               <span class="small-card-title">${item.title || 'Sem Título'}</span>
                             </a>
                           </h4>
                           <p class="small-card-description">${item.description || ''}</p>
                         </div>
                       </div>
                     `;
                 } else if (item.type === 'stats') {
                      topicCard.classList.add(`stats-card`);
                      topicCard.innerHTML = `
                        <div class="small-card-stats">
                          <div class="stats-topics">
                             <div class="icon-newsletter-container">
                               <span class="icon-newsletter" aria-hidden="true"><i class="fas fa-newspaper"></i></span>
                               <span class="topics-count">${item.topicsCount || 0}</span>
                              </div>
                              <p class="stats-label">TÓPICOS</p>
                          </div>
                          <div class="stats-comments">
                              <div class="icon-comments-container">
                                <span class="icon-comments" aria-hidden="true"><i class="fas fa-comments"></i></span>
                                <span class="comments-count">${item.commentsCount || 0}</span>
                              </div>
                              <p class="stats-label">COMENTÁRIOS</p>
                          </div>
                           <a href="${item.link || '#'}" class="newsletter-link" target="_blank" rel="noopener noreferrer" aria-label="Assinar Newsletter para mais tópicos">
                             <span class="icon-newsletter-sign" aria-hidden="true"><i class="fas fa-envelope"></i></span>
                           </a>
                        </div>
                      `;
                 } else {
                     console.warn("Tipo de card de tópico desconhecido:", item.type);
                     topicCard = null; // Ignora cards de tipo desconhecido
                 }

                if(topicCard) {
                     row.appendChild(topicCard);
                     itemsInRow++;
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar os cards de tópicos:', error);
             const container = document.querySelector('.small-topics-container');
             if (container) {
                 container.innerHTML = '<p class="error-fallback" role="alert">Não foi possível carregar os tópicos.</p>';
             }
        });
}

// === 5. Carregar os Cards da Seção "Notícias em Destaque" ===
// <<< ESTA É A FUNÇÃO MODIFICADA >>>
function carregarNoticiasDestaque() {
    console.log("Iniciando carregamento das notícias em destaque...");
    fetch('data/noticias.json') // <<< SEM PONTO E VÍRGULA AQUI
        .then(response => {
            if (!response.ok) {
                // Se a resposta não for OK (ex: 404, 500), lança um erro
                throw new Error(`HTTP error! status: ${response.status}, ${response.statusText}`);
            }
            // Se a resposta for OK, tenta converter para JSON
            return response.json();
        })
        .then(data => {
            // O restante do código que processa os dados...
            if (!data || !Array.isArray(data.noticias)) {
                 throw new Error("Formato inválido ou dados ausentes em data/noticias.json");
            }

            const todasNoticias = data.noticias;
            console.log(`Total de notícias carregadas: ${todasNoticias.length}`);
            
            // Seleciona os containers no DOM
            const topContainer = document.querySelector('.top-cards-container');
            const featuredCardPlaceholder = topContainer?.querySelector('.news-card.featured'); // Placeholder original
            const sideCardsContainer = topContainer?.querySelector('.side-cards');
            const bottomContainer = document.querySelector('.bottom-cards-container');

            // Verifica se os containers existem
            if (!topContainer || !sideCardsContainer || !bottomContainer) {
                console.error("Erro: Containers de notícias em destaque não encontrados no DOM.");
                return;
            }

            // Limpa containers existentes (exceto o placeholder do featured)
            sideCardsContainer.innerHTML = '';
            bottomContainer.innerHTML = '';

            // --- Processa Card Principal (Featured) ---
            const noticiaFeatured = todasNoticias.find(n => n.destaqueHome === 'featured');
            let featuredArticleElement = null; // Elemento a ser inserido/substituído

            if (noticiaFeatured) {
                console.log("Notícia em destaque (featured) encontrada:", noticiaFeatured.titulo);
                featuredArticleElement = criarCardNoticiaHtml(noticiaFeatured, 'featured'); // Cria o HTML
            }

            // Substitui ou remove o placeholder do featured card
             if (featuredCardPlaceholder) {
                if (featuredArticleElement) {
                    featuredCardPlaceholder.replaceWith(featuredArticleElement);
                    console.log("Placeholder do featured card substituído.");
                } else {
                    featuredCardPlaceholder.remove(); // Remove se não houver notícia featured nos dados
                    console.log("Nenhuma notícia 'featured' encontrada. Placeholder removido.");
                }
            } else if (featuredArticleElement) {
                // Se o placeholder não existia mas temos a notícia, insere no início do topContainer
                 topContainer.insertBefore(featuredArticleElement, sideCardsContainer);
                 console.warn("Placeholder do featured card não encontrado. Notícia inserida no início.");
            }


            // --- Processa Cards Laterais (Side) ---
            const noticiasSide = todasNoticias
                .filter(n => n.destaqueHome === 'side')
                .sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate)) // Ordena por data (mais recentes primeiro)
                .slice(0, 2); // Pega no máximo 2

            console.log(`Notícias laterais (side) encontradas: ${noticiasSide.length}`);
            noticiasSide.forEach(noticia => {
                const articleElement = criarCardNoticiaHtml(noticia, 'side');
                sideCardsContainer.appendChild(articleElement);
            });

            // --- Processa Cards Inferiores (Bottom) ---
            const noticiasBottom = todasNoticias
                .filter(n => n.destaqueHome === 'bottom')
                .sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate)); // Ordena por data

            console.log(`Notícias inferiores (bottom) encontradas: ${noticiasBottom.length}`);
            noticiasBottom.forEach(noticia => {
                const articleElement = criarCardNoticiaHtml(noticia, 'bottom');
                bottomContainer.appendChild(articleElement);
            });

             console.log("Seção de Notícias em Destaque populada.");

        })
        .catch(error => {
            console.error('Erro ao carregar ou processar data/noticias.json:', error);
            const newsSectionContainer = document.querySelector('#news .container'); // Tenta encontrar um container geral da seção
            if(newsSectionContainer) {
                newsSectionContainer.innerHTML = '<p class="error-fallback" role="alert">Não foi possível carregar as notícias em destaque. Tente novamente mais tarde.</p>';
            } else {
                 // Fallback se nem o container da seção for encontrado
                 const topContainer = document.querySelector('.top-cards-container');
                 if(topContainer) topContainer.innerHTML = '<p class="error-fallback" role="alert">Erro ao carregar notícias.</p>';
            }
        });
}

// --- Função Auxiliar para Criar o HTML do Card de Notícia ---
// Recebe o objeto da notícia e o tipo ('featured', 'side', 'bottom')
function criarCardNoticiaHtml(cardData, tipoCard) {
    const article = document.createElement('article');
    article.classList.add('news-card', tipoCard); // Usa o tipo para a classe

    const linkNoticia = `noticia.html?artigo=${cardData.slug}`; 
    const titulo = cardData.titulo || 'Sem Título';
    const resumo = cardData.resumo || '';
    const imagemSrc = cardData.imagemCard || 'assets/imagens/geral/placeholder.png'; 
    const altImagem = cardData.altImagem || `Imagem para ${titulo}`;
    // const dataFormatadaSimples = cardData.data || ''; // Não usaremos mais esta diretamente
    const isoDateTimeString = cardData.dateTimeIso || cardData.isoDate; // Prioriza data/hora completa, fallback para data
    const autorNome = cardData.autor?.nome || ''; 
    const autorLink = cardData.autor?.link || '#';
    
    // --- NOVA Lógica de Formatação de Data e Hora ---
    let dataHoraFormatada = '';
    let dateTimeAttr = ''; // Para o atributo datetime da tag <time>
    if (isoDateTimeString) {
        try {
            const dateObj = new Date(isoDateTimeString); // Tenta criar objeto Date
             dateTimeAttr = dateObj.toISOString(); // Formato ISO para o atributo

             // Opções para formatação legível em português
             const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' }; // Ex: 2 de março de 2025
             const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true }; // Ex: 11:40 AM / 09:00 AM

             // Verifica se a string ISO contém informação de hora (presença de 'T')
             if (isoDateTimeString.includes('T')) {
                 dataHoraFormatada = `${dateObj.toLocaleDateString('pt-BR', dateOptions)} - ${dateObj.toLocaleTimeString('en-US', timeOptions)}`; // Usa en-US para AM/PM
                 // Ajuste para minúsculas am/pm se preferir: .toLowerCase();
             } else {
                 // Se só tiver a data, formata apenas a data
                 dataHoraFormatada = dateObj.toLocaleDateString('pt-BR', dateOptions);
             }

        } catch (e) {
            console.warn(`Erro ao formatar data/hora para ${cardData.slug}: ${isoDateTimeString}`, e);
            dataHoraFormatada = cardData.data || ''; // Fallback para a data string simples
            dateTimeAttr = cardData.isoDate || '';
        }
    }
    // --- FIM da Nova Lógica ---
    
    const autorHtml = autorNome
        ? `<div class="news-author-info">
             <span class="author-prefix">Por: </span>
             <a href="${autorLink}" class="author-link" ${autorLink !== '#' ? 'target="_blank" rel="noopener noreferrer"' : ''}>${autorNome}</a>
           </div>`
        : '';

    // Estrutura HTML (Ajustada para usar a nova data/hora formatada)
    if (tipoCard === 'featured' || tipoCard === 'side') {
        article.innerHTML = `
          <div class="news-image-top">
            <a href="${linkNoticia}" aria-label="Leia sobre ${titulo}">
              <img src="${imagemSrc}" alt="${altImagem}" loading="lazy">
            </a>
            <a href="${linkNoticia}" class="title-link" aria-label="Leia sobre ${titulo}" title="Leia o artigo completo: ${titulo}">
              <span class="news-overlay-title">${titulo}</span>
            </a>
          </div>
          <div class="news-content">
            <!-- Usa a nova variável dataHoraFormatada -->
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
          <div class="news-image">
            <a href="${linkNoticia}" aria-label="Leia sobre ${titulo}">
              <img src="${imagemSrc}" alt="${altImagem}" loading="lazy">
            </a>
          </div>
          <div class="news-content">
             <!-- Usa a nova variável dataHoraFormatada -->
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
// --- Chama a função principal quando o DOM estiver pronto ---
document.addEventListener('DOMContentLoaded', inicializarPaginaInicial);