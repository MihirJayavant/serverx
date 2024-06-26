export abstract class Actor<T> {
    protected data!: T;
    abstract onCreate: () => Promise<void>;
    abstract onSave: () => Promise<void>;
}
