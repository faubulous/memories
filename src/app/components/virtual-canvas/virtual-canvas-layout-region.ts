import { ListRange } from "@angular/cdk/collections";
import { Rectangle, Point } from "@mathigon/euclid";

export class VirtualCanvasLayoutRegion extends Rectangle {
    range?: ListRange;

    date: Date;

    constructor(date: Date, p: Point, width?: number, height?: number) {
        super(p, width, height);

        this.date = date;
    }

    /**
     * Indicates if an item is contained within this layout region.
     * @param n Item number.
     * @returns True if the item is in the assigned range, false otherwise.
     */
    containsItem(n: number) : boolean {
        if(this.range) {
            return this.range.start <= n && n <= this.range.end;
        } else {
            return false;
        }
    }
}