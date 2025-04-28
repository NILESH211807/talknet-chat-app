const corsOptions = {
    origin: 'http://localhost:5173', // or your frontend URL
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

module.exports = {
    corsOptions
}