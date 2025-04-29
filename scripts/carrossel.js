// Função para carregar e exibir as imagens do carrossel
async function loadArtCarousel() {
  try {
    // Carrega o JSON
    const response = await fetch('data/art-carousel.json', {
      cache: 'no-store', // Evita cache para garantir que o JSON mais recente seja carregado
    });
    if (!response.ok) {
      throw new Error('Erro ao carregar o arquivo JSON');
    }
    const data = await response.json();
    const artworks = data.artworks;

    // Seleciona o contêiner do carrossel
    const swiperWrapper = document.querySelector('.art-section .swiper-wrapper');

    // Verifica se há dados para exibir
    if (artworks && artworks.length > 0) {
      // Itera sobre os dados e cria os slides
      artworks.forEach(artwork => {
        const slide = document.createElement('div');
        slide.classList.add('swiper-slide');
        slide.setAttribute('role', 'listitem'); // Adiciona role para acessibilidade

        const img = document.createElement('img');
        img.src = artwork.src;
        img.alt = artwork.alt;
        img.setAttribute('loading', 'lazy'); // Mantém o lazy loading
        img.setAttribute('decoding', 'async'); // Decodificação assíncrona para melhor desempenho
        img.setAttribute('fetchpriority', 'low'); // Prioridade baixa para imagens fora da viewport

        slide.appendChild(img);
        swiperWrapper.appendChild(slide);
      });

      // Inicializa o Swiper após adicionar os slides
      const swiper = new Swiper('.art-section .swiper', {
        slidesPerView: 6, // Mostra 5 slides por vez
        spaceBetween: 10, // Espaço entre os slides
        loop: true, // Carrossel em loop
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        keyboard: {
          enabled: true, // Habilita navegação por teclado
          onlyInViewport: true, // Apenas quando o carrossel está visível
        },
        a11y: {
          enabled: true, // Habilita recursos de acessibilidade do Swiper
          prevSlideMessage: 'Slide anterior',
          nextSlideMessage: 'Próximo slide',
          paginationBulletMessage: 'Ir para o slide {{index}}',
        },
        breakpoints: {
          1361: {
            slidesPerView: 5,
            spaceBetween: 10,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 10,
          },
          480: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          0: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
        },
      });

      // Adiciona evento de teclado para os botões de navegação
      const prevButton = document.querySelector('.swiper-button-prev');
      const nextButton = document.querySelector('.swiper-button-next');
      prevButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          swiper.slidePrev();
        }
      });
      nextButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          swiper.slideNext();
        }
      });
    } else {
      console.error('Nenhum dado encontrado no JSON');
    }
  } catch (error) {
    console.error('Erro ao carregar o carrossel:', error);
  }
}

// Executa a função quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', loadArtCarousel);