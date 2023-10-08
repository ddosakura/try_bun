// https://bun.sh/docs/bundler/macros#import-attributes
// import { random } from './macros.ts' with { type: 'macro' };
import { random } from 'macros' assert { type: 'macro' };

console.log(Bun.version, `Your random number is ${random()}`);
