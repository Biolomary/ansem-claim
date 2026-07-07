// utils/loading.ts

type LoaderType = 'spinner' | 'dots' | 'pulse' | 'bar';


// Generate unique ID
const generateId = () => `loader_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Create loader container
const createLoaderContainer = (): HTMLDivElement => {
  let container = document.getElementById('global-loader-container') as HTMLDivElement;
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'global-loader-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 99999;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }
  
  return container;
};

// Create backdrop
const createBackdrop = (): HTMLDivElement => {
  const backdrop = document.createElement('div');
  backdrop.className = 'loader-backdrop';
  backdrop.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
  `;
  return backdrop;
};

// Create spinner loader
const createSpinner = (message?: string): HTMLDivElement => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  `;
  
  // Spinner
  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  `;
  
  // Message
  if (message) {
    const text = document.createElement('p');
    text.textContent = message;
    text.style.cssText = `
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      margin: 0;
      text-shadow: 0 1px 3px rgba(0,0,0,0.3);
    `;
    wrapper.appendChild(spinner);
    wrapper.appendChild(text);
  } else {
    wrapper.appendChild(spinner);
  }
  
  return wrapper;
};

// Create dots loader
const createDots = (message?: string): HTMLDivElement => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  `;
  
  // Dots container
  const dotsContainer = document.createElement('div');
  dotsContainer.style.cssText = `
    display: flex;
    gap: 8px;
  `;
  
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      width: 12px;
      height: 12px;
      background: #fff;
      border-radius: 50%;
      animation: bounce 0.6s ${i * 0.15}s infinite alternate;
    `;
    dotsContainer.appendChild(dot);
  }
  
  wrapper.appendChild(dotsContainer);
  
  if (message) {
    const text = document.createElement('p');
    text.textContent = message;
    text.style.cssText = `
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      margin: 0;
    `;
    wrapper.appendChild(text);
  }
  
  return wrapper;
};

// Create pulse loader
const createPulse = (message?: string): HTMLDivElement => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  `;
  
  const pulser = document.createElement('div');
  pulser.style.cssText = `
    width: 48px;
    height: 48px;
    background: #3b82f6;
    border-radius: 50%;
    animation: pulse 1.5s ease-in-out infinite;
  `;
  
  wrapper.appendChild(pulser);
  
  if (message) {
    const text = document.createElement('p');
    text.textContent = message;
    text.style.cssText = `
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      margin: 0;
    `;
    wrapper.appendChild(text);
  }
  
  return wrapper;
};

// Create progress bar loader
const createProgressBar = (message?: string): { element: HTMLDivElement; updateProgress: (progress: number) => void } => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    background: #fff;
    border-radius: 12px;
    padding: 32px;
    width: 380px;
    max-width: 90vw;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    display: flex;
    flex-direction: column;
    gap: 20px;
  `;
  
  if (message) {
    const text = document.createElement('p');
    text.textContent = message;
    text.style.cssText = `
      color: #1e293b;
      font-size: 14px;
      font-weight: 600;
      margin: 0;
      text-align: center;
    `;
    wrapper.appendChild(text);
  }
  
  // Progress container
  const progressContainer = document.createElement('div');
  progressContainer.style.cssText = `
    width: 100%;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
  `;
  
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #2563eb);
    border-radius: 4px;
    transition: width 0.3s ease;
    width: 0%;
  `;
  
  const percentageText = document.createElement('p');
  percentageText.textContent = '0%';
  percentageText.style.cssText = `
    color: #64748b;
    font-size: 12px;
    margin: 0;
    text-align: center;
  `;
  
  progressContainer.appendChild(progressBar);
  wrapper.appendChild(progressContainer);
  wrapper.appendChild(percentageText);
  
  const updateProgress = (progress: number) => {
    const clampedProgress = Math.min(100, Math.max(0, progress));
    progressBar.style.width = `${clampedProgress}%`;
    percentageText.textContent = `${Math.round(clampedProgress)}%`;
  };
  
  return { element: wrapper, updateProgress };
};

// Inject CSS animations
const injectStyles = () => {
  if (document.getElementById('loader-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'loader-styles';
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @keyframes bounce {
      to { transform: translateY(-12px); opacity: 0.5; }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.7; }
    }
  `;
  document.head.appendChild(style);
};

