import { createClient, RedisClientType } from 'redis';

export class PubSubManager {
    private static instance: PubSubManager;
    private subClient: RedisClientType;
    private pubClient: RedisClientType;

    private constructor() {
        this.subClient = createClient();
        this.pubClient = createClient();
    }

    public static getInstance(): PubSubManager {
        if (!PubSubManager.instance) {
            PubSubManager.instance = new PubSubManager();
        }
        return PubSubManager.instance;
    }

    public async connect(): Promise<void> {
        await this.subClient.connect();
        await this.pubClient.connect();
        console.log('Connected to Redis');
    }

    public async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
        await this.subClient.subscribe(channel, (message) => {
            console.log(`Received message on channel ${channel}: ${message}`);
            callback(message);
        });
        console.log(`Subscribed to channel: ${channel}`);
    }

    public async publish(channel: string, message: string): Promise<void> {
        await this.pubClient.publish(channel, message);
        console.log(`Published message to channel ${channel}: ${message}`);
    }

    public async unsubscribe(channel: string): Promise<void> {
        await this.subClient.unsubscribe(channel);
        console.log(`Unsubscribed from channel: ${channel}`);
    }

    public async disconnect(): Promise<void> {
        await this.subClient.quit();
        await this.pubClient.quit();
        console.log('Disconnected from Redis');
    }
}