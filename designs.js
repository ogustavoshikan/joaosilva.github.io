// === 1. Inicialização do Documento e Declaração de Variáveis Globais ===
document.addEventListener("DOMContentLoaded", function () {
    // --- Referências DOM/jQuery ---
    let galleryContainer = document.querySelector(".gallery-container");
    const $galleryContainerJQ = $(galleryContainer);
    const filterButtons = document.querySelectorAll(".filter-btn");
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const dropdownMenu = document.querySelector(".dropdown-menu");
    const homeBackToTopButton = document.getElementById('home-back-to-top');

    // --- Variáveis de Estado da Galeria ---
    let allDesigns = [];
    let currentFilteredDesigns = [];
    let displayedDesigns = 0;
    const designsPerLoad = 12;
    let isLoading = false;
    let currentCategory = 'all';

    // --- Variáveis e Seletores do Modal ---
    const modalOverlay = $('#custom-modal');
    const modalMainImage = $('#modal-main-image'); // Imagem principal (esquerda)
    const modalViewContainer = $('.modal-view-container');
    // Seletores para o painel de detalhes (direita)
    const modalDetailTitle = $('#modal-detail-title');
    const modalDetailDescription = $('#modal-detail-description');
    const modalDetailTool = $('#modal-detail-tool');
    const modalPromptThumbnail = $('#modal-prompt-thumbnail');
    const modalDetailPrompt = $('#modal-detail-prompt');
    // Seletores para detalhes originais (no fundo do painel direito)
    const modalResolution = $('#modal-resolution');
    const modalCreationDate = $('#modal-creation-date');
    const modalModel = $('#modal-model'); // Usado para modelo completo no fundo
    const modalAuthor = $('#modal-author');
    // Botões
    const closeModalBtn = $('.modal-close-btn');
    const prevModalBtn = $('.modal-nav-btn.prev');
    const nextModalBtn = $('.modal-nav-btn.next');
    // Estado do Modal
    let currentModalIndex = -1;


    // === 2. Carregamento de Dados Iniciais (designs.json) ===
    function loadDesigns() {
        console.log('Iniciando o carregamento do designs.json...');
        if (!galleryContainer) { console.error("galleryContainer não encontrado..."); return; }
        galleryContainer.innerHTML = '<p class="loading">Carregando...</p>';

        fetch('data/designs.json')
            .then(response => {
                if (!response.ok) throw new Error('Erro HTTP: ' + response.statusText);
                return response.json();
            })
            .then(data => {
                allDesigns = data.designs.filter(design => design.src && design.src !== 'assets' && design.src.trim() !== '');
                console.log(`Carregados ${allDesigns.length} designs válidos.`);
                currentFilteredDesigns = getFilteredDesigns();
                galleryContainer = document.querySelector(".gallery-container"); // Re-seleciona
                if (!galleryContainer) { console.error("Container da galeria desapareceu..."); return; }
                displayInitialDesigns();
            })
            .catch(error => {
                console.error('Erro fatal ao carregar/processar designs.json:', error);
                if (galleryContainer) { galleryContainer.innerHTML = '<p class="error">Erro ao carregar designs.</p>'; }
            });
    }

    // === 3. Exibição Inicial / Reset da Galeria (após filtro) ===
    function displayInitialDesigns() {
        console.log("displayInitialDesigns chamado.");
        // ... (verificação do galleryContainer como antes) ...
        if (!galleryContainer || typeof galleryContainer.parentNode === 'undefined' || galleryContainer.parentNode === null) {
             console.warn("Tentando displayInitialDesigns em container inválido...");
             galleryContainer = document.querySelector(".gallery-container");
             if (!galleryContainer) { console.error("Falha crítica: Não foi possível encontrar galleryContainer..."); return; }
         }

        const oldContainer = galleryContainer;
        const newContainer = document.createElement('div');
        newContainer.className = 'gallery-container';
        newContainer.style.opacity = '0';
        newContainer.style.transition = 'opacity 0.3s ease';

        currentFilteredDesigns = getFilteredDesigns();
        console.log(`Atualizado currentFilteredDesigns com ${currentFilteredDesigns.length} itens para '${currentCategory}'.`);

        if (oldContainer.parentNode) { oldContainer.parentNode.insertBefore(newContainer, oldContainer.nextSibling); }
        else { /* ... (fallback para adicionar ao main) ... */
            const mainElement = document.querySelector('main.designs-gallery');
            if (mainElement) mainElement.appendChild(newContainer); else { console.error("Local para newContainer não encontrado."); return; }
        }

        galleryContainer = newContainer;
        const $newGalleryContainerJQ = $(galleryContainer);
        setupModalClickListener($newGalleryContainerJQ);

        displayedDesigns = 0;
        galleryContainer.innerHTML = '';
        displayMoreDesigns();

        setTimeout(() => { if (newContainer) newContainer.style.opacity = '1'; }, 50);
        setTimeout(() => {
            if (oldContainer && oldContainer.parentNode) oldContainer.remove();
            recalculateLayout();
        }, 350);
    }

    // === 4. Adição Incremental de Designs (Scroll ou Inicial) ===
    function displayMoreDesigns() {
        // ... (verificação do galleryContainer e isLoading como antes) ...
        if (!galleryContainer || !document.body.contains(galleryContainer)) { console.warn("displayMoreDesigns: galleryContainer inválido..."); return; }
        if (isLoading) return;

        const start = displayedDesigns;
        const end = Math.min(start + designsPerLoad, currentFilteredDesigns.length);
        if (start >= currentFilteredDesigns.length) { console.log("Fim dos designs."); isLoading = false; return; }

        isLoading = true;
        console.log(`Exibindo designs do índice ${start} a ${end - 1}`);
        const fragment = document.createDocumentFragment();

        for (let i = start; i < end; i++) {
            const design = currentFilteredDesigns[i];
            if (!design || !design.src || design.src === 'assets' || design.src.trim() === '') continue;

            const galleryItem = document.createElement('div');
            galleryItem.classList.add('gallery-item');
            // Guarda o índice na lista filtrada ATUAL
            galleryItem.dataset.index = i;
            // Guarda outros dados se precisar diretamente (opcional, pois já temos no array)
            // galleryItem.dataset.src = design.src;

            const img = new Image();
            img.src = design.src; // Ou thumbnail
            img.alt = design.alt || 'Design de IA';
            img.loading = "lazy";
            galleryItem.appendChild(img);
            fragment.appendChild(galleryItem);
        }

        galleryContainer.appendChild(fragment);
        displayedDesigns = end;
        isLoading = false;
        recalculateLayout();
    }

    // === 5. Recalcular Layout (Placeholder) ===
    function recalculateLayout() { /* ... */ }

    // === 6. Obter Lista de Designs Filtrados ===
    function getFilteredDesigns() {
        if (currentCategory === 'all') return [...allDesigns];
        return allDesigns.filter(design => design.category === currentCategory);
    }

    // === 7. Lógica dos Botões de Filtro ===
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // ... (lógica de filtro como antes, chamando displayInitialDesigns) ...
             const category = button.getAttribute('data-category');
             if (isLoading || currentCategory === category) return;
             console.log(`Filtrando por: ${category}`);
             currentCategory = category;
             filterButtons.forEach(btn => btn.classList.remove('active'));
             button.classList.add('active');
             if (galleryContainer) galleryContainer.classList.add('filter-transition');
             setTimeout(() => {
                  if (galleryContainer) galleryContainer.style.opacity = '0';
                  setTimeout(() => { displayInitialDesigns(); }, 300);
             }, 50);
        });
    });

    // === 8. Função Utilitária Debounce ===
    function debounce(func, wait) { /* ... (como antes) ... */
        let timeout;
        return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout); func(...args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // === 9. Lógica de Scroll Infinito ===
    const debouncedScrollCheck = debounce(() => { /* ... (como antes, chamando displayMoreDesigns) ... */
        if (isLoading || modalOverlay.hasClass('active')) return;
        if (!galleryContainer || !document.body.contains(galleryContainer)) return;
        const scrollPosition = window.scrollY + window.innerHeight;
        const containerBottom = galleryContainer.offsetTop + galleryContainer.offsetHeight;
        const triggerPoint = containerBottom - 300;
        if (scrollPosition >= triggerPoint) {
             console.log("Scroll threshold reached...");
             displayMoreDesigns();
         }
    }, 100);
    window.addEventListener('scroll', debouncedScrollCheck);

    // === 10. Lógica do Botão "Voltar ao Topo" ===
    if (homeBackToTopButton) { /* ... (como antes) ... */
        window.addEventListener('scroll', debounce(() => {
             homeBackToTopButton.classList.toggle('visible', window.scrollY > 600);
         }, 100));
         homeBackToTopButton.addEventListener('click', (e) => {
             e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' });
         });
     } else { console.warn('Botão #home-back-to-top não encontrado!'); }

    // === 11. Lógica do Dropdown ===
    if (dropdownToggle && dropdownMenu) { /* ... (como antes) ... */
        dropdownToggle.addEventListener('click', () => {
             dropdownMenu.classList.toggle('show');
             dropdownToggle.classList.toggle('active');
         });
         document.addEventListener('click', (event) => {
             if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
                 dropdownMenu.classList.remove('show');
                 dropdownToggle.classList.remove('active');
             }
         });
     } else { console.warn("Dropdown toggle ou menu não encontrado."); }


    // === 12. Lógica do Modal Customizado (ATUALIZADA com Scroll Reset e Visibilidade da Barra) ===

    // --- Seletores ADICIONAIS para elementos DOM (para scroll e touch) ---
    const detailsScrollAreaEl = document.querySelector('.details-scroll-area');
    const promptTextEl = document.querySelector('.prompt-text');
    let scrollTimer = null; // Timer para esconder a barra após scroll parar

    // --- Função Principal para Atualizar Conteúdo do Modal (com Scroll Reset)---
    function updateModalContent(index) {
        if (index < 0 || index >= currentFilteredDesigns.length) {
            console.error("Índice inválido para updateModalContent:", index);
            closeModal(); return;
        }
        currentModalIndex = index;
        const designData = currentFilteredDesigns[index];
        console.log(`Atualizando modal para índice ${index}:`, designData.src);

        // 1. Atualiza Imagem Principal
        modalMainImage.attr('src', designData.src || '');

        // 2. Atualiza Painel de Detalhes (Direita)
        modalDetailTitle.text(designData.category || 'Detalhes da Imagem');
        modalDetailDescription.text(designData.description || '');
        // Usando .closest() para achar o pai <p> e esconder se vazio
        modalDetailDescription.closest('p').toggle(!!designData.description);

        const toolName = designData.model ? designData.model.split(' ')[0] : 'N/A';
        modalDetailTool.text(toolName);
        modalDetailTool.closest('.detail-section').toggle(!!designData.model);

        modalDetailPrompt.text(designData.prompt || 'Prompt não disponível.');
        modalPromptThumbnail.attr('src', designData.src || '');
        modalPromptThumbnail.toggle(!!designData.src);
        modalDetailPrompt.closest('.detail-section').toggle(!!designData.prompt);

        // 3. Atualiza Detalhes Originais (no fundo)
        modalResolution.text(designData.resolution || 'N/A');
        modalCreationDate.text(designData.createdAt ? new Date(designData.createdAt).toLocaleDateString('pt-BR') : 'N/A');
        modalModel.text(designData.model || 'N/A');
        modalAuthor.text(designData.author || 'N/A');

        // 4. Atualiza Botões de Navegação
        const hasMoreThanOne = currentFilteredDesigns.length > 1;
        prevModalBtn.prop('disabled', !hasMoreThanOne);
        nextModalBtn.prop('disabled', !hasMoreThanOne);

        // === ADICIONADO: Resetar Scroll das Áreas ===
        // Usamos setTimeout 0 para garantir que o reset ocorra APÓS
        // o navegador recalcular o layout com o novo conteúdo.
        setTimeout(() => {
            if (detailsScrollAreaEl) detailsScrollAreaEl.scrollTop = 0;
            if (promptTextEl) promptTextEl.scrollTop = 0;
            // Remove a classe de scrolling caso tenha ficado de uma navegação anterior
            if (detailsScrollAreaEl) detailsScrollAreaEl.classList.remove('is-scrolling');
            if (promptTextEl) promptTextEl.classList.remove('is-scrolling');
             console.log("Scroll positions reset.");
        }, 0);
        // === FIM ADICIONADO ===
    }

    // --- Funções openModal, closeModal, setupModalClickListener ---
    // (Mantidas como estavam na sua última versão funcional)
     function openModal(index) {
         if (index < 0 || index >= currentFilteredDesigns.length) {
              console.error(`Índice inválido ${index} para abrir modal.`); return;
         }
         console.log(`Abrindo modal no índice: ${index}`);
         // updateModalContent já reseta o scroll
         updateModalContent(index);
         modalOverlay.addClass('active');
         $('body').css('overflow', 'hidden');
     }

     function closeModal() {
         modalOverlay.removeClass('active');
         $('body').css('overflow', '');
         currentModalIndex = -1;
         // Limpa o timer se o modal for fechado enquanto a barra está visível
         clearTimeout(scrollTimer);
         console.log("Modal fechado.");
     }

     function setupModalClickListener($container) {
          $container.off('click', '.gallery-item');
          $container.on('click', '.gallery-item', function(e) {
             e.preventDefault();
             const itemIndex = parseInt($(this).data('index'), 10);
             if (!isNaN(itemIndex)) { openModal(itemIndex); }
             else { console.error("data-index inválido:", this); }
         });
         console.log("Listener de clique modal configurado:", $container[0]);
     }


     // --- Listeners para Navegação (Botões e Swipe) ---
     // (Mantidos como estavam na sua última versão funcional)
     prevModalBtn.on('click', function() {
         if (currentFilteredDesigns.length <= 1) return;
         const newIndex = (currentModalIndex - 1 + currentFilteredDesigns.length) % currentFilteredDesigns.length;
         updateModalContent(newIndex);
     });
     nextModalBtn.on('click', function() {
         if (currentFilteredDesigns.length <= 1) return;
         const newIndex = (currentModalIndex + 1) % currentFilteredDesigns.length;
         updateModalContent(newIndex);
     });
     // Código de Swipe (como estava antes)
     const imageViewerElement = document.querySelector('.modal-image-viewer');
     let touchstartX = 0; /* ... (resto do código de swipe como antes) ... */
     let touchstartY = 0; let touchendX = 0; let touchendY = 0; const minSwipeDistance = 50;
      if (imageViewerElement) {
          imageViewerElement.addEventListener('touchstart', function(event) { if (!modalOverlay.hasClass('active')) return; touchstartX = event.changedTouches[0].screenX; touchstartY = event.changedTouches[0].screenY; }, { passive: true });
          imageViewerElement.addEventListener('touchend', function(event) { if (!modalOverlay.hasClass('active') || touchstartX === 0) return; touchendX = event.changedTouches[0].screenX; touchendY = event.changedTouches[0].screenY; handleSwipeGesture(); touchstartX = 0; touchstartY = 0; }, { passive: true });
      } else { console.error(".modal-image-viewer não encontrado para swipe."); }
      function handleSwipeGesture() { const deltaX = touchendX - touchstartX; const deltaY = touchendY - touchstartY; if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) { return; } if (Math.abs(deltaX) > Math.abs(deltaY)) { if (deltaX < -minSwipeDistance) { nextModalBtn.trigger('click'); } else if (deltaX > minSwipeDistance) { prevModalBtn.trigger('click'); } } else if (deltaY > minSwipeDistance) { closeModal(); } }


    // --- Listeners para Fechar o Modal (Botão, Fundo, Tecla Esc) ---
    // (Mantidos como estavam na sua última versão funcional, incluindo o listener no modalViewContainer)
    closeModalBtn.on('click', closeModal);
    modalOverlay.on('click', function(e) { if (e.target === this) { console.log("Click no Overlay"); closeModal(); } });
    modalViewContainer.on('click', function(e) { const imageViewerElement = document.querySelector('.modal-image-viewer'); if (e.target === this || e.target === imageViewerElement) { if ($(e.target).closest('.modal-nav-btn').length > 0) { return; } if (e.target.id === 'modal-main-image') { return; } console.log("Closing via View Container/Viewer bg click."); closeModal(); } });
    $(document).on('keydown', function(e) { if (e.key === "Escape" && modalOverlay.hasClass('active')) closeModal(); });


    // === ADICIONADO: Lógica para Visibilidade da Barra de Rolagem ===
    function handleScrollInteraction(element) {
        if (!element) return;
        // Mostra a barra (adiciona classe)
        element.classList.add('is-scrolling');

        // Limpa qualquer timer anterior para esconder a barra
        clearTimeout(scrollTimer);

        // Define um novo timer para esconder a barra após um tempo sem scroll/touch
        scrollTimer = setTimeout(() => {
            element.classList.remove('is-scrolling');
        }, 1000); // Esconde após 1 segundos de inatividade
    }

    // Adiciona listeners aos elementos roláveis
    if (detailsScrollAreaEl) {
        detailsScrollAreaEl.addEventListener('scroll', () => handleScrollInteraction(detailsScrollAreaEl), { passive: true });
        detailsScrollAreaEl.addEventListener('touchstart', () => handleScrollInteraction(detailsScrollAreaEl), { passive: true });
        detailsScrollAreaEl.addEventListener('touchend', () => {
             // Reinicia o timer no touchend para garantir que esconda se parar de tocar
             handleScrollInteraction(detailsScrollAreaEl);
        });
    } else {
        console.warn(".details-scroll-area não encontrado para listeners de scrollbar.");
    }

    if (promptTextEl) {
        promptTextEl.addEventListener('scroll', () => handleScrollInteraction(promptTextEl), { passive: true });
        promptTextEl.addEventListener('touchstart', () => handleScrollInteraction(promptTextEl), { passive: true });
         promptTextEl.addEventListener('touchend', () => {
             handleScrollInteraction(promptTextEl);
        });
    } else {
        console.warn(".prompt-text não encontrado para listeners de scrollbar.");
    }
    // === FIM: Lógica para Visibilidade da Barra de Rolagem ===
    // === 13. Inicialização Geral ===
    loadDesigns();
    setupModalClickListener($galleryContainerJQ);

}); // Fim do document.addEventListener("DOMContentLoaded", ...)