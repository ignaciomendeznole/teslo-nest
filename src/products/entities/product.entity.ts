import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ProductImage } from './product-image.entity';

@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    example: '00000000-0000-0000-0000-000000000000',
    description: 'Product ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Jersey',
    uniqueItems: true,
    description: 'Product Title',
  })
  @Column('text', { unique: true })
  title: string;

  @ApiProperty({
    example: 0,
    description: 'Product Price',
    default: 0,
  })
  @Column('numeric')
  price: number;

  @ApiProperty({
    description: 'Product Description',
    example: 'Soft T-Shirt',
    default: null,
  })
  @Column('text', {
    nullable: true,
  })
  description: string;

  @ApiProperty({
    description: 'Product Slug for SEO',
    example: 'jersey_tshirt',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  slug: string;

  @ApiProperty({
    description: 'Product Stock',
    default: 0,
    example: 30,
  })
  @Column('int', { default: 0 })
  stock: number;

  @ApiProperty({
    description: 'Product Sizes available',
    example: ['XS', 'S'],
    default: ['XS', 'S', 'M', 'L', 'XL'],
  })
  @Column('text', { array: true })
  sizes: string[];

  @ApiProperty({
    description: 'Product Gender',
    example: 'women',
  })
  @Column('text')
  gender: string;

  @ApiProperty()
  @Column('text', { array: true, default: [] })
  tags: string[];

  // Images
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  // User owner
  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user: User;

  @BeforeInsert()
  slugValidatorInsert() {
    if (!this.slug)
      this.slug = this.title
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '');

    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  slugValidatorUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
