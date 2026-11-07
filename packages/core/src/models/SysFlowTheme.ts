export interface SysFlowThemeTokens {
  bg?: string;
  grid?: string;
  nodeBg?: string;
  nodeBorder?: string;
  nodeSelected?: string;
  nodeText?: string;
  nodeSubtext?: string;
  containerBg?: string;
  containerHeaderBg?: string;
  containerBorder?: string;
  containerHover?: string;
  edgeStroke?: string;
  edgeSelected?: string;
  portBg?: string;
  portHover?: string;
  panelBg?: string;
  panelBorder?: string;
  panelBtnBg?: string;
  panelBtnHover?: string;
  panelBtnText?: string;
  shadow?: string;
}

const TOKEN_VAR_MAP: Record<keyof SysFlowThemeTokens, string> = {
  bg: '--sysflow-bg',
  grid: '--sysflow-grid',
  nodeBg: '--sysflow-node-bg',
  nodeBorder: '--sysflow-node-border',
  nodeSelected: '--sysflow-node-selected',
  nodeText: '--sysflow-node-text',
  nodeSubtext: '--sysflow-node-subtext',
  containerBg: '--sysflow-container-bg',
  containerHeaderBg: '--sysflow-container-header-bg',
  containerBorder: '--sysflow-container-border',
  containerHover: '--sysflow-container-hover',
  edgeStroke: '--sysflow-edge-stroke',
  edgeSelected: '--sysflow-edge-selected',
  portBg: '--sysflow-port-bg',
  portHover: '--sysflow-port-hover',
  panelBg: '--sysflow-panel-bg',
  panelBorder: '--sysflow-panel-border',
  panelBtnBg: '--sysflow-panel-btn-bg',
  panelBtnHover: '--sysflow-panel-btn-hover',
  panelBtnText: '--sysflow-panel-btn-text',
  shadow: '--sysflow-shadow',
};

/**
 * Transforms theme tokens into CSS custom properties applied directly to the root canvas element
 */
export function themeTokensToStyle(tokens?: Partial<SysFlowThemeTokens>): React.CSSProperties {
  if (!tokens) return {};
  const styles: Record<string, string> = {};
  for (const [key, val] of Object.entries(tokens)) {
    if (val !== undefined) {
      const varName = TOKEN_VAR_MAP[key as keyof SysFlowThemeTokens] || `--sysflow-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      styles[varName] = val;
    }
  }
  return styles as React.CSSProperties;
}
