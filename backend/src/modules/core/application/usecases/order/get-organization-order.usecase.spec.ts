import { NotFoundException } from '@nestjs/common';
import { GetOrganizationOrderUseCase } from './get-organization-order.usecase';
import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';

describe('GetOrganizationOrderUseCase', () => {
  let usecase: GetOrganizationOrderUseCase;
  let orderRepository: any;

  beforeEach(() => {
    orderRepository = { findById: jest.fn() };
    usecase = new GetOrganizationOrderUseCase(orderRepository as any);
  });

  it('throws when missing params', async () => {
    await expect(usecase.execute('', '')).rejects.toBeInstanceOf(InvalidPropsException);
  });

  it('throws when order not found', async () => {
    orderRepository.findById.mockResolvedValue(null);
    await expect(usecase.execute('1', 'org')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when order does not belong to org', async () => {
    const order = { organizationIds: ['other'] };
    orderRepository.findById.mockResolvedValue(order);
    await expect(usecase.execute('1', 'org')).rejects.toBeInstanceOf(InvalidPropsException);
  });

  it('returns organization dto when ok', async () => {
    const order = { organizationIds: ['org'], toOrganizationDto: (orgId: string) => ({ id: '1', organizationId: orgId }) };
    orderRepository.findById.mockResolvedValue(order);
    const dto = await usecase.execute('1', 'org');
    expect(dto).toEqual({ id: '1', organizationId: 'org' });
  });
});
