document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM da página de detalhe da tendência pronto.");
    carregarTendenciaDoJson();
});

// --- Função para Calcular Tempo Relativo (Copiar de trends-page.js ou global.js) ---
function formatRelativeTime(isoDateTimeString) {
    if (!isoDateTimeString) return ''; 
    try {
        const publicationDate = new Date(isoDateTimeString);
        if (isNaN(publicationDate.getTime())) throw new Error('Data inválida'); 
        const now = new Date();
        const diffInSeconds = Math.floor((now - publicationDate) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        const thresholdDays = 7; 

        if (diffInSeconds < 60) return "Agora mesmo";
        if (diffInMinutes < 60) return `${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''} atrás`;
        if (diffInHours < 24) return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;
        if (diffInDays <= thresholdDays) return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
        
        // Fallback para data DD Mês AAAA se for mais antigo
        const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
        let formattedDate = publicationDate.toLocaleDateString('pt-BR', dateOptions).replace('.', '');
        formattedDate = formattedDate.replace(/ de /g, ' ');
        formattedDate = formattedDate.replace(/ (\w)/, (match, p1) => ` ${p1.toUpperCase()}`);
        return formattedDate;
    } catch (error) {
        console.warn(`Erro ao formatar tempo relativo para ${isoDateTimeString}:`, error);
        try {
           const fallbackDate = new Date(isoDateTimeString.split('T')[0] + 'T00:00:00');
           if(!isNaN(fallbackDate.getTime())){
                const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
                let formattedDate = fallbackDate.toLocaleDateString('pt-BR', dateOptions).replace('.', '');
                formattedDate = formattedDate.replace(/ de /g, ' ');
                formattedDate = formattedDate.replace(/ (\w)/, (match, p1) => ` ${p1.toUpperCase()}`);
                return formattedDate;
           }
        } catch {}
        return isoDateTimeString || ''; 
    }
}

// --- Função Principal para Carregar a Tendência ---
async function carregarTendenciaDoJson() {
    const urlParams = new URLSearchParams(window.location.search);
    const tendenciaSlug = urlParams.get('slug'); // Espera ?slug=... na URL

    const contentElement = document.querySelector('.trend-content'); // Container principal
    const loadingIndicator = document.getElementById('trend-loading');
    const dynamicContentContainer = document.querySelector('.trend-dynamic-content');

    // Função de erro específica
    function exibirErroNaPagina(mensagem) {
        if (contentElement) {
             contentElement.innerHTML = `<h1 class="trend-title">Erro</h1><p>${mensagem}</p>`;
        } else {
             document.body.innerHTML = `<h1 style='text-align: center; margin-top: 50px;'>Erro</h1><p style='text-align: center;'>${mensagem}</p>`;
        }
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        console.error(mensagem);
    }

    // Validações
    if (!contentElement || !dynamicContentContainer) {
        exibirErroNaPagina("Estrutura HTML essencial (.trend-content ou .trend-dynamic-content) não encontrada.");
        return;
    }
     if (!tendenciaSlug) {
        exibirErroNaPagina("Nenhuma tendência especificada na URL (parâmetro 'slug' ausente).");
        return;
    }

    if (loadingIndicator) loadingIndicator.style.display = 'block';
    dynamicContentContainer.style.visibility = 'hidden'; 
    dynamicContentContainer.style.opacity = '0';

    console.log(`Tentando carregar tendência com slug: ${tendenciaSlug}`);

    try {
        // Busca o JSON de tendências
        const response = await fetch('data/tendencias.json?v=' + Date.now());
        if (!response.ok) throw new Error(`Erro ao buscar tendencias.json: ${response.status}`);
        const data = await response.json();
        if (!data || !Array.isArray(data.trends)) throw new Error("JSON de tendências inválido");

        // Encontra a tendência pelo slug
        const tendencia = data.trends.find(t => t.slug === tendenciaSlug);
        if (!tendencia) throw new Error(`Tendência com slug "${tendenciaSlug}" não encontrada.`);

        console.log("Tendência encontrada:", tendencia.title);

        // Preenche o conteúdo principal
        preencherConteudoTendencia(tendencia);

        // Preenche a seção "Mais Tendências"
        preencherMaisTendencias(tendencia, data.trends);

        // Mostra o conteúdo
        dynamicContentContainer.style.visibility = 'visible';
        dynamicContentContainer.style.opacity = '1';
        if (loadingIndicator) loadingIndicator.style.display = 'none';

    } catch (error) {
        exibirErroNaPagina(`Não foi possível carregar a tendência: ${error.message}`);
    }
}


// --- Função para Preencher o Conteúdo Principal da Tendência ---
function preencherConteudoTendencia(tendencia) {

    // --- Preenchimento do <head> ---
    document.title = `${tendencia.title || 'Tendência'} - Technology AI`;
    const setMetaTag = (name, content) => { /* ... (função igual noticia.js) ... */ 
        if (!content) return; 
        let element = document.querySelector(`meta[name="${name}"]`);
        if (element) { element.content = content; } 
        else { /* ... (cria meta tag) ... */ }
    };
    setMetaTag('description', tendencia.excerpt || ''); // Usa o excerpt como descrição
    // Keywords podem ser mais simples ou omitidas para tendências
    setMetaTag('keywords', `Tendência, IA, ${tendencia.title}`); 
    setMetaTag('author', tendencia.authorName || 'Technology AI');

    // --- Preenchimento do <body> ---

    // Breadcrumbs (último item)
    const breadcrumbAtual = document.querySelector('.breadcrumbs li[aria-current="page"]');
    if (breadcrumbAtual) breadcrumbAtual.textContent = tendencia.title || '';

    // Título H1
    const tituloElemento = document.querySelector('.trend-title');
    if (tituloElemento) tituloElemento.textContent = tendencia.title || '';

    // Meta Dados (Avatar, Nome, Tempo Relativo)
    const metaContainer = document.querySelector('.trend-meta');
    if (metaContainer) {
        const authorAvatarHtml = `
            <img src="${tendencia.authorAvatarUrl || 'assets/imagens/autores/placeholder-avatar.png'}" 
                 alt="${tendencia.authorName ? 'Avatar de ' + tendencia.authorName : 'Avatar'}" 
                 class="trend-author-avatar-meta">
        `;
        const authorNameHtml = tendencia.authorName
            ? `<a href="${tendencia.authorLink || '#'}" class="trend-author-link-meta" ${tendencia.authorLink ? 'target="_blank" rel="noopener noreferrer"' : ''}>${tendencia.authorName}</a>`
            : `<span class="trend-author-name-meta">Redação</span>`; // Fallback
        
        const relativeTime = formatRelativeTime(tendencia.dateTimeIso || tendencia.date);
        const dateTimeAttr = tendencia.dateTimeIso || tendencia.date || '';

        metaContainer.innerHTML = `
            ${authorAvatarHtml}
            <div class="trend-meta-text">
                <span class="trend-author-name">${authorNameHtml}</span>
                <time datetime="${dateTimeAttr}" class="trend-relative-time">${relativeTime}</time>
            </div>
        `;
    }

    // Imagem de Destaque
    const imagemElemento = document.querySelector('.trend-featured-image img');
    if (imagemElemento) {
        imagemElemento.src = tendencia.image || 'assets/imagens/geral/placeholder.png';
        imagemElemento.alt = tendencia.alt || tendencia.title || '';
    }

    // Excerto/Resumo
    const excertoElemento = document.querySelector('.trend-excerpt');
    if (excertoElemento) excertoElemento.textContent = tendencia.excerpt || '';

    // Link para Fonte Original
    const linkFonteElemento = document.querySelector('.trend-source-link');
    const linkFonteContainer = document.querySelector('.trend-source-link-container');
    if (linkFonteElemento && linkFonteContainer) {
        if (tendencia.link && tendencia.link !== '#') {
            linkFonteElemento.href = tendencia.link;
            linkFonteContainer.style.display = 'block'; // Mostra o container do link
        } else {
            linkFonteContainer.style.display = 'none'; // Esconde se não houver link
        }
    }
    
    // Opcional: Configurar Social Share se adicionado ao HTML
    // const socialShareContainer = document.querySelector('.trend-social-share');
    // if (socialShareContainer) { ... configurar links ... }

    console.log("Conteúdo principal da tendência preenchido.");
}


// --- Função para Preencher a Seção "Mais Tendências" ---
function preencherMaisTendencias(currentTrend, allTrends) {
    const moreTrendsGrid = document.querySelector('.more-trends-grid');
    const loadingMore = document.querySelector('.loading-more-trends');

    if (!moreTrendsGrid) {
        console.warn("Container .more-trends-grid não encontrado.");
        return;
    }

    // Filtra para excluir a tendência atual e pega as 3 mais recentes
    const recentTrends = allTrends
        .filter(t => t.slug !== currentTrend.slug) // Exclui a atual
        .sort((a, b) => new Date(b.dateTimeIso || b.date || 0) - new Date(a.dateTimeIso || a.date || 0)) // Ordena
        .slice(0, 3); // Pega as 3 primeiras

    if (recentTrends.length > 0) {
        moreTrendsGrid.innerHTML = recentTrends.map(trend => `
            <a href="tendencia.html?slug=${trend.slug}" class="more-trend-item">
                 <img src="${trend.image || 'assets/imagens/geral/placeholder.png'}" alt="" loading="lazy"> <!-- Alt vazio é ok aqui -->
                <h3 class="more-trend-title">${trend.title || 'Tendência'}</h3>
            </a>
        `).join('');
    } else {
        moreTrendsGrid.innerHTML = '<p>Nenhuma outra tendência recente.</p>';
    }
     if (loadingMore) loadingMore.style.display = 'none'; // Esconde o loading
}