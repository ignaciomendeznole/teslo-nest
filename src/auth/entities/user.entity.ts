import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from 'src/products/entities';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false })
  password: string;

  @Column('text')
  fullName: string;

  @Column('bool', { default: true })
  isActive: boolean;

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
