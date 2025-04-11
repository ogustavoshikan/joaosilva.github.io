function loadTrendsCards() {
  fetch('data/tendencias.json?v=' + Date.now())
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const container = document.querySelector('.trends-cards-container'); // Container na index.html
      if (!container) {
          console.warn("Container .trends-cards-container não encontrado na página atual.");
          return; // Sai se o container não existir
      }
      const fallback = container.querySelector('.loading-fallback');

      if (data && data.trends && data.trends.length > 0) {
        if (fallback) {
          fallback.remove();
        }

        const fragment = document.createDocumentFragment();
        
        // Pega apenas as 9 tendências mais recentes para a home page
        // Assumindo que o JSON já está ordenado por data no futuro, ou ordenamos aqui
        const trendsToShow = data.trends
                                 .sort((a, b) => new Date(b.dateTimeIso || b.date || 0) - new Date(a.dateTimeIso || a.date || 0)) // Ordena por data/hora completa
                                 .slice(0, 9); // Pega as 9 primeiras

        trendsToShow.forEach(card => {
          const article = document.createElement('article');
          article.classList.add('trends-card');
          
          // --- Lógica de Formatação de Data/Hora (similar ao inicio.js) ---
          let dataHoraFormatada = '';
          let dateTimeAttr = '';
          const isoDateTimeString = card.dateTimeIso || card.date; // Usa dateTimeIso ou fallback para date

          if (isoDateTimeString) {
              try {
                  const dateObj = new Date(isoDateTimeString);
                  dateTimeAttr = dateObj.toISOString();

                  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                  const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };

                  if (isoDateTimeString.includes('T')) {
                      dataHoraFormatada = `${dateObj.toLocaleDateString('pt-BR', dateOptions)} - ${dateObj.toLocaleTimeString('en-US', timeOptions).toLowerCase()}`; // AM/PM minúsculo
                  } else {
                      dataHoraFormatada = dateObj.toLocaleDateString('pt-BR', dateOptions);
                  }
              } catch (e) {
                   console.warn(`Erro ao formatar data/hora para tendência "${card.title}": ${isoDateTimeString}`, e);
                   // Fallback para data simples se houver erro
                   try {
                       dateTimeAttr = card.date || '';
                       dataFormatada = card.date ? new Date(card.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
                   } catch { dataHoraFormatada = card.date || ''; }
              }
          }
          // --- Fim da Lógica de Data/Hora ---

          // Imagem não precisa de width/height aqui se o CSS controlar
          const imageWidth = ''; // Removido card.imageWidth
          const imageHeight = '';// Removido card.imageHeight
          
          // HTML do autor (mantido igual)
           const autorHtml = card.authorName
                ? `<div class="card-author-info">
                     <span class="author-prefix">Por: </span>
                     <a href="${card.authorLink || '#'}" class="author-link" ${card.authorLink ? 'target="_blank" rel="noopener noreferrer"' : ''}>${card.authorName}</a>
                   </div>`
                : '';

          article.innerHTML = `
            <div class="card-image">
              <a href="${card.link}" target="_blank" rel="noopener noreferrer" aria-label="Ver artigo completo sobre ${card.title} (abre em nova aba)">
                <img
                  src="${card.image || 'assets/imagens/geral/placeholder.png'}" 
                  alt="${card.alt || 'Imagem ilustrativa para ' + card.title}"
                  loading="lazy">
              </a>
            </div>
            <div class="card-content">
              <!-- Usa a nova data/hora formatada -->
              <time datetime="${dateTimeAttr}" class="card-date">${dataHoraFormatada}</time> 
              <h3 class="card-title">
                <a
                  href="${card.link}"
                  aria-label="Leia mais sobre ${card.title} (abre em nova aba)"
                  title="Leia o artigo completo: ${card.title}"
                  target="_blank"
                  rel="noopener noreferrer">
                    ${card.title || 'Sem Título'}
                </a>
              </h3>
              <p class="card-excerpt">${card.excerpt || ''}</p>
              ${autorHtml} <!-- Insere o HTML do autor -->
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
        } else if (container) { // Verifica se container existe antes de modificar
          container.innerHTML = `<p class="loading-fallback" role="alert">${errorMessage}</p>`;
        }
        console.warn('Nenhum dado de tendência encontrado ou formato inválido no JSON.');
      }
    })
    .catch(error => {
      console.error('Erro ao carregar ou processar os cards de tendências:', error);
      const container = document.querySelector('.trends-cards-container');
      if (container) { // Verifica se container existe
          const fallback = container.querySelector('.loading-fallback');
          const errorMessage = 'Erro ao carregar tendências. Tente novamente mais tarde.';
           if (fallback) {
               fallback.textContent = errorMessage;
               fallback.setAttribute('role', 'alert');
           } else {
               container.innerHTML = `<p class="loading-fallback" role="alert">${errorMessage}</p>`;
           }
      }
    });
}

document.addEventListener('DOMContentLoaded', loadTrendsCards);