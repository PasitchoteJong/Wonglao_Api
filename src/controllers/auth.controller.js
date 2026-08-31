export async function register(req, res, next) {
    const data = "Hello World"

    res.json({
        message: 'Hi This Auth Controller',
        result: data
    })
}