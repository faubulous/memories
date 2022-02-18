import { Router } from "@angular/router";
import { Stage } from "konva/lib/Stage";
import { LinearLayout } from "./layouts/linear-layout";
import { TimelineLayout } from "./layouts/timeline-layout";
import { VirtualCanvasLayouter } from "./virtual-canvas-layouter";
import { VirtualCanvasDataSourceService } from "./virtual-canvas-data-source.service";

export class VirtualCanvasLayouterFactory {
    constructor(private router: Router, private stage: Stage, private dataSource: VirtualCanvasDataSourceService) { }

    createLayouter(id: string): VirtualCanvasLayouter {
        switch (id) {
            case 'timeline':
                return new TimelineLayout(this.router, this.stage, this.dataSource);
            case 'linear':
                return new LinearLayout(this.router, this.stage, this.dataSource);
            default:
                return new LinearLayout(this.router, this.stage, this.dataSource);
        }
    }
}