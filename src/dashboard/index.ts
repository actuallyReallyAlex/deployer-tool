console.log("Hello, World! - dashboard/index.ts");

const hello = document.createElement("h1");

hello.textContent = "Hello, World!";

const root = document.getElementById("root");

root?.appendChild(hello);
