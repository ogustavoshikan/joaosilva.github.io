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
    const modalMainImage = $('#modal-main-image');
    const modalViewContainer = $('.modal-view-container');
    // Seletores Painel Detalhes (Topo e Meio)
    const modalDetailTitle = $('#modal-detail-title');
    const modalDetailDescription = $('#modal-detail-description');
    const modalDetailTool = $('#modal-detail-tool'); // Para a tag 'Tool'
    const modalPromptThumbnail = $('#modal-prompt-thumbnail');
    // Seletores para Detalhes Inferiores (NOVOS)
    const modalCreatedValue = $('#modal-created-value');     // << NOVO
    const modalDimensionsValue = $('#modal-dimensions-value'); // << NOVO
    const modalToolValue = $('#modal-tool-value');         // << NOVO (Para linha Ferramenta)
    const modalAuthorValue = $('#modal-author-value');       // << NOVO
    // Botões
    const closeModalBtn = $('.modal-close-btn');
    const prevModalBtn = $('.modal-nav-btn.prev');
    const nextModalBtn = $('.modal-nav-btn.next');
    // Elementos DOM para Scroll/Touch
    const detailsScrollAreaEl = document.querySelector('.details-scroll-area');
    let scrollTimer = null;
    // Estado
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
    if (!galleryContainer || typeof galleryContainer.parentNode === 'undefined' || galleryContainer.parentNode === null) {
        console.warn("Tentando displayInitialDesigns em container inválido...");
        galleryContainer = document.querySelector(".gallery-container");
        if (!galleryContainer) { console.error("Falha crítica: Não foi possível encontrar galleryContainer..."); return; }
    }

    const oldContainer = galleryContainer;
    const parent = oldContainer.parentNode; // Guarda a referência do pai

    // 1. Iniciar o Fade Out do container antigo
    oldContainer.style.transition = 'opacity 0.3s ease-out'; // Garante a transição
    oldContainer.style.opacity = '0';

    // 2. Esperar o fade-out terminar para remover o antigo e criar/popular/mostrar o novo
    setTimeout(() => {
        // Remove o container antigo do DOM
        if (oldContainer && parent && parent.contains(oldContainer)) {
            parent.removeChild(oldContainer);
        }

        // Cria o novo container
        const newContainer = document.createElement('div');
        newContainer.className = 'gallery-container';
        newContainer.style.opacity = '0'; // Começa invisível
        newContainer.style.transition = 'opacity 0.3s ease-in'; // Transição de entrada

        // Insere o novo container onde o antigo estava
        if (parent) {
             // Tenta inserir antes do próximo irmão ou no final do pai
             const nextSibling = oldContainer.nextSibling; // Tenta pegar o próximo elemento (pode não existir)
             if (nextSibling) {
                 parent.insertBefore(newContainer, nextSibling);
             } else {
                 parent.appendChild(newContainer); // Adiciona no final se não houver próximo
             }
        } else {
            // Fallback: Adiciona ao main (se o pai original foi perdido)
            const mainElement = document.querySelector('main.designs-gallery');
            if (mainElement) mainElement.appendChild(newContainer); else { console.error("Local para newContainer não encontrado."); return; }
        }


        // Atualiza a referência global e o jQuery
        galleryContainer = newContainer;
        const $newGalleryContainerJQ = $(galleryContainer);
        setupModalClickListener($newGalleryContainerJQ); // Reconfigura o listener no novo container

        // Filtra os designs
        currentFilteredDesigns = getFilteredDesigns();
        console.log(`Atualizado currentFilteredDesigns com ${currentFilteredDesigns.length} itens para '${currentCategory}'.`);

        // Reseta e popula o novo container
        displayedDesigns = 0;
        galleryContainer.innerHTML = ''; // Limpa (redundante, mas seguro)
        displayMoreDesigns(); // Adiciona os primeiros designs

        // Força um reflow (às vezes necessário para a transição iniciar corretamente)
        void galleryContainer.offsetWidth;

        // Inicia o fade-in do novo container
        galleryContainer.style.opacity = '1';

        // Recalcula o layout (se necessário)
        recalculateLayout(); // Chama após o novo container estar visível

    }, 300); // Tempo igual à duração do fade-out
}

