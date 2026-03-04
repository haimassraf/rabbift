import amqp from "amqplib";

const DEFAULT_URL = "amqp://guest:guest@localhost:5672";
const VHOST_URL = "amqp://guest:guest@localhost:5672/my_vhost";

async function connect(url: string = DEFAULT_URL) {
  const conn = await amqp.connect(url);
  const ch = await conn.createChannel();
  return { conn, ch };
}

async function persistent() {
  const { conn, ch } = await connect();

  await ch.assertQueue("persistent_queue", { durable: true });

  ch.sendToQueue("persistent_queue", Buffer.from("persistent message"), {
    persistent: true,
  });

  await ch.consume("persistent_queue", (msg) => {
    if (msg) {
      console.log(msg.content.toString());
      ch.ack(msg);
    }
  });

  setTimeout(() => conn.close(), 2000);
}

async function exchanges() {
  const { conn, ch } = await connect();

  await ch.assertExchange("direct_ex", "direct", { durable: true });
  await ch.assertQueue("direct_q", { durable: true });
  await ch.bindQueue("direct_q", "direct_ex", "info");
  ch.publish("direct_ex", "info", Buffer.from("direct"));

  await ch.assertExchange("fanout_ex", "fanout", { durable: true });
  await ch.assertQueue("fanout_q1", { durable: true });
  await ch.assertQueue("fanout_q2", { durable: true });
  await ch.bindQueue("fanout_q1", "fanout_ex", "");
  await ch.bindQueue("fanout_q2", "fanout_ex", "");
  ch.publish("fanout_ex", "", Buffer.from("fanout"));

  await ch.assertExchange("topic_ex", "topic", { durable: true });
  await ch.assertQueue("topic_q", { durable: true });
  await ch.bindQueue("topic_q", "topic_ex", "user.*");
  ch.publish("topic_ex", "user.created", Buffer.from("topic"));

  await ch.assertExchange("headers_ex", "headers", { durable: true });
  await ch.assertQueue("headers_q", { durable: true });
  await ch.bindQueue("headers_q", "headers_ex", "", {
    "x-match": "all",
    type: "report",
  });
  ch.publish("headers_ex", "", Buffer.from("headers"), {
    headers: { type: "report" },
  });

  setTimeout(() => conn.close(), 2000);
}

async function quorum() {
  const { conn, ch } = await connect();

  await ch.assertQueue("quorum_queue", {
    durable: true,
    arguments: { "x-queue-type": "quorum" },
  });

  ch.sendToQueue("quorum_queue", Buffer.from("quorum message"), {
    persistent: true,
  });

  await ch.consume("quorum_queue", (msg) => {
    if (msg) {
      console.log(msg.content.toString());
      ch.ack(msg);
    }
  });

  setTimeout(() => conn.close(), 2000);
}

async function vhost() {
  const { conn, ch } = await connect(VHOST_URL);

  await ch.assertQueue("vhost_queue", { durable: true });

  ch.sendToQueue("vhost_queue", Buffer.from("vhost message"), {
    persistent: true,
  });

  await ch.consume("vhost_queue", (msg) => {
    if (msg) {
      console.log(msg.content.toString());
      ch.ack(msg);
    }
  });

  setTimeout(() => conn.close(), 2000);
}

async function shovel() {
  const { conn, ch } = await connect();

  await ch.assertQueue("source_q", { durable: true });
  await ch.assertQueue("dest_q", { durable: true });

  ch.sendToQueue("source_q", Buffer.from("shovel message"), {
    persistent: true,
  });

  await ch.consume("dest_q", (msg) => {
    if (msg) {
      console.log(msg.content.toString());
      ch.ack(msg);
    }
  });

  setTimeout(() => conn.close(), 4000);
}

async function run() {
  await persistent();

  await exchanges();

  await quorum();

  await vhost();

  await shovel();
}

run()