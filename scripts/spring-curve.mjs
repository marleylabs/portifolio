// Gera o token --ease-spring a partir da mesma simulação usada em runtime.
// Uso: npm run spring-curve -- [stiffness] [damping] [mass]
// Cole o resultado em src/styles/tokens.css.

import { springToLinear } from "../src/lib/spring.ts";

const [stiffness = 300, damping = 20, mass = 1] = process.argv.slice(2).map(Number);
const { easing, duration } = springToLinear({ stiffness, damping, mass });

console.log(`--ease-spring: ${easing};`);
console.log(`--spring-duration: ${duration}ms;`);
