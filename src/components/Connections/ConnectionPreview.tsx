import { useMachineStore } from '../../store/useMachineStore';
import { getPortWorldPosition } from '../../utils/connectionEngine';

export function ConnectionPreview() {
  const connectionStart = useMachineStore((state) => state.connectionStart);
  const connectionPreview = useMachineStore((state) => state.connectionPreview);
  const modules = useMachineStore((state) => state.modules);
  
  if (!connectionStart || !connectionPreview) return null;
  
  const sourceModule = modules.find((m) => m.instanceId === connectionStart.moduleId);
  if (!sourceModule) return null;
  
  const sourcePort = sourceModule.ports.find((p) => p.id === connectionStart.portId);
  if (!sourcePort) return null;
  
  const moduleSizes: Record<string, { width: number; height: number }> = {
    'core-furnace': { width: 100, height: 100 },
    'energy-pipe': { width: 120, height: 50 },
    'gear': { width: 80, height: 80 },
    'rune-node': { width: 80, height: 80 },
    'shield-shell': { width: 100, height: 60 },
    'trigger-switch': { width: 60, height: 100 },
  };
  
  const size = moduleSizes[sourceModule.type] || { width: 80, height: 80 };
  const startPos = getPortWorldPosition(sourceModule, sourcePort, size.width, size.height);
  
  // Calculate bezier control points
  const dx = connectionPreview.x - startPos.x;
  const controlOffset = Math.min(Math.abs(dx) * 0.5, 80);
  
  let cp1x = startPos.x + controlOffset;
  let cp1y = startPos.y;
  let cp2x = connectionPreview.x - controlOffset;
  let cp2y = connectionPreview.y;
  
  if (dx < 0) {
    cp1x = startPos.x;
    cp1y = startPos.y + controlOffset;
    cp2x = connectionPreview.x;
    cp2y = connectionPreview.y - controlOffset;
  }
  
  const pathData = `M ${startPos.x} ${startPos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${connectionPreview.x} ${connectionPreview.y}`;
  
  return (
    <g>
      {/* Preview path */}
      <path
        d={pathData}
        fill="none"
        stroke="#ffd700"
        strokeWidth="2"
        strokeDasharray="8,8"
        opacity="0.7"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="16"
          to="0"
          dur="0.4s"
          repeatCount="indefinite"
        />
      </path>
      
      {/* Preview end point */}
      <circle
        cx={connectionPreview.x}
        cy={connectionPreview.y}
        r="8"
        fill="#ffd700"
        opacity="0.5"
      >
        <animate
          attributeName="r"
          values="8;12;8"
          dur="0.8s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.5;0.2;0.5"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </circle>
      
      <circle
        cx={connectionPreview.x}
        cy={connectionPreview.y}
        r="4"
        fill="#ffd700"
      />
    </g>
  );
}
