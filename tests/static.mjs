/* * * * * * * * * Tests for dmPPA on pre-defined graphs * * * * * * * * * * *
*                          SdtElectronics 2021.3.31                          *
*                           <null@std.uestc.edu.cn>                          *
* * * * * * * * * * * * * * * All rights reserved * * * * * * * * * * * * * */

import { dmPPAbase } from "../src/dmPPA.mjs";
import { dmPPAimpl, dmPPArevd, dmPPAwfun, dmPPAmimc, dmPPArepl, dmPPAcomp } from "../src/dmPPA.mjs"
import { graph } from "../src/graph.mjs"

//[0,2,3,1,4,6]
export const testGraph1 = [
    [Infinity,5,2,4,Infinity,Infinity,Infinity],
    [0,Infinity,Infinity,1,3,Infinity,Infinity],
    [0,0,Infinity,1,Infinity,1,Infinity],
    [0,0,0,Infinity,Infinity,Infinity,Infinity],
    [0,0,0,0,Infinity,Infinity,2],
    [0,0,0,0,0,Infinity,8],
    [0,0,0,0,0,0,Infinity]
];

//[0,3,4,5]
export const testGraph2 = [
    [Infinity,2,3,2,Infinity,Infinity],
    [0,Infinity,5,1,Infinity,Infinity],
    [0,0,Infinity,3,1,5],
    [0,0,0,Infinity,1,Infinity],
    [0,0,0,0,Infinity,2],
    [0,0,0,0,0,Infinity]
];

//[0,1,2,3]
export const testGraph3 = [
    [Infinity, 4, 12, Infinity], 
    [0, Infinity, 4, 15], 
    [0, 0, Infinity, 5,], 
    [0, 0, 0, Infinity]
];

//[ 0, 3, 11 ]
export const testGraph4 = [
    [Infinity,10,10,10,Infinity,Infinity,Infinity,Infinity,Infinity,Infinity,Infinity,Infinity],
    [10,Infinity,Infinity,Infinity,10,10,Infinity,Infinity,Infinity,Infinity,Infinity,Infinity],
    [10,Infinity,Infinity,Infinity,Infinity,Infinity,Infinity,Infinity, 1, 1,Infinity,Infinity],
    [10,Infinity,Infinity,Infinity,Infinity,Infinity,Infinity,Infinity,Infinity,Infinity, 1, 1],
    [Infinity,10,Infinity,Infinity,Infinity,Infinity, 1,Infinity, 1,Infinity,Infinity,Infinity],
    [Infinity,10,Infinity,Infinity,Infinity,Infinity, 1, 1,Infinity,Infinity,Infinity,Infinity],
    [Infinity,Infinity,Infinity,Infinity, 1, 1,Infinity, 1,Infinity,Infinity,Infinity,Infinity],
    [Infinity,Infinity,Infinity,Infinity,Infinity, 1, 1,Infinity,Infinity,Infinity,Infinity, 1],
    [Infinity,Infinity, 1,Infinity, 1,Infinity,Infinity,Infinity,Infinity, 1,Infinity,Infinity],
    [Infinity,Infinity, 1,Infinity,Infinity,Infinity,Infinity,Infinity, 1,Infinity, 1,Infinity],
    [Infinity,Infinity,Infinity, 1,Infinity,Infinity,Infinity,Infinity,Infinity, 1,Infinity, 1],
    [Infinity,Infinity,Infinity, 1,Infinity,Infinity,Infinity, 1,Infinity,Infinity, 1,Infinity]
];

//[0,9,10]
export const testGraph5 = [
    [Infinity, 1, 1, 1, 1,Infinity, 3,Infinity,Infinity, 8,Infinity],
    [ 1,Infinity,Infinity,Infinity,Infinity, 3, 2,Infinity,Infinity,Infinity,Infinity],
    [ 1,Infinity,Infinity,Infinity,Infinity, 2,Infinity,Infinity,Infinity, 8,Infinity],
    [ 1,Infinity,Infinity,Infinity,Infinity,Infinity,Infinity,10,Infinity, 9,Infinity],
    [ 1,Infinity,Infinity,Infinity,Infinity,Infinity, 4,12,Infinity,Infinity,Infinity],
    [Infinity, 3, 2,Infinity,Infinity,Infinity,Infinity,Infinity, 6,Infinity,15],
    [ 3, 2,Infinity,Infinity, 4,Infinity,Infinity,Infinity, 1,Infinity,Infinity],
    [Infinity,Infinity,Infinity,10,12,Infinity,Infinity,Infinity,16,Infinity, 2],
    [Infinity,Infinity,Infinity,Infinity,Infinity, 6, 1,16,Infinity,Infinity,Infinity],
    [ 8,Infinity, 8, 9,Infinity,Infinity,Infinity,Infinity,Infinity,Infinity, 3],
    [Infinity,Infinity,Infinity,Infinity,Infinity,15,Infinity, 2,Infinity, 3,Infinity]
];

export const runTest = (mat, t = 200) => {
    const g = graph.fromMat(mat);
    g.preEdge().normalize();
    const dmPPA = new dmPPAcomp(g);
    dmPPA.init();
    dmPPA.loop(times => times <= t);
    console.log(dmPPA.genPath());
    console.log("Bellman–Ford", g.bft());
}

export const baseline = (mat, t = 200) => {
    const g = graph.fromMat(mat);
    g.preEdge().normalize();
    const dmPPA = new dmPPArepl(g);
    dmPPA.init();
    dmPPA.loop(times => times <= t);
    console.log(dmPPA.genPath());
}

export const interpret = graph.interpret;