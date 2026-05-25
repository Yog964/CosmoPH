declare module 'react-plotly.js' {
    import { Component } from 'react';
    import { PlotData, Layout, Config } from 'plotly.js';

    interface PlotProps {
        data: Partial<PlotData>[];
        layout: Partial<Layout>;
        config?: Partial<Config>;
        useResizeHandler?: boolean;
        style?: React.CSSProperties;
        className?: string;
        onInitialized?: (figure: { data: Partial<PlotData>[]; layout: Partial<Layout> }, graphDiv: HTMLElement) => void;
        onUpdate?: (figure: { data: Partial<PlotData>[]; layout: Partial<Layout> }, graphDiv: HTMLElement) => void;
        onPurge?: (figure: { data: Partial<PlotData>[]; layout: Partial<Layout> }, graphDiv: HTMLElement) => void;
        onError?: (err: Error) => void;
    }

    export default class Plot extends Component<PlotProps> {}
}