// Initialize styles
injectStyles();

// Active loaders store
const activeLoaders = new Map<string, { 
  element: HTMLDivElement; 
  updateProgress?: (progress: number) => void 
}>();

/**
 * Start loading with a message
 * @param message - Optional message to display
 * @param type - Type of loader ('spinner' | 'dots' | 'pulse' | 'bar')
 * @returns loader ID to use with stopLoading
 */
export const startLoading = (message?: string, type: LoaderType = 'spinner'): string => {
  const container = createLoaderContainer();
  const backdrop = createBackdrop();
  const id = generateId();
  
  let loaderContent: HTMLDivElement;
  let updateProgress: ((progress: number) => void) | undefined;
  
  switch (type) {
    case 'dots':
      loaderContent = createDots(message);
      break;
    case 'pulse':
      loaderContent = createPulse(message);
      break;
    case 'bar':
      { const progressBar = createProgressBar(message);
      loaderContent = progressBar.element;
      updateProgress = progressBar.updateProgress;
      break; }
    default:
      loaderContent = createSpinner(message);
  }
  
  backdrop.appendChild(loaderContent);
  backdrop.setAttribute('data-loader-id', id);
  container.appendChild(backdrop);
  
  activeLoaders.set(id, { element: backdrop, updateProgress });
  
  return id;
};
export const updateLoadingProgress = (
  id: string,
  progress: number
): void => {
  const loader = activeLoaders.get(id);

  if (loader?.updateProgress) {
    loader.updateProgress(progress);
  }
};
/**
 * Update progress for a bar loader
 * @param id - Loader ID
 * @param progress - Progress value (0-100)
 */
export const updateProgress = (id: string, progress: number): void => {
  const loader = activeLoaders.get(id);
  if (loader?.updateProgress) {
    loader.updateProgress(progress);
    
    // Auto stop when 100%
    if (progress >= 100) {
      setTimeout(() => stopLoading(id), 500);
    }
  }
};

/**
 * Stop loading
 * @param id - Optional loader ID. If not provided, stops all loaders.
 */
export const stopLoading = (id?: string): void => {
  const container = document.getElementById('global-loader-container');
  if (!container) return;
  
  if (id) {
    // Remove specific loader
    const loader = activeLoaders.get(id);
    if (loader) {
      loader.element.style.opacity = '0';
      loader.element.style.transition = 'opacity 0.2s ease';
      setTimeout(() => {
        loader.element.remove();
        activeLoaders.delete(id);
        
        // Remove container if no more loaders
        if (activeLoaders.size === 0 && container) {
          container.remove();
        }
      }, 200);
    } else {
      // Try to find by attribute
      const backdrop = container.querySelector(`[data-loader-id="${id}"]`) as HTMLDivElement;
      if (backdrop) {
        backdrop.style.opacity = '0';
        backdrop.style.transition = 'opacity 0.2s ease';
        setTimeout(() => {
          backdrop.remove();
          if (activeLoaders.size === 0 && container) {
            container.remove();
          }
        }, 200);
      }
    }
  } else {
    // Stop all loaders
    activeLoaders.forEach((loader) => {
      loader.element.style.opacity = '0';
      loader.element.style.transition = 'opacity 0.2s ease';
    });
    
    setTimeout(() => {
      activeLoaders.clear();
      container.remove();
    }, 200);
  }
};

/**
 * Stop all active loaders immediately
 */
export const stopAllLoading = (): void => {
  stopLoading();
};

/**
 * Check if any loader is active
 */
export const isLoading = (): boolean => {
  return activeLoaders.size > 0;
};

/**
 * Wrap an async operation with loading
 * @param promise - The async operation
 * @param message - Loading message
 * @param type - Loader type
 */
export const withLoading = async <T>(
  promise: Promise<T>,
  message?: string,
  type: LoaderType = 'spinner'
): Promise<T> => {
  const id = startLoading(message, type);
  try {
    const result = await promise;
    return result;
  } finally {
    stopLoading(id);
  }
};