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

    get first()
    {
        if (this.queue.length == 0)
        {
            return undefined;
        }
        return this.queue[0];
    }

    enqueue (cmd, socket, onResponse)
    {
        // if (socket === undefined || socket === null || socket.closed === true)
        // {
        //     return undefined;
        // }

        let command = new Command(cmd, onResponse);
        this.queue.push(command);
        //socket.write(command.cmd + "\n");
        return command;
    }

    dequeueFirst()
    {
        return this.queue.shift();
    }
}
