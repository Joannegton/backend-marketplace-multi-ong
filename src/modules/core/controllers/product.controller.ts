import {
    Controller,
    Post,
    Get,
    Patch,
    Body,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CreateProductUseCase, FindProductUseCase, ListProductsUseCase, UpdateProductUseCase } from '../application/usecases';
import { DisableProductUseCase } from '../application/usecases/products/disable-product.usecase';
import { JwtAuthGuard } from 'src/common/jwt-auth.guard';
import { UpdateProductDto } from '../application/dtos/products/updateProduct.dto';
import { OrganizationId } from 'src/common/decorators/organization-id.decorator';
import { CreateProductDto } from '../application/dtos/products/createProduct.dto';
import { Public } from 'src/common/decorators/public.decorator';


@Controller('products')
export class ProductController {
    constructor(
        private createProductUseCase: CreateProductUseCase,
        private findProductUseCase: FindProductUseCase,
        private listProductsUseCase: ListProductsUseCase,
        private updateProductUseCase: UpdateProductUseCase,
        private disableProductUseCase: DisableProductUseCase
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard)
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
    @UseGuards(JwtAuthGuard)
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

    @Get()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async findAllOrganization(@OrganizationId() organizationId: string) {
        return this.listProductsUseCase.execute(organizationId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async findOneOrganization(@Param('id') id: string, @OrganizationId() organizationId: string) {
        return this.findProductUseCase.execute({ id, organizationId });
    }
    
    @Patch(':id/disable')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async disable(
        @Param('id') id: string,
        @OrganizationId() organizationId: string,
    ) {
        await this.disableProductUseCase.execute(
            id,
            organizationId,
        );
    }
}
