import { ListRange } from "@angular/cdk/collections";
import { Rectangle, Point } from "@mathigon/euclid";

export class VirtualCanvasLayoutRegion extends Rectangle {
    range?: ListRange;

    date: Date;

    constructor(date: Date, p: Point, width?: number, height?: number) {
        super(p, width, height);

        this.date = date;
    }
}