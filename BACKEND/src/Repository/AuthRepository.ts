import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import {userModel} from '../models/User.js'; // Importing the UserModel directly
import CatchAsync from '../utels/CatchAsync.js';
import AppError from '../utels/AppError.js';
import { CartModel } from '../models/cart.js';


// Local signup
export const signup = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userModel.create({ name, email, password: hashedPassword });
  await CartModel.create({user : user._id});
  const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '24h' });
  const cookieOptions = {
    expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    // SameSite: 'none', // Specify one of the valid SameSite values as a string
    httpOnly: true,
  };
  res.cookie('jwt', token,cookieOptions);
  user.password = "";
  res.status(201).json({ message: 'Signup successful', token });
});

// Local login
export const login = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Invalid email or password', 401));
  }
  const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '24h' });
  const cookieOptions = {
    expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    // SameSite: 'none', // Specify one of the valid SameSite values as a string
    httpOnly: true,
  };
  res.cookie('jwt', token,cookieOptions); 
  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.status(200).json({ message: 'Login successful', token });
});

export const logout = (req: Request, res: Response) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 30),
    httpOnly: true,
  });
  res.status(200).json({ message: 'success' });
};


// Protect routes by checking if a user is logged in and then assigns them to `req.user`
export const protect = CatchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not logged in! Please login.',  401));
  }
  try {
    let decoded;
    if (typeof token === 'string') {
      decoded = await jwt.verify(token, 'your-secret-key');
    } else {
      decoded = token;
    }

    if (typeof decoded !== 'string') {
      const user = await userModel.findById(decoded.userId);
      if (!user) {
        return next(new AppError('The user belonging to this token could not be found.', 401));
      }
      req.user = user; 
      // @ts-ignore
      req.token = token;
      next();
    } else {
      throw new Error('Invalid decoded token');
    }
  } catch (err) {
    return next(new AppError('Token is not valid! Please login again.',  401));
  }
});

// export const checkLoggedIn = CatchAsync(async (req: Request, res: Response) => {
//   try {
//     // Use the protect middleware to check if the user is logged in
//     await protect(req, res, () => {});
//     res.status(200).json({ message: 'You are logged in.' });
//   } catch (err) {
//     res.status(401).json({ message: 'You are not logged in.' });
//   }
// });

export default {login , signup , protect , logout}