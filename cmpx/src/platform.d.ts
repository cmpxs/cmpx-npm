import { Componet } from './componet';
import { CompileSubject } from './compileSubject';
export declare abstract class Platform {
    abstract boot(component: any, callback?: (componet: Componet, subject: CompileSubject) => void): Platform;
}
