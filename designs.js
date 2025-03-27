document.addEventListener("DOMContentLoaded", function () {
    const galleryContainer = document.querySelector(".gallery-container");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const loadMoreBtn = document.querySelector(".load-more-btn");
    let allDesigns = [];
    let displayedDesigns = 0;
    const designsPerLoad = 8; // Número de designs a carregar por vez

    function loadDesigns() {
    console.log('Iniciando o carregamento do designs.json...');
    fetch('data/designs.json')
        .then(response => {
            console.log('Resposta do fetch:', response);
            if (!response.ok) {
                throw new Error('Erro ao carregar o designs.json: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Dados carregados:', data);
            allDesigns = data.designs;
            console.log('Designs atribuídos:', allDesigns);
            displayInitialDesigns();
        })
        .catch(error => {
            console.error('Erro ao carregar os designs:', error);
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

        for (let i = start; i < end; i++) {
            const design = filteredDesigns[i];
            const galleryItem = document.createElement('div');
            galleryItem.classList.add('gallery-item');
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
        loadMoreBtn.style.display = displayedDesigns >= filteredDesigns.length ? 'none' : 'block';
    }

    // Obter designs filtrados com base na categoria ativa
    function getFilteredDesigns() {
        const activeCategory = document.querySelector('.filter-btn.active').getAttribute('data-category');
        if (activeCategory === 'all') {
            return allDesigns;
        }
        return allDesigns.filter(design => design.category === activeCategory);
    }

    // Filtrar designs ao clicar nos botões de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            displayInitialDesigns();
        });
    });

    // Carregar mais designs ao clicar no botão "Carregar Mais"
    loadMoreBtn.addEventListener('click', displayMoreDesigns);

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
        'wrapAround': true,
        'alwaysShowNavOnTouchDevices': true
    });

    // Carregar os designs ao iniciar
    loadDesigns();
});