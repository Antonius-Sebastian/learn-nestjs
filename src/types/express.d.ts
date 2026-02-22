// src/types/express.d.ts
import { User } from '../users/users.entity';

declare global {
  namespace Express {
    interface Request {
      session: {
        sub: number;
      };
      user?: User | null;
    }
  }
}
