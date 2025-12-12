try {
    require('@trpc/server/adapters/next');
    console.log('Found @trpc/server/adapters/next');
} catch (e) {
    console.error('Error:', e.message);
}
