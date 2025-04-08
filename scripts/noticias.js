// scripts/noticias.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM da página de notícias pronto.");

    // --- Variáveis Globais ---
    let currentPage = 1;
    const newsPerPage = 8; // Quantas notícias por página
    let allNews = []; // Armazena TODAS as notícias do noticias.json
    let allNewsFiltered = []; // Armazena notícias após filtragem/ordenação/busca
    let activeCategoryFilter = null; // Guarda o filtro de categoria da URL
    let activeTagFilter = null; // Guarda o filtro de tag da URL

    // --- Seletores DOM ---
    const loadingElement = document.getElementById('loading');
    const container = document.querySelector('.tech-news-container');
    const sortSelect = document.getElementById('news-sort');
    const searchInput = document.getElementById('news-search-input');
    const searchButton = document.getElementById('news-search-button');
    const clearButton = document.getElementById('news-clear-button'); // Botão de limpar busca
    const prevPageButton = document.querySelector('.prev-page');
    const nextPageButton = document.querySelector('.next-page');
    const paginationContainer = document.querySelector('.pagination-controls'); // Seleciona o container da paginação
    const filterInfoElement = document.getElementById('filter-info'); // Elemento para mostrar filtro ativo

    // --- Validação Inicial Essencial ---
    if (!container) {
        console.error('Erro Crítico: Container de notícias (.tech-news-container) não encontrado!');
        return; // Interrompe a execução se o container principal não existe
    }

    // --- Função Principal de Inicialização ---
    async function inicializarPaginaNoticias() {
        console.log("Iniciando carregamento de data/noticias.json...");
        if (loadingElement) loadingElement.style.display = 'block';

        try {
            // Carrega todas as notícias
            const response = await fetch('data/noticias.json?v=' + Date.now()); // Cache bust
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
            const data = await response.json();
            if (!data || !Array.isArray(data.noticias)) throw new Error("Formato inválido em noticias.json");

            allNews = data.noticias;
            console.log(`Total de ${allNews.length} notícias carregadas.`);

            // Verifica Parâmetros de URL para Filtros (ANTES de ordenar/exibir)
            const urlParams = new URLSearchParams(window.location.search);
            activeCategoryFilter = urlParams.get('categoria'); // Ex: 'modelos-de-linguagem'
            activeTagFilter = urlParams.get('tag'); // Ex: 'openai'

            // Aplica filtros e ordenação inicial
            applyFiltersAndSort(); // <<< Função centralizada para filtrar e ordenar

            // Configura os listeners (só precisa fazer uma vez)
            setupEventListeners();

        } catch (error) {
            console.error('Erro ao carregar ou processar data/noticias.json:', error);
            container.innerHTML = '<p class="error-fallback" role="alert">Erro ao carregar notícias.</p>';
        } finally {
            // Esconde o loading mesmo se der erro
            if (loadingElement) {
                setTimeout(() => { loadingElement.style.display = 'none'; }, 300);
            }
        }
    }

    // --- Função para Aplicar Filtros (URL, Busca) e Ordenação ---
    function applyFiltersAndSort() {
        console.log(`Aplicando filtros: Categoria=${activeCategoryFilter}, Tag=${activeTagFilter}, Busca="${searchInput?.value || ''}"`);
        let tempFiltered = [...allNews]; // Começa com todas

        // 1. Aplica filtro de Categoria (se veio da URL)
        if (activeCategoryFilter) {
            tempFiltered = tempFiltered.filter(news =>
                news.categorias?.some(cat => formatForUrl(cat) === activeCategoryFilter)
            );
            displayActiveFilter(`Categoria: ${getOriginalName(activeCategoryFilter, 'category')}`);
        }
        // 2. Aplica filtro de Tag (se veio da URL - ignora se já filtrou por categoria)
        else if (activeTagFilter) {
            tempFiltered = tempFiltered.filter(news =>
                news.tags?.some(tag => formatForUrl(tag) === activeTagFilter)
            );
             displayActiveFilter(`Tag: ${getOriginalName(activeTagFilter, 'tag')}`);
        }
        // 3. Aplica filtro de Busca (se houver texto no input - ignora se já filtrou por URL)
        else if (searchInput && searchInput.value.trim()) {
             const searchLower = searchInput.value.trim().toLowerCase();
             tempFiltered = tempFiltered.filter(news =>
                (news.titulo?.toLowerCase() || '').includes(searchLower) ||
                (news.resumo?.toLowerCase() || '').includes(searchLower) ||
                (news.autor?.nome?.toLowerCase() || '').includes(searchLower) ||
                (news.tags?.some(tag => tag.toLowerCase().includes(searchLower)) || false) ||
                (news.categorias?.some(cat => cat.toLowerCase().includes(searchLower)) || false)
            );
            displayActiveFilter(`Busca por: "${searchInput.value.trim()}"`);
        } else {
             // Se nenhum filtro estiver ativo, limpa a exibição de filtro
             displayActiveFilter(null);
        }

        // Armazena o resultado filtrado
        allNewsFiltered = tempFiltered;

        // Aplica a ordenação selecionada (ou padrão 'recent')
        const currentSortOrder = sortSelect?.value || 'recent';
        sortNewsInternal(currentSortOrder); // Chama a lógica interna de ordenação

        // Exibe a primeira página dos resultados filtrados e ordenados
        currentPage = 1;
        displayNewsPage(currentPage);
    }

    // --- Funções Auxiliares para Filtro ---
    function formatForUrl(text) {
        if (!text) return '';
        // Converte para minúsculas, remove acentos, troca espaços/não-alfanuméricos por hífens
        return text.toLowerCase()
               .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
               .replace(/[^a-z0-9.]+/g, '-') // Mantém letras, números, PONTO e hífen, troca outros por hífen
               .replace(/-+/g, '-') // Remove hífens duplicados
               .replace(/^-+|-+$/g, ''); // Remove hífens no início/fim
}

    function getOriginalName(urlFormattedName, type) {
    console.log(`Buscando nome original para: ${urlFormattedName} (tipo: ${type})`);
    let bestMatch = null; // Armazena a melhor correspondência encontrada
        // Itera por todas as notícias para encontrar uma correspondência exata (após formatação)
    for (const news of allNews) {
         const list = (type === 'category' ? news.categorias : news.tags) || [];
         const found = list.find(item => formatForUrl(item) === urlFormattedName);
         if (found) {
             bestMatch = found; // Encontrou o nome original exato!
             console.log(`Correspondência exata encontrada: ${bestMatch}`);
             break; // Pode parar, já achou
         }
    }
    
    // Se encontrou uma correspondência exata, retorna ela
    if (bestMatch) {
        return bestMatch;
    }
    
    // --- Fallback (se não achou correspondência exata) ---
    // Tenta reconstruir de forma simples, capitalizando palavras separadas por hífen
    console.warn(`Não foi encontrada correspondência exata para "${urlFormattedName}". Tentando reconstrução.`);
    let reconstructedName = urlFormattedName
                            .split('-') // Separa por hífen
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitaliza cada parte
                            .join(' '); // Junta com espaço
                            
                            // Tenta corrigir casos como 'Gpt 4.5' para 'GPT 4.5' (detecta número após ponto)
    reconstructedName = reconstructedName.replace(/(\b[a-z]) (\d+\.\d+)/gi, (match, p1, p2) => `${p1.toUpperCase()} ${p2}`);
    // Tenta corrigir casos como 'Gpt 4' para 'GPT 4'
    reconstructedName = reconstructedName.replace(/(\b[a-z]) (\d+)\b/gi, (match, p1, p2) => `${p1.toUpperCase()} ${p2}`);
    console.log(`Nome reconstruído (fallback): ${reconstructedName}`);
    return reconstructedName;
    
        // Capitaliza a primeira letra de cada palavra (opcional, para melhor exibição)
        return originalName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    // --- Função para Exibir o Filtro Ativo ---
    function displayActiveFilter(filterText) {
        if (filterInfoElement) {
            if (filterText) {
                // Cria o botão apenas se o texto do filtro existir
                filterInfoElement.innerHTML = `Filtrando por: <strong>${filterText}</strong> <button id="clear-filter-btn" class="clear-filter-button" aria-label="Remover filtro">×</button>`;
                filterInfoElement.style.display = 'block'; // Ou 'flex', dependendo do seu CSS
                // Adiciona listener ao botão DEPOIS de criá-lo
                const clearFilterBtn = document.getElementById('clear-filter-btn');
                 if (clearFilterBtn) {
                     clearFilterBtn.addEventListener('click', clearAllFilters);
                 } else {
                      console.warn("Não foi possível encontrar o botão #clear-filter-btn após criá-lo.");
                 }
            } else {
                filterInfoElement.innerHTML = '';
                filterInfoElement.style.display = 'none';
            }
        } else {
            console.warn("Elemento #filter-info não encontrado para exibir filtro ativo.");
        }
    }

    // --- Função para Limpar Todos os Filtros (URL, Busca) ---
    function clearAllFilters() {
        console.log("Limpando todos os filtros...");
        activeCategoryFilter = null;
        activeTagFilter = null;
        if (searchInput) searchInput.value = '';
        if (clearButton) clearButton.style.display = 'none';

        // Remove parâmetros da URL sem recarregar
        if (window.history.pushState) {
            const newUrl = window.location.pathname;
            window.history.pushState({path:newUrl}, '', newUrl);
            console.log("Parâmetros da URL removidos.");
        }

        applyFiltersAndSort(); // Re-aplica (sem filtros) para mostrar tudo e ordenar
    }


    // --- Lógica Interna de Ordenação ---
    function sortNewsInternal(order) {
        console.log(`Ordenando interno por: ${order}`);
        if (order === 'recent') {
            allNewsFiltered.sort((a, b) => new Date(b.isoDate || 0) - new Date(a.isoDate || 0));
        } else if (order === 'oldest') {
            allNewsFiltered.sort((a, b) => new Date(a.isoDate || 0) - new Date(b.isoDate || 0));
        }
    }

    // --- Função para Filtrar Notícias (APENAS por Busca do Input) ---
    function filterNewsBySearch() {
        console.log("Filtrando por busca do input...");
        // Limpa filtros de URL se uma busca for feita
        if(activeCategoryFilter || activeTagFilter) {
            activeCategoryFilter = null;
            activeTagFilter = null;
            // Remove parâmetros da URL sem recarregar
            if (window.history.pushState) {
                const newUrl = window.location.pathname;
                window.history.pushState({path:newUrl}, '', newUrl);
            }
        }
        // Chama a função centralizada que agora usará o valor do input
        applyFiltersAndSort();
    }

    // --- Função para Exibir Notícias da Página Atual ---
    function displayNewsPage(page) {
        console.log(`Exibindo página ${page}...`);
        if (loadingElement) loadingElement.style.display = 'block';
        if (!container) return; // Segurança extra
        container.innerHTML = ''; // Limpa o container

        if (allNewsFiltered.length === 0) {
            // Mantém a exibição do filtro ativo (já definido por applyFiltersAndSort)
            container.innerHTML = '<p class="no-results">Nenhuma notícia encontrada com os filtros aplicados.</p>';
            updatePaginationControls(page, 0);
            if (loadingElement) loadingElement.style.display = 'none';
            return;
        }

        const start = (page - 1) * newsPerPage;
        const end = start + newsPerPage;
        const paginatedNews = allNewsFiltered.slice(start, end);

        console.log(`Exibindo notícias ${start + 1} a ${Math.min(end, allNewsFiltered.length)} de ${allNewsFiltered.length}`);

        paginatedNews.forEach(news => {
            const article = criarCardArquivoHtml(news);
            container.appendChild(article);

            // Adiciona listeners de compartilhamento
            const shareContainer = article.querySelector('.share-container');
            if (shareContainer) {
                const currentTitle = news.titulo || '';
                // Tenta pegar a URL absoluta do link da notícia, senão usa a URL atual
                const newsLinkElement = article.querySelector('.tech-news-title a');
                const currentUrl = newsLinkElement ? newsLinkElement.href : window.location.href;

                // Usando funções separadas para clareza e evitar repetição
                const addShareListener = (selector, url) => {
                    const element = shareContainer.querySelector(selector);
                    if (element) {
                        element.addEventListener('click', (e) => {
                             e.stopPropagation(); // Evita que o clique propague para o card
                             window.open(url, '_blank', 'noopener,noreferrer');
                         });
                    }
                };

                addShareListener('.social-icon.x', `https://twitter.com/intent/tweet?text=${encodeURIComponent(currentTitle)}&url=${encodeURIComponent(currentUrl)}`);
                addShareListener('.social-icon.whatsapp', `https://api.whatsapp.com/send?text=${encodeURIComponent(currentTitle + ' ' + currentUrl)}`);
                addShareListener('.social-icon.facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`);
                addShareListener('.social-icon.linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`);
            }
        });

        updatePaginationControls(page, allNewsFiltered.length);

        // Rola suavemente para o topo (se desejar)
        // window.scrollTo({ top: 0, behavior: 'smooth' }); // Pode ser irritante se o usuário só estiver paginando

        if (loadingElement) {
            setTimeout(() => { loadingElement.style.display = 'none'; }, 300);
        }
    }

    // --- Função Auxiliar para Criar o HTML do Card (sem alterações necessárias aqui) ---
    function criarCardArquivoHtml(cardData) {
        const article = document.createElement('article');
        article.classList.add('tech-news-card');

        const linkNoticia = `noticia.html?artigo=${cardData.slug || ''}`;
        const titulo = cardData.titulo || 'Notícia sem título';
        const resumo = cardData.resumo || '';
        const imagemSrc = cardData.imagemCard || cardData.imagemBanner || 'assets/imagens/geral/placeholder.png';
        const altImagem = cardData.altImagem || `Imagem para ${titulo}`;
        let dataFormatada = cardData.data || '';
        if(cardData.isoDate) {
             try {
                 dataFormatada = new Date(cardData.isoDate + 'T00:00:00').toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
             } catch { /* usa data original */ }
        }
        const isoDate = cardData.isoDate || '';
        const autorNome = cardData.autor?.nome || '';
        const autorLink = cardData.autor?.link || '#';

        const authorHtml = autorNome
            ? `
            <p class="tech-news-author">
              <span class="author-prefix">Por: </span>
              <a href="${autorLink}" class="author-link" title="Ver perfil de ${autorNome}" ${autorLink !== '#' ? 'target="_blank" rel="noopener noreferrer"' : ''}>${autorNome}</a>
              ${dataFormatada ? `<span class="tech-news-date"><time datetime="${isoDate}">${dataFormatada}</time></span>` : ''}
            </p>`
            : `${dataFormatada ? `<p class="tech-news-author"><span class="tech-news-date"><time datetime="${isoDate}">${dataFormatada}</time></span></p>` : ''}`;

        article.innerHTML = `
            <div class="tech-news-image">
              <a href="${linkNoticia}" aria-label="Leia mais sobre ${titulo}">
                <img src="${imagemSrc}" alt="${altImagem}" loading="lazy">
              </a>
            </div>
            <div class="tech-news-content">
              <h3 class="tech-news-title">
                <a href="${linkNoticia}" title="${titulo}">
                  ${titulo}
                </a>
              </h3>
              <p class="tech-news-excerpt">${resumo}</p>
              <div class="card-bottom-row">
                ${authorHtml}
                <div class="share-container">
                  <div class="social-icon x" role="button" tabindex="0" aria-label="Compartilhar no X"><i class="fab fa-x-twitter"></i></div>
                  <div class="social-icon whatsapp" role="button" tabindex="0" aria-label="Compartilhar no WhatsApp"><i class="fab fa-whatsapp"></i></div>
                  <div class="social-icon facebook" role="button" tabindex="0" aria-label="Compartilhar no Facebook"><i class="fab fa-facebook-f"></i></div>
                  <div class="social-icon linkedin" role="button" tabindex="0" aria-label="Compartilhar no LinkedIn"><i class="fab fa-linkedin-in"></i></div>
                </div>
              </div>
            </div>
        `;
        return article;
    }

    // --- Função Auxiliar para Atualizar Controles de Paginação ---
    function updatePaginationControls(page, totalItems) {
        console.log(`Atualizando paginação: page=${page}, totalItems=${totalItems}`);
        const pageNumberDisplay = document.querySelector('.page-number');
        // Seleciona os botões novamente aqui para garantir que temos as referências certas
        const currentPrevButton = document.querySelector('.prev-page');
        const currentNextButton = document.querySelector('.next-page');

        if (!paginationContainer) {
             console.warn("Container da paginação .pagination-controls não encontrado!");
             return;
        }

        const totalPages = Math.ceil(totalItems / newsPerPage);
        console.log(`Total de páginas calculado: ${totalPages}`);

        if (totalItems === 0 || totalPages <= 1) {
            paginationContainer.style.display = 'none';
        } else {
            paginationContainer.style.display = 'flex';

            if (pageNumberDisplay) {
                pageNumberDisplay.textContent = `Página ${page} de ${totalPages}`;
            } else { console.warn("Elemento .page-number não encontrado."); }

            if (currentPrevButton) {
                currentPrevButton.disabled = (page === 1);
            } else { console.warn("Botão .prev-page não encontrado."); }

            if (currentNextButton) {
                currentNextButton.disabled = (page >= totalPages);
            } else { console.warn("Botão .next-page não encontrado."); }
        }
    }

    // --- Configuração dos Event Listeners (Chamado uma vez) ---
    function setupEventListeners() {
        console.log("Configurando event listeners da página de notícias...");
        // Listener para o filtro de ordenação
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                sortNewsInternal(sortSelect.value); // Ordena os dados filtrados
                currentPage = 1; // Volta para a primeira página
                displayNewsPage(currentPage); // Re-exibe
            });
        } else { console.warn('Elemento #news-sort não encontrado!'); }

        // Listeners para a barra de pesquisa
        if (searchInput && searchButton && clearButton) {
            searchButton.addEventListener('click', filterNewsBySearch); // Chama a função que limpa filtros URL e aplica a busca
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') filterNewsBySearch();
            });
            searchInput.addEventListener('input', () => {
                clearButton.style.display = searchInput.value ? 'inline-block' : 'none';
            });
            clearButton.addEventListener('click', clearAllFilters); // Botão limpar chama a limpeza geral
            clearButton.style.display = searchInput.value ? 'inline-block' : 'none';
        } else { console.warn('Elementos de pesquisa não encontrados!'); }

        // Paginação - Listeners
        if (prevPageButton) {
            prevPageButton.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayNewsPage(currentPage);
                }
            });
        } else { console.warn("Botão de paginação .prev-page não encontrado.");}

        if (nextPageButton) {
            nextPageButton.addEventListener('click', () => {
                const totalPages = Math.ceil(allNewsFiltered.length / newsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    displayNewsPage(currentPage);
                }
            });
        } else { console.warn("Botão de paginação .next-page não encontrado.");}

         // REMOVIDO: Listener para Botão Voltar ao Topo específico daqui (agora é global)
         // REMOVIDO: Lógica do Menu Hamburger (agora é global)
    }

    // --- Inicia todo o processo ---
    inicializarPaginaNoticias();

}); // Fim do DOMContentLoaded