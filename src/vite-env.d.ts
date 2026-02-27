/// <reference types="vite/client" />

declare module '*.ino?url' {
  const src: string;
  export default src;
}

declare module '*.yaml?url' {
  const src: string;
  export default src;
}

declare module '*.pdf' {
  const src: string;
  export default src;
}