// --- Modificação no listener do botão de filtro ---
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
         const category = button.getAttribute('data-category');
         if (isLoading || currentCategory === category) return;
         console.log(`Filtrando por: ${category}`);
         currentCategory = category;
         filterButtons.forEach(btn => btn.classList.remove('active'));
         button.classList.add('active');
         // Não precisa mais da classe 'filter-transition' ou dos timeouts aqui
         // Apenas chama displayInitialDesigns que agora cuida da animação
         displayInitialDesigns();
    });
});

    // === 4. Adição Incremental de Designs (Scroll ou Inicial) ===
    function displayMoreDesigns() {
    if (!galleryContainer || !document.body.contains(galleryContainer)) { console.warn("displayMoreDesigns: galleryContainer inválido..."); return; }
    if (isLoading) return;

    const start = displayedDesigns;
    const end = Math.min(start + designsPerLoad, currentFilteredDesigns.length);
    if (start >= currentFilteredDesigns.length) { console.log("Fim dos designs."); isLoading = false; return; }

    isLoading = true;
    console.log(`Exibindo designs do índice ${start} a ${end - 1}`);
    const fragment = document.createDocumentFragment();
    const itemsToAnimate = []; // Guarda os itens para animar depois de adicionar ao DOM

    for (let i = start; i < end; i++) {
        const design = currentFilteredDesigns[i];
        if (!design || !design.src || design.src === 'assets' || design.src.trim() === '') continue;

        const galleryItem = document.createElement('div');
        galleryItem.classList.add('gallery-item'); // Classe base com opacity 0
        galleryItem.dataset.index = i; // Importante manter para o modal

        const img = new Image();
        img.src = design.src;
        img.alt = design.alt || 'Design de IA';
        img.loading = "lazy";
        galleryItem.appendChild(img);
        fragment.appendChild(galleryItem);
        itemsToAnimate.push(galleryItem); // Adiciona à lista para animar
    }

    galleryContainer.appendChild(fragment);

    // Anima os itens recém-adicionados com delay
    itemsToAnimate.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('visible');
        }, index * 50); // Atraso de 50ms entre cada item (ajuste o valor)
    });


    displayedDesigns = end;
    isLoading = false;
    recalculateLayout(); // Pode precisar ser chamado após as animações ou com delay
}

// Modificação na função displayInitialDesigns para usar o Staggered
function displayInitialDesigns() {
    console.log("displayInitialDesigns chamado (Staggered).");
     if (!galleryContainer || typeof galleryContainer.parentNode === 'undefined' || galleryContainer.parentNode === null) {
         console.warn("Tentando displayInitialDesigns em container inválido...");
         galleryContainer = document.querySelector(".gallery-container");
         if (!galleryContainer) { console.error("Falha crítica: Não foi possível encontrar galleryContainer..."); return; }
     }

    const oldContainer = galleryContainer;
    const parent = oldContainer.parentNode;

    // Opcional: Fade out rápido do container antigo se preferir
    // oldContainer.style.transition = 'opacity 0.15s ease-out';
    // oldContainer.style.opacity = '0';

    // Pode remover imediatamente ou esperar um pouco
    // setTimeout(() => {
         if (oldContainer && parent && parent.contains(oldContainer)) {
             parent.removeChild(oldContainer);
         }

        const newContainer = document.createElement('div');
        newContainer.className = 'gallery-container';
        // Não precisa de opacity no container aqui, a animação é por item

        if (parent) {
             const nextSibling = oldContainer.nextSibling;
             if (nextSibling) parent.insertBefore(newContainer, nextSibling); else parent.appendChild(newContainer);
        } else {
             const mainElement = document.querySelector('main.designs-gallery');
             if (mainElement) mainElement.appendChild(newContainer); else { console.error("Local para newContainer não encontrado."); return; }
        }

        galleryContainer = newContainer;
        const $newGalleryContainerJQ = $(galleryContainer);
        setupModalClickListener($newGalleryContainerJQ);

        currentFilteredDesigns = getFilteredDesigns();
        console.log(`Atualizado currentFilteredDesigns com ${currentFilteredDesigns.length} itens para '${currentCategory}'.`);

        displayedDesigns = 0;
        galleryContainer.innerHTML = '';

        // Chama displayMoreDesigns que AGORA aplica a animação staggered
        displayMoreDesigns();

        // Não precisa mais de fade in no container aqui
        recalculateLayout();
    // }, 150); // Se usou o fade out rápido acima
}

