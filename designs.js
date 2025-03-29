document.addEventListener("DOMContentLoaded", function () {
    let galleryContainer = document.querySelector(".gallery-container"); // Alterado de const para let
    const filterButtons = document.querySelectorAll(".filter-btn");
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const dropdownMenu = document.querySelector(".dropdown-menu");
    let allDesigns = [];
    let displayedDesigns = 0;
    const designsPerLoad = 12;
    let isLoading = false;
    let currentCategory = 'all';

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
                allDesigns = data.designs.filter(design => 
                    design.src && 
                    design.src !== 'assets' && 
                    design.src.trim() !== ''
                );
                displayInitialDesigns();
            })
            .catch(error => {
                console.error('Erro ao carregar os designs:', error);
                galleryContainer.innerHTML = '<p class="error">Erro ao carregar os designs. Tente novamente mais tarde.</p>';
            });
    }

    function displayInitialDesigns() {
        const oldContainer = galleryContainer;
        const newContainer = document.createElement('div');
        newContainer.className = 'gallery-container';
        newContainer.style.opacity = '0';
        newContainer.style.transition = 'opacity 0.3s ease';
        
        oldContainer.parentNode.insertBefore(newContainer, oldContainer.nextSibling);
        
        // Atualiza a referência global
        galleryContainer = newContainer;
        
        displayedDesigns = 0;
        displayMoreDesigns();
        
        setTimeout(() => {
            newContainer.style.opacity = '1';
            setTimeout(() => {
                oldContainer.remove();
                recalculateLayout();
            }, 300);
        }, 50);
    }

    function displayMoreDesigns() {
        const filteredDesigns = getFilteredDesigns();
        const start = displayedDesigns;
        const end = Math.min(start + designsPerLoad, filteredDesigns.length);

        if (start >= filteredDesigns.length) {
            isLoading = false;
            return;
        }

        const fragment = document.createDocumentFragment();

        for (let i = start; i < end; i++) {
            const design = filteredDesigns[i];
            
            if (!design.src || design.src === 'assets' || design.src.trim() === '') {
                continue;
            }
            
            const galleryItem = document.createElement('div');
            galleryItem.classList.add('gallery-item');
            galleryItem.dataset.designId = design.id || i;
            
            const img = new Image();
            img.src = design.src;
            img.alt = design.alt || 'Design de IA';
            img.loading = "lazy";
            
            img.onload = function() {
                if (i % 4 === 0) {
                    recalculateLayout();
                }
            };
            
            const link = document.createElement('a');
            link.href = design.src;
            link.setAttribute('data-lightbox', 'gallery');
            link.setAttribute('data-title', `
                <div class='design-info'>
                    <p><strong>Resolução:</strong> ${design.resolution || 'N/A'}</p>
                    <p><strong>Data de Criação:</strong> ${design.createdAt ? new Date(design.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
                    <p><strong>Modelo:</strong> ${design.model || 'N/A'}</p>
                    <p><strong>Autor:</strong> ${design.author || 'N/A'}</p>
                </div>
            `);
            
            link.appendChild(img);
            galleryItem.appendChild(link);
            fragment.appendChild(galleryItem);
        }

        galleryContainer.appendChild(fragment);
        displayedDesigns = end;
        isLoading = false;
    }

    function recalculateLayout() {
        // Adicione lógica de layout aqui se necessário
    }

    function getFilteredDesigns() {
        if (currentCategory === 'all') {
            return allDesigns;
        }
        return allDesigns.filter(design => design.category === currentCategory);
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentCategory === button.getAttribute('data-category')) {
                return;
            }
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            currentCategory = button.getAttribute('data-category');
            
            const preloadImages = () => {
                const filteredDesigns = getFilteredDesigns();
                const preloadCount = Math.min(6, filteredDesigns.length);
                
                for (let i = 0; i < preloadCount; i++) {
                    const img = new Image();
                    img.src = filteredDesigns[i].src;
                }
            };
            
            preloadImages();
            galleryContainer.classList.add('filter-transition');
            
            setTimeout(() => {
                displayInitialDesigns();
            }, 50);
        });
    });

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    window.addEventListener('scroll', debounce(() => {
        if (isLoading) return;

        const scrollPosition = window.scrollY + window.innerHeight;
        const pageHeight = document.documentElement.scrollHeight;

        if (scrollPosition >= pageHeight - 200) {
            isLoading = true;
            displayMoreDesigns();
        }
    }, 100));

    const homeBackToTopButton = document.getElementById('home-back-to-top');
    const homeBackToTopText = document.querySelector('.home-back-to-top-text');
    if (homeBackToTopButton && homeBackToTopText) {
        window.addEventListener('scroll', debounce(() => {
            if (window.scrollY > 600) {
                homeBackToTopButton.classList.add('visible');
                homeBackToTopText.classList.add('visible');
            } else {
                homeBackToTopButton.classList.remove('visible');
                homeBackToTopText.classList.remove('visible');
            }
        }, 100));

        homeBackToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    } else {
        console.error('Botão #home-back-to-top ou texto .home-back-to-top-text não encontrado!');
    }

    lightbox.option({
        'resizeDuration': 200,
        'wrapAround': true,
        'alwaysShowNavOnTouchDevices': true
    });

    dropdownToggle.addEventListener('click', () => {
        dropdownMenu.classList.toggle('show');
        dropdownToggle.classList.toggle('active'); // Adicione esta linha
    });

    document.addEventListener('click', (event) => {
        if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('show');
            dropdownToggle.classList.remove('active'); // Adicione esta linha
        }
    });

    loadDesigns();
});