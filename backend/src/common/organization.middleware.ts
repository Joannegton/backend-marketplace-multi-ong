import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class OrganizationMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const organizationId = req['user']?.organizationId;
        
        if (organizationId) {
            req['organizationId'] = organizationId;
        }
        
        next();
    }
}