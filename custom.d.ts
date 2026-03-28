/*
 * Tells the IntelliSense to allow import of the following file extensions in TypeScript.
 * Current Webpack config for these files doesn't embed their content, but provides the file path inside the Webpack bundle.
 */

declare module "*.css" {
    const content: string;
    export default content;
}
declare module "*.html" {
    const content: string;
    export default content;
}

interface ObjectConstructor {
    hasOwn(o: Function, v: keyof Function): true
    hasOwn<K extends PropertyKey>(o: Function, v: K): o is Function & Record<K, unknown>
    hasOwn<T extends object>(o: T, v: PropertyKey): v is keyof T
}
