export class Timer {
    constructor(duree, onTick, onEnd) {
        this.duree = duree;
        this.onTick = onTick;
        this.onEnd = onEnd;
    }

    demarrer() {
        const interval = setInterval(() => {
            if (this.duree <= 0) {
                clearInterval(interval);
                this.onEnd();
            } else {
                this.onTick(this.duree);
                this.duree--;
            }
        }, 1000);
    }
}