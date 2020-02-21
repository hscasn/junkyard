// tslint:disable:variable-name

import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Ranks } from '../lib/userRanks';

@Entity({ name: 'user' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public email: string;

  @Column()
  public display_name: string;

  @Column()
  public password: string;

  @Column({ nullable: true })
  public password_token: string;

  @Column({ nullable: true })
  public password_token_creation_date: string;

  @Column({ default: Ranks.Regular })
  public rank: number;
}
