// scripts/noticia.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM da página de artigo pronto. Carregando notícia específica...");
    carregarNoticiaDoJson();
});

async function carregarNoticiaDoJson() {
    const urlParams = new URLSearchParams(window.location.search);
    const artigoSlug = urlParams.get('artigo');

    const articleContentElement = document.querySelector('.article-content');
    const sidebarElement = document.querySelector('.article-sidebar');
    const loadingIndicator = document.getElementById('article-loading'); // Presume que existe <div id="article-loading">
    const dynamicContentContainer = document.querySelector('.article-dynamic-content'); // Presume que existe <div class="article-dynamic-content">

    // Esconde conteúdo e mostra loading inicialmente (se os elementos existirem)
    if (dynamicContentContainer) {
        dynamicContentContainer.style.visibility = 'hidden';
        dynamicContentContainer.style.opacity = '0';
    }
    if (loadingIndicator) loadingIndicator.style.display = 'block';

    function exibirErroNaPagina(mensagem) {
        if (articleContentElement) {
             articleContentElement.innerHTML = `<h1 class="article-title">Erro</h1><p>${mensagem}</p>`;
        } else {
             // Fallback se nem o container principal existir
             document.body.innerHTML = `<h1 style="text-align: center; margin-top: 50px;">Erro ao carregar conteúdo</h1><p style="text-align: center;">${mensagem}</p>`;
        }
        if (sidebarElement) sidebarElement.style.display = 'none';
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        console.error(mensagem);
    }

    // Validações essenciais
    if (!articleContentElement || !dynamicContentContainer) {
        exibirErroNaPagina("Estrutura HTML essencial (.article-content ou .article-dynamic-content) não encontrada.");
        return;
    }
    if (!artigoSlug) {
        exibirErroNaPagina("Nenhuma notícia especificada na URL (parâmetro 'artigo' ausente).");
        return;
    }

    console.log(`Tentando carregar notícia com slug: ${artigoSlug}`);

    try {
        const response = await fetch('data/noticias.json?v=' + Date.now());
        if (!response.ok) {
            throw new Error(`Erro ao buscar noticias.json: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (!data || !Array.isArray(data.noticias)) {
            throw new Error("Formato inválido ou array 'noticias' ausente em data/noticias.json");
        }

        const noticia = data.noticias.find(n => n.slug === artigoSlug);
        if (!noticia) {
            throw new Error(`Notícia com slug "${artigoSlug}" não encontrada.`);
        }

        console.log("Notícia encontrada:", noticia.titulo);

        preencherConteudoNoticia(noticia, data.noticias); // Preenche os dados

        // Mostra o conteúdo e esconde o loading APÓS preencher
        dynamicContentContainer.style.visibility = 'visible';
        dynamicContentContainer.style.opacity = '1'; // Inicia fade-in (requer CSS transition)
        if (loadingIndicator) loadingIndicator.style.display = 'none';

    } catch (error) {
        exibirErroNaPagina(`Não foi possível carregar a notícia: ${error.message}`);
    }
}

// --- Função para Preencher o Conteúdo no HTML ---
function preencherConteudoNoticia(noticia, todasNoticias) {

    // --- Preenchimento do <head> ---
    document.title = `${noticia.tituloCurto || noticia.titulo || 'Notícia'} - Technology AI`;
    
    // Função auxiliar para atualizar ou criar meta tags
    const setMetaTag = (name, content) => {
        if (!content) return; // Não faz nada se o conteúdo for vazio
        let element = document.querySelector(`meta[name="${name}"]`);
        if (element) {
            element.content = content;
        } else {
            // Cria a meta tag se não existir (menos comum para description/keywords, mas seguro)
            element = document.createElement('meta');
            element.name = name;
            element.content = content;
            document.head.appendChild(element);
            console.warn(`Meta tag [name="${name}"] não encontrada, criada dinamicamente.`);
        }
    };

    setMetaTag('description', noticia.metaDescription || noticia.resumo || '');
    setMetaTag('keywords', Array.isArray(noticia.metaKeywords) ? noticia.metaKeywords.join(', ') : (noticia.tags?.join(', ') || ''));
    setMetaTag('author', noticia.autor?.nome || 'Technology AI');

    // --- Preenchimento do <body> ---

    // Breadcrumbs
    const breadcrumbAtual = document.querySelector('.breadcrumbs li[aria-current="page"]');
    if (breadcrumbAtual) breadcrumbAtual.textContent = noticia.titulo || '';

    // Categorias
    const containerCategorias = document.querySelector('.article-categories');
    if (containerCategorias) {
        if (Array.isArray(noticia.categorias) && noticia.categorias.length > 0) {
             containerCategorias.innerHTML = noticia.categorias
                .map(cat => `<a href="news.html?categoria=${formatForUrl(cat)}" class="category-tag">${cat}</a>`)
                .join('');
             containerCategorias.style.display = 'block'; // Garante visibilidade
        } else {
             containerCategorias.innerHTML = '';
             containerCategorias.style.display = 'none'; // Esconde se vazio
        }
    }

    // Título H1
    const tituloElemento = document.querySelector('.article-title');
    if (tituloElemento) tituloElemento.textContent = noticia.titulo || '';
    
    const subtituloElemento = document.querySelector('.article-subtitle');
    if (subtituloElemento) {
        if (noticia.resumo) { // Usa o campo resumo existente
            subtituloElemento.textContent = noticia.resumo;
            subtituloElemento.style.display = 'block'; // Garante visibilidade
        } else {
            subtituloElemento.textContent = '';
            subtituloElemento.style.display = 'none'; // Esconde se não houver resumo
        }
    } else {
        console.warn("Elemento .article-subtitle não encontrado.");
    }

    // Meta Informações (Autor, Data, Tempo Leitura)
    const metaContainer = document.querySelector('.article-meta');
    if (metaContainer) {
        metaContainer.innerHTML = ''; // Limpa o conteúdo estático do HTML se houver

        let authorAvatarHtml = '';
        if (noticia.autor?.avatarUrl) {
             authorAvatarHtml = `
                <img src="${noticia.autor.avatarUrl}" alt="Avatar de ${noticia.autor.nome || ''}" class="author-avatar-meta">
             `;
        } else if (noticia.autor?.nome) { // Mostra um placeholder se tiver nome mas não avatar
             authorAvatarHtml = `
                <img src="assets/imagens/autores/placeholder-avatar.png" alt="Avatar" class="author-avatar-meta">
             `;
        }
        
        // --- HTML do Nome do Autor (com prefixo "Por:") ---
        let authorNameHtml = '';
        if (noticia.autor?.nome) {
             authorNameHtml = `
                <div class="author-name-line"> 
                    <span class="author-prefix-meta">Por:</span> 
                    <a href="${noticia.autor.link || '#'}" class="author-link-meta" ${noticia.autor.link ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                        <span class="author-name-meta">${noticia.autor.nome}</span>
                    </a>
                </div>
             `;
             // Adicionamos classes específicas: author-prefix-meta, author-link-meta, author-name-meta
        }
        
        let dateTimeText = '';
        let dateTimeAttr = '';
        if (noticia.dateTimeIso) {
            try {
                const dateObj = new Date(noticia.dateTimeIso);
                dateTimeAttr = dateObj.toISOString(); 
                const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };

                if (noticia.dateTimeIso.includes('T')) {
                    dateTimeText = `${dateObj.toLocaleDateString('pt-BR', dateOptions)} - ${dateObj.toLocaleTimeString('en-US', timeOptions).toLowerCase()}`; 
                } else {
                    dateTimeText = dateObj.toLocaleDateString('pt-BR', dateOptions);
                }
            } catch (e) { 
                // Fallback para data simples
                 try {
                     const dateObjFallback = new Date(noticia.isoDate + 'T00:00:00');
                     dateTimeText = dateObjFallback.toLocaleDateString('pt-BR', dateOptions);
                     dateTimeAttr = noticia.isoDate || '';
                 } catch { dateTimeText = noticia.data || ''; dateTimeAttr = noticia.isoDate || ''; }
            }
        }

        let readTimeText = '';
        if (noticia.tempoLeituraEstimado) {
            readTimeText = `Tempo de Leitura: ${noticia.tempoLeituraEstimado}`;
        }

        // Constrói o HTML final para .article-meta
        // Usando uma única div principal para facilitar o flexbox
        metaContainer.innerHTML = `
            ${authorAvatarHtml} 
            <div class="author-date-read-group"> 
                ${authorNameHtml ? `<div class="author-name-line">${authorNameHtml}</div>` : ''}
                ${dateTimeText ? `<time datetime="${dateTimeAttr}" class="publish-date-time">${dateTimeText}</time>` : ''}
                ${readTimeText ? `<span class="read-time-meta">${readTimeText}</span>` : ''}
            </div>
        `;
    }
    
     // Botões de Compartilhamento Social
     const socialShareContainer = document.querySelector('.social-share');
     if (socialShareContainer) {
         try {
             const pageUrl = window.location.href;
             const shareTitle = noticia.titulo || '';
             socialShareContainer.querySelector('a[aria-label*="X"]')?.setAttribute('href', `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(pageUrl)}`);
             socialShareContainer.querySelector('a[aria-label*="WhatsApp"]')?.setAttribute('href', `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + pageUrl)}`);
             socialShareContainer.querySelector('a[aria-label*="Facebook"]')?.setAttribute('href', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`);
             socialShareContainer.querySelector('a[aria-label*="LinkedIn"]')?.setAttribute('href', `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`);
         } catch (e) { console.error("Erro ao configurar botões de share:", e); }
     }

    // Imagem de Destaque e Legenda
    const imagemElemento = document.querySelector('.featured-image img');
    const figcaptionElemento = document.querySelector('.featured-image figcaption');
    if (imagemElemento) {
        imagemElemento.src = noticia.imagemBanner || noticia.imagemCard || 'assets/imagens/geral/placeholder.png';
        imagemElemento.alt = noticia.altImagem || noticia.titulo || '';
    }
    if (figcaptionElemento) {
        figcaptionElemento.textContent = noticia.legendaImagemBanner || '';
        figcaptionElemento.style.display = noticia.legendaImagemBanner ? 'block' : 'none';
    }

    // Dentro da função preencherConteudoNoticia

    // Corpo do Artigo
    const corpoElemento = document.querySelector('.article-body');
    if (corpoElemento) {
        // ANTES: corpoElemento.innerHTML = noticia.corpoHtml?.replace(/\n/g, '<br>') || '...';
        // DEPOIS (para array):
        corpoElemento.innerHTML = Array.isArray(noticia.corpoHtml) ? noticia.corpoHtml.join('\n') : (noticia.corpoHtml || '<p>Conteúdo da notícia indisponível.</p>'); 
        // Junta os elementos do array com uma quebra de linha (ou pode ser join('') se não precisar do espaço extra)
    } else {
         console.warn("Elemento .article-body não encontrado.");
    }

    // Tags no Final
    const containerTags = document.querySelector('.article-tags-bottom');
    if (containerTags) {
        if (Array.isArray(noticia.tags) && noticia.tags.length > 0) {
            containerTags.style.display = 'block';
            const strongTag = containerTags.querySelector('strong');
            let tagsHtml = noticia.tags
               .map(tag => `<a href="news.html?tag=${formatForUrl(tag)}">${tag}</a>`)
               .join(', ');
            containerTags.innerHTML = '';
            if (strongTag) containerTags.appendChild(strongTag);
            containerTags.innerHTML += ' ' + tagsHtml;
        } else {
            containerTags.style.display = 'none';
        }
    }

    // Caixa do Autor (Com Avatar e Bio)
    const authorBox = document.querySelector('.author-box');
    if (authorBox) {
        const authorAvatar = authorBox.querySelector('.author-avatar');
        const authorNameH4 = authorBox.querySelector('.author-info h4');
        const authorBioP = authorBox.querySelector('.author-info p'); // Seleciona o <p> da bio

        if (noticia.autor?.nome) {
             authorBox.style.display = 'flex';
             if(authorAvatar) {
                authorAvatar.src = noticia.autor.avatarUrl || 'assets/imagens/autores/placeholder-avatar.png';
                authorAvatar.alt = `Avatar ${noticia.autor.nome}`;
             }
             if(authorNameH4) authorNameH4.textContent = `Sobre ${noticia.autor.nome}`;
             // Preenche a bio OU um texto padrão se a bio estiver vazia
             if(authorBioP) authorBioP.textContent = noticia.autor.bio || `Leia mais artigos de ${noticia.autor.nome}.`;
        } else {
             authorBox.style.display = 'none';
        }
    }

    // Notícias Relacionadas (Usando relatedSlugs)
    const relatedSection = document.querySelector('.related-news');
    const relatedGrid = document.querySelector('.related-news-grid');
    if (relatedGrid && relatedSection) {
        
        // Encontrar até 2 notícias relacionadas com base em tags OU categorias
        const relatedNews = findRelatedNews(noticia, todasNoticias, 2); // Chama função auxiliar

        if (relatedNews.length > 0) {
            relatedGrid.innerHTML = relatedNews.map(rel => `
                <div class="related-news-card">
                    <a href="noticia.html?artigo=${rel.slug}">
                        <img src="${rel.imagemCard || 'assets/imagens/geral/placeholder.png'}" alt="${rel.titulo || ''}" loading="lazy">
                        ${rel.titulo || ''}
                    </a>
                </div>
            `).join('');
            relatedSection.style.display = 'block'; // Mostra a seção
        } else {
            relatedSection.style.display = 'none'; // Esconde se não encontrar
        }
    }

    // Sidebar - Últimas Notícias
     const recentPostsList = document.querySelector('.sidebar-widget.recent-posts ul');
     if (recentPostsList) {
         try {
             const recentNews = todasNoticias
                .filter(n => n.slug !== noticia.slug)
                .sort((a, b) => new Date(b.isoDate || 0) - new Date(a.isoDate || 0))
                .slice(0, 3);

            if (recentNews.length > 0) {
                recentPostsList.innerHTML = recentNews.map(rec => `
                    <li><a href="noticia.html?artigo=${rec.slug}">${rec.titulo || ''}</a></li>
                `).join('');
            } else {
                recentPostsList.innerHTML = '<li>Nenhuma notícia recente.</li>';
            }
         } catch(e) {
              console.error("Erro ao gerar últimas notícias da sidebar:", e);
              recentPostsList.innerHTML = '<li>Erro ao carregar.</li>';
         }
     }

    console.log("Conteúdo da notícia preenchido no HTML.");
}

