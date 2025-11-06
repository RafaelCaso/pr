export const setupGlobalErrorHandlers = (): void => {
  process.on('uncaughtException', (error: Error, origin: string) => {
    console.error(`[${new Date().toISOString()}] Uncaught Exception (${origin}):`, error.stack || error.message);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    console.error(`[${new Date().toISOString()}] Unhandled Rejection:`, reason instanceof Error ? reason.stack : reason);
    process.exit(1);
  });
};