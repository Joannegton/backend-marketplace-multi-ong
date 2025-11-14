import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './login.dto';
import { User } from '../core/domain/user';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(props: LoginDto): Promise<{ token: string; user: { id: string; email: string; organizationId: string } }> {

    const user = await this.userRepository.findOne({ where: { email: props.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(props.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
      },
    };
  }

  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
    };
    return this.jwtService.sign(payload);
  }
}