function findRelatedNews(currentNews, allNews, maxCount) {
    const currentTags = new Set(currentNews.tags || []);
    const currentCategories = new Set(currentNews.categorias || []);
    const related = [];

    // Filtra outras notícias
    const otherNews = allNews.filter(n => n.slug !== currentNews.slug);

    // Calcula pontuação de relevância (exemplo simples)
    otherNews.forEach(news => {
        let score = 0;
        const newsTags = new Set(news.tags || []);
        const newsCategories = new Set(news.categorias || []);

        // Pontua por tags em comum
        currentTags.forEach(tag => {
            if (newsTags.has(tag)) {
                score += 2; // Mais peso para tags
            }
        });

        // Pontua por categorias em comum
        currentCategories.forEach(cat => {
            if (newsCategories.has(cat)) {
                score += 1;
            }
        });

        if (score > 0) {
            related.push({ ...news, score }); // Adiciona notícia com pontuação
        }
    });

    // Ordena por pontuação (maior primeiro) e depois por data (mais recente)
    related.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return new Date(b.isoDate || 0) - new Date(a.isoDate || 0);
    });

    // Retorna o número máximo desejado
    return related.slice(0, maxCount);
}

// Função auxiliar para formatação de URL (importante mantê-la)
function formatForUrl(text) {
    if (!text) return '';
    return text.toLowerCase()
               .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
               .replace(/[^a-z0-9.]+/g, '-')
               .replace(/-+/g, '-')
               .replace(/^-+|-+$/g, '');
}