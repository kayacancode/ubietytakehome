export const apiKeyAuth = (req:any,res:any,next:any) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_KEY) {
        return res.status(401).json({error: 'Unauthorized'});
    }
    next();
};
