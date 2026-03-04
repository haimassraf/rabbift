import amqp from 'amqplib';

async function setup() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const exchangeName = 'my_direct_exchange';
    const routingKey = 'critical_logs';

    await channel.assertExchange(exchangeName, 'direct', { durable: true });

    const queueName = 'quorum_tasks';
    await channel.assertQueue(queueName, {
        durable: true,
        arguments: { 'x-queue-type': 'quorum' }
    });

    await channel.bindQueue(queueName, exchangeName, routingKey);

    return { channel, exchangeName, routingKey };
}

async function sendMessage(channel: amqp.Channel, exchange: string, key: string) {
    const message = { id: 1, task: 'Haim Learn RabbitMQ!' };

    const sent = channel.publish(
        exchange,
        key,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
    );

    console.log(`[x] Sent: ${message.task}`);
}