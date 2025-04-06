// scripts/noticia.js

// --- Banco de Dados Simulado das Notícias ---
// Em um projeto real, isso viria de um JSON, API, etc.
const todasAsNoticias = [
    {
        slug: 'openai-gpt-4.5',
        titulo: 'OpenAI Lança Modelo GPT-4.5 com Inteligência Emocional Avançada',
        autor: 'Gustavo G.',
        data: '07/03/2025',
        imagemUrl: 'assets/news/gpt4.5-baanner.jpg', // Imagem GRANDE para a página
        imagemAlt: 'Logo OpenAI ChatGPT 4.5',
        categorias: ['Modelos de Linguagem', 'OpenAI'],
        // O corpo pode ser HTML direto ou Markdown (que precisaria ser processado)
        corpoHtml: ` 
            <p>A OpenAI anunciou nesta quinta-feira o lançamento oficial do GPT-4.5, uma nova versão do seu já popular modelo de linguagem. A grande novidade da atualização está na introdução de recursos avançados de inteligência emocional, capazes de tornar as interações com o modelo ainda mais naturais, empáticas e contextualmente sensíveis.</p>
                    
            <h2>Um salto no entendimento emocional</h2>
            <p>De acordo com a empresa, o GPT-4.5 foi treinado com um foco especial na compreensão de nuances emocionais, permitindo que ele identifique e responda com mais precisão a sentimentos como ansiedade, frustração, empolgação ou tristeza nas mensagens dos usuários. Esse avanço busca aproximar ainda mais o relacionamento entre humanos e inteligência artificial.</p>
            <p>“O GPT-4.5 representa um passo importante rumo a interações mais humanas com a IA. Ele não apenas entende o que está sendo dito, mas também como está sendo dito e o 'por quê'”, disse Mira Takahashi, pesquisadora-chefe da OpenAI, durante a coletiva de lançamento.</p>

            <h2>Aplicações práticas</h2>
            <p>Além de chatbots mais empáticos, a tecnologia pode ser aplicada em áreas como atendimento ao cliente, educação personalizada e até mesmo ferramentas de suporte à saúde mental (com as devidas ressalvas éticas).</p>

            <h2>Transparência e controle</h2>
            <p>Para evitar preocupações com manipulação emocional, a OpenAI incorporou mecanismos de transparência aprimorados, permitindo ao usuário visualizar quando o modelo está reagindo a um suposto estado emocional detectado. Além disso, é possível ajustar o nível de empatia do modelo ou até desativar completamente esse recurso.</p>

            <h2>Limitações e Ética</h2>
            <p>Apesar do avanço, a empresa reconhece que o GPT-4.5 ainda não é capaz de sentir emoções – apenas simula compreensão emocional com base em padrões de linguagem. Isso levanta questões éticas, especialmente em contextos sensíveis como aconselhamento psicológico e relacionamentos digitais. Organizações de direitos digitais alertam para a necessidade de regulamentações claras sobre o uso da inteligência emocional em IA, a fim de evitar abusos ou confusões sobre os limites do que a tecnologia pode realmente fazer.</p>

            <h2>Disponibilidade</h2>
            <p>O GPT-4.5 já está disponível para desenvolvedores via API na plataforma da OpenAI, e será gradualmente integrado aos produtos existentes da empresa, como o ChatGPT e o Copilot, nas próximas semanas. A versão gratuita do ChatGPT começará a receber parte dos benefícios do novo modelo, enquanto funcionalidades mais avançadas serão exclusivas para assinantes do plano Plus.</p>
        `,
        tags: ['GPT-4.5', 'Inteligência Emocional', 'OpenAI', 'LLM'],
        figcaption: 'Imagem gerada por Inteligência Artificial', // Legenda da imagem
        // Dados para Notícias Relacionadas (exemplo)
        relacionadas: [
            { slug: 'elon-musk-grok-3', titulo: 'Elon Musk Lança Grok 3: A "IA Mais Inteligente da Terra"', imagemUrl: 'assets/news/grok3-related.jpg' },
            { slug: 'claude-sonnet-3.7', titulo: 'Claude Sonnet 3.7: A Nova Fronteira da IA que Supera OpenAI e Grok 3', imagemUrl: 'assets/news/claude-related.jpg' }
        ]
    },
    {
        slug: 'claude-sonnet-3.7',
        titulo: 'Claude Sonnet 3.7: A Nova Fronteira da IA que Supera OpenAI e Grok 3',
        autor: 'Redação AI',
        data: '06/03/2025',
        imagemUrl: 'assets/news/claude-banner.jpg',
        imagemAlt: 'Claude 3.7 Sonnet',
        categorias: ['Modelos de Linguagem', 'Anthropic'],
        corpoHtml: `<p>A Anthropic surpreendeu o mercado ao anunciar o Claude 3.7 Sonnet...</p><h2>Performance</h2><p>Benchmarks indicam...</p>`,
        tags: ['Claude 3.7', 'Anthropic', 'LLM', 'Benchmark'],
        figcaption: 'Conceito visual do Claude 3.7',
        relacionadas: [
             { slug: 'openai-gpt-4.5', titulo: 'OpenAI Lança Modelo GPT-4.5 com Inteligência Emocional Avançada', imagemUrl: 'assets/news/gpt4.5-related.jpg' },
             { slug: 'elon-musk-grok-3', titulo: 'Elon Musk Lança Grok 3: A "IA Mais Inteligente da Terra"', imagemUrl: 'assets/news/grok3-related.jpg' },
        ]
    },
     {
        slug: 'elon-musk-grok-3',
        titulo: 'Elon Musk Lança Grok 3: A "IA Mais Inteligente da Terra"',
        autor: 'Analista de IA',
        data: '05/03/2025',
        imagemUrl: 'assets/news/grok3-banner.jpg',
        imagemAlt: 'Elon Musk apresentando Grok 3',
        categorias: ['Modelos de Linguagem', 'xAI'],
        corpoHtml: `<p>Elon Musk revelou o Grok 3, afirmando ser...</p>`,
        tags: ['Grok 3', 'Elon Musk', 'xAI', 'LLM'],
        figcaption: 'Elon Musk no palco do lançamento do Grok 3',
         relacionadas: [
             { slug: 'openai-gpt-4.5', titulo: 'OpenAI Lança Modelo GPT-4.5 com Inteligência Emocional Avançada', imagemUrl: 'assets/news/gpt4.5-related.jpg' },
             { slug: 'claude-sonnet-3.7', titulo: 'Claude Sonnet 3.7: A Nova Fronteira da IA que Supera OpenAI e Grok 3', imagemUrl: 'assets/news/claude-related.jpg' }
        ]
    }
    // --- Adicione os dados das outras notícias aqui ---
];

