// scripts/noticia.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM da página de artigo pronto. Carregando notícia específica...");
    carregarNoticiaDoJson(); // Chama a função para carregar o conteúdo desta página

    // REMOVIDO: Chamada para inicializarMenuMobile() - será feito pelo global.js
});

async function carregarNoticiaDoJson() {
    // 1. Pegar o parâmetro 'artigo' da URL
    const urlParams = new URLSearchParams(window.location.search);
    const artigoSlug = urlParams.get('artigo');

    // Seleciona os elementos do DOM que serão preenchidos
    const articleContentElement = document.querySelector('.article-content');
    const sidebarElement = document.querySelector('.article-sidebar');

    if (!articleContentElement) {
        console.error("Elemento .article-content não encontrado no DOM.");
        return; // Não pode continuar sem o container principal
    }

    // --- Exibição de Erro Genérica ---
    function exibirErroNaPagina(mensagem) {
        articleContentElement.innerHTML = `<h1 class="article-title">Erro</h1><p>${mensagem}</p>`;
        if (sidebarElement) sidebarElement.style.display = 'none'; // Opcional: esconde sidebar
        console.error(mensagem); // Loga o erro também
    }

    if (!artigoSlug) {
        exibirErroNaPagina("Nenhuma notícia especificada na URL (parâmetro 'artigo' ausente).");
        return;
    }

    console.log(`Tentando carregar notícia com slug: ${artigoSlug}`);

    try {
        // 2. Fazer fetch para carregar TODAS as notícias do JSON
        // Adicionando cache busting para garantir dados frescos
        const response = await fetch('data/noticias.json?v=' + Date.now()); // Adiciona timestamp
        if (!response.ok) {
            throw new Error(`Erro ao buscar noticias.json: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        if (!data || !Array.isArray(data.noticias)) {
            throw new Error("Formato inválido ou array 'noticias' ausente em data/noticias.json");
        }

        // 3. Encontrar a notícia específica pelo slug
        const noticia = data.noticias.find(n => n.slug === artigoSlug);

        if (!noticia) {
            throw new Error(`Notícia com slug "${artigoSlug}" não encontrada em noticias.json.`);
        }

        console.log("Notícia encontrada:", noticia.titulo);

        // 4. Preencher o HTML com os dados da notícia encontrada
        preencherConteudoNoticia(noticia, data.noticias); // Passa a notícia e a lista completa para relacionados

    } catch (error) {
        exibirErroNaPagina(`Não foi possível carregar a notícia: ${error.message}`);
    }
}

// --- Função para Preencher o Conteúdo no HTML ---
function preencherConteudoNoticia(noticia, todasNoticias) {

    // Título da Página (aba do navegador)
    document.title = `${noticia.titulo || 'Notícia'} - Technology AI`;

    // --- Preenchimento dos Elementos (com verificações) ---

    // Breadcrumbs (Último item)
    const breadcrumbAtual = document.querySelector('.breadcrumbs li[aria-current="page"]');
    if (breadcrumbAtual) breadcrumbAtual.textContent = noticia.titulo || '';

    // Categorias
    const containerCategorias = document.querySelector('.article-categories');
    if (containerCategorias && Array.isArray(noticia.categorias)) {
        containerCategorias.innerHTML = noticia.categorias
            .map(cat => `<a href="news.html?categoria=${encodeURIComponent(cat.toLowerCase().replace(/\s+/g, '-'))}" class="category-tag">${cat}</a>`)
            .join('');
    } else if (containerCategorias) {
        containerCategorias.innerHTML = ''; // Limpa se não houver categorias
    }

    // Título do Artigo (H1)
    const tituloElemento = document.querySelector('.article-title');
    if (tituloElemento) tituloElemento.textContent = noticia.titulo || 'Título Indisponível';

    // Meta Informações (Autor, Data)
    const metaContainer = document.querySelector('.article-meta');
    if (metaContainer) {
         const autorPrefix = metaContainer.querySelector('.author-prefix');
         const autorLink = metaContainer.querySelector('a.author');
         const dataSpan = metaContainer.querySelector('span.date');

         if(autorPrefix) autorPrefix.style.display = noticia.autor?.nome ? 'inline' : 'none'; // Mostra "Por:"

         if (autorLink) {
            if(noticia.autor?.nome) {
                autorLink.textContent = noticia.autor.nome;
                autorLink.href = noticia.autor.link || '#';
                autorLink.style.display = 'inline';
            } else {
                autorLink.style.display = 'none'; // Esconde se não houver autor
            }
         } else {
              console.warn("Elemento a.author não encontrado no container .article-meta");
         }

         if (dataSpan) {
            // Formata a data de forma mais robusta
            let dataFormatada = '';
            if(noticia.isoDate) {
                try {
                    dataFormatada = new Date(noticia.isoDate + 'T00:00:00').toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
                } catch (e) {
                    console.warn("Erro ao formatar isoDate:", noticia.isoDate, e);
                    dataFormatada = noticia.data || ''; // Fallback para a data string original
                }
            } else {
                 dataFormatada = noticia.data || '';
            }
            dataSpan.textContent = dataFormatada ? `- ${dataFormatada}` : '';
         } else {
             console.warn("Elemento span.date não encontrado no container .article-meta");
         }
    } else {
        console.warn("Container .article-meta não encontrado.");
    }

     // Botões de Compartilhamento Social (Atualiza links)
     const socialShareContainer = document.querySelector('.social-share');
     if (socialShareContainer) {
         try {
             const pageUrl = window.location.href;
             const shareTitle = noticia.titulo || '';
             // Usando optional chaining (?) para evitar erros se o querySelector retornar null
             socialShareContainer.querySelector('a[aria-label*="X"]')?.setAttribute('href', `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(pageUrl)}`);
             socialShareContainer.querySelector('a[aria-label*="WhatsApp"]')?.setAttribute('href', `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + pageUrl)}`);
             socialShareContainer.querySelector('a[aria-label*="Facebook"]')?.setAttribute('href', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`);
             socialShareContainer.querySelector('a[aria-label*="LinkedIn"]')?.setAttribute('href', `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`);
         } catch (e) {
             console.error("Erro ao configurar botões de compartilhamento:", e);
         }
     } else {
         console.warn("Container .social-share não encontrado.");
     }


    // Imagem de Destaque
    const imagemElemento = document.querySelector('.featured-image img');
    const figcaptionElemento = document.querySelector('.featured-image figcaption');
    if (imagemElemento) {
        imagemElemento.src = noticia.imagemBanner || noticia.imagemCard || 'assets/imagens/geral/placeholder.png';
        imagemElemento.alt = noticia.altImagem || noticia.titulo || '';
    } else {
         console.warn("Elemento img dentro de .featured-image não encontrado.");
    }
    if (figcaptionElemento) {
        figcaptionElemento.textContent = noticia.legendaImagemBanner || '';
        figcaptionElemento.style.display = noticia.legendaImagemBanner ? 'block' : 'none';
    } else {
         console.warn("Elemento figcaption dentro de .featured-image não encontrado.");
    }

    // Corpo do Artigo
    const corpoElemento = document.querySelector('.article-body');
    if (corpoElemento) {
        // Cuidado com XSS se o HTML não for confiável
        corpoElemento.innerHTML = noticia.corpoHtml || '<p>Conteúdo indisponível.</p>';
    } else {
         console.warn("Elemento .article-body não encontrado.");
    }

    // Tags no Final (com links para filtro)
    const containerTags = document.querySelector('.article-tags-bottom');
    if (containerTags) {
        if (Array.isArray(noticia.tags) && noticia.tags.length > 0) {
            containerTags.style.display = 'block';
            const strongTag = containerTags.querySelector('strong');
            let tagsHtml = noticia.tags
               .map(tag => `<a href="news.html?tag=${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}">${tag}</a>`)
               .join(', ');
            containerTags.innerHTML = ''; // Limpa primeiro
            if (strongTag) containerTags.appendChild(strongTag); // Readiciona o <strong>
            containerTags.innerHTML += ' ' + tagsHtml; // Adiciona os links das tags
        } else {
            containerTags.style.display = 'none'; // Esconde se não houver tags
        }
    } else {
        console.warn("Container .article-tags-bottom não encontrado.");
    }


    // Caixa do Autor (Atualiza informações)
    const authorBox = document.querySelector('.author-box');
    if (authorBox) {
        const authorAvatar = authorBox.querySelector('.author-avatar');
        const authorNameH4 = authorBox.querySelector('.author-info h4');

        if (authorAvatar) {
             // Mapeamento simples para a imagem do autor principal
            if (noticia.autor?.nome === 'Gustavo G.') {
                 authorAvatar.src = 'assets/imagens/autores/gustavo-g.webp'; // Caminho corrigido ou adequado
                 authorAvatar.alt = `Avatar ${noticia.autor.nome}`;
            } else {
                 // Placeholder para outros autores ou se não houver nome
                 authorAvatar.src = 'assets/imagens/autores/placeholder-avatar.png';
                 authorAvatar.alt = `Avatar ${noticia.autor?.nome || 'Autor Desconhecido'}`;
            }
        } else {
             console.warn("Elemento .author-avatar não encontrado na caixa do autor.");
        }

        if(authorNameH4) {
            authorNameH4.textContent = `Sobre ${noticia.autor?.nome || 'o Autor'}`;
        } else {
            console.warn("Elemento h4 dentro de .author-info não encontrado.");
        }

    } else {
        console.warn("Container .author-box não encontrado.");
    }


    // Notícias Relacionadas
    const relatedContainer = document.querySelector('.related-news-grid');
    if (relatedContainer) {
        try {
            const relatedNews = todasNoticias
                .filter(n => n.slug !== noticia.slug)
                .sort(() => 0.5 - Math.random()) // Aleatório como exemplo
                .slice(0, 2);

            if (relatedNews.length > 0) {
                relatedContainer.innerHTML = relatedNews.map(rel => `
                    <div class="related-news-card">
                        <a href="noticia.html?artigo=${rel.slug}">
                            <img src="${rel.imagemCard || 'assets/imagens/geral/placeholder.png'}" alt="${rel.titulo || ''}" loading="lazy">
                            ${rel.titulo || ''}
                        </a>
                    </div>
                `).join('');
            } else {
                const relatedWrapper = relatedContainer.closest('.related-news');
if (relatedWrapper) relatedWrapper.style.display = 'none';

            }
        } catch(e) {
            console.error("Erro ao gerar notícias relacionadas:", e);
            const relatedWrapper = relatedContainer.closest('.related-news');
if (relatedWrapper) relatedWrapper.style.display = 'none';

        }
    } else {
         console.warn("Container .related-news-grid não encontrado.");
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
     } else {
          console.warn("Lista ul dentro de .sidebar-widget.recent-posts não encontrada.");
     }


    console.log("Conteúdo da notícia preenchido no HTML.");
}


// ===============================================
// --- CÓDIGO REMOVIDO DAQUI ---
// A lógica do Theme Toggle e a função inicializarMenuMobile()
// foram removidas pois agora são gerenciadas pelo scripts/global.js
// ===============================================