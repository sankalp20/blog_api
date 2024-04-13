import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
config();

@Injectable()
export class DatabaseConnectionService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {

    console.log('DATABASE_HOST', process.env.DB_HOST);
    console.log('DATABASE_PORT', process.env.DB_PORT);
    console.log('DATABASE_USER', process.env.DB_USER);
    console.log('DATABASE_PASSWORD', process.env.DB_PASSWORD);
    console.log('DATABASE_DB', process.env.DB_DB);

    return {
      name: 'default',
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DB,
      synchronize: true,
      dropSchema: true,
      logging: true,
      entities: ['dist/**/*.entity.js'],
    };
  
  }
}