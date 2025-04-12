function loadTrendsCards() {
  fetch('data/tendencias.json?v=' + Date.now()) 
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      const container = document.querySelector('.trends-cards-container'); 
      if (!container) return; // Sai se não achar o container
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
          
          // --- Lógica de Formatação de Data/Hora (Formato: DD Fev AAAA às HHhMM) ---
          let dataHoraFormatada = '';
          let dateTimeAttr = ''; 
          // Tenta construir a partir dos campos simples (assumindo que você adicionou dataPublicacao e horaPublicacao a tendencias.json)
          if (card.dataPublicacao && card.horaPublicacao) { 
              const parts = card.dataPublicacao.split('/');
              if (parts.length === 3) {
                  const isoDateOnly = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                   const isoDateTimeString = `${isoDateOnly}T${card.horaPublicacao}:00`; 
                   try {
                      const dateObj = new Date(isoDateTimeString); 
                      if (!isNaN(dateObj.getTime())) { 
                           dateTimeAttr = dateObj.toISOString(); 
                           const dateOptions = { day: '2-digit', month: 'short', year: 'numeric' };
                           const timeOptions = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }; 
                           let formattedDate = dateObj.toLocaleDateString('pt-BR', dateOptions).replace('.', ''); 
                           formattedDate = formattedDate.replace(/ de /g, ' '); 
                           formattedDate = formattedDate.replace(/ (\w)/, (match, p1) => ` ${p1.toUpperCase()}`); 
                           const formattedTime = dateObj.toLocaleTimeString('pt-BR', timeOptions).replace(':', 'h'); 
                           dataHoraFormatada = `${formattedDate} às ${formattedTime}`; // Formato final
                      } else { throw new Error('Data inválida criada'); }
                   } catch (e) {
                       console.warn(`Erro ao formatar data/hora (tendência ${card.title}):`, e);
                       dataHoraFormatada = card.dataPublicacao || ''; 
                       dateTimeAttr = card.date || ''; // Fallback para campo 'date' antigo se existir
                   }
              } else { 
                   dataHoraFormatada = card.dataPublicacao || '';
                   dateTimeAttr = card.date || '';
               }
          } else if (card.date) { // Fallback se só tiver o campo 'date' antigo
               try {
                    const dateObjFallback = new Date(card.date + 'T00:00:00');
                    let formattedDate = dateObjFallback.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.','');
                    formattedDate = formattedDate.replace(/ de /g, ' ');
                    formattedDate = formattedDate.replace(/ (\w)/, (match, p1) => ` ${p1.toUpperCase()}`);
                    dataHoraFormatada = formattedDate;
                    dateTimeAttr = card.date;
               } catch { dataHoraFormatada = card.date || ''; dateTimeAttr = '';}
          }
          // --- Fim Formatação Data/Hora ---

          const autorHtml = card.authorName
                ? `<div class="card-author-info">
                     <span class="author-prefix">Por: </span>
                     <a href="${card.authorLink || '#'}" class="author-link" ${card.authorLink ? 'target="_blank" rel="noopener noreferrer"' : ''}>${card.authorName}</a>
                   </div>`
                : '';

          article.innerHTML = `
            <div class="card-image">
              <a href="${card.link}" target="_blank" rel="noopener noreferrer" aria-label="Ver artigo completo sobre ${card.title || 'Tendência'}">
                <img src="${card.image || 'assets/imagens/geral/placeholder.png'}" alt="${card.alt || 'Imagem ilustrativa para ' + card.title}" loading="lazy">
              </a>
            </div>
            <div class="card-content">
              <time datetime="${dateTimeAttr}" class="card-date">${dataHoraFormatada}</time> 
              <h3 class="card-title">
                <a href="${card.link}" target="_blank" rel="noopener noreferrer" title="${card.title || ''}">
                    ${card.title || 'Sem Título'}
                </a>
              </h3>
              <p class="card-excerpt">${card.excerpt || ''}</p>
              ${autorHtml}
            </div>
          `;
          fragment.appendChild(article);
        });

        container.innerHTML = ''; // Limpa antes de adicionar
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