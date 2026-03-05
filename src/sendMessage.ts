import { connect } from "./rabbitConnection";

async function sendMessage(queueName: string, msg: string) {
    try {
        const { channel } = await connect();

        await channel.assertQueue(queueName, { durable: true })

        channel.sendToQueue(queueName, Buffer.from(msg), { persistent: true })
        console.log(`Message sent successfully to '${queueName}'`)
    } catch (err) {
        console.error("Error with send to queue: ", err)
    }
}

sendMessage('first queue', 'my first msg')