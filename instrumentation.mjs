
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    'service.name': process.env.OTEL_SERVICE_NAME || 'observability-demo',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

const shutdown = async () => {
  await sdk.shutdown();
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
