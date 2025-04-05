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
    
    // === 6. Rolagem Suave para Todos os Links Internos ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (event) {
      event.preventDefault(); // Impede o comportamento padrão do link
      const targetId = this.getAttribute('href').substring(1); // Obtém o ID do alvo (ex.: "news" ou "art")
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY; // Calcula a posição do elemento
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        console.log(`Rolagem suave para a seção: ${targetId}, posição: ${targetPosition}`);
      } else {
        console.warn(`Elemento com ID "${targetId}" não encontrado.`);
      }
    });
  });

  // === 7. Botão Voltar ao Topo (Página Inicial) ===
const homeBackToTopButton = document.getElementById('home-back-to-top');

if (homeBackToTopButton) {
  // Mostrar/esconder o botão com base no scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 1500) { // Mostra o botão após rolar 1500px
      homeBackToTopButton.classList.add('visible');
    } else {
      homeBackToTopButton.classList.remove('visible');
    }
  });

  // Rolar para o topo ao clicar no botão
  homeBackToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
} else {
  console.error('Botão #home-back-to-top não encontrado!');
}
});