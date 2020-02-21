// tslint:disable:variable-name

import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'example' })
export class ExampleEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public property: string;

  @Column({ type: 'bytea' })
  public thumbnail: string;

  @Column()
  public thumbnail_media_type: string;
}
