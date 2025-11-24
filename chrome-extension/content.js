// Fonction pour extraire les commentaires visibles
function extractComments() {
    const comments = [];
    
    // Sélecteurs YouTube (peuvent changer, à maintenir à jour)
    const commentElements = document.querySelectorAll('#comments #content-text');
    
    commentElements.forEach((element, index) => {
      const text = element.textContent?.trim();
      if (text && text.length > 0) {
        comments.push({
          id: `comment-${index}`,
          text: text,
          author: element.closest('ytd-comment-renderer')?.querySelector('#author-text span')?.textContent?.trim() || 'Anonymous'
        });
      }
    });
    
    return comments;
  }
  
  // Fonction pour envoyer les commentaires au popup
  function sendCommentsToPopup() {
    const comments = extractComments();
    console.log(`[SentimentAnalyzer] ${comments.length} commentaires extraits`);
    
    // Envoie au popup
    chrome.runtime.sendMessage({
      action: 'commentsExtracted',
      comments: comments,
      videoUrl: window.location.href,
      videoTitle: document.title
    });
  }
  
  // Attendre que la page soit chargée
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(sendCommentsToPopup, 2000); // Délai pour charger les commentaires
    });
  } else {
    setTimeout(sendCommentsToPopup, 2000);
  }
  
  // Observer les changements (pour les commentaires chargés dynamiquement)
  const observer = new MutationObserver(() => {
    // Vérifier si de nouveaux commentaires sont apparus
    const currentComments = extractComments();
    if (currentComments.length > 0) {
      // Optionnel : notifier le popup qu'il y a de nouveaux commentaires
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  