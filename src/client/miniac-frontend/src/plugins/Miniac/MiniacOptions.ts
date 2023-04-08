export class MiniacOptions
{
    public host : string = "localhost";
    public port : number = 4000;

    public constructor (init? : Partial<MiniacOptions>)
    {
        Object.assign(this, init);
    }
}
