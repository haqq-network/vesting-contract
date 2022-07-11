// see:
// https://stackoverflow.com/a/65483206/1697878
declare module '*.md' {
    const value: string; // markdown is just a string
    export default value;
}