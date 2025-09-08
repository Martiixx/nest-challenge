import { ItemSys } from "src/external-sync/dto/external-api-response.dto";
import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('products')
export class Product {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  sku: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  externalId: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  model: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  category: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  color: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  currency: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: false})
  metadata: ItemSys;
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  externalCreatedAt: Date;

  @UpdateDateColumn()
  externalUpdatedAt: Date;
}