import {IsEmpty, IsNotEmpty, IsUUID, ValidateNested} from 'class-validator';
import {
    Authorized, Body, Delete, Get, JsonController, OnUndefined, Param, Post, Put
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { PhotoNotFoundError } from '../errors/PhotoNotFoundError';
import { Photo } from '../models/Photo';
import { PhotoService } from '../services/PhotoService';
import { UserResponse } from './UserController';

class BasePhoto {
    @IsNotEmpty()
    public path: string;

    @IsEmpty()
    public description: string;

    @IsEmpty()
    public kind: string;
}

export class PhotoResponse extends BasePhoto {
    @IsUUID()
    public id: string;

    @ValidateNested()
    public user: UserResponse;
}

class CreatePhotoBody extends BasePhoto {
    @IsUUID()
    public userId: string;
}

@Authorized()
@JsonController('/photos')
@OpenAPI({ security: [{ basicAuth: [] }] })

export class PhotoController {

    constructor(
        private photoService: PhotoService
    ) { }

    @Get()
    @ResponseSchema(PhotoResponse, { isArray: true })
    public find(): Promise<Photo[]> {
        return this.photoService.find();
    }

    @Get('/:id')
    @OnUndefined(PhotoNotFoundError)
    @ResponseSchema(PhotoResponse)
    public one(@Param('id') id: string): Promise<Photo | undefined> {
        return this.photoService.findOne(id);
    }

    @Post()
    @ResponseSchema(PhotoResponse)
    public create(@Body({ required: true }) body: CreatePhotoBody): Promise<Photo> {
        const photo = new Photo();
        photo.kind = body.kind;
        photo.path = body.path;
        photo.description = body.description;
        photo.userId = body.userId;

        return this.photoService.create(photo);
    }

    @Put('/:id')
    @ResponseSchema(PhotoResponse)
    public update(@Param('id') id: string, @Body() body: BasePhoto): Promise<Photo> {
        const photo = new Photo();
        photo.kind = body.kind;
        photo.path = body.path;
        photo.description = body.description;

        return this.photoService.update(id, photo);
    }

    @Delete('/:id')
    public delete(@Param('id') id: string): Promise<void> {
        return this.photoService.delete(id);
    }

}
