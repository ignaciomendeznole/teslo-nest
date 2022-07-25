import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto, UpdateProductDto } from './dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Product, ProductImage } from './entities';
import { validate as isUUID } from 'uuid';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(`ProductsService`);
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const product = this.productRepository.create({
        ...createProductDto,
        images: createProductDto.images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
        user,
      });
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });
    // TODO: Relations
  }

  async findOne(term: string) {
    let product: Product;

    try {
      if (isUUID(term)) {
        product = await this.productRepository.findOneBy({ id: term });
      } else {
        const queryBuilder = this.productRepository.createQueryBuilder('prod');
        product = await queryBuilder
          .where(`UPPER(title) =:title or slug =:slug`, {
            title: term.toUpperCase(),
            slug: term.toLowerCase(),
          })
          .leftJoinAndSelect('prod.images', 'prodImages')
          .getOne();
      }

      if (!product)
        throw new NotFoundException(`Product with that id was not found`);

      return product;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    if (!product)
      throw new NotFoundException(`Product with that id ${id} was not found`);

    // Create Query Runner
    const queryRunner = this.dataSource.createQueryRunner();

    // Connect to DB
    await queryRunner.connect();

    // Start transaction (everything inside the transaction must be fulfilled successfully, else it will rollback)
    await queryRunner.startTransaction();

    try {
      if (images) {
        // Delete all images from the ProductImage entity matching the given productId
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        // Tries to create the new images to the ProductImage entity
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }

      product.user = user;

      // Tries to save the changes
      await queryRunner.manager.save(product);

      // Ends the transaction
      await queryRunner.commitTransaction();

      // Releases the DB connection
      await queryRunner.release();

      return this.findOnePlain(id);
    } catch (error) {
      // If any error is found, rollback the transaction
      await queryRunner.rollbackTransaction();

      // Release the DB connection
      await queryRunner.release();
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    return await this.productRepository.remove(product);
  }

  private handleExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      `Unexpected error, check server logs`,
    );
  }

  async findOnePlain(term: string) {
    const { images, ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleExceptions(error);
    }
  }
}
