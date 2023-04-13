import { randomUUID } from "crypto";

export class Connection
{
    id = randomUUID();
    socket;

    constructor(socket, messageParser, closeHandler)
    {
        this.socket = socket;
        socket.on("message", messageParser);
        socket.on("close", event => closeHandler(event, this));
    }
}

export class ConnectionCollection
{
    connections = [];

    add (connection)
    {
        let c = this.connections.find(x=>x.id === connection.id);
        if (c)
        {
            return;
        }
        this.connections.push (connection);
    }

    remove(connection)
    {
        this.connections.filter((value, index, arr) =>
        {
            if (value.id === connection.id)
            {
                arr.splice(index, 1);
            }
        });
    }

    sendToAll(msg)
    {
        this.connections.forEach(connection =>
        {
            if (connection.socket === undefined || connection.socket === null || connection.socket.closed === true)
            {
                return;
            }
            connection.socket.send(msg);
        });
    }
}
