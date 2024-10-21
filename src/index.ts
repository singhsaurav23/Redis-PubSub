import { PubSubManager } from './pubsub';

async function simulateUser(userId: string, channel: string) {
    const manager = PubSubManager.getInstance();

    await manager.subscribe(channel, (message) => {
        console.log(`User ${userId} received message on channel ${channel}: ${message}`);
    });
}

async function pub(userId: string, channel: string) {
    const manager = PubSubManager.getInstance();
    const message = `Hello from User ${userId} at ${new Date().toISOString()}`;
    await manager.publish(channel, message);
}

    

async function main() {
    const manager = PubSubManager.getInstance();
    await manager.connect();

    const users = ['User1', 'User2', 'User3'];
    const channels = ['channel1', 'channel2'];

    // Simulate multiple users subscribing to different channels
    for (const user of users) {
        for (const channel of channels) {
            await simulateUser(user, channel);
        }
    }

    await pub(users[0], channels[0]);

    // Keep the process running
    process.on('SIGINT', async () => {
        console.log('Shutting down...');
        for (const channel of channels) {
            await manager.unsubscribe(channel);
        }
        await manager.disconnect();
        process.exit(0);
    });
}

main().catch(console.error);