/**
 * BRIEF 2 : AI Rewrite - Injection dans iframe
 * Système complètement indépendant du contenteditable basique (BRIEF 1)
 */

export interface AiRewriteConfig {
  name: string;
  valueProp: string;
  expertises: string[];
}

export function injectAiRewriteSystem(doc: Document, config: AiRewriteConfig) {
  // 1. Injecter le CSS AI Rewrite
  let aiStyle = doc.getElementById('ai-rewrite-style');
  if (!aiStyle) {
    aiStyle = doc.createElement('style');
    aiStyle.id = 'ai-rewrite-style';
    doc.head.appendChild(aiStyle);
  }

  aiStyle.textContent = `
    /* ===== AI REWRITE SYSTEM (BRIEF 2) ===== */
    .ai-rewrite-wrapper {
      position: relative;
    }
    
    .ai-sparkle-btn {
      position: absolute;
      top: 0.25rem;
      right: 0.25rem;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: none;
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.2s ease;
      z-index: 10;
    }
    
    .ai-rewrite-wrapper:hover .ai-sparkle-btn {
      opacity: 1;
    }
    
    .ai-sparkle-btn:hover {
      background: rgba(99, 102, 241, 0.2);
      transform: scale(1.1);
    }
    
    .ai-prompt-popup {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      min-width: 320px;
      max-width: 500px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
      z-index: 100;
      animation: popup-appear 0.2s ease-out;
    }
    
    @keyframes popup-appear {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .ai-prompt-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 0.9rem;
      color: #6366f1;
      margin-bottom: 0.75rem;
    }
    
    .ai-prompt-input {
      width: 100%;
      min-height: 70px;
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.9rem;
      font-family: inherit;
      resize: vertical;
    }
    
    .ai-prompt-input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    
    .ai-prompt-error {
      margin-top: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      color: #dc2626;
      font-size: 0.8rem;
      display: none;
    }
    
    .ai-prompt-hint {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: #9ca3af;
    }
    
    .ai-prompt-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    
    .ai-btn-cancel {
      padding: 0.5rem 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: #ffffff;
      color: #374151;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
    }
    
    .ai-btn-cancel:hover {
      background: #f9fafb;
    }
    
    .ai-btn-regenerate {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #ffffff;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .ai-btn-regenerate:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    
    .ai-btn-regenerate:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .ai-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  // 2. SVG Triple Sparkle Icon
  const SPARKLE_SVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
      <path d="M11 5L12.5 9.5L17 11L12.5 12.5L11 17L9.5 12.5L5 11L9.5 9.5L11 5Z"/>
      <path d="M18 3L18.7 5.3L21 6L18.7 6.7L18 9L17.3 6.7L15 6L17.3 5.3L18 3Z"/>
      <path d="M18 15L18.7 17.3L21 18L18.7 18.7L18 21L17.3 18.7L15 18L17.3 17.3L18 15Z"/>
    </svg>
  `;

  // 3. Script principal
  const scriptContent = `
    (function() {
      const config = ${JSON.stringify(config)};
      const SPARKLE_SVG = \`${SPARKLE_SVG}\`;
      
      // Champs éligibles pour AI Rewrite
      const AI_REWRITE_FIELDS = [
        { selector: '.hero-subtitle, .heroSubtitle', fieldType: 'heroSubtitle' },
        { selector: '.about-text, .aboutText, .bio-text', fieldType: 'aboutText' },
        { selector: '.value-prop, .valueProp', fieldType: 'valueProp' },
        { selector: '.service-description, .service p', fieldType: 'serviceDescription' },
        { selector: '.project-description, .project p:not(.category)', fieldType: 'projectDescription' },
      ];
      
      // Wrapper les champs éligibles
      AI_REWRITE_FIELDS.forEach(({ selector, fieldType }) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
          // Ne pas wrapper si déjà wrappé
          if (el.closest('.ai-rewrite-wrapper')) return;
          
          const wrapper = document.createElement('div');
          wrapper.className = 'ai-rewrite-wrapper';
          wrapper.style.position = 'relative';
          
          const sparkleBtn = document.createElement('button');
          sparkleBtn.className = 'ai-sparkle-btn';
          sparkleBtn.innerHTML = SPARKLE_SVG;
          sparkleBtn.title = 'Modifier avec l\\'IA';
          sparkleBtn.onclick = (e) => {
            e.stopPropagation();
            openAiPrompt(el, fieldType);
          };
          
          el.parentNode.insertBefore(wrapper, el);
          wrapper.appendChild(el);
          wrapper.appendChild(sparkleBtn);
        });
      });
      
      // Popup IA
      let currentPopup = null;
      
      function openAiPrompt(targetElement, fieldType) {
        closeAiPrompt();
        
        const wrapper = targetElement.closest('.ai-rewrite-wrapper');
        if (!wrapper) return;
        
        const popup = document.createElement('div');
        popup.className = 'ai-prompt-popup';
        
        const currentText = targetElement.innerText || targetElement.textContent || '';
        
        popup.innerHTML = \`
          <div class="ai-prompt-header">
            \${SPARKLE_SVG}
            <span>Comment modifier ce texte ?</span>
          </div>
          <textarea 
            class="ai-prompt-input" 
            placeholder="Ex: Rends le plus percutant, ajoute des chiffres, raccourcis..."
            rows="3"
          ></textarea>
          <div class="ai-prompt-hint">Astuce: Ctrl+Enter pour régénérer</div>
          <div class="ai-prompt-error"></div>
          <div class="ai-prompt-actions">
            <button class="ai-btn-cancel">Annuler</button>
            <button class="ai-btn-regenerate">
              \${SPARKLE_SVG}
              Régénérer
            </button>
          </div>
        \`;
        
        wrapper.appendChild(popup);
        currentPopup = popup;
        
        const textarea = popup.querySelector('.ai-prompt-input');
        const errorDiv = popup.querySelector('.ai-prompt-error');
        const cancelBtn = popup.querySelector('.ai-btn-cancel');
        const regenerateBtn = popup.querySelector('.ai-btn-regenerate');
        
        textarea.focus();
        
        cancelBtn.onclick = () => closeAiPrompt();
        
        regenerateBtn.onclick = async () => {
          const instruction = textarea.value.trim();
          if (!instruction) {
            showError(errorDiv, 'Entrez une instruction');
            return;
          }
          
          await callAiRewrite(targetElement, currentText, instruction, fieldType, regenerateBtn, errorDiv);
        };
        
        textarea.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            regenerateBtn.click();
          }
          if (e.key === 'Escape') {
            closeAiPrompt();
          }
        });
        
        document.addEventListener('click', handleClickOutside);
      }
      
      function closeAiPrompt() {
        if (currentPopup) {
          currentPopup.remove();
          currentPopup = null;
          document.removeEventListener('click', handleClickOutside);
        }
      }
      
      function handleClickOutside(e) {
        if (currentPopup && !currentPopup.contains(e.target) && !e.target.closest('.ai-sparkle-btn')) {
          closeAiPrompt();
        }
      }
      
      function showError(errorDiv, message) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
          errorDiv.style.display = 'none';
        }, 5000);
      }
      
      async function callAiRewrite(targetElement, currentText, instruction, fieldType, btn, errorDiv) {
        const originalBtnHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="ai-spinner"></span> Génération...';
        errorDiv.style.display = 'none';
        
        try {
          // Appel au parent React via postMessage
          window.parent.postMessage({
            type: 'AI_REWRITE_REQUEST',
            payload: {
              currentText,
              instruction,
              fieldType,
              context: config,
            },
          }, '*');
          
          // Écouter la réponse
          const response = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Timeout')), 30000);
            
            const handler = (event) => {
              if (event.data.type === 'AI_REWRITE_RESPONSE') {
                clearTimeout(timeout);
                window.removeEventListener('message', handler);
                resolve(event.data.payload);
              }
            };
            
            window.addEventListener('message', handler);
          });
          
          if (response.error) {
            throw new Error(response.error);
          }
          
          // Mettre à jour le texte
          targetElement.innerText = response.newText;
          closeAiPrompt();
          
        } catch (error) {
          console.error('[AiRewrite] Error:', error);
          showError(errorDiv, error.message || 'Erreur lors de la régénération');
        } finally {
          btn.disabled = false;
          btn.innerHTML = originalBtnHTML;
        }
      }
      
      window.closeAiPrompt = closeAiPrompt;
    })();
  `;

  // Injecter le script
  let script = doc.getElementById('ai-rewrite-script');
  if (!script) {
    script = doc.createElement('script');
    script.id = 'ai-rewrite-script';
    doc.body.appendChild(script);
  }
  script.textContent = scriptContent;
}
