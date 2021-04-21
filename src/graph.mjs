/* * * * * * * * * * * * graph helper class for dmPPA * * * * * * * * * * * * 
*                          SdtElectronics 2021.4.21                         *
*                           <null@std.uestc.edu.cn>                         *
* * * * * * * * * * * * * * * All rights reserved * * * * * * * * * * * * * */

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
}