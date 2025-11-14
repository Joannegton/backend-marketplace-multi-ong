export class InvalidPropsException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidPropsException';
    }
}