// Minimal AI assistant client for `/ai-assistant`
(function () {
  const form = document.getElementById('chatForm');
  const input = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const chat = document.getElementById('chatMessages');

  if (!form || !input || !sendBtn || !chat) return;

  function setSendEnabled() {
    sendBtn.disabled = !input.value || !input.value.trim();
  }

  function addMessage(role, text) {
    const wrapper = document.createElement('div');
    wrapper.className = `message ${role === 'user' ? 'user-message' : 'ai-message'}`;
    wrapper.innerHTML = `
      <div class="message-avatar"><i class="fas ${role === 'user' ? 'fa-user' : 'fa-robot'}"></i></div>
      <div class="message-content">
        <div class="message-text"></div>
        <div class="message-actions"><span class="message-time">${new Date().toLocaleTimeString()}</span></div>
      </div>
    `;
    wrapper.querySelector('.message-text').textContent = text;
    chat.appendChild(wrapper);
    chat.scrollTop = chat.scrollHeight;
  }

  async function askAI(message) {
    const res = await fetch('/api/ai/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'AI request failed');
    return data.response?.response || data.response || data;
  }

  input.addEventListener('input', setSendEnabled);
  setSendEnabled();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    setSendEnabled();
    addMessage('user', message);

    try {
      const reply = await askAI(message);
      addMessage('ai', typeof reply === 'string' ? reply : JSON.stringify(reply));
    } catch (err) {
      addMessage('ai', 'Sorry — I could not process that right now.');
      console.error(err);
    }
  });

  // Quick question buttons
  document.querySelectorAll('.quick-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-question');
      const preset = {
        registration: 'How do I register as a refugee in Uganda?',
        healthcare: 'Where can I find healthcare services?',
        education: 'What education opportunities are available?',
        legal: 'Where can I get legal assistance?',
        employment: 'How can I find job opportunities?',
        emergency: 'What are the emergency contacts?',
      }[q];
      if (preset) {
        input.value = preset;
        setSendEnabled();
        input.focus();
      }
    });
  });
})();

