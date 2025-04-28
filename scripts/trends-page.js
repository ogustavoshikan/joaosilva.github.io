// scripts/trends-page.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM da página de tendências pronto.");

    // --- Configurações ---
    const trendsPerLoad = 4; // Quantas tendências carregar por vez em cada seção
    
    // --- Variáveis Globais ---
    let allTrends = [];
    let groupedTrends = {}; // Objeto para guardar tendências agrupadas por tópico
    let loadedCounts = {}; // Objeto para rastrear quantos foram carregados por tópico

    // --- Seletores DOM ---
    const loadingElement = document.getElementById('loading-trends');
    const topicsContainer = document.getElementById('topic-sections-container'); 

    // --- Validação Inicial ---
    if (!topicsContainer) {
        console.error('Erro Crítico: Container de seções (#topic-sections-container) não encontrado!');
        if (loadingElement) loadingElement.textContent = 'Erro de layout.';
        return;
    }
        
    // --- Função para Calcular Tempo Relativo ---
function formatRelativeTime(isoDateTimeString) {
    if (!isoDateTimeString) return ''; // Retorna vazio se não houver data/hora

    try {
        const publicationDate = new Date(isoDateTimeString);
        if (isNaN(publicationDate.getTime())) throw new Error('Data inválida'); // Verifica se a data é válida

        const now = new Date();
        const diffInSeconds = Math.floor((now - publicationDate) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        const thresholdDays = 7; // Limite para mostrar "X dias atrás"

        if (diffInSeconds < 60) {
            return "Agora mesmo";
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''} atrás`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;
        } else if (diffInDays <= thresholdDays) {
            return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
        } else {
            // Se for mais antigo, retorna a data formatada "DD Mês AAAA"
            const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
            let formattedDate = publicationDate.toLocaleDateString('pt-BR', dateOptions).replace('.', '');
            formattedDate = formattedDate.replace(/ de /g, ' ');
            formattedDate = formattedDate.replace(/ (\w)/, (match, p1) => ` ${p1.toUpperCase()}`);
            return formattedDate;
        }
    } catch (error) {
        console.warn(`Erro ao formatar tempo relativo para ${isoDateTimeString}:`, error);
        // Fallback para data original se houver erro
        try {
           // Tenta formatar a data original se possível
           const fallbackDate = new Date(isoDateTimeString.split('T')[0] + 'T00:00:00'); // Pega só a data
           if(!isNaN(fallbackDate.getTime())){
                const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
                let formattedDate = fallbackDate.toLocaleDateString('pt-BR', dateOptions).replace('.', '');
                formattedDate = formattedDate.replace(/ de /g, ' ');
                formattedDate = formattedDate.replace(/ (\w)/, (match, p1) => ` ${p1.toUpperCase()}`);
                return formattedDate;
           }
        } catch {}
        return isoDateTimeString || ''; // Último fallback
    }
}

    // --- Função Principal de Inicialização ---
    async function inicializarPaginaTendencias() {
        if (loadingElement) loadingElement.style.display = 'block';
        topicsContainer.innerHTML = ''; 

        try {
            const response = await fetch('data/tendencias.json?v=' + Date.now());
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (!data || !Array.isArray(data.trends)) throw new Error("Formato inválido em tendencias.json");

            allTrends = data.trends;
            allTrends.sort((a, b) => new Date(b.dateTimeIso || b.date || 0) - new Date(a.dateTimeIso || a.date || 0)); 
            groupedTrends = groupTrendsByTopic(allTrends);
            renderTopicSections(groupedTrends);
            setupLoadMoreListener();
            
        } catch (error) {
            console.error('Erro ao carregar/processar tendências:', error);
            topicsContainer.innerHTML = '<p class="error-fallback" role="alert">Erro ao carregar tendências.</p>';
        } finally {
            if (loadingElement) loadingElement.style.display = 'none';
        }
    }

    // --- Função para Agrupar Tendências por Tópico ---
    function groupTrendsByTopic(trends) {
        const groups = {};
        trends.forEach(trend => {
            const topic = trend.topico || "Outros"; 
            if (!groups[topic]) { groups[topic] = []; }
            groups[topic].push(trend); 
        });
        console.log("Tendências agrupadas:", groups);
        return groups;
    }

    // --- Função para Renderizar as Seções e Cards Iniciais ---
    function renderTopicSections(groupedData) {
        topicsContainer.innerHTML = ''; 
        const topicOrder = ["LLMs", "Regulamentação", "Geopolítica da IA", "Empresas e Visão", "Ética na IA"]; // <<< AJUSTE A ORDEM COMO QUISER
        const sortedTopics = Object.keys(groupedData).sort((a, b) => {
            const indexA = topicOrder.indexOf(a);
            const indexB = topicOrder.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1; 
            if (indexB !== -1) return 1;
            return a.localeCompare(b); 
        });

        sortedTopics.forEach(topicName => {
            const trendsInTopic = groupedData[topicName];
            if (!trendsInTopic || trendsInTopic.length === 0) return; 

            const section = document.createElement('section');
            section.className = 'topic-section';
            section.id = `topic-${formatForUrl(topicName)}`; 
            
            const title = document.createElement('h2');
            title.className = 'topic-section-title';
            title.textContent = topicName;

            const gridContainer = document.createElement('div');
            // Adiciona classe base e classe específica do tópico
            gridContainer.className = `trends-cards-container-grid topic-${formatForUrl(topicName)}-grid`; 

            section.appendChild(title);
            section.appendChild(gridContainer);
            renderMoreTrends(topicName, gridContainer, 0); // Renderiza os primeiros cards
            topicsContainer.appendChild(section); 
        });
    }

     // --- Função para Renderizar MAIS Tendências em uma Seção ---
     function renderMoreTrends(topicName, gridContainer, startIndex) {
        const trendsToRender = groupedTrends[topicName]?.slice(startIndex, startIndex + trendsPerLoad) || [];
        let newCardsHtml = '';
        trendsToRender.forEach(trend => {
             const articleElement = criarCardTendenciaHtml(trend);
             newCardsHtml += articleElement.outerHTML; 
         });
        gridContainer.insertAdjacentHTML('beforeend', newCardsHtml); 
        loadedCounts[topicName] = (loadedCounts[topicName] || 0) + trendsToRender.length;
        addOrUpdateLoadMoreButton(topicName, gridContainer.parentNode); // Passa a <section>
    }

    // --- Função para Adicionar/Atualizar o Botão "Carregar Mais" ---
    function addOrUpdateLoadMoreButton(topicName, sectionElement) {
        const totalInTopic = groupedTrends[topicName]?.length || 0;
        const currentlyLoaded = loadedCounts[topicName] || 0;
        let loadMoreContainer = sectionElement.querySelector('.load-more-container');
        if (loadMoreContainer) loadMoreContainer.remove(); // Remove botão antigo

        if (currentlyLoaded < totalInTopic) { // Adiciona só se houver mais
             loadMoreContainer = document.createElement('div');
             loadMoreContainer.className = 'load-more-container';
             const button = document.createElement('button');
             button.className = 'load-more-button pagination-button'; // Reutiliza estilo
             button.textContent = 'Carregar Mais';
             button.dataset.topic = topicName; 
             button.dataset.loaded = currentlyLoaded; 
             loadMoreContainer.appendChild(button);
             sectionElement.appendChild(loadMoreContainer); 
        }
    }

    // --- Função Auxiliar para Criar o HTML do Card de Tendência (Grid) ---
    function criarCardTendenciaHtml(trendData) {
        const article = document.createElement('article');
    article.classList.add('trend-card-item'); 

        // --- Formatação de Tempo Relativo ---
    const relativeTime = formatRelativeTime(trendData.dateTimeIso || trendData.date); // <<< USA A NOVA FUNÇÃO
    const dateTimeAttr = trendData.dateTimeIso || trendData.date || ''; // Para atributo datetime

    // --- HTML do Autor e Avatar ---
        const authorNameHtml = trendData.authorName
            ? `<a href="${trendData.authorLink || '#'}" class="trend-author-link" ${trendData.authorLink ? 'target="_blank" rel="noopener noreferrer"' : ''}>${trendData.authorName}</a>`
            : '<span class="trend-author-name">Redação</span>'; 
        const authorAvatarHtml = `<img src="${trendData.authorAvatarUrl || 'assets/imagens/autores/placeholder-avatar.png'}" alt="${trendData.authorName ? 'Avatar de ' + trendData.authorName : 'Avatar'}" class="trend-author-avatar" loading="lazy">`;
        
        // <<< MODIFICAÇÃO: Link Principal aponta para a página de detalhe >>>
        const linkDetalheTendencia = `/tendencia.html?slug=${trendData.slug || ''}`;
        // --- Fim Autor ---

        // Estrutura do Card Menor
        article.innerHTML = `
            <div class="trend-card-item__image-container">
              <!-- Link da imagem também aponta para o detalhe -->
              <a href="${linkDetalheTendencia}" aria-label="Ver detalhes sobre ${trendData.title || 'Tendência'}">
                <img src="${trendData.image || 'assets/imagens/geral/placeholder.png'}" alt="${trendData.alt || `Imagem ${trendData.title || 'Tendência'}`}" loading="lazy">
              </a>
            </div>
            <div class="card-content">
              <h3 class="card-title">
                 <!-- Link do título também aponta para o detalhe -->
                <a href="${linkDetalheTendencia}" title="${trendData.title || ''}">
                    ${trendData.title || 'Sem Título'}
                </a>
              </h3>
              <p class="card-excerpt">${trendData.excerpt || ''}</p>
              <div class="card-meta-new"> 
                  ${authorAvatarHtml}
                  <div class="trend-meta-text">
                      <span class="trend-author-name">${authorNameHtml}</span> 
                      <time datetime="${dateTimeAttr}" class="trend-relative-time">${relativeTime}</time> 
                  </div>
              </div>
            </div>
          `;
        return article;
    }
    
    // --- Função Auxiliar para Formatar URL (precisa existir aqui) ---
    function formatForUrl(text) { 
        if (!text) return '';
        return text.toLowerCase()
                   .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                   .replace(/[^a-z0-9.]+/g, '-') // Mantém ponto
                   .replace(/-+/g, '-')
                   .replace(/^-+|-+$/g, '');
    }
    
    // --- Configuração do Listener para "Carregar Mais" ---
    function setupLoadMoreListener() {
         topicsContainer.addEventListener('click', function(event) {
             if (event.target && event.target.classList.contains('load-more-button')) {
                 const button = event.target;
                 const topic = button.dataset.topic;
                 const alreadyLoaded = parseInt(button.dataset.loaded || '0', 10);
                 // Encontra o grid DENTRO da seção pai do botão
                 const gridContainer = button.closest('.topic-section')?.querySelector('.trends-cards-container-grid'); 
                 
                 if (topic && gridContainer) {
                      console.log(`Carregando mais ${topic} a partir de ${alreadyLoaded}`);
                      button.disabled = true; 
                      button.textContent = 'Carregando...'; 
                      setTimeout(() => { // Delay apenas para feedback visual
                         renderMoreTrends(topic, gridContainer, alreadyLoaded);
                      }, 200); 
                 } else {
                      console.error("Não foi possível encontrar o tópico ou o grid para carregar mais.");
                 }
             }
         });
    }
        
    // --- Inicia o processo ---
    inicializarPaginaTendencias();

});