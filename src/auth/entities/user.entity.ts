import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from 'src/products/entities';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'users' })
export class User {
  @ApiProperty({
    description: 'User ID',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'User email',
  })
  @Column('text', { unique: true })
  email: string;

  @ApiProperty({
    description: 'User Password',
  })
  @Column('text', { select: false })
  password: string;

  @ApiProperty({
    description: 'User full name',
  })
  @Column('text')
  fullName: string;

  @ApiProperty({
    description: 'User active column',
    default: true,
  })
  @Column('bool', { default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'User active roles',
    default: ['user'],
    example: ['user', 'super-user', 'admin'],
  })
  @Column('text', { array: true, default: ['user'] })
  roles: string[];

  @BeforeInsert()
  handleEmail() {
    return (this.email = this.email.toLowerCase().trim());
  }

  @OneToMany(() => Product, (product) => product.user)
  product: Product;

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    return this.handleEmail();
  }
}
