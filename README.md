# Distributed Multicast Physarum Polycephalum Algorithm

## Run Tests
Requirements: 
* Node.js >= v14.0.0 
### Tests on Pre-defined Graphs
Open node prompt with top-level await in REPL enabled:
```
node --experimental-repl-await
```
Import tests:
```
const dmTests = await import("./static.mjs")
```
Run tests:
```
dmTests.runTest(dmTests.testGraph1, 100)
dmTests.runTest(dmTests.testGraph2)
dmTests.runTest(dmTests.testGraph3)
```
The second parameter specifies rounds of loop with a default value of 200.