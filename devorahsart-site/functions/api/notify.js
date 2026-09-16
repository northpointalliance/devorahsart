export async function onRequestPost(context) {
    return context.env.NOTIFY.fetch(context.request);
}
