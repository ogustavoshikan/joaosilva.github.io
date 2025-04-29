// Conteúdo de scripts/global.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Global scripts: DOM pronto. Inicializando funcionalidades globais...");

    // --- Seletores Globais (usados por múltiplas funções) ---
    const body = document.body;
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector("nav ul.nav-links"); // Mais específico

    // --- 1. Inicialização do Menu Mobile ---
    function inicializarMenuMobile() {
        if (menuToggle && navLinks) {
            console.log("Global: Inicializando Menu Mobile.");
            menuToggle.addEventListener("click", function (e) {
                e.stopPropagation(); // Evita que o clique feche imediatamente o menu
                navLinks.classList.toggle("active");
                const isExpanded = navLinks.classList.contains("active");
                menuToggle.setAttribute("aria-expanded", isExpanded);
            });

            // Opcional: Fechar o menu ao clicar em um link dentro dele
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                        menuToggle.setAttribute("aria-expanded", "false");
                    }
                });
            });

            // Opcional: Fechar o menu ao clicar fora dele
            document.addEventListener('click', (e) => {
                if (navLinks.classList.contains('active') && !menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                    navLinks.classList.remove('active');
                    menuToggle.setAttribute("aria-expanded", "false");
                }
            });

        } else {
            console.warn("Global: Elementos do menu mobile (.menu-toggle, nav ul.nav-links) não encontrados.");
        }
    }
    inicializarMenuMobile(); // Chama a inicialização do menu

    // --- 2. Lógica do Theme Toggle (Claro/Escuro) ---
    const themeToggleButton = document.getElementById('theme-toggle-button');

    const applyTheme = (theme) => {
        // Usa toggle com o segundo argumento para definir estado
        body.classList.toggle('light-mode', theme === 'light');
        console.log(`Global: Tema aplicado - ${theme}`);
    };

    const toggleTheme = () => {
        const isLightMode = body.classList.contains('light-mode');
        const newTheme = isLightMode ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme); // Salva a preferência
        applyTheme(newTheme);
    };

    // Verifica a preferência salva no localStorage ou a preferência do sistema
    const savedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    let currentTheme = savedTheme || (prefersLight ? 'light' : 'dark'); // Default dark

    console.log(`Global: Tema inicial definido como ${currentTheme}`);
    applyTheme(currentTheme); // Aplica o tema inicial ao carregar a página

    // Adiciona o evento de clique ao botão APENAS SE ele existir na página
    if (themeToggleButton) {
        console.log("Global: Adicionando listener ao botão de tema.");
        themeToggleButton.addEventListener('click', toggleTheme);
    } else {
         console.warn("Global: Botão de tema (#theme-toggle-button) não encontrado.");
    }


    // --- 3. Rolagem Suave para Links de Âncora Internos ---
    console.log("Global: Configurando rolagem suave para links internos.");
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (event) {
            const targetId = this.getAttribute('href');

            // Verifica se é um link de âncora válido (começa com # e tem mais caracteres)
            // Ignora links como href="#" ou href="#/"
            if (targetId.length > 1 && targetId.startsWith('#') && !targetId.includes('/')) {
                try {
                    const targetElement = document.querySelector(targetId); // Usa querySelector para pegar o ID
                    if (targetElement) {
                        event.preventDefault(); // Previne o salto padrão SOMENTE se o alvo existir

                        const headerOffset = document.querySelector('.site-header')?.offsetHeight || 80; // Altura do header fixo ou fallback
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.scrollY - headerOffset;

                        console.log(`Global: Rolando suavemente para ${targetId}`);
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    } else {
                        // Não previne o default se o elemento não for encontrado na página atual
                        console.warn(`Global: Elemento com seletor "${targetId}" não encontrado na página atual para rolagem suave.`);
                    }
                } catch (e) {
                     console.error(`Global: Seletor inválido "${targetId}" para rolagem suave.`, e);
                     // Não previne o default em caso de erro no seletor
                }
            } else {
                console.log(`Global: Link de âncora "${targetId}" ignorado para rolagem suave (formato inválido ou simples '#').`);
                // Não previne o default para links como href="#" para permitir que funcionem se tiverem outra finalidade
            }
        });
    });

    // --- 4. Lógica do Botão "Voltar ao Topo" ---
    const backToTopButton = document.getElementById('home-back-to-top'); // ID genérico usado em todas as páginas

    if (backToTopButton) {
        const scrollThreshold = 1000; // Ponto em pixels para mostrar o botão (ajuste conforme necessário)
        console.log("Global: Configurando botão Voltar ao Topo.");

        // Mostrar/esconder o botão com base no scroll
        window.addEventListener('scroll', () => {
            // Adiciona ou remove a classe 'visible'
            backToTopButton.classList.toggle('visible', window.scrollY > scrollThreshold);
        }, { passive: true }); // Otimização para performance de scroll

        // Rolar para o topo ao clicar no botão
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault(); // Boa prática para botões que disparam JS
            console.log("Global: Botão Voltar ao Topo clicado.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    } else {
        console.warn("Global: Botão Voltar ao Topo (#home-back-to-top) não encontrado nesta página.");
    }
    
    // ==========================================
    // <<< NOVO: Lógica do Header Auto-Hide >>>
    // ==========================================
    const header = document.querySelector('.site-header');
    if (header) {
        let lastScrollTop = 0;
        const delta = 50; // Tolerância mínima geral
        const headerHeight = header.offsetHeight;
        // NOVO: Limiar para mostrar ao rolar para cima (ex: 50 pixels)
        const scrollUpThreshold = 150; 
        // NOVO: Guarda a distância rolada para cima continuamente
        let scrollUpDistance = 0; 

        console.log("Global: Configurando header auto-hide (com limiar p/ cima).");

        window.addEventListener('scroll', function() {
            const currentScrollTop = window.scrollY || document.documentElement.scrollTop;

            // Ignora scrolls muito pequenos ou perto do topo absoluto
            if (Math.abs(lastScrollTop - currentScrollTop) <= delta || currentScrollTop < 0) {
                return; 
            }

            if (currentScrollTop > lastScrollTop) {
                // --- Rolando para BAIXO ---
                // Esconde se já passou da altura do header
                if (currentScrollTop > headerHeight) {
                    header.classList.add('header-hidden');
                    //console.log("Header hidden (Scrolling Down)");
                }
                // Reseta a distância rolada para cima
                scrollUpDistance = 0; 

            } else {
                // --- Rolando para CIMA ---
                // Acumula a distância rolada para cima
                scrollUpDistance += lastScrollTop - currentScrollTop; 

                // Mostra o header APENAS se acumulou distância suficiente OU se está perto do topo
                if (scrollUpDistance > scrollUpThreshold || currentScrollTop <= headerHeight) {
                     header.classList.remove('header-hidden');
                     //console.log("Header shown (Scrolling Up Threshold Met or Near Top)");
                     // Opcional: Resetar scrollUpDistance aqui se quiser exigir o limiar novamente
                     // scrollUpDistance = 0; 
                } else {
                    //console.log(`Scrolling Up Distance: ${scrollUpDistance} (Threshold: ${scrollUpThreshold})`);
                }
            }

            lastScrollTop = currentScrollTop; // Atualiza a última posição

        }, { passive: true });

    } else {
        console.warn("Global: Elemento .site-header não encontrado.");
    }
    // =================================================
    // <<< FIM: Header Auto-Hide (V2) >>>
    // =================================================
    
    // ================================================
    // <<< NOVO: Forçar Estilo em Links Iubenda >>>
    // ================================================
    // Espera um pouco mais para garantir que o script Iubenda possa ter rodado
    // Use window.onload ou um setTimeout. window.onload é mais seguro.
    window.addEventListener('load', () => { 
        console.log("Global: Tentando forçar estilo nos links Iubenda...");
        
        // Seleciona TODOS os links Iubenda DENTRO da seção de recursos do footer
        const iubendaLinks = document.querySelectorAll('.footer-section.resources ul li a.iubenda-embed');
        
        if (iubendaLinks.length > 0) {
            console.log(`Encontrados ${iubendaLinks.length} links Iubenda para estilizar.`);
            iubendaLinks.forEach(link => {
                try {
                    // Aplica os estilos desejados diretamente no elemento, forçando com 'important'
                    link.style.setProperty('font-size', '16px', 'important');
                    link.style.setProperty('font-family', "'Roboto', sans-serif", 'important'); // Note as aspas extras para a fonte
                    link.style.setProperty('color', '#9ca3af', 'important'); // Sua cor padrão
                    link.style.setProperty('font-weight', '400', 'important'); 
                    link.style.setProperty('text-decoration', 'none', 'important');
                    link.style.setProperty('background-color', 'transparent', 'important');
                    link.style.setProperty('background-image', 'none', 'important');
                    link.style.setProperty('border', 'none', 'important');
                    link.style.setProperty('padding', '0', 'important');
                    link.style.setProperty('margin', '0', 'important');
                    link.style.setProperty('display', 'inline', 'important');
                    link.style.setProperty('box-shadow', 'none', 'important');
                    link.style.setProperty('text-shadow', 'none', 'important');
                    link.style.setProperty('vertical-align', 'baseline', 'important');
                    link.style.setProperty('line-height', 'inherit', 'important');
                    link.style.setProperty('white-space', 'normal', 'important');
                    link.style.setProperty('-webkit-appearance', 'none', 'important');
                    link.style.setProperty('-moz-appearance', 'none', 'important');
                    link.style.setProperty('appearance', 'none', 'important');
                    link.style.setProperty('cursor', 'pointer', 'important'); 

                    // Adiciona listener para o hover (opcional, mas garante consistência)
                    link.addEventListener('mouseenter', () => {
                        link.style.setProperty('color', '#ffffff', 'important');
                       // link.style.setProperty('text-decoration', 'underline', 'important'); // Adicione se quiser sublinhado no hover
                    });
                    link.addEventListener('mouseleave', () => {
                        link.style.setProperty('color', '#9ca3af', 'important');
                       // link.style.setProperty('text-decoration', 'none', 'important');
                    });

                    console.log("Estilos forçados para:", link.textContent);

                } catch (err) {
                    console.error("Erro ao aplicar estilo forçado ao link Iubenda:", err, link);
                }
            });
        } else {
            console.log("Nenhum link Iubenda encontrado no footer para estilização forçada.");
        }

         // Esconder o script (se ainda não foi feito pelo CSS) - Redundante talvez
         const iubendaScripts = document.querySelectorAll('.footer-section.resources ul li script');
         iubendaScripts.forEach(script => script.style.display = 'none');

    }); // Fim do window.onload
    // ================================================
    // <<< FIM: Forçar Estilo Iubenda >>>
    // ================================================
    

    console.log("Global scripts: Inicialização concluída.");
}); // Fim do DOMContentLoaded