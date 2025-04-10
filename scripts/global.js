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

    console.log("Global scripts: Inicialização concluída.");
}); // Fim do DOMContentLoaded