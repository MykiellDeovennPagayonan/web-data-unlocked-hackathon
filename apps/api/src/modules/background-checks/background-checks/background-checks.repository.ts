import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertBackgroundCheck } from './repository-ops/insert-background-check';
import { findBackgroundCheckById } from './repository-ops/find-background-check-by-id';
import { listBackgroundChecksByEntity } from './repository-ops/list-background-checks-by-entity';
import { updateBackgroundCheck } from './repository-ops/update-background-check';
import {
  BackgroundCheck,
  CreateBackgroundCheckData,
  UpdateBackgroundCheckData,
  BackgroundCheckFilters,
} from './entities/background-check.entity';

@Injectable()
export class BackgroundChecksRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreateBackgroundCheckData): Promise<BackgroundCheck> =>
    insertBackgroundCheck(this.prisma, data);

  findById = (id: string): Promise<BackgroundCheck | null> =>
    findBackgroundCheckById(this.prisma, id);

  listByEntity = (
    filters: BackgroundCheckFilters,
  ): Promise<BackgroundCheck[]> =>
    listBackgroundChecksByEntity(this.prisma, filters);

  update = (
    id: string,
    data: UpdateBackgroundCheckData,
  ): Promise<BackgroundCheck> => updateBackgroundCheck(this.prisma, id, data);
}
