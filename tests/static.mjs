/* * * * * * * * * Tests for dmPPA on pre-defined graphs * * * * * * * * * * *
*                          SdtElectronics 2021.3.31                          *
*                           <null@std.uestc.edu.cn>                          *
* * * * * * * * * * * * * * * All rights reserved * * * * * * * * * * * * * */

import {dmPPAimpl} from "../src/dmPPA.mjs"

export const testGraph1 = [
    [Infinity,5,2,4,Infinity,Infinity,Infinity],
    [0,Infinity,Infinity,1,3,Infinity,Infinity],
    [0,0,Infinity,1,Infinity,1,Infinity],
    [0,0,0,Infinity,Infinity,Infinity,Infinity],
    [0,0,0,0,Infinity,Infinity,2],
    [0,0,0,0,0,Infinity,8],
    [0,0,0,0,0,0,Infinity]
];

export const testGraph2 = [
    [Infinity,2,3,2,Infinity,Infinity],
    [0,Infinity,5,1,Infinity,Infinity],
    [0,0,Infinity,3,1,5],
    [0,0,0,Infinity,1,Infinity],
    [0,0,0,0,Infinity,2],
    [0,0,0,0,0,Infinity]
];

export const testGraph3 = [
    [Infinity, 4, 12, Infinity], 
    [0, Infinity, 4, 15], 
    [0, 0, Infinity, 5,], 
    [0, 0, 0, Infinity]
];

export const runTest = graph => {
    const dmPPA = new dmPPAimpl(dmPPAimpl.preEdge(graph));
    dmPPA.init();
    dmPPA.loop();
    console.log(dmPPA.genPath());
}