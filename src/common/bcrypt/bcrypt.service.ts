import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  generateHash(data: string | Buffer, saltOrRounds: string | number) {
    return bcrypt.hashSync(data, saltOrRounds);
  }

  compareSync(data: string | Buffer, encrypted: string) {
    return bcrypt.compareSync(data, encrypted);
  }
}
