import { connect } from "./rabbitConnection";

async function publishToExchange(exchangeName: string, routingKey: string, msg: string) {
    const { channel } = await connect();

    channel.publish(exchangeName, routingKey, Buffer.from(msg), { persistent: true })

    console.log("Message sent to exchange successfully")
}