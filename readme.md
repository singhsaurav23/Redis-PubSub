
### Subscription: When you call subscribe(channel, callback), the Redis client listens for any messages published to the specified channel. The callback function is associated with that channel, and Redis will keep listening for messages on that channel.

The callback is not called immediately when subscribe() is executed but will be invoked each time a message is published to the subscribed channel.
Publishing: When a message is published to the channel using publish(channel, message), the subscribed client(s) will receive that message.

### Callback Execution: When the message is published, Redis will notify the subscriber(s) by calling the callback function that was registered when subscribe() was initially called. The message argument in the callback function is the message that was published.

## Key Points:
The subscribe method initiates listening on a Redis channel.
The callback function will not be executed until something is published to that channel.
Each time a new message is published to the channel, the callback is called with the message contents.

# Pub/Sub

The Pub/Sub API is implemented by `RedisClient`, `RedisCluster`, and `RedisSentinel`.

## Pub/Sub with `RedisClient`

### RESP2

Using RESP2, Pub/Sub "takes over" the connection (a client with subscriptions will not execute commands), therefore it requires a dedicated connection. You can easily get one by `.duplicate()`ing an existing `RedisClient`:

```javascript
const subscriber = client.duplicate();
subscriber.on('error', err => console.error(err));
await subscriber.connect();
```

> When working with either `RedisCluster` or `RedisSentinel`, this is handled automatically for you.

### `sharded-channel-moved` event

`RedisClient` emits the `sharded-channel-moved` event when the ["cluster slot"](https://redis.io/docs/reference/cluster-spec/#key-distribution-model) of a subscribed [Sharded Pub/Sub](https://redis.io/docs/manual/pubsub/#sharded-pubsub) channel has been moved to another shard.

The event listener signature is as follows:
```typescript
(
  channel: string,
  listeners: {
    buffers: Set<Listener>;
    strings: Set<Listener>;
  }
)
```

> When working with `RedisCluster`, this is handled automatically for you.

## Subscribing

```javascript
const listener = (message, channel) => console.log(message, channel);
await client.subscribe('channel', listener);
await client.pSubscribe('channe*', listener);
// Use sSubscribe for sharded Pub/Sub:
await client.sSubscribe('channel', listener);
```

> ⚠️ Subscribing to the same channel more than once will create multiple listeners, each of which will be called when a message is received.

## Publishing

```javascript
await client.publish('channel', 'message');
// Use sPublish for sharded Pub/Sub:
await client.sPublish('channel', 'message');
```

## Unsubscribing

The code below unsubscribes all listeners from all channels.

```javascript
await client.unsubscribe();
await client.pUnsubscribe();
// Use sUnsubscribe for sharded Pub/Sub:
await client.sUnsubscribe();
```

To unsubscribe from specific channels:

```javascript
await client.unsubscribe('channel');
await client.unsubscribe(['1', '2']);
```

To unsubscribe a specific listener:

```javascript
await client.unsubscribe('channel', listener);
```

## Buffers

Publishing and subscribing using `Buffer`s is also supported:

```javascript
await subscriber.subscribe('channel', message => {
  console.log(message); // <Buffer 6d 65 73 73 61 67 65>
}, true); // true = subscribe in `Buffer` mode.

await subscriber.publish(Buffer.from('channel'), Buffer.from('message'));
```

> NOTE: Buffers and strings are supported both for the channel name and the message. You can mix and match these as desired.

PING
PSUBSCRIBE
PUNSUBSCRIBE
QUIT
RESET
SSUBSCRIBE
SUBSCRIBE
SUNSUBSCRIBE
UNSUBSCRIBE