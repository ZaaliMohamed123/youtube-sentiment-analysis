// Configuration des sélecteurs YouTube (mis à jour pour 2025)
const YOUTUBE_SELECTORS = {
    // Nouveau conteneur principal des commentaires
    commentContainer: 'ytd-comment-view-model',
    // Le texte du commentaire
    textElement: '#content-text',
    // L'auteur
    authorElement: '#author-text span',
    // Section des commentaires (pour vérifier qu'on est sur la bonne page)
    commentsSection: 'ytd-comments#comments'
  };
  
  // Fonction pour extraire les commentaires
  function extractComments() {
    const comments = [];
    
    // Vérifier qu'on est bien sur une page avec commentaires
    const commentsSection = document.querySelector(YOUTUBE_SELECTORS.commentsSection);
    if (!commentsSection) {
      console.log('[SentimentAnalyzer] Section commentaires non trouvée');
      return comments;
    }
    
    // Extraire tous les commentaires visibles
    const commentElements = document.querySelectorAll(YOUTUBE_SELECTORS.commentContainer);
    console.log(`[SentimentAnalyzer] ${commentElements.length} éléments trouvés avec ${YOUTUBE_SELECTORS.commentContainer}`);
    
    commentElements.forEach((container, index) => {
      try {
        const textElement = container.querySelector(YOUTUBE_SELECTORS.textElement);
        const authorElement = container.querySelector(YOUTUBE_SELECTORS.authorElement);
        
        const text = textElement?.textContent?.trim();
        const author = authorElement?.textContent?.trim() || 'Anonymous';
        
        if (text && text.length > 0) {
          comments.push({
            id: `comment-${index}-${Date.now()}`,
            text: text,
            author: author
          });
        }
      } catch (error) {
        console.warn(`[SentimentAnalyzer] Erreur extraction commentaire ${index}:`, error);
      }
    });
    
    return comments;
  }
  
  // ** LISTENER POUR RÉPONDRE AU POPUP **
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[SentimentAnalyzer] Message reçu:', request.action);
    
    if (request.action === 'getComments') {
      // Utiliser setTimeout pour garantir que le DOM est prêt
      setTimeout(() => {
        const comments = extractComments();
        console.log(`[SentimentAnalyzer] Extraction terminée: ${comments.length} commentaires`);
        
        // Réponse au popup
        sendResponse({
          success: true,
          comments: comments,
          videoUrl: window.location.href,
          videoTitle: document.title
        });
      }, 1500); // Délai augmenté pour charger les commentaires
      
      // ** IMPORTANT ** Retourner true pour réponse asynchrone
      return true;
    }
  });
  
  // Extraction automatique au chargement
  window.addEventListener('load', () => {
    console.log('[SentimentAnalyzer] Page chargée, attente des commentaires...');
    setTimeout(() => {
      const comments = extractComments();
      console.log(`[SentimentAnalyzer] Auto-extraction: ${comments.length} commentaires`);
      
      // Envoie aussi au runtime pour le cas où le popup est déjà ouvert
      if (comments.length > 0) {
        chrome.runtime.sendMessage({
          action: 'commentsExtracted',
          comments: comments,
          videoUrl: window.location.href,
          videoTitle: document.title
        });
      }
    }, 3000);
  });
  
  // Observer pour les commentaires chargés dynamiquement
  const observer = new MutationObserver((mutations) => {
    const hasNewComments = mutations.some(mutation => 
      Array.from(mutation.addedNodes).some(node => 
        node.nodeType === 1 && node.matches?.(YOUTUBE_SELECTORS.commentContainer)
      )
    );
    
    if (hasNewComments) {
      console.log('[SentimentAnalyzer] Nouveaux commentaires détectés');
    }
  });
  
  // Observer uniquement la section commentaires (plus performant)
  const commentsSection = document.querySelector(YOUTUBE_SELECTORS.commentsSection);
  if (commentsSection) {
    observer.observe(commentsSection, {
      childList: true,
      subtree: true
    });
  }
  
  console.log('[SentimentAnalyzer] Content script chargé et prêt');
  