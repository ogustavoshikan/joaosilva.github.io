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


    // === 12. Lógica do Modal Customizado (ATUALIZADA) ===
    
    // === ADICIONADO: Lógica para SWIPE no Modal ===
    const imageViewerElement = document.querySelector('.modal-image-viewer'); // Elemento onde o swipe será detectado
    let touchstartX = 0;
    let touchstartY = 0;
    let touchendX = 0;
    let touchendY = 0;
    const minSwipeDistance = 50; // Distância mínima em pixels para considerar um swipe

    if (imageViewerElement) { // Garante que o elemento existe
        imageViewerElement.addEventListener('touchstart', function(event) {
            // Apenas registra o toque se o modal estiver ativo
            if (!modalOverlay.hasClass('active')) return;
            touchstartX = event.changedTouches[0].screenX;
            touchstartY = event.changedTouches[0].screenY;
        }, { passive: true }); // passive: true para melhor performance de scroll

        imageViewerElement.addEventListener('touchend', function(event) {
            // Apenas processa se o modal estiver ativo e houve um toque inicial
            if (!modalOverlay.hasClass('active') || touchstartX === 0) return;

            touchendX = event.changedTouches[0].screenX;
            touchendY = event.changedTouches[0].screenY;
            handleSwipeGesture();
             // Reseta após processar
             touchstartX = 0;
             touchstartY = 0;
        }, { passive: true });

    } else {
        console.error("Elemento .modal-image-viewer não encontrado para adicionar listeners de swipe.");
    }

    function handleSwipeGesture() {
        const deltaX = touchendX - touchstartX;
        const deltaY = touchendY - touchstartY;

        // Verifica se foi um swipe significativo (não apenas um toque)
        if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
            console.log("Movimento muito curto, não considerado swipe.");
            return;
        }

        // Prioriza Swipe Horizontal para Navegação
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Swipe Horizontal detectado
            if (deltaX < -minSwipeDistance) { // Swipe para a Esquerda (-> Próximo)
                console.log('Swipe Left detectado - Próximo');
                nextModalBtn.trigger('click'); // Simula clique no botão "Próximo"
            } else if (deltaX > minSwipeDistance) { // Swipe para a Direita (<- Anterior)
                 console.log('Swipe Right detectado - Anterior');
                prevModalBtn.trigger('click'); // Simula clique no botão "Anterior"
            }
        }
        // Verifica Swipe Vertical para Fechar (APENAS se não for horizontal dominante)
        else if (deltaY > minSwipeDistance) {
             // Swipe para Baixo detectado
             console.log('Swipe Down detectado - Fechar');
             closeModal(); // Chama a função de fechar
        }
         // Poderíamos adicionar lógica para Swipe Up aqui se necessário no futuro
         // else if (deltaY < -minSwipeDistance) { console.log('Swipe Up'); }
    }
    // === FIM: Lógica para SWIPE no Modal ===

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
        modalDetailTitle.text(designData.category || 'Detalhes da Imagem'); // Usa category ou fallback
        modalDetailDescription.text(designData.description || '');
        modalDetailDescription.parent().toggle(!!designData.description); // Esconde o <p> se vazio

        const toolName = designData.model ? designData.model.split(' ')[0] : 'N/A';
        modalDetailTool.text(toolName);
        // Esconde seção Tool se não houver modelo
        $('#modal-detail-tool').closest('.detail-section').toggle(!!designData.model);

        modalDetailPrompt.text(designData.prompt || 'Prompt não disponível.');
        modalPromptThumbnail.attr('src', designData.src || ''); // Usa imagem principal como thumb
        modalPromptThumbnail.toggle(!!designData.src);
        // Esconde seção Prompt se não houver prompt
        $('#modal-detail-prompt').closest('.detail-section').toggle(!!designData.prompt);

        // 3. Atualiza Detalhes Originais (no fundo)
        modalResolution.text(designData.resolution || 'N/A');
        modalCreationDate.text(designData.createdAt ? new Date(designData.createdAt).toLocaleDateString('pt-BR') : 'N/A');
        modalModel.text(designData.model || 'N/A'); // Modelo completo
        modalAuthor.text(designData.author || 'N/A');

        // 4. Atualiza Botões de Navegação
        const hasMoreThanOne = currentFilteredDesigns.length > 1;
        prevModalBtn.prop('disabled', !hasMoreThanOne);
        nextModalBtn.prop('disabled', !hasMoreThanOne);
    }

    function openModal(index) {
        if (index < 0 || index >= currentFilteredDesigns.length) {
             console.error(`Índice inválido ${index} para abrir modal.`); return;
        }
        console.log(`Abrindo modal no índice: ${index}`);
        updateModalContent(index);
        modalOverlay.addClass('active');
        $('body').css('overflow', 'hidden');
    }

    function closeModal() {
        modalOverlay.removeClass('active');
        $('body').css('overflow', '');
        currentModalIndex = -1;
        // modalMainImage.attr('src', ''); // Opcional
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

    // Listeners Navegação e Fechar (sem mudanças)
    prevModalBtn.on('click', function() { /* ... (como antes) ... */
        if (currentFilteredDesigns.length <= 1) return;
        const newIndex = (currentModalIndex - 1 + currentFilteredDesigns.length) % currentFilteredDesigns.length;
        updateModalContent(newIndex);
    });
    nextModalBtn.on('click', function() { /* ... (como antes) ... */
        if (currentFilteredDesigns.length <= 1) return;
        const newIndex = (currentModalIndex + 1) % currentFilteredDesigns.length;
        updateModalContent(newIndex);
    });
    closeModalBtn.on('click', closeModal);
    modalOverlay.on('click', function(e) { if (e.target === this) closeModal(); });
        // === ATUALIZADO: Listener no CONTAINER PRINCIPAL e VISUALIZADOR DE IMAGEM ===
    // Fecha se clicar na área "vazia" do container OU na área "vazia" do image-viewer
    modalViewContainer.on('click', function(e) {
        console.log("Click detected inside modalViewContainer. Target:", e.target); // Log para depuração
        const imageViewerElement = document.querySelector('.modal-image-viewer'); // Pega o elemento DOM

        // Verifica se o clique foi:
        // 1. Diretamente no .modal-view-container (this)
        // OU
        // 2. Diretamente no .modal-image-viewer (imageViewerElement)
        if (e.target === this || e.target === imageViewerElement) {

            // AGORA, verificamos se NÃO foi em um filho que NÃO deve fechar o modal
            if ($(e.target).closest('.modal-nav-btn').length > 0) {
                console.log("Clicked on or inside nav button, not closing.");
                return; // Sai se o clique foi no botão de navegação ou dentro dele
            }
            if (e.target.id === 'modal-main-image') {
                console.log("Clicked on the image itself, not closing.");
                return; // Sai se o clique foi na imagem principal
            }
            // Adicione aqui outras exceções se necessário (ex: se tiver links na imagem)

            // Se passou pelas verificações acima, fecha o modal
            console.log("Closing modal via View Container or Image Viewer background click.");
            closeModal();

        } else {
             console.log("Click target is something else inside view container (e.g., details panel), not closing via this listener.");
        }
    });
    // === FIM ATUALIZADO ===
    $(document).on('keydown', function(e) { if (e.key === "Escape" && modalOverlay.hasClass('active')) closeModal(); });

    // === 13. Inicialização Geral ===
    loadDesigns();
    setupModalClickListener($galleryContainerJQ);

}); // Fim do document.addEventListener("DOMContentLoaded", ...)