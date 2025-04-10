// scripts/trends-page.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM da página de tendências pronto.");

    // --- Variáveis Globais ---
    let currentPage = 1;
    const trendsPerPage = 12; // Ajuste: 12 = 3 linhas de 4 cards
    let allTrends = [];
    let allTrendsFiltered = []; // Para futura busca/filtro

    // --- Seletores DOM ---
    const loadingElement = document.getElementById('loading-trends');
    const container = document.querySelector('.trends-cards-container-grid'); 
    const prevPageButton = document.querySelector('.prev-page');
    const nextPageButton = document.querySelector('.next-page');
    const paginationContainer = document.querySelector('.pagination-controls');
    // Adicionar seletores para busca/ordenação aqui se/quando implementar

    // --- Validação Inicial ---
    if (!container) {
        console.error('Erro Crítico: Container de tendências (.trends-cards-container-grid) não encontrado!');
        if(loadingElement) loadingElement.textContent = 'Erro ao carregar layout.';
        return;
    }

    // --- Função Principal de Inicialização ---
    async function inicializarPaginaTendencias() {
        if (loadingElement) loadingElement.style.display = 'block';

        try {
            const response = await fetch('data/tendencias.json?v=' + Date.now());
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (!data || !Array.isArray(data.trends)) throw new Error("Formato inválido em tendencias.json");

            allTrends = data.trends;
            console.log(`Total de ${allTrends.length} tendências carregadas.`);

            // Ordena por data (mais recentes primeiro) - Ajuste o campo de data se necessário
            allTrends.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)); 

            // Aplica filtros (nenhum por enquanto)
            applyFiltersAndSort(); 

            // Configura listeners
            setupEventListeners();

        } catch (error) {
            console.error('Erro ao carregar tendências:', error);
            container.innerHTML = '<p class="error-fallback" role="alert">Erro ao carregar tendências.</p>';
        } finally {
            if (loadingElement) loadingElement.style.display = 'none';
        }
    }

    // --- Função para Aplicar Filtros e Ordenação (Placeholder) ---
    function applyFiltersAndSort() {
        // Por enquanto, apenas copia e ordena
        allTrendsFiltered = [...allTrends];
        sortTrendsInternal('recent'); // Ordenação padrão
        
        // Exibe a primeira página
        currentPage = 1;
        displayTrendsPage(currentPage);
    }
    
     // --- Lógica Interna de Ordenação ---
     function sortTrendsInternal(order) {
        console.log(`Ordenando tendências por: ${order}`);
        if (order === 'recent') {
            allTrendsFiltered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        } else if (order === 'oldest') {
            allTrendsFiltered.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
        }
        // Adicionar outras opções de ordenação se necessário (ex: por título)
    }


    // --- Função para Exibir Tendências da Página Atual ---
    function displayTrendsPage(page) {
        console.log(`Exibindo página ${page} de tendências...`);
        if (!container) return;
        container.innerHTML = ''; // Limpa o container

        if (allTrendsFiltered.length === 0) {
            container.innerHTML = '<p class="no-results">Nenhuma tendência encontrada.</p>';
            updatePaginationControls(page, 0);
            return;
        }

        const start = (page - 1) * trendsPerPage;
        const end = start + trendsPerPage;
        const paginatedTrends = allTrendsFiltered.slice(start, end);

        paginatedTrends.forEach(trend => {
            const article = criarCardTendenciaHtml(trend); // Usa a nova função
            container.appendChild(article);
        });

        updatePaginationControls(page, allTrendsFiltered.length);
    }

    // --- Função Auxiliar para Criar o HTML do Card de Tendência (Grid) ---
    function criarCardTendenciaHtml(trendData) {
        const article = document.createElement('article');
        // Classe base para o item do grid
        article.classList.add('trend-card-item'); 

        // Formata a data (adapte se o formato em tendencias.json for diferente)
        let dataFormatada = '';
        try {
           if(trendData.date) {
               dataFormatada = new Date(trendData.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }); // Ex: 09 abr, 2025
           }
        } catch { dataFormatada = trendData.date || ''; }
        const dateTimeAttr = trendData.date || ''; // Para o <time>

        // Link do autor (opcional)
        const autorHtml = trendData.authorName
         ? `<a href="${trendData.authorLink || '#'}" class="author-link" ${trendData.authorLink ? 'target="_blank" rel="noopener noreferrer"' : ''}>${trendData.authorName}</a>`
         : '';


        // Estrutura do Card Menor (inspirado na BBC / seu trends.js da index)
        article.innerHTML = `
            <div class="card-image">
              <a href="${trendData.link || '#'}" target="_blank" rel="noopener noreferrer" aria-label="Ver artigo completo sobre ${trendData.title || 'Tendência'}">
                <img src="${trendData.image || 'assets/imagens/geral/placeholder.png'}" alt="${trendData.alt || `Imagem ${trendData.title || 'Tendência'}`}" loading="lazy">
              </a>
            </div>
            <div class="card-content">
              <h3 class="card-title">
                <a href="${trendData.link || '#'}" target="_blank" rel="noopener noreferrer" title="${trendData.title || ''}">
                    ${trendData.title || 'Sem Título'}
                </a>
              </h3>
              <p class="card-excerpt">${trendData.excerpt || ''}</p>
              <div class="card-meta">
                  ${autorHtml ? `<span class="author-info">${autorHtml}</span>` : ''}
                  ${dataFormatada ? `<time datetime="${dateTimeAttr}" class="card-date">${dataFormatada}</time>` : ''}
              </div>
            </div>
          `;
        return article;
    }

    // --- Função Auxiliar para Atualizar Controles de Paginação ---
    function updatePaginationControls(page, totalItems) {
        console.log(`Atualizando paginação tendências: page=${page}, totalItems=${totalItems}`);
        const pageNumberDisplay = document.querySelector('.page-number');
        // Re-seleciona os botões dentro da função para garantir
        const currentPrevButton = document.querySelector('.prev-page');
        const currentNextButton = document.querySelector('.next-page');

        if (!paginationContainer) return;

        const totalPages = Math.ceil(totalItems / trendsPerPage);

        if (totalItems === 0 || totalPages <= 1) {
            paginationContainer.style.display = 'none';
        } else {
            paginationContainer.style.display = 'flex';
            if (pageNumberDisplay) pageNumberDisplay.textContent = `Página ${page} de ${totalPages}`;
            if (currentPrevButton) currentPrevButton.disabled = (page === 1);
            if (currentNextButton) currentNextButton.disabled = (page >= totalPages);
        }
    }

    // --- Configuração dos Event Listeners ---
    function setupEventListeners() {
        // Paginação
        if (prevPageButton) {
            prevPageButton.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayTrendsPage(currentPage);
                    window.scrollTo({ top: container.offsetTop - 100, behavior: 'smooth' }); // Rola para o topo da lista
                }
            });
        }
        if (nextPageButton) {
            nextPageButton.addEventListener('click', () => {
                const totalPages = Math.ceil(allTrendsFiltered.length / trendsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    displayTrendsPage(currentPage);
                    window.scrollTo({ top: container.offsetTop - 100, behavior: 'smooth' }); // Rola para o topo da lista
                }
            });
        }
        // Adicionar listeners para busca/ordenação aqui no futuro
    }

    // --- Inicia o processo ---
    inicializarPaginaTendencias();

});