/* * * * * * * * * * * * * Packet format for dmPPA * * * * * * * * * * * * * *
*                          SdtElectronics 2021.3.31                          *
*                           <null@std.uestc.edu.cn>                          *
* * * * * * * * * * * * * * * All rights reserved * * * * * * * * * * * * * */

export class packet{
    constructor(src, dest, weigh, hopComp){
        this.src = src;
        this.dest = dest;
        this.weigh = weigh;
        this.hopComp = hopComp;
    }
}