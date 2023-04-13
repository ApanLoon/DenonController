export class Command
{
    constructor (cmd, onResponse)
    {
        this.cmd = cmd;
        this.onResponse = onResponse;
    }

    respond(data)
    {
        if (this.onResponse) this.onResponse(data);
    }
}

export class CommandQueue
{
    constructor()
    {
        this.queue = [];
    }

    get isEmpty() { return this.queue.length == 0 };

    get first()
    {
        if (this.isEmpty)
        {
            return undefined;
        }
        return this.queue[0];
    }

    enqueue (cmd, onResponse)
    {
        let command = new Command(cmd, onResponse);
        this.queue.push(command);
        return command;
    }

    dequeueFirst()
    {
        return this.queue.shift();
    }
}
