/* Distributed Multicast Physarum Polycephalum Algorithm Core Implementation *
*                          SdtElectronics 2021.3.31                          *
*                           <null@std.uestc.edu.cn>                          *
* * * * * * * * * * * * * * * All rights reserved * * * * * * * * * * * * * */

import { packet } from "./packet.mjs";

//class dmPPAbase{
export class dmPPAbase{
    constructor(edges){
        this.edgeMat = edges;
    }

    init(){
        //Send initial packet to the network
        this.packets = [new packet(0, 0, 1)];

        //Initialize conductivity of all edges to 1
        this.condMat = Array.from({length: this.edgeMat.length},
            () => new Array(this.edgeMat.length).fill(1)
        );
    }

    iterate(){
        //Updates the conductivity according to packets
        this.packets.forEach(e => {
            this.updateCond4Pack(e);
        });
        
        //Updates the conductivity according to edges
        this.updateCond4Edge();

        //Send new packets to the network
        this.packets = this.packets.map(e => 
            this.updatePacks(e)
        ).flat();
        this.packets.push(new packet(0, 0, 1));
    }

    loop(endPredicate = this.endPredicate){
        let times = 0;
        while(endPredicate(times)){
            this.iterate();
            ++times;
        }
    }

    //Find shortest path according to conductivity matrix
    genPath(){
        const path = [0];
        let next = 0;
        while(next != this.edgeMat.length - 1){
            const nexts = [...this.condMat[next]];
            //Don't go backwards
            path.forEach(nodes => nexts[nodes] = -Infinity);
            //Find the branch with greatest conductivity
            next = nexts.reduce((gt, curr, index) => (curr > nexts[gt] ? index : gt), 0);
            path.push(next);
        }
        return path;
    }

    /*
    * \..
    * .\.
    * ..\ mirror about \ axis
    */
    static mirror(mat){
        let o = 0;
        mat.forEach((row, i) =>  
            row.slice(++o).forEach((ele, j) => mat[o+j][i] = ele)
        );
        return mat;
    }

    static preEdge(mat){
        const ret = dmPPAbase.mirror(mat);
        //Set all adjacent nodes unreachable for sink node
        ret[ret.length - 1].fill(Infinity);
        return ret;
    }
}

//class dmPPAimpl extends dmPPAbase{
export class dmPPAimpl extends dmPPAbase{
    //edges         : Graph matrix of edge lengths
    //C4Pcoefficient: Conductivity update rate according to packets
    //C4Ecoefficient: Conductivity update rate according to edge lengths
    //dropThreshold : Minimum weigh for a packet to be forwarded
    constructor(edges, C4Pcoefficient = 1, C4Ecoefficient = 0.01, dropThreshold = 10E-5){    
        super(edges);
        this.C4Pcoef = C4Pcoefficient;
        this.C4Ecoef = C4Ecoefficient;
        this.dThresh = dropThreshold;
    }

    updateCond4Pack(pack){
        //Forward flux increase conductivity, and vice versa
        const increment = (pack.dest > pack.src ? 1 : -1) * pack.weigh * this.C4Pcoef;
        this.condMat[pack.dest][pack.src] += increment;
        this.condMat[pack.src][pack.dest] += increment;
    }

    updateCond4Edge(){
        let o = 0;
        this.edgeMat.forEach((row, i) =>  
            row.slice(++o).forEach((ele, j) => 
                this.condMat[i][o+j] *= Math.max(1 - ele * this.C4Ecoef, 0)
            )
        );
        //Calculate upper right half only and mirror
        dmPPAbase.mirror(this.condMat);
    }

    updatePacks(pack){
        //Edge lengths to destination nodes
        const Ls = Array.from(this.edgeMat[pack.dest]);
        //Edge conductivities to destination nodes
        const Ds = this.condMat[pack.dest];
        //don't forward to source and itself
        //Ls[pack.src] = Infinity;
        Ls[pack.dest] = Infinity;
        //Edge resistances to destination nodes   
        const Rs = Ls.map((len, ind) => len/(Ds[ind]));
        const weighScaled = pack.weigh/(Rs.reduce((prev, curr) => prev + 1/curr, 0));
        //console.log(Ls);
        //console.log(Ds);
        //Redistribute weighs inverse proportional to edge resistances
        return Rs.map((len, dest) => 
            new packet(pack.dest, dest, weighScaled/len)
        ).filter(pack => 
            pack.weigh > this.dThresh);
        //Drop packets with weigh below dropThreshold
    }

    //Default terminate condition
    endPredicate(times){
        return times <= 100;
    }
}