import { ISubscriber } from '../../entities/subscriber';
import { DirectionEnum } from '../../types/response';

export interface IListSubscribersRequestDto {
  limit: number;

  before?: string;

  after?: string;

  orderDirection: DirectionEnum;

  orderBy: 'updatedAt' | 'createdAt';

  email?: string;

  phone?: string;

  subscriberId?: string;

  name?: string;
}

export interface IListSubscribersResponseDto {
  subscribers: ISubscriber[];

  next: string | null;

  previous: string | null;
}