// --- Função para Carregar o Conteúdo da Notícia ---
function carregarNoticia() {
    // 1. Pegar o parâmetro 'artigo' da URL
    const urlParams = new URLSearchParams(window.location.search);
    const artigoSlug = urlParams.get('artigo');

    if (!artigoSlug) {
        exibirErro("Artigo não especificado.");
        return;
    }

    // 2. Encontrar a notícia no nosso "banco de dados"
    const noticia = todasAsNoticias.find(n => n.slug === artigoSlug);

    if (!noticia) {
        exibirErro(`Artigo "${artigoSlug}" não encontrado.`);
        return;
    }

    // 3. Preencher o HTML com os dados da notícia encontrada
    
    // Título da Página
    document.title = `${noticia.titulo} - Technology AI`;

    // Breadcrumbs (Atualiza o último item)
    const breadcrumbAtual = document.querySelector('.breadcrumbs li[aria-current="page"]');
    if (breadcrumbAtual) {
        breadcrumbAtual.textContent = noticia.titulo;
    }

    // Categorias
    const containerCategorias = document.querySelector('.article-categories');
    if (containerCategorias) {
        containerCategorias.innerHTML = noticia.categorias
            .map(cat => `<a href="#" class="category-tag">${cat}</a>`) // Idealmente, o href levaria para uma página de categoria
            .join('');
    }

    // Título do Artigo
    const tituloElemento = document.querySelector('.article-title');
    if (tituloElemento) {
        tituloElemento.textContent = noticia.titulo;
    }

    // Meta Informações
    const autorElemento = document.querySelector('.article-meta .author');
    if (autorElemento) {
        autorElemento.textContent = `Por: ${noticia.autor}`;
    }
    const dataElemento = document.querySelector('.article-meta .date');
    if (dataElemento) {
        dataElemento.textContent = noticia.data;
    }

    // Imagem de Destaque
    const imagemElemento = document.querySelector('.featured-image img');
    const figcaptionElemento = document.querySelector('.featured-image figcaption');
    if (imagemElemento) {
        imagemElemento.src = noticia.imagemUrl;
        imagemElemento.alt = noticia.imagemAlt || noticia.titulo; // Usa alt específico ou título
    }
     if (figcaptionElemento) {
        figcaptionElemento.textContent = noticia.figcaption || ''; // Usa legenda específica
    }


    // Corpo do Artigo
    const corpoElemento = document.querySelector('.article-body');
    if (corpoElemento) {
        corpoElemento.innerHTML = noticia.corpoHtml; // CUIDADO: innerHTML pode ser risco de XSS se o HTML não for confiável
    }

    // Tags no Final
    const containerTags = document.querySelector('.article-tags-bottom');
     if (containerTags) {
        // Remove o texto "Tags:" se ele já estiver no HTML, para não duplicar
        const strongTag = containerTags.querySelector('strong');
        containerTags.innerHTML = ''; // Limpa o container
        if (strongTag) containerTags.appendChild(strongTag); // Readiciona o "Tags:"
        
        containerTags.innerHTML += noticia.tags
            .map(tag => `<a href="#">${tag}</a>`) // Idealmente, link para página de tag
            .join(', '); // Separa por vírgula
    }

    // Notícias Relacionadas
    const relatedContainer = document.querySelector('.related-news-grid');
    if (relatedContainer && noticia.relacionadas) {
        relatedContainer.innerHTML = noticia.relacionadas.map(rel => `
            <div class="related-news-card">
                <a href="noticia.html?artigo=${rel.slug}"> 
                    <img src="${rel.imagemUrl}" alt="${rel.titulo}">
                    ${rel.titulo}
                </a>
            </div>
        `).join('');
    }
    
    // -- Outros elementos que precisam ser preenchidos (Caixa do autor, etc.) --

}

// --- Função para Exibir Erro ---
function exibirErro(mensagem) {
    const articleContent = document.querySelector('.article-content');
    if (articleContent) {
        articleContent.innerHTML = `<h1 class="article-title">Erro</h1><p>${mensagem}</p>`;
    }
    // Opcional: esconder a sidebar se der erro
    const sidebar = document.querySelector('.article-sidebar');
    if(sidebar) sidebar.style.display = 'none';
}

// --- Executar a função quando o DOM estiver pronto ---
document.addEventListener('DOMContentLoaded', carregarNoticia);