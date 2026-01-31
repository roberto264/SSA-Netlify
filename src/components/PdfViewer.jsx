import React, { useState, useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { highlightPlugin, MessageIcon, Trigger } from '@react-pdf-viewer/highlight';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { X, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { usePdfHighlights } from '../lib/database';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';

export default function PdfViewer({ pdfData, modulId, onClose }) {
  const [message, setMessage] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FFEB3B');
  const [showHighlightsList, setShowHighlightsList] = useState(false);
  const { highlights, loading, saveHighlight, deleteHighlight } = usePdfHighlights(modulId);

  // Highlight colors
  const HIGHLIGHT_COLORS = {
    yellow: { color: '#FFEB3B', name: 'Gelb' },
    green: { color: '#4CAF50', name: 'Grün' },
    blue: { color: '#2196F3', name: 'Blau' },
    pink: { color: '#E91E63', name: 'Pink' },
    orange: { color: '#FF9800', name: 'Orange' },
  };

  // Create page navigation plugin for reliable page jumping
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  // Create highlight plugin with proper handlers
  const highlightPluginInstance = highlightPlugin({
    trigger: Trigger.TextSelection,
    renderHighlightTarget: (props) => (
      <div
        style={{
          background: '#fff',
          border: '1px solid rgba(0, 0, 0, .3)',
          borderRadius: '4px',
          padding: '8px',
          position: 'absolute',
          left: `${props.selectionRegion.left}%`,
          top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
          zIndex: 1000,
          display: 'flex',
          gap: '4px',
        }}
      >
        {Object.entries(HIGHLIGHT_COLORS).map(([key, { color, name }]) => (
          <button
            key={key}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: selectedColor === color ? '2px solid #000' : '1px solid #ccc',
              backgroundColor: color,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title={name}
            onClick={() => {
              handleAddHighlight(props, color, name);
              props.cancel();
            }}
          />
        ))}
      </div>
    ),
    renderHighlights: (props) => {
      console.log('Rendering highlights for page:', props.pageIndex, 'Total highlights:', highlights.length);

      return (
        <div>
          {highlights
            .filter(highlight => highlight.page_index === props.pageIndex)
            .map((highlight) => {
              console.log('Rendering highlight:', highlight.id, 'Areas:', highlight.highlight_areas);

              if (!highlight.highlight_areas || !Array.isArray(highlight.highlight_areas)) {
                return null;
              }

              // Render each area manually with correct positioning
              return highlight.highlight_areas.map((area, areaIdx) => (
                <div
                  key={`${highlight.id}-${areaIdx}`}
                  id={areaIdx === 0 ? `highlight-${highlight.id}` : undefined}
                  className="highlight-area"
                  style={{
                    background: highlight.color,
                    opacity: 0.4,
                    position: 'absolute',
                    left: `${area.left}%`,
                    top: `${area.top}%`,
                    width: `${area.width}%`,
                    height: `${area.height}%`,
                    cursor: 'pointer',
                    mixBlendMode: 'multiply',
                    pointerEvents: 'auto',
                  }}
                  onClick={() => handleHighlightClick(highlight)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleDeleteHighlight(highlight.id);
                  }}
                  title={highlight.selected_text || 'Rechtsklick zum Löschen'}
                />
              ));
            })}
        </div>
      );
    },
  });

  // Create default layout plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [
      defaultTabs[0], // Thumbnails
      defaultTabs[1], // Bookmarks
    ],
  });

  // Handle adding new highlight
  const handleAddHighlight = async (props, color, colorName) => {
    try {
      console.log('Full props:', props);
      console.log('props.highlightAreas:', props.highlightAreas);
      console.log('selectedText from props:', props.selectedText);

      // Use highlightAreas from props (for multi-line selections) or fall back to selectionRegion
      const highlightAreas = props.highlightAreas || [props.selectionRegion];
      const pageIndex = props.selectionRegion.pageIndex;

      console.log('Using highlightAreas:', highlightAreas);

      console.log('Final highlightAreas:', highlightAreas);

      // Extract the selected text from window selection
      const selection = window.getSelection();
      const textContent = selection ? selection.toString().trim() : '';

      console.log('Creating highlight:', {
        pageIndex,
        textContent,
        color,
        highlightAreas
      });

      // Save to database with selected text
      const result = await saveHighlight(pageIndex, highlightAreas, color, textContent);
      console.log('Highlight saved successfully:', result);
      showMessage(`${colorName} Highlight erstellt! 🎨`);
    } catch (error) {
      console.error('Error adding highlight:', error);
      showMessage(`Fehler: ${error.message}`);
    }
  };

  // Handle highlight click
  const handleHighlightClick = (highlight) => {
    if (highlight.note) {
      alert(`Notiz: ${highlight.note}`);
    } else if (highlight.selected_text) {
      // Show the highlighted text in an alert
      alert(`Markierter Text:\n"${highlight.selected_text}"`);
    }
  };

  // Handle delete highlight
  const handleDeleteHighlight = async (highlightId) => {
    if (confirm('Highlight wirklich löschen?')) {
      try {
        await deleteHighlight(highlightId);
        showMessage('Highlight gelöscht ✓');
      } catch (error) {
        console.error('Error deleting highlight:', error);
        showMessage('Fehler beim Löschen');
      }
    }
  };

  // Jump to highlight
  const jumpToHighlight = (highlight) => {
    console.log('Jumping to highlight on page:', highlight.page_index);
    jumpToPage(highlight.page_index);

    // Try to find and scroll to the element with retries for better performance
    let attempts = 0;
    const maxAttempts = 15; // 15 * 100ms = 1500ms max

    const tryScroll = () => {
      const element = document.getElementById(`highlight-${highlight.id}`);

      if (element) {
        // Element found, scroll to it after small delay to ensure page is rendered
        console.log('Found element after', attempts * 100, 'ms');

        // Small delay to ensure PDF page is fully rendered before scrolling
        setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
          showMessage(`Springe zu Seite ${highlight.page_index + 1}`);
        }, 150);
      } else if (attempts < maxAttempts) {
        // Element not found yet, try again
        attempts++;
        setTimeout(tryScroll, 100);
      } else {
        // Max attempts reached
        console.warn('Highlight element not found after', maxAttempts * 100, 'ms');
        showMessage(`Springe zu Seite ${highlight.page_index + 1}`);
      }
    };

    // Start trying after a small initial delay
    setTimeout(tryScroll, 50);
  };

  // Show temporary message
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // Get color name from hex
  const getColorName = (hex) => {
    const found = Object.values(HIGHLIGHT_COLORS).find(c => c.color === hex);
    return found ? found.name : 'Unbekannt';
  };

  // Truncate text for display
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-7xl h-[95vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <h2 className="font-bold text-lg">{pdfData.title}</h2>
              <p className="text-blue-100 text-sm">{pdfData.description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div className="bg-green-500 text-white px-4 py-2 text-center text-sm font-medium">
            {message}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* PDF Viewer */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer
                  fileUrl={pdfData.file}
                  plugins={[defaultLayoutPluginInstance, highlightPluginInstance, pageNavigationPluginInstance]}
                  theme={{
                    theme: 'light',
                  }}
                />
              </Worker>
            )}
          </div>

          {/* Highlights Sidebar */}
          <div
            className={`bg-white border-l border-gray-200 transition-all duration-300 ${
              showHighlightsList ? 'w-80' : 'w-0'
            } overflow-hidden flex flex-col`}
          >
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="text-xl">🎨</span>
                Meine Highlights ({highlights.length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {highlights.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  Noch keine Highlights.
                  <br />
                  Markiere Text im PDF!
                </div>
              ) : (
                highlights.map((highlight) => (
                  <div
                    key={highlight.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => jumpToHighlight(highlight)}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: highlight.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 mb-1">
                          Seite {highlight.page_index + 1}
                        </div>
                        {/* Show selected text instead of color name */}
                        <div className="text-sm text-gray-900 font-medium leading-snug">
                          {highlight.selected_text ? (
                            `"${truncateText(highlight.selected_text, 60)}"`
                          ) : (
                            `${getColorName(highlight.color)} Markierung`
                          )}
                        </div>
                        {highlight.note && (
                          <div className="text-xs text-gray-600 mt-1 italic">
                            💭 {highlight.note}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHighlight(highlight.id);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(highlight.created_at).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Toggle Button for Highlights List */}
          <button
            onClick={() => setShowHighlightsList(!showHighlightsList)}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-500 text-white p-2 rounded-l-lg shadow-lg hover:bg-blue-600 transition-colors z-10"
            style={{ right: showHighlightsList ? '320px' : '0' }}
            title={showHighlightsList ? 'Liste schließen' : 'Highlights anzeigen'}
          >
            {showHighlightsList ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold">{highlights.length}</span>
                <ChevronLeft className="w-5 h-5" />
              </div>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 border-t">
          💡 <strong>Tipp:</strong> Markiere Text im PDF und wähle eine Farbe • Rechtsklick zum Löschen • Klick auf Highlight in der Liste zum Springen
        </div>
      </div>
    </div>
  );
}
