// --- Função para Calcular Tempo Relativo (PRECISA ESTAR AQUI TAMBÉM) ---
function formatRelativeTime(isoDateTimeString) {
    if (!isoDateTimeString) return ''; 
    try {
        const publicationDate = new Date(isoDateTimeString);
        if (isNaN(publicationDate.getTime())) throw new Error('Data inválida'); 
        const now = new Date();
        const diffInSeconds = Math.floor((now - publicationDate) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        const thresholdDays = 7; 

        if (diffInSeconds < 60) return "Agora mesmo";
        if (diffInMinutes < 60) return `${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''} atrás`;
        if (diffInHours < 24) return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;
        if (diffInDays <= thresholdDays) return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
        
        // Fallback para data DD Mês AAAA se for mais antigo
        const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
        let formattedDate = publicationDate.toLocaleDateString('pt-BR', dateOptions).replace('.', '');
        formattedDate = formattedDate.replace(/ de /g, ' ');
        formattedDate = formattedDate.replace(/ (\w)/, (match, p1) => ` ${p1.toUpperCase()}`);
        return formattedDate;
    } catch (error) {
        console.warn(`Erro ao formatar tempo relativo para ${isoDateTimeString}:`, error);
        try {
           const fallbackDate = new Date(isoDateTimeString.split('T')[0] + 'T00:00:00');
           if(!isNaN(fallbackDate.getTime())){
                const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
                let formattedDate = fallbackDate.toLocaleDateString('pt-BR', dateOptions).replace('.', '');
                formattedDate = formattedDate.replace(/ de /g, ' ');
                formattedDate = formattedDate.replace(/ (\w)/, (match, p1) => ` ${p1.toUpperCase()}`);
                return formattedDate;
           }
        } catch {}
        return isoDateTimeString || ''; 
    }
}


function loadTrendsCards() {
  fetch('data/tendencias.json?v=' + Date.now()) 
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      const container = document.querySelector('.trends-cards-container'); 
      if (!container) {
          console.warn("Container .trends-cards-container não encontrado na página inicial.");
          return; 
      }
      const fallback = container.querySelector('.loading-fallback');

      if (data && data.trends && data.trends.length > 0) {
        if (fallback) fallback.remove();
        const fragment = document.createDocumentFragment();
        
        // Ordena e pega as 9 mais recentes
        const trendsToShow = data.trends
                                 .sort((a, b) => new Date(b.dateTimeIso || b.date || 0) - new Date(a.dateTimeIso || a.date || 0)) 
                                 .slice(0, 9); 

        trendsToShow.forEach(card => {
          const article = document.createElement('article');
          article.classList.add('trends-card');
          
          // --- USA A FUNÇÃO DE TEMPO RELATIVO ---
          const relativeTime = formatRelativeTime(card.dateTimeIso || card.date); // <<< CORREÇÃO AQUI
          const dateTimeAttr = card.dateTimeIso || card.date || ''; 
          // --- FIM DA CORREÇÃO ---

          const autorHtml = card.authorName
                ? `<div class="card-author-info">
                     <span class="author-prefix">Por: </span>
                     <a href="${card.authorLink || '#'}" class="author-link" ${card.authorLink ? 'target="_blank" rel="noopener noreferrer"' : ''}>${card.authorName}</a>
                   </div>`
                : '';
                
                // <<< CRIA O LINK INTERNO PARA A PÁGINA DE DETALHE >>>
          const linkDetalheTendencia = `/tendencia.html?slug=${card.slug || ''}`; 

          article.innerHTML = `
            <div class="card-image">
              <!-- <<< USA O linkDetalheTendencia >>> -->
              <a href="${linkDetalheTendencia}" aria-label="Ver detalhes sobre ${card.title || 'Tendência'}">
                <img src="${card.image || 'assets/imagens/geral/placeholder.png'}" alt="${card.alt || 'Imagem ilustrativa para ' + card.title}" loading="lazy">
              </a>
            </div>
            <div class="card-content">
              <time datetime="${dateTimeAttr}" class="card-date">${relativeTime}</time>  
              <h3 class="card-title">
                 <!-- <<< USA O linkDetalheTendencia >>> -->
                <a href="${linkDetalheTendencia}" title="${card.title || ''}">
                    ${card.title || 'Sem Título'}
                </a>
              </h3>
              <p class="card-excerpt">${card.excerpt || ''}</p>
              ${autorHtml}
            </div>
          `;
          fragment.appendChild(article);
        });
        
        container.innerHTML = ''; // Limpa antes
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