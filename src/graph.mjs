/* * * * * * * * * * * * graph helper class for dmPPA * * * * * * * * * * * * 
*                          SdtElectronics 2021.4.21                         *
*                           <null@std.uestc.edu.cn>                         *
* * * * * * * * * * * * * * * All rights reserved * * * * * * * * * * * * * */

import { shortest } from "./dijkstra.mjs";

export class graph extends Array{
    /*
    * \..
    * .\.
    * ..\ mirror about \ axis
    */
    mirror(){
        let o = 0;
        this.forEach((row, i) =>  
            row.slice(++o).forEach((ele, j) => this[o+j][i] = ele)
        );
        return this;
    }

    normalize(){
        const flatten = this.flat().filter(e => e != Infinity);
        const scale = Math.max(...flatten) - Math.min(...flatten);
        //const scale = Math.max(...flatten);
        this.forEach((row, i) => row.forEach((e, j) => this[i][j] /= scale));
        return this;
    }

    preEdge(){
        this.mirror();
        //Set all adjacent nodes unreachable for sink node
        this[this.length - 1].fill(Infinity);
        return this;
    }

    //Calculate iterations that Bellman–Ford algorithm costs
    bft(){
        const tmp = [...this.mirror()];
        const E = tmp.flat().filter(e => e != Infinity).length/2;
        return E * (this.length - 1);
    }

    //Interpret matlab matrix
    static interpret(str){
        return new graph(...(str.split("\n")
                            .map(e => e.split(/\s+/)
                            .filter(e => e != "")
                            .map(e => e == "0" ? Infinity : parseInt(e)))));
    }

    static fromMat(mat){
        return new graph(...mat);
    }

    static genRandom(nodes, conns, maxLen = 50){
        while(1){
            const g = graph.fromMat(Array.from({length: nodes},
                () => new Array(nodes).fill(Infinity)
            ));
            g.forEach((row, i) => {
                const connArr = new Set();
                while(connArr.size != conns){
                    connArr.add(Math.floor(Math.random() * nodes));
                }
                connArr.forEach(j => {
                    g[i][j] = Math.floor(Math.random() * maxLen) + 1;
                });
                g[i][i] = Infinity;
                //Cancel short-circuit path between source and sink
                g[0][nodes - 1] = Infinity;
            });
            g.mirror();
            try{
                //Random sparse matrix could form disjoint graph causing
                //algorithm throwing exception. Catch it in try block and
                //generate a new graph
                g.path = shortest(g);
            }catch(e){
                continue;
            }
            return g;
        }
    }
}