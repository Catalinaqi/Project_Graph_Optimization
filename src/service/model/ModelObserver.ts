type ObserverFn = (event: string, payload: any) => void;

export class ModelObserver {
    private observers: ObserverFn[] = [];

    subscribe(fn: ObserverFn) {
        this.observers.push(fn);
    }

    notify(event: string, payload: any) {
        for (const fn of this.observers) {
            fn(event, payload);
        }
    }
}

export const modelObserver = new ModelObserver();
