const corsOptions = {
    origin: process.env.CLIENT_URI, // or your frontend URL
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

module.exports = {
    corsOptions
}