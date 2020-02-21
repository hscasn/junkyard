export function transform(input: number[]): number {
    if (!input || input.constructor !== Array)
        throw new Error('Input must be an array of numbers!');

    try {
        const total = input.reduce((acc: number, n: number) => acc + n, 0);

        if (total === 0) {
            console.log('The input is equal to zero');
            return 0;
        } else if (total > 0) {
            console.log('The input is greater than zero');
            return 1;
        } else {
            console.log('The input is greater than zero');
            return -1;
        }
    } catch (e) {
        /* istanbul ignore next */
        console.error(`Unknown error occurred: ${e}`);
        /* istanbul ignore next */
        return 0;
    }
};
