# Distributed Multicast Physarum Polycephalum Algorithm

## Run Tests
Requirements: 
* Node.js >= v14.0.0 
### Tests on Pre-defined Graphs
Open node prompt in `test/` directory with top-level await in REPL enabled:
```
node --experimental-repl-await
```
Import tests:
```
const dmTests = await import("./stochastic.mjs");
```
Randomly generate a graph:
```
let g = dmTests.randGraph(20, 6);
```
where the first parameter specifies the nodes in the graph and the second specifies maximum adjacent nodes connected to a node.

Run tests:
```
dmTests.autoTest(g, 20)
```
Where the second parameter specifies rounds of loop to check the validity of generated path.