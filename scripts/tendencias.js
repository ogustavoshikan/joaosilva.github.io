function loadTrendsCards() {
  fetch('data/tendencias.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const container = document.querySelector('.trends-cards-container');
      const fallback = container.querySelector('.loading-fallback');

      if (data && data.trends && data.trends.length > 0) {
        if (fallback) {
          fallback.remove();
        }

        const fragment = document.createDocumentFragment();

        data.trends.forEach(card => {
          const article = document.createElement('article');
          article.classList.add('trends-card');

          const imageWidth = card.imageWidth ? `width="${card.imageWidth}"` : '';
          const imageHeight = card.imageHeight ? `height="${card.imageHeight}"` : '';
          const formattedDate = new Date(card.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
          const dateTimeAttr = card.isoDate || card.date;

          article.innerHTML = `
            <div class="card-image">
              <a href="${card.link}" target="_blank" rel="noopener noreferrer" aria-label="Ver artigo completo sobre ${card.title} (abre em nova aba)">
                <img
                  src="${card.image}"
                  alt="${card.alt || 'Imagem ilustrativa para ' + card.title}"
                  loading="lazy"
                  ${imageWidth}
                  ${imageHeight}>
              </a>
            </div>
            <div class="card-content">
              <time datetime="${dateTimeAttr}" class="card-date">${formattedDate}</time>
              <h3 class="card-title">
                <a
                  href="${card.link}"
                  aria-label="Leia mais sobre ${card.title} (abre em nova aba)"
                  title="Leia o artigo completo: ${card.title}"
                  target="_blank"
                  rel="noopener noreferrer">
                    ${card.title}
                </a>
              </h3>
              <p class="card-excerpt">${card.excerpt}</p>
              <div class="card-author-info">
                <span class="author-prefix">Por: </span>
                <a
                  href="${card.authorLink || '#'}"
                  class="author-link"
                  ${card.authorLink ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                    ${card.authorName}
                 </a>
              </div>
            </div>
          `;
          fragment.appendChild(article);
        });

        container.appendChild(fragment);

      } else {
        const errorMessage = 'Nenhuma tendência encontrada no momento.';
        if (fallback) {
          fallback.textContent = errorMessage;
          fallback.setAttribute('role', 'alert');
        } else {
          container.innerHTML = `<p class="loading-fallback" role="alert">${errorMessage}</p>`;
        }
        console.warn('Nenhum dado de tendência encontrado ou formato inválido no JSON.');
      }
    })
    .catch(error => {
      console.error('Erro ao carregar ou processar os cards de tendências:', error);
      const container = document.querySelector('.trends-cards-container');
      const fallback = container.querySelector('.loading-fallback');
      const errorMessage = 'Erro ao carregar tendências. Tente novamente mais tarde.';
       if (fallback) {
           fallback.textContent = errorMessage;
           fallback.setAttribute('role', 'alert');
       } else {
           container.innerHTML = `<p class="loading-fallback" role="alert">${errorMessage}</p>`;
       }
    });
}

document.addEventListener('DOMContentLoaded', loadTrendsCards);