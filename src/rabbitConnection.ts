import amqp from "amqplib";

const DEFAULT_URL = "amqp://guest:guest@localhost:5672";

export async function connect(url: string = DEFAULT_URL) {
    const connection = await amqp.connect(url);

    const channel = await connection.createChannel();

    console.log("connected to RabbitMQ")
    return { connection, channel };

}