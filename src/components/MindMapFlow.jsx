import { useState, useMemo } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import { X } from 'lucide-react';
import '@xyflow/react/dist/style.css';

// Custom Node Component
function TopicNode({ data }) {
  return (
    <div
      className="px-4 py-2 rounded-full shadow-lg cursor-pointer transition-all hover:scale-105"
      style={{
        backgroundColor: data.color,
        border: data.isExpanded ? '3px solid white' : 'none',
        minWidth: '120px',
        textAlign: 'center'
      }}
      onClick={data.onToggle}
    >
      <div className="flex items-center justify-center gap-2">
        <span className="text-white font-semibold text-sm">{data.label}</span>
        <span className="text-white font-bold">{data.isExpanded ? '−' : '+'}</span>
      </div>
    </div>
  );
}

function DetailNode({ data }) {
  return (
    <div
      className="px-4 py-2 rounded-full shadow-md"
      style={{
        backgroundColor: data.color,
        opacity: 0.9,
        minWidth: '150px',
        textAlign: 'center'
      }}
    >
      <span className="text-white text-xs font-medium">{data.label}</span>
    </div>
  );
}

function CenterNode({ data }) {
  return (
    <div className="px-6 py-4 rounded-full shadow-xl bg-gradient-to-br from-violet-500 to-purple-600">
      <div className="text-white font-bold text-center">
        <div className="text-sm">{data.label}</div>
        <div className="text-xs opacity-80 mt-1">{data.subtitle}</div>
      </div>
    </div>
  );
}

const nodeTypes = {
  center: CenterNode,
  topic: TopicNode,
  detail: DetailNode,
};

export default function MindMapFlow({ mindmapData, onClose }) {
  const [expandedTopics, setExpandedTopics] = useState(new Set());
  const topics = mindmapData.topics || [];

  const toggleTopic = (topicId) => {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const { nodes, edges } = useMemo(() => {
    const nodes = [];
    const edges = [];

    // Center node
    nodes.push({
      id: 'center',
      type: 'center',
      position: { x: 0, y: 0 },
      data: {
        label: mindmapData.centerLabel,
        subtitle: `${topics.length} Themen`
      },
    });

    // Calculate positions for topics in a circle
    const radius = 300;
    topics.forEach((topic, index) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / topics.length;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      // Topic node
      nodes.push({
        id: `topic-${topic.id}`,
        type: 'topic',
        position: { x, y },
        data: {
          label: topic.title,
          color: topic.color,
          isExpanded: expandedTopics.has(topic.id),
          onToggle: () => toggleTopic(topic.id),
        },
      });

      // Edge from center to topic
      edges.push({
        id: `edge-center-${topic.id}`,
        source: 'center',
        target: `topic-${topic.id}`,
        style: { stroke: topic.color, strokeWidth: 3, strokeOpacity: 0.4 },
        type: 'straight',
      });

      // Detail nodes if topic is expanded
      if (expandedTopics.has(topic.id)) {
        const details = topic.details || [];
        const detailRadius = 180;

        details.forEach((detail, detailIndex) => {
          const spread = 0.6;
          const detailAngle = angle + (detailIndex - (details.length - 1) / 2) * spread;
          const dx = x + detailRadius * Math.cos(detailAngle);
          const dy = y + detailRadius * Math.sin(detailAngle);

          // Detail node
          nodes.push({
            id: `detail-${topic.id}-${detailIndex}`,
            type: 'detail',
            position: { x: dx, y: dy },
            data: {
              label: detail,
              color: topic.color,
            },
          });

          // Edge from topic to detail
          edges.push({
            id: `edge-${topic.id}-${detailIndex}`,
            source: `topic-${topic.id}`,
            target: `detail-${topic.id}-${detailIndex}`,
            style: { stroke: topic.color, strokeWidth: 2, strokeOpacity: 0.3 },
            type: 'straight',
          });
        });
      }
    });

    return { nodes, edges };
  }, [mindmapData, topics, expandedTopics]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <h2 className="font-bold">{mindmapData.centerLabel}</h2>
              <p className="text-violet-100 text-sm">
                {topics.length} Themen • Klicke auf ein Thema um Details zu sehen
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

        <div className="flex-1 bg-gray-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnScroll={true}
            panOnScroll={false}
            minZoom={0.5}
            maxZoom={1.5}
          >
            <Background color="#e5e7eb" gap={16} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
