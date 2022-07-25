import { join } from 'path';
import { existsSync } from 'fs';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FilesService {
  private logger: Logger = new Logger('FilesService');

  getStaticProductImage(imageId: string) {
    const path = join(__dirname, '../../static/products', imageId);

    if (!existsSync(path)) {
      this.logger.error(`${imageId} not found`);
      throw new BadRequestException(`Not found`);
    }

    return path;
  }
}
