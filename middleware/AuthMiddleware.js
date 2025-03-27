import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET; // Same secret used for signing

const verifyFirebaseToken = async (req, res, next) => {

  // ✅ Skip auth check for PhonePe webhook
  if (req.path.includes("/phonePeWebhook")) {
    return next();
  }
  
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'none');

    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      console.log('No token provided in Authorization header');
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    // Verify the token using the same JWT_SECRET
    const decodedPayload = jwt.verify(idToken, JWT_SECRET, {
      algorithms: ['HS256'], // Use HS256 for symmetric signing
    });

    console.log('Token verified successfully');
    req.user = decodedPayload;
    //console.log(req.user.uid);

    next();
  } 
  
  catch (error) {
    console.error('Error verifying token:', {
      message: error.message,
      stack: error.stack,
      token: idToken ? `${idToken.substring(0, 10)}...` : 'none',
    });


    return res.status(401).json({
      error: 'Unauthorized: Invalid token',
      details: error.message,
      code: error.code,
    });
  }
};

export default verifyFirebaseToken;