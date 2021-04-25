/* * * * * * * * Tests for dmPPA on randomly generated graphs * * * * * * * *
*                          SdtElectronics 2021.3.31                         *
*                           <null@std.uestc.edu.cn>                         *
* * * * * * * * * * * * * * * All rights reserved * * * * * * * * * * * * * */

import { dmPPAbase } from "../src/dmPPA.mjs";
import { dmPPAimpl, dmPPArevd, dmPPAwfun, dmPPAmimc, dmPPArepl, dmPPAcomp } from "../src/dmPPA.mjs"
import { graph } from "../src/graph.mjs"

export const randGraph = (nodes, conns, maxLen = 50) => {
    const ret = graph.genRandom(nodes, conns, maxLen);
    console.log(ret.path);
    return ret;
}

export const runTest = (g, t = 200) => {
    g.preEdge().normalize();
    const dmPPA = new dmPPAcomp(g);
    dmPPA.init();
    dmPPA.loop(times => times <= t);
    console.log(dmPPA.genPath());
    console.log("Bellman–Ford", g.bft());
}

export const baseline = (g, t = 200) => {
    g.preEdge().normalize();
    const dmPPA = new dmPPArepl(g);
    dmPPA.init();
    dmPPA.loop(times => times <= t);
    console.log(dmPPA.genPath());
}

export const autoTest = (g, t = 10) => {
    let ret = 0;
    g.preEdge().normalize();
    const dmPPA = new dmPPAcomp(g);
    dmPPA.init();
    while(1){
        dmPPA.loop(times => times <= t);
        if(dmPPA.genPath().slice(1).every((e, i) => e == g.path[i])){
            return ret += t;
        }
        console.log(ret += t);
    }
}

export const autoComp = (g, t = 10) => {
    let ret = 0;
    g.preEdge().normalize();
    const dmPPA = new dmPPArepl(g);
    dmPPA.init();
    while(1){
        dmPPA.loop(times => times <= t);
        if(dmPPA.genPath().slice(1).every((e, i) => e == g.path[i])){
            return ret += t;
        }
        console.log(ret += t);
    }
}