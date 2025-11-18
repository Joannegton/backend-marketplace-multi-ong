import { ArrayNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetProductsByIdsDto {
    @ArrayNotEmpty()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',');
        }
        return value;
    })
    ids: string[];
}
