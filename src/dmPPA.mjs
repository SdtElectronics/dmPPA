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
        this.packets = [new packet(0, 0, 1, 1)];

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
    }

    loop(endPredicate = this.endPredicate){
        let times = 0;
        while(endPredicate(times)){
            this.iterate();
            this.packets.push(new packet(0, 0, 1, 1));
            ++times;
        }
    }

    deplete(endPredicate = this.endPredicate){
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
            const nexts = this.condMat[next].map(ele => Math.abs(ele));
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

    static normalize(mat){
        const flatten = mat.flat().filter(e => e != Infinity);
        const scale = Math.max(...flatten) - Math.min(...flatten);
        return mat.map(row => row.map(e => e / scale));
    }

    static preEdge(mat){
        let ret = dmPPAbase.mirror(mat);
        ret = dmPPAbase.normalize(ret);
        //Set all adjacent nodes unreachable for sink node
        ret[ret.length - 1].fill(Infinity);
        return ret;
    }

    static interpret(str){
        return str.split("\n")
                  .map(e => e.split(/\s+/)
                  .filter(e => e != "")
                  .map(e => e == "0" ? Infinity : parseInt(e)));
    }
}

//class dmPPAimpl extends dmPPAbase{
export class dmPPAimpl extends dmPPAbase{
    //edges         : Graph matrix of edge lengths
    //C4Pcoefficient: Conductivity update rate according to packets
    //C4Ecoefficient: Conductivity update rate according to edge lengths
    //dropThreshold : Minimum weigh for a packet to be forwarded
    constructor(edges, C4Pcoefficient = 1, C4Ecoefficient = 0.05, dropThreshold = 10E-5){    
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
        //don't forward to itself
        //Ls[pack.src] = Infinity;
        Ls[pack.dest] = Infinity;
        //Edge resistances to destination nodes   
        const Rs = Ls.map((len, ind) => len/Math.abs(Ds[ind]));
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
        return times <= 200;
    }
}

export class dmPPArevd extends dmPPAbase{
    //edges         : Graph matrix of edge lengths
    //C4Pcoefficient: Conductivity update rate according to packets
    //C4Ecoefficient: Conductivity update rate according to edge lengths
    //dropThreshold : Minimum weigh for a packet to be forwarded
    constructor(edges, 
        C4Pcoefficient = 1, 
        C4Ecoefficient = 0.5, 
        dropThreshold = 10E-5,
        hopCompensate = 1){    
        super(edges);
        this.C4Pcoef = C4Pcoefficient;
        this.C4Ecoef = C4Ecoefficient;
        this.dThresh = dropThreshold;
        this.hopComp = hopCompensate;
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
        //don't forward to itself
        //Ls[pack.src] = Infinity;
        Ls[pack.dest] = Infinity;
        //Edge resistances to destination nodes   
        const Rs = Ls.map((len, ind) => len/Math.abs(Ds[ind]));
        const weighScaled = pack.weigh/(Rs.reduce((prev, curr) => prev + 1/curr, 0));
        //console.log(Ls);
        //console.log(Ds);
        //Redistribute weighs inverse proportional to edge resistances
        return Rs.map((len, dest) => 
            new packet(pack.dest, dest, weighScaled/len, pack.hopComp * this.hopComp)
        ).filter(pack => 
            pack.weigh > this.dThresh);
        //Drop packets with weigh below dropThreshold
    }

    //Default terminate condition
    endPredicate(times){
        return times <= 400;
    }
}

export class dmPPAmult extends dmPPAbase{
    //edges         : Graph matrix of edge lengths
    //C4Pcoefficient: Conductivity update rate according to packets
    //C4Ecoefficient: Conductivity update rate according to edge lengths
    //dropThreshold : Minimum weigh for a packet to be forwarded
    constructor(edges, C4Pcoefficient = 0.3, C4Ecoefficient = 0.01, dropThreshold = 10E-5){    
        super(edges);
        this.C4Pcoef = C4Pcoefficient;
        this.C4Ecoef = C4Ecoefficient;
        this.dThresh = dropThreshold;
    }

