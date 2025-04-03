// Conteúdo de global.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const body = document.body;

    // Função para aplicar o tema (adiciona ou remove a classe 'light-mode')
    const applyTheme = (theme) => {
        if (theme === 'light') {
            body.classList.add('light-mode');
        } else {
            body.classList.remove('light-mode');
        }
    };

    // Função para alternar o tema
    const toggleTheme = () => {
        const isLightMode = body.classList.contains('light-mode');
        const newTheme = isLightMode ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme); // Salva a preferência
        applyTheme(newTheme);
    };

    // Verifica a preferência salva no localStorage ou a preferência do sistema
    const savedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    let currentTheme;
    if (savedTheme) {
        currentTheme = savedTheme;
    } else {
        // O padrão será 'dark' se o sistema não preferir 'light'
        currentTheme = prefersLight ? 'light' : 'dark';
    }

    // Aplica o tema inicial ao carregar a página
    applyTheme(currentTheme);

    // Adiciona o evento de clique ao botão APENAS SE ele existir na página
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }

    // Você pode adicionar aqui outras funções globais se precisar
});