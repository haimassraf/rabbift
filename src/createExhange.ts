import { connect } from "./rabbitConnection";

async function createExchange(exchangeType: string, exchangeName: string) {

    const { channel } = await connect();

    await channel.assertExchange(exchangeName, exchangeType, { durable: true });

    console.log(`Exchange '${exchangeName}' created successfully`);
}