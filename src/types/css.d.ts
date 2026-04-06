/**
 * CSS Module Type Declarations
 * 
 * Allows importing CSS modules in TypeScript.
 */

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.css' {
  const content: string;
  export default content;
}