    updateCond4Pack(pack){
        //Forward flux increase conductivity, and vice versa
        const increment = (pack.dest > pack.src ? 1 : -1) * pack.weigh * this.C4Pcoef;
        this.condMat[pack.dest][pack.src] *= increment;
        this.condMat[pack.src][pack.dest] *= increment;
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
        //don't forward to itself
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

export class dmPPAwfun extends dmPPAbase{
    //edges         : Graph matrix of edge lengths
    //C4Pcoefficient: Conductivity update rate according to packets
    //C4Ecoefficient: Conductivity update rate according to edge lengths
    //dropThreshold : Minimum weigh for a packet to be forwarded
    constructor(edges, 
        C4Pcoefficient = 0.1, 
        C4Ecoefficient = 0.05, 
        dropThreshold = 10E-5,
        hopCompensate = 3){    
        super(edges);
        this.C4Pcoef = C4Pcoefficient;
        this.C4Ecoef = C4Ecoefficient;
        this.dThresh = dropThreshold;
        this.hopComp = hopCompensate;
        this.workMat = Array.from({length: this.edgeMat.length},
            () => new Array(this.edgeMat.length).fill(0)
        );
    }

    updateCond4Pack(pack){
        //Forward flux increase conductivity, and vice versa
        const increment = (pack.dest > pack.src ? 1 : -1) * pack.weigh * pack.hopComp;
        //const increment = (pack.dest > pack.src ? 1 : -1) * pack.weigh;
        this.workMat[pack.dest][pack.src] += increment;
        this.workMat[pack.src][pack.dest] -= increment;
        //const packGain = Math.abs(this.workMat[pack.dest][pack.src]);
        //const conductivity = this.condMat[pack.dest][pack.src] * (1 - this.C4Pcoef) + packGain * this.C4Pcoef;
        const gain = increment * Math.sign(this.workMat[pack.dest][pack.src]);
        //const conductivity = this.condMat[pack.dest][pack.src] * (1 - this.C4Pcoef) + gain * this.C4Pcoef;
        this.condMat[pack.dest][pack.src] += gain;
        this.condMat[pack.src][pack.dest] += gain;
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
        //don't forward to itself
        //Ls[pack.src] = Infinity;
        Ls[pack.dest] = Infinity;
        //Edge resistances to destination nodes   
        const Rs = Ls.map((len, ind) => len/Math.abs(Ds[ind]));
        const scale = 1/(Rs.reduce((prev, curr) => prev + 1/curr, 0));
        const weighScaled = pack.weigh * scale;
        //console.log(Ls);
        //console.log(Ds);
        const newCompRate = pack.hopComp * this.hopComp;
        //const newCompRate = scale;
        //Redistribute weighs inverse proportional to edge resistances
        return Rs.map((len, dest) => 
            new packet(pack.dest, dest, weighScaled/len, newCompRate)
        ).filter(pack => 
            pack.weigh > this.dThresh);
        //Drop packets with weigh below dropThreshold
    }

    //Default terminate condition
    endPredicate(times){
        return times <= 300;
    }
}

export class dmPPAmimc extends dmPPAbase{
    //edges         : Graph matrix of edge lengths
    //C4Pcoefficient: Conductivity update rate according to packets
    //F4Pcoefficient: Flux update rate according to packets
    //C4Ecoefficient: Conductivity update rate according to edge lengths
    //dropThreshold : Minimum weigh for a packet to be forwarded
    constructor(edges, 
        C4Pcoefficient = 0.2, 
        F4Pcoefficient = 0.6,
        C4Ecoefficient = 0.01, 
        dropThreshold = 10E-5,
        hopCompensate = 3){    
        super(edges);
        this.C4Pcoef = C4Pcoefficient;
        this.F4Pcoef = F4Pcoefficient;
        this.C4Ecoef = C4Ecoefficient;
        this.dThresh = dropThreshold;
        this.hopComp = hopCompensate;
        this.workMat = Array.from({length: this.edgeMat.length},
            () => new Array(this.edgeMat.length).fill(0)
        );
        this.fluxMat = Array.from({length: this.edgeMat.length},
            () => new Array(this.edgeMat.length).fill(0)
        );
    }

    iterate(){
        //Updates the conductivity according to packets
        this.updateCond4Pack();

        //Updates the conductivity according to edges
        this.updateCond4Edge();

        //Send new packets to the network
        this.packets = this.packets.map(e => 
            this.updatePacks(e)
        ).flat();
        this.packets.push(new packet(0, 0, 1, 1));
    }

    updateCond4Pack(){
        const tempFlux = [];
        this.packets.forEach(pack => {
            const src = Math.min(pack.src, pack.dest);
            const dest = Math.max(pack.src, pack.dest);
            this.workMat[src][dest] += (pack.dest > pack.src ? 1 : -1) * pack.weigh;
            tempFlux.push([src, dest]);
        });
        //Unique array of arrays
        //See https://stackoverflow.com/a/57564376/10627291
        const uniqFlux = Object.values(tempFlux.reduce((p,c) => (p[JSON.stringify(c)] = c,p),{}));

        uniqFlux.forEach(flux => {
            this.fluxMat[flux[1]][flux[0]] = this.fluxMat[flux[1]][flux[0]] * (1 - this.F4Pcoef) 
                + this.workMat[flux[0]][flux[1]] * this.F4Pcoef;
            
            const conductivity = this.condMat[flux[0]][flux[1]] * (1 - this.C4Ecoef)
                + Math.abs(this.fluxMat[flux[1]][flux[0]]) * this.C4Ecoef;
            this.condMat[flux[0]][flux[1]] = conductivity;
            this.condMat[flux[1]][flux[0]] = conductivity;
            this.workMat[flux[0]][flux[1]] = 0;
        });
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
        //don't forward to itself
        //Ls[pack.src] = Infinity;
        Ls[pack.dest] = Infinity;
        //Edge resistances to destination nodes   
        const Rs = Ls.map((len, ind) => len/Math.abs(Ds[ind]));
        const scale = 1/(Rs.reduce((prev, curr) => prev + 1/curr, 0));
        const weighScaled = pack.weigh * scale;
        //console.log(Ls);
        //console.log(Ds);
        //const newCompRate = pack.hopComp * this.hopComp;
        //const newCompRate = scale;
        //Redistribute weighs inverse proportional to edge resistances
        return Rs.map((len, dest) => 
            new packet(pack.dest, dest, weighScaled/len, 1)
        ).filter(pack => 
            pack.weigh > this.dThresh);
        //Drop packets with weigh below dropThreshold
    }

    //Default terminate condition
    endPredicate(times){
        return times <= 200;
    }
}

export class dmPPArepl extends dmPPAbase{
    //edges         : Graph matrix of edge lengths
    //C4Pcoefficient: Conductivity update rate according to packets
    //F4Pcoefficient: Flux update rate according to packets
    //C4Ecoefficient: Conductivity update rate according to edge lengths
    //dropThreshold : Minimum weigh for a packet to be forwarded
    constructor(edges, 
        C4Pcoefficient = 0.2, 
        F4Pcoefficient = 0.2,
        C4Ecoefficient = 0.01, 
        dropThreshold = 10E-5,
        hopCompensate = 3){    
        super(edges);
        this.C4Pcoef = C4Pcoefficient;
        this.F4Pcoef = F4Pcoefficient;
        this.C4Ecoef = C4Ecoefficient;
        this.dThresh = dropThreshold;
        this.hopComp = hopCompensate;
        this.workMat = Array.from({length: this.edgeMat.length},
            () => new Array(this.edgeMat.length).fill(0)
        );
        this.fluxMat = Array.from({length: this.edgeMat.length},
            () => new Array(this.edgeMat.length).fill(0)
        );
    }

    iterate(){
        //Updates the conductivity according to packets
        this.updateCond4Pack();

        //Updates the conductivity according to edges
        this.updateCond4Edge();

        //Send new packets to the network
        this.packets = this.packets.map(e => 
            this.updatePacks(e)
        ).flat();
        this.packets.push(new packet(0, 0, 1, 1));
    }

    updateCond4Pack(){
        const tempFlux = [];
        this.packets.forEach(pack => {
            const src = Math.min(pack.src, pack.dest);
            const dest = Math.max(pack.src, pack.dest);
            this.workMat[src][dest] += (pack.dest > pack.src ? 1 : -1) * pack.weigh;
            tempFlux.push([src, dest]);
        });
        //Unique array of arrays
        //See https://stackoverflow.com/a/57564376/10627291
        const uniqFlux = Object.values(tempFlux.reduce((p,c) => (p[JSON.stringify(c)] = c,p),{}));

        uniqFlux.forEach(flux => {
            this.fluxMat[flux[1]][flux[0]] = this.fluxMat[flux[1]][flux[0]] * (1 - this.F4Pcoef) 
                + this.workMat[flux[0]][flux[1]] * this.F4Pcoef;
            
            const conductivity = this.condMat[flux[0]][flux[1]] * (1 - this.C4Ecoef)
                + Math.abs(this.fluxMat[flux[1]][flux[0]]) * this.C4Ecoef;
            this.condMat[flux[0]][flux[1]] = conductivity;
            this.condMat[flux[1]][flux[0]] = conductivity;
            this.workMat[flux[0]][flux[1]] = 0;
        });
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
        //don't forward to itself
        //Ls[pack.src] = Infinity;
        Ls[pack.dest] = Infinity;
        //Edge resistances to destination nodes   
        const Rs = Ls.map((len, ind) => len/Math.max(10E-5, Math.abs(Ds[ind])));
        const scale = 1/(Rs.reduce((prev, curr) => prev + 1/curr, 0));
        if(scale == Infinity)return [];
        const prob = Rs.map(e => scale / e);
        //console.log(Ls);
        return [new packet(pack.dest, dmPPArepl.wRandom(prob), 1, 1)];
    }

    //Default terminate condition
    endPredicate(times){
        return times <= 200;
    }

    static wRandom(prob) {
        let sum = 0;
        const r = Math.random();
        for (let i = 0; i != prob.length; ++i) {
            sum += prob[i];
            if (r <= sum) return i;
        }
    }
}