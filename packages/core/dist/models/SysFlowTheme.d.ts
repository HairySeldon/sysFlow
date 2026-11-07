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
/**
 * Transforms theme tokens into CSS custom properties applied directly to the root canvas element
 */
export declare function themeTokensToStyle(tokens?: Partial<SysFlowThemeTokens>): React.CSSProperties;
//# sourceMappingURL=SysFlowTheme.d.ts.map