// O listener do botão de filtro permanece o mesmo da Alternativa 1 (chama displayInitialDesigns)
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
         const category = button.getAttribute('data-category');
         if (isLoading || currentCategory === category) return;
         console.log(`Filtrando por: ${category}`);
         currentCategory = category;
         filterButtons.forEach(btn => btn.classList.remove('active'));
         button.classList.add('active');
         displayInitialDesigns(); // Chama a versão modificada
    });
});

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
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout); func(...args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // === 9. Lógica de Scroll Infinito ===
    const debouncedScrollCheck = debounce(() => {
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
    if (homeBackToTopButton) {
        window.addEventListener('scroll', debounce(() => {
             homeBackToTopButton.classList.toggle('visible', window.scrollY > 600);
         }, 100));
         homeBackToTopButton.addEventListener('click', (e) => {
             e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' });
         });
     } else { console.warn('Botão #home-back-to-top não encontrado!'); }

    // === 11. Lógica do Dropdown ===
    if (dropdownToggle && dropdownMenu) {
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


    // === 12. Lógica do Modal Customizado (CORRIGIDA V4.4) ===

    // --- Função Principal para Atualizar Conteúdo do Modal ---
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

        // 2. Atualiza Painel de Detalhes (Topo e Meio)
        modalDetailTitle.text(designData.category || 'Detalhes da Imagem');
        modalDetailDescription.text(designData.description || '');
        modalDetailDescription.closest('p').toggle(!!designData.description); // Esconde o <p> se a descrição for vazia

        const toolName = designData.model ? designData.model.split(' ')[0] : 'N/A'; // Pega só o primeiro nome (ex: Flux)
        modalDetailTool.text(toolName); // Atualiza a TAG 'Tool'
        modalDetailTool.closest('.detail-section').toggle(!!designData.model); // Esconde a seção 'Tool' se não houver modelo

        // ADICIONAR ESTA LINHA DE VOLTA para a miniatura
        modalPromptThumbnail.attr('src', designData.src || '');
        modalPromptThumbnail.toggle(!!designData.src); // Opcional: esconde se não houver src

        // O link/botão "Desbloquear" já está no HTML, não precisa de atualização aqui

        // 3. Atualiza Detalhes Inferiores (Usando NOVOS IDs)
        // Formatando Data e Hora
        let creationDateTime = 'N/A';
        if (designData.createdAt) {
            try {
                const date = new Date(designData.createdAt + "T00:00:00"); // Adiciona T00:00:00 para consistência
                const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                // Coloque aqui a hora/minuto real se tiver no JSON, senão use fixo
                const hour = 21; // Exemplo
                const minute = 37; // Exemplo
                 creationDateTime = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} às ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            } catch (e) {
                console.error("Erro ao formatar data:", e);
                creationDateTime = designData.createdAt; // Fallback
            }
        }
        modalCreatedValue.text(creationDateTime);          // << Usa o NOVO ID
        modalDimensionsValue.text(designData.resolution || 'N/A'); // << Usa o NOVO ID
        modalToolValue.text(designData.model || 'N/A');     // << Usa o NOVO ID (modelo completo aqui)
        modalAuthorValue.text(designData.author || 'N/A');    // << Usa o NOVO ID

        // 4. Atualiza Botões de Navegação
        const hasMoreThanOne = currentFilteredDesigns.length > 1;
        prevModalBtn.prop('disabled', !hasMoreThanOne);
        nextModalBtn.prop('disabled', !hasMoreThanOne);

        // 5. Reset do Scroll da área de detalhes principal
        setTimeout(() => {
            if (detailsScrollAreaEl) detailsScrollAreaEl.scrollTop = 0;
            if (detailsScrollAreaEl) detailsScrollAreaEl.classList.remove('is-scrolling');
            console.log("Scroll position for details area reset.");
        }, 0);
    }

    // --- Funções openModal, closeModal, setupModalClickListener ---
     function openModal(index) {
         if (index < 0 || index >= currentFilteredDesigns.length) { console.error(`Índice inválido ${index}.`); return; }
         console.log(`Abrindo modal no índice: ${index}`);
         updateModalContent(index); // Chama a função ATUALIZADA
         modalOverlay.addClass('active');
         $('body').css('overflow', 'hidden');
     }

     function closeModal() {
         modalOverlay.removeClass('active');
         $('body').css('overflow', '');
         currentModalIndex = -1;
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
     prevModalBtn.on('click', function() {
         if (currentFilteredDesigns.length <= 1) return;
         const newIndex = (currentModalIndex - 1 + currentFilteredDesigns.length) % currentFilteredDesigns.length;
         updateModalContent(newIndex); // Chama a função ATUALIZADA
     });
     nextModalBtn.on('click', function() {
         if (currentFilteredDesigns.length <= 1) return;
         const newIndex = (currentModalIndex + 1) % currentFilteredDesigns.length;
         updateModalContent(newIndex); // Chama a função ATUALIZADA
     });
     // Código de Swipe
     const imageViewerElement = document.querySelector('.modal-image-viewer');
     let touchstartX = 0; let touchstartY = 0; let touchendX = 0; let touchendY = 0; const minSwipeDistance = 50;
      if (imageViewerElement) {
          imageViewerElement.addEventListener('touchstart', function(event) { if (!modalOverlay.hasClass('active')) return; touchstartX = event.changedTouches[0].screenX; touchstartY = event.changedTouches[0].screenY; }, { passive: true });
          imageViewerElement.addEventListener('touchend', function(event) { if (!modalOverlay.hasClass('active') || touchstartX === 0) return; touchendX = event.changedTouches[0].screenX; touchendY = event.changedTouches[0].screenY; handleSwipeGesture(); touchstartX = 0; touchstartY = 0; }, { passive: true });
      } else { console.error(".modal-image-viewer não encontrado para swipe."); }
      function handleSwipeGesture() { const deltaX = touchendX - touchstartX; const deltaY = touchendY - touchstartY; if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) { return; } if (Math.abs(deltaX) > Math.abs(deltaY)) { if (deltaX < -minSwipeDistance) { nextModalBtn.trigger('click'); } else if (deltaX > minSwipeDistance) { prevModalBtn.trigger('click'); } } else if (deltaY > minSwipeDistance) { closeModal(); } }


    // --- Listeners para Fechar o Modal ---
    closeModalBtn.on('click', closeModal);
    modalOverlay.on('click', function(e) { if (e.target === this) { console.log("Click no Overlay"); closeModal(); } });
    modalViewContainer.on('click', function(e) { const imageViewerElement = document.querySelector('.modal-image-viewer'); if (e.target === this || e.target === imageViewerElement) { if ($(e.target).closest('.modal-nav-btn').length > 0) { return; } if (e.target.id === 'modal-main-image') { return; } console.log("Closing via View Container/Viewer bg click."); closeModal(); } });
    
    // Listener EXISTENTE para fechar com ESC
    $(document).on('keydown', function(e) {
        if (e.key === "Escape" && modalOverlay.hasClass('active')) {
             closeModal();
        }
    });

    // --- NOVO: Listener para Navegação por Teclado (Setas) ---
    $(document).on('keydown', function(e) {
        // Só executa se o modal estiver ativo
        if (!modalOverlay.hasClass('active')) {
            return;
        }

        // Verifica qual seta foi pressionada
        switch (e.key) {
            case "ArrowLeft":
            case "ArrowUp": // Mapeando Cima para Anterior também
                // Previne o comportamento padrão do navegador (ex: rolar a página)
                e.preventDefault();
                // Dispara o clique no botão "Anterior" se houver mais de uma imagem
                if (currentFilteredDesigns.length > 1) {
                    prevModalBtn.trigger('click');
                }
                break;
            case "ArrowRight":
            case "ArrowDown": // Mapeando Baixo para Próximo também
                // Previne o comportamento padrão do navegador
                e.preventDefault();
                // Dispara o clique no botão "Próximo" se houver mais de uma imagem
                 if (currentFilteredDesigns.length > 1) {
                    nextModalBtn.trigger('click');
                 }
                break;
            // Nenhuma ação para outras teclas
        }
    });


    // --- Lógica para Visibilidade da Barra de Rolagem ---
    function handleScrollInteraction(element) {
        if (!element) return;
        element.classList.add('is-scrolling');
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            element.classList.remove('is-scrolling');
        }, 1000); // Tempo para esconder
    }

    // Adiciona listeners apenas à área de scroll principal
    if (detailsScrollAreaEl) {
        detailsScrollAreaEl.addEventListener('scroll', () => handleScrollInteraction(detailsScrollAreaEl), { passive: true });
        detailsScrollAreaEl.addEventListener('touchstart', () => handleScrollInteraction(detailsScrollAreaEl), { passive: true });
        detailsScrollAreaEl.addEventListener('touchend', () => { handleScrollInteraction(detailsScrollAreaEl); });
    } else {
        console.warn(".details-scroll-area não encontrado para listeners de scrollbar.");
    }
    // REMOVIDO: Bloco de listeners para promptTextEl


    // === 13. Inicialização Geral ===
    loadDesigns();
    setupModalClickListener($galleryContainerJQ);

}); // Fim do document.addEventListener("DOMContentLoaded", ...)