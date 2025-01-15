import { Injectable } from '@nestjs/common';
import { InstrumentUsecase } from '@novu/application-generic';
import { SubscriberRepository } from '@novu/dal';
import { IListSubscribersResponseDto } from '@novu/shared';
import { ListSubscribersCommand } from './list-subscribers.command';

@Injectable()
export class ListSubscribersUseCase {
  constructor(private subscriberRepository: SubscriberRepository) {}

  @InstrumentUsecase()
  async execute(command: ListSubscribersCommand): Promise<IListSubscribersResponseDto> {
    const pagination = await this.subscriberRepository.findWithCursorBasedPagination({
      after: command.after || undefined,
      before: command.before || undefined,
      paginateField: command.orderBy,
      limit: command.limit,
      sortDirection: command.orderDirection,
      query: {
        _environmentId: command.user.environmentId,
        _organizationId: command.user.organizationId,
        $and: [
          {
            ...(command.email && { email: { $regex: command.email, $options: 'i' } }),
            ...(command.phone && { phone: { $regex: command.phone, $options: 'i' } }),
            ...(command.subscriberId && { subscriberId: command.subscriberId }),
            ...(command.name && {
              $expr: {
                $regexMatch: {
                  input: { $concat: ['$firstName', ' ', '$lastName'] },
                  regex: command.name,
                  options: 'i',
                },
              },
            }),
          },
        ],
      },
    });

    return {
      subscribers: pagination.data,
      next: pagination.next,
      previous: pagination.previous,
    };
  }
}
