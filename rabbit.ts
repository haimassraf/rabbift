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