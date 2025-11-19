import { InvalidPropsException } from 'src/exceptions/invalidProps.exception';
import { ListOrganizationOrdersUseCase } from './list-organization-orders.usecase';

describe('ListOrganizationOrdersUseCase', () => {
  let usecase: ListOrganizationOrdersUseCase;
  let orderRepository: any;

  beforeEach(() => {
    orderRepository = { findByOrganizationId: jest.fn() };
    usecase = new ListOrganizationOrdersUseCase(orderRepository as any);
  });

  it('throws when organizationId missing', async () => {
    await expect(usecase.execute('')).rejects.toBeInstanceOf(InvalidPropsException);
  });

  it('returns mapped organization dtos', async () => {
    const order = { toOrganizationDto: (orgId: string) => ({ id: 'o1', org: orgId }) };
    orderRepository.findByOrganizationId.mockResolvedValue([order]);
    const result = await usecase.execute('org');
    expect(result).toEqual([{ id: 'o1', org: 'org' }]);
  });
});
