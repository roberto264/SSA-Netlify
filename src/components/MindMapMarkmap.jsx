import { useEffect, useRef } from 'react';
import { Markmap } from 'markmap-view';
import { Transformer } from 'markmap-lib';
import { X } from 'lucide-react';

export default function MindMapMarkmap({ mindmapData, onClose }) {
  const svgRef = useRef(null);
  const mmRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !mindmapData) return;

    // Convert mindmap data to markdown format
    const markdown = convertToMarkdown(mindmapData);

    // Transform markdown to markmap data
    const transformer = new Transformer();
    const { root } = transformer.transform(markdown);

    // Create or update markmap
    if (!mmRef.current) {
      mmRef.current = Markmap.create(svgRef.current, {
        colorFreezeLevel: 2,
        maxWidth: 300,
        paddingX: 20,
        spacingVertical: 10,
        spacingHorizontal: 80,
        initialExpandLevel: 2,
      });
    }

    mmRef.current.setData(root);
    mmRef.current.fit();

    return () => {
      if (mmRef.current) {
        mmRef.current.destroy();
        mmRef.current = null;
      }
    };
  }, [mindmapData]);

  const convertToMarkdown = (data) => {
    const topics = data.topics || [];
    let markdown = `# ${data.centerLabel}\n\n`;

    topics.forEach((topic) => {
      markdown += `## ${topic.title}\n\n`;
      if (topic.details && topic.details.length > 0) {
        topic.details.forEach((detail) => {
          markdown += `- ${detail}\n`;
        });
        markdown += '\n';
      }
    });

    return markdown;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <h2 className="font-bold">{mindmapData.centerLabel}</h2>
              <p className="text-violet-100 text-sm">
                {mindmapData.topics?.length || 0} Themen • Klicke auf Nodes zum Aus-/Einklappen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 bg-white relative">
          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            }}
          />
        </div>

        <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 flex items-center justify-between border-t">
          <div>
            💡 Tipp: Klicke auf die Nodes um Details ein-/auszuklappen
          </div>
          <div className="text-xs opacity-70">
            Powered by Markmap
          </div>
        </div>
      </div>
    </div>
  );
}
