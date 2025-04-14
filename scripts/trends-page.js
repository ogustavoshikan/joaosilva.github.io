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

        try {
            const response = await fetch('data/tendencias.json?v=' + Date.now());
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (!data || !Array.isArray(data.trends)) throw new Error("Formato inválido em tendencias.json");

            allTrends = data.trends;
            console.log(`Total de ${allTrends.length} tendências carregadas.`);

            // Ordena por data (mais recentes primeiro) - Ajuste o campo de data se necessário
            allTrends.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)); 

            // Aplica filtros (nenhum por enquanto)c
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
         allTrendsFiltered.sort((a, b) => new Date(b.dateTimeIso || b.date || 0) - new Date(a.dateTimeIso || a.date || 0));
     } else if (order === 'oldest') {
         allTrendsFiltered.sort((a, b) => new Date(a.dateTimeIso || a.date || 0) - new Date(b.dateTimeIso || b.date || 0));
     }
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