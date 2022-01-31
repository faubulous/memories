export class Stopwatch {
    startTime: number = 0;

    endTime: number = 0;

    timeElapsed: number = 0;

    start() {
        this.startTime = performance.now();
    };

    stop() {
        this.endTime = performance.now();

        this.timeElapsed = this.endTime - this.startTime;

        return this.timeElapsed;
    }
}