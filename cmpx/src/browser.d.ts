import { Platform } from './platform';
import { Componet } from './componet';
import { CompileSubject } from './compileSubject';
export declare class Browser extends Platform {
    constructor();
    boot(componetDef: Componet | typeof Componet, callback?: (componet: Componet, subject: CompileSubject) => void): Browser;
}
