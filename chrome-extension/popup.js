// Configuration
const API_URL = 'http://localhost:8000'; // À changer pour l'URL de production
let comments = [];
let predictions = [];

// DOM elements
const elements = {
  status: document.getElementById('status'),
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  statsSection: document.getElementById('statsSection'),
  controlsSection: document.getElementById('controlsSection'),
  commentsSection: document.getElementById('commentsSection'),
  commentsList: document.getElementById('commentsList'),
  positiveCount: document.getElementById('positiveCount'),
  neutralCount: document.getElementById('neutralCount'),
  negativeCount: document.getElementById('negativeCount'),
  totalCount: document.getElementById('totalCount'),
  analyzeBtn: document.getElementById('analyzeBtn'),
  exportBtn: document.getElementById('exportBtn'),
  themeToggle: document.getElementById('themeToggle')
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupEventListeners();
  extractComments();
});

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    elements.themeToggle.textContent = '☀️';
  }
}

function setupEventListeners() {
  // Theme toggle
  elements.themeToggle.addEventListener('click', toggleTheme);
  
  // Analyze button
  elements.analyzeBtn.addEventListener('click', analyzeComments);
  
  // Export button
  elements.exportBtn.addEventListener('click', exportResults);
  
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      filterComments(e.target.dataset.filter);
    });
  });
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  elements.themeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function extractComments() {
  // Demande au content script d'extraire les commentaires
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'getComments'}, (response) => {
      if (chrome.runtime.lastError) {
        showError('Impossible d\'extraire les commentaires. Rechargez la page.');
        return;
      }
      
      if (response && response.comments) {
        comments = response.comments;
        updateUI();
      } else {
        showError('Aucun commentaire trouvé sur cette page.');
      }
    });
  });
}

function updateUI() {
  if (comments.length === 0) {
    showError('Aucun commentaire à analyser.');
    return;
  }
  
  elements.status.classList.add('hidden');
  elements.statsSection.classList.remove('hidden');
  elements.controlsSection.classList.remove('hidden');
  elements.commentsSection.classList.remove('hidden');
  
  elements.totalCount.textContent = comments.length;
}

async function analyzeComments() {
  if (comments.length === 0) return;
  
  elements.loading.classList.remove('hidden');
  elements.error.classList.add('hidden');
  
  try {
    // Envoie les commentaires à l'API
    const response = await fetch(`${API_URL}/predict/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: comments.map(c => c.text)
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    predictions = result.predictions;
    
    displayResults();
    updateStats();
    
  } catch (error) {
    showError(`Erreur API : ${error.message}. Vérifiez que l'API est démarrée.`);
  } finally {
    elements.loading.classList.add('hidden');
  }
}

function displayResults() {
  elements.commentsList.innerHTML = '';
  
  predictions.forEach((pred, index) => {
    const comment = comments[index];
    const sentimentClass = pred.sentiment === 1 ? 'positive' : 
                           pred.sentiment === 0 ? 'neutral' : 'negative';
    const sentimentEmoji = pred.sentiment === 1 ? '😊' : 
                           pred.sentiment === 0 ? '😐' : '😞';
    
    const commentItem = document.createElement('div');
    commentItem.className = `comment-item ${sentimentClass}`;
    commentItem.innerHTML = `
      <div class="comment-text">${comment.text}</div>
      <div class="comment-meta">
        <span>${sentimentEmoji} ${(pred.confidence * 100).toFixed(1)}%</span>
        <span>${comment.author}</span>
      </div>
    `;
    
    elements.commentsList.appendChild(commentItem);
  });
}

function updateStats() {
  const counts = { '-1': 0, '0': 0, '1': 0 };
  
  predictions.forEach(pred => {
    counts[pred.sentiment.toString()]++;
  });
  
  elements.positiveCount.textContent = counts['1'];
  elements.neutralCount.textContent = counts['0'];
  elements.negativeCount.textContent = counts['-1'];
  
  // Simple bar chart with canvas
  drawChart(counts);
}

function drawChart(counts) {
  const canvas = document.getElementById('chart');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Data
  const data = [counts['1'], counts['0'], counts['-1']];
  const max = Math.max(...data, 1);
  const barWidth = 60;
  const spacing = 20;
  const colors = ['#34a853', '#fbbc04', '#ea4335'];
  
  // Draw bars
  data.forEach((value, index) => {
    const barHeight = (value / max) * (height - 40);
    const x = index * (barWidth + spacing) + 30;
    const y = height - barHeight - 20;
    
    ctx.fillStyle = colors[index];
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Labels
    ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#e8eaed' : '#202124';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(value.toString(), x + barWidth/2, y - 5);
  });
}

function filterComments(filter) {
  const items = document.querySelectorAll('.comment-item');
  
  items.forEach(item => {
    if (filter === 'all') {
      item.style.display = 'block';
    } else {
      const hasClass = item.classList.contains(
        filter === '1' ? 'positive' : 
        filter === '0' ? 'neutral' : 'negative'
      );
      item.style.display = hasClass ? 'block' : 'none';
    }
  });
}

function exportResults() {
  if (predictions.length === 0) return;
  
  const csvContent = "data:text/csv;charset=utf-8," +
    "Texte,Auteur,Sentiment,Confiance\n" +
    predictions.map((pred, index) => {
      const comment = comments[index];
      const sentiment = pred.sentiment === 1 ? 'Positif' : 
                        pred.sentiment === 0 ? 'Neutre' : 'Négatif';
      return `"${comment.text.replace(/"/g, '""')}","${comment.author}","${sentiment}","${pred.confidence}"`;
    }).join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "youtube_comments_sentiment.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function showError(message) {
  elements.error.textContent = message;
  elements.error.classList.remove('hidden');
  elements.status.classList.add('hidden');
  elements.loading.classList.add('hidden');
}
