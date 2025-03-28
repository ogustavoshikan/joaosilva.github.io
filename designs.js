document.addEventListener("DOMContentLoaded", function () {
    const galleryContainer = document.querySelector(".gallery-container");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const dropdownMenu = document.querySelector(".dropdown-menu");
    let allDesigns = [];
    let displayedDesigns = 0;
    const designsPerLoad = 8;
    let isLoading = false;
    let currentCategory = 'all';

    // Função para embaralhar designs de forma controlada
    function shuffleDesignsOnce(designs) {
        // Cria uma cópia do array para evitar modificar o original
        const shuffledDesigns = [...designs];
        
        // Usa um método de embaralhamento simples e previsível
        for (let i = shuffledDesigns.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledDesigns[i], shuffledDesigns[j]] = [shuffledDesigns[j], shuffledDesigns[i]];
        }
        
        return shuffledDesigns;
    }

    // Carregar os designs do JSON
    function loadDesigns() {
        console.log('Iniciando o carregamento do designs.json...');
        galleryContainer.innerHTML = '<p class="loading">Carregando...</p>';
        fetch('data/designs.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar o designs.json: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                // Remove designs com src inválidos
                allDesigns = data.designs.filter(design => 
                    design.src && 
                    design.src !== 'assets' && 
                    design.src.trim() !== ''
                );
                
                // Embaralha uma única vez na inicialização
                allDesigns = shuffleDesignsOnce(allDesigns);
                
                displayInitialDesigns();
            })
            .catch(error => {
                console.error('Erro ao carregar os designs:', error);
                galleryContainer.innerHTML = '<p class="error">Erro ao carregar os designs. Tente novamente mais tarde.</p>';
            });
    }

    // Exibir os designs iniciais
    function displayInitialDesigns() {
        displayedDesigns = 0;
        galleryContainer.innerHTML = '';
        displayMoreDesigns();
    }

    // Exibir mais designs
    function displayMoreDesigns() {
        const filteredDesigns = getFilteredDesigns();
        const start = displayedDesigns;
        const end = Math.min(start + designsPerLoad, filteredDesigns.length);

        if (start >= filteredDesigns.length) {
            isLoading = false;
            return; // Não há mais designs para carregar
        }

        for (let i = start; i < end; i++) {
            const design = filteredDesigns[i];
            const galleryItem = document.createElement('div');
            galleryItem.classList.add('gallery-item');
            
            // Verifica se o src da imagem é válido
            if (!design.src || design.src === 'assets' || design.src.trim() === '') {
                continue; // Pula designs com src inválido
            }
            
            galleryItem.innerHTML = `
                <a href="${design.src}" data-lightbox="gallery" data-title="
                    <div class='design-info'>
                        <p><strong>Resolução:</strong> ${design.resolution}</p>
                        <p><strong>Data de Criação:</strong> ${new Date(design.createdAt).toLocaleDateString('pt-BR')}</p>
                        <p><strong>Modelo:</strong> ${design.model}</p>
                        <p><strong>Autor:</strong> ${design.author}</p>
                    </div>
                ">
                    <img src="${design.src}" alt="${design.alt}" loading="lazy">
                </a>
            `;
            galleryContainer.appendChild(galleryItem);
        }

        displayedDesigns = end;
        isLoading = false;
    }

    // Obter designs filtrados com base na categoria ativa
    function getFilteredDesigns() {
        if (currentCategory === 'all') {
            return allDesigns;
        }
        return allDesigns.filter(design => design.category === currentCategory);
    }

    // Filtrar designs ao clicar nos botões de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update current category
            currentCategory = button.getAttribute('data-category');
            
            // Reset and display initial designs for the selected category
            displayInitialDesigns();
        });
    });

    // Detectar o scroll e carregar mais designs
    window.addEventListener('scroll', () => {
        if (isLoading) return;

        const scrollPosition = window.scrollY + window.innerHeight;
        const pageHeight = document.documentElement.scrollHeight;

        // Carregar mais quando o usuário estiver a 200px do final da página
        if (scrollPosition >= pageHeight - 200) {
            isLoading = true;
            displayMoreDesigns();
        }
    });

    // Botão Voltar ao Topo
    const homeBackToTopButton = document.getElementById('home-back-to-top');
    const homeBackToTopText = document.querySelector('.home-back-to-top-text');
    if (homeBackToTopButton && homeBackToTopText) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 600) {
                homeBackToTopButton.classList.add('visible');
                homeBackToTopText.classList.add('visible');
            } else {
                homeBackToTopButton.classList.remove('visible');
                homeBackToTopText.classList.remove('visible');
            }
        });

        homeBackToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    } else {
        console.error('Botão #home-back-to-top ou texto .home-back-to-top-text não encontrado!');
    }

    // Configurar o Lightbox
    lightbox.option({
        'resizeDuration': 200,
        'wrapAward': true,
        'alwaysShowNavOnTouchDevices': true
    });

    // Abrir/Fechar o Dropdown
    dropdownToggle.addEventListener('click', () => {
        dropdownMenu.classList.toggle('show');
    });

    // Fechar o dropdown ao clicar fora
    document.addEventListener('click', (event) => {
        if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    // Carregar os designs ao iniciar
    loadDesigns();
});