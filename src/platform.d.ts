export default abstract class Platform {
    abstract boot(component: any): Platform;
}
