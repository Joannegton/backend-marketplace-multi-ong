import {
    Controller,
    Post,
    Get,
    Patch,
    Body,
    Param,
    HttpCode,
    HttpStatus,
    Query,
    Delete,
} from '@nestjs/common';
import {
    CreateProductUseCase,
    FindProductUseCase,
    ListProductsUseCase,
    UpdateProductUseCase,
    SearchProductsUseCase,
} from '../application/usecases';
import { ToggleProductStatusUseCase } from '../application/usecases/products/toggle-product-status.usecase';
import { DeleteProductUseCase } from '../application/usecases/products/delete-product.usecase';
import { FindPublicProductUseCase } from '../application/usecases/products/find-public-product.usecase';
import { GetProductsByIdsUseCase } from '../application/usecases/products/get-products-by-ids.usecase';
import { UpdateProductDto } from '../application/dtos/products/updateProduct.dto';
import { OrganizationId } from 'src/common/decorators/organization-id.decorator';
import { CreateProductDto } from '../application/dtos/products/createProduct.dto';
import { SearchProductsDto } from '../application/dtos/search-products.dto';
import { GetProductsByIdsDto } from '../application/dtos/products/get-products-by-ids.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('products')
export class ProductController {
    constructor(
        private readonly createProductUseCase: CreateProductUseCase,
        private readonly findProductUseCase: FindProductUseCase,
        private readonly listProductsUseCase: ListProductsUseCase,
        private readonly updateProductUseCase: UpdateProductUseCase,
        private readonly toggleProductStatusUseCase: ToggleProductStatusUseCase,
        private readonly deleteProductUseCase: DeleteProductUseCase,
        private readonly searchProductsUseCase: SearchProductsUseCase,
        private readonly findPublicProductUseCase: FindPublicProductUseCase,
        private readonly getProductsByIdsUseCase: GetProductsByIdsUseCase,
    ) {}

    @Get('catalog')
    @HttpCode(HttpStatus.OK)
    @Public()
    async catalog(
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
    ) {
        return this.listProductsUseCase.executeCatalog(
            limit || 10,
            offset || 0,
        );
    }

    @Get('search')
    @HttpCode(HttpStatus.OK)
    @Public()
    async search(@Query() dto: SearchProductsDto) {
        return this.searchProductsUseCase.execute(dto);
    }

    @Get('by-ids')
    @HttpCode(HttpStatus.OK)
    @Public()
    async getByIds(@Query() dto: GetProductsByIdsDto) {
        return this.getProductsByIdsUseCase.execute(dto.ids);
    }

    @Get('organization/:id')
    @HttpCode(HttpStatus.OK)
    async findOneOrganization(
        @Param('id') id: string,
        @OrganizationId() organizationId: string,
    ) {
        return this.findProductUseCase.execute({ id, organizationId });
    }

    @Get('organization')
    @HttpCode(HttpStatus.OK)
    async findAllOrganization(@OrganizationId() organizationId: string) {
        return this.listProductsUseCase.execute(organizationId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body() dto: CreateProductDto,
        @OrganizationId() organizationId: string,
    ) {
        const product = await this.createProductUseCase.execute({
            organizationId,
            ...dto,
        });
        return product;
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateProductDto,
        @OrganizationId() organizationId: string,
    ) {
        const product = await this.updateProductUseCase.execute({
            id,
            organizationId,
            product: dto,
        });

        return product;
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @Public()
    async findOne(@Param('id') id: string) {
        return this.findPublicProductUseCase.execute(id);
    }

    @Patch(':id/toggle-status')
    @HttpCode(HttpStatus.OK)
    async toggleStatus(
        @Param('id') id: string,
        @OrganizationId() organizationId: string,
    ) {
        await this.toggleProductStatusUseCase.execute(id, organizationId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(
        @Param('id') id: string,
        @OrganizationId() organizationId: string,
    ) {
        await this.deleteProductUseCase.execute(id, organizationId);
    }
}
