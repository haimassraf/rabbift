import { Message } from "amqplib";
import { connect } from "./rabbitConnection";

async function getMessage(queueName: string) {
    const { channel } = await connect();

    await channel.assertQueue(queueName, { durable: true })

    channel.consume(queueName, (msg: Message | null) => {
        if (msg !== null) {
            console.log(`Message: ${msg.content.toString()}`)

            channel.ack(msg)
        }
    }, {
        noAck: false
    })
}


getMessage("first queue")