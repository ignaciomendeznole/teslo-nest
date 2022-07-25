import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BcryptService } from 'src/common/bcrypt/bcrypt.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
  ) {}

  public async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: this.bcryptService.generateHash(password, 10),
      });
      await this.userRepository.save(user);
      delete user.password;
      return {
        ...user,
        token: this.getJwtToken({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        }),
      };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  public async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user)
      throw new UnauthorizedException(
        `Credentials are not valid, email not found`,
      );

    if (!this.bcryptService.compareSync(password, user.password))
      throw new UnauthorizedException(`Invalid Password`);

    delete user.password;

    return {
      ...user,
      token: this.getJwtToken({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      }),
    };
  }

  public checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({
        email: user.email,
        id: user.id,
        fullName: user.fullName,
      }),
    };
  }

  private handleExceptions(error): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(`Please check server logs`);
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);

    return token;
  }
}
