// utils/printUtils.ts
export const printBOQToPDF = (elementId: string, title: string): void => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  // Get the current page title
  const originalTitle = document.title;
  document.title = title;
  
  // Clone the element to avoid modifying the original
  const printContent = element.cloneNode(true) as HTMLElement;
  
  // Remove all buttons and interactive elements
  const interactiveElements = printContent.querySelectorAll('button, [onclick], input, textarea, select, .no-print');
  interactiveElements.forEach((el: Element) => {
    const element = el as HTMLElement;
    element.remove();
  });
  
  // Replace gradient backgrounds with solid colors
  const gradientElements = printContent.querySelectorAll('[class*="bg-linear"], [class*="bg-gradient"]');
  gradientElements.forEach((el: Element) => {
    const element = el as HTMLElement;
    element.style.backgroundColor = '#f3f4f6';
    element.style.backgroundImage = 'none';
  });
  
  // Create print window
  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  if (!printWindow) return;
  
  // Get all styles from the current page
  const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
  let stylesHTML = '';
  styles.forEach((style: Element) => {
    if (style.tagName === 'LINK') {
      const linkElement = style as HTMLLinkElement;
      stylesHTML += `<link rel="stylesheet" href="${linkElement.href}">`;
    } else if (style.tagName === 'STYLE') {
      const styleElement = style as HTMLStyleElement;
      stylesHTML += `<style>${styleElement.innerHTML}</style>`;
    }
  });
  
  // Add print-specific styles to fix any modern CSS issues
  const printStyles = `
    <style>
      * {
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      body {
        padding: 20px;
        font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: white;
      }
      
      .print-container {
        max-width: 1200px;
        margin: 0 auto;
      }
      
      /* Fix table styles */
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      
      th, td {
        border: 1px solid #e5e7eb;
        padding: 8px 12px;
        text-align: left;
      }
      
      th {
        background-color: #f9fafb;
        font-weight: 600;
      }
      
      td.text-right, th.text-right {
        text-align: right;
      }
      
      /* Fix any gradient backgrounds */
      [class*="bg-linear"], [class*="bg-gradient"] {
        background: #f9fafb !important;
      }
      
      /* Ensure proper spacing */
      .print-header {
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid #333;
      }
      
      /* Page breaks */
      .page-break {
        page-break-before: always;
      }
      
      tr {
        page-break-inside: avoid;
      }
      
      /* Print-specific adjustments */
      @media print {
        body {
          margin: 0;
          padding: 15px;
        }
        
        button, .no-print {
          display: none !important;
        }
      }
    </style>
  `;
  
  // Write to print window
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        ${stylesHTML}
        ${printStyles}
      </head>
      <body>
        <div class="print-container">
          ${printContent.outerHTML}
        </div>
        <script>
          window.onload = () => {
            window.print();
            window.onafterprint = () => window.close();
          };
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
  
  // Restore original title
  setTimeout(() => {
    document.title = originalTitle;
  }, 100);
};