/**
 * CodexCardExport Component - Round 95
 * Canvas-based poster rendering with all required visual elements
 */
import React, { useMemo, useRef } from 'react';
import { PlacedModule, Connection, GeneratedAttributes } from '../../types';
import { FactionConfig } from '../../types/factions';
import { generateCodexCardSVG } from '../../services/exportService';

interface CodexCardExportProps {
  modules: PlacedModule[];
  connections: Connection[];
  attributes: GeneratedAttributes;
  faction: FactionConfig;
  className?: string;
}

/** AC-EXPORT-002: Poster contains all 6 required elements */
export const CodexCardExport: React.FC<CodexCardExportProps> = ({
  modules,
  connections,
  attributes,
  faction,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const svgContent = useMemo(() => {
    return generateCodexCardSVG(modules, connections, attributes, faction);
  }, [modules, connections, attributes, faction]);

  return (
    <div
      ref={containerRef}
      className={`codex-card-export ${className}`}
      data-testid="codex-card-export"
      data-machine-name={attributes.name}
      data-codex-id={attributes.codexId}
      data-rarity={attributes.rarity}
    >
      <div
        className="codex-card-visualization"
        data-testid="codex-card-visualization"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};

export default CodexCardExport;
