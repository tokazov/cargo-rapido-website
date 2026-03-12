/**
 * Cargo Rapido AI Chat Widget
 * Вставить на cargorapido.ru через Megagroup "Вставить HTML-код"
 */
(function() {
  const API_URL = window.CARGO_AI_API || 'https://cargo-rapido-assistant-production.up.railway.app';
  const SESSION_KEY = 'cargo_rapido_session';

  // Generate or restore session ID
  function getSessionId() {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = 'sess_' + Math.random().toString(36).substr(2, 12) + '_' + Date.now();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  // Create widget HTML
  function createWidget() {
    const container = document.createElement('div');
    container.id = 'cargo-ai-widget';
    container.innerHTML = `
      <style>
        #cargo-ai-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 99999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #cargo-ai-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF6B00, #FF8C38);
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(255,107,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }
        #cargo-ai-btn:hover { transform: scale(1.1); }
        #cargo-ai-btn svg { fill: white; width: 28px; height: 28px; }
        #cargo-ai-chat {
          display: none;
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 380px;
          max-height: 520px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.15);
          overflow: hidden;
          flex-direction: column;
        }
        #cargo-ai-chat.open { display: flex; }
        #cargo-ai-header {
          background: linear-gradient(135deg, #FF6B00, #FF8C38);
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        #cargo-ai-header .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        #cargo-ai-header .info h3 { margin: 0; font-size: 15px; }
        #cargo-ai-header .info p { margin: 2px 0 0; font-size: 12px; opacity: 0.8; }
        #cargo-ai-close {
          margin-left: auto;
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
        }
        #cargo-ai-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          max-height: 340px;
          min-height: 200px;
        }
        .cargo-msg {
          margin-bottom: 12px;
          display: flex;
        }
        .cargo-msg.bot { justify-content: flex-start; }
        .cargo-msg.user { justify-content: flex-end; }
        .cargo-msg .bubble {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 14px;
          font-size: 14px;
          line-height: 1.4;
          white-space: pre-wrap;
        }
        .cargo-msg.bot .bubble {
          background: #f1f1f1;
          color: #333;
          border-bottom-left-radius: 4px;
        }
        .cargo-msg.user .bubble {
          background: #FF6B00;
          color: white;
          border-bottom-right-radius: 4px;
        }
        .cargo-msg.bot .bubble.typing {
          color: #999;
          font-style: italic;
        }
        #cargo-ai-input-wrap {
          display: flex;
          border-top: 1px solid #eee;
          padding: 8px 12px;
          gap: 8px;
          align-items: center;
        }
        #cargo-ai-input {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 20px;
          padding: 8px 14px;
          font-size: 14px;
          outline: none;
        }
        #cargo-ai-input:focus { border-color: #FF6B00; }
        #cargo-ai-send {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #FF6B00;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #cargo-ai-send svg { fill: white; width: 18px; height: 18px; }
        @media (max-width: 480px) {
          #cargo-ai-chat {
            width: calc(100vw - 20px);
            right: 10px;
            bottom: 80px;
            max-height: 70vh;
          }
        }
      </style>
      <div id="cargo-ai-chat">
        <div id="cargo-ai-header">
          <div class="avatar">👩</div>
          <div class="info">
            <h3>Наталья</h3>
            <p>Менеджер Cargo Rapido</p>
          </div>
          <button id="cargo-ai-close">✕</button>
        </div>
        <div id="cargo-ai-messages"></div>
        <div id="cargo-ai-input-wrap">
          <input id="cargo-ai-input" type="text" placeholder="Напишите сообщение..." />
          <button id="cargo-ai-send">
            <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
      <button id="cargo-ai-btn">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
      </button>
    `;
    document.body.appendChild(container);

    // Events
    const btn = document.getElementById('cargo-ai-btn');
    const chat = document.getElementById('cargo-ai-chat');
    const closeBtn = document.getElementById('cargo-ai-close');
    const input = document.getElementById('cargo-ai-input');
    const sendBtn = document.getElementById('cargo-ai-send');
    const messages = document.getElementById('cargo-ai-messages');

    let isOpen = false;
    let welcomed = false;

    btn.addEventListener('click', () => {
      isOpen = !isOpen;
      chat.classList.toggle('open', isOpen);
      btn.style.display = isOpen ? 'none' : 'flex';
      if (isOpen && !welcomed) {
        addMessage('bot', 'Здравствуйте! 👋 Я Наталья, менеджер Cargo Rapido. Помогу рассчитать и оформить доставку по России и СНГ. Расскажите, что нужно отправить?');
        welcomed = true;
      }
      if (isOpen) input.focus();
    });

    closeBtn.addEventListener('click', () => {
      isOpen = false;
      chat.classList.remove('open');
      btn.style.display = 'flex';
    });

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    function addMessage(type, text) {
      const div = document.createElement('div');
      div.className = `cargo-msg ${type}`;
      div.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
      return div;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    async function sendMessage() {
      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      addMessage('user', text);

      // Show typing
      const typing = addMessage('bot', 'Печатаю...');
      typing.querySelector('.bubble').classList.add('typing');

      try {
        const resp = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: getSessionId(),
            message: text,
          }),
        });
        const data = await resp.json();
        typing.remove();
        addMessage('bot', data.reply);
      } catch (err) {
        typing.remove();
        addMessage('bot', 'Извините, произошла ошибка. Попробуйте позже или позвоните нам.');
      }
    }
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
